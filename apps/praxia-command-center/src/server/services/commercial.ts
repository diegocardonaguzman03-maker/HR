import { and, asc, desc, eq, max, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { approvals, contracts, opportunities, organizations, proposalLines, proposals, revenueEntries, services, pipelineStages, CURRENCIES } from "../db/schema";
import { proposalTotals } from "@/domain/finance";
import { audit, BusinessRuleError, getSettings, nowIso, snapshotFor, type Actor } from "./common";
import { moveOpportunityStage } from "./crm";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
export const MARGIN_TARGET = 0.5;
const EDITABLE = ["draft", "internal_review"] as const;

export async function getProposalWithLines(db: DB, id: string) {
  const [p] = await db.select().from(proposals).where(eq(proposals.id, id));
  if (!p) throw new BusinessRuleError("Proposal not found.");
  const lines = await db.select().from(proposalLines).where(eq(proposalLines.proposalId, id)).orderBy(asc(proposalLines.position));
  return { proposal: p, lines, totals: proposalTotals(lines, p.taxRate, MARGIN_TARGET) };
}

/** Creates a new draft proposal (next version) from an opportunity, pre-filled from its service and value. */
export async function createProposalFromOpportunity(db: DB, opportunityId: string, actor: Actor = "founder") {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, opportunityId));
  if (!opp) throw new BusinessRuleError("Opportunity not found.");
  const [svc] = opp.serviceId ? await db.select().from(services).where(eq(services.id, opp.serviceId)) : [];
  const [{ v }] = (await db.select({ v: max(proposals.version) }).from(proposals).where(eq(proposals.opportunityId, opportunityId))) as [{ v: number | null }];
  const settings = await getSettings(db);
  const [p] = await db
    .insert(proposals)
    .values({
      opportunityId,
      version: (v ?? 0) + 1,
      title: `${svc?.name ?? "Proposal"} — ${opp.title}`,
      summary: opp.problemStatement,
      currency: opp.currency,
      taxRate: settings.defaultTaxRate,
      isDemo: opp.isDemo,
    })
    .returning();
  const unit = opp.amount ?? svc?.priceMin ?? 0;
  if (unit > 0) await db.insert(proposalLines).values({ proposalId: p!.id, serviceId: svc?.id ?? null, description: svc?.name ?? opp.title, quantity: 1, unitPrice: unit, estimatedCost: 0, position: 0 });
  await audit(db, actor, "proposal.create", "proposal", p!.id, null, p);
  return p!;
}

export const proposalPatch = z.object({
  title: z.string().trim().min(3).max(300).optional(),
  summary: z.string().trim().max(20000).optional(),
  currency: z.enum(CURRENCIES).optional(),
  taxRate: z.number().min(0).max(0.5).optional(),
  validUntil: isoDate.optional().nullable(),
});
export const lineInput = z.object({
  serviceId: z.string().optional().nullable(),
  description: z.string().trim().min(2, "line description is required").max(500),
  milestone: z.string().trim().max(200).optional().nullable(),
  quantity: z.number().positive().max(10000),
  unitPrice: z.number().int().min(0),
  estimatedCost: z.number().int().min(0).default(0),
});

export async function updateProposal(db: DB, id: string, raw: { patch?: z.input<typeof proposalPatch>; lines?: z.input<typeof lineInput>[] }, actor: Actor = "founder") {
  const { proposal: before } = await getProposalWithLines(db, id);
  if (!(EDITABLE as readonly string[]).includes(before.status)) throw new BusinessRuleError(`Proposal is ${before.status}; create a new version to change it.`);
  const patch = proposalPatch.parse(raw.patch ?? {});
  if (Object.keys(patch).length) await db.update(proposals).set({ ...patch, updatedAt: nowIso() }).where(eq(proposals.id, id));
  if (raw.lines) {
    const lines = z.array(lineInput).max(50).parse(raw.lines);
    await db.delete(proposalLines).where(eq(proposalLines.proposalId, id));
    if (lines.length) await db.insert(proposalLines).values(lines.map((l, i) => ({ ...l, proposalId: id, position: i })));
  }
  // Any change while in review sends it back to draft (approval must be on the final numbers).
  if (before.status === "internal_review") {
    await db.update(proposals).set({ status: "draft" }).where(eq(proposals.id, id));
    await db.update(approvals).set({ status: "rejected", decisionNote: "Superseded: proposal edited after submission.", decidedAt: nowIso() }).where(and(eq(approvals.entityId, id), eq(approvals.status, "pending")));
  }
  const after = await getProposalWithLines(db, id);
  await audit(db, actor, "proposal.update", "proposal", id, before, after.proposal);
  return after;
}

