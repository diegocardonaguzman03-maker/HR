/**
 * Orchestrator mirror of a published Command Center database.
 *
 * The orchestrating Claude Code session runs the agents; this mirror records what they do through the SAME
 * services as the app (tasks, status changes, imports), then emits the exact document writes for the Artifact
 * database. The published page subscribes to that database, so PRAXIA World animates each change live.
 *
 *   npx tsx artifact/mirror.mts <stateDir> pull <exportDir> [batchDir ...]   build the mirror from an export
 *   npx tsx artifact/mirror.mts <stateDir> import-prospects <researchDir>     PRX-0012 bases → CRM
 *   npx tsx artifact/mirror.mts <stateDir> task-create <agentId> <priority> <dueDate|-> <title> <instructions>
 *   npx tsx artifact/mirror.mts <stateDir> task-status <taskId> <status> [output]
 *   npx tsx artifact/mirror.mts <stateDir> task-progress <taskId> <0-95>
 *   npx tsx artifact/mirror.mts <stateDir> decisions-import                   agents' founder decisions → inbox
 *   npx tsx artifact/mirror.mts <stateDir> plan-work                          funnel work for the agents
 *   npx tsx artifact/mirror.mts <stateDir> task-output <taskId> <file>         output → waiting for founder approval
 *
 * Every command prints the batch files (≤ 50 writes each, entries ready for ArtifactData batch) it wrote.
 */
import fs from "node:fs";
import path from "node:path";
import { createBrowserDb } from "./sqljs-db";
import { TABLES } from "./src/runtime";
import { createTask, updateTask, updateTaskStatus } from "../src/server/services/agents";
import { importProspects, parseCsv } from "../src/server/services/importer";
import { importFounderDecisions } from "../src/server/seed/decisions";
import { backfillApprovals, planWork } from "../src/server/engine/engine";
import type { TaskPriority, TaskStatus } from "../src/server/db/schema";

const ACTOR = "orchestrator:claude-code";
type Row = Record<string, unknown>;
type State = { docs: Record<string, Record<string, Row>>; versions: Record<string, number>; seq: number };

const [stateDir, cmd, ...args] = process.argv.slice(2);
if (!stateDir || !cmd) throw new Error("usage: mirror.mts <stateDir> <command> ...");
const statePath = path.join(stateDir, "state.json");
const app = path.resolve(import.meta.dirname, "..");
const migrations = fs.readdirSync(path.join(app, "drizzle")).filter((f) => f.endsWith(".sql")).sort().map((f) => fs.readFileSync(path.join(app, "drizzle", f), "utf8"));
const canon = (r: Row | undefined) => (r ? JSON.stringify(Object.keys(r).sort().map((k) => [k, r[k]])) : "");

function readExport(dir: string): State["docs"] {
  const docs: State["docs"] = {};
  for (const t of TABLES) {
    docs[t] = {};
    const d = path.join(dir, t);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      const row = JSON.parse(fs.readFileSync(path.join(d, f), "utf8")) as Row;
      docs[t]![String(row.id)] = row;
    }
  }
  return docs;
}

if (cmd === "pull") {
  const [exportDir, ...batchDirs] = args;
  const docs = readExport(exportDir!);
  const versions: Record<string, number> = {};
  for (const t of TABLES) for (const id of Object.keys(docs[t]!)) versions[`${t}/${id}`] = 1;
  // Replay batches already written after the export (writes of { op, collection, doc_id, data }).
  for (const bd of batchDirs) {
    for (const f of fs.readdirSync(bd).filter((x) => x.endsWith(".json")).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))) {
      for (const w of JSON.parse(fs.readFileSync(path.join(bd, f), "utf8")) as { op: string; collection: string; doc_id: string; data?: Row }[]) {
        const key = `${w.collection}/${w.doc_id}`;
        if (w.op === "delete") { delete docs[w.collection]![w.doc_id]; delete versions[key]; }
        else { docs[w.collection]![w.doc_id] = w.data!; versions[key] = (versions[key] ?? 0) + 1; }
      }
    }
  }
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify({ docs, versions, seq: 0 } satisfies State));
  console.log(`mirror ready: ${Object.values(docs).reduce((n, t) => n + Object.keys(t).length, 0)} documents`);
  process.exit(0);
}

