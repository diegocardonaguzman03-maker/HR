import type { Currency } from "@/server/db/schema";

export type FxRate = { base: Currency; quote: Currency; rate: number; source: string; rateDate: string };

export type FxSnapshot = {
  fxRate: number;
  fxSource: string;
  fxRateDate: string;
  reportingCurrency: Currency;
  reportingAmount: number;
};

/**
 * Finds the most recent rate on or before `onDate` that converts `from` → `to`.
 * Accepts direct pairs (from→to) or inverse pairs (to→from, inverted). Never looks into the future.
 */
export function findRate(rates: FxRate[], from: Currency, to: Currency, onDate: string): { rate: number; source: string; rateDate: string } | null {
  if (from === to) return { rate: 1, source: "identity", rateDate: onDate };
  let best: { rate: number; source: string; rateDate: string } | null = null;
  for (const r of rates) {
    if (r.rateDate > onDate || !(r.rate > 0)) continue;
    let candidate: { rate: number; source: string; rateDate: string } | null = null;
    if (r.base === from && r.quote === to) candidate = { rate: r.rate, source: r.source, rateDate: r.rateDate };
    else if (r.base === to && r.quote === from) candidate = { rate: 1 / r.rate, source: `${r.source} (inverse)`, rateDate: r.rateDate };
    if (candidate && (!best || candidate.rateDate > best.rateDate)) best = candidate;
  }
  return best;
}

export function convertMinor(amount: number, rate: number): number {
  return Math.round(amount * rate);
}

/** Builds the immutable FX snapshot stored on a monetary record. Returns null when no rate is available. */
export function buildSnapshot(rates: FxRate[], amount: number, currency: Currency, onDate: string, reporting: Currency): FxSnapshot | null {
  const r = findRate(rates, currency, reporting, onDate);
  if (!r) return null;
  return { fxRate: r.rate, fxSource: r.source, fxRateDate: r.rateDate, reportingCurrency: reporting, reportingAmount: convertMinor(amount, r.rate) };
}

/** Record-like shape with original + snapshot values. */
export type Reportable = { amount: number; currency: Currency; reportingCurrency?: string | null; reportingAmount?: number | null };

/**
 * Value of a record in the reporting currency.
 * Same currency → original amount. Otherwise the stored snapshot is used if it matches the reporting currency.
 * Returns null when the record cannot be reported (missing FX) — callers must surface that, never assume 0.
 */
export function reportedValue(rec: Reportable, reporting: Currency): number | null {
  if (rec.currency === reporting) return rec.amount;
  if (rec.reportingCurrency === reporting && rec.reportingAmount !== null && rec.reportingAmount !== undefined) return rec.reportingAmount;
  return null;
}

/** Sums records in reporting currency; counts the ones that could not be converted. */
export function sumReported(recs: Reportable[], reporting: Currency): { total: number; missingFx: number } {
  let total = 0;
  let missingFx = 0;
  for (const r of recs) {
    const v = reportedValue(r, reporting);
    if (v === null) missingFx++;
    else total += v;
  }
  return { total, missingFx };
}
