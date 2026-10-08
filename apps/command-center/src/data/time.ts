// Seed data is expressed relative to "now". A persisted world pins "now" to the
// moment it was created (withSeedClock) so reloading never shifts seed dates.
let fixedNow: number | null = null;
const now = () => fixedNow ?? Date.now();

export function withSeedClock<T>(ms: number, fn: () => T): T {
  const prev = fixedNow;
  fixedNow = ms;
  try {
    return fn();
  } finally {
    fixedNow = prev;
  }
}

/** Timestamp `minutes` ago. */
export const ago = (minutes: number): number => now() - minutes * 60_000;

/** ISO date `days` from today. */
export const inDays = (days: number): string => new Date(now() + days * 86_400_000).toISOString().slice(0, 10);

/** ISO datetime today/tomorrow at a given hour. */
export const at = (dayOffset: number, hour: number, minute = 0): string => {
  const d = new Date(now());
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
