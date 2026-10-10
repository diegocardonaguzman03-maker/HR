/**
 * Prospect import: the sector research bases (PRX-0012, `base-*.csv`) into the CRM.
 *
 * Rules (RISK-01 / D-P07): nothing is contacted; emails from the research are patterns, never addresses, so no
 * email is stored; lawful basis stays "not_assessed" until RISK-01 validates it; provenance (source + date) is kept
 * on every record. Organizations are de-duplicated by domain and name, contacts by name within the organization,
 * so re-running the import never creates duplicates.
 */
import { eq } from "drizzle-orm";
import type { DB } from "../db/client";
import { contacts, organizations } from "../db/schema";
import { createContact, createOrganization, findDuplicateOrganization } from "./crm";
import { audit, nowIso, type Actor } from "./common";
import { isSuppressed, retentionDate } from "./privacy";

export type ProspectRow = Record<string, string>;

/** RFC 4180 CSV (quoted fields, escaped quotes, newlines inside quotes) → rows keyed by header. */
export function parseCsv(text: string): ProspectRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c !== "")) rows.push(row);
  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

const isPending = (v: string | undefined) => !v || /^\[?PENDIENTE|^\[patr[oó]n|^—$|^-$/i.test(v.trim());
/** Research annotations such as "[verificar]" or "[PENDIENTE …]" are stripped from structured fields (QA-01). */
const stripNotes = (v: string | undefined) => (v ?? "").replace(/\[[^\]]*\]/g, "").trim();
const url = (v: string | undefined) => { const u = stripNotes(v); return /^https?:\/\/\S+$/i.test(u) ? u : null; };
const domainOf = (v: string | undefined) => {
  const d = stripNotes(v).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  return d && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) ? d : null;
};
const isoDate = (v: string | undefined) => (v && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);
/** "04 Servicios financieros y fintech" → "Servicios financieros y fintech". */
const sectorName = (v: string | undefined) => (v ?? "").replace(/^\d+\s*/, "").trim() || null;
const clip = (v: string, n: number) => (v.length > n ? `${v.slice(0, n - 1)}…` : v);

export type ImportResult = { organizationsCreated: number; organizationsMatched: number; contactsCreated: number; contactsSkipped: number; rows: number };

export async function importProspects(db: DB, rows: ProspectRow[], opts: { source: string; actor?: Actor; ownerAgentId?: string } ): Promise<ImportResult> {
  const actor = opts.actor ?? "founder";
  const res: ImportResult = { organizationsCreated: 0, organizationsMatched: 0, contactsCreated: 0, contactsSkipped: 0, rows: rows.length };
  const seenOrg = new Set<string>();
  for (const r of rows) {
    const name = (r.empresa ?? "").trim();
    if (name.length < 2) { res.contactsSkipped++; continue; }
    const domain = domainOf(r.dominio) ?? domainOf(r.sitio_web);
    const retrieved = isoDate(r.fecha_consulta_contacto) ?? isoDate(r.fecha_fuente);
    let orgId: string;
    const dup = await findDuplicateOrganization(db, name, domain);
    if (dup) {
      orgId = dup.id;
      if (!seenOrg.has(orgId)) res.organizationsMatched++;
    } else {
      const notes = [
        r.trigger_detectado && `Trigger: ${r.trigger_detectado}`,
        r.fuente_trigger_url && `Trigger source: ${r.fuente_trigger_url}`,
        r.justificacion_fit && `ICP fit: ${r.justificacion_fit}`,
        r.servicio_praxia_sugerido && `Suggested offer: ${r.servicio_praxia_sugerido}`,
        r.prioridad && `Priority: ${r.prioridad}`,
        r.presencia_mx_latam && `Presence: ${r.presencia_mx_latam}`,
        r.notas && `Research notes: ${r.notas}`,
      ].filter(Boolean).join("\n");
      const org = await createOrganization(db, {
        name, domain: domain ?? undefined, website: url(r.sitio_web) ?? undefined, industry: sectorName(r.sector) ?? undefined, country: r.pais_sede || undefined,
        sizeBand: r.tamano_aprox ? clip(r.tamano_aprox, 120) : undefined, linkedinUrl: url(r.linkedin_empresa) ?? undefined,
        notes: clip(notes, 5000), source: opts.source, sourceRetrievedAt: retrieved,
      }, actor);
      const fit = Number(r.fit_icp_1a5);
      await db.update(organizations).set({ fitScore: Number.isInteger(fit) && fit >= 1 && fit <= 5 ? fit : null, updatedAt: nowIso() }).where(eq(organizations.id, org.id));
      orgId = org.id;
      res.organizationsCreated++;
    }
    seenOrg.add(orgId);

    const person = (r.contacto_nombre ?? "").trim();
    if (isPending(person) || person.length < 2) { res.contactsSkipped++; continue; }
    // Erased or opted-out people never come back through a re-import (RISK-01 C3/C4).
    if (await isSuppressed(db, { fullName: person, org: (await db.select({ n: organizations.name }).from(organizations).where(eq(organizations.id, orgId)))[0]?.n })) { res.contactsSkipped++; continue; }
    // Compared in JS: SQLite's lower() only folds ASCII, so "Ángel" would never match itself.
    const known = await db.select({ fullName: contacts.fullName }).from(contacts).where(eq(contacts.organizationId, orgId));
    if (known.some((c) => c.fullName.trim().toLocaleLowerCase() === person.toLocaleLowerCase())) { res.contactsSkipped++; continue; }
    await createContact(db, {
      organizationId: orgId, fullName: person, title: r.contacto_cargo || undefined,
      email: undefined, // research holds only an unknown pattern — never stored as an address
      emailStatus: "unknown", linkedinUrl: url(r.contacto_linkedin_url) ?? undefined, source: clip(`${opts.source}${r.fuente_contacto_url ? ` · ${r.fuente_contacto_url}` : ""}`, 200),
      lawfulBasis: "not_assessed", leadStatus: "researched", ownerAgentId: opts.ownerAgentId ?? null, retainUntil: retentionDate(),
      notes: clip([r.base_legal && `Lawful basis (research): ${r.base_legal}`, r.estado_email && `Email: ${r.estado_email}`].filter(Boolean).join("\n"), 5000),
    }, actor);
    res.contactsCreated++;
  }
  await audit(db, actor, "crm.import", "organization", opts.source, null, res);
  return res;
}
