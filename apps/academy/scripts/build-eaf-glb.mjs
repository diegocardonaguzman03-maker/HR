// Genera src/assets/eaf.glb: modelo ESQUEMÁTICO del horno de arco eléctrico (no a escala de planta).
// Pipeline: geometría procedural (three) → nodos con nombres del contrato (docs/nodos-3d.md)
// → glTF (gltf-transform) → dedup + weld + quantize + meshopt → GLB.
// También escribe public/models/eaf.nodes.json (lista de nodos) que valida check:content.
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsEmissiveStrength } from '@gltf-transform/extensions';
import { dedup, weld, quantize, meshopt, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

const OUT = path.resolve('src/assets'); // el GLB se importa desde el código (se incrusta en el build web)
const NODES_OUT = path.resolve('public/models');
const Y0 = 3; // cota de la plataforma del horno (m)

// ---------- materiales ----------
const MATS = {
  shell: { c: [0.16, 0.22, 0.29], m: 0.55, r: 0.5, double: true },
  steel: { c: [0.24, 0.25, 0.27], m: 0.8, r: 0.45 },
  panel: { c: [0.3, 0.35, 0.38], m: 0.75, r: 0.38, double: true },
  copper: { c: [0.82, 0.46, 0.28], m: 1, r: 0.32 },
  graphite: { c: [0.13, 0.13, 0.14], m: 0.15, r: 0.62 },
  joint: { c: [0.06, 0.06, 0.07], m: 0.2, r: 0.5 },
  tip: { c: [0.35, 0.16, 0.08], m: 0.1, r: 0.6, e: [1, 0.35, 0.06], es: 1.5 },
  refractory: { c: [0.56, 0.38, 0.27], m: 0, r: 0.92, double: true },
  hydraulic: { c: [0.86, 0.63, 0.1], m: 0.35, r: 0.45 },
  chrome: { c: [0.8, 0.8, 0.82], m: 1, r: 0.15 },
  cable: { c: [0.05, 0.05, 0.055], m: 0, r: 0.7 },
  glow: { c: [1, 0.5, 0.15], m: 0, r: 0.6, e: [1, 0.42, 0.08], es: 4 },
  screen: { c: [0.05, 0.12, 0.18], m: 0, r: 0.3, e: [0.2, 0.55, 0.85], es: 1.6 },
  glass: { c: [0.1, 0.16, 0.2], m: 0.2, r: 0.1 },
  concrete: { c: [0.11, 0.115, 0.12], m: 0, r: 0.95 },
  transformer: { c: [0.22, 0.3, 0.25], m: 0.45, r: 0.55 },
  pipe: { c: [0.58, 0.6, 0.62], m: 0.7, r: 0.4 },
  dri: { c: [0.3, 0.29, 0.28], m: 0.3, r: 0.8 },
  belt: { c: [0.08, 0.08, 0.08], m: 0, r: 0.9 },
  grating: { c: [0.32, 0.33, 0.34], m: 0.6, r: 0.6 },
};

// ---------- registro de partes por nodo ----------
/** @type {Map<string, {parent: string|null, parts: {geo: THREE.BufferGeometry, mat: string}[]}>} */
const NODES = new Map();
function node(name, parent = null) {
  if (!NODES.has(name)) NODES.set(name, { parent, parts: [] });
  return name;
}
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
function add(name, geo, mat, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
  q.setFromEuler(new THREE.Euler(r[0], r[1], r[2]));
  m4.compose(new THREE.Vector3(...p), q, new THREE.Vector3(...s));
  const g = geo.index ? geo : geo; // mantener índice
  g.applyMatrix4(m4);
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  NODES.get(name).parts.push({ geo: g, mat });
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, seg = 32, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
const torus = (R, r, seg = 48, arc = Math.PI * 2) => new THREE.TorusGeometry(R, r, 10, seg, arc);
/** tubo recto entre dos puntos */
function tubeBetween(name, a, b, r, mat, seg = 12) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const g = cyl(r, r, len, seg);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const dir = B.clone().sub(A).normalize();
  const qq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const mm = new THREE.Matrix4().compose(mid, qq, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(mm);
  add(name, g, mat);
}
function tubeCurve(name, pts, r, mat, seg = 40) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  add(name, new THREE.TubeGeometry(curve, seg, r, 10, false), mat);
}
const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

// ---------- jerarquía ----------
const SYS = ['shell', 'roof', 'electrodes', 'arms', 'transformer', 'secondary', 'oxygen', 'slagdoor', 'ebt', 'hydraulics', 'refractory', 'cooling', 'fume', 'drifeed', 'control'];
const SUB = {
  shell: ['upper', 'hearth'], roof: ['delta'], electrodes: ['column', 'joint', 'tip'], arms: ['clamp', 'mast', 'cylinder', 'busstube'],
  transformer: ['tank', 'oltc'], secondary: ['cables', 'busbar'], oxygen: ['lance', 'carbon'], ebt: ['pit'], fume: ['elbow'], drifeed: ['chute'],
};
for (const s of SYS) {
  node(`eaf__${s}`);
  for (const c of SUB[s] ?? []) node(`eaf__${s}_${c}`, `eaf__${s}`);
}
node('env__platform');
node('env__bath');

// ---------- plataforma (entorno) ----------
add('env__platform', box(14, Y0, 22), 'concrete', [-6, Y0 / 2, 0]);
add('env__platform', box(6, Y0, 7), 'concrete', [4, Y0 / 2, -7.5]);
add('env__platform', box(6, Y0, 7), 'concrete', [4, Y0 / 2, 7.5]);
add('env__platform', box(2.2, 0.05, 4), 'grating', [4, Y0 + 0.02, 0]);
// barandales
for (const z of [-11, 11]) tubeBetween('env__platform', [-13, Y0 + 1.1, z], [7, Y0 + 1.1, z], 0.04, 'hydraulic');

// ---------- 01 coraza y solera ----------
add('eaf__shell_hearth', lathe([[0, Y0 + 0.25], [2.3, Y0 + 0.25], [2.85, Y0 + 0.55], [3.15, Y0 + 1.05], [3.25, Y0 + 1.6]]), 'shell');
add('eaf__shell_hearth', torus(3.27, 0.07), 'steel', [0, Y0 + 1.6, 0], [Math.PI / 2, 0, 0]);
add('eaf__shell_upper', cyl(3.28, 3.28, 1.8, 64, true), 'shell', [0, Y0 + 2.5, 0]);
add('eaf__shell_upper', torus(3.3, 0.08, 64), 'steel', [0, Y0 + 3.4, 0], [Math.PI / 2, 0, 0]);
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2;
  add('eaf__shell_upper', box(0.08, 1.8, 0.2), 'steel', [Math.cos(a) * 3.33, Y0 + 2.5, Math.sin(a) * 3.33], [0, -a, 0]);
}
// cuna basculante (estructura)
for (const z of [-1.6, 1.6]) {
  add('eaf__shell', new THREE.CylinderGeometry(3.4, 3.4, 0.35, 48, 1, false, Math.PI * 0.75, Math.PI * 0.5), 'steel', [0, Y0 + 3.15, z], [Math.PI / 2, 0, 0]);
}
add('eaf__shell', box(7.6, 0.3, 4.2), 'steel', [0, Y0 + 0.1, 0]);

