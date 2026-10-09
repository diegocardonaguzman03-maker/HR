import { cookies } from "next/headers";
import { like, or } from "drizzle-orm";
import { getRuntime } from "../runtime";
import { nav } from "../router";
import { contacts, opportunities, organizations } from "@/server/db/schema";
import { audit } from "@/server/services/common";
import { toast } from "@/lib/ui-store";

export const DEMO_COOKIE = "praxia_demo";
export async function login() { return {}; }
export async function logout() { toast.info("Access to this page is managed by its sharing settings in claude.ai."); }
export async function setDemoMode(on: boolean) {
  const c = await cookies();
  if (on) c.set(DEMO_COOKIE, "1"); else c.delete(DEMO_COOKIE);
  await audit(getRuntime().db, "founder", on ? "demo.on" : "demo.off", "session", "demo");
  await getRuntime().flush();
  nav.refresh();
}
export type SearchHit = { type: "organization" | "contact" | "opportunity"; id: string; label: string; sub: string; href: string; isDemo: boolean };
export async function globalSearch(q: string): Promise<SearchHit[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const includeDemo = (await cookies()).get(DEMO_COOKIE)?.value === "1";
  const db = getRuntime().db;
  const pat = `%${term.replace(/[%_]/g, "")}%`;
  const [orgs, people, opps] = await Promise.all([
    db.select().from(organizations).where(or(like(organizations.name, pat), like(organizations.domain, pat))).limit(6),
    db.select().from(contacts).where(or(like(contacts.fullName, pat), like(contacts.email, pat), like(contacts.title, pat))).limit(6),
    db.select().from(opportunities).where(like(opportunities.title, pat)).limit(6),
  ]);
  const nd = <T extends { isDemo: boolean }>(r: T[]) => r.filter((x) => includeDemo || !x.isDemo);
  return [
    ...nd(orgs).map((o) => ({ type: "organization" as const, id: o.id, label: o.name, sub: [o.industry, o.country].filter(Boolean).join(" · "), href: `/crm/organizations/${o.id}`, isDemo: o.isDemo })),
    ...nd(people).map((c) => ({ type: "contact" as const, id: c.id, label: c.fullName, sub: c.title ?? "", href: `/crm/contacts/${c.id}`, isDemo: c.isDemo })),
    ...nd(opps).map((o) => ({ type: "opportunity" as const, id: o.id, label: o.title, sub: "Opportunity", href: `/crm/opportunities/${o.id}`, isDemo: o.isDemo })),
  ];
}
