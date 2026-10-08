// A project's micro-environment in the diorama: architecture from a recipe,
// cutaway behaviour (roofs and camera-facing walls fade away up close),
// workspaces that light up with activity, physical signage and state beacons.
import * as THREE from 'three';
import type { BuildingType, ID, Priority, ProjectStatus, TerritoryId } from '@/types/domain';
import type { Layer, ScreenKind, Spot } from './kit';
import { MAT, padTexture } from './materials';
import { paletteFor, RECIPES, type Anim } from './recipes';
import { screenMaterial } from './screens';

export interface BuildingModel {
  id: ID;
  type: BuildingType;
  territory: TerritoryId;
  structure: string;
  name: string;
  status: ProjectStatus;
  priority: Priority;
  /** World centre. */
  x: number;
  z: number;
  /** Footprint (world units). */
  w: number;
  d: number;
  underConstruction?: boolean;
}

export type Lod = 'far' | 'mid' | 'near';

const SIDES: { layer: Layer; n: THREE.Vector3 }[] = [
  { layer: 'wall+x', n: new THREE.Vector3(1, 0, 0) },
  { layer: 'wall-x', n: new THREE.Vector3(-1, 0, 0) },
  { layer: 'wall+z', n: new THREE.Vector3(0, 0, 1) },
  { layer: 'wall-z', n: new THREE.Vector3(0, 0, -1) },
];

const STATUS_HEX: Record<ProjectStatus, number> = {
  active: 0x6fbf8a,
  planning: 0xd9a54a,
  paused: 0x8e9196,
  blocked: 0xd9483b,
  completed: 0x7fb6d9,
  archived: 0x5a5d62,
};

interface Fader {
  meshes: THREE.Mesh[];
  mats: THREE.Material[];
  base: number[];
  value: number;
  target: number;
}

export class Building3D {
  readonly group = new THREE.Group();
  readonly hit: THREE.Mesh;
  readonly spots: { work: Spot[]; meet: Spot[]; idle: Spot[] };
  /** World-space entrance (agents walk through here). */
  readonly door = new THREE.Vector3();
  readonly height: number;
  activity = 0;
  activityTarget = 0;
  waiting = 0;
  blocked = false;
  private layers: Map<Layer, THREE.Mesh[]>;
  private roof: Fader;
  private walls = new Map<Layer, Fader>();
  private screenMeshes: { mesh: THREE.Mesh; kind: ScreenKind }[] = [];
  private lightMeshes: THREE.Mesh[] = [];
  private anims: Anim[];
  private movers: THREE.Object3D[];
  private signMesh: THREE.Mesh;
  private signTex: THREE.CanvasTexture;
  private signKey = '';
  private statusLamp: THREE.Mesh;
  private beacon: THREE.Group;
  private selRing: THREE.Mesh;
  private grow = 1;
  private model: BuildingModel;
  private lit = false;
  private screensOn = false;
  selected = false;
  hovered = false;

