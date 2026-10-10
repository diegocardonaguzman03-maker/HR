/**
 * Artifact runtime: SQLite (sql.js/WASM) in the page, persisted to the Artifact `db` capability.
 * The exact same services, rules and dashboard as the server app run on top of it.
 */
import type { Database } from "sql.js";
import type { DB } from "@/server/db/client";
import { createBrowserDb } from "../sqljs-db";
// Injected by the build: migration SQL and the sql.js wasm (base64).
declare const __MIGRATIONS__: string[];
declare const __SQLJS_WASM_B64__: string;

type Doc = { id: string; data(): Record<string, unknown> | undefined };
type ArtifactDb = {
  collection(path: string): {
    get(): Promise<{ docs: Doc[] }>;
    doc(id: string): { set(d: Record<string, unknown>): Promise<void>; delete(): Promise<void> };
    onSnapshot?(next: (snap: { docChanges(): { type: "added" | "modified" | "removed"; doc: Doc }[] }) => void, error?: (e: unknown) => void): () => void;
  };
};

/** Fallback store when the page is opened outside claude.ai (e.g. a static host): this browser's localStorage. */
function localStore(): ArtifactDb | null {
  try {
    const k = "__praxia_probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
  } catch {
    return null;
  }
  const key = (t: string) => `praxia_cc:${t}`;
  const read = (t: string): Record<string, Record<string, unknown>> => {
    try { return JSON.parse(localStorage.getItem(key(t)) ?? "{}"); } catch { return {}; }
  };
  return {
    collection: (t) => ({
      get: async () => ({ docs: Object.entries(read(t)).map(([id, row]) => ({ id, data: () => row })) }),
      doc: (id) => ({
        set: async (d) => { const all = read(t); all[id] = d; localStorage.setItem(key(t), JSON.stringify(all)); },
        delete: async () => { const all = read(t); delete all[id]; localStorage.setItem(key(t), JSON.stringify(all)); },
      }),
    }),
  };
}

export const TABLES = [
  "company_settings", "fx_rates", "services", "pipeline_stages", "agents", "organizations", "contacts", "opportunities",
  "activities", "proposals", "proposal_lines", "contracts", "revenue_entries", "invoices", "payments", "expenses",
  "agent_tasks", "agent_events", "approvals", "engine_runs", "suppressions", "audit_log",
] as const;

type Snap = Map<string, Map<string, string>>; // table -> id -> JSON

export type Runtime = {
  db: DB;
  persisted: boolean;
  storage: "artifact" | "browser" | "none";
  status: "ready" | "offline";
  flush: () => Promise<{ written: number; error?: string }>;
  /** Set when the stored data is newer than this page (ADR-003); writes are refused. */
  readOnly: string | null;
};

let runtime: Runtime | null = null;
let sqlite: Database;
let store: ArtifactDb | null = null;
let last: Snap = new Map();

function readTable(t: string): Map<string, string> {
  const m = new Map<string, string>();
  const res = sqlite.exec(`SELECT * FROM ${t}`);
  if (!res[0]) return m;
  const { columns, values } = res[0];
  const idIdx = columns.indexOf("id");
  for (const row of values) {
    const obj: Record<string, unknown> = {};
    columns.forEach((c, i) => (obj[c] = row[i]));
    m.set(String(row[idIdx]), JSON.stringify(obj));
  }
  return m;
}

function snapshot(): Snap {
  return new Map(TABLES.map((t) => [t, readTable(t)]));
}

const knownCols = new Map<string, Set<string>>();
/** Columns this page's schema knows; unknown ones (written by a newer version) are skipped instead of crashing. */
function columnsOf(t: string): Set<string> {
  let c = knownCols.get(t);
  if (!c) { c = new Set((sqlite.exec(`PRAGMA table_info(${t})`)[0]?.values ?? []).map((v) => String(v[1]))); knownCols.set(t, c); }
  return c;
}

function upsertRow(t: string, row: Record<string, unknown>) {
  const known = columnsOf(t);
  const cols = Object.keys(row).filter((c) => known.has(c));
  sqlite.run(`INSERT OR REPLACE INTO ${t} (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols.map(() => "?").join(",")})`, cols.map((c) => row[c] as never));
}

function readRow(t: string, id: string): string | null {
  const res = sqlite.exec(`SELECT * FROM ${t} WHERE id = ?`, [id as never]);
  if (!res[0]?.values[0]) return null;
  const { columns, values } = res[0];
  return JSON.stringify(Object.fromEntries(columns.map((c, i) => [c, values[0]![i]])));
}

