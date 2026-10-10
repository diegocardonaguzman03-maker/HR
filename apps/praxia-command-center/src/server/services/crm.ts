import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { activities, contacts, contracts, opportunities, organizations, pipelineStages, proposals, ACTIVITY_TYPES, CURRENCIES } from "../db/schema";
import { validateStageMove, FIELD_LABELS, type StageRec } from "@/domain/pipeline";
import { assertOutboundAllowed, guardContactPatch } from "./privacy";
import { audit, BusinessRuleError, demoFilter, nowIso, type Actor } from "./common";

const optText = z.string().trim().max(2000).optional().transform((v) => (v ? v : null));
const optUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//i.test(v), "must start with http:// or https://");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export function normalizeDomain(input: string | null | undefined): string | null {
  if (!input) return null;
  const d = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0]!;
  return d || null;
}

// ───────────── Organizations ─────────────

export const organizationInput = z.object({
  name: z.string().trim().min(2, "name is required").max(200),
  domain: optText,
  website: optUrl,
  industry: optText,
  country: optText,
  sizeBand: optText,
  revenueBand: optText,
  linkedinUrl: optUrl,
  notes: z.string().trim().max(5000).optional().default(""),
  source: z.string().trim().max(200).optional().default("manual"),
  sourceRetrievedAt: z.string().optional().nullable(),
  isDemo: z.boolean().optional().default(false),
});

export async function findDuplicateOrganization(db: DB, name: string, domain: string | null) {
  const byDomain = domain ? await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(eq(organizations.domain, domain)) : [];
  if (byDomain.length) return { ...byDomain[0]!, matchedOn: "domain" as const };
  const byName = await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(sql`lower(${organizations.name}) = ${name.trim().toLowerCase()}`);
  if (byName.length) return { ...byName[0]!, matchedOn: "name" as const };
  return null;
}

export async function createOrganization(db: DB, raw: z.input<typeof organizationInput>, actor: Actor = "founder") {
  const input = organizationInput.parse(raw);
  const domain = normalizeDomain(input.domain ?? input.website);
  const dup = await findDuplicateOrganization(db, input.name, domain);
  if (dup) throw new BusinessRuleError(`Possible duplicate: "${dup.name}" already exists (same ${dup.matchedOn}).`, { duplicateId: dup.id });
  const source = input.source || "manual";
  const [row] = await db
    .insert(organizations)
    .values({ ...input, domain, source, sourceRetrievedAt: source !== "manual" ? (input.sourceRetrievedAt ?? nowIso()) : null })
    .returning();
  await audit(db, actor, "organization.create", "organization", row!.id, null, row);
  return row!;
}

export async function updateOrganization(db: DB, id: string, raw: Partial<z.input<typeof organizationInput>> & { lifecycle?: string; fitScore?: number | null }, actor: Actor = "founder") {
  const [before] = await db.select().from(organizations).where(eq(organizations.id, id));
  if (!before) throw new BusinessRuleError("Organization not found.");
  const parsed = organizationInput.partial().parse(raw);
  // zod partial() still applies defaults: keep only keys actually sent; demo flag and provenance timestamp never change on edit.
  const patch: Record<string, unknown> = { ...Object.fromEntries(Object.entries(parsed).filter(([k]) => k in raw && k !== "isDemo" && k !== "sourceRetrievedAt")), updatedAt: nowIso() };
  if ("domain" in raw || "website" in raw) patch.domain = normalizeDomain((parsed.domain ?? parsed.website) || before.domain);
  if (raw.lifecycle) patch.lifecycle = z.enum(["target", "prospect", "client", "former_client", "partner"]).parse(raw.lifecycle);
  if (raw.fitScore !== undefined) patch.fitScore = raw.fitScore === null ? null : z.number().int().min(1, "fit is 1–5").max(5, "fit is 1–5").parse(raw.fitScore);
  const [after] = await db.update(organizations).set(patch).where(eq(organizations.id, id)).returning();
  await audit(db, actor, "organization.update", "organization", id, before, after);
  return after!;
}

export async function listOrganizations(db: DB, includeDemo: boolean) {
  return db.select().from(organizations).where(demoFilter(organizations.isDemo, includeDemo)).orderBy(asc(organizations.name));
}

// ───────────── Contacts ─────────────

