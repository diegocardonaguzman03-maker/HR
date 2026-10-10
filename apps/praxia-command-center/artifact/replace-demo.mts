/**
 * Replaces the demo records of a published Command Center with the current demo scenario, keeping every real
 * record. Input: the artifact database exported as <dir>/<table>/<id>.json (ArtifactData list with out_dir).
 * Output: <out>/batch-N.json files of ArtifactData batch writes (≤ 50 each): deletes for old demo rows, sets for
 * the new ones. Usage: npx tsx artifact/replace-demo.mts <exportDir> <outDir>
 */
import fs from "node:fs";
import path from "node:path";
import { createBrowserDb } from "./sqljs-db";
import { seedDemo } from "../src/server/seed/demo";
import { TABLES } from "./src/runtime";

const [inDir, outDir] = process.argv.slice(2);
if (!inDir || !outDir) throw new Error("usage: replace-demo.mts <exportDir> <outDir>");
const app = path.resolve(import.meta.dirname, "..");
const migrations = fs.readdirSync(path.join(app, "drizzle")).filter((f) => f.endsWith(".sql")).sort().map((f) => fs.readFileSync(path.join(app, "drizzle", f), "utf8"));
const { sqlite, db } = await createBrowserDb(migrations);

const live = new Map<string, Map<string, Record<string, unknown>>>();
sqlite.run("PRAGMA foreign_keys = OFF;");
for (const t of TABLES) {
  const m = new Map<string, Record<string, unknown>>();
  const dir = path.join(inDir, t);
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      const row = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Record<string, unknown>;
      m.set(String(row.id), row);
      const cols = Object.keys(row);
      sqlite.run(`INSERT OR REPLACE INTO ${t} (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols.map(() => "?").join(",")})`, cols.map((c) => row[c] as never));
    }
  }
  live.set(t, m);
}
// Remove the old demo scenario (children first). Real rows are never touched.
sqlite.run("DELETE FROM proposal_lines WHERE proposal_id IN (SELECT id FROM proposals WHERE is_demo = 1)");
for (const t of ["payments", "invoices", "revenue_entries", "expenses", "contracts", "approvals", "proposals", "activities", "opportunities", "contacts", "organizations", "audit_log"]) sqlite.run(`DELETE FROM ${t} WHERE is_demo = 1`);
sqlite.run("PRAGMA foreign_keys = ON;");
const created = await seedDemo(db);

/** Key-order-independent comparison (the export sorts keys; SQLite returns them in column order). */
const canon = (r: Record<string, unknown> | undefined) => (r ? JSON.stringify(Object.keys(r).sort().map((k) => [k, r[k]])) : "");
const writes: { op: "set" | "delete"; collection: string; doc_id: string; data?: Record<string, unknown> }[] = [];
for (const t of TABLES) {
  const res = sqlite.exec(`SELECT * FROM ${t}`);
  const now = new Map<string, Record<string, unknown>>();
  if (res[0]) for (const v of res[0].values) now.set(String(v[res[0].columns.indexOf("id")]), Object.fromEntries(res[0].columns.map((c, i) => [c, v[i]])));
  const before = live.get(t)!;
  for (const [id, row] of now) if (canon(row) !== canon(before.get(id))) writes.push({ op: "set", collection: t, doc_id: id, data: row });
  for (const id of before.keys()) if (!now.has(id)) writes.push({ op: "delete", collection: t, doc_id: id });
}
fs.mkdirSync(outDir, { recursive: true });
for (let i = 0; i * 50 < writes.length; i++) fs.writeFileSync(path.join(outDir, `batch-${i}.json`), JSON.stringify(writes.slice(i * 50, i * 50 + 50)));
console.log(`demo rows created: ${created}; writes: ${writes.length} (${writes.filter((w) => w.op === "delete").length} deletes) in ${Math.ceil(writes.length / 50)} batches`);
