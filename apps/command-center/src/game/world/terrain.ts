// Static world layers: ground tiles, water, roads, plaza and decor sprites.
// Ground is one Graphics (static geometry). Decor uses pre-rendered textures
// as Sprites so PixiJS can batch them.
import { Container, Graphics, Sprite, type Renderer, type Texture } from 'pixi.js';
import { CITADEL_TILE, GATES, TERRITORIES, WORLD_SIZE, territoryAt } from '@/data/territories';
import { doorOf, isoToScreen, projectAnchor, citadelAnchor, type Vec } from '@/services/geometry';
import type { Project, TerritoryId } from '@/types/domain';
import { diamond, iso, mix, rock, shade, tree } from './draw';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ───────────── water ─────────────
export function isLake(x: number, y: number): boolean {
  return x <= 5 && y >= 55 && (x - 0) ** 2 / 36 + (y - 64) ** 2 / 100 < 1.15;
}
export function riverX(y: number): number {
  return 61 + Math.sin(y / 5) * 1.2;
}
export function isRiver(x: number, y: number): boolean {
  return y <= 31 && Math.abs(x - riverX(y)) < 0.9;
}
export function isWater(x: number, y: number): boolean {
  return isLake(x, y) || isRiver(x, y);
}

const ROAD_W = 1.2;

/** Road segments (tile space) — main cross roads + spurs from hubs to every structure. */
export function roadSegments(projects: Project[]): [Vec, Vec][] {
  const segs: [Vec, Vec][] = [
    [[32, 1], [32, 63]],
    [[1, 32], [63, 32]],
  ];
  for (const t of TERRITORIES) segs.push([GATES[t.id as Exclude<TerritoryId, 'citadel'>], t.hub]);
  for (const p of projects) {
    if (p.status === 'archived') continue;
    const t = TERRITORIES.find((x) => x.id === p.territory);
    if (!t) continue;
    const d = doorOf(projectAnchor(p));
    // L-shaped spur: hub → corner → door (reads as streets rather than diagonal paths)
    const corner: Vec = [d[0], t.hub[1]];
    segs.push([t.hub, corner], [corner, d]);
  }
  return segs;
}

function onSegment(x: number, y: number, a: Vec, b: Vec, w: number): boolean {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / len2));
  const px = a[0] + t * dx, py = a[1] + t * dy;
  return Math.hypot(x - px, y - py) < w;
}

export function buildGround(projects: Project[]): Graphics {
  const g = new Graphics();
  // Outer bedrock edge so the world reads as a floating "board".
  const edge = (tx: number, ty: number) => isoToScreen(tx, ty);
  const N = WORLD_SIZE;
  const e0 = edge(0, N), e1 = edge(N, N), e2 = edge(N, 0);
  g.poly([e0.x, e0.y, e1.x, e1.y, e1.x, e1.y + 40, e0.x, e0.y + 40]).fill(0x17181b);
  g.poly([e1.x, e1.y, e2.x, e2.y, e2.x, e2.y + 40, e1.x, e1.y + 40]).fill(0x1f2024);

  const segs = roadSegments(projects);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const cx = x + 0.5, cy = y + 0.5;
      const terr = territoryAt(cx, cy);
      const t = TERRITORIES.find((tt) => tt.id === terr);
      const { x: sx, y: sy } = isoToScreen(cx, cy);
      const n = hash(x, y);
      let color: number;
      if (terr === 'citadel' || (Math.abs(cx - 32) < 4.6 && Math.abs(cy - 32) < 4.6)) {
        color = (x + y) % 2 ? 0x4b4d52 : 0x46484d; // plaza paving
      } else if (t) {
        color = mix(t.palette.ground, t.palette.groundAlt, n);
        if (t.id === 'frontier') {
          const far = Math.max(cx, cy) > 50 ? 1 : 0;
          color = mix(color, 0x23211e, far * 0.35 + n * 0.1);
        }
        if (t.id === 'industrial' && (x % 8 === 0 || y % 8 === 0)) color = shade(color, 0.92);
      } else color = 0x2a2a2a;
      if (isWater(cx, cy)) color = mix(0x1d4a5e, 0x245a70, n);
      else if (t && segs.some(([a, b]) => onSegment(cx, cy, a, b, ROAD_W / 2 + 0.05))) {
        color = mix(t.palette.road, 0x55575c, 0.3 + n * 0.1);
      }
      diamond(g, sx, sy, 1.02, 1.02, color);
    }
  }
  // Road edge lines on the main cross roads.
  for (const [a, b] of segs.slice(0, 2)) {
    const pa = isoToScreen(a[0], a[1]), pb = isoToScreen(b[0], b[1]);
    g.moveTo(pa.x, pa.y).lineTo(pb.x, pb.y).stroke({ color: 0xe0c48a, width: 1, alpha: 0.18 });
  }
  // Plaza ring.
  const c = isoToScreen(CITADEL_TILE[0], CITADEL_TILE[1]);
  for (let r = 0; r < 3; r++) {
    const s = 8.6 - r * 0.25;
    const pts = [iso(-s / 2, -s / 2), iso(s / 2, -s / 2), iso(s / 2, s / 2), iso(-s / 2, s / 2)];
    g.poly(pts.flatMap((p) => [p.x + c.x, p.y + c.y])).stroke({ color: 0xd9b46a, width: 1, alpha: 0.12 + r * 0.05 });
  }
  industrialGroundDetails(g);
  return g;
}

