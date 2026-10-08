// Building recipes — one micro-environment per structure type. Each recipe
// models the architecture (cutaway-ready) and the workspaces inside it, and
// registers where agents work, meet and wait.
import * as THREE from 'three';
import type { BuildingType, TerritoryId } from '@/types/domain';
import { Kit, type ScreenKind } from './kit';
import type { MatKey } from './materials';
import { chair, desk, DESK_H, figure, meetingTable, pipes, plant, rack, railing, roundTable, screenWall, shelf, stairs } from './props';
import { PODIUM_H, roof, shell } from './shell';

export interface Palette {
  wall: MatKey;
  frame: MatKey;
  slab: MatKey;
  floor: MatKey;
  accent: MatKey;
  podium: MatKey;
}

export const PALETTES: Record<'industrial' | 'technology' | 'praxia' | 'personal' | 'frontier' | 'citadel', Palette> = {
  industrial: { wall: 'offwhite', frame: 'graphite', slab: 'concrete', floor: 'floor', accent: 'red', podium: 'concreteDark' },
  technology: { wall: 'white', frame: 'graphite', slab: 'white', floor: 'floorTech', accent: 'cyan', podium: 'concrete' },
  praxia: { wall: 'stone', frame: 'woodDark', slab: 'stone', floor: 'floorWood', accent: 'green', podium: 'stoneDark' },
  personal: { wall: 'offwhite', frame: 'wood', slab: 'offwhite', floor: 'floorWood', accent: 'wood', podium: 'stone' },
  frontier: { wall: 'concrete', frame: 'steelDark', slab: 'concrete', floor: 'floorDark', accent: 'amber', podium: 'sand' },
  citadel: { wall: 'white', frame: 'graphite', slab: 'white', floor: 'floorTech', accent: 'amber', podium: 'stone' },
};

export function paletteFor(type: BuildingType, territory: TerritoryId): Palette {
  if (type === 'citadel') return PALETTES.citadel;
  if (type === 'techlab' || type === 'tower') return PALETTES.technology;
  if (territory === 'industrial') return type === 'observatory' || type === 'council' || type === 'station' ? PALETTES.technology : PALETTES.industrial;
  if (territory === 'praxia') return PALETTES.praxia;
  if (territory === 'personal') return PALETTES.personal;
  return PALETTES.frontier;
}

export interface Anim {
  /** t = seconds, activity = 0..1 (how busy the building is). */
  (t: number, dt: number, activity: number): void;
}

export interface Recipe {
  kit: Kit;
  /** Extra moving parts (built separately so they can animate). */
  movers: THREE.Object3D[];
  anims: Anim[];
  /** Approximate height of the structure (for labels and roofs). */
  height: number;
  /** Physical sign position (local) and facing. */
  sign: { x: number; z: number; ry: number };
  /** Entrance (local) — agents walk in and out through here. */
  door: { x: number; z: number };
}

interface Ctx {
  w: number;
  d: number;
  pal: Palette;
  territory: TerritoryId;
}

const newRecipe = (kit: Kit, c: Ctx, height: number): Recipe => ({
  kit,
  movers: [],
  anims: [],
  height,
  sign: { x: c.w / 2 + 0.2, z: c.d / 2 + 0.9, ry: Math.PI / 4 },
  door: { x: c.w * 0.18, z: c.d / 2 + 0.9 },
});

/** Merge a small kit into a standalone movable object. */
function mover(build: (k: Kit) => void): THREE.Group {
  const k = new Kit();
  build(k);
  return k.build().group;
}

// ───────────────────────── reusable set pieces ─────────────────────────

/** Electric Arc Furnace model: shell, roof, three electrodes, spout, molten glow. */
export function eaf(k: Kit, x: number, z: number, y: number, s: number, layer: 'interior' | 'shell' = 'interior'): void {
  k.push(x, z, 0, y);
  k.cyl('graphite', 0.62 * s, 0.12 * s, 0, 0, 0, { layer, seg: 20 }); // cradle
  k.cyl('steelDark', 0.55 * s, 0.42 * s, 0, 0.12 * s, 0, { layer, seg: 20, top: 1.06 });
  k.cyl('red', 0.6 * s, 0.07 * s, 0, 0.5 * s, 0, { layer, seg: 20 });
  k.cyl('molten', 0.5 * s, 0.02 * s, 0, 0.53 * s, 0, { layer, seg: 20 });
  k.dome('steel', 0.52 * s, 0, 0.6 * s, 0, { layer, sy: 0.45 });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const ex = Math.cos(a) * 0.17 * s;
    const ez = Math.sin(a) * 0.17 * s;
    k.post('black', ex, ez, 0.6 * s, 1.35 * s, 0.05 * s, { layer });
    k.bar('steel', ex, ez, ex - 0.75 * s, ez, 1.22 * s + i * 0.05 * s, 0.07 * s, { layer });
  }
  k.box('steel', 0.18 * s, 1.5 * s, 0.18 * s, -0.85 * s, 0, 0, { layer }); // mast
  k.box('steelDark', 0.4 * s, 0.1 * s, 0.16 * s, 0.62 * s, 0.38 * s, 0, { layer, rz: -0.25 }); // spout
  k.pop();
}

function forklift(): THREE.Group {
  return mover((k) => {
    k.box('amber', 0.5, 0.26, 0.34, 0, 0.06, 0);
    k.box('black', 0.2, 0.3, 0.3, -0.1, 0.32, 0, {});
    k.post('graphite', 0.26, -0.12, 0.06, 0.75, 0.02);
    k.post('graphite', 0.26, 0.12, 0.06, 0.75, 0.02);
    k.box('graphite', 0.3, 0.03, 0.06, 0.4, 0.08, -0.1);
    k.box('graphite', 0.3, 0.03, 0.06, 0.4, 0.08, 0.1);
    k.box('wood', 0.32, 0.12, 0.3, 0.42, 0.11, 0);
    for (const [wx, wz] of [[-0.16, 0.18], [0.16, 0.18], [-0.16, -0.18], [0.16, -0.18]] as const) k.cyl('black', 0.07, 0.05, wx, 0.07, wz, { rx: Math.PI / 2, seg: 10 });
  });
}

function pallet(k: Kit, x: number, z: number, y = 0, crates = 2): void {
  k.box('wood', 0.5, 0.06, 0.4, x, y, z, { layer: 'detail' });
  for (let i = 0; i < crates; i++) k.box(i % 2 ? 'amber' : 'concrete', 0.42, 0.18, 0.34, x, y + 0.06 + i * 0.18, z, { layer: 'detail' });
}

function kanban(k: Kit, x: number, z: number, ry: number, y: number, w = 1.6): void {
  k.push(x, z, ry, y);
  k.box('white', w, 0.9, 0.04, 0, 0.35, 0, { layer: 'interior' });
  const cols: MatKey[] = ['amber', 'cyan', 'red', 'green', 'paper'];
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) if ((c * 7 + r * 3) % 5 !== 0) k.box(cols[(c + r) % cols.length], 0.12, 0.1, 0.01, -w / 2 + 0.25 + c * (w / 4.2), 0.45 + r * 0.17, 0.03, { layer: 'detail' });
  k.pop();
}

