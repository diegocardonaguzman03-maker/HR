// The model base: territory plinths, canals, the round Command plaza, bridges,
// footpaths, vegetation (instanced) and quiet set dressing that tells each
// territory's story (steel coils and rail wagons, jungle, gardens, survey stakes).
import * as THREE from 'three';
import { GATE_RING } from '@/data/territories';
import type { TerritoryId } from '@/types/domain';
import { Kit } from './kit';
import { MAT, type MatKey } from './materials';
import { gateWorld, hubWorld, PLAZA_R, PLINTHS, type PlinthRect } from './space';

export const PLINTH_DEPTH = 2.4;
const TOP: Record<PlinthRect['id'], number> = {
  industrial: 0xb2ada2,
  praxia: 0x7f9670,
  personal: 0xa9b38c,
  frontier: 0xcfc3a8,
};

export interface Obstacle {
  x: number;
  z: number;
  r: number;
}

function rng(seed: number) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

export function buildBase(): THREE.Group {
  const g = new THREE.Group();
  // display table + water bed
  const table = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb9b6ae, roughness: 1 }));
  table.position.y = -PLINTH_DEPTH;
  table.receiveShadow = true;
  g.add(table);
  const ext = 76;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(ext * 2 + 4, PLINTH_DEPTH - 0.6, ext * 2 + 4), MAT.plinthSide);
  frame.position.y = -PLINTH_DEPTH + (PLINTH_DEPTH - 0.6) / 2;
  frame.receiveShadow = true;
  g.add(frame);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(ext * 2 + 3, ext * 2 + 3).rotateX(-Math.PI / 2), MAT.water);
  water.position.y = -0.55;
  water.receiveShadow = true;
  g.add(water);

  for (const p of PLINTHS) {
    const shape = roundedRect(p.x0, -p.z1, p.x1 - p.x0, p.z1 - p.z0, 1.4);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: PLINTH_DEPTH, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 1, curveSegments: 6 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -PLINTH_DEPTH, 0);
    const top = new THREE.MeshStandardMaterial({ color: TOP[p.id], roughness: 1 });
    const mesh = new THREE.Mesh(geo, [top, MAT.plinthSide]);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.position.y = -0.08;
    g.add(mesh);
  }

  // Command plaza: stepped round platform with a fine ring pattern
  const k = new Kit();
  k.cyl('plinthSide', PLAZA_R + 0.3, PLINTH_DEPTH, 0, -PLINTH_DEPTH, 0, { seg: 64 });
  k.cyl('path', PLAZA_R, 0.06, 0, 0, 0, { seg: 64 });
  for (let i = 1; i <= 3; i++) k.add('stone', new THREE.RingGeometry(PLAZA_R - i * 1.6, PLAZA_R - i * 1.6 + 0.06, 64).rotateX(-Math.PI / 2), 0, 0.065, 0, 1, 1, 1);
  // ring walk around the plaza + bridges across the canals
  for (let i = 0; i < GATE_RING.length; i++) {
    const a = gateWorld(GATE_RING[i]);
    const b = gateWorld(GATE_RING[(i + 1) % GATE_RING.length]);
    bridge(k, a.x, a.z, b.x, b.z);
    k.cyl('path', 1.0, 0.05, a.x, 0, a.z, { seg: 20 });
  }
  const built = k.build();
  for (const m of built.group.children as THREE.Mesh[]) m.receiveShadow = true;
  g.add(built.group);
  return g;
}

function bridge(k: Kit, x0: number, z0: number, x1: number, z1: number): void {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const ry = Math.atan2(-(z1 - z0), x1 - x0);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  k.push(cx, cz, ry);
  k.box('path', len, 0.12, 1.4, 0, -0.06, 0);
  k.box('stone', len * 0.55, 0.5, 1.5, 0, -0.62, 0);
  for (const s of [-0.72, 0.72]) {
    k.box('steelDark', len * 0.6, 0.04, 0.04, 0, 0.42, s);
    for (let i = 0; i <= 6; i++) k.post('steelDark', -len * 0.3 + (len * 0.6 * i) / 6, s, 0, 0.42, 0.02);
  }
  k.pop();
}

