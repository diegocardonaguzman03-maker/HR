// Furniture and fittings at miniature scale (a standing person ≈ 0.9 units).
// Every helper works in the Kit's current local frame.
import type { Kit, ScreenKind } from './kit';
import type { MatKey } from './materials';

export const DESK_H = 0.38;

/** Workstation: desk, monitor, chair. Registers a seated work spot facing the screen (+z local). */
export function desk(k: Kit, x: number, z: number, ry: number, y: number, screen: ScreenKind = 'chart', mat: MatKey = 'white'): void {
  k.push(x, z, ry, y);
  k.box(mat, 1.0, 0.04, 0.5, 0, DESK_H - 0.04, 0, { layer: 'interior' });
  k.box('graphite', 0.04, DESK_H - 0.04, 0.44, -0.46, 0, 0, { layer: 'interior' });
  k.box('graphite', 0.04, DESK_H - 0.04, 0.44, 0.46, 0, 0, { layer: 'interior' });
  // monitor
  k.box('black', 0.05, 0.12, 0.05, 0, DESK_H, 0.14, { layer: 'detail' });
  k.box('black', 0.56, 0.32, 0.03, 0, DESK_H + 0.1, 0.17, { layer: 'interior' });
  k.box('screenOff', 0.52, 0.28, 0.01, 0, DESK_H + 0.12, 0.152, { layer: `screen:${screen}` });
  k.box('paper', 0.18, 0.01, 0.12, 0.3, DESK_H, -0.08, { layer: 'detail', ry: 0.3 });
  // chair
  chair(k, 0, -0.42, 0);
  k.spot('work', 0, -0.42, 0, true);
  k.pop();
}

export function chair(k: Kit, x: number, z: number, ry: number, mat: MatKey = 'fabric'): void {
  k.push(x, z, ry);
  k.box(mat, 0.3, 0.05, 0.3, 0, 0.2, 0, { layer: 'interior' });
  k.box(mat, 0.3, 0.26, 0.05, 0, 0.24, -0.15, { layer: 'interior' });
  k.post('steelDark', 0, 0, 0, 0.2, 0.025, { layer: 'detail' });
  k.pop();
}

/** Long meeting table with seats on both sides; registers meeting spots. */
export function meetingTable(k: Kit, x: number, z: number, ry: number, y: number, seats = 6, mat: MatKey = 'wood'): void {
  k.push(x, z, ry, y);
  const per = Math.ceil(seats / 2);
  const len = Math.max(1.4, per * 0.62);
  k.box(mat, len, 0.05, 0.8, 0, DESK_H - 0.05, 0, { layer: 'interior' });
  k.box('graphite', 0.08, DESK_H - 0.05, 0.5, -len / 2 + 0.25, 0, 0, { layer: 'interior' });
  k.box('graphite', 0.08, DESK_H - 0.05, 0.5, len / 2 - 0.25, 0, 0, { layer: 'interior' });
  for (let i = 0; i < per; i++) {
    const sx = -len / 2 + (len / per) * (i + 0.5);
    chair(k, sx, -0.62, 0);
    chair(k, sx, 0.62, Math.PI);
    k.spot('meet', sx, -0.62, 0, true);
    k.spot('meet', sx, 0.62, Math.PI, true);
    k.box('paper', 0.16, 0.01, 0.12, sx, DESK_H, -0.18, { layer: 'detail', ry: 0.2 * i });
  }
  k.pop();
}

/** Round collaboration table. */
export function roundTable(k: Kit, x: number, z: number, y: number, seats = 4, r = 0.55, mat: MatKey = 'white'): void {
  k.push(x, z, 0, y);
  k.cyl(mat, r, 0.05, 0, DESK_H - 0.05, 0, { layer: 'interior', seg: 20 });
  k.post('graphite', 0, 0, 0, DESK_H - 0.05, 0.05, { layer: 'interior' });
  for (let i = 0; i < seats; i++) {
    const a = (i / seats) * Math.PI * 2 + Math.PI / seats;
    const cx = Math.sin(a) * (r + 0.32);
    const cz = Math.cos(a) * (r + 0.32);
    chair(k, cx, cz, a + Math.PI);
    k.spot('meet', cx, cz, a + Math.PI, true);
  }
  k.pop();
}

/** Wall display (faces +z local). */
export function screenWall(k: Kit, x: number, z: number, ry: number, y: number, w: number, h: number, kind: ScreenKind): void {
  k.push(x, z, ry, y);
  k.box('black', w + 0.08, h + 0.08, 0.06, 0, 0, 0, { layer: 'interior' });
  k.box('screenOff', w, h, 0.01, 0, 0.04, 0.035, { layer: `screen:${kind}` });
  k.pop();
}