/** Submits pricing for founder approval. */
export async function submitProposalForApproval(db: DB, id: string, actor: Actor = "founder") {
  const { proposal, lines, totals } = await getProposalWithLines(db, id);
  if (proposal.status !== "draft") throw new BusinessRuleError("Only draft proposals can be submitted for approval.");
  if (!lines.length || totals.subtotal <= 0) throw new BusinessRuleError("Add at least one priced line before submitting.");
  await db.update(proposals).set({ status: "internal_review", updatedAt: nowIso() }).where(eq(proposals.id, id));
  const marginTxt = totals.grossMargin === null ? "n/a" : `${(totals.grossMargin * 100).toFixed(0)}%`;
  const [a] = await db
    .insert(approvals)
    .values({
      kind: "proposal_pricing",
      title: `Pricing for "${proposal.title}" (v${proposal.version})`,
      detail: `Subtotal ${totals.subtotal / 100} ${proposal.currency}; estimated cost ${totals.cost / 100}; gross margin ${marginTxt}${totals.meetsMarginTarget ? "" : ` — BELOW the ${MARGIN_TARGET * 100}% target`}.`,
      entityType: "proposal",
      entityId: id,
      requestedBy: actor,
      isDemo: proposal.isDemo,
    })
    .returning();
  await audit(db, actor, "proposal.submit", "proposal", id, { status: "draft" }, { status: "internal_review", approvalId: a!.id });
  return a!;
}

/** Founder decision on any approval. Side effects depend on the approval kind. */
export async function decideApproval(db: DB, approvalId: string, decision: "approved" | "rejected", note: string | null, actor: Actor = "founder") {
  const [a] = await db.select().from(approvals).where(eq(approvals.id, approvalId));
  if (!a) throw new BusinessRuleError("Approval not found.");
  if (a.status !== "pending") throw new BusinessRuleError(`Already ${a.status}.`);
  if (actor !== "founder") throw new BusinessRuleError("Only the founder can decide approvals.");
  const now = nowIso();
  await db.update(approvals).set({ status: decision, decisionNote: note, decidedAt: now }).where(eq(approvals.id, approvalId));
  if (a.kind === "proposal_pricing") {
    await db
      .update(proposals)
      .set(decision === "approved" ? { status: "approved", approvedAt: now, updatedAt: now } : { status: "draft", updatedAt: now })
      .where(and(eq(proposals.id, a.entityId), eq(proposals.status, "internal_review")));
  }
  await audit(db, actor, `approval.${decision}`, a.entityType, a.entityId, { approvalId, status: "pending" }, { status: decision, note });
  return { ...a, status: decision };
}

/** Records that the founder sent an APPROVED proposal (manual record — the system does not send it). */
export async function markProposalSent(db: DB, id: string, sentOn: string, actor: Actor = "founder") {
  const { proposal } = await getProposalWithLines(db, id);
  if (proposal.status !== "approved") throw new BusinessRuleError("Only approved proposals can be marked as sent. Submit pricing for approval first.");
  isoDate.parse(sentOn);
  await db.update(proposals).set({ status: "sent", sentAt: sentOn, updatedAt: nowIso() }).where(eq(proposals.id, id));
  const [stage] = await db.select().from(pipelineStages).where(eq(pipelineStages.key, "proposal_sent"));
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, proposal.opportunityId));
  const [cur] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, opp!.stageId));
  if (stage && cur && cur.kind === "open" && cur.position < stage.position) {
    try {
      await moveOpportunityStage(db, opp!.id, stage.id, actor);
    } catch {
      /* stage requirements not met yet; the proposal status is still recorded */
    }
  }
  await audit(db, actor, "proposal.sent", "proposal", id, { status: "approved" }, { status: "sent", sentOn });
}

