export type PeriodKey = "mtd" | "qtd" | "ytd" | "last30" | "all";

export type Period = { key: PeriodKey; label: string; from: string; to: string };

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Inclusive ISO date range for a period relative to `today` (YYYY-MM-DD). */
export function resolvePeriod(key: PeriodKey, today: string): Period {
  const t = new Date(`${today}T00:00:00Z`);
  const y = t.getUTCFullYear();
  const m = t.getUTCMonth();
  switch (key) {
    case "mtd":
      return { key, label: "Month to date", from: iso(new Date(Date.UTC(y, m, 1))), to: today };
    case "qtd":
      return { key, label: "Quarter to date", from: iso(new Date(Date.UTC(y, Math.floor(m / 3) * 3, 1))), to: today };
    case "ytd":
      return { key, label: "Year to date", from: iso(new Date(Date.UTC(y, 0, 1))), to: today };
    case "last30":
      return { key, label: "Last 30 days", from: iso(new Date(t.getTime() - 29 * 86_400_000)), to: today };
    case "all":
      return { key, label: "All time", from: "0000-01-01", to: today };
  }
}

export const inPeriod = (date: string | null | undefined, p: Period) => !!date && date.slice(0, 10) >= p.from && date.slice(0, 10) <= p.to;

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b.slice(0, 10)) - Date.parse(a.slice(0, 10))) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  return iso(new Date(Date.parse(date.slice(0, 10)) + days * 86_400_000));
}

/** Number of whole or partial months in a period (used to compare against a monthly target). */
export function monthsInPeriod(p: Period): number {
  if (p.key === "all") return 0;
  const a = new Date(`${p.from}T00:00:00Z`);
  const b = new Date(`${p.to}T00:00:00Z`);
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) + 1;
}
