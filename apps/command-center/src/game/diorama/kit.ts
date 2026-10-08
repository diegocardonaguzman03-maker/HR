// Kit — a tiny modelling toolkit for procedural architecture.
// Recipes add primitives with a local transform stack; build() merges them by
// (layer, material) so a detailed building costs a handful of draw calls.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAT, type MatKey } from './materials';

/**
 * shell     — always visible structure
 * roof      — fades away when the camera comes close (cutaway)
 * wall±x/z  — walls hidden when they face the camera (dynamic section cut)
 * interior  — rooms and furniture (medium zoom and closer)
 * detail    — small props (close zoom only)
 * lights    — lamps that switch on with activity
 * screen:*  — displays that switch on with activity
 */
export type Layer = 'shell' | 'roof' | 'wall+x' | 'wall-x' | 'wall+z' | 'wall-z' | 'interior' | 'detail' | 'lights' | `screen:${ScreenKind}`;
export type ScreenKind = 'chart' | 'code' | 'map' | 'cad' | 'people' | 'video' | 'kanban' | 'finance';

export interface Spot {
  x: number;
  y: number;
  z: number;
  /** Facing angle (radians, around Y). */
  ry: number;
  /** Seated (desk / table) or standing. */
  seated: boolean;
}

interface Opt {
  layer?: Layer;
  ry?: number;
  rx?: number;
  rz?: number;
  cast?: boolean;
}

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3(1, 1, 1);

// Shared unit primitives (cloned + transformed when added).
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
const CYL_CACHE = new Map<string, THREE.BufferGeometry>();
function unitCyl(seg: number, top = 1): THREE.BufferGeometry {
  const k = `${seg}:${top}`;
  let g = CYL_CACHE.get(k);
  if (!g) {
    g = new THREE.CylinderGeometry(top, 1, 1, seg, 1).translate(0, 0.5, 0);
    CYL_CACHE.set(k, g);
  }
  return g;
}
const UNIT_SPHERE = new THREE.SphereGeometry(1, 12, 8);
const UNIT_HEMI = new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2);

export class Kit {
  private parts = new Map<string, THREE.BufferGeometry[]>();
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()];
  readonly spots = { work: [] as Spot[], meet: [] as Spot[], idle: [] as Spot[] };

  private get m(): THREE.Matrix4 {
    return this.stack[this.stack.length - 1];
  }

  /** Enter a local frame (translate then rotate around Y). */
  push(x: number, z: number, ry = 0, y = 0): this {
    const local = new THREE.Matrix4().compose(tmpV.set(x, y, z), tmpQ.setFromEuler(tmpE.set(0, ry, 0)), tmpS.set(1, 1, 1));
    this.stack.push(this.m.clone().multiply(local));
    return this;
  }
  pop(): this {
    if (this.stack.length > 1) this.stack.pop();
    return this;
  }

  /** Add an arbitrary geometry (already in local units) at a position. */
  add(mat: MatKey, geo: THREE.BufferGeometry, x: number, y: number, z: number, sx: number, sy: number, sz: number, o: Opt = {}): this {
    const layer = o.layer ?? 'shell';
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
    tmpM.compose(tmpV.set(x, y, z), tmpQ.setFromEuler(tmpE.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0)), tmpS.set(sx, sy, sz));
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(this.m, tmpM));
    const key = `${layer}|${mat}`;
    const list = this.parts.get(key) ?? [];
    list.push(g);
    this.parts.set(key, list);
    return this;
  }

  /** Box with its base at y. */
  box(mat: MatKey, w: number, h: number, d: number, x: number, y: number, z: number, o: Opt = {}): this {
    return this.add(mat, UNIT_BOX, x, y, z, w, h, d, o);
  }
  cyl(mat: MatKey, r: number, h: number, x: number, y: number, z: number, o: Opt & { seg?: number; top?: number } = {}): this {
    return this.add(mat, unitCyl(o.seg ?? 12, o.top ?? 1), x, y, z, r, h, r, o);
  }
  sphere(mat: MatKey, r: number, x: number, y: number, z: number, o: Opt & { sy?: number } = {}): this {
    return this.add(mat, UNIT_SPHERE, x, y, z, r, r * (o.sy ?? 1), r, o);
  }
  dome(mat: MatKey, r: number, x: number, y: number, z: number, o: Opt & { sy?: number } = {}): this {
    return this.add(mat, UNIT_HEMI, x, y, z, r, r * (o.sy ?? 1), r, o);
  }
  /** Horizontal bar between two points at height y (pipes, rails, beams). */
  bar(mat: MatKey, x0: number, z0: number, x1: number, z1: number, y: number, t = 0.06, o: Opt = {}): this {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const ry = Math.atan2(-(z1 - z0), x1 - x0);
    return this.box(mat, len, t, t, (x0 + x1) / 2, y - t / 2, (z0 + z1) / 2, { ...o, ry });
  }
  /** Vertical pipe/post. */
  post(mat: MatKey, x: number, z: number, y0: number, y1: number, r = 0.05, o: Opt = {}): this {
    return this.cyl(mat, r, y1 - y0, x, y0, z, { seg: 6, ...o });
  }

  /** Record a spot (transformed into building-local space). */
  spot(kind: keyof Kit['spots'], x: number, z: number, ry: number, seated: boolean, y = 0): this {
    const p = new THREE.Vector3(x, y, z).applyMatrix4(this.m);
    const e = new THREE.Euler().setFromRotationMatrix(this.m);
    this.spots[kind].push({ x: p.x, y: p.y, z: p.z, ry: ry + e.y, seated });
    return this;
  }

  /** Merge everything into meshes grouped by layer. */
  build(): { group: THREE.Group; layers: Map<Layer, THREE.Mesh[]> } {
    const group = new THREE.Group();
    const layers = new Map<Layer, THREE.Mesh[]>();
    for (const [key, geos] of this.parts) {
      const [layer, mat] = key.split('|') as [Layer, MatKey];
      const merged = mergeGeometries(geos, false);
      for (const g of geos) g.dispose();
      if (!merged) continue;
      merged.computeBoundingSphere();
      const material = MAT[mat];
      const mesh = new THREE.Mesh(merged, material);
      const transparent = (material as THREE.Material).transparent;
      mesh.castShadow = !transparent && layer !== 'detail' && !layer.startsWith('screen');
      mesh.receiveShadow = !transparent;
      mesh.userData.layer = layer;
      mesh.userData.mat = mat;
      group.add(mesh);
      const list = layers.get(layer) ?? [];
      list.push(mesh);
      layers.set(layer, list);
    }
    this.parts.clear();
    return { group, layers };
  }
}
