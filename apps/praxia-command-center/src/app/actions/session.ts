"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, createSessionToken, passwordMatches, safeNext, SESSION_COOKIE, sessionMaxAge } from "@/server/auth";
import { DEMO_COOKIE } from "@/server/context";
import { requireFounder } from "@/server/session";
import { getDb } from "@/server/db/client";
import { audit } from "@/server/services/common";
import { contacts, opportunities, organizations } from "@/server/db/schema";
import { like, or } from "drizzle-orm";

/**
 * Brute-force protection without trusting client headers: a global failure window with exponential backoff
 * (no hard lockout, so an attacker cannot lock the founder out). In-memory per server instance; see docs/SECURITY.md.
 */
const failures = { n: 0, since: 0 };
const WINDOW_MS = 15 * 60_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(_: unknown, form: FormData): Promise<{ error?: string }> {
  const cfg = authConfig();
  if (!cfg.configured) return { error: `Authentication is not configured: ${cfg.reason}` };
  const ip = (await headers()).get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown"; // logged only, never trusted
  if (Date.now() - failures.since > WINDOW_MS) { failures.n = 0; failures.since = Date.now(); }
  if (failures.n > 0) await sleep(Math.min(250 * 2 ** Math.min(failures.n, 6), 15_000));
  const ok = await passwordMatches(String(form.get("password") ?? ""), cfg.password, cfg.secret);
  if (!ok) {
    failures.n++;
    await audit(await getDb(), "anonymous", "auth.failed", "session", ip.slice(0, 64));
    return { error: "Incorrect password." };
  }
  failures.n = 0;
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(cfg.secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.PRAXIA_INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: sessionMaxAge,
  });
  await audit(await getDb(), "founder", "auth.login", "session", ip);
  redirect(safeNext(String(form.get("next") ?? "/")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  await audit(await getDb(), "founder", "auth.logout", "session", "-");
  redirect("/login");
}

export async function setDemoMode(on: boolean) {
  await requireFounder();
  const c = await cookies();
  if (on) c.set(DEMO_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" && process.env.PRAXIA_INSECURE_COOKIES !== "1" });
  else c.delete(DEMO_COOKIE);
  await audit(await getDb(), "founder", on ? "demo.on" : "demo.off", "session", "demo");
}

export type SearchHit = { type: "organization" | "contact" | "opportunity"; id: string; label: string; sub: string; href: string; isDemo: boolean };

export async function globalSearch(q: string): Promise<SearchHit[]> {
  await requireFounder();
  const includeDemo = (await cookies()).get(DEMO_COOKIE)?.value === "1";
  const nd = <T,>(rows: (T & { isDemo: boolean })[]) => rows.filter((r) => includeDemo || !r.isDemo);
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
    ...nd(orgs).map((o) => ({ type: "organization" as const, id: o.id, label: o.name, sub: [o.industry, o.country].filter(Boolean).join(" · "), href: `/crm/organizations/${o.id}`, isDemo: o.isDemo })),
    ...nd(people).map((c) => ({ type: "contact" as const, id: c.id, label: c.fullName, sub: c.title ?? "", href: `/crm/contacts/${c.id}`, isDemo: c.isDemo })),
    ...nd(opps).map((o) => ({ type: "opportunity" as const, id: o.id, label: o.title, sub: "Opportunity", href: `/crm/opportunities/${o.id}`, isDemo: o.isDemo })),
  ];
}