function roundedRect(x: number, y: number, w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export interface PathDoor {
  territory: TerritoryId;
  door: { x: number; z: number };
}

/** Footpaths: door → street corner → territory hub → gate. Rebuilt when structures change. */
export function buildPaths(doors: PathDoor[]): { group: THREE.Group; segments: [THREE.Vector2, THREE.Vector2][] } {
  const k = new Kit();
  const segs: [THREE.Vector2, THREE.Vector2][] = [];
  const seg = (ax: number, az: number, bx: number, bz: number, mat: MatKey = 'path', w = 1.1) => {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.05) return;
    k.box(mat, len + w, 0.035, w, (ax + bx) / 2, 0, (az + bz) / 2, { ry: Math.atan2(-(bz - az), bx - ax) });
    segs.push([new THREE.Vector2(ax, az), new THREE.Vector2(bx, bz)]);
  };
  for (const id of GATE_RING) {
    const h = hubWorld(id);
    const gt = gateWorld(id);
    seg(h.x, h.z, gt.x, gt.z, 'path', 1.5);
    k.cyl('path', 1.3, 0.04, h.x, 0, h.z, { seg: 24 });
  }
  for (const d of doors) {
    if (d.territory === 'citadel') continue;
    const h = hubWorld(d.territory as PlinthRect['id']);
    seg(d.door.x, d.door.z, h.x, d.door.z);
    seg(h.x, d.door.z, h.x, h.z);
  }
  const built = k.build();
  for (const m of built.group.children as THREE.Mesh[]) {
    m.receiveShadow = true;
    m.castShadow = false;
  }
  return { group: built.group, segments: segs };
}

// ───────────────────────── vegetation ─────────────────────────

interface Species {
  crown: THREE.BufferGeometry;
  trunkH: number;
  color: number[];
}

const SPECIES: Record<'round' | 'tall' | 'palm' | 'shrub' | 'rock', Species> = {
  round: { crown: new THREE.IcosahedronGeometry(0.75, 3), trunkH: 0.7, color: [0x6f8a5c, 0x7d9566, 0x62804f] },
  tall: { crown: new THREE.ConeGeometry(0.6, 1.9, 7).translate(0, 0.5, 0), trunkH: 0.5, color: [0x4f6b47, 0x5a7650] },
  palm: { crown: new THREE.IcosahedronGeometry(0.95, 2).scale(1, 0.5, 1), trunkH: 1.7, color: [0x4c7046, 0x58794c, 0x3f5f3c] },
  shrub: { crown: new THREE.IcosahedronGeometry(0.45, 2).scale(1, 0.7, 1), trunkH: 0, color: [0x7a8f5f, 0x8c9a6a, 0x6d8458] },
  rock: { crown: new THREE.DodecahedronGeometry(0.5, 0).scale(1, 0.6, 1), trunkH: 0, color: [0xa79f90, 0x948c7e, 0xb8b0a1] },
};

export class Vegetation {
  readonly group = new THREE.Group();
  private sets: { crowns: THREE.InstancedMesh; trunks: THREE.InstancedMesh | null; items: { x: number; z: number; s: number; h: number }[] }[] = [];