function sofa(k: Kit, x: number, z: number, ry: number, y: number, mat: MatKey = 'fabricWarm'): void {
  k.push(x, z, ry, y);
  k.box(mat, 1.2, 0.18, 0.46, 0, 0.04, 0, { layer: 'interior' });
  k.box(mat, 1.2, 0.26, 0.12, 0, 0.18, -0.18, { layer: 'interior' });
  k.spot('idle', -0.3, 0.05, 0, true);
  k.spot('idle', 0.3, 0.05, 0, true);
  k.pop();
}

function glassRoom(k: Kit, x: number, z: number, w: number, d: number, y: number, h: number, seats = 4): void {
  k.box('glass', w, h, 0.03, x, y, z - d / 2, { layer: 'interior' });
  k.box('glass', 0.03, h, d, x - w / 2, y, z, { layer: 'interior' });
  k.box('graphite', w, 0.05, 0.05, x, y + h - 0.05, z - d / 2, { layer: 'interior' });
  k.box('graphite', 0.05, 0.05, d, x - w / 2, y + h - 0.05, z, { layer: 'interior' });
  k.post('graphite', x - w / 2, z - d / 2, y, y + h, 0.03, { layer: 'interior' });
  roundTable(k, x, z, y, seats, 0.42);
}

// ───────────────────────── recipes ─────────────────────────

type RecipeFn = (c: Ctx) => Recipe;

const citadel: RecipeFn = (c) => {
  const k = new Kit();
  const R = 5.4;
  // stepped round podium
  k.cyl('stone', R + 1.6, 0.12, 0, 0, 0, { seg: 48 });
  k.cyl('offwhite', R + 0.9, 0.12, 0, 0.12, 0, { seg: 48 });
  k.cyl('floorTech', R + 0.5, 0.02, 0, 0.24, 0, { seg: 48, layer: 'interior' });
  const y = 0.26;
  const H = 2.6;
  // columns + glass drum (back half solid-ish, front half open)
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const px = Math.cos(a) * R;
    const pz = Math.sin(a) * R;
    k.cyl('white', 0.11, H, px, y, pz, { seg: 8 });
    const back = px + pz < -1.5; // faces away from the default camera
    const layer = back ? 'shell' : px > pz ? 'wall+x' : 'wall+z';
    const a2 = ((i + 0.5) / n) * Math.PI * 2;
    const seg = 2 * R * Math.sin(Math.PI / n);
    k.box('glass', seg, H - 0.1, 0.03, Math.cos(a2) * R, y, Math.sin(a2) * R, { layer, ry: -a2 + Math.PI / 2 });
  }
  // ring roof with oculus
  const ring = new THREE.TorusGeometry(R - 0.2, 0.55, 8, 48).rotateX(Math.PI / 2).scale(1, 0.32, 1);
  k.add('white', ring, 0, y + H + 0.12, 0, 1, 1, 1, { layer: 'roof' });
  k.add('amber', new THREE.TorusGeometry(R + 0.36, 0.04, 6, 64).rotateX(Math.PI / 2), 0, y + H + 0.06, 0, 1, 1, 1, { layer: 'roof' });
  k.cyl('glassTint', R - 0.6, 0.04, 0, y + H + 0.18, 0, { seg: 40, layer: 'roof' });
  // central holo-table (ARIA)
  k.cyl('graphite', 1.25, 0.34, 0, y, 0, { seg: 32, layer: 'interior' });
  k.cyl('screenOff', 1.15, 0.02, 0, y + 0.34, 0, { seg: 32, layer: 'screen:map' });
  k.cyl('glowCyan', 1.27, 0.02, 0, y + 0.33, 0, { seg: 32, layer: 'detail' });
  k.add('holo', new THREE.CylinderGeometry(0.3, 1.1, 1.2, 24, 1, true).translate(0, 0.6, 0), 0, y + 0.36, 0, 1, 1, 1, { layer: 'detail' });
  // operator ring: 6 desks facing outward screens
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const r = 3.3;
    desk(k, Math.sin(a) * r, Math.cos(a) * r, a, y, (['chart', 'people', 'code', 'map', 'finance', 'kanban'] as ScreenKind[])[i], 'white');
  }
  // standing spots at the holo table (work) + front steps (waiting/idle)
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i - 1.5) * 0.7;
    k.spot('meet', Math.sin(a) * 1.75, Math.cos(a) * 1.75, a + Math.PI, false, y);
  }
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 4 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.32;
    k.spot('idle', Math.sin(a) * (R + 1.2), Math.cos(a) * (R + 1.2), a, false, 0.12);
  }
  // mast + flag
  k.post('steel', -R - 0.6, -R * 0.2, 0, 5.2, 0.05);
  k.box('amber', 0.9, 0.5, 0.02, -R - 0.15, 4.5, -R * 0.2);
  for (let i = 0; i < 6; i++) plant(k, Math.cos(i + 0.3) * (R + 1.25), Math.sin(i + 0.3) * (R + 1.25), 0.24, 1.1);
  const r = newRecipe(k, c, y + H + 0.6);
  r.sign = { x: R * 0.75, z: R * 0.75 + 0.9, ry: Math.PI / 4 };
  r.door = { x: R * 0.72, z: R * 0.72 };
  return r;
};

const techlab: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d, floors: 2, fh: 2.2, ...pick(pal), front: 'glass', roof: 'flat', accent: 'cyan' });
  const g = floors[0];
  // digital twin table with EAF model under a hologram (front, open to the sky in cutaway)
  const tz = g.z1 - 1.9;
  const tx = w * 0.14;
  k.box('graphite', 2.2, 0.32, 1.4, tx, g.y, tz);
  k.box('screenOff', 2.1, 0.01, 1.3, tx, g.y + 0.32, tz, { layer: 'screen:cad' });
  eaf(k, tx, tz, g.y + 0.33, 0.62);
  k.add('holo', new THREE.CylinderGeometry(0.9, 1.1, 1.3, 24, 1, true).translate(0, 0.65, 0), tx, g.y + 0.33, tz, 1, 1, 1, { layer: 'detail' });
  k.spot('meet', tx - 0.7, tz - 1.05, 0, false, g.y);
  k.spot('meet', tx + 0.7, tz - 1.05, 0, false, g.y);
  k.spot('meet', tx + 1.55, tz, -Math.PI / 2, false, g.y);
  k.spot('meet', tx - 1.55, tz, Math.PI / 2, false, g.y);
  // engineering desks in the open front-left bay
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) desk(k, -w / 2 + 0.9 + j * 1.25, g.z1 - 2.7 + i * 1.3, Math.PI, g.y, (i + j) % 2 ? 'cad' : 'code');
  screenWall(k, w / 2 - 0.3, g.z1 - 1.9, -Math.PI / 2, g.y + 0.6, 1.8, 0.9, 'cad');
  // upper: servers + simulation desks
  const u = floors[1];
  for (let i = 0; i < 4; i++) rack(k, -w / 2 + 0.6 + i * 0.6, u.z0 + 0.5, 0, u.y);
  desk(k, w * 0.12, u.z0 + 1.1, Math.PI, u.y, 'code');
  desk(k, w * 0.32, u.z0 + 1.1, Math.PI, u.y, 'cad');
  stairs(k, -w / 2 + 0.6, g.z1 - 1.2, Math.PI / 2, g.y, u.y, 0.7, 'white');
  plant(k, w / 2 - 0.6, g.z1 - 0.6, g.y);
  const r = newRecipe(k, c, PODIUM_H + 4.4);
  // rooftop drone
  const drone = droneObj();
  drone.position.set(w / 4, PODIUM_H + 4.8, -d / 4);
  r.movers.push(drone);
  r.anims.push((t, _dt, act) => {
    drone.position.y = PODIUM_H + 4.75 + Math.sin(t * 1.6) * 0.08 + act * 0.5;
    drone.rotation.y = t * 0.3;
  });
  return r;
};