const state = JSON.parse(fs.readFileSync(statePath, "utf8")) as State;
const { sqlite, db } = await createBrowserDb(migrations);
sqlite.run("PRAGMA foreign_keys = OFF;");
for (const t of TABLES) for (const row of Object.values(state.docs[t] ?? {})) {
  const cols = Object.keys(row);
  sqlite.run(`INSERT OR REPLACE INTO ${t} (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols.map(() => "?").join(",")})`, cols.map((c) => row[c] as never));
}
sqlite.run("PRAGMA foreign_keys = ON;");

let result: unknown;
switch (cmd) {
  case "import-prospects": {
    const base = args[0]!;
    const rows = fs.readdirSync(base).filter((d) => /^0[1-6]-/.test(d)).flatMap((d) =>
      fs.readdirSync(path.join(base, d)).filter((f) => f.startsWith("base-") && f.endsWith(".csv")).flatMap((f) => parseCsv(fs.readFileSync(path.join(base, d, f), "utf8"))),
    );
    result = await importProspects(db, rows, { source: "research:PRX-0012", actor: ACTOR, ownerAgentId: "SAL-02" });
    break;
  }
  case "task-create": {
    const [agentId, priority, due, title, instructions] = args;
    const t = await createTask(db, { agentId: agentId!, title: title!, instructions: instructions ?? "", origin: "orchestrator", priority: priority as TaskPriority, dueDate: due === "-" ? null : due }, ACTOR);
    result = { taskId: t.id };
    break;
  }
  case "task-status": {
    const [taskId, status, output] = args;
    // F3: an error keeps its cause in errorMessage (not in the output field).
    await updateTaskStatus(db, taskId!, status as TaskStatus, output ? (status === "error" ? { error: output } : { output }) : {}, ACTOR);
    result = { taskId, status };
    break;
  }
  case "task-progress": {
    const [taskId, n] = args;
    await updateTask(db, taskId!, { progress: Number(n) }, ACTOR);
    result = { taskId, progress: Number(n) };
    break;
  }
  case "tasks-create": {
    // JSON file: [{ agentId, priority, dueDate, title, instructions }] → prints [{ agentId, taskId }]
    const items = JSON.parse(fs.readFileSync(args[0]!, "utf8")) as { agentId: string; priority: TaskPriority; dueDate: string | null; title: string; instructions: string }[];
    const created = [];
    for (const it of items) {
      const t = await createTask(db, { agentId: it.agentId, title: it.title, instructions: it.instructions, origin: "orchestrator", priority: it.priority, dueDate: it.dueDate }, ACTOR);
      created.push({ agentId: it.agentId, taskId: t.id });
    }
    result = created;
    break;
  }
  case "tasks-status": {
    // JSON file: [{ taskId, status, output? }]
    const items = JSON.parse(fs.readFileSync(args[0]!, "utf8")) as { taskId: string; status: TaskStatus; output?: string }[];
    for (const it of items) await updateTaskStatus(db, it.taskId, it.status, it.output ? { output: it.output } : {}, ACTOR);
    result = { updated: items.length };
    break;
  }
  case "decisions-import": {
    result = { ...(await importFounderDecisions(db, ACTOR)), backfilled: await backfillApprovals(db, ACTOR) };
    break;
  }
  case "plan-work": {
    result = await planWork(db, ACTOR, "orchestrator");
    break;
  }
  case "task-output": {
    // F4: the output must exist; its full text goes to the founder's inbox (waiting_approval).
    const [taskId, file] = args;
    if (!file || !fs.existsSync(file)) throw new Error(`output file not found: ${file}`);
    await updateTaskStatus(db, taskId!, "waiting_approval", { output: fs.readFileSync(file, "utf8").trim() }, ACTOR);
    result = { taskId, status: "waiting_approval" };
    break;
  }
  case "qa-fixes": {
    // QA-01 (PRX-0013) data conditions: merge Rappi, drop the repeated Coppel contact, split DHL Express, clean URLs.
    const { organizations: O, contacts: C, agentTasks: T, activities: A, opportunities: OP } = await import("../src/server/db/schema");
    const { eq: E, and: AND } = await import("drizzle-orm");
    const { audit: AUD, nowIso: NOW } = await import("../src/server/services/common");
    const done: string[] = [];
    const orgs = await db.select().from(O);
    const byName = (n: string) => orgs.find((o) => o.name === n);
    const rappi = byName("Rappi"), rappiMx = byName("Rappi México");
    if (rappi && rappiMx) {
      await db.update(C).set({ organizationId: rappiMx.id, updatedAt: NOW() }).where(E(C.organizationId, rappi.id));
      await db.update(A).set({ organizationId: rappiMx.id }).where(E(A.organizationId, rappi.id));
      await db.update(OP).set({ organizationId: rappiMx.id }).where(E(OP.organizationId, rappi.id));
      await db.update(T).set({ entityId: rappiMx.id }).where(AND(E(T.entityType, "organization"), E(T.entityId, rappi.id)));
      await db.update(O).set({ notes: `${rappiMx.notes}\n\nMerged from "Rappi" (sector 02, QA-01):\n${rappi.notes}`.slice(0, 5000), fitScore: Math.max(rappiMx.fitScore ?? 0, rappi.fitScore ?? 0) || null, updatedAt: NOW() }).where(E(O.id, rappiMx.id));
      await db.delete(O).where(E(O.id, rappi.id));
      await AUD(db, ACTOR, "organization.merge", "organization", rappiMx.id, { mergedId: rappi.id }, { into: rappiMx.id, reason: "QA-01 duplicate" });
      done.push("Rappi merged into Rappi México");
    }
    const ban = byName("Grupo Coppel — BanCoppel"), grp = byName("Grupo Coppel");
    if (ban && grp) {
      const dupes = (await db.select().from(C).where(E(C.organizationId, ban.id))).filter((c) => c.fullName === "Diego Coppel Sullivan");
      const keep = (await db.select().from(C).where(E(C.organizationId, grp.id))).find((c) => c.fullName === "Diego Coppel Sullivan");
      for (const d of keep ? dupes : []) {
        await db.delete(C).where(E(C.id, d.id));
        await AUD(db, ACTOR, "contact.merge_duplicate", "contact", keep!.id, { duplicateId: d.id, organization: ban.name }, { kept: keep!.id, reason: "QA-01: same person in two orgs" });
        await db.update(O).set({ notes: `${ban.notes}\nDecision-maker (Diego Coppel Sullivan, DG de Grupo Coppel) is recorded under "Grupo Coppel" (QA-01).`.slice(0, 5000), updatedAt: NOW() }).where(E(O.id, ban.id));
        done.push("Coppel duplicate contact removed");
      }
    }
    const base = args[0]!;
    const rows = fs.readdirSync(base).filter((d) => /^0[1-6]-/.test(d)).flatMap((d) => fs.readdirSync(path.join(base, d)).filter((f) => f.startsWith("base-") && f.endsWith(".csv")).flatMap((f) => parseCsv(fs.readFileSync(path.join(base, d, f), "utf8"))));
    const dhlx = rows.find((r) => r.empresa === "DHL Express México");
    if (dhlx && !byName("DHL Express México")) {
      const notes = [dhlx.trigger_detectado && `Trigger: ${dhlx.trigger_detectado}`, dhlx.fuente_trigger_url && `Trigger source: ${dhlx.fuente_trigger_url}`, dhlx.justificacion_fit && `ICP fit: ${dhlx.justificacion_fit}`, dhlx.servicio_praxia_sugerido && `Suggested offer: ${dhlx.servicio_praxia_sugerido}`, dhlx.prioridad && `Priority: ${dhlx.prioridad}`, "Shares dhl.com with DHL Supply Chain México — separate business unit (QA-01)."].filter(Boolean).join("\n");
      // Inserted directly: it shares dhl.com with DHL Supply Chain (domain is unique), so the domain stays empty.
      const [o] = await db.insert(O).values({ name: "DHL Express México", website: "https://www.dhl.com/mx-es/home/express.html", industry: "Logística y cadena de suministro", country: dhlx.pais_sede || null, sizeBand: (dhlx.tamano_aprox || "").slice(0, 120) || null, notes: notes.slice(0, 5000), source: "research:PRX-0012", sourceRetrievedAt: "2026-10-09" }).returning();
      await AUD(db, ACTOR, "organization.create", "organization", o!.id, null, { name: o!.name, reason: "QA-01: split from DHL Supply Chain" });
      const fit = Number(dhlx.fit_icp_1a5);
      await db.update(O).set({ fitScore: fit >= 1 && fit <= 5 ? fit : null }).where(E(O.id, o!.id));
      done.push("DHL Express México split from DHL Supply Chain");
    }
    let cleaned = 0;
    for (const o of await db.select().from(O)) {
      const web = o.website?.includes("[") ? o.website.replace(/\s*\[[^\]]*\]/g, "").trim() : o.website;
      if (web !== o.website) { await db.update(O).set({ website: /^https?:\/\/\S+$/.test(web ?? "") ? web : null, updatedAt: NOW() }).where(E(O.id, o.id)); cleaned++; }
      if (o.domain?.includes("[")) {
        const dom = o.domain.replace(/\s*\[[^\]]*\]/g, "").trim();
        const clash = (await db.select({ id: O.id }).from(O).where(E(O.domain, dom))).length;
        await db.update(O).set({ domain: clash ? null : dom || null, updatedAt: NOW() }).where(E(O.id, o.id));
        cleaned++;
      }
    }
    if (cleaned) { await AUD(db, ACTOR, "organization.clean_urls", "organization", "bulk", null, { cleaned, reason: "QA-01: strip research annotations" }); done.push(`${cleaned} URL/domain fields cleaned`); }
    result = done;
    break;
  }
  default:
    throw new Error(`unknown command ${cmd}`);
}