// ---------- 11 refractario (visible en corte / rayos X) ----------
add('eaf__refractory', lathe([[0, Y0 + 0.4], [2.15, Y0 + 0.4], [2.7, Y0 + 0.7], [2.98, Y0 + 1.15], [3.05, Y0 + 1.6], [2.75, Y0 + 1.6], [2.6, Y0 + 1.15], [2.3, Y0 + 0.95], [0, Y0 + 0.9]]), 'refractory');
add('env__bath', new THREE.CircleGeometry(2.62, 48), 'glow', [0, Y0 + 1.05, 0], [-Math.PI / 2, 0, 0]);

// ---------- 12 paneles enfriados por agua ----------
for (let i = 0; i < 20; i++) {
  const a0 = (i / 20) * Math.PI * 2 + 0.01;
  add('eaf__cooling', new THREE.CylinderGeometry(3.14, 3.14, 1.62, 6, 1, true, a0, (Math.PI * 2) / 20 - 0.03), 'panel', [0, Y0 + 2.5, 0]);
}
for (const y of [Y0 + 1.75, Y0 + 3.25]) add('eaf__cooling', torus(3.55, 0.09, 64), 'pipe', [0, y, 0], [Math.PI / 2, 0, 0]);
for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2 + 0.15;
  tubeCurve('eaf__cooling', [[Math.cos(a) * 3.55, Y0 + 1.75, Math.sin(a) * 3.55], [Math.cos(a) * 3.62, Y0 + 2.5, Math.sin(a) * 3.62], [Math.cos(a) * 3.55, Y0 + 3.25, Math.sin(a) * 3.55]], 0.045, 'cable', 12);
}