function industrialGroundDetails(g: Graphics): void {
  // Railway to the Onboarding Station and the ore yard.
  const rail = (a: Vec, b: Vec) => {
    for (const off of [-0.18, 0.18]) {
      const pa = isoToScreen(a[0], a[1] + off), pb = isoToScreen(b[0], b[1] + off);
      g.moveTo(pa.x, pa.y).lineTo(pb.x, pb.y).stroke({ color: 0x8c8f96, width: 1.2, alpha: 0.8 });
    }
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let i = 0; i <= len * 2; i++) {
      const t = i / (len * 2);
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const p = isoToScreen(x, y - 0.3), q = isoToScreen(x, y + 0.3);
      g.moveTo(p.x, p.y).lineTo(q.x, q.y).stroke({ color: 0x5a4636, width: 2, alpha: 0.7 });
    }
  };
  rail([18, 11.4], [31, 11.4]);
  rail([1, 29.6], [11, 29.6]);
  // Ore yard patches
  for (const [x, y, col] of [[3, 28, 0x6b3b2a], [6, 28.2, 0x5a3426], [9, 28, 0x3e3a37]] as const) {
    const p = isoToScreen(x, y);
    g.ellipse(p.x, p.y, 34, 14).fill({ color: col, alpha: 0.9 });
  }
}

// ───────────── decor textures ─────────────

type DecorKind = 'treeJ' | 'treeJ2' | 'palm' | 'pine' | 'pine2' | 'roundTree' | 'rock' | 'rockDark' | 'ore' | 'stack' | 'crane' | 'tank' | 'container' | 'mountain' | 'flag' | 'scaffold' | 'fog' | 'cliff' | 'bush';

