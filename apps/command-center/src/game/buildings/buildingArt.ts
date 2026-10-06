// Procedural, original isometric architecture for every structure type.
// `base` holds the static shapes, `lights` holds emissive parts whose
// intensity reflects project status (active = lit, paused = dim, …).
import type { Graphics } from 'pixi.js';
import type { BuildingType, TerritoryId } from '@/types/domain';
import { boxColors, boxWindows, cylinder, diamond, dome, iso, isoBox, pyramid, shade, tree } from '../world/draw';

export interface Art {
  height: number;
  /** Local points (relative to building origin) that emit smoke / glow. */
  smoke: { x: number; y: number }[];
  beacon: { x: number; y: number };
}

const AMBER = 0xffb44a;
const BLUE = 0x6cc6ff;
const WARM = 0xffd98a;
const GOLD = 0xe2bd5c;

export function drawBuilding(type: BuildingType, s: number, territory: TerritoryId, base: Graphics, lights: Graphics): Art {
  const pad = (w: number, color: number) => diamond(base, 0, 0, w, w, color, 1);
  const smoke: Art['smoke'] = [];
  let height = 60;

  switch (type) {
    case 'citadel': {
      pad(s + 1.2, 0x3c3e44);
      diamond(base, 0, 0, s + 0.6, s + 0.6, 0x55575e);
      isoBox(base, 0, 0, s, s, 18, boxColors(0x5d6068));
      isoBox(base, 0, 0, s - 1.2, s - 1.2, 26, boxColors(0x6a6e78), 18);
      isoBox(base, 0, 0, s - 2.4, s - 2.4, 54, boxColors(0x7a7f8a), 44);
      boxWindows(lights, 0, 0, s - 2.4, s - 2.4, 54, { rows: 6, cols: 2, color: WARM, z: 44 });
      boxWindows(lights, 0, 0, s - 1.2, s - 1.2, 26, { rows: 2, cols: 4, color: WARM, z: 18 });
      // crown + beacon ring
      isoBox(base, 0, 0, 0.9, 0.9, 22, boxColors(0x8a8f9a), 98);
      lights.ellipse(0, -126, 18, 7).stroke({ color: GOLD, width: 2, alpha: 0.9 });
      lights.circle(0, -126, 4).fill(0xfff1c4);
      // corner pylons
      for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
        const p = iso((dx * s) / 2, (dy * s) / 2);
        base.rect(p.x - 2, p.y - 34, 4, 34).fill(0x8a8f9a);
        lights.circle(p.x, p.y - 36, 2.5).fill(GOLD);
      }
      height = 132;
      break;
    }
    case 'techlab': {
      pad(s + 0.4, 0x34363b);
      isoBox(base, 0, 0, s, s - 0.6, 26, boxColors(0x3f4552));
      boxWindows(lights, 0, 0, s, s - 0.6, 26, { rows: 2, cols: 6, color: BLUE, fill: 0.7 });
      isoBox(base, -0.4, -0.3, s - 1.6, s - 2, 20, boxColors(0x4b5262), 26);
      dome(base, iso(0.6, 0).x, iso(0.6, 0).y, 1.0, 0x9fb4c8, 26);
      // holographic ring + data mast
      lights.ellipse(iso(0.6, 0).x, iso(0.6, 0).y - 58, 30, 10).stroke({ color: BLUE, width: 1.5, alpha: 0.85 });
      lights.ellipse(iso(0.6, 0).x, iso(0.6, 0).y - 64, 20, 6).stroke({ color: BLUE, width: 1, alpha: 0.6 });
      const m = iso(-1.2, -0.8);
      base.rect(m.x - 1.5, m.y - 80, 3, 40).fill(0x9aa3b2);
      lights.circle(m.x, m.y - 82, 3).fill(BLUE);
      // molten furnace twin glow (the EAF digital twin)
      const f = iso(1.6, 1.3);
      lights.ellipse(f.x, f.y - 4, 9, 4).fill({ color: 0xff7a2a, alpha: 0.9 });
      height = 90;
      break;
    }
    case 'fortress': {
      pad(s + 0.4, 0x3a3832);
      isoBox(base, 0, 0, s, s, 14, boxColors(0x6a6457));
      isoBox(base, 0, 0, s - 1.4, s - 1.4, 24, boxColors(0x7a7364), 14);
      for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
        const p = iso((dx * (s - 0.4)) / 2, (dy * (s - 0.4)) / 2);
        isoBox(base, p.x, p.y, 0.8, 0.8, 34, boxColors(0x857d6c));
        lights.circle(p.x, p.y - 38, 2.5).fill(AMBER);
      }
      boxWindows(lights, 0, 0, s - 1.4, s - 1.4, 24, { rows: 1, cols: 4, color: AMBER, z: 14 });
      // safety banner
      const b = iso(0, 0);
      base.rect(b.x - 1, b.y - 64, 2, 26).fill(0xd8d0bf);
      lights.poly([b.x + 1, b.y - 64, b.x + 18, b.y - 59, b.x + 1, b.y - 54]).fill(0xf2a33a);
      height = 66;
      break;
    }
    case 'academy': {
      pad(s + 0.4, 0x3a3b40);
      isoBox(base, 0, 0, s, s - 1.4, 30, boxColors(0x5f6a73));
      boxWindows(lights, 0, 0, s, s - 1.4, 30, { rows: 2, cols: 7, color: WARM });
      isoBox(base, 0, 0, s - 2, s - 2.2, 16, boxColors(0x707c86), 30);
      // wings
      const w1 = iso(-0.6, 1.4);
      isoBox(base, w1.x, w1.y, s - 2.2, 1.0, 22, boxColors(0x56616a));
      boxWindows(lights, w1.x, w1.y, s - 2.2, 1.0, 22, { rows: 2, cols: 4, color: WARM });
      // columns
      for (let i = 0; i < 5; i++) {
        const p = iso(s / 2 + 0.05, -1 + i * 0.5);
        base.rect(p.x - 1, p.y - 30, 2, 30).fill(0xb9c0c6);
      }
      height = 70;
      break;
    }
    case 'forge': {
      pad(s + 0.4, 0x2e2c2a);
      isoBox(base, 0, 0, s, s - 1, 34, boxColors(0x4a4440));
      pyramid(base, 0, 0, s, s - 1, 16, 0x5d544d, 34);
      boxWindows(lights, 0, 0, s, s - 1, 34, { rows: 1, cols: 5, color: 0xff7a2a, fill: 0.8 });
      for (const dx of [-0.8, 0.6]) {
        const p = iso(dx, -0.8);
        cylinder(base, p.x, p.y, 0.25, 50, 0x5e5852, 40);
        smoke.push({ x: p.x, y: p.y - 92 });
      }
      // molten pour
      const m = iso(s / 2 + 0.3, 0.8);
      lights.ellipse(m.x, m.y, 12, 5).fill({ color: 0xff6a1a, alpha: 0.95 });
      lights.ellipse(m.x, m.y, 6, 2.5).fill(0xffd27a);
      height = 92;
      break;
    }
    case 'tower': {
      pad(s + 0.2, 0x34353a);
      isoBox(base, 0, 0, s - 0.4, s - 0.4, 16, boxColors(0x4b4f58));
      isoBox(base, 0, 0, 1.4, 1.4, 92, boxColors(0x5a6170), 16);
      boxWindows(lights, 0, 0, 1.4, 1.4, 92, { rows: 10, cols: 2, color: WARM, z: 16 });
      isoBox(base, 0, 0, 1.9, 1.9, 8, boxColors(0x6c7484), 108);
      base.rect(-1, -150, 2, 34).fill(0xb0b6c0);
      lights.circle(0, -152, 3).fill(0xff4d4d);
      height = 152;
      break;
    }
    case 'observatory': {
      const col = territory === 'praxia' ? 0x7a6f58 : territory === 'personal' ? 0x8a9590 : 0x55606e;
      pad(s + 0.2, territory === 'industrial' ? 0x34363b : shade(col, 0.5));
      isoBox(base, 0, 0, s - 0.4, s - 0.4, 14, boxColors(col));
      cylinder(base, 0, 0, 0.9, 30, shade(col, 1.15), 14);
      dome(base, 0, 0, 0.95, territory === 'praxia' ? GOLD : 0xc8d2dc, 44);
      lights.rect(-3, -76, 6, 18).fill({ color: territory === 'praxia' ? WARM : BLUE, alpha: 0.9 });
      boxWindows(lights, 0, 0, s - 0.4, s - 0.4, 14, { rows: 1, cols: 4, color: WARM });
      height = 80;
      break;
    }
    case 'council': {
      pad(s + 0.4, 0x3a3b3f);
      isoBox(base, 0, 0, s, s, 10, boxColors(0x6b6f78));
      isoBox(base, 0, 0, s - 0.8, s - 0.8, 10, boxColors(0x7a7f88), 10);
      isoBox(base, 0, 0, s - 1.6, s - 1.6, 34, boxColors(0x2f3440), 20);
      boxWindows(lights, 0, 0, s - 1.6, s - 1.6, 34, { rows: 3, cols: 3, color: GOLD, z: 20, fill: 0.8 });
      isoBox(base, 0, 0, s - 1.2, s - 1.2, 4, boxColors(0x8d929b), 54);
      height = 62;
      break;
    }
    case 'station': {
      pad(s + 0.6, 0x3b3c40);
      isoBox(base, 0, 0, s, s - 1.2, 6, boxColors(0x6d7078));
      // canopy
      for (const dy of [-0.5, 0.5]) {
        const p = iso(-1, dy), q = iso(1, dy);
        base.rect(p.x - 1, p.y - 30, 2, 24).fill(0x9aa0a8);
        base.rect(q.x - 1, q.y - 30, 2, 24).fill(0x9aa0a8);
      }
      isoBox(base, 0, 0, s + 0.2, s - 0.8, 4, boxColors(0xb98a3c), 30);
      isoBox(base, iso(-0.6, -0.3).x, iso(-0.6, -0.3).y, 1.4, 1.0, 20, boxColors(0x59606b), 6);
      boxWindows(lights, iso(-0.6, -0.3).x, iso(-0.6, -0.3).y, 1.4, 1.0, 20, { rows: 1, cols: 3, color: WARM, z: 6 });
      lights.rect(-14, -40, 28, 4).fill({ color: WARM, alpha: 0.8 });
      height = 44;
      break;
    }
    case 'laboratory': {
      pad(s + 0.2, 0x34363b);
      isoBox(base, 0, 0, s, s - 0.6, 28, boxColors(0x5b6670));
      boxWindows(lights, 0, 0, s, s - 0.6, 28, { rows: 2, cols: 5, color: 0x9ff0c8 });
      for (const dx of [-0.6, 0.4]) {
        const p = iso(dx, -0.3);
        isoBox(base, p.x, p.y, 0.4, 0.4, 14, boxColors(0x8a949e), 28);
      }
      height = 52;
      break;
    }
    case 'temple': {
      pad(s + 0.8, 0x3e3a30);
      for (let i = 0; i < 4; i++) isoBox(base, 0, 0, s - i * 0.8, s - i * 0.8, 12, boxColors(shade(0x8a7f68, 1 - i * 0.04)), i * 12);
      isoBox(base, 0, 0, 1.0, 1.0, 16, boxColors(0x9a8e74), 48);
      pyramid(base, 0, 0, 1.0, 1.0, 16, GOLD, 64);
      boxWindows(lights, 0, 0, 1.0, 1.0, 16, { rows: 1, cols: 1, color: WARM, z: 48, fill: 0.6 });
      // reflecting pool
      const p = iso(s / 2 + 0.6, 0);
      diamond(base, p.x, p.y, 0.8, 2.2, 0x2e6a7e);
      lights.circle(0, -84, 3).fill(0xfff0b8);
      height = 86;
      break;
    }
    case 'studio': {
      pad(s + 0.2, 0x2f3f33);
      isoBox(base, 0, 0, s, s - 0.8, 24, { top: 0x8fb7a8, left: 0x3f6e64, right: 0x5a8f82 });
      boxWindows(lights, 0, 0, s, s - 0.8, 24, { rows: 2, cols: 6, color: 0xe9f7ef, fill: 0.85, alpha: 0.7 });
      isoBox(base, 0, 0, s - 0.6, s - 1.2, 3, boxColors(0x6d6250), 24);
      tree(base, iso(-1.6, 1.2).x, iso(-1.6, 1.2).y, 1.0, 0x2f7a46);
      tree(base, iso(1.5, -1.5).x, iso(1.5, -1.5).y, 1.1, 0x276b3c);
      height = 46;
      break;
    }
    case 'productlab': {
      pad(s + 0.2, 0x2c3a2f);
      isoBox(base, 0, 0, s - 0.4, s - 0.6, 18, boxColors(0x5f5a4c));
      // canopy bridge
      isoBox(base, 0, 0, s + 0.6, 0.5, 3, boxColors(0x7a6c52), 30);
      for (const dx of [-1.5, 1.5]) {
        const p = iso(dx, 0);
        base.rect(p.x - 1, p.y - 30, 2, 30).fill(0x6f6450);
      }
      boxWindows(lights, 0, 0, s - 0.4, s - 0.6, 18, { rows: 1, cols: 4, color: 0x9ff0c8 });
      lights.circle(0, -40, 3).fill(GOLD);
      height = 44;
      break;
    }
    case 'house': {
      pad(s + 0.4, 0x2f3d34);
      isoBox(base, 0, 0, s - 0.4, s - 1.2, 14, boxColors(0xd8d4c8));
      isoBox(base, iso(0.3, 0.3).x, iso(0.3, 0.3).y, s - 1.6, s - 1.8, 12, boxColors(0xc4beb0), 14);
      isoBox(base, 0, 0, s - 0.2, s - 1.0, 2, boxColors(0x5b5f5c), 14);
      boxWindows(lights, 0, 0, s - 0.4, s - 1.2, 14, { rows: 1, cols: 4, color: WARM, fill: 0.8 });
      const pool = iso(s / 2 + 0.5, 0.5);
      diamond(base, pool.x, pool.y, 0.7, 1.4, 0x3a8aa0);
      height = 34;
      break;
    }
    case 'grounds': {
      pad(s + 0.4, 0x2d4033);
      // running / cycling track
      base.ellipse(0, 0, s * 22, s * 11).stroke({ color: 0xa65a3c, width: 6 });
      base.ellipse(0, 0, s * 22 - 8, s * 11 - 4).fill(0x3a6b45);
      base.moveTo(-s * 18, 0).lineTo(s * 18, 0).stroke({ color: 0xe8e8e8, width: 1, alpha: 0.4 });
      const p = iso(-1.4, -1.4);
      isoBox(base, p.x, p.y, 1.2, 1.0, 14, boxColors(0xcfc9bb));
      boxWindows(lights, p.x, p.y, 1.2, 1.0, 14, { rows: 1, cols: 2, color: WARM });
      height = 26;
      break;
    }
    case 'library': {
      pad(s + 0.2, 0x2f3d34);
      isoBox(base, 0, 0, s, s - 0.8, 24, boxColors(0x8c7d69));
      pyramid(base, 0, 0, s, s - 0.8, 14, 0x6e5f4c, 24);
      boxWindows(lights, 0, 0, s, s - 0.8, 24, { rows: 1, cols: 5, color: WARM, fill: 0.6 });
      height = 44;
      break;
    }
    case 'dock': {
      // pier into the lake
      for (let i = 0; i < 4; i++) {
        const p = iso(-1 - i * 0.7, 0.3);
        diamond(base, p.x, p.y, 0.7, 0.6, 0x7a6248);
      }
      isoBox(base, 0, 0, s - 1, s - 1.2, 16, boxColors(0xd6d1c4));
      isoBox(base, 0, 0, s - 0.6, s - 0.9, 3, boxColors(0x4c5a5e), 16);
      boxWindows(lights, 0, 0, s - 1, s - 1.2, 16, { rows: 1, cols: 3, color: WARM });
      const b = iso(-2.6, 1.0);
      base.ellipse(b.x, b.y, 12, 4).fill(0xe8e4da);
      base.rect(b.x - 0.5, b.y - 20, 1, 20).fill(0xcccccc);
      base.poly([b.x + 0.5, b.y - 20, b.x + 9, b.y - 6, b.x + 0.5, b.y - 6]).fill(0xf4f1ea);
      height = 30;
      break;
    }
    case 'hangar': {
      pad(s + 0.6, 0x3a3630);
      isoBox(base, 0, 0, s, s - 0.6, 18, boxColors(0x7d7a74));
      const a = iso(s / 2, 0);
      base.moveTo(a.x - 30, a.y - 18).quadraticCurveTo(a.x - 12, a.y - 48, a.x + 0, a.y - 18).fill(0x8f8b83);
      base.ellipse(0, -30, 40, 18).fill(0x9a968d);
      base.ellipse(0, -36, 34, 12).fill(0xaaa69c);
      lights.rect(a.x - 14, a.y - 16, 12, 14).fill({ color: 0xbfe6ff, alpha: 0.7 });
      lights.circle(0, -52, 2.5).fill(0xbfe6ff);
      height = 56;
      break;
    }
    case 'outpost': {
      pad(s, territory === 'frontier' ? 0x3a3630 : 0x2c3a2f);
      isoBox(base, 0, 0, s - 1, s - 1, 18, boxColors(territory === 'frontier' ? 0x86817a : 0x7a6c52));
      pyramid(base, 0, 0, s - 1, s - 1, 12, territory === 'frontier' ? 0x5d6066 : 0x4f6b46, 18);
      boxWindows(lights, 0, 0, s - 1, s - 1, 18, { rows: 1, cols: 2, color: WARM });
      height = 36;
      break;
    }
  }
  return { height, smoke, beacon: { x: 0, y: -height - 14 } };
}
