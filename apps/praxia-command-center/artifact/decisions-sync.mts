/**
 * Keeps praxia/01-equipo/registro-de-decisiones.md in step with the founder's inbox in the Command Center.
 *
 *   npx tsx artifact/decisions-sync.mts <approvalsDir> <registry.md>
 *
 * <approvalsDir> holds the `approvals` documents exported from the Artifact database (one JSON per document).
 * Decided founder decisions are appended to "Decididas" (once, by key); the pending ones are listed in a managed
 * section between markers. Nothing is decided here: this only records what the founder chose in the inbox.
 */
import fs from "node:fs";
import path from "node:path";

type Row = { kind: string; status: string; title: string; choice: string | null; decision_note: string | null; decided_at: string | null; options: string | null | { id: string; label: string }[]; meta: string | null | Record<string, unknown> };
const [dir, registry] = process.argv.slice(2);
if (!dir || !registry) throw new Error("usage: decisions-sync.mts <approvalsDir> <registry.md>");
const parse = <T,>(v: unknown): T => (typeof v === "string" ? JSON.parse(v) : v) as T;
const docs: Row[] = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  return (raw.data ?? raw) as Row;
}).filter((r) => r.kind === "founder_decision");

let md = fs.readFileSync(registry, "utf8");
const cell = (s: string) => s.replace(/\|/g, "/").replace(/\n+/g, " ").trim();
let added = 0;
for (const r of docs.filter((d) => d.status !== "pending").sort((a, b) => (a.decided_at ?? "").localeCompare(b.decided_at ?? ""))) {
  const m = parse<{ key: string }>(r.meta);
  const marker = `| ${m.key} | `;
  const decidedSection = md.slice(0, md.indexOf("## Pendientes"));
  if (decidedSection.includes(marker)) continue;
  const opts = parse<{ id: string; label: string }[]>(r.options) ?? [];
  const text = r.status === "approved"
    ? `**Opción ${r.choice}: ${cell(opts.find((o) => o.id === r.choice)?.label ?? "")}**${r.decision_note ? ` — Nota: ${cell(r.decision_note)}` : ""}`
    : `**Aplazada.** ${cell(r.decision_note ?? "")}`;
  const line = `| ${m.key} | ${(r.decided_at ?? "").slice(0, 10)} | ${cell(r.title.replace(`${m.key} · `, ""))}: ${text} | Bandeja de aprobación del Command Center (decisión del Founder) |\n`;
  const at = md.indexOf("\n## Pendientes");
  const tableEnd = md.lastIndexOf("|\n", at) + 2;
  md = md.slice(0, tableEnd) + line + md.slice(tableEnd);
  added++;
}
const pending = docs.filter((d) => d.status === "pending").map((r) => ({ r, m: parse<{ key: string; recommended?: string; deadline?: string; sources?: string[] }>(r.meta), o: parse<{ id: string; label: string }[]>(r.options) ?? [] }))
  .sort((a, b) => (a.m.deadline ?? "").localeCompare(b.m.deadline ?? ""));
const section = [
  "<!-- inbox:start (generado por artifact/decisions-sync.mts; no editar a mano) -->",
  "## Pendientes en la bandeja del Command Center",
  "",
  `Al ${new Date().toISOString().slice(0, 10)}: ${pending.length} decisiones esperan al Founder en **Approvals**. Se registran arriba en cuanto el Founder elige una opción.`,
  "",
  "| ID | Decisión | Opciones | Recomendación | Fecha límite | Planteada por |",
  "|---|---|---|---|---|---|",
  ...pending.map(({ r, m, o }) => `| ${m.key} | ${cell(r.title.replace(`${m.key} · `, ""))} | ${o.map((x) => `${x.id} ${cell(x.label)}`).join(" · ")} | ${m.recommended ?? "—"} | ${m.deadline ?? "—"} | ${(m.sources ?? []).join(", ")} |`),
  "<!-- inbox:end -->",
].join("\n");
const s = md.indexOf("<!-- inbox:start"), e = md.indexOf("<!-- inbox:end -->");
md = s >= 0 ? md.slice(0, s) + section + md.slice(e + "<!-- inbox:end -->".length) : md.replace("\n## Abiertas desde la skill", `\n${section}\n\n## Abiertas desde la skill`);
fs.writeFileSync(registry, md);
console.log(JSON.stringify({ decidedAdded: added, pending: pending.length }));
