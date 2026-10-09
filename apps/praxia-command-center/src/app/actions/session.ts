"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, createSessionToken, passwordMatches, SESSION_COOKIE, sessionMaxAge } from "@/server/auth";
import { DEMO_COOKIE } from "@/server/context";
import { requireFounder } from "@/server/session";
import { getDb } from "@/server/db/client";
import { audit } from "@/server/services/common";
import { contacts, opportunities, organizations } from "@/server/db/schema";
import { like, or } from "drizzle-orm";

const failures = new Map<string, { n: number; until: number }>();

export async function login(_: unknown, form: FormData): Promise<{ error?: string }> {
  const cfg = authConfig();
  if (!cfg.configured) return { error: `Authentication is not configured: ${cfg.reason}` };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const f = failures.get(ip);
  if (f && f.n >= 5 && f.until > Date.now()) return { error: "Too many attempts. Try again in 15 minutes." };
  const ok = await passwordMatches(String(form.get("password") ?? ""), cfg.password, cfg.secret);
  if (!ok) {
    const cur = f && f.until > Date.now() ? f : { n: 0, until: 0 };
    failures.set(ip, { n: cur.n + 1, until: Date.now() + 15 * 60_000 });
    await audit(await getDb(), "anonymous", "auth.failed", "session", ip);
    return { error: "Incorrect password." };
  }
  failures.delete(ip);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(cfg.secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.PRAXIA_INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: sessionMaxAge,
  });
  await audit(await getDb(), "founder", "auth.login", "session", ip);
  const next = String(form.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function setDemoMode(on: boolean) {
  await requireFounder();
  const c = await cookies();
  if (on) c.set(DEMO_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/" });
  else c.delete(DEMO_COOKIE);
  await audit(await getDb(), "founder", on ? "demo.on" : "demo.off", "session", "demo");
}

export type SearchHit = { type: "organization" | "contact" | "opportunity"; id: string; label: string; sub: string; href: string; isDemo: boolean };

export async function globalSearch(q: string): Promise<SearchHit[]> {
  await requireFounder();
  const term = q.trim();
  if (term.length < 2) return [];
  const db = await getDb();
  const pat = `%${term.replace(/[%_]/g, "")}%`;
  const [orgs, people, opps] = await Promise.all([
    db.select().from(organizations).where(or(like(organizations.name, pat), like(organizations.domain, pat))).limit(6),
    db.select().from(contacts).where(or(like(contacts.fullName, pat), like(contacts.email, pat), like(contacts.title, pat))).limit(6),
    db.select().from(opportunities).where(like(opportunities.title, pat)).limit(6),
  ]);
  return [
    ...orgs.map((o) => ({ type: "organization" as const, id: o.id, label: o.name, sub: [o.industry, o.country].filter(Boolean).join(" · "), href: `/crm/organizations/${o.id}`, isDemo: o.isDemo })),
    ...people.map((c) => ({ type: "contact" as const, id: c.id, label: c.fullName, sub: c.title ?? "", href: `/crm/contacts/${c.id}`, isDemo: c.isDemo })),
    ...opps.map((o) => ({ type: "opportunity" as const, id: o.id, label: o.title, sub: "Opportunity", href: `/crm/opportunities/${o.id}`, isDemo: o.isDemo })),
  ];
}