const academy: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d, floors: 1, fh: 2.6, ...pick(pal), front: 'glass', roof: 'saw', roofMat: 'offwhite', accent: 'red' });
  const g = floors[0];
  // classroom (left): 2 rows of desks facing a large display
  screenWall(k, -w / 4, g.z0 + 0.25, 0, g.y + 0.8, 2.2, 1.1, 'video');
  for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) desk(k, -w / 2 + 1.0 + i * 1.25, g.z0 + 2.0 + r * 1.3, Math.PI, g.y, 'video', 'white');
  // training hall (right): EAF mock-up behind a safety rail
  const hx = w / 4 + 0.2;
  const hz = 0.2;
  k.box('amber', 3.2, 0.01, 2.8, hx, g.y + 0.02, hz, { layer: 'interior' });
  k.box('floorDark', 3.0, 0.012, 2.6, hx, g.y + 0.02, hz, { layer: 'interior' });
  eaf(k, hx, hz, g.y, 1.35);
  railing(k, hx - 1.6, hz + 1.4, hx + 1.6, hz + 1.4, g.y, 0.4, 'interior', 'amber');
  for (let i = 0; i < 3; i++) k.spot('meet', hx - 1 + i, hz + 1.85, Math.PI, false, g.y);
  k.spot('meet', hx - 1.9, hz, Math.PI / 2, false, g.y);
  figure(k, hx + 1.9, hz + 0.3, g.y, -Math.PI / 2, 'red');
  // overhead pipes + crane rail feel
  pipes(k, -w / 2 + 0.3, g.z0 + 0.4, w / 2 - 0.3, g.z0 + 0.4, g.y + 2.3, 2, 'steel');
  pallet(k, w / 2 + 0.9, -d / 4, PODIUM_H - 0.18, 2);
  pallet(k, w / 2 + 0.9, -d / 4 + 0.6, PODIUM_H - 0.18, 1);
  const r = newRecipe(k, c, PODIUM_H + 3.4);
  return r;
};

const forge: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const H = 3.6;
  const { floors } = shell(k, { w, d, floors: 1, fh: H, ...pick(pal), wall: 'concreteDark', front: 'open', roof: 'none' });
  const g = floors[0];
  // portal frames + trusses (always visible: the hangar reads as structure)
  const bays = Math.max(3, Math.round(w / 2.2));
  for (let i = 0; i <= bays; i++) {
    const x = -w / 2 + (w / bays) * i;
    k.box('steelDark', 0.08, 0.3, d, x, g.y + H, 0, { layer: 'roof' });
    k.bar('steelDark', x, -d / 2, x, d / 2, g.y + H + 0.55, 0.05, { layer: 'roof' });
  }
  k.box('steelDark', w, 0.06, d, 0, g.y + H + 0.6, 0, { layer: 'roof' });
  // crane runway beams
  k.box('amber', w, 0.14, 0.14, 0, g.y + H - 0.5, -d / 2 + 0.5);
  k.box('amber', w, 0.14, 0.14, 0, g.y + H - 0.5, d / 2 - 0.5);
  // machine skid (motor + gearbox + pump) under the crane
  k.box('graphite', 2.2, 0.16, 1.0, 0, g.y, 0, { layer: 'interior' });
  k.cyl('cyan', 0.32, 0.9, -0.5, g.y + 0.5, 0, { layer: 'interior', rz: Math.PI / 2, seg: 14 });
  k.box('steel', 0.6, 0.55, 0.6, 0.35, g.y + 0.16, 0, { layer: 'interior' });
  k.cyl('red', 0.24, 0.5, 0.95, g.y + 0.16, 0, { layer: 'interior', seg: 12 });
  for (let i = 0; i < 3; i++) k.spot('meet', -0.8 + i * 0.8, 0.95, Math.PI, false, g.y);
  // workbenches + tool boards along the back wall
  for (let i = 0; i < 3; i++) {
    const x = -w / 2 + 1.4 + i * 1.9;
    k.box('steelDark', 1.4, 0.4, 0.55, x, g.y, g.z0 + 0.45, { layer: 'interior' });
    k.box('white', 1.4, 0.7, 0.03, x, g.y + 0.6, g.z0 + 0.16, { layer: 'interior' });
    for (let j = 0; j < 5; j++) k.box('graphite', 0.05, 0.22, 0.02, x - 0.5 + j * 0.25, g.y + 0.82, g.z0 + 0.19, { layer: 'detail' });
    k.spot('work', x, g.z0 + 1.05, Math.PI, false, g.y);
  }
  desk(k, w / 2 - 1.0, g.z0 + 1.4, -Math.PI / 2 - 0.0, g.y, 'kanban');
  shelf(k, -w / 2 + 0.4, 0.6, Math.PI / 2, g.y, 1.6, 1.6, 'steelDark');
  pallet(k, w / 2 - 0.8, d / 2 - 0.6, g.y, 2);
  const r = newRecipe(k, c, PODIUM_H + H + 0.7);
  // gantry crane bridge travelling slowly along the hall
  const crane = mover((m) => {
    m.box('amber', 0.22, 0.22, d - 0.6, 0, 0, 0);
    m.box('graphite', 0.4, 0.22, 0.35, 0, -0.2, 0);
    m.post('black', 0, 0, -1.4, -0.2, 0.012);
    m.box('steel', 0.14, 0.08, 0.14, 0, -1.48, 0);
  });
  crane.position.set(0, g.y + H - 0.36, 0);
  r.movers.push(crane);
  r.anims.push((t) => {
    crane.position.x = Math.sin(t * 0.18) * (w / 2 - 1);
  });
  const lift = forklift();
  r.movers.push(lift);
  r.anims.push((t) => {
    const p = (Math.sin(t * 0.35) + 1) / 2;
    lift.position.set(w / 2 + 1.0, PODIUM_H - 0.18, -d / 2 + 0.8 + p * (d - 1.6));
    lift.rotation.y = Math.cos(t * 0.35) > 0 ? -Math.PI / 2 : Math.PI / 2;
  });
  return r;
};

