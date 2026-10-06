// Parametric architectural shell: podium, stepped floor plates, columns,
// solid back walls with window bands, glass curtain fronts, roofs.
// Upper floors step back (a built-in section cut) so the ground floor stays readable.
import type { Kit, Layer } from './kit';
import type { MatKey } from './materials';
import { ceilingLights } from './props';

export interface Rect {
  y: number;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export interface ShellOpts {
  w: number;
  d: number;
  floors?: number;
  fh?: number;
  /** Fraction of depth removed per upper floor (from the front). */
  step?: number;
  frame?: MatKey;
  slab?: MatKey;
  floorMat?: MatKey;
  wall?: MatKey;
  accent?: MatKey | null;
  front?: 'glass' | 'open';
  back?: 'solid' | 'glass';
  roof?: 'flat' | 'saw' | 'none' | 'canopy';
  roofMat?: MatKey;
  podium?: MatKey;
  lights?: boolean;
}

export const PODIUM_H = 0.18;

export function shell(k: Kit, o: ShellOpts): { floors: Rect[]; top: number } {
  const { w, d } = o;
  const floors = o.floors ?? 1;
  const fh = o.fh ?? 2.1;
  const step = o.step ?? (floors > 2 ? 0.28 : 0.42);
  const frame = o.frame ?? 'offwhite';
  const slab = o.slab ?? 'offwhite';
  const wall = o.wall ?? 'offwhite';
  const roofMat = o.roofMat ?? slab;
  const rects: Rect[] = [];

  k.box(o.podium ?? 'concrete', w + 0.7, PODIUM_H, d + 0.7, 0, 0, 0);

  for (let i = 0; i < floors; i++) {
    const depth = d * Math.max(0.38, 1 - step * i);
    const y = PODIUM_H + i * fh;
    const r: Rect = { y, x0: -w / 2, x1: w / 2, z0: -d / 2, z1: -d / 2 + depth };
    rects.push(r);
    const cz = (r.z0 + r.z1) / 2;
    // floor plate
    if (i > 0) k.box(slab, w, 0.14, depth, 0, y - 0.14, cz);
    k.box(o.floorMat ?? 'floor', w - 0.16, 0.02, depth - 0.16, 0, y, cz, { layer: 'interior' });
    // columns
    const nx = Math.max(1, Math.round(w / 3.2));
    for (let c = 0; c <= nx; c++) {
      const x = -w / 2 + (w / nx) * c;
      k.box(frame, 0.16, fh, 0.16, x, y, r.z1 - 0.08);
      k.box(frame, 0.16, fh, 0.16, x, y, r.z0 + 0.08);
    }
    // back walls (solid with window band) — or glass
    backWall(k, 'wall-x', wall, o.back === 'glass', -w / 2 + 0.07, cz, depth, y, fh, true);
    backWall(k, 'wall-z', wall, o.back === 'glass', 0, r.z0 + 0.07, w, y, fh, false);
    // fronts
    if (o.front !== 'open') {
      curtain(k, 'wall+x', frame, w / 2 - 0.05, cz, depth, y, fh, true);
      curtain(k, 'wall+z', frame, 0, r.z1 - 0.05, w, y, fh, false);
    }
    if (o.accent) k.box(o.accent, w + 0.02, 0.1, 0.04, 0, y + fh - 0.32, r.z1 + 0.01, { layer: 'wall+z' });
    // balustrade on stepped edges
    if (i > 0) {
      k.box('glass', w - 0.2, 0.36, 0.03, 0, y, r.z1 - 0.02, { layer: 'shell' });
      k.bar('steel', -w / 2 + 0.1, r.z1 - 0.02, w / 2 - 0.1, r.z1 - 0.02, y + 0.38, 0.03);
    }
    if (o.lights !== false) {
      k.push(0, cz);
      ceilingLights(k, w - 0.8, depth - 0.8, y + fh, Math.max(1, Math.round(w / 3)), Math.max(1, Math.round(depth / 3)));
      k.pop();
    }
    // roof over the part of this floor not covered by the next one
    const next = i + 1 < floors ? -d / 2 + d * Math.max(0.38, 1 - step * (i + 1)) : r.z0;
    const roofZ0 = i + 1 < floors ? next : r.z0;
    if (o.roof !== 'none' && r.z1 - roofZ0 > 0.1) {
      const rd = r.z1 - roofZ0;
      const rz = (roofZ0 + r.z1) / 2;
      const ry = y + fh;
      if (i + 1 < floors) {
        // terrace deck over the lower floor — lifts away with the roofs in close-up
        k.box(slab, w, 0.14, rd, 0, ry - 0.14, rz, { layer: 'roof' });
        k.box('floorWood', w - 0.4, 0.03, rd - 0.3, 0, ry, rz, { layer: 'roof' });
        k.bar('steel', -w / 2 + 0.1, r.z1 - 0.1, w / 2 - 0.1, r.z1 - 0.1, ry + 0.36, 0.03, { layer: 'roof' });
        k.box('glass', w - 0.2, 0.34, 0.03, 0, ry, r.z1 - 0.1, { layer: 'roof' });
      } else roof(k, o.roof ?? 'flat', roofMat, w, rd, rz, ry, frame);
    }
  }
  const top = PODIUM_H + floors * fh;
  return { floors: rects, top };
}

function backWall(k: Kit, layer: Layer, mat: MatKey, glass: boolean, x: number, z: number, len: number, y: number, fh: number, alongZ: boolean): void {
  const dims = (t: number, h: number, l: number) => (alongZ ? ([t, h, l] as const) : ([l, h, t] as const));
  if (glass) {
    const [a, b, c] = dims(0.04, fh, len);
    k.box('glassTint', a, b, c, x, y, z, { layer });
    return;
  }
  const lo = fh * 0.32;
  const hi = fh * 0.82;
  let [a, b, c] = dims(0.14, lo, len);
  k.box(mat, a, b, c, x, y, z, { layer });
  [a, b, c] = dims(0.04, hi - lo, len - 0.2);
  k.box('glassTint', a, b, c, x, y + lo, z, { layer });
  [a, b, c] = dims(0.14, fh - hi, len);
  k.box(mat, a, b, c, x, y + hi, z, { layer });
}

function curtain(k: Kit, layer: Layer, frame: MatKey, x: number, z: number, len: number, y: number, fh: number, alongZ: boolean): void {
  if (alongZ) k.box('glass', 0.03, fh - 0.06, len - 0.1, x, y + 0.03, z, { layer });
  else k.box('glass', len - 0.1, fh - 0.06, 0.03, x, y + 0.03, z, { layer });
  const n = Math.max(2, Math.round(len / 1.3));
  for (let i = 1; i < n; i++) {
    const t = -len / 2 + (len / n) * i;
    if (alongZ) k.box(frame, 0.05, fh, 0.05, x, y, z + t, { layer });
    else k.box(frame, 0.05, fh, 0.05, x + t, y, z, { layer });
  }
  if (alongZ) k.box(frame, 0.06, 0.06, len, x, y + fh * 0.5, z, { layer });
  else k.box(frame, len, 0.06, 0.06, x, y + fh * 0.5, z, { layer });
}

export function roof(k: Kit, style: NonNullable<ShellOpts['roof']>, mat: MatKey, w: number, d: number, z: number, y: number, frame: MatKey): void {
  if (style === 'none') return;
  if (style === 'saw') {
    const teeth = Math.max(2, Math.round(d / 1.8));
    const td = d / teeth;
    const h = 0.75;
    const slope = Math.atan2(h, td);
    for (let i = 0; i < teeth; i++) {
      const z0 = z - d / 2 + td * i;
      k.box(mat, w + 0.2, 0.08, Math.hypot(td, h), 0, y + h / 2 - 0.04, z0 + td / 2, { layer: 'roof', rx: -slope });
      k.box('glassTint', w, h, 0.04, 0, y, z0 + td - 0.02, { layer: 'roof' });
      k.box(frame, w + 0.2, 0.08, 0.1, 0, y + h - 0.04, z0 + td - 0.02, { layer: 'roof' });
    }
    k.box(mat, w + 0.2, 0.12, d + 0.2, 0, y - 0.04, z, { layer: 'roof' });
    return;
  }
  if (style === 'canopy') {
    k.box(mat, w + 1.6, 0.16, d + 1.6, 0, y, z, { layer: 'roof' });
    k.box('woodDark', w + 1.5, 0.06, d + 1.5, 0, y - 0.05, z, { layer: 'roof' });
    return;
  }
  // flat with parapet and plant
  k.box(mat, w + 0.12, 0.16, d + 0.12, 0, y - 0.02, z, { layer: 'roof' });
  k.box(mat, w + 0.12, 0.22, 0.1, 0, y + 0.14, z - d / 2, { layer: 'roof' });
  k.box(mat, w + 0.12, 0.22, 0.1, 0, y + 0.14, z + d / 2, { layer: 'roof' });
  k.box(mat, 0.1, 0.22, d, -w / 2, y + 0.14, z, { layer: 'roof' });
  k.box(mat, 0.1, 0.22, d, w / 2, y + 0.14, z, { layer: 'roof' });
  if (w > 4 && d > 2.5) {
    k.box('steel', 0.9, 0.45, 0.7, -w / 4, y + 0.14, z - d / 4, { layer: 'roof' });
    k.box('steelDark', 0.5, 0.06, 0.5, -w / 4, y + 0.59, z - d / 4, { layer: 'roof' });
    k.box('steel', 0.6, 0.35, 0.6, w / 5, y + 0.14, z - d / 5, { layer: 'roof' });
  }
}