const remoteListeners = new Set<(tables: string[]) => void>();
/** Called (debounced) after changes written elsewhere — by another viewer or by the orchestrating Claude session — land in this page. */
export function onRemoteChange(cb: (tables: string[]) => void): () => void {
  remoteListeners.add(cb);
  return () => remoteListeners.delete(cb);
}

/**
 * Live mode: every table is subscribed once. Changes written elsewhere are applied to the in-page SQLite and to the
 * flush baseline (so they are never echoed back), and listeners are told which tables changed.
 */
function subscribeLive(db: ArtifactDb) {
  let pending = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  for (const t of TABLES) {
    const col = db.collection(t);
    if (!col.onSnapshot) return;
    let first = true;
    col.onSnapshot(
      (snap) => {
        const changes = snap.docChanges();
        if (first) { first = false; return; } // the initial snapshot is what boot() already loaded
        if (!changes.length) return;
        sqlite.run("PRAGMA foreign_keys = OFF;");
        const base = last.get(t) ?? new Map<string, string>();
        for (const ch of changes) {
          if (ch.type === "removed") {
            sqlite.run(`DELETE FROM ${t} WHERE id = ?`, [ch.doc.id as never]);
            base.delete(ch.doc.id);
          } else {
            const row = ch.doc.data();
            if (!row) continue;
            upsertRow(t, row);
            const json = readRow(t, ch.doc.id);
            if (json) base.set(ch.doc.id, json);
          }
        }
        last.set(t, base);
        sqlite.run("PRAGMA foreign_keys = ON;");
        pending.add(t);
        if (!timer) timer = setTimeout(() => { const tables = [...pending]; pending = new Set(); timer = null; for (const cb of remoteListeners) cb(tables); }, 250);
      },
      () => { /* subscription ended (offline or revoked): the page keeps working on its local copy */ },
    );
  }
}

const b64ToBuf = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;

/** Boots the in-page database and hydrates it from the Artifact store (or runs unpersisted if unavailable). */
export async function boot(): Promise<Runtime> {
  if (runtime) return runtime;
  const created = await createBrowserDb(__MIGRATIONS__, b64ToBuf(__SQLJS_WASM_B64__));
  sqlite = created.sqlite;
  const claude = (window as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
  store = claude ? ((await claude.use("db").catch(() => null)) as ArtifactDb | null) : null;
  const storage: Runtime["storage"] = store ? "artifact" : (store = localStore()) ? "browser" : "none";
  if (store) {
    sqlite.run("PRAGMA foreign_keys = OFF;");
    for (const t of TABLES) {
      const snap = await store.collection(t).get();
      for (const d of snap.docs) {
        const row = d.data();
        if (row) upsertRow(t, row);
      }
    }
    sqlite.run("PRAGMA foreign_keys = ON;");
  }
  // ADR-003: the database records the schema version that wrote it. A page older than the data is read-only.
  let readOnly: string | null = null;
  if (store) {
    try {
      const meta = (await store.collection("meta").get()).docs.find((d) => d.id === "schema")?.data() as { migrations?: number } | undefined;
      const remote = Number(meta?.migrations ?? 0);
      if (remote > __MIGRATIONS__.length) readOnly = "This database was written by a newer version of the Command Center. Reload the artifact to get it — changes here are not saved.";
      else if (remote < __MIGRATIONS__.length) await store.collection("meta").doc("schema").set({ migrations: __MIGRATIONS__.length, at: new Date().toISOString() });
    } catch { /* meta is advisory; the column filter above still protects the page */ }
  }
  last = snapshot();
  if (storage === "artifact" && store) subscribeLive(store);
  runtime = {
    db: created.db,
    persisted: !!store,
    storage,
    status: store ? "ready" : "offline",
    readOnly,
    flush: async () => {
      if (!store) return { written: 0 };
      if (readOnly) return { written: 0, error: readOnly };
      const next = snapshot();
      let written = 0;
      try {
        for (const t of TABLES) {
          const before = last.get(t) ?? new Map();
          const after = next.get(t)!;
          for (const [id, json] of after) if (before.get(id) !== json) { await store.collection(t).doc(id).set(JSON.parse(json)); written++; }
          for (const id of before.keys()) if (!after.has(id)) { await store.collection(t).doc(id).delete(); written++; }
        }
        last = next;
        return { written };
      } catch (e) {
        return { written, error: (e as { message?: string })?.message ?? "Could not save to the Artifact database." };
      }
    },
  };
  return runtime;
}

export const getRuntime = () => {
  if (!runtime) throw new Error("Runtime not booted");
  return runtime;
};