/** Bookshelf with coloured spines (faces +z local). */
export function shelf(k: Kit, x: number, z: number, ry: number, y: number, w = 1.4, h = 1.3, mat: MatKey = 'woodDark'): void {
  k.push(x, z, ry, y);
  k.box(mat, w, h, 0.3, 0, 0, 0, { layer: 'interior' });
  const rows = Math.floor(h / 0.32);
  const colors: MatKey[] = ['paper', 'red', 'graphite', 'amber', 'stoneDark', 'green'];
  for (let r = 0; r < rows; r++) {
    let cx = -w / 2 + 0.06;
    let i = r * 3;
    while (cx < w / 2 - 0.12) {
      const bw = 0.05 + ((i * 37) % 5) * 0.012;
      k.box(colors[i % colors.length], bw, 0.22 - ((i * 13) % 3) * 0.02, 0.2, cx + bw / 2, 0.05 + r * 0.32, 0.08, { layer: 'detail' });
      cx += bw + 0.012;
      i++;
    }
  }
  k.pop();
}

export function plant(k: Kit, x: number, z: number, y: number, s = 1): void {
  k.cyl('graphite', 0.12 * s, 0.22 * s, x, y, z, { layer: 'detail', seg: 8, top: 1.15 });
  k.sphere('grassDeep', 0.22 * s, x, y + 0.36 * s, z, { layer: 'detail', sy: 1.2 });
}

export function railing(k: Kit, x0: number, z0: number, x1: number, z1: number, y: number, h = 0.42, layer: 'shell' | 'interior' | 'detail' = 'shell', mat: MatKey = 'steel'): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(1, Math.round(len / 0.7));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    k.post(mat, x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, y, y + h, 0.02, { layer });
  }
  k.bar(mat, x0, z0, x1, z1, y + h, 0.035, { layer });
  k.bar(mat, x0, z0, x1, z1, y + h * 0.5, 0.02, { layer: 'detail' });
}

/** Straight stair rising along +x local from y0 to y1. */
export function stairs(k: Kit, x: number, z: number, ry: number, y0: number, y1: number, w = 0.8, mat: MatKey = 'concrete'): void {
  const steps = Math.max(4, Math.round((y1 - y0) / 0.16));
  const run = 0.22;
  k.push(x, z, ry);
  for (let i = 0; i < steps; i++) {
    k.box(mat, run, 0.06, w, i * run + run / 2, y0 + ((i + 1) * (y1 - y0)) / steps - 0.06, 0, { layer: 'interior' });
  }
  railing(k, 0, w / 2, steps * run, w / 2, y0 + 0.2, 0.36, 'detail');
  k.pop();
}

/** Static figure (staff, visitors) — neutral, never confused with an agent. */
export function figure(k: Kit, x: number, z: number, y: number, ry = 0, mat: MatKey = 'extra', seated = false): void {
  k.push(x, z, ry, y);
  const base = seated ? 0.2 : 0;
  if (!seated) {
    k.box('extraDark', 0.08, 0.38, 0.09, -0.055, 0, 0, { layer: 'detail' });
    k.box('extraDark', 0.08, 0.38, 0.09, 0.055, 0, 0, { layer: 'detail' });
  } else {
    k.box('extraDark', 0.2, 0.08, 0.3, 0, 0.2, 0.08, { layer: 'detail' });
  }
  k.box(mat, 0.24, 0.32, 0.14, 0, base + 0.38, 0, { layer: 'detail' });
  k.sphere('skin', 0.075, 0, base + 0.79, 0, { layer: 'detail' });
  k.pop();
}

/** Ceiling light panels across a room (lights layer switches with activity). */
export function ceilingLights(k: Kit, w: number, d: number, y: number, cols = 2, rows = 2): void {
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = -w / 2 + (w / cols) * (i + 0.5);
      const z = -d / 2 + (d / rows) * (j + 0.5);
      k.box('lampOff', Math.min(1.0, w / cols - 0.6), 0.03, 0.12, x, y - 0.1, z, { layer: 'lights' });
    }
}

/** Server rack / cabinet. */
export function rack(k: Kit, x: number, z: number, ry: number, y: number, h = 1.1): void {
  k.push(x, z, ry, y);
  k.box('black', 0.42, h, 0.5, 0, 0, 0, { layer: 'interior' });
  for (let i = 0; i < 5; i++) k.box(i % 2 ? 'glowCyan' : 'steelDark', 0.36, 0.02, 0.01, 0, 0.15 + i * (h / 6), 0.255, { layer: 'detail' });
  k.pop();
}

/** Pipe run with supports (industrial). */
export function pipes(k: Kit, x0: number, z0: number, x1: number, z1: number, y: number, n = 2, mat: MatKey = 'steel'): void {
  for (let i = 0; i < n; i++) {
    const o = i * 0.18;
    k.bar(mat, x0, z0 + o, x1, z1 + o, y + i * 0.04, 0.09, { layer: 'shell' });
  }
  const len = Math.hypot(x1 - x0, z1 - z0);
  const supports = Math.max(1, Math.floor(len / 2.2));
  for (let i = 0; i <= supports; i++) {
    const t = i / supports;
    k.post('graphite', x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 0, y - 0.05, 0.04, { layer: 'detail' });
  }
}
