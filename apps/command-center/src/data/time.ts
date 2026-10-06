/** Timestamp `minutes` ago. Seed data is relative to page load. */
export const ago = (minutes: number): number => Date.now() - minutes * 60_000;

/** ISO date `days` from today. */
export const inDays = (days: number): string => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

/** ISO datetime today/tomorrow at a given hour. */
export const at = (dayOffset: number, hour: number, minute = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
