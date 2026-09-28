/**
 * Geometry of a vertical-curved slab caster strand as a function of the
 * arc length s (m) measured from the meniscus:
 *   0 … verticalLength          vertical (mold)
 *   … + π/2·R                   bow (bending radius R)
 *   … totalLength               horizontal (straightened) run-out
 */
import { LAYOUT } from '../config/layout';

const { radius: R, verticalLength: V, totalLength } = LAYOUT.strand;
const [mx, my] = LAYOUT.mold.meniscus;
const ARC = (Math.PI / 2) * R;

export const STRAND = {
  arcLength: ARC,
  arcEnd: V + ARC,
  total: totalLength,
};

export interface PathSample {
  x: number;
  y: number;
  /** Unit tangent (direction of withdrawal). */
  tx: number;
  ty: number;
}

export function strandPoint(s: number): PathSample {
  const cx = mx + R;
  const cy = my - V;
  if (s <= V) return { x: mx, y: my - s, tx: 0, ty: -1 };
  if (s <= V + ARC) {
    const a = (s - V) / R; // 0 .. π/2
    const ang = Math.PI + a; // measured from +X
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang), tx: Math.sin(a), ty: -Math.cos(a) };
  }
  const d = s - V - ARC;
  return { x: cx + d, y: cy - R, tx: 1, ty: 0 };
}

/** Rotation (radians about Z) that aligns local +X with the withdrawal direction. */
export function strandAngle(s: number): number {
  const p = strandPoint(s);
  return Math.atan2(p.ty, p.tx);
}
