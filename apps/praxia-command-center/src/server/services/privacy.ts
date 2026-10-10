/**
 * Privacy controls for prospect data (RISK-01, PRX-0013):
 *   C1 outbound blockers · C2 assessment/notice/opt-out fields · C3 hashed suppression list ·
 *   C4 ARCO access and erasure · C5 retention review · C6 founder-only changes to basis and suppression.
 * Requires a lawyer's review in the applicable jurisdiction before any real contact (LFPDPPP and others).
 */
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import type { DB } from "../db/client";
import { activities, approvals, auditLog, companySettings, contacts, organizations, suppressions } from "../db/schema";
import { audit, BusinessRuleError, nowIso, type Actor } from "./common";

const enc = new TextEncoder();
export async function sha256Hex(value: string): Promise<string> {
  const buf = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(value));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
export const personKey = (fullName: string, org: string) => `${fold(fullName)}|${fold(org)}`;
const domainOfEmail = (e: string) => e.split("@")[1]?.toLowerCase() ?? "";

export async function suppressionHashes(input: { email?: string | null; domain?: string | null; fullName?: string; org?: string | null }) {
  const out: { kind: "email" | "domain" | "person"; valueHash: string }[] = [];
  if (input.email) out.push({ kind: "email", valueHash: await sha256Hex(input.email.trim().toLowerCase()) }, { kind: "domain", valueHash: await sha256Hex(domainOfEmail(input.email)) });
  if (input.domain) out.push({ kind: "domain", valueHash: await sha256Hex(input.domain.toLowerCase()) });
  if (input.fullName && input.org) out.push({ kind: "person", valueHash: await sha256Hex(personKey(input.fullName, input.org)) });
  return out;
}

export async function isSuppressed(db: DB, input: Parameters<typeof suppressionHashes>[0]) {
  const hs = await suppressionHashes(input);
  if (!hs.length) return false;
  const rows = await db.select({ kind: suppressions.kind, h: suppressions.valueHash }).from(suppressions).where(inArray(suppressions.valueHash, hs.map((h) => h.valueHash)));
  return rows.some((r) => hs.some((h) => h.kind === r.kind && h.valueHash === r.h));
}

/** Adds entries to the suppression list (anyone may suppress; only the founder may remove). */
export async function suppress(db: DB, input: Parameters<typeof suppressionHashes>[0], reason: string, actor: Actor) {
  const hs = await suppressionHashes(input);
  for (const h of hs) await db.insert(suppressions).values({ ...h, reason, createdBy: actor }).onConflictDoNothing();
  await audit(db, actor, "suppression.add", "suppression", hs.map((h) => h.kind).join("+") || "none", null, { kinds: hs.map((h) => h.kind), reason });
  return hs.length;
}

export async function removeSuppression(db: DB, id: string, actor: Actor) {
  if (actor !== "founder") throw new BusinessRuleError("Only the founder can remove a suppression (RISK-01 C6).");
  const [s] = await db.select().from(suppressions).where(eq(suppressions.id, id));
  if (!s) throw new BusinessRuleError("Suppression not found.");
  await db.delete(suppressions).where(eq(suppressions.id, id));
  await audit(db, actor, "suppression.remove", "suppression", id, { kind: s.kind }, null);
}

type ContactRow = typeof contacts.$inferSelect;

/**
 * C1: why outbound contact is not allowed for this person right now (empty = allowed).
 * `forSending` adds the conditions for a new message: a privacy notice in force and, for email, a verified address.
 */
export async function outboundBlockers(db: DB, c: ContactRow, opts: { channel?: string; forSending?: boolean } = {}): Promise<string[]> {
  if (c.isDemo) return c.doNotContact ? ["Do not contact."] : [];
  const out: string[] = [];
  if (c.doNotContact) out.push("On the do-not-contact list.");
  if (c.optOutAt) out.push(`Opted out on ${c.optOutAt.slice(0, 10)}.`);
  const [org] = c.organizationId ? await db.select({ name: organizations.name, domain: organizations.domain }).from(organizations).where(eq(organizations.id, c.organizationId)) : [];
  if (await isSuppressed(db, { email: c.email, domain: org?.domain, fullName: c.fullName, org: org?.name })) out.push("On the suppression list.");
  if (c.lawfulBasis === "not_assessed") out.push("Lawful basis not assessed — record it first (only you can).");
  if (opts.forSending) {
    const [s] = await db.select({ v: companySettings.privacyNoticeVersion }).from(companySettings).where(eq(companySettings.id, 1));
    if (!s?.v) out.push("No privacy notice on record — add its version and link in Settings (RISK-01 C1).");
    if (opts.channel === "email" && c.emailStatus !== "valid") out.push("Email not verified — email outreach needs a verified address.");
  }
  return out;
}

export async function assertOutboundAllowed(db: DB, c: ContactRow, opts: { channel?: string; forSending?: boolean } = {}) {
  const b = await outboundBlockers(db, c, opts);
  if (b.length) throw new BusinessRuleError(`Outbound to ${c.fullName} is blocked: ${b.join(" ")}`, { rule: "privacy", blockers: b });
}