const fortress: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  // classroom block on the left two thirds
  k.push(-w * 0.18, 0);
  const cw = w * 0.62;
  const { floors } = shell(k, { w: cw, d, floors: 1, fh: 2.2, ...pick(pal), front: 'glass', roof: 'flat', accent: 'red' });
  const g = floors[0];
  screenWall(k, 0, g.z0 + 0.25, 0, g.y + 0.7, 1.8, 0.95, 'video');
  for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) desk(k, -cw / 2 + 0.9 + i * 1.2, g.z0 + 1.8 + r * 1.25, Math.PI, g.y, 'video');
  k.pop();
  // work-at-heights tower: steel frame, gratings, ladders
  const tx = w / 2 - 1.6;
  const tz = -0.4;
  k.box('concrete', 2.6, 0.18, 2.6, tx, 0, tz);
  const levels = 3;
  for (let l = 1; l <= levels; l++) {
    const y = 0.18 + l * 1.35;
    k.box('steelDark', 2.2, 0.06, 2.2, tx, y, tz);
    railing(k, tx - 1.1, tz + 1.1, tx + 1.1, tz + 1.1, y, 0.42, 'shell', 'amber');
    railing(k, tx + 1.1, tz - 1.1, tx + 1.1, tz + 1.1, y, 0.42, 'shell', 'amber');
  }
  for (const [px, pz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]] as const) k.post('red', tx + px, tz + pz, 0.18, 0.18 + levels * 1.35 + 0.6, 0.06);
  k.bar('steel', tx - 1.1, tz - 1.1, tx + 1.1, tz + 1.1, 2.0, 0.04);
  // anchor beam + harnessed trainee
  k.box('amber', 0.1, 0.1, 3.4, tx, 0.18 + levels * 1.35 + 0.6, tz);
  figure(k, tx + 0.4, tz + 0.6, 0.18 + 2 * 1.35, 0.6, 'amber');
  k.post('black', tx + 0.4, tz + 0.6, 0.18 + 2 * 1.35 + 0.8, 0.18 + levels * 1.35 + 0.6, 0.012);
  k.spot('meet', tx - 0.6, tz + 1.7, Math.PI, false, 0.18);
  k.spot('meet', tx + 0.4, tz + 1.8, Math.PI, false, 0.18);
  // safety boards
  k.box('white', 1.0, 0.7, 0.04, tx, 0.18, tz + 1.6, { layer: 'detail' });
  k.box('red', 1.0, 0.12, 0.05, tx, 0.78, tz + 1.6, { layer: 'detail' });
  const r = newRecipe(k, c, PODIUM_H + levels * 1.35 + 0.8);
  r.door = { x: -w * 0.18, z: d / 2 + 0.9 };
  return r;
};

const tower: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d: d + 1, floors: 3, fh: 2.0, step: 0.26, ...pick(pal), back: 'glass', front: 'glass', roof: 'flat', accent: 'cyan' });
  const [g, f1, f2] = floors;
  // reception + waiting lounge
  k.box('white', 1.6, 0.4, 0.5, w * 0.15, g.y, g.z1 - 1.0, { layer: 'interior' });
  k.box('wood', 1.62, 0.04, 0.54, w * 0.15, g.y + 0.4, g.z1 - 1.0, { layer: 'interior' });
  k.spot('work', w * 0.15, g.z1 - 1.5, 0, false, g.y);
  sofa(k, w / 2 - 1.0, g.z1 - 0.7, Math.PI, g.y, 'fabric');
  // interview room (glass) at the open front
  glassRoom(k, -w / 4 + 0.2, g.z1 - 1.25, 2.0, 1.7, g.y, 1.8, 2);
  // recruiting ops floor (front strip of level 1)
  for (let i = 0; i < 3; i++) desk(k, -w / 2 + 1.0 + i * 1.3, f1.z1 - 1.2, 0, f1.y, 'people');
  screenWall(k, w / 2 - 0.3, f1.z1 - 1.3, -Math.PI / 2, f1.y + 0.6, 1.4, 0.8, 'people');
  // leadership floor: meeting room
  meetingTable(k, 0, (f2.z0 + f2.z1) / 2, 0, f2.y, 6, 'white');
  plant(k, w / 2 - 0.5, f2.z1 - 0.5, f2.y);
  stairs(k, w / 2 - 0.6, g.z0 + 2.6, Math.PI / 2, g.y, f1.y, 0.6, 'white');
  return newRecipe(k, c, PODIUM_H + 6.3);
};

const observatory: RecipeFn = (c) => {
  const k = new Kit();
  const { w, pal } = c;
  const R = w * 0.46;
  k.cyl(pal.podium, R + 0.5, 0.18, 0, 0, 0, { seg: 40 });
  k.cyl(pal.floor, R, 0.02, 0, 0.18, 0, { seg: 40, layer: 'interior' });
  const y = 0.2;
  // low drum: solid back arc, open front
  const drum = new THREE.CylinderGeometry(R, R, 1.1, 40, 1, true, Math.PI * 0.75, Math.PI * 1.0).translate(0, 0.55, 0);
  k.add(pal.wall, drum, 0, y, 0, 1, 1, 1);
  k.add(pal.accent, new THREE.CylinderGeometry(R + 0.02, R + 0.02, 0.08, 40, 1, true, Math.PI * 0.75, Math.PI * 1.0), 0, y + 1.1, 0, 1, 1, 1);
  // cut dome (open toward the camera)
  const dome = new THREE.SphereGeometry(R, 32, 12, Math.PI * 1.25, Math.PI, 0, Math.PI / 2);
  k.add(pal.wall, dome, 0, y + 1.1, 0, 1, 0.75, 1, { layer: 'roof' });
  const rib = new THREE.TorusGeometry(R, 0.04, 4, 16, Math.PI / 2);
  for (let i = 0; i <= 6; i++) {
    const b = Math.PI * 0.75 + (i / 6) * Math.PI;
    k.add('graphite', rib, 0, y + 1.1, 0, 1, 0.75, 1, { layer: 'roof', ry: Math.atan2(-Math.sin(b), Math.cos(b)) });
  }
  // telescope on a pier
  k.cyl('graphite', 0.22, 0.9, -R * 0.35, y, -R * 0.35, { layer: 'interior', seg: 10 });
  k.cyl('white', 0.16, 1.4, -R * 0.35, y + 0.9, -R * 0.35, { layer: 'interior', rx: -0.7, rz: 0.4, seg: 14 });
  // curved screen array + analyst desks
  const screen: ScreenKind = c.territory === 'personal' ? 'finance' : 'chart';
  for (let i = 0; i < 3; i++) {
    const a = Math.PI * 1.05 + i * 0.32;
    screenWall(k, Math.cos(a) * (R - 0.35), Math.sin(a) * (R - 0.35), -a - Math.PI / 2, y + 0.45, 1.0, 0.6, screen);
  }
  roundTable(k, R * 0.18, R * 0.12, y, 3, 0.45);
  desk(k, R * 0.25, -R * 0.45, Math.PI * 1.15, y, screen);
  desk(k, -R * 0.55, R * 0.15, Math.PI * 0.65, y, screen);
  const r = newRecipe(k, c, y + 1.1 + R * 0.75);
  r.sign = { x: R * 0.8, z: R * 0.8, ry: Math.PI / 4 };
  r.door = { x: R * 0.55, z: R * 0.85 };
  return r;
};