function decorGraphic(kind: DecorKind): Graphics {
  const g = new Graphics();
  switch (kind) {
    case 'treeJ': tree(g, 0, 0, 1.2, 0x2f7a46); break;
    case 'treeJ2': tree(g, 0, 0, 1.5, 0x276b3c); break;
    case 'palm': tree(g, 0, 0, 1.1, 0x3d8a4e, 'palm'); break;
    case 'pine': tree(g, 0, 0, 1.0, 0x2f5f48, 'pine'); break;
    case 'pine2': tree(g, 0, 0, 1.3, 0x335f4a, 'pine'); break;
    case 'roundTree': tree(g, 0, 0, 1.0, 0x4f7d5c); break;
    case 'bush': g.ellipse(0, -3, 7, 4).fill(0x2e6b40); g.ellipse(-3, -5, 4, 3).fill(0x3a7d4c); break;
    case 'rock': rock(g, 0, 0, 1.2, 0x6c6a66); break;
    case 'rockDark': rock(g, 0, 0, 1.5, 0x4c4843); break;
    case 'ore':
      g.poly([-22, 0, 0, -16, 22, 0, 0, 9]).fill(0x7a412c);
      g.poly([-22, 0, 0, -16, 0, 9]).fill(0x5d3021);
      break;
    case 'stack':
      g.ellipse(2, 0, 10, 4).fill({ color: 0, alpha: 0.25 });
      g.rect(-5, -62, 10, 62).fill(0x5a5c62);
      g.rect(0, -62, 5, 62).fill(0x484a4f);
      g.rect(-5, -56, 10, 4).fill(0xc9562a);
      g.rect(-5, -46, 10, 3).fill(0xe8e2d6);
      break;
    case 'crane':
      g.rect(-2, -54, 4, 54).fill(0xd09a2c);
      g.rect(-2, -56, 44, 4).fill(0xd09a2c);
      g.rect(-14, -56, 12, 4).fill(0xb9862a);
      g.rect(-14, -52, 8, 6).fill(0x444);
      g.moveTo(34, -52).lineTo(34, -30).stroke({ color: 0x222, width: 1 });
      g.rect(30, -30, 8, 5).fill(0x666);
      break;
    case 'tank':
      g.ellipse(0, 0, 14, 6).fill(0x3c3e42);
      g.rect(-14, -22, 28, 22).fill(0x8d9198);
      g.rect(0, -22, 14, 22).fill(0x6e7278);
      g.ellipse(0, -22, 14, 6).fill(0xa9adb3);
      break;
    case 'container':
      g.poly([-14, -2, 0, 5, 14, -2, 0, -9]).fill(0x2f6f8f);
      g.poly([-14, -2, 0, 5, 0, -5, -14, -12]).fill(0x24556e);
      g.poly([0, 5, 14, -2, 14, -12, 0, -5]).fill(0x2b6584);
      g.poly([-14, -12, 0, -5, 14, -12, 0, -19]).fill(0x3a86a8);
      break;
    case 'mountain':
      g.poly([-70, 0, -10, -86, 60, 0]).fill(0x3d4a48);
      g.poly([-10, -86, 60, 0, 10, 0]).fill(0x2f3a39);
      g.poly([-22, -68, -10, -86, 4, -66, -6, -62]).fill(0xdfe6e6);
      g.poly([-40, 0, 20, -50, 90, 0]).fill(0x34413f);
      break;
    case 'flag':
      g.rect(-0.5, -18, 1.5, 18).fill(0xcfcfcf);
      g.poly([1, -18, 11, -15, 1, -12]).fill(0xd8b25a);
      g.ellipse(0, 0, 3, 1.4).fill({ color: 0, alpha: 0.3 });
      break;
    case 'scaffold':
      for (const x of [-12, 0, 12]) g.rect(x - 0.6, -30, 1.2, 30).fill(0x9a8c74);
      for (const y of [-10, -20, -30]) g.rect(-12, y, 24, 1.2).fill(0x9a8c74);
      g.moveTo(-12, 0).lineTo(12, -30).stroke({ color: 0x9a8c74, width: 1 });
      break;
    case 'cliff':
      g.poly([-40, 0, -30, -50, 30, -60, 44, 0]).fill(0x4d4a42);
      g.poly([-30, -50, 30, -60, 10, -40, -20, -36]).fill(0x5f5a50);
      g.rect(-6, -56, 12, 56).fill({ color: 0x9ed8f0, alpha: 0.85 });
      g.rect(-3, -56, 3, 56).fill({ color: 0xffffff, alpha: 0.5 });
      g.ellipse(0, 0, 18, 6).fill({ color: 0xd8f2ff, alpha: 0.6 });
      break;
    case 'fog':
      for (let i = 6; i > 0; i--) g.ellipse(0, 0, 18 * i, 8 * i).fill({ color: 0xc9ccd0, alpha: 0.035 });
      break;
  }
  return g;
}

export class DecorAtlas {
  private textures = new Map<DecorKind, { tex: Texture; ax: number; ay: number }>();
  constructor(private renderer: Renderer) {}
  get(kind: DecorKind) {
    let t = this.textures.get(kind);
    if (!t) {
      const g = decorGraphic(kind);
      const b = g.getLocalBounds();
      const tex = this.renderer.generateTexture({ target: g, resolution: 2, antialias: true });
      t = { tex, ax: -b.x / b.width, ay: -b.y / b.height };
      this.textures.set(kind, t);
      g.destroy();
    }
    return t;
  }
  sprite(kind: DecorKind, tx: number, ty: number, scale = 1): Sprite {
    const { tex, ax, ay } = this.get(kind);
    const s = new Sprite(tex);
    s.anchor.set(ax, ay);
    const p = isoToScreen(tx, ty);
    s.position.set(p.x, p.y);
    s.scale.set(scale);
    s.zIndex = p.y;
    s.cullable = true;
    s.eventMode = 'none';
    return s;
  }
  destroy() {
    for (const t of this.textures.values()) t.tex.destroy(true);
    this.textures.clear();
  }
}

