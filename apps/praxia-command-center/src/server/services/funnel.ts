/**
 * Conversion funnel, contact-policy gate (D-P07) and the founder's outreach actions.
 * Nothing here sends a message: approved drafts are sent by the founder and then recorded with markOutreachSent.
 */
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import type { DB } from "../db/client";
import { activities, agentTasks, approvals, companySettings, contacts, engineRuns, opportunities, organizations, pipelineStages, proposals } from "../db/schema";
import { audit, BusinessRuleError, demoFilter, nowIso, type Actor } from "./common";
import { logActivity } from "./crm";
import { assertOutboundAllowed, outboundBlockers, retentionDate } from "./privacy";
import { computeFunnel, type OutreachGate } from "@/domain/funnel";

export const CONTACT_POLICY_KEY = "D-P07";

type GateMeta = { key?: string; gate?: Record<string, { cap: number | null }> };

/** D-P07 decides whether anyone may be contacted. Until the founder chooses an option that opens it, nothing is drafted. */
export async function outreachGate(db: DB): Promise<OutreachGate> {
  const rows = await db.select().from(approvals).where(and(eq(approvals.kind, "founder_decision"), eq(approvals.isDemo, false))).orderBy(desc(approvals.createdAt));
  const d = rows.find((r) => (r.meta as GateMeta | null)?.key === CONTACT_POLICY_KEY);
  const used = (await db.select({ id: approvals.id }).from(approvals).where(and(eq(approvals.kind, "outbound_message"), eq(approvals.isDemo, false), inArray(approvals.status, ["pending", "approved"])))).length;
  if (!d) return { open: false, reason: "D-P07 (contact policy) is not on record — load the PRX-0013 decisions in Approvals.", cap: 0, used };
  if (d.status === "pending") return { open: false, reason: "Waiting for your decision on D-P07 (contact policy) in Approvals.", cap: 0, used };
  if (d.status === "rejected") return { open: false, reason: "D-P07 was deferred — no contact until you decide it.", cap: 0, used };
  const rule = d.choice ? (d.meta as GateMeta | null)?.gate?.[d.choice] : undefined;
  if (!rule) return { open: false, reason: `D-P07 = ${d.choice}: contact stays frozen.`, cap: 0, used };
  if (rule.cap !== null && used >= rule.cap) return { open: false, reason: `D-P07 = ${d.choice}: pilot cap of ${rule.cap} contacts reached.`, cap: rule.cap, used };
  return { open: true, reason: `D-P07 = ${d.choice}${rule.cap !== null ? ` · pilot ${used}/${rule.cap} contacts` : ""}`, cap: rule.cap, used };
}

export async function loadFunnel(db: DB, includeDemo: boolean) {
  const gate = await outreachGate(db);
  const orgs = await db.select({ id: organizations.id, name: organizations.name, fitScore: organizations.fitScore, lifecycle: organizations.lifecycle }).from(organizations).where(demoFilter(organizations.isDemo, includeDemo));
  const cs = await db.select({ id: contacts.id, organizationId: contacts.organizationId, lawfulBasis: contacts.lawfulBasis, doNotContact: contacts.doNotContact, leadStatus: contacts.leadStatus, optOutAt: contacts.optOutAt }).from(contacts).where(demoFilter(contacts.isDemo, includeDemo));
  const acts = await db.select({ organizationId: activities.organizationId, contactId: activities.contactId, type: activities.type, direction: activities.direction }).from(activities).where(demoFilter(activities.isDemo, includeDemo));
  const opps = await db.select({ organizationId: opportunities.organizationId, stageKind: pipelineStages.kind }).from(opportunities).innerJoin(pipelineStages, eq(opportunities.stageId, pipelineStages.id)).where(demoFilter(opportunities.isDemo, includeDemo));
  const props = await db.select({ organizationId: opportunities.organizationId, status: proposals.status }).from(proposals).innerJoin(opportunities, eq(proposals.opportunityId, opportunities.id)).where(demoFilter(proposals.isDemo, includeDemo));
  const appr = await db.select({ kind: approvals.kind, status: approvals.status, meta: approvals.meta }).from(approvals).where(and(eq(approvals.kind, "outbound_message"), demoFilter(approvals.isDemo, includeDemo)));
  const funnel = computeFunnel({
    orgs, contacts: cs, activities: acts, opportunities: opps as never, proposals: props, gate,
    approvals: appr.map((a) => ({ kind: a.kind, status: a.status, organizationId: ((a.meta as { organizationId?: string } | null)?.organizationId) ?? null })),
  });
  return { funnel, gate };
}