const council: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d, floors: 1, fh: 2.3, ...pick(pal), back: 'solid', front: 'glass', roof: 'flat', accent: 'amber' });
  const g = floors[0];
  // timber slat screen on the back walls (always visible, gives warmth)
  for (let i = 0; i < Math.floor(w / 0.22); i++) k.box('wood', 0.06, 2.1, 0.08, -w / 2 + 0.15 + i * 0.22, g.y, g.z0 + 0.22, { layer: 'interior' });
  meetingTable(k, -w * 0.08, 0.1, 0, g.y, 8, 'woodDark');
  screenWall(k, w / 2 - 0.25, 0, -Math.PI / 2, g.y + 0.7, 1.6, 0.9, 'people');
  sofa(k, w / 2 - 1.0, g.z1 - 0.8, Math.PI, g.y, 'fabric');
  plant(k, -w / 2 + 0.5, g.z1 - 0.5, g.y, 1.2);
  return newRecipe(k, c, PODIUM_H + 2.6);
};

const station: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const hallD = d * 0.62;
  k.push(0, -d / 2 + hallD / 2);
  const { floors } = shell(k, { w, d: hallD, floors: 1, fh: 2.3, ...pick(pal), front: 'glass', roof: 'flat', accent: 'cyan' });
  const g = floors[0];
  k.box('white', 1.8, 0.42, 0.5, -w / 4, g.y, 0.2, { layer: 'interior' });
  k.spot('work', -w / 4, -0.3, 0, false, g.y);
  screenWall(k, w / 4, g.z0 + 0.25, 0, g.y + 0.7, 1.8, 0.9, 'people');
  desk(k, w / 4 - 0.7, -0.1, Math.PI, g.y, 'people');
  desk(k, w / 4 + 0.7, -0.1, Math.PI, g.y, 'chart');
  for (let i = 0; i < 6; i++) k.box('steel', 0.3, 1.3, 0.35, -w / 2 + 0.3 + i * 0.32, g.y, g.z0 + 0.3, { layer: 'interior' });
  k.pop();
  // platform + canopy + rail
  const pz = d / 2 - (d - hallD) / 2 + 0.2;
  k.box('concrete', w + 0.4, 0.3, 1.2, 0, 0, pz - 0.5);
  for (let i = 0; i < 4; i++) k.post('graphite', -w / 2 + 0.4 + i * ((w - 0.8) / 3), pz - 0.5, 0.3, 2.2, 0.05);
  k.box('white', w + 0.8, 0.08, 1.6, 0, 2.2, pz - 0.5, { layer: 'roof' });
  for (let i = 0; i < 3; i++) k.spot('idle', -w / 3 + i * (w / 3), pz - 0.4, Math.PI / 2, false, 0.3);
  k.box('steelDark', w + 6, 0.04, 0.08, 0, 0, pz + 0.5);
  k.box('steelDark', w + 6, 0.04, 0.08, 0, 0, pz + 0.9);
  for (let i = 0; i < 12; i++) k.box('woodDark', 0.1, 0.03, 0.7, -w / 2 - 3 + i * ((w + 6) / 11), 0, pz + 0.7, { layer: 'detail' });
  const r = newRecipe(k, c, PODIUM_H + 2.7);
  const tram = mover((m) => {
    m.box('white', 2.0, 0.6, 0.6, 0, 0.08, 0);
    m.box('glassTint', 1.8, 0.24, 0.62, 0, 0.36, 0);
    m.box('cyan', 2.02, 0.05, 0.62, 0, 0.22, 0);
    m.box('graphite', 2.0, 0.06, 0.6, 0, 0.68, 0);
  });
  r.movers.push(tram);
  r.anims.push((t) => {
    // glide in, dwell, glide out
    const p = (t * 0.08) % 1;
    const x = p < 0.35 ? THREE.MathUtils.lerp(-w / 2 - 6, 0, easeOut(p / 0.35)) : p < 0.6 ? 0 : THREE.MathUtils.lerp(0, w / 2 + 6, easeIn((p - 0.6) / 0.4));
    tram.position.set(x, 0, pz + 0.7);
    tram.visible = Math.abs(x) < w / 2 + 4;
  });
  r.door = { x: 0, z: pz - 0.4 };
  r.sign = { x: w / 2 + 0.5, z: pz - 1.2, ry: Math.PI / 4 };
  return r;
};

const laboratory: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d, floors: 1, fh: 2.3, ...pick(pal), front: 'glass', roof: 'flat', accent: 'amber' });
  const g = floors[0];
  kanban(k, -w / 4, g.z0 + 0.18, 0, g.y, 2.2);
  kanban(k, w / 4, g.z0 + 0.18, 0, g.y, 1.6);
  // mini production line (conveyor) for kaizen exercises
  k.box('graphite', w - 2, 0.3, 0.5, 0, g.y, 0.2, { layer: 'interior' });
  k.box('black', w - 2, 0.03, 0.44, 0, g.y + 0.3, 0.2, { layer: 'interior' });
  for (let i = 0; i < 3; i++) k.spot('work', -w / 3 + i * (w / 3), 0.85, Math.PI, false, g.y);
  roundTable(k, w / 2 - 1.2, g.z1 - 1.0, g.y, 3, 0.42);
  desk(k, -w / 2 + 1.0, g.z1 - 0.9, 0, g.y, 'kanban');
  const r = newRecipe(k, c, PODIUM_H + 2.7);
  const boxes = mover((m) => {
    for (let i = 0; i < 4; i++) m.box(i % 2 ? 'amber' : 'paper', 0.22, 0.16, 0.22, i * ((w - 2.4) / 4), 0, 0);
  });
  boxes.position.set(0, g.y + 0.33, 0.2);
  r.movers.push(boxes);
  r.anims.push((t, _dt, act) => {
    boxes.position.x = -(w - 2.4) / 2 + (((t * 0.25 * (0.2 + act)) % 1) * (w - 2.4)) / 4;
  });
  return r;
};