  constructor(obstacles: Obstacle[], paths: [THREE.Vector2, THREE.Vector2][]) {
    const r = rng(7);
    const plan: { id: PlinthRect['id']; species: keyof typeof SPECIES; n: number; s: [number, number] }[] = [
      { id: 'industrial', species: 'round', n: 46, s: [0.7, 1.0] },
      { id: 'industrial', species: 'shrub', n: 40, s: [0.6, 1.0] },
      { id: 'praxia', species: 'palm', n: 70, s: [0.8, 1.25] },
      { id: 'praxia', species: 'round', n: 110, s: [0.9, 1.5] },
      { id: 'praxia', species: 'tall', n: 50, s: [0.8, 1.3] },
      { id: 'praxia', species: 'shrub', n: 90, s: [0.8, 1.3] },
      { id: 'personal', species: 'round', n: 80, s: [0.8, 1.2] },
      { id: 'personal', species: 'shrub', n: 80, s: [0.7, 1.1] },
      { id: 'personal', species: 'tall', n: 24, s: [0.7, 1.0] },
      { id: 'frontier', species: 'rock', n: 60, s: [0.5, 1.8] },
      { id: 'frontier', species: 'shrub', n: 40, s: [0.5, 0.9] },
      { id: 'frontier', species: 'tall', n: 14, s: [0.7, 1.0] },
    ];
    const trunkGeo = new THREE.CylinderGeometry(0.07, 0.1, 1, 6).translate(0, 0.5, 0);
    for (const p of plan) {
      const rect = PLINTHS.find((x) => x.id === p.id)!;
      const sp = SPECIES[p.species];
      const items: { x: number; z: number; s: number; h: number }[] = [];
      let tries = 0;
      while (items.length < p.n && tries < p.n * 40) {
        tries++;
        const x = rect.x0 + 1.5 + r() * (rect.x1 - rect.x0 - 3);
        const z = rect.z0 + 1.5 + r() * (rect.z1 - rect.z0 - 3);
        if (Math.hypot(x, z) < PLAZA_R + 3) continue;
        if (obstacles.some((o) => Math.hypot(o.x - x, o.z - z) < o.r)) continue;
        if (paths.some(([a, b]) => distToSeg(x, z, a, b) < 1.6)) continue;
        // industrial greenery stays tidy: along streets only
        if (p.id === 'industrial' && p.species === 'round' && !paths.some(([a, b]) => distToSeg(x, z, a, b) < 3.2)) continue;
        items.push({ x, z, s: p.s[0] + r() * (p.s[1] - p.s[0]), h: r() });
      }
      const mat = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: p.species === 'rock' || p.species === 'tall' });
      const crowns = new THREE.InstancedMesh(sp.crown, mat, items.length);
      const trunks = sp.trunkH > 0 ? new THREE.InstancedMesh(trunkGeo, MAT.woodDark, items.length) : null;
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const col = new THREE.Color();
      items.forEach((it, i) => {
        const th = sp.trunkH * it.s;
        q.setFromEuler(new THREE.Euler(0, it.h * 6, 0));
        m4.compose(new THREE.Vector3(it.x, th + (p.species === 'rock' ? 0.1 : sp.trunkH ? 0.45 * it.s : 0.25 * it.s), it.z), q, new THREE.Vector3(it.s, it.s, it.s));
        crowns.setMatrixAt(i, m4);
        crowns.setColorAt(i, col.setHex(sp.color[i % sp.color.length]).offsetHSL(0, 0, (it.h - 0.5) * 0.06));
        if (trunks) {
          m4.compose(new THREE.Vector3(it.x, 0, it.z), q, new THREE.Vector3(it.s, th + 0.3, it.s));
          trunks.setMatrixAt(i, m4);
        }
      });
      crowns.castShadow = true;
      crowns.receiveShadow = true;
      this.group.add(crowns);
      if (trunks) {
        trunks.castShadow = true;
        this.group.add(trunks);
      }
      this.sets.push({ crowns, trunks, items });
    }
  }

  /** Remove vegetation where a new structure appears. */
  clearAround(x: number, z: number, r: number): void {
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (const s of this.sets) {
      let dirty = false;
      s.items.forEach((it, i) => {
        if (Math.hypot(it.x - x, it.z - z) < r) {
          s.crowns.setMatrixAt(i, zero);
          s.trunks?.setMatrixAt(i, zero);
          dirty = true;
        }
      });
      if (dirty) {
        s.crowns.instanceMatrix.needsUpdate = true;
        if (s.trunks) s.trunks.instanceMatrix.needsUpdate = true;
      }
    }
  }
}

function distToSeg(x: number, z: number, a: THREE.Vector2, b: THREE.Vector2): number {
  const dx = b.x - a.x;
  const dz = b.y - a.y;
  const l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.y) * dz) / l2));
  return Math.hypot(x - (a.x + t * dx), z - (a.y + t * dz));
}

// ───────────────────────── set dressing ─────────────────────────

