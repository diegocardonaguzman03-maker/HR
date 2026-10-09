/** Exports base configuration + flagged demo data as Artifact db documents (one JSON file per row) and batch files. */
import fs from "node:fs";
import path from "node:path";
import { createBrowserDb } from "./sqljs-db";
import { seedBase } from "../src/server/seed/base";
import { seedDemo } from "../src/server/seed/demo";

const TABLES = ["company_settings", "fx_rates", "services", "pipeline_stages", "agents", "organizations", "contacts", "opportunities", "activities", "proposals", "proposal_lines", "contracts", "revenue_entries", "invoices", "payments", "expenses", "agent_tasks", "agent_events", "approvals", "audit_log"];
const out = process.argv[2]!;
const dir = path.join(process.cwd(), "drizzle");
const migrations = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => fs.readFileSync(path.join(dir, f), "utf8"));
const { db, sqlite } = await createBrowserDb(migrations);
await seedBase(db);
if (process.argv[3] === "--demo") await seedDemo(db);
const writes: object[] = [];
for (const t of TABLES) {
  const r = sqlite.exec(`SELECT * FROM ${t}`)[0];
  if (!r) continue;
  for (const row of r.values) {
    const o: Record<string, unknown> = {};
    r.columns.forEach((c: string, i: number) => (o[c] = row[i]));
    const f = path.join(out, `${t}__${o.id}.json`);
    fs.writeFileSync(f, JSON.stringify(o));
    writes.push({ op: "set", collection: t, doc_id: String(o.id), file_path: f });
  }
}
for (let i = 0; i < writes.length; i += 50) fs.writeFileSync(path.join(out, `batch-${i / 50}.json`), JSON.stringify(writes.slice(i, i + 50)));
console.log("docs", writes.length, "batches", Math.ceil(writes.length / 50));
