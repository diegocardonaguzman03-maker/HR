/**
 * Educational solidification model — SIMULATED TRAINING DATA.
 * Shell thickness follows the classical square-root law  e = K · √t
 * (industry standard form); K and casting speed are CONFIGURABLE assumptions.
 */
import { LAYOUT } from '../config/layout';

export const SOLID_MODEL = {
  /** mm / √min — ASSUMPTION within typical slab-caster range. */
  K: 22,
  /** m/min — reference configuration nominal speed (CONFIGURABLE). */
  castingSpeed: 1.2,
  halfThicknessMm: (LAYOUT.strand.thickness * 1000) / 2,
};

/** Dwell time (min) of a strand element located at s metres below the meniscus. */
export const dwellTime = (s: number, v = SOLID_MODEL.castingSpeed) => Math.max(0, s) / v;

/** Solid shell thickness (mm) at position s. */
export function shellThickness(s: number, v = SOLID_MODEL.castingSpeed): number {
  return Math.min(SOLID_MODEL.halfThicknessMm, SOLID_MODEL.K * Math.sqrt(dwellTime(s, v)));
}

/** Metallurgical length (m): where both shells meet. */
export function metallurgicalLength(v = SOLID_MODEL.castingSpeed): number {
  return v * (SOLID_MODEL.halfThicknessMm / SOLID_MODEL.K) ** 2;
}

/** Remaining liquid fraction of the section (0..1) at position s. */
export function liquidFraction(s: number, v = SOLID_MODEL.castingSpeed): number {
  return Math.max(0, 1 - shellThickness(s, v) / SOLID_MODEL.halfThicknessMm);
}

/** Educational slab surface temperature (°C) along the strand. */
export function surfaceTemperature(s: number): number {
  if (s < 0.8) return 1450 - 350 * (s / 0.8); // inside the mold
  // exponential decay toward ~850 °C with a small reheating after the spray zones
  const base = 850 + 250 * Math.exp(-(s - 0.8) / 9);
  return s > 26 ? base + 25 * Math.min(1, (s - 26) / 6) : base;
}

/** Centre temperature (°C): liquid while the core is open, then cools after closure. */
export function centreTemperature(s: number, liquidus = 1525, superheat = 25): number {
  const lm = metallurgicalLength();
  if (s < lm) return liquidus + superheat * Math.max(0, 1 - s / 3) - 20 * (s / lm);
  return 1505 - 12 * (s - lm);
}
