// Low-level isometric drawing helpers (PixiJS v8 Graphics).
import type { Graphics } from 'pixi.js';
import { TILE_H, TILE_W } from '@/services/geometry';

export type Pt = { x: number; y: number };

/** Tile-unit offset → local screen offset. */
export const iso = (dx: number, dy: number): Pt => ({ x: (dx - dy) * (TILE_W / 2), y: (dx + dy) * (TILE_H / 2) });

export function shade(color: number, f: number): number {
  const r = Math.min(255, Math.max(0, Math.round(((color >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((color >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((color & 255) * f)));
  return (r << 16) | (g << 8) | b;
}

export function mix(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t);
}

const flat = (pts: Pt[]) => pts.flatMap((p) => [p.x, p.y]);

/** Filled diamond on the ground (w × d tiles) centred at (ox, oy). */
export function diamond(g: Graphics, ox: number, oy: number, w: number, d: number, color: number, alpha = 1, z = 0): void {
  const a = iso(-w / 2, -d / 2), b = iso(w / 2, -d / 2), c = iso(w / 2, d / 2), e = iso(-w / 2, d / 2);
  g.poly(flat([a, b, c, e].map((p) => ({ x: p.x + ox, y: p.y + oy - z })))).fill({ color, alpha });
}

export function diamondStroke(g: Graphics, ox: number, oy: number, w: number, d: number, color: number, width = 1, alpha = 1): void {
  const a = iso(-w / 2, -d / 2), b = iso(w / 2, -d / 2), c = iso(w / 2, d / 2), e = iso(-w / 2, d / 2);
  g.poly(flat([a, b, c, e].map((p) => ({ x: p.x + ox, y: p.y + oy })))).stroke({ color, width, alpha });
}

export interface BoxColors {
  top: number;
  left: number;
  right: number;
  edge?: number;
}

export function boxColors(base: number): BoxColors {
  return { top: shade(base, 1.18), right: shade(base, 0.86), left: shade(base, 0.62) };
}

/** Isometric box (w × d tiles, h px tall) sitting at elevation z, centred at (ox, oy). */
export function isoBox(g: Graphics, ox: number, oy: number, w: number, d: number, h: number, c: BoxColors, z = 0): void {
  const P = (dx: number, dy: number, up: number): Pt => {
    const p = iso(dx, dy);
    return { x: p.x + ox, y: p.y + oy - up };
  };
  const top = [P(-w / 2, -d / 2, z + h), P(w / 2, -d / 2, z + h), P(w / 2, d / 2, z + h), P(-w / 2, d / 2, z + h)];
  const left = [P(-w / 2, d / 2, z), P(w / 2, d / 2, z), P(w / 2, d / 2, z + h), P(-w / 2, d / 2, z + h)];
  const right = [P(w / 2, d / 2, z), P(w / 2, -d / 2, z), P(w / 2, -d / 2, z + h), P(w / 2, d / 2, z + h)];
  g.poly(flat(left)).fill(c.left);
  g.poly(flat(right)).fill(c.right);
  g.poly(flat(top)).fill(c.top);
  if (c.edge !== undefined) {
    g.poly(flat(top)).stroke({ color: c.edge, width: 1, alpha: 0.5 });
  }
}

/** Windows on the two visible faces of a box. */
export function boxWindows(
  g: Graphics,
  ox: number,
  oy: number,
  w: number,
  d: number,
  h: number,
  opts: { rows: number; cols: number; color: number; alpha?: number; z?: number; fill?: number },
): void {
  const { rows, cols, color, alpha = 1, z = 0, fill = 0.55 } = opts;
  const face = (from: [number, number], to: [number, number]) => {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const u0 = (c + (1 - fill) / 2) / cols, u1 = (c + 1 - (1 - fill) / 2) / cols;
        const v0 = z + ((r + 0.3) / rows) * h, v1 = z + ((r + 0.75) / rows) * h;
        const p = (u: number, v: number): Pt => {
          const q = iso(from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u);
          return { x: q.x + ox, y: q.y + oy - v };
        };
        g.poly(flat([p(u0, v0), p(u1, v0), p(u1, v1), p(u0, v1)])).fill({ color, alpha });
      }
  };
  face([-w / 2, d / 2], [w / 2, d / 2]); // left-visible face
  face([w / 2, d / 2], [w / 2, -d / 2]); // right-visible face
}

/** Vertical cylinder (approximated by an ellipse body + top). */
export function cylinder(g: Graphics, ox: number, oy: number, r: number, h: number, base: number, z = 0): void {
  const rx = r * (TILE_W / 2) * 1.0;
  const ry = r * (TILE_H / 2) * 1.0;
  g.rect(ox - rx, oy - z - h, rx * 2, h).fill(shade(base, 0.78));
  g.rect(ox, oy - z - h, rx, h).fill({ color: shade(base, 0.62), alpha: 0.6 });
  g.ellipse(ox, oy - z, rx, ry).fill(shade(base, 0.7));
  g.ellipse(ox, oy - z - h, rx, ry).fill(shade(base, 1.15));
}

/** Dome on top of something. */
export function dome(g: Graphics, ox: number, oy: number, r: number, color: number, z: number): void {
  const rx = r * (TILE_W / 2);
  const ry = r * (TILE_H / 2);
  g.ellipse(ox, oy - z, rx, ry).fill(shade(color, 0.8));
  g.moveTo(ox - rx, oy - z).arc(ox, oy - z, rx, Math.PI, 0).closePath().fill(color);
  g.moveTo(ox - rx * 0.5, oy - z - rx * 0.55).arc(ox - rx * 0.2, oy - z - rx * 0.5, rx * 0.35, Math.PI * 1.1, Math.PI * 1.7).stroke({ color: 0xffffff, width: 2, alpha: 0.25 });
}

/** Pyramid / stepped roof point. */
export function pyramid(g: Graphics, ox: number, oy: number, w: number, d: number, h: number, base: number, z = 0): void {
  const P = (dx: number, dy: number, up: number): Pt => {
    const p = iso(dx, dy);
    return { x: p.x + ox, y: p.y + oy - up };
  };
  const apex = { x: ox, y: oy - z - h };
  g.poly(flat([P(-w / 2, d / 2, z), P(w / 2, d / 2, z), apex])).fill(shade(base, 0.65));
  g.poly(flat([P(w / 2, d / 2, z), P(w / 2, -d / 2, z), apex])).fill(shade(base, 0.9));
}

export function tree(g: Graphics, x: number, y: number, s: number, color: number, kind: 'round' | 'pine' | 'palm' = 'round'): void {
  g.ellipse(x + 2 * s, y + 1, 7 * s, 3 * s).fill({ color: 0x000000, alpha: 0.22 });
  if (kind === 'pine') {
    g.rect(x - 1 * s, y - 4 * s, 2 * s, 5 * s).fill(0x3a2a1e);
    g.poly([x - 7 * s, y - 4 * s, x + 7 * s, y - 4 * s, x, y - 20 * s]).fill(shade(color, 0.8));
    g.poly([x - 5 * s, y - 11 * s, x + 5 * s, y - 11 * s, x, y - 25 * s]).fill(color);
    return;
  }
  if (kind === 'palm') {
    g.rect(x - 1 * s, y - 16 * s, 2 * s, 17 * s).fill(0x4a3a28);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      g.ellipse(x + Math.cos(a) * 6 * s, y - 17 * s + Math.sin(a) * 2.5 * s, 6 * s, 2.4 * s).fill(i % 2 ? color : shade(color, 0.8));
    }
    return;
  }
  g.rect(x - 1.2 * s, y - 6 * s, 2.4 * s, 7 * s).fill(0x3b2c20);
  g.circle(x, y - 11 * s, 7 * s).fill(shade(color, 0.78));
  g.circle(x - 2 * s, y - 13 * s, 5 * s).fill(color);
  g.circle(x + 3 * s, y - 12 * s, 4 * s).fill(shade(color, 1.1));
}

export function rock(g: Graphics, x: number, y: number, s: number, color: number): void {
  g.poly([x - 6 * s, y, x - 3 * s, y - 5 * s, x + 3 * s, y - 6 * s, x + 6 * s, y - 1 * s, x + 2 * s, y + 2 * s]).fill(color);
  g.poly([x - 3 * s, y - 5 * s, x + 3 * s, y - 6 * s, x + 1 * s, y - 2 * s]).fill(shade(color, 1.2));
}