  constructor(m: BuildingModel, animateIn: boolean) {
    this.model = m;
    const recipe = RECIPES[m.type]({ w: m.w, d: m.d, pal: paletteFor(m.type, m.territory), territory: m.territory });
    this.height = recipe.height;
    this.spots = recipe.kit.spots;
    const built = recipe.kit.build();
    this.layers = built.layers;
    this.group.add(built.group);
    this.anims = recipe.anims;
    this.movers = recipe.movers;
    for (const mv of this.movers) {
      mv.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).castShadow = true;
      });
      this.group.add(mv);
    }
    this.group.position.set(m.x, 0, m.z);
    this.group.userData.buildingId = m.id;

    // contact-shadow pad (ambient occlusion around the base)
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: padTexture(), transparent: true, depthWrite: false, toneMapped: false }),
    );
    pad.scale.set(m.w * 1.9, 1, m.d * 1.9);
    pad.position.y = 0.012;
    pad.renderOrder = -1;
    this.group.add(pad);

    // cutaway faders
    this.roof = this.fader(this.layers.get('roof') ?? []);
    for (const s of SIDES) this.walls.set(s.layer, this.fader(this.layers.get(s.layer) ?? []));
    for (const [layer, meshes] of this.layers) {
      if (layer.startsWith('screen:')) for (const mesh of meshes) this.screenMeshes.push({ mesh, kind: layer.slice(7) as ScreenKind });
      if (layer === 'lights') this.lightMeshes.push(...meshes);
    }

    // physical signage: a graphite plinth with the structure's name
    const sign = recipe.sign;
    const signGroup = new THREE.Group();
    signGroup.position.set(sign.x, 0, sign.z);
    signGroup.rotation.y = sign.ry;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.62, 0.12), MAT.graphite);
    plate.position.y = 0.55;
    plate.castShadow = true;
    signGroup.add(plate);
    for (const sx of [-0.85, 0.85]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.08), MAT.steelDark);
      leg.position.set(sx, 0.13, 0);
      signGroup.add(leg);
    }
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 136;
    this.signTex = new THREE.CanvasTexture(c);
    this.signTex.colorSpace = THREE.SRGBColorSpace;
    this.signTex.anisotropy = 4;
    this.signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.22, 0.56), new THREE.MeshBasicMaterial({ map: this.signTex, toneMapped: false }));
    this.signMesh.position.set(0, 0.55, 0.062);
    signGroup.add(this.signMesh);
    this.statusLamp = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 0.13), new THREE.MeshBasicMaterial({ color: STATUS_HEX[m.status] }));
    this.statusLamp.position.y = 0.24;
    signGroup.add(this.statusLamp);
    this.group.add(signGroup);

    // "needs Francisco" beacon (subtle amber marker above the roofline)
    this.beacon = new THREE.Group();
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), MAT.glowAmber);
    gem.scale.y = 1.4;
    this.beacon.add(gem);
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.56, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc061, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
    halo.position.y = -0.6;
    this.beacon.add(halo);
    this.beacon.position.set(0, this.height + 1.4, 0);
    this.beacon.visible = false;
    this.group.add(this.beacon);

    // selection ring on the ground
    const r = Math.max(m.w, m.d) * 0.78;
    this.selRing = new THREE.Mesh(
      new THREE.RingGeometry(r, r + 0.12, 64).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xf2e6c8, transparent: true, opacity: 0, depthWrite: false }),
    );
    this.selRing.position.y = 0.03;
    this.group.add(this.selRing);

    // pick volume
    this.hit = new THREE.Mesh(new THREE.BoxGeometry(m.w + 0.6, this.height + 0.4, m.d + 0.6), new THREE.MeshBasicMaterial());
    this.hit.position.set(m.x, (this.height + 0.4) / 2, m.z);
    this.hit.visible = false;
    this.hit.userData.pick = { kind: m.id === 'citadel' ? 'citadel' : 'project', id: m.id };

    const door = recipe.door;
    this.door.set(m.x + door.x, 0, m.z + door.z);

    if (animateIn || m.underConstruction) this.grow = 0;
    this.update(m);
  }

  private fader(meshes: THREE.Mesh[]): Fader {
    const mats = meshes.map((mesh) => {
      const mat = (mesh.material as THREE.Material).clone();
      mesh.material = mat;
      return mat;
    });
    return { meshes, mats, base: mats.map((m) => m.opacity), value: 1, target: 1 };
  }

  update(m: BuildingModel): void {
    this.model = m;
    const key = `${m.structure}|${m.name}|${m.status}|${m.priority}`;
    if (key !== this.signKey) {
      this.signKey = key;
      this.drawSign();
      (this.statusLamp.material as THREE.MeshBasicMaterial).color.setHex(STATUS_HEX[m.status]);
    }
  }

  private drawSign(): void {
    const c = this.signTex.image as HTMLCanvasElement;
    const g = c.getContext('2d')!;
    const m = this.model;
    g.fillStyle = '#2f3237';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#f1ede4';
    g.textBaseline = 'middle';
    let size = 40;
    const title = m.structure.toUpperCase();
    g.font = `600 ${size}px Inter, "Helvetica Neue", Arial, sans-serif`;
    while (g.measureText(title).width > 470 && size > 20) {
      size -= 2;
      g.font = `600 ${size}px Inter, "Helvetica Neue", Arial, sans-serif`;
    }
    g.fillText(title, 22, 50);
    g.fillStyle = 'rgba(241,237,228,0.6)';
    g.font = '400 22px Inter, "Helvetica Neue", Arial, sans-serif';
    let sub = m.id === 'citadel' ? 'Francisco · Command Center' : m.name;
    while (g.measureText(sub).width > 470 && sub.length > 4) sub = sub.slice(0, -2);
    if (sub !== m.name && m.id !== 'citadel') sub += '…';
    g.fillText(sub, 22, 100);
    this.signTex.needsUpdate = true;
  }

  /** World-space spot for an agent. */
  spotWorld(s: Spot, out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(this.model.x + s.x, s.y, this.model.z + s.z);
  }

  get id(): ID {
    return this.model.id;
  }
  get status(): ProjectStatus {
    return this.model.status;
  }
  get center(): THREE.Vector3 {
    return new THREE.Vector3(this.model.x, 0, this.model.z);
  }
  get footprint(): number {
    return Math.max(this.model.w, this.model.d);
  }
  get signWorld(): THREE.Vector3 {
    return this.signMesh.getWorldPosition(new THREE.Vector3());
  }

  setLod(lod: Lod, camDir: THREE.Vector3, camDist: number): void {
    const focused = this.selected || this.hovered;
    const close = lod !== 'far';
    // roofs lift away when we look closely (or when the building is selected)
    this.roof.target = (close && camDist < 95) || this.selected ? 0 : 1;
    for (const s of SIDES) {
      const f = this.walls.get(s.layer)!;
      const facing = s.n.dot(camDir) > 0.2;
      f.target = facing && (close || focused) ? 0 : 1;
    }
    const interior = lod !== 'far' || this.selected;
    for (const [layer, meshes] of this.layers) {
      if (layer === 'interior' || layer.startsWith('screen:')) for (const m of meshes) m.visible = interior;
      // ceiling lights belong to the roof: they glow through the glass, and go with the roof in cutaway
      else if (layer === 'lights') for (const m of meshes) m.visible = interior && this.roof.target === 1;
      else if (layer === 'detail') for (const m of meshes) m.visible = lod === 'near' || (this.selected && lod === 'mid');
    }
    for (const mv of this.movers) mv.visible = lod !== 'far' || camDist < 170;
  }

  tick(t: number, dt: number, reduced: boolean): void {
    const k = 1 - Math.exp(-dt * 6);
    this.activity += (this.activityTarget - this.activity) * k;
    stepFader(this.roof, k);
    for (const f of this.walls.values()) stepFader(f, k);
    if (this.grow < 1) {
      this.grow = Math.min(1, this.grow + dt / 1.6);
      const e = 1 - Math.pow(1 - this.grow, 3);
      this.group.scale.set(1, Math.max(0.02, e), 1);
    }
    // lights + screens follow activity (paused projects stay dark)
    const on = this.activity > 0.15 && this.model.status !== 'paused';
    if (on !== this.lit) {
      this.lit = on;
      for (const m of this.lightMeshes) m.material = on ? MAT.lampOn : MAT.lampOff;
    }
    const screens = on || this.model.id === 'citadel';
    if (screens !== this.screensOn) {
      this.screensOn = screens;
      for (const s of this.screenMeshes) s.mesh.material = screens ? screenMaterial(s.kind) : MAT.screenOff;
    }
    if (!reduced) for (const a of this.anims) a(t, dt, this.activity);
    // needs-Francisco beacon
    this.beacon.visible = this.waiting > 0;
    if (this.beacon.visible) {
      this.beacon.position.y = this.height + 1.4 + (reduced ? 0 : Math.sin(t * 2.2) * 0.12);
      this.beacon.rotation.y = reduced ? 0 : t * 0.8;
      const halo = this.beacon.children[1] as THREE.Mesh;
      const p = reduced ? 0.5 : (t * 0.6) % 1;
      halo.scale.setScalar(1 + p * 1.6);
      (halo.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - p);
    }
    const ringTarget = this.selected ? 0.85 : this.hovered ? 0.45 : 0;
    const rm = this.selRing.material as THREE.MeshBasicMaterial;
    rm.opacity += (ringTarget - rm.opacity) * k;
    this.selRing.visible = rm.opacity > 0.01;
  }

  setBeaconScale(s: number): void {
    this.beacon.scale.setScalar(s);
  }

  dispose(): void {
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
      }
    });
    for (const f of [this.roof, ...this.walls.values()]) for (const m of f.mats) m.dispose();
    this.signTex.dispose();
  }
}

function stepFader(f: Fader, k: number): void {
  if (Math.abs(f.value - f.target) < 0.002) {
    if (f.value === f.target) return;
    f.value = f.target;
  } else f.value += (f.target - f.value) * k;
  const v = f.value;
  f.meshes.forEach((mesh, i) => {
    const mat = f.mats[i];
    const base = f.base[i];
    mesh.visible = v > 0.02;
    const wasTransparent = mat.transparent;
    const needT = base < 1 || v < 0.999;
    mat.opacity = base * v;
    if (needT !== wasTransparent) {
      mat.transparent = needT;
      mat.depthWrite = !needT;
      mat.needsUpdate = true;
    }
    mesh.castShadow = v > 0.6 && base >= 1;
  });
}