const temple: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d } = c;
  // stone podium with steps
  k.box('stoneDark', w + 1.2, 0.3, d + 1.2, 0, 0, 0);
  k.box('stone', w + 0.6, 0.16, d + 0.6, 0, 0.3, 0);
  for (let i = 0; i < 3; i++) k.box('stone', 2.2, 0.1, 0.3, w * 0.18, 0.1 * i, d / 2 + 0.9 - i * 0.3);
  const y = 0.46;
  const H = 2.5;
  // timber columns
  const nx = 5;
  for (let i = 0; i < nx; i++) {
    const x = -w / 2 + 0.3 + i * ((w - 0.6) / (nx - 1));
    k.box('woodDark', 0.18, H, 0.18, x, y, -d / 2 + 0.3);
    k.box('woodDark', 0.18, H, 0.18, x, y, d / 2 - 0.3);
  }
  // back wall in stone, glass sides
  k.box('stone', w - 0.4, H, 0.2, 0, y, -d / 2 + 0.2, { layer: 'wall-z' });
  k.box('glassTint', 0.04, H, d - 0.6, -w / 2 + 0.3, y, 0, { layer: 'wall-x' });
  k.box('glass', 0.04, H, d - 0.6, w / 2 - 0.3, y, 0, { layer: 'wall+x' });
  k.box('glass', w - 0.6, H, 0.04, 0, y, d / 2 - 0.3, { layer: 'wall+z' });
  // floating roof with deep overhang
  roof(k, 'canopy', 'woodDark', w, d, 0, y + H, 'woodDark');
  k.box('stone', w + 1.4, 0.14, d + 1.4, 0, y + H + 0.16, 0, { layer: 'roof' });
  // interior: strategy wall, workshop table, lounge
  kanban(k, -w / 5, -d / 2 + 0.36, 0, y, 2.4);
  screenWall(k, w / 4, -d / 2 + 0.36, 0, y + 0.7, 1.6, 0.9, 'chart');
  meetingTable(k, -w * 0.1, 0.3, 0, y, 6, 'wood');
  desk(k, w / 2 - 1.0, 0.4, -Math.PI / 2, y, 'code', 'wood');
  desk(k, w / 2 - 1.0, -0.9, -Math.PI / 2, y, 'chart', 'wood');
  sofa(k, -w / 2 + 1.2, d / 2 - 0.9, Math.PI, y, 'fabricWarm');
  plant(k, w / 2 - 0.6, d / 2 - 0.6, y, 1.3);
  // reflection pool
  k.box('stoneDark', 3.4, 0.12, 1.6, -w * 0.18, 0, d / 2 + 1.6);
  k.box('water', 3.1, 0.13, 1.3, -w * 0.18, 0.02, d / 2 + 1.6);
  const r = newRecipe(k, c, y + H + 0.4);
  r.sign = { x: w / 2 + 0.6, z: d / 2 + 1.0, ry: Math.PI / 4 };
  return r;
};

const studio: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d, floors: 1, fh: 2.6, ...pick(pal), front: 'glass', roof: 'flat', accent: 'green' });
  const g = floors[0];
  // cyclorama (curved white backdrop)
  const cyc = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 16, 1, true, Math.PI, Math.PI / 2).translate(0, 1.1, 0);
  k.add('white', cyc, -w / 2 + 1.4, g.y, g.z0 + 1.4, 1, 1, 1, { layer: 'interior' });
  k.box('white', w * 0.32, 2.2, 0.04, -w / 2 + 1.4 + w * 0.16, g.y, g.z0 + 0.2, { layer: 'interior' });
  // camera on tripod + two softboxes
  k.post('black', -w / 2 + 2.4, g.z0 + 2.6, g.y, g.y + 0.62, 0.02, { layer: 'interior' });
  k.box('black', 0.24, 0.18, 0.32, -w / 2 + 2.4, g.y + 0.62, g.z0 + 2.6, { layer: 'interior', ry: 0.6 });
  for (const sx of [-1, 1]) {
    const lx = -w / 2 + 2.0 + sx * 1.1;
    k.post('black', lx, g.z0 + 2.0, g.y, g.y + 1.3, 0.02, { layer: 'interior' });
    k.box('lampOff', 0.5, 0.5, 0.08, lx, g.y + 1.25, g.z0 + 2.0, { layer: 'lights', ry: sx * 0.6 });
  }
  k.spot('work', -w / 2 + 1.7, g.z0 + 1.6, Math.PI / 4, false, g.y);
  // edit suite
  desk(k, w / 2 - 1.1, g.z0 + 0.9, Math.PI, g.y, 'video', 'wood');
  desk(k, w / 2 - 2.3, g.z0 + 0.9, Math.PI, g.y, 'video', 'wood');
  // podcast table
  roundTable(k, w / 4, g.z1 - 1.1, g.y, 3, 0.45, 'wood');
  shelf(k, w / 2 - 0.3, 0.2, -Math.PI / 2, g.y, 1.4, 1.3);
  return newRecipe(k, c, PODIUM_H + 3.0);
};

const productlab: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d, floors: 1, fh: 2.4, ...pick(pal), front: 'glass', roof: 'saw', roofMat: 'stone', accent: 'green' });
  const g = floors[0];
  // maker benches with prototypes
  for (let i = 0; i < 2; i++) {
    const x = -w / 4 + i * (w / 2);
    k.box('wood', 2.0, 0.42, 0.8, x, g.y, 0.1, { layer: 'interior' });
    k.box('graphite', 0.3, 0.2, 0.3, x - 0.5, g.y + 0.42, 0.1, { layer: 'detail' });
    k.cyl('cyan', 0.12, 0.18, x + 0.3, g.y + 0.42, 0.1, { layer: 'detail' });
    k.spot('work', x - 0.4, 0.85, Math.PI, false, g.y);
    k.spot('work', x + 0.4, -0.6, 0, false, g.y);
  }
  // 3D printers
  for (let i = 0; i < 3; i++) {
    k.box('white', 0.45, 0.6, 0.45, -w / 2 + 0.5 + i * 0.6, g.y, g.z0 + 0.4, { layer: 'interior' });
    k.box('glassTint', 0.4, 0.35, 0.02, -w / 2 + 0.5 + i * 0.6, g.y + 0.18, g.z0 + 0.63, { layer: 'detail' });
  }
  kanban(k, w / 4, g.z0 + 0.18, 0, g.y, 2);
  desk(k, w / 2 - 0.9, g.z1 - 0.9, 0, g.y, 'code', 'wood');
  return newRecipe(k, c, PODIUM_H + 3.2);
};

