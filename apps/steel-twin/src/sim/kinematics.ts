/**
 * Deterministic positions of moving objects for a given state/progress.
 * Pure functions: reused by the 3D scene, the Follow-the-Steel camera and the UI.
 */
import { LAYOUT } from '../config/layout';
import { clock, currentStep, indexOfState, stepProgress } from './clock';
import { simulationProvider } from './SimulationDataProvider';
import { strandPoint } from './strandPath';
import type { SimState } from '../types/process';

export type V3 = [number, number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export interface Pose {
  state: SimState;
  p: number;
  /** Step order helpers */
  before: (s: SimState) => boolean;
  after: (s: SimState) => boolean;
}

export function currentPose(): Pose {
  const st = currentStep().state;
  const idx = clock.stepIndex;
  return {
    state: st,
    p: stepProgress(),
    before: (s) => indexOfState(s) < 0 || idx < indexOfState(s),
    after: (s) => indexOfState(s) >= 0 && idx > indexOfState(s),
  };
}

const TAP = LAYOUT.ladle.tapPosition;
const LF = LAYOUT.ladleFurnace.position;
const TURRET = LAYOUT.turret.position;
const R = LAYOUT.turret.armRadius;
const LADLE_TOP_Y = LAYOUT.turret.ladleBaseY;
const STANDBY: V3 = [TURRET[0] - R, LADLE_TOP_Y, 0];
const CAST: V3 = [TURRET[0] + R, LADLE_TOP_Y, 0];

/** Position of the heat ladle (bottom centre). */
export function ladlePosition(pose: Pose): V3 {
  const { state, p } = pose;
  if (pose.before('SECONDARY_METALLURGY')) return TAP;
  if (state === 'SECONDARY_METALLURGY') return lerp3(TAP, LF, smooth(p / 0.18));
  if (state === 'VACUUM_TREATMENT') return LF;
  if (state === 'TRANSFER') {
    const lift = smooth(p / 0.2);
    const travel = smooth((p - 0.2) / 0.65);
    const lower = smooth((p - 0.85) / 0.15);
    const x = lerp(LF[0], STANDBY[0], travel);
    const y = lerp(0, 17, lift) - lerp(0, 17 - STANDBY[1], lower);
    return [x, y, 0];
  }
  if (state === 'TURRET') {
    const a = Math.PI * smooth(p);
    return [TURRET[0] - R * Math.cos(a), LADLE_TOP_Y, R * Math.sin(a)];
  }
  return CAST;
}

/** Turret arm angle (0 = heat ladle on standby side, π = casting side). */
export function turretAngle(pose: Pose): number {
  if (pose.before('TURRET')) return 0;
  if (pose.state === 'TURRET') return Math.PI * smooth(pose.p);
  return Math.PI;
}

/** Ladle fill (0..1). */
export function ladleFill(pose: Pose): number {
  if (pose.before('TAPPING')) return 0;
  if (pose.state === 'TAPPING') return smooth((pose.p - 0.15) / 0.7);
  if (pose.before('TUNDISH_FILL') || pose.state === 'TUNDISH_FILL' && pose.p < 0.05) return 1;
  if (pose.state === 'TUNDISH_FILL') return lerp(1, 0.78, pose.p);
  const i = clock.stepIndex - indexOfState('MOLD_FILL');
  return Math.max(0.15, 0.78 - i * 0.07 - 0.07 * pose.p);
}

/** Casting crane: bridge X and hook height. `carrying` = 'bucket' | 'ladle' | null. */
export function cranePose(pose: Pose): { x: number; hookY: number; carrying: 'bucket' | 'ladle' | null } {
  const { state, p } = pose;
  if (state === 'RAW_MATERIALS') return { x: lerp(-28, LAYOUT.rawMaterials.position[0] + 4, smooth(p)), hookY: 12, carrying: p > 0.85 ? 'bucket' : null };
  if (state === 'CHARGING') {
    const x = lerp(LAYOUT.rawMaterials.position[0] + 4, LAYOUT.eaf.position[0], smooth(p / 0.5));
    return { x, hookY: lerp(12, 15.5, smooth(p / 0.5)), carrying: 'bucket' };
  }
  if (state === 'TRANSFER') {
    const l = ladlePosition(pose);
    return { x: l[0], hookY: l[1] + LAYOUT.ladle.height + 0.8, carrying: 'ladle' };
  }
  if (state === 'SECONDARY_METALLURGY') return { x: lerp(-30, LF[0], smooth(p)), hookY: 14, carrying: null };
  if (pose.after('TRANSFER')) return { x: lerp(STANDBY[0], -6, smooth(state === 'TURRET' ? p : 1)), hookY: 16, carrying: null };
  return { x: -28, hookY: 14, carrying: null };
}

/** Charging bucket position (bottom centre) and discharge progress (0..1). */
export function bucketPose(pose: Pose): { pos: V3; discharge: number; visible: boolean } {
  const c = cranePose(pose);
  if (pose.state === 'RAW_MATERIALS') return { pos: [LAYOUT.rawMaterials.position[0] + 4, 0.2, 5], discharge: 0, visible: true };
  if (pose.state === 'CHARGING') return { pos: [c.x, c.hookY - 4.4, 0], discharge: smooth((pose.p - 0.5) / 0.35), visible: true };
  return { pos: [LAYOUT.rawMaterials.position[0] + 4, 0.2, 5], discharge: pose.after('CHARGING') ? 1 : 0, visible: true };
}

/** Where the steel (the conceptual heat) is — used by Follow-the-Steel and the steel marker. */
export function heatPosition(pose: Pose): V3 {
  const eaf = LAYOUT.eaf.position;
  const bathY = LAYOUT.eaf.platformHeight + 0.9;
  switch (pose.state) {
    case 'IDLE':
    case 'RAW_MATERIALS':
      return [LAYOUT.rawMaterials.position[0], 2, 0];
    case 'CHARGING': {
      const b = bucketPose(pose);
      return [b.pos[0], b.pos[1] + 1.5, b.pos[2]];
    }
    case 'ARC_IGNITION':
    case 'MELTING':
    case 'REFINING':
      return [eaf[0], bathY, 0];
    case 'TAPPING':
      return lerp3([eaf[0] + 2, bathY, 0], [TAP[0], 2.5, 0], smooth(pose.p));
    case 'SECONDARY_METALLURGY':
    case 'VACUUM_TREATMENT':
    case 'TRANSFER':
    case 'TURRET': {
      const l = ladlePosition(pose);
      return [l[0], l[1] + 2.2, l[2]];
    }
    case 'TUNDISH_FILL':
      return lerp3([CAST[0], CAST[1] - 0.5, 0], [LAYOUT.tundish.position[0], LAYOUT.tundish.position[1] + 0.4, 0], smooth(pose.p));
    case 'MOLD_FILL':
      return lerp3([LAYOUT.tundish.senX, 12.2, 0], [...LAYOUT.mold.meniscus] as V3, smooth(pose.p));
    default: {
      const snap = simulationProvider.getSnapshot(pose.state, pose.p);
      if (pose.state === 'COMPLETE') return slabPosition(pose);
      const s = Math.max(0.3, snap.strand.castLength - 0.3);
      const q = strandPoint(s);
      return [q.x, q.y, 0];
    }
  }
}

/** Centre of the cut slab after cutting. */
export function slabPosition(pose: Pose): V3 {
  const cut = strandPoint(LAYOUT.strand.cutPosition);
  const L = LAYOUT.strand.slabLength;
  const start: V3 = [cut.x + L / 2, cut.y, 0];
  if (pose.state === 'CUTTING') return [start[0] + lerp(0, 1.2, smooth((pose.p - 0.8) / 0.2)), start[1], 0];
  if (pose.state === 'COMPLETE') {
    const run = smooth(pose.p / 0.6);
    const transfer = smooth((pose.p - 0.6) / 0.4);
    return [lerp(start[0] + 1.2, LAYOUT.slabYard[0], run), start[1] + transfer * 0.2, lerp(0, LAYOUT.slabYard[2], transfer)];
  }
  return start;
}
