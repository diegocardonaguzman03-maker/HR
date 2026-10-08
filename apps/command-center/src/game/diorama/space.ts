// World space for the diorama. Domain state keeps living in tile space
// (64 × 64, see data/territories); the diorama maps it onto a physical model:
// four territory plinths around a round Command plaza, separated by canals.
import { CITADEL_TILE, GATES, TERRITORIES } from '@/data/territories';
import type { Vec } from '@/services/geometry';
import type { Project, TerritoryId } from '@/types/domain';

/** World units per tile. A standing figure is ~0.9 units tall. */
export const S = 1.7;
/** Extra outward offset per quadrant: opens the canals and the central plaza. */
export const G = 4;
export const PLAZA_R = 12;

const axis = (t: number) => (t - 32) * S + Math.max(-1, Math.min(1, t - 32)) * G;
const axisInv = (w: number) => {
  // Inverse of axis(): piecewise linear and monotonic.
  const edge = S + G; // |axis(31)| = |axis(33)|
  if (w <= -edge) return 32 + (w + G) / S;
  if (w >= edge) return 32 + (w - G) / S;
  return 32 + w / edge;
};

export function tileToWorld(tx: number, ty: number): { x: number; z: number } {
  return { x: axis(tx), z: axis(ty) };
}
export function worldToTile(x: number, z: number): Vec {
  return [axisInv(x), axisInv(z)];
}

/** Building footprint (world units) for a project. */
export function footprint(p: Pick<Project, 'size'>): number {
  return Math.max(3, p.size) * 2.6;
}

export function projectCenter(p: Pick<Project, 'tile' | 'size'>): { x: number; z: number } {
  return tileToWorld(p.tile[0] + p.size / 2, p.tile[1] + p.size / 2);
}

export interface PlinthRect {
  id: Exclude<TerritoryId, 'citadel'>;
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  /** The corner that faces the central plaza. */
  inner: { x: number; z: number };
}

export const PLINTHS: PlinthRect[] = TERRITORIES.map((t) => {
  const a = tileToWorld(t.polygon[0][0], t.polygon[0][1]);
  const b = tileToWorld(t.polygon[2][0], t.polygon[2][1]);
  const x0 = Math.min(a.x, b.x);
  const x1 = Math.max(a.x, b.x);
  const z0 = Math.min(a.z, b.z);
  const z1 = Math.max(a.z, b.z);
  return {
    id: t.id as PlinthRect['id'],
    x0: x0 + 0.8,
    x1: x1 - 0.8,
    z0: z0 + 0.8,
    z1: z1 - 0.8,
    inner: { x: Math.abs(x0) < Math.abs(x1) ? x0 : x1, z: Math.abs(z0) < Math.abs(z1) ? z0 : z1 },
  };
});

export const CITADEL_WORLD = tileToWorld(CITADEL_TILE[0], CITADEL_TILE[1]);

export function gateWorld(t: Exclude<TerritoryId, 'citadel'>): { x: number; z: number } {
  const g = GATES[t];
  return tileToWorld(g[0], g[1]);
}

export function hubWorld(t: Exclude<TerritoryId, 'citadel'>): { x: number; z: number } {
  const terr = TERRITORIES.find((x) => x.id === t)!;
  return tileToWorld(terr.hub[0], terr.hub[1]);
}

export function territoryCenterWorld(t: TerritoryId): { x: number; z: number } {
  if (t === 'citadel') return CITADEL_WORLD;
  const terr = TERRITORIES.find((x) => x.id === t)!;
  return tileToWorld(terr.center[0], terr.center[1]);
}

/** Territory a world point stands on (by quadrant; the plaza is the Citadel). */
export function territoryAtWorld(x: number, z: number): TerritoryId {
  if (Math.hypot(x, z) < PLAZA_R) return 'citadel';
  if (x < 0 && z < 0) return 'industrial';
  if (x >= 0 && z < 0) return 'praxia';
  if (x < 0 && z >= 0) return 'personal';
  return 'frontier';
}