// ---------- 02 bóveda y delta ----------
add('eaf__roof', cyl(3.38, 3.38, 0.35, 64), 'panel', [0, Y0 + 3.6, 0]);
add('eaf__roof', cyl(1.35, 3.38, 0.75, 64, true), 'panel', [0, Y0 + 4.15, 0]);
add('eaf__roof', torus(3.4, 0.1, 64), 'pipe', [0, Y0 + 3.78, 0], [Math.PI / 2, 0, 0]);
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  tubeBetween('eaf__roof', [Math.cos(a) * 3.2, Y0 + 3.8, Math.sin(a) * 3.2], [Math.cos(a) * 1.45, Y0 + 4.52, Math.sin(a) * 1.45], 0.05, 'pipe', 8);
}
add('eaf__roof_delta', cyl(1.3, 1.35, 0.4, 48), 'refractory', [0, Y0 + 4.7, 0]);

// ---------- 03 electrodos ----------
const EL = [180, 60, 300].map((deg) => [Math.cos((deg * Math.PI) / 180) * 0.8, Math.sin((deg * Math.PI) / 180) * 0.8]);
const ELTOP = Y0 + 10.2;
for (const [x, z] of EL) {
  add('eaf__electrodes_column', cyl(0.3, 0.3, ELTOP - (Y0 + 1.75), 32), 'graphite', [x, (ELTOP + Y0 + 1.75) / 2, z]);
  for (const y of [Y0 + 4.2, Y0 + 6.9, Y0 + 9.4]) add('eaf__electrodes_joint', cyl(0.31, 0.31, 0.08, 32), 'joint', [x, y, z]);
  add('eaf__electrodes_tip', cyl(0.3, 0.24, 0.35, 32), 'tip', [x, Y0 + 1.58, z]);
}

// ---------- 04 brazos, mástiles, cilindros ----------
const MASTX = -5.6;
const ARMY = Y0 + 8.3;
for (const [x, z] of EL) {
  add('eaf__arms_busstube', box(x - MASTX + 0.2, 0.55, 0.46), 'copper', [(x + MASTX) / 2 - 0.1, ARMY, z]);
  add('eaf__arms_clamp', cyl(0.45, 0.45, 0.7, 24), 'steel', [x, ARMY, z]);
  add('eaf__arms_clamp', box(0.25, 0.4, 0.9), 'hydraulic', [x - 0.55, ARMY + 0.1, z]);
  add('eaf__arms_mast', box(0.55, 7.4, 0.5), 'steel', [MASTX, Y0 + 4.95, z]);
  add('eaf__arms_cylinder', cyl(0.17, 0.17, 3.6, 20), 'hydraulic', [MASTX - 0.55, Y0 + 1.9, z]);
  add('eaf__arms_cylinder', cyl(0.07, 0.07, 2.4, 16), 'chrome', [MASTX - 0.55, Y0 + 4.9, z]);
}
// guías de mástil (fijas)
for (const y of [Y0 + 1.2, Y0 + 3.4]) add('eaf__arms', box(1.4, 0.35, 2.6), 'steel', [MASTX, y, 0]);
add('eaf__arms', box(0.3, 3.8, 0.3), 'steel', [MASTX + 0.55, Y0 + 2.1, 1.25]);
add('eaf__arms', box(0.3, 3.8, 0.3), 'steel', [MASTX + 0.55, Y0 + 2.1, -1.25]);

// ---------- 05 transformador ----------
const TX = -12.2;
add('eaf__transformer', box(0.4, 6.5, 7), 'concrete', [-9.6, Y0 + 3.25, 0]); // muro de bóveda (lado horno)
add('eaf__transformer', box(5.2, 6.5, 0.4), 'concrete', [-12.2, Y0 + 3.25, -3.5]);
add('eaf__transformer', box(5.2, 0.3, 7), 'concrete', [-12.2, Y0 + 6.5, 0]);
add('eaf__transformer_tank', box(2.8, 3.4, 3.2), 'transformer', [TX, Y0 + 1.7, 0]);
for (let i = 0; i < 7; i++) add('eaf__transformer_tank', box(0.06, 2.6, 0.9), 'transformer', [TX - 1.0 + i * 0.33, Y0 + 1.6, 2.05]);
add('eaf__transformer_tank', cyl(0.4, 0.4, 2.2, 24), 'transformer', [TX - 0.4, Y0 + 4.0, 0], [Math.PI / 2, 0, 0]);
for (let i = 0; i < 3; i++) add('eaf__transformer_tank', cyl(0.08, 0.12, 0.7, 12), 'chrome', [TX + 0.9, Y0 + 3.75, -1 + i]);
add('eaf__transformer_oltc', box(0.9, 1.8, 1.0), 'transformer', [TX - 1.85, Y0 + 1.3, -0.9]);
add('eaf__transformer_oltc', box(0.25, 0.25, 0.25), 'hydraulic', [TX - 2.35, Y0 + 1.6, -0.9]);