export async function setProposalOutcome(db: DB, id: string, outcome: "negotiation" | "rejected" | "expired", actor: Actor = "founder") {
  const { proposal } = await getProposalWithLines(db, id);
  const allowed: Record<string, string[]> = { negotiation: ["sent"], rejected: ["sent", "negotiation"], expired: ["sent", "negotiation", "approved"] };
  if (!allowed[outcome]!.includes(proposal.status)) throw new BusinessRuleError(`Cannot mark a ${proposal.status} proposal as ${outcome}.`);
  await db.update(proposals).set({ status: outcome, decidedAt: outcome === "negotiation" ? null : nowIso(), updatedAt: nowIso() }).where(eq(proposals.id, id));
  await audit(db, actor, `proposal.${outcome}`, "proposal", id, { status: proposal.status }, { status: outcome });
}

/**
 * Client accepted the proposal. Requires acceptance evidence (e.g. signed proposal file, e-signature envelope id,
 * PO number). Creates a contract awaiting signature — acceptance alone is NOT a signed contract.
 */
export async function acceptProposal(db: DB, id: string, input: { acceptedOn: string; evidence: string }, actor: Actor = "founder") {
  const { proposal, totals } = await getProposalWithLines(db, id);
  if (!["sent", "negotiation"].includes(proposal.status)) throw new BusinessRuleError("Only sent or in-negotiation proposals can be accepted.");
  isoDate.parse(input.acceptedOn);
  const evidence = input.evidence?.trim();
  if (!evidence || evidence.length < 4) throw new BusinessRuleError("Acceptance evidence is required (signed document reference, e-signature id, PO number…).");
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, proposal.opportunityId));
  const [svc] = opp!.serviceId ? await db.select().from(services).where(eq(services.id, opp!.serviceId)) : [];
  await db.update(proposals).set({ status: "accepted", decidedAt: input.acceptedOn, acceptanceEvidence: evidence, updatedAt: nowIso() }).where(eq(proposals.id, id));
  const [c] = await db
    .insert(contracts)
    .values({
      organizationId: opp!.organizationId,
      opportunityId: opp!.id,
      proposalId: id,
      title: proposal.title,
      kind: svc?.pricingModel === "retainer" ? "retainer" : "project",
      currency: proposal.currency,
      totalAmount: totals.subtotal,
      monthlyAmount: svc?.pricingModel === "retainer" ? totals.subtotal : null,
      status: "pending_signature",
      isDemo: proposal.isDemo,
    })
    .returning();
  await audit(db, actor, "proposal.accepted", "proposal", id, { status: proposal.status }, { status: "accepted", evidence, contractId: c!.id });
  return c!;
}

export const signInput = z.object({
  signedAt: isoDate,
  evidence: z.string().trim().min(4, "signature evidence is required"),
  startDate: isoDate.optional().nullable(),
  endDate: isoDate.optional().nullable(),
  monthlyAmount: z.number().int().positive().optional().nullable(),
  totalAmount: z.number().int().positive().optional(),
});

