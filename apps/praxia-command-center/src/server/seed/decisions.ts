/**
 * Founder decisions raised by the agents in PRX-0013 (each deliverable ends with "Decisión requerida del Founder").
 * Loaded as founder_decision approvals: the founder picks an option (A/B/C…) in the inbox. Idempotent by key.
 * D-P07 also carries the contact gate: which options open outreach and with what cap (RISK-01's pilot ≤ 10).
 */
import type { DB } from "../db/client";
import { approvals, type DecisionOption } from "../db/schema";
import { audit } from "../services/common";
import { CONTACT_POLICY_KEY } from "../services/funnel";
import DECISIONS from "./decisions-prx0013.json";

export const DECISIONS_ACTOR = "system:decisions-import";

export type DecisionSeed = {
  key: string; title: string; question: string; options: DecisionOption[]; recommended: string; risks: string; cost: string;
  deadline: string; sources: string[]; sourcePaths: string[]; unlocks: string; funnelStage: string;
};

/** Options of D-P07 that open contact, by option label (resolved at import so a re-lettered source still maps). */
function contactGate(d: DecisionSeed): Record<string, { cap: number | null }> {
  const gate: Record<string, { cap: number | null }> = {};
  for (const o of d.options) {
    const l = o.label.toLowerCase();
    if (/congel|frozen|freeze|no contact/.test(l)) continue;
    const cap = l.match(/(\d+)\s*contact/);
    gate[o.id] = { cap: /piloto|pilot/.test(l) ? Number(cap?.[1] ?? 10) : null };
  }
  return gate;
}

export async function importFounderDecisions(db: DB, actor: string = DECISIONS_ACTOR, seeds: readonly DecisionSeed[] = DECISIONS as DecisionSeed[]) {
  const existing = await db.select({ meta: approvals.meta }).from(approvals);
  const keys = new Set(existing.map((r) => (r.meta as { key?: string } | null)?.key).filter(Boolean));
  let created = 0;
  for (const d of seeds) {
    if (keys.has(d.key)) continue;
    const meta: Record<string, unknown> = { key: d.key, question: d.question, recommended: d.recommended, risks: d.risks, cost: d.cost, deadline: d.deadline, sources: d.sources, sourcePaths: d.sourcePaths, unlocks: d.unlocks, funnelStage: d.funnelStage };
    if (d.key === CONTACT_POLICY_KEY) meta.gate = contactGate(d);
    const [a] = await db.insert(approvals).values({
      kind: "founder_decision", title: `${d.key} · ${d.title}`, detail: d.question, entityType: "decision", entityId: d.key,
      requestedBy: d.sources.join(", "), options: d.options, meta,
    }).returning();
    await audit(db, actor, "approval.request", "decision", d.key, null, { approvalId: a!.id, kind: "founder_decision" });
    created++;
  }
  return { created, skipped: seeds.length - created };
}
