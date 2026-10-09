import type { Currency } from "@/server/db/schema";

/** Money is handled as integer minor units (cents). */
export type Money = { amount: number; currency: Currency };

export function formatMoney(minor: number | null | undefined, currency: Currency, opts: { compact?: boolean } = {}): string {
  if (minor === null || minor === undefined) return "—";
  const value = minor / 100;
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: opts.compact ? 1 : 2,
    minimumFractionDigits: opts.compact ? 0 : 2,
  });
  return fmt.format(value).replace(/ /g, " ");
}

/** Parses user input such as "12,500", "12500.5" or "$ 1,000.00" into minor units. Returns null if invalid. */
export function parseMoneyInput(input: string): number | null {
  const cleaned = input.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  if (!cleaned || !/^-?\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const sign = whole!.startsWith("-") ? -1 : 1;
  const w = Math.abs(parseInt(whole!, 10));
  const f = parseInt((frac + "00").slice(0, 2), 10);
  return sign * (w * 100 + f);
}

export function pct(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return numerator / denominator;
}

export function formatPct(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}