/** Records a verified signature. Only now does the contract count as a booking; the opportunity moves to Closed Won. */
export async function signContract(db: DB, id: string, raw: z.input<typeof signInput>, actor: Actor = "founder") {
  const input = signInput.parse(raw);
  const [c] = await db.select().from(contracts).where(eq(contracts.id, id));
  if (!c) throw new BusinessRuleError("Contract not found.");
  if (c.status !== "pending_signature") throw new BusinessRuleError(`Contract is already ${c.status}.`);
  if (input.startDate && input.endDate && input.endDate < input.startDate) throw new BusinessRuleError("End date must be after start date.");
  const totalAmount = input.totalAmount ?? c.totalAmount;
  const snap = await snapshotFor(db, totalAmount, c.currency, input.signedAt);
  const [after] = await db
    .update(contracts)
    .set({
      status: "signed",
      signedAt: input.signedAt,
      signatureEvidence: input.evidence,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      monthlyAmount: c.kind === "retainer" ? (input.monthlyAmount ?? c.monthlyAmount) : null,
      totalAmount,
      ...snap,
      updatedAt: nowIso(),
    })
    .where(eq(contracts.id, id))
    .returning();
  if (c.opportunityId) {
    const [won] = await db.select().from(pipelineStages).where(eq(pipelineStages.kind, "won"));
    const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, c.opportunityId));
    if (won && opp && opp.stageId !== won.id) {
      if (!opp.amount) await db.update(opportunities).set({ amount: totalAmount }).where(eq(opportunities.id, opp.id));
      await moveOpportunityStage(db, opp.id, won.id, actor);
    }
  }
  await db.update(organizations).set({ lifecycle: "client", updatedAt: nowIso() }).where(eq(organizations.id, c.organizationId));
  await audit(db, actor, "contract.signed", "contract", id, c, after);
  return after!;
}

export async function setContractStatus(db: DB, id: string, status: "active" | "completed" | "terminated", actor: Actor = "founder") {
  const [c] = await db.select().from(contracts).where(eq(contracts.id, id));
  if (!c) throw new BusinessRuleError("Contract not found.");
  const allowed: Record<string, string[]> = { active: ["signed"], completed: ["signed", "active"], terminated: ["signed", "active"] };
  if (!allowed[status]!.includes(c.status)) throw new BusinessRuleError(`Cannot change a ${c.status} contract to ${status}.`);
  await db.update(contracts).set({ status, updatedAt: nowIso() }).where(eq(contracts.id, id));
  await audit(db, actor, `contract.${status}`, "contract", id, { status: c.status }, { status });
}

export const recognitionInput = z.object({
  recognizedOn: isoDate,
  amount: z.number().int().positive(),
  basis: z.enum(["milestone", "retainer_month", "manual"]),
  description: z.string().trim().max(500).optional().default(""),
});

/** Recognizes revenue against a signed contract. Cumulative recognition can never exceed the contract value. */
export async function recognizeRevenue(db: DB, contractId: string, raw: z.input<typeof recognitionInput>, actor: Actor = "founder") {
  const input = recognitionInput.parse(raw);
  const [c] = await db.select().from(contracts).where(eq(contracts.id, contractId));
  if (!c) throw new BusinessRuleError("Contract not found.");
  if (!["signed", "active", "completed"].includes(c.status)) throw new BusinessRuleError("Revenue can only be recognized on signed contracts.");
  if (c.signedAt && input.recognizedOn < c.signedAt) throw new BusinessRuleError("Revenue cannot be recognized before the contract was signed.");
  const [{ s }] = (await db.select({ s: sql<number>`coalesce(sum(${revenueEntries.amount}),0)` }).from(revenueEntries).where(eq(revenueEntries.contractId, contractId))) as [{ s: number }];
  if (s + input.amount > c.totalAmount)
    throw new BusinessRuleError(`Recognition would exceed the contract value (${(c.totalAmount - s) / 100} ${c.currency} remaining).`, { remaining: c.totalAmount - s });
  const snap = await snapshotFor(db, input.amount, c.currency, input.recognizedOn);
  const [row] = await db.insert(revenueEntries).values({ ...input, contractId, currency: c.currency, ...snap, isDemo: c.isDemo }).returning();
  await audit(db, actor, "revenue.recognize", "contract", contractId, null, row);
  return row!;
}

export async function listProposalsForOpportunity(db: DB, opportunityId: string) {
  return db.select().from(proposals).where(eq(proposals.opportunityId, opportunityId)).orderBy(desc(proposals.version));
}