const house: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  // main volume (living) + study wing
  k.push(-w * 0.1, -d * 0.12);
  const lw = w * 0.8;
  const ld = d * 0.66;
  const { floors } = shell(k, { w: lw, d: ld, floors: 1, fh: 2.2, ...pick(pal), wall: 'wood', back: 'solid', front: 'glass', roof: 'flat', roofMat: 'offwhite', accent: null });
  const g = floors[0];
  sofa(k, -lw / 4, g.z1 - 1.1, Math.PI, g.y, 'fabricWarm');
  k.box('wood', 0.9, 0.04, 0.5, -lw / 4, g.y + 0.2, g.z1 - 1.8, { layer: 'interior' });
  k.box('white', 1.4, 0.42, 0.6, lw / 4, g.y, g.z0 + 1.0, { layer: 'interior' }); // kitchen island
  k.spot('meet', lw / 4 - 0.4, g.z0 + 1.6, Math.PI, false, g.y);
  k.spot('meet', lw / 4 + 0.4, g.z0 + 1.6, Math.PI, false, g.y);
  shelf(k, -lw / 2 + 0.3, -0.2, Math.PI / 2, g.y, 1.6, 1.3, 'wood');
  desk(k, lw / 2 - 0.8, g.z1 - 0.9, -Math.PI / 2, g.y, 'chart', 'wood');
  desk(k, lw / 2 - 0.8, g.z1 - 2.0, -Math.PI / 2, g.y, 'finance', 'wood');
  k.pop();
  // timber deck + pool
  k.box('floorWood', w * 0.85, 0.08, 1.4, -w * 0.08, 0.1, d * 0.28);
  k.box('stone', w * 0.55, 0.16, 1.2, w * 0.08, 0, d * 0.42 + 0.4);
  k.box('water', w * 0.5, 0.17, 1.0, w * 0.08, 0.01, d * 0.42 + 0.4);
  chair(k, -w * 0.3, d * 0.3, 0.3, 'fabricWarm');
  plant(k, w / 2 - 0.4, -d / 2 + 0.4, 0.1, 1.4);
  plant(k, -w / 2 + 0.3, d * 0.28, 0.1, 1.1);
  const r = newRecipe(k, c, PODIUM_H + 2.6);
  r.door = { x: -w * 0.1, z: d * 0.32 };
  return r;
};

const grounds: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d } = c;
  // track (stadium shape) + inner field
  const track = new THREE.RingGeometry(w * 0.3, w * 0.45, 40, 1).rotateX(-Math.PI / 2);
  k.add('red', track, 0, 0.03, 0, 1, 1, 0.72);
  const field = new THREE.CircleGeometry(w * 0.3, 40).rotateX(-Math.PI / 2);
  k.add('grassDeep', field, 0, 0.035, 0, 1, 1, 0.72);
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.RingGeometry(w * 0.3 + i * 0.5 + 0.48, w * 0.3 + i * 0.5 + 0.5, 40, 1).rotateX(-Math.PI / 2);
    k.add('white', ring, 0, 0.04, 0, 1, 1, 0.72, { layer: 'detail' });
  }
  // gym pavilion at the back
  k.push(-w * 0.18, -d / 2 + 0.6);
  k.box('wood', 3.6, 0.12, 1.6, 0, 0, 0);
  for (const px of [-1.7, 1.7]) for (const pz of [-0.7, 0.7]) k.post('woodDark', px, pz, 0.12, 2.0, 0.06);
  k.box('wood', 4.0, 0.1, 2.0, 0, 2.0, 0, { layer: 'roof' });
  k.box('black', 0.9, 0.08, 0.3, -0.8, 0.12, 0, { layer: 'interior' });
  k.post('steel', -0.4, 0.3, 0.12, 1.2, 0.03, { layer: 'interior' });
  k.post('steel', -1.2, 0.3, 0.12, 1.2, 0.03, { layer: 'interior' });
  k.bar('steel', -1.3, 0.3, -0.3, 0.3, 1.0, 0.04, { layer: 'interior' });
  k.spot('work', 0.6, 0.2, Math.PI / 2, false, 0.12);
  k.spot('work', 1.2, 0.2, -Math.PI / 2, false, 0.12);
  k.pop();
  for (let i = 0; i < 3; i++) k.spot('meet', -0.6 + i * 0.6, 0.2, Math.PI, false, 0.04);
  const runner = mover((m) => {
    m.box('extraDark', 0.07, 0.34, 0.08, -0.05, 0, 0);
    m.box('extraDark', 0.07, 0.34, 0.08, 0.05, 0, 0);
    m.box('cyan', 0.22, 0.3, 0.13, 0, 0.34, 0);
    m.sphere('skin', 0.07, 0, 0.72, 0);
  });
  const r = newRecipe(k, c, 2.4);
  r.movers.push(runner);
  r.anims.push((t) => {
    const a = t * 0.35;
    runner.position.set(Math.cos(a) * w * 0.375, 0.04 + Math.abs(Math.sin(t * 9)) * 0.03, Math.sin(a) * w * 0.375 * 0.72);
    runner.rotation.y = -a;
  });
  r.sign = { x: w / 2, z: d / 2, ry: Math.PI / 4 };
  r.door = { x: w * 0.2, z: d / 2 + 0.3 };
  return r;
};

const library: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w, d, floors: 2, fh: 2.1, ...pick(pal), wall: 'stone', front: 'glass', roof: 'flat', accent: 'wood' });
  const [g, u] = floors;
  for (let i = 0; i < 3; i++) shelf(k, -w / 2 + 1.0 + i * 1.6, g.z0 + 0.3, 0, g.y, 1.5, 1.6);
  shelf(k, -w / 2 + 0.3, 0.6, Math.PI / 2, g.y, 1.6, 1.6);
  meetingTable(k, w * 0.08, g.z1 - 1.4, 0, g.y, 4, 'wood');
  desk(k, w / 2 - 0.9, g.z1 - 1.0, -Math.PI / 2, g.y, 'chart', 'wood');
  desk(k, w / 2 - 2.2, g.z1 - 1.0, -Math.PI / 2, g.y, 'chart', 'wood');
  for (let i = 0; i < 2; i++) shelf(k, -w / 2 + 1.0 + i * 1.6, u.z0 + 0.3, 0, u.y, 1.5, 1.6);
  sofa(k, w / 4, u.z1 - 0.6, Math.PI, u.y);
  stairs(k, w / 2 - 0.6, g.z0 + 1.5, Math.PI / 2, g.y, u.y, 0.6, 'wood');
  return newRecipe(k, c, PODIUM_H + 4.5);
};