/** Static storytelling props per territory (kept clear of structures). */
export function buildDressing(obstacles: Obstacle[]): THREE.Group {
  const k = new Kit();
  const free = (x: number, z: number, r: number) => !obstacles.some((o) => Math.hypot(o.x - x, o.z - z) < o.r + r) && Math.hypot(x, z) > PLAZA_R + 2;
  const ind = PLINTHS.find((p) => p.id === 'industrial')!;
  // perimeter haul road + rail siding with ore wagons along the outer edges
  const rz = ind.z0 + 2.2;
  k.box('asphalt', ind.x1 - ind.x0 - 3, 0.03, 2.2, (ind.x0 + ind.x1) / 2, 0, rz);
  for (let x = ind.x0 + 3; x < ind.x1 - 3; x += 2.4) k.box('white', 1.0, 0.035, 0.08, x, 0, rz, { layer: 'detail' });
  const railX = ind.x0 + 2.0;
  k.box('steelDark', 0.06, 0.06, ind.z1 - ind.z0 - 8, railX - 0.35, 0, (ind.z0 + ind.z1) / 2 + 2);
  k.box('steelDark', 0.06, 0.06, ind.z1 - ind.z0 - 8, railX + 0.35, 0, (ind.z0 + ind.z1) / 2 + 2);
  for (let z = ind.z0 + 6; z < ind.z1 - 2; z += 0.6) k.box('woodDark', 1.0, 0.04, 0.14, railX, 0, z, { layer: 'detail' });
  for (let i = 0; i < 4; i++) {
    const z = ind.z0 + 14 + i * 2.3;
    k.box('graphite', 0.9, 0.12, 2.0, railX, 0.12, z);
    k.box('red', 0.9, 0.55, 2.0, railX, 0.24, z);
    k.box('stoneDark', 0.8, 0.12, 1.8, railX, 0.79, z);
  }
  // steel coil yard + containers
  const yard = [
    { x: -30, z: -60 },
    { x: -44, z: -6.5 },
  ];
  for (const y of yard) {
    if (!free(y.x, y.z, 3)) continue;
    for (let i = 0; i < 6; i++) {
      const cx = y.x + (i % 3) * 0.9;
      const cz = y.z + Math.floor(i / 3) * 1.0;
      k.cyl('steel', 0.38, 0.55, cx, 0.38, cz, { rx: Math.PI / 2, seg: 16 });
      k.cyl('graphite', 0.14, 0.56, cx, 0.38, cz - 0.005, { rx: Math.PI / 2, seg: 10, layer: 'detail' });
    }
    for (let i = 0; i < 2; i++) k.box(i ? 'red' : 'graphite', 2.4, 1.0, 0.95, y.x + 4, i * 1.0, y.z + 0.5);
  }
  // parked cars along industrial streets
  for (let i = 0; i < 8; i++) {
    const x = -24 + (i % 4) * 1.2;
    const z = -42 + Math.floor(i / 4) * 2.4;
    if (!free(x, z, 1)) continue;
    car(k, x, z, Math.PI / 2, (['offwhite', 'graphite', 'steel', 'red'] as MatKey[])[i % 4]);
  }
  // personal: garden walls, benches and a lake edge
  const per = PLINTHS.find((p) => p.id === 'personal')!;
  for (let i = 0; i < 10; i++) {
    const x = per.x0 + 6 + i * 4.5;
    const z = per.z1 - 3;
    if (free(x, z, 1.2)) k.box('wood', 1.2, 0.2, 0.36, x, 0, z, { layer: 'detail' });
  }
  // frontier: survey stakes and a beacon mast
  const fr = PLINTHS.find((p) => p.id === 'frontier')!;
  const r = rng(11);
  for (let i = 0; i < 18; i++) {
    const x = fr.x0 + 6 + r() * (fr.x1 - fr.x0 - 12);
    const z = fr.z0 + 6 + r() * (fr.z1 - fr.z0 - 12);
    if (!free(x, z, 1)) continue;
    k.post('amber', x, z, 0, 0.6, 0.03);
    k.box('red', 0.12, 0.08, 0.02, x + 0.06, 0.5, z, { layer: 'detail' });
  }
  k.post('steel', (fr.x0 + fr.x1) / 2 + 12, (fr.z0 + fr.z1) / 2 + 10, 0, 6, 0.06);
  k.box('red', 0.2, 0.2, 0.2, (fr.x0 + fr.x1) / 2 + 12, 6, (fr.z0 + fr.z1) / 2 + 10);
  const built = k.build();
  return built.group;
}

