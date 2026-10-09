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

type ArtifactDb = {
  collection(path: string): { get(): Promise<{ docs: { id: string; data(): Record<string, unknown> | undefined }[] }>; doc(id: string): { set(d: Record<string, unknown>): Promise<void>; delete(): Promise<void> } };
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
  "agent_tasks", "agent_events", "approvals", "audit_log",
] as const;

type Snap = Map<string, Map<string, string>>; // table -> id -> JSON

export type Runtime = {
  db: DB;
  persisted: boolean;
  storage: "artifact" | "browser" | "none";
  status: "ready" | "offline";
  flush: () => Promise<{ written: number; error?: string }>;
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
        if (!row) continue;
        const cols = Object.keys(row);
        sqlite.run(`INSERT OR REPLACE INTO ${t} (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols.map(() => "?").join(",")})`, cols.map((c) => row[c] as never));
      }
    }
    sqlite.run("PRAGMA foreign_keys = ON;");
  }
  last = snapshot();
  runtime = {
    db: created.db,
    persisted: !!store,
    storage,
    status: store ? "ready" : "offline",
    flush: async () => {
      if (!store) return { written: 0 };
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
