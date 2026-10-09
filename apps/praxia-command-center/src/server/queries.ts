import "server-only";
import { asc, eq } from "drizzle-orm";
import type { DB } from "./db/client";
import { agents, contacts, organizations, services } from "./db/schema";
import { demoFilter } from "./services/common";

/** Option lists used by CRM forms. */
export async function crmOptions(db: DB, includeDemo: boolean) {
  const [orgs, people, svcs, ags] = await Promise.all([
    db.select({ id: organizations.id, name: organizations.name, isDemo: organizations.isDemo }).from(organizations).where(demoFilter(organizations.isDemo, includeDemo)).orderBy(asc(organizations.name)),
    db.select({ id: contacts.id, fullName: contacts.fullName, title: contacts.title, organizationId: contacts.organizationId }).from(contacts).where(demoFilter(contacts.isDemo, includeDemo)).orderBy(asc(contacts.fullName)),
    db.select({ id: services.id, code: services.code, name: services.name }).from(services).where(eq(services.active, true)).orderBy(asc(services.code)),
    db.select({ id: agents.id, role: agents.role }).from(agents).orderBy(asc(agents.id)),
  ]);
  return {
    organizations: orgs.map((o) => ({ id: o.id, label: o.isDemo ? `${o.name}` : o.name })),
    contacts: people.map((c) => ({ id: c.id, label: c.title ? `${c.fullName} — ${c.title}` : c.fullName, organizationId: c.organizationId })),
    services: svcs.map((s) => ({ id: s.id, label: `${s.code} · ${s.name}` })),
    agents: ags.map((a) => ({ id: a.id, label: `${a.id} · ${a.role}` })),
  };
}