export const contactInput = z.object({
  organizationId: z.string().optional().nullable(),
  fullName: z.string().trim().min(2, "full name is required").max(200),
  title: optText,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || z.email().safeParse(v).success, "invalid email"),
  emailStatus: z.enum(["unverified", "valid", "invalid", "risky", "unknown"]).optional().default("unverified"),
  linkedinUrl: optUrl,
  geography: optText,
  source: z.string().trim().max(200).optional().default("manual"),
  lawfulBasis: z.enum(["consent", "legitimate_interest", "existing_relationship", "not_assessed"]).optional().default("not_assessed"),
  leadStatus: z.enum(["new", "researched", "contacted", "engaged", "qualified", "disqualified"]).optional().default("new"),
  leadScore: z.number().int().min(0).max(100).optional().nullable(),
  ownerAgentId: z.string().optional().nullable(),
  doNotContact: z.boolean().optional().default(false),
  residenceCountry: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "2-letter ISO country").optional().nullable(),
  retainUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().trim().max(5000).optional().default(""),
  isDemo: z.boolean().optional().default(false),
});

export async function createContact(db: DB, raw: z.input<typeof contactInput>, actor: Actor = "founder") {
  const input = contactInput.parse(raw);
  if (input.email) {
    const [dup] = await db.select({ id: contacts.id, fullName: contacts.fullName }).from(contacts).where(eq(contacts.email, input.email));
    if (dup) throw new BusinessRuleError(`A contact with this email already exists (${dup.fullName}).`, { duplicateId: dup.id });
  }
  const [row] = await db
    .insert(contacts)
    .values({ ...input, sourceRetrievedAt: input.source !== "manual" ? nowIso() : null })
    .returning();
  await audit(db, actor, "contact.create", "contact", row!.id, null, row);
  return row!;
}

export async function updateContact(db: DB, id: string, raw: Partial<z.input<typeof contactInput>>, actor: Actor = "founder") {
  const [before] = await db.select().from(contacts).where(eq(contacts.id, id));
  if (!before) throw new BusinessRuleError("Contact not found.");
  const parsed = contactInput.partial().parse(raw);
  const patch = guardContactPatch(before, Object.fromEntries(Object.entries(parsed).filter(([k]) => k in raw && k !== "isDemo")), actor);
  if (patch.email && patch.email !== before.email) {
    const [dup] = await db.select({ id: contacts.id, fullName: contacts.fullName }).from(contacts).where(eq(contacts.email, patch.email as string));
    if (dup && dup.id !== id) throw new BusinessRuleError(`A contact with this email already exists (${dup.fullName}).`, { duplicateId: dup.id });
  }
  const [after] = await db.update(contacts).set({ ...patch, updatedAt: nowIso() }).where(eq(contacts.id, id)).returning();
  await audit(db, actor, "contact.update", "contact", id, before, after);
  return after!;
}

// ───────────── Pipeline ─────────────

export async function listStages(db: DB): Promise<StageRec[]> {
  return (await db.select().from(pipelineStages).orderBy(asc(pipelineStages.position))) as StageRec[];
}

export const opportunityInput = z.object({
  organizationId: z.string().min(1, "organization is required"),
  title: z.string().trim().min(3, "title is required").max(200),
  primaryContactId: z.string().optional().nullable().transform((v) => v || null),
  serviceId: z.string().optional().nullable().transform((v) => v || null),
  stageId: z.string().optional(),
  problemStatement: z.string().trim().max(5000).optional().default(""),
  proposedSolution: z.string().trim().max(5000).optional().default(""),
  amount: z.number().int().positive().optional().nullable(),
  currency: z.enum(CURRENCIES).optional().default("USD"),
  probabilityOverride: z.number().min(0).max(1).optional().nullable(),
  expectedCloseDate: isoDate.optional().nullable(),
  nextAction: optText,
  nextActionDate: isoDate.optional().nullable(),
  ownerAgentId: z.string().optional().nullable(),
  risks: z.string().trim().max(5000).optional().default(""),
  isDemo: z.boolean().optional().default(false),
});