/** C6: lawful basis, do-not-contact removal and opt-out removal are founder-only; assessment is stamped. */
export function guardContactPatch(before: ContactRow, patch: Record<string, unknown>, actor: Actor): Record<string, unknown> {
  const basisChanged = "lawfulBasis" in patch && patch.lawfulBasis !== before.lawfulBasis;
  const unsuppress = ("doNotContact" in patch && before.doNotContact && patch.doNotContact === false) || ("optOutAt" in patch && before.optOutAt && !patch.optOutAt);
  if ((basisChanged || unsuppress) && actor !== "founder") throw new BusinessRuleError("Only the founder can change the lawful basis or lift a suppression (RISK-01 C6).");
  if (basisChanged) return { ...patch, basisAssessedBy: actor, basisAssessedAt: patch.lawfulBasis === "not_assessed" ? null : nowIso() };
  return patch;
}

/** C2: the person asked not to be contacted. Sets do-not-contact and suppresses email and person key. */
export async function recordOptOut(db: DB, contactId: string, channel: string, actor: Actor) {
  const [c] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!c) throw new BusinessRuleError("Contact not found.");
  const [org] = c.organizationId ? await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, c.organizationId)) : [];
  await db.update(contacts).set({ optOutAt: nowIso(), optOutChannel: channel, doNotContact: true, updatedAt: nowIso() }).where(eq(contacts.id, contactId));
  await suppress(db, { email: c.email, fullName: c.fullName, org: org?.name }, `opt-out via ${channel}`, actor);
  await audit(db, actor, "contact.opt_out", "contact", contactId, null, { channel });
}

/** C4 (access): everything PRAXIA holds about a person, for an ARCO request. */
export async function exportContactData(db: DB, contactId: string) {
  const [c] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!c) throw new BusinessRuleError("Contact not found.");
  const [org] = c.organizationId ? await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, c.organizationId)) : [];
  const acts = await db.select({ type: activities.type, direction: activities.direction, subject: activities.subject, occurredAt: activities.occurredAt }).from(activities).where(eq(activities.contactId, contactId));
  const msgs = (await db.select({ title: approvals.title, status: approvals.status, meta: approvals.meta, createdAt: approvals.createdAt }).from(approvals).where(eq(approvals.kind, "outbound_message")))
    .filter((a) => (a.meta as { contactId?: string } | null)?.contactId === contactId)
    .map((a) => ({ title: a.title, status: a.status, createdAt: a.createdAt, draft: (a.meta as { draft?: string }).draft ?? null }));
  const { id: _id, ...data } = c;
  return { exportedAt: nowIso(), controller: "PRAXIA", organization: org?.name ?? null, personalData: data, interactions: acts, messages: msgs };
}

/**
 * C4 (cancellation): erases the person. Interactions keep their business date and type but lose the person's data;
 * drafts and audit entries about them are redacted; the person is suppressed so a re-import cannot bring them back.
 */
export async function eraseContact(db: DB, contactId: string, reason: string, actor: Actor) {
  if (actor !== "founder") throw new BusinessRuleError("Only the founder can erase a person's data.");
  if (!reason.trim()) throw new BusinessRuleError("Record the reason (e.g. ARCO request, retention).");
  const [c] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!c) throw new BusinessRuleError("Contact not found.");
  const [org] = c.organizationId ? await db.select({ name: organizations.name }).from(organizations).where(eq(organizations.id, c.organizationId)) : [];
  await suppress(db, { email: c.email, fullName: c.fullName, org: org?.name }, `erased: ${reason}`, actor);
  await db.update(activities).set({ contactId: null, subject: "[erased]", body: "" }).where(eq(activities.contactId, contactId));
  for (const a of await db.select().from(approvals).where(eq(approvals.kind, "outbound_message"))) {
    const m = (a.meta ?? {}) as Record<string, unknown>;
    if (m.contactId === contactId) await db.update(approvals).set({ title: "1:1 draft [erased]", detail: "", meta: { erased: true, organizationId: m.organizationId ?? null, sentAt: m.sentAt ?? null } }).where(eq(approvals.id, a.id));
  }
  await db.update(auditLog).set({ before: { redacted: true }, after: { redacted: true } }).where(and(eq(auditLog.entityType, "contact"), eq(auditLog.entityId, contactId)));
  await db.delete(contacts).where(eq(contacts.id, contactId));
  await audit(db, actor, "contact.erase", "contact", contactId, null, { reason });
}

/** C5: researched contacts with no interaction whose retention date has passed — for the founder to review and erase. */
export async function retentionCandidates(db: DB, today: string) {
  const rows = await db.select({ c: contacts }).from(contacts).where(and(eq(contacts.isDemo, false), inArray(contacts.leadStatus, ["new", "researched"]), lt(contacts.retainUntil, today)));
  const withActs = new Set((await db.select({ id: activities.contactId }).from(activities)).map((r) => r.id));
  return rows.map((r) => r.c).filter((c) => !withActs.has(c.id));
}

export async function setPrivacyNotice(db: DB, input: { version: string; url: string }, actor: Actor) {
  if (actor !== "founder") throw new BusinessRuleError("Only the founder records the privacy notice.");
  const version = input.version.trim();
  const url = input.url.trim();
  if (version.length < 1 || !/^https?:\/\//.test(url)) throw new BusinessRuleError("Give the notice version and a link (https://…).");
  await db.update(companySettings).set({ privacyNoticeVersion: version, privacyNoticeUrl: url, updatedAt: nowIso() }).where(eq(companySettings.id, 1));
  await audit(db, actor, "settings.privacy_notice", "settings", "1", null, { version, url });
}

/** Retention date for newly researched contacts (C5 proposal: 12 months without interaction). */
export const retentionDate = (from = new Date()) => new Date(from.getTime() + 365 * 86_400_000).toISOString().slice(0, 10);