export function car(k: Kit, x: number, z: number, ry: number, mat: MatKey): void {
  k.push(x, z, ry);
  k.box(mat, 1.0, 0.24, 0.46, 0, 0.08, 0);
  k.box('glassTint', 0.55, 0.18, 0.42, -0.05, 0.32, 0);
  k.box(mat, 0.5, 0.03, 0.42, -0.05, 0.5, 0);
  for (const [wx, wz] of [[-0.32, 0.22], [0.32, 0.22], [-0.32, -0.22], [0.32, -0.22]] as const) k.cyl('black', 0.1, 0.06, wx, 0.1, wz, { rx: Math.PI / 2, seg: 10 });
  k.pop();
}

// ───────────────────────── contour hills ─────────────────────────

const HILL_SITES: { id: PlinthRect['id']; fx: number; fz: number; r: number; layers: number }[] = [
  { id: 'frontier', fx: 0.72, fz: 0.3, r: 9, layers: 5 },
  { id: 'frontier', fx: 0.35, fz: 0.75, r: 7, layers: 4 },
  { id: 'frontier', fx: 0.8, fz: 0.8, r: 6, layers: 3 },
  { id: 'frontier', fx: 0.3, fz: 0.3, r: 5, layers: 3 },
  { id: 'praxia', fx: 0.82, fz: 0.18, r: 7, layers: 4 },
  { id: 'praxia', fx: 0.2, fz: 0.15, r: 5, layers: 3 },
  { id: 'personal', fx: 0.15, fz: 0.2, r: 5.5, layers: 3 },
];

const HILL_TONES: Record<PlinthRect['id'], number[]> = {
  industrial: [0xb2ada2],
  praxia: [0x7a926b, 0x86a076, 0x92aa80, 0x9db48a],
  personal: [0xa4ae86, 0xaeb791, 0xb8c09c],
  frontier: [0xcabd9f, 0xd2c6a9, 0xd9ceb3, 0xe0d6bd, 0xe6ddc6],
};

/** Stacked contour plates — the classic architectural-model landform. */
export function buildHills(obstacles: Obstacle[]): { group: THREE.Group; hills: Obstacle[] } {
  const group = new THREE.Group();
  const hills: Obstacle[] = [];
  const r = rng(29);
  for (const site of HILL_SITES) {
    const rect = PLINTHS.find((p) => p.id === site.id)!;
    const cx = rect.x0 + (rect.x1 - rect.x0) * site.fx;
    const cz = rect.z0 + (rect.z1 - rect.z0) * site.fz;
    if (obstacles.some((o) => Math.hypot(o.x - cx, o.z - cz) < o.r + site.r)) continue;
    if (Math.hypot(cx, cz) < PLAZA_R + site.r + 4) continue;
    hills.push({ x: cx, z: cz, r: site.r + 0.8 });
    const seeds = Array.from({ length: 7 }, () => r() * Math.PI * 2);
    for (let l = 0; l < site.layers; l++) {
      const rad = site.r * (1 - l / (site.layers + 0.6));
      const shape = new THREE.Shape();
      const n = 40;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const wob = 1 + 0.12 * Math.sin(a * 2 + seeds[0] + l * 0.4) + 0.07 * Math.sin(a * 3 + seeds[1]) + 0.04 * Math.sin(a * 5 + seeds[2]);
        const x = Math.cos(a) * rad * wob + Math.cos(seeds[3]) * l * 0.35;
        const y = Math.sin(a) * rad * wob * 0.85 + Math.sin(seeds[3]) * l * 0.35;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: false, curveSegments: 4 });
      geo.rotateX(-Math.PI / 2);
      const tones = HILL_TONES[site.id];
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: tones[Math.min(l, tones.length - 1)], roughness: 1 }));
      mesh.position.set(cx, l * 0.32, cz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  }
  return { group, hills };
}