const dock: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  // water basin with a timber pier
  k.box('stoneDark', w + 0.6, 0.12, d * 0.6, 0, 0, d * 0.2);
  k.box('water', w + 0.3, 0.14, d * 0.55, 0, 0.02, d * 0.2);
  k.box('floorWood', 1.4, 0.1, d * 0.6, w * 0.15, 0.2, d * 0.2);
  for (let i = 0; i < 4; i++) k.post('woodDark', w * 0.15 - 0.6, d * 0.2 - d * 0.25 + i * (d * 0.17), 0, 0.3, 0.06);
  // travel kiosk
  k.push(-w * 0.18, -d * 0.3);
  const { floors } = shell(k, { w: w * 0.6, d: d * 0.36, floors: 1, fh: 2.0, ...pick(pal), front: 'glass', roof: 'canopy', roofMat: 'wood', lights: true });
  const g = floors[0];
  screenWall(k, 0, g.z0 + 0.2, 0, g.y + 0.6, 1.5, 0.8, 'map');
  desk(k, -0.6, g.z1 - 0.6, Math.PI, g.y, 'map', 'wood');
  k.pop();
  k.spot('meet', w * 0.15, d * 0.3, Math.PI, false, 0.3);
  k.spot('meet', w * 0.15 + 0.4, d * 0.1, -Math.PI / 2, false, 0.3);
  // beacon
  k.cyl('white', 0.25, 2.4, w / 2 - 0.3, 0, -d / 2 + 0.4, { seg: 10, top: 0.7 });
  k.cyl('red', 0.2, 0.3, w / 2 - 0.3, 2.4, -d / 2 + 0.4, { seg: 10 });
  const r = newRecipe(k, c, 2.8);
  const boat = mover((m) => {
    m.box('white', 1.4, 0.24, 0.55, 0, 0, 0);
    m.box('woodDark', 1.2, 0.03, 0.45, 0, 0.24, 0);
    m.box('white', 0.5, 0.26, 0.4, -0.15, 0.24, 0);
    m.box('glassTint', 0.3, 0.14, 0.42, 0.1, 0.32, 0);
  });
  boat.position.set(w * 0.15 + 1.4, 0.1, d * 0.25);
  r.movers.push(boat);
  r.anims.push((t) => {
    boat.position.y = 0.08 + Math.sin(t * 1.3) * 0.025;
    boat.rotation.z = Math.sin(t * 1.1) * 0.03;
  });
  r.door = { x: -w * 0.18, z: -d * 0.1 };
  r.sign = { x: -w / 2 + 0.2, z: d * 0.05, ry: Math.PI / 4 };
  return r;
};

const hangar: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  k.box(pal.podium, w + 0.7, PODIUM_H, d + 0.7, 0, 0, 0);
  k.box(pal.floor, w, 0.02, d, 0, PODIUM_H, 0, { layer: 'interior' });
  // barrel vault cut open toward the camera
  const R = w / 2;
  const vault = new THREE.CylinderGeometry(R, R, d * 0.7, 28, 1, true, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2);
  k.add('steel', vault, 0, PODIUM_H, -d * 0.15, 1, 0.62, 1, { layer: 'roof' });
  for (let i = 0; i <= 4; i++) {
    const rib = new THREE.TorusGeometry(R, 0.05, 4, 20, Math.PI);
    k.add('steelDark', rib, 0, PODIUM_H, -d / 2 + i * (d * 0.7) / 4, 1, 0.62, 1, { layer: i < 4 ? 'roof' : 'shell' });
  }
  k.box(pal.wall, w, R * 0.62, 0.12, 0, PODIUM_H, -d / 2 + 0.06, { layer: 'wall-z' });
  // prototype rover + benches
  k.box('white', 1.4, 0.4, 0.9, -w / 5, PODIUM_H + 0.18, 0, { layer: 'interior' });
  k.box('glassTint', 0.6, 0.24, 0.8, -w / 5 + 0.2, PODIUM_H + 0.58, 0, { layer: 'interior' });
  for (const [wx, wz] of [[-0.5, 0.48], [0.5, 0.48], [-0.5, -0.48], [0.5, -0.48]] as const) k.cyl('black', 0.18, 0.12, -w / 5 + wx, PODIUM_H + 0.18, wz, { layer: 'interior', rx: Math.PI / 2 });
  for (let i = 0; i < 2; i++) k.spot('meet', -w / 5 - 0.5 + i, 0.95, Math.PI, false, PODIUM_H);
  desk(k, w / 4, -d / 4, Math.PI, PODIUM_H, 'cad');
  desk(k, w / 4 - 1.2, -d / 4, Math.PI, PODIUM_H, 'code');
  // drone pad outside
  k.cyl('graphite', 0.8, 0.04, w / 2 - 0.6, PODIUM_H, d / 2 - 0.4, { seg: 24 });
  k.add('amber', new THREE.RingGeometry(0.55, 0.62, 24).rotateX(-Math.PI / 2), w / 2 - 0.6, PODIUM_H + 0.05, d / 2 - 0.4, 1, 1, 1, { layer: 'detail' });
  const r = newRecipe(k, c, PODIUM_H + R * 0.62 + 0.2);
  const drone = droneObj();
  r.movers.push(drone);
  r.anims.push((t, _dt, act) => {
    const lift = 0.3 + (Math.sin(t * 0.4) + 1) * 0.9 * (0.4 + act);
    drone.position.set(w / 2 - 0.6 + Math.sin(t * 0.5) * 0.4, PODIUM_H + lift, d / 2 - 0.4 + Math.cos(t * 0.5) * 0.4);
    drone.rotation.y = t * 0.6;
  });
  return r;
};

const outpost: RecipeFn = (c) => {
  const k = new Kit();
  const { w, d, pal } = c;
  const { floors } = shell(k, { w: w * 0.8, d: d * 0.7, floors: 1, fh: 2.0, ...pick(pal), front: 'glass', roof: 'flat', accent: pal.accent });
  const g = floors[0];
  desk(k, -w * 0.15, g.z0 + 0.8, Math.PI, g.y, 'map');
  desk(k, w * 0.15, g.z0 + 0.8, Math.PI, g.y, 'code');
  roundTable(k, 0, g.z1 - 0.9, g.y, 3, 0.4);
  k.post('steel', w * 0.32, -d * 0.25, 2.2, 3.8, 0.03);
  k.box('steelDark', 0.9, 0.04, 0.6, -w * 0.2, 2.3, -d * 0.15, { layer: 'roof', rx: -0.4 });
  return newRecipe(k, c, 2.6);
};

function droneObj(): THREE.Group {
  return mover((m) => {
    m.box('graphite', 0.3, 0.08, 0.3, 0, 0, 0);
    for (const [x, z] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]] as const) {
      m.bar('graphite', 0, 0, x, z, 0.05, 0.03);
      m.cyl('steel', 0.1, 0.01, x, 0.06, z, { seg: 12 });
    }
    m.box('glowCyan', 0.06, 0.02, 0.02, 0, 0.02, 0.15);
  });
}

function pick(p: Palette) {
  return { frame: p.frame, slab: p.slab, floorMat: p.floor, wall: p.wall, podium: p.podium };
}
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);
const easeIn = (x: number) => x * x;

export const RECIPES: Record<BuildingType, RecipeFn> = {
  citadel,
  techlab,
  academy,
  forge,
  fortress,
  tower,
  observatory,
  council,
  station,
  laboratory,
  temple,
  studio,
  productlab,
  house,
  grounds,
  library,
  dock,
  hangar,
  outpost,
};

export { DESK_H };
