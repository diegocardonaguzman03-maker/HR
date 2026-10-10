import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import { activities, auditLog, contacts, suppressions } from "@/server/db/schema";
import { freshDb } from "../helpers";
import { createContact, createOrganization, logActivity, updateContact } from "@/server/services/crm";
import { importProspects } from "@/server/services/importer";
import { eraseContact, exportContactData, isSuppressed, outboundBlockers, recordOptOut, retentionCandidates, setPrivacyNotice } from "@/server/services/privacy";

let db: DB;
beforeEach(async () => { db = await freshDb(); });

async function person(name = "Ana Pérez", email: string | undefined = "ana@acme.example") {
  const o = await createOrganization(db, { name: "Acme", domain: "acme.example" });
  const c = await createContact(db, { organizationId: o.id, fullName: name, email, title: "CHRO" });
  return { o, c };
}

describe("privacy controls (RISK-01 C1–C7)", () => {
  it("C1: lists every reason outbound is blocked, including notice and email verification for sending", async () => {
    const { c } = await person();
    let b = await outboundBlockers(db, c, { forSending: true, channel: "email" });
    expect(b.join(" ")).toMatch(/Lawful basis not assessed/);
    expect(b.join(" ")).toMatch(/No privacy notice/);
    expect(b.join(" ")).toMatch(/Email not verified/);
    const ok = await updateContact(db, c.id, { lawfulBasis: "legitimate_interest", emailStatus: "valid" });
    await setPrivacyNotice(db, { version: "1.0", url: "https://praxia.example/privacidad" }, "founder");
    b = await outboundBlockers(db, ok, { forSending: true, channel: "email" });
    expect(b).toEqual([]);
  });

  it("C3/C2: an opt-out suppresses the person by hash (no clear values stored) and blocks outbound", async () => {
    const { c } = await person();
    await updateContact(db, c.id, { lawfulBasis: "existing_relationship" });
    await recordOptOut(db, c.id, "email", "founder");
    const rows = await db.select().from(suppressions);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows.every((r) => /^[0-9a-f]{64}$/.test(r.valueHash) && !r.valueHash.includes("acme"))).toBe(true);
    expect(await isSuppressed(db, { email: "ANA@acme.example" })).toBe(true);
    await expect(logActivity(db, { type: "email", direction: "outbound", subject: "Hi", occurredAt: new Date().toISOString(), contactId: c.id })).rejects.toThrow(/suppression|Opted out|do-not-contact/);
    await expect(updateContact(db, c.id, { doNotContact: false }, "engine:test")).rejects.toThrow(/Only the founder/);
  });

  it("C4: exports the person's data and erases it, redacting audit and blocking re-import", async () => {
    const { c } = await person("Ángel Ruiz");
    await updateContact(db, c.id, { lawfulBasis: "existing_relationship" });
    await logActivity(db, { type: "linkedin", direction: "outbound", subject: "Intro to Ángel", occurredAt: new Date().toISOString(), contactId: c.id });
    const exp = await exportContactData(db, c.id);
    expect(exp.personalData.fullName).toBe("Ángel Ruiz");
    expect(exp.interactions).toHaveLength(1);
    await expect(eraseContact(db, c.id, "ARCO", "engine:test")).rejects.toThrow(/Only the founder/);
    await eraseContact(db, c.id, "ARCO request 2026-10-10", "founder");
    expect(await db.select().from(contacts).where(eq(contacts.id, c.id))).toHaveLength(0);
    const [act] = await db.select().from(activities);
    expect(act).toMatchObject({ contactId: null, subject: "[erased]" });
    const trail = await db.select().from(auditLog).where(eq(auditLog.entityId, c.id));
    expect(trail.filter((t) => t.action !== "contact.erase").every((t) => JSON.stringify(t.after) === '{"redacted":true}')).toBe(true);
    expect(JSON.stringify(trail)).not.toContain("Ángel");
    const r = await importProspects(db, [{ empresa: "Acme", dominio: "acme.example", contacto_nombre: "angel ruiz", contacto_cargo: "CHRO" }], { source: "research:test" });
    expect(r.contactsCreated).toBe(0);
  });

  it("C5: researched contacts past their retention date with no interaction are listed for review", async () => {
    const o = await createOrganization(db, { name: "Old Co" });
    await createContact(db, { organizationId: o.id, fullName: "Old Lead", leadStatus: "researched", retainUntil: "2026-01-01" });
    await createContact(db, { organizationId: o.id, fullName: "Fresh Lead", leadStatus: "researched", retainUntil: "2027-10-10" });
    expect((await retentionCandidates(db, "2026-10-10")).map((c) => c.fullName)).toEqual(["Old Lead"]);
  });

  it("only the founder records the privacy notice, with a link", async () => {
    await expect(setPrivacyNotice(db, { version: "1", url: "https://x.example" }, "engine:test")).rejects.toThrow(/Only the founder/);
    await expect(setPrivacyNotice(db, { version: "1", url: "not a link" }, "founder")).rejects.toThrow(/link/);
  });
});
