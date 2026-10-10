import type { Currency } from "@/server/db/schema";
import { type FxRate, findRate, convertMinor } from "./fx";
import { type Period, inPeriod, daysBetween, addDays } from "./period";

export type StageRec = { id: string; key: string; name: string; position: number; defaultProbability: number; kind: "open" | "won" | "lost"; requiredFields: string[] };
export type OpportunityRec = {
  id: string;
  title: string;
  organizationId: string;
  stageId: string;
  amount: number | null;
  currency: Currency;
  probabilityOverride: number | null;
  expectedCloseDate: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  primaryContactId: string | null;
  serviceId: string | null;
  problemStatement: string;
  lostReason: string | null;
  maxStagePosition: number;
  createdAt: string;
  closedAt: string | null;
};
export type LeadRec = { id: string; leadStatus: string };
export type ActivityRec = { type: string; direction: string; contactId: string | null; occurredAt: string; createdAt: string; opportunityId: string | null };
export type OpenProposalRec = { subtotal: number; currency: Currency; status: string };

export const probabilityOf = (o: OpportunityRec, stage: StageRec) => (stage.kind === "won" ? 1 : stage.kind === "lost" ? 0 : (o.probabilityOverride ?? stage.defaultProbability));

/** Human-readable labels for fields that stages can require. */
export const FIELD_LABELS: Record<string, string> = {
  amount: "estimated value",
  primaryContactId: "primary contact",
  problemStatement: "problem statement",
  expectedCloseDate: "expected close date",
  nextAction: "next action",
  serviceId: "service",
  lostReason: "lost reason",
};

/** Validates a stage move. Returns the list of missing required fields (empty = allowed). */
export function validateStageMove(o: Partial<OpportunityRec>, target: StageRec): string[] {
  const missing: string[] = [];
  for (const f of target.requiredFields) {
    const v = (o as Record<string, unknown>)[f];
    if (v === null || v === undefined || (typeof v === "string" && v.trim() === "") || (f === "amount" && typeof v === "number" && v <= 0)) missing.push(f);
  }
  return missing;
}

function toReporting(amount: number, currency: Currency, R: Currency, rates: FxRate[], today: string): number | null {
  if (currency === R) return amount;
  const r = findRate(rates, currency, R, today);
  return r ? convertMinor(amount, r.rate) : null;
}

export type SalesMetrics = {
  totalLeads: number;
  qualifiedLeads: number;
  activeOpportunities: number;
  opportunitiesWithoutValue: number;
  weightedPipeline: { value: number; missingFx: number };
  unweightedPipeline: { value: number; missingFx: number };
  openProposalValue: { value: number; missingFx: number };
  winRate: number | null;
  wonCount: number;
  lostCount: number;
  averageDealSize: number | null;
  salesCycleDays: number | null;
  meetingsBooked: number;
  contactsReached: number;
  contactsReplied: number;
  replyRate: number | null;
  funnel: { stageId: string; name: string; reached: number; conversionFromPrev: number | null }[];
  forecast: { month: string; weighted: number }[];
};

export function computeSalesMetrics(args: {
  opportunities: OpportunityRec[];
  stages: StageRec[];
  leads: LeadRec[];
  activities: ActivityRec[];
  proposals: OpenProposalRec[];
  rates: FxRate[];
  reportingCurrency: Currency;
  period: Period;
  today: string;
}): SalesMetrics {
  const { opportunities, stages, rates, reportingCurrency: R, period, today } = args;
  const stageById = new Map(stages.map((s) => [s.id, s]));
  const open = opportunities.filter((o) => stageById.get(o.stageId)?.kind === "open");

  let weighted = 0, unweighted = 0, missingFx = 0, noValue = 0;
  const forecastMap = new Map<string, number>();
  for (const o of open) {
    if (!o.amount) { noValue++; continue; }
    const v = toReporting(o.amount, o.currency, R, rates, today);
    if (v === null) { missingFx++; continue; }
    const w = v * probabilityOf(o, stageById.get(o.stageId)!);
    weighted += w;
    unweighted += v;
    const month = (o.expectedCloseDate ?? "").slice(0, 7) || "unscheduled";
    forecastMap.set(month, (forecastMap.get(month) ?? 0) + w);
  }

  let pv = 0, pMissing = 0;
  for (const p of args.proposals.filter((x) => ["internal_review", "approved", "sent", "negotiation"].includes(x.status))) {
    const v = toReporting(p.subtotal, p.currency, R, rates, today);
    if (v === null) pMissing++;
    else pv += v;
  }

  const closedInPeriod = opportunities.filter((o) => o.closedAt && inPeriod(o.closedAt, period));
  const won = closedInPeriod.filter((o) => stageById.get(o.stageId)?.kind === "won");
  const lost = closedInPeriod.filter((o) => stageById.get(o.stageId)?.kind === "lost");
  const wonValues = won.map((o) => (o.amount ? toReporting(o.amount, o.currency, R, rates, o.closedAt!.slice(0, 10)) : null)).filter((v): v is number => v !== null);

  const acts = args.activities.filter((a) => inPeriod(a.occurredAt, period));
  const reached = new Set(acts.filter((a) => a.direction === "outbound" && ["email", "linkedin", "call"].includes(a.type) && a.contactId).map((a) => a.contactId));
  const replied = new Set(acts.filter((a) => a.direction === "inbound" && a.contactId && reached.has(a.contactId)).map((a) => a.contactId));

  const ordered = [...stages].filter((s) => s.kind !== "lost").sort((a, b) => a.position - b.position);
  const funnel = ordered.map((s, i) => {
    const count = opportunities.filter((o) => o.maxStagePosition >= s.position).length;
    return { stageId: s.id, name: s.name, reached: count, conversionFromPrev: null as number | null, idx: i };
  });
  funnel.forEach((f, i) => { if (i > 0 && funnel[i - 1]!.reached) f.conversionFromPrev = f.reached / funnel[i - 1]!.reached; });

  const horizon = [0, 1, 2].map((k) => addDays(`${today.slice(0, 7)}-01`, 31 * k).slice(0, 7));
  return {
    totalLeads: args.leads.filter((l) => l.leadStatus !== "disqualified").length,
    qualifiedLeads: args.leads.filter((l) => l.leadStatus === "qualified").length,
    activeOpportunities: open.length,
    opportunitiesWithoutValue: noValue,
    weightedPipeline: { value: Math.round(weighted), missingFx },
    unweightedPipeline: { value: unweighted, missingFx },
    openProposalValue: { value: pv, missingFx: pMissing },
    winRate: won.length + lost.length ? won.length / (won.length + lost.length) : null,
    wonCount: won.length,
    lostCount: lost.length,
    averageDealSize: wonValues.length ? Math.round(wonValues.reduce((s, v) => s + v, 0) / wonValues.length) : null,
    salesCycleDays: won.length ? Math.round(won.reduce((s, o) => s + daysBetween(o.createdAt, o.closedAt!), 0) / won.length) : null,
    meetingsBooked: args.activities.filter((a) => a.type === "meeting" && inPeriod(a.createdAt, period)).length,
    contactsReached: reached.size,
    contactsReplied: replied.size,
    replyRate: reached.size ? replied.size / reached.size : null,
    funnel: funnel.map(({ idx: _idx, ...f }) => f),
    forecast: horizon.map((month) => ({ month, weighted: Math.round(forecastMap.get(month) ?? 0) })),
  };
}