// ---------- 06 circuito secundario ----------
EL.forEach(([, z], i) => {
  const y = Y0 + 4.6 + i * 0.25;
  tubeBetween('eaf__secondary_busbar', [TX + 0.9, Y0 + 3.9, -1 + i], [TX + 0.9, y, -1 + i], 0.09, 'copper', 10);
  tubeBetween('eaf__secondary_busbar', [TX + 0.9, y, -1 + i], [-8.2, y, z], 0.09, 'copper', 10);
  for (const dz of [-0.12, 0.12]) {
    tubeCurve('eaf__secondary_cables', [[-8.2, y, z + dz], [-7.3, y - 1.4, z + dz], [-6.4, ARMY - 0.6, z + dz], [MASTX - 0.1, ARMY, z + dz]], 0.085, 'cable', 30);
  }
});

// ---------- 07 lanzas de O₂, quemadores e inyección de carbono ----------
for (const deg of [35, 145, 215, 325]) {
  const a = (deg * Math.PI) / 180;
  add('eaf__oxygen_lance', box(0.5, 0.45, 0.7), 'pipe', [Math.cos(a) * 3.45, Y0 + 2.45, Math.sin(a) * 3.45], [0, -a, 0]);
  tubeBetween('eaf__oxygen_lance', [Math.cos(a) * 3.7, Y0 + 2.5, Math.sin(a) * 3.7], [Math.cos(a) * 5.0, Y0 + 3.6, Math.sin(a) * 5.0], 0.05, 'pipe', 8);
}
tubeBetween('eaf__oxygen_lance', [1.2, Y0 + 2.9, 7.2], [0.4, Y0 + 1.6, 2.6], 0.07, 'chrome');
add('eaf__oxygen_lance', box(0.6, 0.6, 1.2), 'steel', [1.25, Y0 + 2.95, 7.4], [0.25, 0, 0]);
tubeBetween('eaf__oxygen_carbon', [-1.0, Y0 + 2.8, 7.2], [-0.5, Y0 + 1.5, 2.7], 0.06, 'steel');
add('eaf__oxygen_carbon', cyl(0.5, 0.5, 1.6, 20), 'steel', [-1.6, Y0 + 0.8, 8.4]);
add('eaf__oxygen_carbon', cyl(0.5, 0.05, 0.6, 20), 'steel', [-1.6, Y0 - 0.3 + 0.3, 8.4]);
tubeCurve('eaf__oxygen_carbon', [[-1.6, Y0 + 1.6, 8.4], [-1.3, Y0 + 2.6, 7.9], [-1.0, Y0 + 2.8, 7.2]], 0.05, 'steel', 12);

// ---------- 08 puerta de escoria ----------
add('eaf__slagdoor', box(1.9, 1.5, 0.35), 'steel', [0, Y0 + 2.3, 3.32]);
add('eaf__slagdoor', box(1.5, 1.1, 0.18), 'panel', [0, Y0 + 2.15, 3.55]);
for (const x of [-0.85, 0.85]) add('eaf__slagdoor', box(0.18, 2.3, 0.25), 'steel', [x, Y0 + 2.6, 3.62]);
add('eaf__slagdoor', cyl(0.1, 0.1, 1.2, 12), 'hydraulic', [0.95, Y0 + 3.4, 3.7]);

