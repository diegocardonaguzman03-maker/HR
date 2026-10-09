import { and, eq, lte, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import type { DB } from "../db/client";
import { auditLog, companySettings, fxRates, type Currency } from "../db/schema";
import { buildSnapshot, type FxRate } from "@/domain/fx";

export type Actor = string; // "founder" | "system" | agent id

export class BusinessRuleError extends Error {
  constructor(message: string, public readonly details: Record<string, unknown> = {}) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string; details?: Record<string, unknown> };

/** Runs an operation and converts business-rule violations into a typed result for the UI. */
export async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, value: await fn() };
  } catch (e) {
    if (e instanceof BusinessRuleError) return { ok: false, error: e.message, details: e.details };
    if (e && typeof e === "object" && "issues" in e) {
      const issues = (e as { issues: { path: (string | number)[]; message: string }[] }).issues;
      return { ok: false, error: issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; ") };
    }
    throw e;
  }
}

export async function audit(db: Pick<DB, "insert">, actor: Actor, action: string, entityType: string, entityId: string, before: unknown = null, after: unknown = null) {
  await db.insert(auditLog).values({ actor, action, entityType, entityId, before: before as never, after: after as never });
}

export const nowIso = () => new Date().toISOString();
export const todayIso = () => new Date().toISOString().slice(0, 10);

export async function getSettings(db: DB) {
  const [s] = await db.select().from(companySettings).where(eq(companySettings.id, 1));
  if (!s) throw new BusinessRuleError("Company settings missing — run the base seed (npm run db:seed).");
  return s;
}

export async function loadRates(db: DB): Promise<FxRate[]> {
  return (await db.select().from(fxRates)) as FxRate[];
}

/** FX snapshot for a monetary record, in the current reporting currency (null fields when no rate exists). */
export async function snapshotFor(db: DB, amount: number, currency: Currency, onDate: string) {
  const s = await getSettings(db);
  const snap = buildSnapshot(await loadRates(db), amount, currency, onDate, s.reportingCurrency);
  if (currency === s.reportingCurrency) return { fxRate: 1, fxSource: "identity", fxRateDate: onDate, reportingCurrency: s.reportingCurrency, reportingAmount: amount };
  return snap ?? { fxRate: null, fxSource: null, fxRateDate: null, reportingCurrency: null, reportingAmount: null };
}

/** Demo filter: when demo mode is off, demo rows are excluded. */
export function demoFilter(col: SQLiteColumn, includeDemo: boolean): SQL | undefined {
  return includeDemo ? undefined : eq(col, false);
}

export { and, eq, lte };