/** Decor sprites placed deterministically away from structures, plots and roads. */
export function buildDecor(atlas: DecorAtlas, projects: Project[]): { objects: Sprite[]; fog: Sprite[]; stacks: Vec[] } {
  const r = rng(42);
  const anchors = [...projects.map(projectAnchor), citadelAnchor()];
  const plots = TERRITORIES.flatMap((t) => t.plots);
  const segs = roadSegments(projects);
  const free = (x: number, y: number, pad = 0) =>
    !anchors.some((a) => Math.abs(a.tile[0] - x) < a.size / 2 + 1.6 + pad && Math.abs(a.tile[1] - y) < a.size / 2 + 1.6 + pad) &&
    !plots.some((p) => Math.abs(p[0] - x) < 2.2 && Math.abs(p[1] - y) < 2.2) &&
    !segs.some(([a, b]) => onSegment(x, y, a, b, ROAD_W / 2 + 0.6)) &&
    !isWater(x, y) &&
    !(Math.abs(x - 32) < 5.5 && Math.abs(y - 32) < 5.5);

  const objects: Sprite[] = [];
  const fog: Sprite[] = [];
  const stacks: Vec[] = [];
  const put = (kind: DecorKind, x: number, y: number, scale = 1) => objects.push(atlas.sprite(kind, x, y, scale));

  // Industrial: stacks, cranes, tanks, containers, ore piles.
  const industrialProps: [DecorKind, number, number][] = [
    ['stack', 2.5, 21], ['stack', 3.5, 21.5], ['stack', 9.8, 2.2], ['crane', 19, 13.5], ['crane', 27.5, 20.5],
    ['tank', 10, 10.5], ['tank', 11.2, 11.6], ['tank', 20.5, 2.5], ['container', 28, 12.5], ['container', 29.4, 12.6], ['container', 28.6, 13.6],
    ['ore', 3, 27.6], ['ore', 6, 27.9], ['ore', 9, 27.6], ['container', 18.5, 29.5], ['tank', 1.8, 9],
  ];
  for (const [k, x, y] of industrialProps) {
    if (k !== 'ore' && !free(x, y, -1.2)) continue;
    put(k, x, y);
    if (k === 'stack') stacks.push([x, y]);
  }
  // Praxia: dense jungle, cliff + waterfall at the river source.
  put('cliff', 61.2, 1.2, 1.2);
  for (let i = 0; i < 420; i++) {
    const x = 33.5 + r() * 30, y = 0.5 + r() * 30.5;
    if (!free(x, y)) continue;
    const k: DecorKind = r() < 0.15 ? 'palm' : r() < 0.5 ? 'treeJ2' : r() < 0.85 ? 'treeJ' : 'bush';
    put(k, x, y, 0.85 + r() * 0.4);
  }
  // Personal: mountains on the far edge, pines, a few round trees.
  for (const [x, y, s] of [[1.5, 37, 1.1], [1.2, 44, 1.4], [1.8, 50.5, 1.0], [6, 34.2, 0.8]] as const) put('mountain', x, y, s);
  for (let i = 0; i < 170; i++) {
    const x = 0.5 + r() * 30.5, y = 33.5 + r() * 30;
    if (!free(x, y) || x < 3.2) continue;
    put(r() < 0.7 ? (r() < 0.5 ? 'pine' : 'pine2') : 'roundTree', x, y, 0.8 + r() * 0.35);
  }
  // Frontier: rocks, survey flags, unfinished scaffolds; fog over the unexplored half.
  for (let i = 0; i < 60; i++) {
    const x = 33.5 + r() * 30, y = 33.5 + r() * 30;
    if (!free(x, y)) continue;
    put(r() < 0.6 ? 'rock' : 'rockDark', x, y, 0.7 + r() * 0.6);
  }
  for (const [x, y] of [[46, 50], [51, 44], [57, 52], [39, 47]] as const) if (free(x, y, -1)) put('flag', x, y);
  for (const [x, y] of [[50, 57], [58, 41]] as const) if (free(x, y, -1)) put('scaffold', x, y);
  for (let i = 0; i < 18; i++) {
    const x = 46 + r() * 18, y = 46 + r() * 18;
    if (x < 50 && y < 50) continue;
    const s = atlas.sprite('fog', x, y, 1.6 + r() * 1.4);
    s.alpha = 0.6;
    s.zIndex = 0;
    fog.push(s);
  }
  return { objects, fog, stacks };
}

export function newGroundLayer(projects: Project[]): Container {
  const c = new Container();
  c.addChild(buildGround(projects));
  return c;
}