/** Progress analytics for the dashboard: agent throughput, approvals and engine spend. */
export async function loadProgress(db: DB, includeDemo: boolean, today: string) {
  const since = new Date(Date.parse(today) - 13 * 86_400_000).toISOString().slice(0, 10);
  const tasks = await db.select({ status: agentTasks.status, agentId: agentTasks.agentId, completedAt: agentTasks.completedAt, cost: agentTasks.costUsdMicros }).from(agentTasks);
  const days = Array.from({ length: 14 }, (_, i) => new Date(Date.parse(since) + i * 86_400_000).toISOString().slice(0, 10));
  const completedByDay = days.map((d) => ({ day: d, count: tasks.filter((t) => t.status === "completed" && t.completedAt?.slice(0, 10) === d).length }));
  const count = (s: string) => tasks.filter((t) => t.status === s).length;
  const ap = await db.select({ status: approvals.status, kind: approvals.kind, createdAt: approvals.createdAt, decidedAt: approvals.decidedAt }).from(approvals).where(demoFilter(approvals.isDemo, includeDemo));
  const pending = ap.filter((a) => a.status === "pending");
  const decided7 = ap.filter((a) => a.decidedAt && a.decidedAt.slice(0, 10) >= new Date(Date.parse(today) - 6 * 86_400_000).toISOString().slice(0, 10));
  const hours = decided7.map((a) => (Date.parse(a.decidedAt!) - Date.parse(a.createdAt)) / 3_600_000).filter((h) => h >= 0).sort((x, y) => x - y);
  const runs = await db.select().from(engineRuns).where(gte(engineRuns.startedAt, since)).orderBy(desc(engineRuns.startedAt));
  return {
    completedByDay,
    tasks: { queued: count("queued"), working: count("working"), waitingApproval: count("waiting_approval"), error: count("error"), completed: count("completed") },
    approvals: {
      pending: pending.length,
      pendingByKind: Object.fromEntries(["founder_decision", "outbound_message", "agent_output", "proposal_pricing"].map((k) => [k, pending.filter((a) => a.kind === k).length])),
      oldestPending: pending.map((a) => a.createdAt).sort()[0] ?? null,
      decidedLast7: decided7.length,
      medianHoursToDecide: hours.length ? hours[Math.floor(hours.length / 2)]! : null,
    },
    engine: { runs: runs.slice(0, 10), costLast14: runs.reduce((s, r) => s + r.costUsdMicros, 0), tasksLast14: runs.reduce((s, r) => s + r.tasksRun, 0) },
  };
}

/**
 * Founder clears a contact for the D-P07 pilot: records the assessed lawful basis, who assessed it, when, and where the
 * person resides (RISK-01 C2). A capped pilot (D-P07 = B) is limited to people residing in Mexico.
 */
export async function clearContactForPilot(db: DB, contactId: string, actor: Actor = "founder", residenceCountry = "MX") {
  if (actor !== "founder") throw new BusinessRuleError("Only the founder can clear a contact for outreach.");
  const gate = await outreachGate(db);
  if (!gate.open) throw new BusinessRuleError(gate.reason);
  const country = residenceCountry.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new BusinessRuleError("Country of residence as a 2-letter ISO code (e.g. MX).");
  if (gate.cap !== null && country !== "MX") throw new BusinessRuleError("The D-P07 pilot is limited to people residing in Mexico (RISK-01).");
  const [c] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!c) throw new BusinessRuleError("Contact not found.");
  const blockers = (await outboundBlockers(db, c)).filter((b) => !b.startsWith("Lawful basis"));
  if (blockers.length) throw new BusinessRuleError(blockers.join(" "));
  if (c.lawfulBasis !== "not_assessed") return c;
  const now = nowIso();
  const note = `Cleared for the D-P07 pilot by the founder on ${now.slice(0, 10)} (legitimate interest, 1:1, B2B role, resides in ${country}). Check RISK-01's pilot conditions before sending.`;
  const [after] = await db.update(contacts).set({ lawfulBasis: "legitimate_interest", basisAssessedBy: actor, basisAssessedAt: now, residenceCountry: country, retainUntil: c.retainUntil ?? retentionDate(), notes: c.notes ? `${c.notes}\n${note}` : note, updatedAt: now }).where(eq(contacts.id, contactId)).returning();
  await audit(db, actor, "contact.clear_for_pilot", "contact", contactId, { lawfulBasis: c.lawfulBasis }, { lawfulBasis: "legitimate_interest", residenceCountry: country });
  return after!;
}

export const sentInput = z.object({ sentOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), channel: z.enum(["linkedin", "email", "call"]) });

/** The founder sent an approved draft himself; this records it (activity + lead status). The system sends nothing. */
export async function markOutreachSent(db: DB, approvalId: string, raw: z.input<typeof sentInput>, actor: Actor = "founder") {
  if (actor !== "founder") throw new BusinessRuleError("Only the founder records a sent message.");
  const { sentOn, channel } = sentInput.parse(raw);
  const [a] = await db.select().from(approvals).where(eq(approvals.id, approvalId));
  if (!a || a.kind !== "outbound_message") throw new BusinessRuleError("Outreach approval not found.");
  if (a.status !== "approved") throw new BusinessRuleError("Approve the draft before recording it as sent.");
  const meta = (a.meta ?? {}) as { contactId?: string; organizationId?: string; draft?: string; sentAt?: string };
  if (meta.sentAt) throw new BusinessRuleError(`Already recorded as sent on ${meta.sentAt}.`);
  const [c] = meta.contactId ? await db.select().from(contacts).where(eq(contacts.id, meta.contactId)) : [];
  if (!c) throw new BusinessRuleError("The contact no longer exists.");
  await assertOutboundAllowed(db, c, { channel, forSending: true });
  const [settings] = await db.select({ v: companySettings.privacyNoticeVersion }).from(companySettings).where(eq(companySettings.id, 1));
  await logActivity(db, { type: channel, direction: "outbound", subject: `1:1 message sent (approved draft)`, body: meta.draft ?? a.detail, occurredAt: `${sentOn}T12:00:00.000Z`, organizationId: meta.organizationId ?? null, contactId: meta.contactId ?? null }, actor);
  await db.update(contacts).set({ privacyNoticeVersion: settings!.v, privacyNoticeDeliveredAt: `${sentOn}T12:00:00.000Z`, updatedAt: nowIso() }).where(eq(contacts.id, c.id));
  await db.update(approvals).set({ meta: { ...meta, sentAt: sentOn, channel } }).where(eq(approvals.id, approvalId));
  await audit(db, actor, "outreach.sent", "contact", meta.contactId ?? a.entityId, null, { approvalId, sentOn, channel });
}