export async function createOpportunity(db: DB, raw: z.input<typeof opportunityInput>, actor: Actor = "founder") {
  const input = opportunityInput.parse(raw);
  const stages = await listStages(db);
  const stage = input.stageId ? stages.find((s) => s.id === input.stageId) : stages[0];
  if (!stage) throw new BusinessRuleError("Unknown pipeline stage.");
  if (stage.kind !== "open") throw new BusinessRuleError("New opportunities must start in an open stage.");
  const missing = validateStageMove(input, stage);
  if (missing.length) throw new BusinessRuleError(`Stage "${stage.name}" requires: ${missing.map((m) => FIELD_LABELS[m] ?? m).join(", ")}.`, { missing });
  const [row] = await db.insert(opportunities).values({ ...input, stageId: stage.id, maxStagePosition: stage.position }).returning();
  await db.insert(activities).values({
    type: "system",
    subject: `Opportunity created in ${stage.name}`,
    occurredAt: nowIso(),
    organizationId: row!.organizationId,
    opportunityId: row!.id,
    actor,
    recordedManually: false,
    isDemo: row!.isDemo,
  });
  await audit(db, actor, "opportunity.create", "opportunity", row!.id, null, row);
  return row!;
}

export async function updateOpportunity(db: DB, id: string, raw: Partial<z.input<typeof opportunityInput>>, actor: Actor = "founder") {
  const [before] = await db.select().from(opportunities).where(eq(opportunities.id, id));
  if (!before) throw new BusinessRuleError("Opportunity not found.");
  const parsed = opportunityInput.partial().parse(raw);
  if (raw.organizationId !== undefined && raw.organizationId !== before.organizationId) throw new BusinessRuleError("An opportunity cannot be moved to another organization; create a new one.");
  const patch = Object.fromEntries(Object.entries(parsed).filter(([k]) => k in raw && !["stageId", "isDemo", "organizationId"].includes(k)));
  // Keep the current stage's requirements satisfied.
  const stage = (await listStages(db)).find((s) => s.id === before.stageId)!;
  const missing = validateStageMove({ ...before, ...patch }, stage);
  if (missing.length) throw new BusinessRuleError(`Stage "${stage.name}" requires: ${missing.map((m) => FIELD_LABELS[m] ?? m).join(", ")}.`, { missing });
  const [after] = await db.update(opportunities).set({ ...patch, updatedAt: nowIso() }).where(eq(opportunities.id, id)).returning();
  await audit(db, actor, "opportunity.update", "opportunity", id, before, after);
  return after!;
}

/**
 * Moves an opportunity to another stage with validation:
 * - the target stage's required fields must be present;
 * - Closed Won requires a signed contract with signature evidence, or an accepted proposal with acceptance evidence
 *   (a draft or an unverified email never counts as a signed deal);
 * - Closed Lost requires a lost reason.
 */
export async function moveOpportunityStage(db: DB, id: string, stageId: string, actor: Actor = "founder", extra: { lostReason?: string } = {}) {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, id));
  if (!opp) throw new BusinessRuleError("Opportunity not found.");
  const stages = await listStages(db);
  const target = stages.find((s) => s.id === stageId);
  const current = stages.find((s) => s.id === opp.stageId)!;
  if (!target) throw new BusinessRuleError("Unknown pipeline stage.");
  if (target.id === current.id) return opp;

  const candidate = { ...opp, lostReason: extra.lostReason?.trim() || opp.lostReason };
  const missing = validateStageMove(candidate, target);
  if (missing.length) throw new BusinessRuleError(`Cannot move to "${target.name}". Missing: ${missing.map((m) => FIELD_LABELS[m] ?? m).join(", ")}.`, { missing });

  if (target.kind === "won") {
    const signed = await db
      .select({ id: contracts.id })
      .from(contracts)
      .where(and(eq(contracts.opportunityId, id), inArray(contracts.status, ["signed", "active", "completed"]), sql`${contracts.signatureEvidence} is not null`));
    const accepted = await db
      .select({ id: proposals.id })
      .from(proposals)
      .where(and(eq(proposals.opportunityId, id), eq(proposals.status, "accepted"), sql`${proposals.acceptanceEvidence} is not null`));
    if (!signed.length && !accepted.length)
      throw new BusinessRuleError("Closed Won requires a signed contract with signature evidence or an accepted proposal with acceptance evidence.", { rule: "won_requires_evidence" });
  }

  const closing = target.kind !== "open";
  const now = nowIso();
  const [after] = await db
    .update(opportunities)
    .set({
      stageId: target.id,
      stageEnteredAt: now,
      maxStagePosition: Math.max(opp.maxStagePosition, target.kind === "lost" ? 0 : target.position),
      closedAt: closing ? now : null,
      lostReason: target.kind === "lost" ? candidate.lostReason : opp.lostReason,
      updatedAt: now,
    })
    .where(eq(opportunities.id, id))
    .returning();
  await db.insert(activities).values({
    type: "stage_change",
    subject: `Stage: ${current.name} → ${target.name}`,
    body: target.kind === "lost" ? `Lost reason: ${candidate.lostReason}` : "",
    occurredAt: now,
    organizationId: opp.organizationId,
    opportunityId: id,
    actor,
    recordedManually: false,
    isDemo: opp.isDemo,
  });
  if (target.kind === "won") await db.update(organizations).set({ lifecycle: "client", updatedAt: now }).where(eq(organizations.id, opp.organizationId));
  else if (current.kind === "open" && target.kind === "open") {
    await db.update(organizations).set({ lifecycle: "prospect" }).where(and(eq(organizations.id, opp.organizationId), eq(organizations.lifecycle, "target")));
  }
  await audit(db, actor, "opportunity.stage", "opportunity", id, { stage: current.key }, { stage: target.key });
  return after!;
}

