// Pure world geometry shared by the game layer, the minimap and the simulation.
import { CITADEL_TILE, GATE_RING, GATES, territoryById } from '@/data/territories';
import type { Project, TerritoryId } from '@/types/domain';

export const TILE_W = 64;
export const TILE_H = 32;

export type Vec = [number, number];

/** Tile space → isometric screen space (world container coordinates). */
export function isoToScreen(tx: number, ty: number): { x: number; y: number } {
  return { x: (tx - ty) * (TILE_W / 2), y: (tx + ty) * (TILE_H / 2) };
}

/** Isometric screen space → tile space. */
export function screenToIso(x: number, y: number): Vec {
  const a = x / (TILE_W / 2);
  const b = y / (TILE_H / 2);
  return [(a + b) / 2, (b - a) / 2];
}

export const CITADEL_SIZE = 5;

export interface Anchor {
  id: string; // project id or 'citadel'
  tile: Vec;
  size: number;
  territory: TerritoryId;
}

export function citadelAnchor(): Anchor {
  return { id: 'citadel', tile: CITADEL_TILE, size: CITADEL_SIZE, territory: 'citadel' };
}

export function projectAnchor(p: Pick<Project, 'id' | 'tile' | 'size' | 'territory'>): Anchor {
  return { id: p.id, tile: p.tile, size: p.size, territory: p.territory };
}

/** The "door": the point in front of a structure where agents stand and work. */
export function doorOf(a: Anchor): Vec {
  return [a.tile[0] + a.size / 2 + 0.9, a.tile[1] + 0.4];
}

/**
 * Standing slot `i` around a structure. Slots spread along the front faces so
 * collaborating agents visibly gather together.
 */
export function slotOf(a: Anchor, i: number): Vec {
  const d = doorOf(a);
  const offsets: Vec[] = [
    [0, 0], [0, 0.9], [0.1, -0.9], [-0.6 - a.size / 2, a.size / 2 + 1.2], [0.6, 1.6], [0.6, -1.6], [-1.6, a.size / 2 + 1.2], [1.2, 0.4],
  ];
  const o = offsets[i % offsets.length];
  const ring = Math.floor(i / offsets.length);
  return [d[0] + o[0] + ring * 0.7, d[1] + o[1]];
}

/** Waiting agents gather on the Command Citadel steps (a ring around the tower). */
export function citadelWaitingSlot(i: number): Vec {
  // Fan out along the front (camera-facing) steps of the Citadel.
  const angle = Math.PI / 4 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.42;
  const r = CITADEL_SIZE / 2 + 1.6;
  return [CITADEL_TILE[0] + Math.cos(angle) * r, CITADEL_TILE[1] + Math.sin(angle) * r];
}

function hubOf(t: TerritoryId): Vec | null {
  if (t === 'citadel') return null;
  return territoryById(t)?.hub ?? null;
}

/**
 * Road-following route between two structures: door → hub → gate → (plaza) →
 * gate → hub → door. Cheap, deterministic and reads as "walking the roads".
 */
export function routeBetween(fromPos: Vec, fromTerritory: TerritoryId, to: Vec, toTerritory: TerritoryId): Vec[] {
  const pts: Vec[] = [];
  // A hub is worth visiting only when it lies roughly "on the way".
  const onTheWay = (a: Vec, hub: Vec, b: Vec) => dist(a, hub) > 2 && dist(a, hub) + dist(hub, b) < dist(a, b) * 1.35;
  if (fromTerritory === toTerritory && fromTerritory !== 'citadel') {
    const hub = hubOf(fromTerritory);
    if (hub && dist(fromPos, to) > 6 && onTheWay(fromPos, hub, to)) pts.push(hub);
    pts.push(to);
    return pts;
  }
  if (fromTerritory === 'citadel' && toTerritory === 'citadel' && !crossesCitadel(fromPos, to)) return [to];

  const fromGate = fromTerritory === 'citadel' ? nearestGate(fromPos) : (fromTerritory as Exclude<TerritoryId, 'citadel'>);
  const toGate = toTerritory === 'citadel' ? nearestGate(to) : (toTerritory as Exclude<TerritoryId, 'citadel'>);
  if (fromTerritory !== 'citadel') {
    const hub = hubOf(fromTerritory)!;
    if (onTheWay(fromPos, hub, GATES[fromGate])) pts.push(hub);
  }
  for (const g of ringBetween(fromGate, toGate)) pts.push(GATES[g]);
  if (toTerritory !== 'citadel') {
    const hub = hubOf(toTerritory)!;
    if (onTheWay(GATES[toGate], hub, to)) pts.push(hub);
  }
  pts.push(to);
  return pts;
}

type Gate = Exclude<TerritoryId, 'citadel'>;

function nearestGate(p: Vec): Gate {
  return GATE_RING.reduce((best, g) => (dist(GATES[g], p) < dist(GATES[best], p) ? g : best), GATE_RING[0]);
}

/** Gates walked when going around the plaza from `a` to `b` (shortest direction, inclusive). */
export function ringBetween(a: Gate, b: Gate): Gate[] {
  const n = GATE_RING.length;
  const i = GATE_RING.indexOf(a), j = GATE_RING.indexOf(b);
  const cw = (j - i + n) % n;
  const step = cw <= n - cw ? 1 : -1;
  const out: Gate[] = [a];
  for (let k = i; k !== j; ) {
    k = (k + step + n) % n;
    out.push(GATE_RING[k]);
  }
  return out;
}

/** Does the segment pass through the Citadel's footprint? */
function crossesCitadel(a: Vec, b: Vec): boolean {
  const half = CITADEL_SIZE / 2 + 0.3;
  for (let t = 0; t <= 1; t += 0.05) {
    const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
    if (Math.abs(x - CITADEL_TILE[0]) < half && Math.abs(y - CITADEL_TILE[1]) < half) return true;
  }
  return false;
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function pointInPolygon(x: number, y: number, poly: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
