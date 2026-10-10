import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { freshDb } from "../helpers";
import { contacts, organizations } from "@/server/db/schema";
import { importProspects, parseCsv } from "@/server/services/importer";

const base = path.resolve(process.cwd(), "../../praxia/equipos/E2-revenue/2026-10-09-PRX-0012-prospeccion-sectorial");
const rows = fs.readdirSync(base).filter((d) => /^0[1-6]-/.test(d)).flatMap((d) =>
  fs.readdirSync(path.join(base, d)).filter((f) => f.startsWith("base-") && f.endsWith(".csv")).flatMap((f) => parseCsv(fs.readFileSync(path.join(base, d, f), "utf8"))),
);

describe("prospect import (PRX-0012 → CRM)", () => {
  it("parses quoted CSV fields", () => {
    expect(parseCsv('a,b\n"x, y","say ""hi"""\n')).toEqual([{ a: "x, y", b: 'say "hi"' }]);
  });

  it("imports every research base once, without emails, unassessed lawful basis and provenance", async () => {
    const db = await freshDb();
    expect(rows.length).toBeGreaterThan(100);
    const r = await importProspects(db, rows, { source: "research:PRX-0012", ownerAgentId: "SAL-02" });
    const orgs = await db.select().from(organizations);
    const people = await db.select().from(contacts);
    expect(orgs.length).toBe(r.organizationsCreated);
    // Pinned (QA-01): 152 rows → 116 organizations (Rappi merged once "[verificar]" is stripped), 130 contacts, 22 skipped.
    expect(r).toMatchObject({ rows: 152, organizationsCreated: 116, contactsCreated: 130, contactsSkipped: 22 });
    expect(orgs.some((o) => /\[/.test(o.website ?? "") || /\[/.test(o.domain ?? ""))).toBe(false);
    expect(people.every((c) => c.retainUntil !== null)).toBe(true);
    // C7: the research's "Interés legítimo" label stays a note, never the lawful basis.
    expect(people.some((c) => /Lawful basis \(research\)/.test(c.notes))).toBe(true);
    expect(people.length).toBe(r.contactsCreated);
    expect(people.every((c) => c.email === null && c.lawfulBasis === "not_assessed" && c.emailStatus === "unknown" && !c.doNotContact)).toBe(true);
    expect(orgs.every((o) => o.source === "research:PRX-0012" && !o.isDemo)).toBe(true);
    expect(orgs.some((o) => o.fitScore === 5)).toBe(true);
    const again = await importProspects(db, rows, { source: "research:PRX-0012" });
    expect(again.organizationsCreated).toBe(0);
    expect(again.contactsCreated).toBe(0);
    expect((await db.select().from(organizations)).length).toBe(orgs.length);
  });
});