// Diff the mirror against the last known database state and emit the writes.
type Write = { op: "set" | "delete"; collection: string; doc_id: string; file_path?: string; if_version?: number };
const writes: Write[] = [];
state.seq += 1;
const docDir = path.join("/home/user/HR/.sync", String(state.seq));
fs.mkdirSync(docDir, { recursive: true });
let n = 0;
for (const t of TABLES) {
  const res = sqlite.exec(`SELECT * FROM ${t}`);
  const now: Record<string, Row> = {};
  if (res[0]) for (const v of res[0].values) now[String(v[res[0].columns.indexOf("id")])] = Object.fromEntries(res[0].columns.map((c, i) => [c, v[i]]));
  const before = state.docs[t] ?? {};
  for (const [id, row] of Object.entries(now)) {
    if (canon(row) === canon(before[id])) continue;
    const key = `${t}/${id}`;
    const file = path.join(docDir, `${++n}.json`);
    fs.writeFileSync(file, JSON.stringify(row));
    writes.push({ op: "set", collection: t, doc_id: id, file_path: file, ...(state.versions[key] ? { if_version: state.versions[key] } : {}) });
    state.versions[key] = (state.versions[key] ?? 0) + 1;
  }
  for (const id of Object.keys(before)) if (!now[id]) {
    const key = `${t}/${id}`;
    writes.push({ op: "delete", collection: t, doc_id: id, if_version: state.versions[key] ?? 1 });
    delete state.versions[key];
  }
  state.docs[t] = now;
}
const outDir = path.join(stateDir, "out");
fs.mkdirSync(outDir, { recursive: true });
const files: string[] = [];
for (let i = 0; i * 50 < writes.length; i++) {
  const f = path.join(outDir, `${String(state.seq).padStart(4, "0")}-${i}.json`);
  fs.writeFileSync(f, JSON.stringify(writes.slice(i * 50, i * 50 + 50)));
  files.push(f);
}
fs.writeFileSync(statePath, JSON.stringify(state));
console.log(JSON.stringify({ result, writes: writes.length, batches: files }));