// ---------- 09 vaciado EBT y fosa ----------
add('eaf__ebt', box(1.4, 1.5, 1.8), 'shell', [3.7, Y0 + 1.0, 0]);
add('eaf__ebt', box(1.5, 0.12, 1.9), 'steel', [3.75, Y0 + 1.8, 0]);
add('eaf__ebt', cyl(0.3, 0.3, 0.3, 20), 'refractory', [3.95, Y0 + 1.9, 0]);
add('eaf__ebt', cyl(0.22, 0.18, 0.7, 20), 'refractory', [3.95, Y0 + 0.0, 0]);
add('eaf__ebt_pit', lathe([[0, 0.3], [1.35, 0.3], [1.55, 1.5], [1.7, 2.7], [1.85, 2.75]], 40), 'steel', [4.0, 0, 0]);
add('eaf__ebt_pit', box(3.2, 0.3, 2.6), 'hydraulic', [4.0, 0.15, 0]);
add('eaf__ebt_pit', torus(1.72, 0.08), 'steel', [4.0, 2.2, 0], [Math.PI / 2, 0, 0]);

// ---------- 10 sistema hidráulico ----------
const HX = -7.5, HZ = -7.2;
add('eaf__hydraulics', box(3.2, 1.4, 1.8), 'steel', [HX, Y0 + 0.7, HZ]);
for (let i = 0; i < 3; i++) {
  add('eaf__hydraulics', cyl(0.25, 0.25, 0.7, 20), 'transformer', [HX - 1 + i, Y0 + 1.75, HZ], [0, 0, Math.PI / 2]);
}
for (let i = 0; i < 4; i++) add('eaf__hydraulics', cyl(0.22, 0.22, 2.0, 20), 'hydraulic', [HX - 1.2 + i * 0.8, Y0 + 1.0, HZ - 1.4]);
tubeCurve('eaf__hydraulics', [[HX + 1.6, Y0 + 0.5, HZ], [-6.2, Y0 + 0.4, -3], [MASTX - 0.55, Y0 + 0.3, -0.69]], 0.05, 'pipe', 20);
for (const x of [-2.6, 2.6]) {
  add('eaf__hydraulics', cyl(0.2, 0.2, 2.0, 20), 'hydraulic', [x, Y0 - 1.0, 1.0], [0.3, 0, 0]);
  add('eaf__hydraulics', cyl(0.09, 0.09, 1.0, 12), 'chrome', [x, Y0 - 0.05, 1.3], [0.3, 0, 0]);
}

// ---------- 13 extracción de humos (4.º agujero) ----------
tubeCurve('eaf__fume_elbow', [[2.0, Y0 + 4.0, -1.2], [2.3, Y0 + 5.2, -1.4], [3.1, Y0 + 6.1, -1.8], [4.0, Y0 + 6.5, -2.3]], 0.55, 'panel', 30);
add('eaf__fume', cyl(0.75, 0.75, 9, 32), 'steel', [8.8, Y0 + 6.8, -2.6], [0, 0, Math.PI / 2]);
add('eaf__fume', cyl(0.78, 0.78, 0.4, 32), 'pipe', [4.6, Y0 + 6.8, -2.6], [0, 0, Math.PI / 2]);
add('eaf__fume', cyl(0.75, 0.75, 6, 32), 'steel', [13.3, Y0 + 9.8, -2.6]);
for (const x of [7, 11]) add('eaf__fume', box(0.3, Y0 + 6, 0.3), 'steel', [x, (Y0 + 6) / 2, -2.6]);

// ---------- 14 alimentación de DRI (5.º agujero) ----------
tubeBetween('eaf__drifeed_chute', [-1.5, Y0 + 4.3, 1.9], [-1.5, Y0 + 9.6, 5.0], 0.32, 'steel', 20);
add('eaf__drifeed_chute', cyl(0.42, 0.42, 0.25, 20), 'steel', [-1.5, Y0 + 4.35, 1.9]);
add('eaf__drifeed', cyl(1.2, 0.35, 1.6, 24), 'steel', [-1.5, Y0 + 10.4, 5.2]);
add('eaf__drifeed', box(1.4, 0.15, 12), 'steel', [-1.5, Y0 + 11.6, 11.0], [-0.12, 0, 0]);
add('eaf__drifeed', box(1.0, 0.06, 12), 'belt', [-1.5, Y0 + 11.72, 11.0], [-0.12, 0, 0]);
for (let i = 0; i < 4; i++) add('eaf__drifeed', box(0.2, Y0 + 10.5 + i * 0.5, 0.2), 'steel', [-1.5, (Y0 + 10.5 + i * 0.5) / 2, 7 + i * 3]);
for (let i = 0; i < 70; i++) {
  const z = 5.8 + (i / 70) * 11.0;
  const y = Y0 + 11.82 + (z - 11.0) * Math.tan(0.12) + ((i * 37) % 7) * 0.012;
  add('eaf__drifeed', new THREE.IcosahedronGeometry(0.07 + ((i * 13) % 5) * 0.008, 0), 'dri', [-1.5 + (((i * 17) % 9) - 4) * 0.08, y, z]);
}