// ───────────── Activities (manual log — never an automated send) ─────────────

export const activityInput = z.object({
  type: z.enum(ACTIVITY_TYPES).refine((t) => t !== "stage_change" && t !== "system", "reserved activity type"),
  direction: z.enum(["outbound", "inbound", "internal"]).default("internal"),
  subject: z.string().trim().min(2, "subject is required").max(300),
  body: z.string().trim().max(10000).optional().default(""),
  occurredAt: z.string().min(10).refine((v) => !Number.isNaN(Date.parse(v)), "invalid date"),
  organizationId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  opportunityId: z.string().optional().nullable(),
  isDemo: z.boolean().optional().default(false),
});

export async function logActivity(db: DB, raw: z.input<typeof activityInput>, actor: Actor = "founder") {
  const input = activityInput.parse(raw);
  let organizationId = input.organizationId ?? null;
  if (input.opportunityId) {
    const [o] = await db.select({ organizationId: opportunities.organizationId }).from(opportunities).where(eq(opportunities.id, input.opportunityId));
    if (!o) throw new BusinessRuleError("Opportunity not found.");
    organizationId = o.organizationId;
  }
  if (input.contactId) {
    const [c] = await db.select().from(contacts).where(eq(contacts.id, input.contactId));
    if (!c) throw new BusinessRuleError("Contact not found.");
    if (input.direction === "outbound" && c.doNotContact)
      throw new BusinessRuleError(`${c.fullName} is on the suppression list (do not contact). Outbound activity is blocked.`, { rule: "suppression" });
    if (input.direction === "outbound") await assertOutboundAllowed(db, c, { channel: input.type });
    organizationId = organizationId ?? c.organizationId;
    // Lead progression from real logged interactions.
    const progression: Record<string, string> = { outbound: "contacted", inbound: "engaged" };
    const next = progression[input.direction];
    const order = ["new", "researched", "contacted", "engaged", "qualified"];
    if (next && order.indexOf(c.leadStatus) > -1 && order.indexOf(c.leadStatus) < order.indexOf(next)) {
      await db.update(contacts).set({ leadStatus: next as never, updatedAt: nowIso() }).where(eq(contacts.id, c.id));
    }
  }
  const [row] = await db.insert(activities).values({ ...input, organizationId, actor, recordedManually: true }).returning();
  await audit(db, actor, "activity.log", "activity", row!.id, null, row);
  return row!;
}

export async function listActivities(db: DB, filter: { opportunityId?: string; organizationId?: string; contactId?: string }, limit = 100) {
  const cond = filter.opportunityId
    ? eq(activities.opportunityId, filter.opportunityId)
    : filter.organizationId
      ? eq(activities.organizationId, filter.organizationId)
      : filter.contactId
        ? eq(activities.contactId, filter.contactId)
        : undefined;
  return db.select().from(activities).where(cond).orderBy(desc(activities.occurredAt)).limit(limit);
}