// ---------- 15 púlpito de control ----------
add('eaf__control', box(6, 0.3, 4), 'steel', [-3.5, Y0 + 1.6, 10.2]);
add('eaf__control', box(6, 3, 0.2), 'steel', [-3.5, Y0 + 3.2, 12.1]);
add('eaf__control', box(0.2, 3, 4), 'steel', [-6.4, Y0 + 3.2, 10.2]);
add('eaf__control', box(0.2, 3, 4), 'steel', [-0.6, Y0 + 3.2, 10.2]);
add('eaf__control', box(6.2, 0.25, 4.2), 'steel', [-3.5, Y0 + 4.75, 10.2]);
add('eaf__control', box(5.6, 2.2, 0.08), 'glass', [-3.5, Y0 + 3.2, 8.25], [-0.12, 0, 0]);
add('eaf__control', box(5.2, 0.9, 0.9), 'steel', [-3.5, Y0 + 2.2, 9.3]);
for (let i = 0; i < 5; i++) add('eaf__control', box(0.8, 0.5, 0.05), 'screen', [-5.3 + i * 0.9, Y0 + 2.95, 9.0], [-0.3, 0, 0]);
for (const x of [-6.2, -0.8]) add('eaf__control', box(0.25, 1.6, 0.25), 'steel', [x, Y0 + 0.8, 8.4]);

// ---------- exportar ----------
const doc = new Document();
const buffer = doc.createBuffer();
const emissiveExt = doc.createExtension(KHRMaterialsEmissiveStrength);
const matCache = {};
function material(name) {
  if (matCache[name]) return matCache[name];
  const d = MATS[name];
  const m = doc.createMaterial(name).setBaseColorFactor([...d.c, 1]).setMetallicFactor(d.m).setRoughnessFactor(d.r).setDoubleSided(!!d.double);
  if (d.e) {
    m.setEmissiveFactor(d.e);
    if (d.es && d.es > 1) m.setExtension('KHR_materials_emissive_strength', emissiveExt.createEmissiveStrength().setEmissiveStrength(d.es));
  }
  return (matCache[name] = m);
}
const scene = doc.createScene('eaf');
const root = doc.createNode('eaf');
scene.addChild(root);
const gNodes = {};
let tris = 0;
for (const [name, info] of NODES) {
  const n = doc.createNode(name);
  gNodes[name] = n;
  if (info.parts.length) {
    const byMat = {};
    for (const p of info.parts) (byMat[p.mat] ??= []).push(p.geo.index ? p.geo : p.geo);
    const mesh = doc.createMesh(name);
    for (const [mat, geos] of Object.entries(byMat)) {
      const g = mergeGeometries(geos.map((x) => (x.index ? x : x)), false);
      if (!g) throw new Error(`merge falló en ${name}/${mat}`);
      const pos = g.attributes.position.array, nor = g.attributes.normal.array, uv = g.attributes.uv.array;
      const idx = g.index ? g.index.array : Uint32Array.from({ length: pos.length / 3 }, (_, i) => i);
      tris += idx.length / 3;
      const prim = doc.createPrimitive()
        .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
        .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buffer))
        .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buffer))
        .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buffer))
        .setMaterial(material(mat));
      mesh.addPrimitive(prim);
    }
    n.setMesh(mesh);
  }
}
for (const [name, info] of NODES) (info.parent ? gNodes[info.parent] : root).addChild(gNodes[name]);

await MeshoptEncoder.ready;
await doc.transform(dedup(), weld(), prune({ keepLeaves: true }), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
fs.mkdirSync(OUT, { recursive: true });
const glb = await io.writeBinary(doc);
fs.writeFileSync(path.join(OUT, 'eaf.glb'), glb);
const names = [...NODES.keys()].filter((n) => n.startsWith('eaf__'));
fs.mkdirSync(NODES_OUT, { recursive: true });
fs.writeFileSync(path.join(NODES_OUT, 'eaf.nodes.json'), JSON.stringify(names, null, 2) + '\n');
console.log(`eaf.glb ${(glb.byteLength / 1024).toFixed(0)} KB · ${Math.round(tris).toLocaleString('es-MX')} triángulos · ${names.length} nodos eaf__ · ${Object.keys(matCache).length} materiales`);
