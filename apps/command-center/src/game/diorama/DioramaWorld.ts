// DioramaWorld — the 3D scene: a premium architectural miniature of
// Francisco's world. It knows nothing about React or providers: it receives
// WorldState snapshots + selection, renders them, and reports picks through
// callbacks. (Game layer ⟂ application layer.)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CITADEL_ID } from '@/data/agents';
import { GATE_RING, TERRITORIES } from '@/data/territories';
import type { Vec } from '@/services/geometry';
import type { WorldState } from '@/services/worldState';
import type { Agent, AgentState, BuildingType, ID, Project, TerritoryId } from '@/types/domain';
import type { WorldEvent } from '@/types/events';
import { Agent3D } from './Agent3D';
import { Building3D, type BuildingModel, type Lod } from './Building3D';
import { CameraRig, type Insets } from './CameraRig';
import type { Spot } from './kit';
import { AmbientLife, Parcels } from './life';
import { buildBase, buildDressing, buildHills, buildPaths, Vegetation, type Obstacle } from './landscape';
import { MAT, STATE_HEX } from './materials';
import { Overlay, type LabelInfo } from './Overlay';
import { screenMaterial, tickScreens } from './screens';
import { footprint, gateWorld, hubWorld, projectCenter, territoryAtWorld, territoryCenterWorld, tileToWorld, worldToTile } from './space';

export type Pick = { kind: 'agent' | 'project' | 'citadel'; id: ID } | null;

export interface GameCallbacks {
  onPick(p: Pick): void;
  onHover(p: Pick): void;
  onDoubleClickTerritory(t: TerritoryId): void;
  onCameraTerritory(t: TerritoryId | null): void;
}

export type FocusTarget =
  | { type: 'agent'; id: ID }
  | { type: 'project'; id: ID }
  | { type: 'territory'; id: TerritoryId }
  | { type: 'citadel' }
  | { type: 'world' }
  | { type: 'tile'; x: number; y: number; zoom?: number };

/** Live unit positions (tile space), read by the minimap without React re-renders. */
export const agentPositions = new Map<ID, Vec>();

const BG = 0xd7d8d4;
const STATE_LABEL: Record<AgentState, string> = {
  working: 'Active',
  researching: 'Researching',
  collaborating: 'Collaborating',
  waiting: 'Needs Francisco',
  reviewing: 'Reviewing',
  blocked: 'Blocked',
  idle: 'Idle',
  completed: 'Done',
  paused: 'Paused',
};
const hexCss = (n: number) => `#${n.toString(16).padStart(6, '0')}`;
const BUSY: AgentState[] = ['working', 'researching', 'reviewing', 'collaborating'];

interface Target {
  bid: ID;
  kind: 'work' | 'meet' | 'idle';
}

export class DioramaWorld {
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private rig = new CameraRig();
  private sun = new THREE.DirectionalLight(0xffeed6, 3.3);
  private buildings = new Map<ID, Building3D>();
  private units = new Map<ID, Agent3D>();
  private pickables: THREE.Object3D[] = [];
  private pickGroup = new THREE.Group();
  private pathsGroup: THREE.Group | null = null;
  private vegetation: Vegetation | null = null;
  private life!: AmbientLife;
  private parcels = new Parcels();
  private overlay!: Overlay;
  private raycaster = new THREE.Raycaster();
  private ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private state: WorldState | null = null;
  private selection: Pick = null;
  private hover: Pick = null;
  private structureKey = '';
  private el: HTMLElement | null = null;
  private cleanup: (() => void)[] = [];
  private ready = false;
  private destroyed = false;
  private reduced = false;
  private clock = new THREE.Clock();
  private time = 0;
  private raf = 0;
  private lod: Lod = 'far';
  private lastTerritory: TerritoryId | null | undefined = undefined;
  private w = 1;
  private h = 1;
  private frameAvg = 16;
  private pixelRatio = 1;
  private lastParcel = new Map<ID, number>();
  private shadowKey = '';
  private frameNo = 0;
  private shadowSize = 2048;
  private camDir = new THREE.Vector3();

  constructor(private cb: GameCallbacks) {}

  async init(el: HTMLElement): Promise<void> {
    this.el = el;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer = renderer;
    // 1.5× is visually indistinguishable from 2× on a diorama and ~44% cheaper on retina screens.
    this.pixelRatio = Math.min(1.5, window.devicePixelRatio || 1);
    renderer.setPixelRatio(this.pixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Shadows are re-rendered only when the view changes, plus at ~half rate for moving figures.
    renderer.shadowMap.autoUpdate = false;
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;touch-action:none;outline:none';
    el.appendChild(renderer.domElement);
    this.overlay = new Overlay(el);
    if (this.destroyed) return;

    // light: soft sky + warm sun with soft shadows + image-based fill
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.38;
    pmrem.dispose();
    this.scene.background = new THREE.Color(BG);
    this.scene.fog = new THREE.Fog(BG, 200, 600);
    this.scene.add(new THREE.HemisphereLight(0xf1efe9, 0x7d7568, 0.72));
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.035;
    this.scene.add(this.sun, this.sun.target);
    const fill = new THREE.DirectionalLight(0xdfe8f0, 0.35);
    fill.position.set(60, 40, 80);
    this.scene.add(fill);

    this.scene.add(buildBase());
    this.life = new AmbientLife();
    this.scene.add(this.life.group, this.parcels.group, this.pickGroup);
    this.pickGroup.visible = false;

    this.resize();
    // narrow (portrait) screens start a little further out so the district fits
    const startDist = THREE.MathUtils.clamp(112 / Math.min(1, (this.w / this.h) * 1.4), 112, 175);
    this.rig.set(new THREE.Vector3(-16, 0, -16), startDist * 1.5);
    this.rig.flyTo(new THREE.Vector3(-14, 0, -14), startDist);
    this.bindInput(renderer.domElement);
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(el);
    this.cleanup.push(() => ro.disconnect());
    this.ready = true;
    if (this.state) this.setWorld(this.state, true);
    this.prewarm();
    this.clock.start();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    this.raf = requestAnimationFrame(loop);
  }

  /**
   * Compile shader variants ahead of time so the first cutaway (roofs and walls
   * fading = transparent variants) and the first lit screens never stutter.
   */
  private prewarm(): void {
    const warm = new THREE.Group();
    warm.position.y = -50;
    const box = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    for (const m of Object.values(MAT)) {
      const t = m.clone();
      t.transparent = true;
      t.depthWrite = false;
      warm.add(new THREE.Mesh(box, t), new THREE.Mesh(box, m));
    }
    warm.add(new THREE.Mesh(box, screenMaterial('chart')));
    this.scene.add(warm);
    const done = () => {
      this.scene.remove(warm);
      warm.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && !Object.values(MAT).includes(mesh.material as never) && mesh.material !== screenMaterial('chart')) (mesh.material as THREE.Material).dispose();
      });
      box.dispose();
    };
    const r = this.renderer as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> };
    if (r.compileAsync) r.compileAsync(this.scene, this.rig.camera).then(done, done);
    else {
      r.compile(this.scene, this.rig.camera);
      done();
    }
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    for (const fn of this.cleanup) fn();
    agentPositions.clear();
    if (this.ready) {
      for (const b of this.buildings.values()) b.dispose();
      this.overlay.destroy();
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }

  setReducedMotion(v: boolean): void {
    this.reduced = v;
  }

  setInsets(insets: Partial<Insets>): void {
    this.rig.insets = { ...this.rig.insets, ...insets };
  }

  private resize(): void {
    if (!this.el) return;
    this.w = Math.max(1, this.el.clientWidth);
    this.h = Math.max(1, this.el.clientHeight);
    this.renderer.setSize(this.w, this.h, false);
    this.rig.resize(this.w, this.h);
  }

  // ───────────────────────── state sync ─────────────────────────

  private modelFor(p: Project): BuildingModel {
    const c = projectCenter(p);
    const f = footprint(p);
    const type: BuildingType = p.building === 'citadel' ? 'tower' : p.building;
    return { id: p.id, type, territory: p.territory, structure: p.structure, name: p.name, status: p.status, priority: p.priority, x: c.x, z: c.z, w: f, d: f * 0.86, underConstruction: p.underConstruction };
  }

  setWorld(s: WorldState, force = false): void {
    const prev = this.state;
    this.state = s;
    if (!this.ready) return;
    const first = this.buildings.size === 0;

    // structures
    const projects = Object.values(s.projects).filter((p) => p.status !== 'archived');
    if (!this.buildings.has(CITADEL_ID)) {
      const citadel = new Building3D({ id: CITADEL_ID, type: 'citadel', territory: 'citadel', structure: 'Command Citadel', name: 'Command Citadel', status: 'active', priority: 'high', x: 0, z: 0, w: 13, d: 13 }, false);
      this.addBuilding(citadel);
    }
    const live = new Set<ID>([CITADEL_ID]);
    for (const p of projects) {
      live.add(p.id);
      const m = this.modelFor(p);
      const b = this.buildings.get(p.id);
      if (b) b.update(m);
      else {
        const nb = new Building3D(m, !first);
        this.addBuilding(nb);
        if (!first) this.vegetation?.clearAround(m.x, m.z, Math.max(m.w, m.d) * 0.85 + 1.5);
      }
    }
    for (const [id, b] of this.buildings) {
      if (live.has(id)) continue;
      this.scene.remove(b.group);
      this.pickables = this.pickables.filter((o) => o !== b.hit);
      this.pickGroup.remove(b.hit);
      b.dispose();
      this.buildings.delete(id);
      for (const u of this.units.values()) if (u.at === id) u.at = null;
    }
    const key = [...live].sort().join('|');
    if (force || key !== this.structureKey) {
      this.structureKey = key;
      this.rebuildGround(first);
    }

    // agents
    if (!prev || prev.agents !== s.agents || force || first) this.syncAgents(s);
    this.syncActivity(s);
    this.applySelectionVisuals();
  }

  private addBuilding(b: Building3D): void {
    this.buildings.set(b.id, b);
    this.scene.add(b.group);
    this.pickGroup.add(b.hit);
    this.pickables.push(b.hit);
  }

  private obstacles(): Obstacle[] {
    const out: Obstacle[] = [];
    for (const b of this.buildings.values()) {
      const c = b.center;
      out.push({ x: c.x, z: c.z, r: b.footprint * 0.8 + 1.4 });
    }
    return out;
  }

  private rebuildGround(first: boolean): void {
    if (this.pathsGroup) {
      this.scene.remove(this.pathsGroup);
      this.pathsGroup.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
    }
    const doors = [...this.buildings.values()].filter((b) => b.id !== CITADEL_ID).map((b) => ({ territory: territoryAtWorld(b.center.x, b.center.z), door: { x: b.door.x, z: b.door.z } }));
    const { group, segments } = buildPaths(doors);
    this.pathsGroup = group;
    this.scene.add(group);
    if (first || !this.vegetation) {
      const obs = this.obstacles();
      const { group: hillGroup, hills } = buildHills(obs);
      this.scene.add(hillGroup);
      this.vegetation = new Vegetation([...obs, ...hills], segments);
      this.scene.add(this.vegetation.group);
      this.scene.add(buildDressing(obs));
    }
  }

  private targetFor(a: Agent): Target | null {
    const proj = a.currentTask?.projectId ?? null;
    const has = (id: ID | null | undefined): id is ID => !!id && this.buildings.has(id);
    const home = has(a.homeProjectId) ? a.homeProjectId : CITADEL_ID;
    switch (a.state) {
      case 'paused':
        return null;
      case 'collaborating':
        return { bid: has(proj) ? proj : home, kind: 'meet' };
      case 'working':
      case 'researching':
      case 'reviewing':
        return { bid: has(proj) ? proj : home, kind: 'work' };
      case 'waiting':
        return has(proj) ? { bid: proj, kind: 'work' } : { bid: CITADEL_ID, kind: 'idle' };
      case 'blocked':
        return { bid: has(proj) ? proj : home, kind: 'work' };
      default:
        return { bid: home, kind: 'idle' };
    }
  }

  private syncAgents(s: WorldState): void {
    const agents = Object.values(s.agents).sort((x, y) => x.id.localeCompare(y.id));
    const used = new Map<ID, Set<string>>();
    const plan = new Map<ID, { b: Building3D; spot: Spot; key: string } | null>();
    for (const a of agents) {
      const t = this.targetFor(a);
      if (!t) {
        plan.set(a.id, null);
        continue;
      }
      const b = this.buildings.get(t.bid)!;
      const taken = used.get(b.id) ?? new Set<string>();
      used.set(b.id, taken);
      const order: ('work' | 'meet' | 'idle')[] = t.kind === 'work' ? ['work', 'meet', 'idle'] : t.kind === 'meet' ? ['meet', 'work', 'idle'] : ['idle'];
      let chosen: { spot: Spot; key: string } | null = null;
      for (const k of order) {
        const list = b.spots[k];
        for (let i = 0; i < list.length && !chosen; i++) {
          const key = `${k}${i}`;
          if (!taken.has(key)) chosen = { spot: list[i], key };
        }
        if (chosen) break;
      }
      if (!chosen) {
        // stand outside by the entrance
        let i = 0;
        while (taken.has(`out${i}`)) i++;
        const local = { x: b.door.x - b.center.x, z: b.door.z - b.center.z };
        const ang = Math.PI / 4 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.9;
        chosen = { spot: { x: local.x + Math.sin(ang) * 0.9, y: 0, z: local.z + 0.4 + Math.cos(ang) * 0.6, ry: ang + Math.PI, seated: false }, key: `out${i}` };
      }
      taken.add(chosen.key);
      plan.set(a.id, { b, spot: chosen.spot, key: `${b.id}:${chosen.key}` });
    }

    for (const a of agents) {
      let u = this.units.get(a.id);
      if (!u) {
        u = new Agent3D(a);
        this.units.set(a.id, u);
        this.scene.add(u.group);
        this.pickGroup.add(u.hit);
        this.pickables.push(u.hit);
      }
      u.apply(a);
      const p = plan.get(a.id);
      if (!p) {
        if (!u.placed) {
          const b = this.buildings.get(a.homeProjectId) ?? this.buildings.get(CITADEL_ID)!;
          u.place(b.door.clone(), Math.PI / 4, false);
          u.at = null;
        }
        u.hold();
        continue;
      }
      if (p.key === u.destKey) continue;
      const dest = p.b.spotWorld(p.spot);
      if (!u.placed) u.place(dest, p.spot.ry, p.spot.seated);
      else u.walk(this.route(u, p.b, dest), p.spot.ry, p.spot.seated);
      u.destKey = p.key;
      u.at = p.b.id;
    }
    for (const [id, u] of this.units) {
      if (s.agents[id]) continue;
      this.scene.remove(u.group);
      this.pickGroup.remove(u.hit);
      this.pickables = this.pickables.filter((o) => o !== u.hit);
      u.dispose();
      this.units.delete(id);
      agentPositions.delete(id);
    }
  }

  private syncActivity(s: WorldState): void {
    const act = new Map<ID, number>();
    const wait = new Map<ID, number>();
    for (const a of Object.values(s.agents)) {
      const t = this.targetFor(a);
      if (!t) continue;
      if (BUSY.includes(a.state)) act.set(t.bid, (act.get(t.bid) ?? 0) + 1);
      if (a.state === 'waiting') wait.set(t.bid, (wait.get(t.bid) ?? 0) + 1);
    }
    for (const [id, b] of this.buildings) {
      b.activityTarget = Math.min(1, (act.get(id) ?? 0) / 2);
      b.waiting = wait.get(id) ?? 0;
    }
  }

  // ───────────────────────── routing ─────────────────────────

  private terrOf(b: Building3D | null, p: THREE.Vector3): TerritoryId {
    if (b?.id === CITADEL_ID) return 'citadel';
    const c = b ? b.center : p;
    return territoryAtWorld(c.x, c.z);
  }

  /** Walk the streets: door → street corner → hub → gate → ring → … → door → spot. */
  private route(u: Agent3D, to: Building3D, dest: THREE.Vector3): THREE.Vector3[] {
    const from = u.at ? this.buildings.get(u.at) ?? null : null;
    const below = (p: THREE.Vector3) => (p.y > 0.6 ? [new THREE.Vector3(p.x, 0.18, p.z), p] : [p]);
    if (from && from.id === to.id) return below(dest);
    const pts: THREE.Vector3[] = [];
    const V = (x: number, z: number) => new THREE.Vector3(x, 0, z);
    const start = from ? from.door : u.pos;
    if (from) {
      if (u.pos.y > 0.6) pts.push(new THREE.Vector3(u.pos.x, 0.18, u.pos.z));
      pts.push(from.door.clone());
    }
    const ta = this.terrOf(from, u.pos);
    const tb = this.terrOf(to, dest);
    const out = (t: TerritoryId, door: THREE.Vector3): THREE.Vector3[] => {
      if (t === 'citadel') return [];
      const h = hubWorld(t as Exclude<TerritoryId, 'citadel'>);
      return [V(h.x, door.z), V(h.x, h.z)];
    };
    if (ta === tb && ta !== 'citadel') {
      pts.push(...out(ta, start));
      pts.push(...out(tb, to.door).reverse());
    } else {
      pts.push(...out(ta, start));
      const ga = ta === 'citadel' ? 'frontier' : (ta as Exclude<TerritoryId, 'citadel'>);
      const gb = tb === 'citadel' ? 'frontier' : (tb as Exclude<TerritoryId, 'citadel'>);
      for (const g of ringPath(ga, gb)) {
        const w = gateWorld(g);
        pts.push(V(w.x, w.z));
      }
      pts.push(...out(tb, to.door).reverse());
    }
    pts.push(to.door.clone());
    pts.push(...below(dest));
    // drop consecutive duplicates
    return pts.filter((p, i) => i === 0 || p.distanceToSquared(pts[i - 1]) > 0.01);
  }

  // ───────────────────────── selection ─────────────────────────

  setSelection(sel: Pick, hover: Pick): void {
    if (sel?.kind !== 'agent' || sel.id !== this.selection?.id) this.rig.follow = null;
    this.selection = sel;
    this.hover = hover;
    this.applySelectionVisuals();
  }

  private applySelectionVisuals(): void {
    for (const [id, b] of this.buildings) {
      b.selected = (this.selection?.kind === 'project' || this.selection?.kind === 'citadel') && this.selection.id === id;
      b.hovered = (this.hover?.kind === 'project' || this.hover?.kind === 'citadel') && this.hover.id === id;
    }
    for (const [id, u] of this.units) {
      u.selected = this.selection?.kind === 'agent' && this.selection.id === id;
      u.hovered = this.hover?.kind === 'agent' && this.hover.id === id;
    }
  }

  // ───────────────────────── camera ─────────────────────────

  private fitDist(): number {
    const half = THREE.MathUtils.degToRad(this.rig.camera.fov / 2);
    const aspect = Math.max(0.5, (this.w - this.rig.insets.left - this.rig.insets.right) / this.h);
    return THREE.MathUtils.clamp(92 / (Math.tan(half) * Math.min(1.6, aspect)), 120, 230);
  }

  focus(t: FocusTarget): void {
    if (!this.ready) return;
    const reduced = this.reduced;
    this.rig.follow = null;
    switch (t.type) {
      case 'agent': {
        const u = this.units.get(t.id);
        if (!u) return;
        this.rig.flyTo(u.pos.clone().setY(0), Math.min(this.rig.goal.dist, 19), { reduced });
        this.rig.follow = () => u.pos;
        return;
      }
      case 'project':
      case 'citadel': {
        const id = t.type === 'citadel' ? CITADEL_ID : t.id;
        const b = this.buildings.get(id);
        if (!b) return;
        this.rig.flyTo(b.center, id === CITADEL_ID ? 40 : THREE.MathUtils.clamp(b.footprint * 3.3, 26, 44), { reduced });
        return;
      }
      case 'territory': {
        const c = territoryCenterWorld(t.id);
        this.rig.flyTo(new THREE.Vector3(c.x, 0, c.z), t.id === 'citadel' ? 40 : 92, { reduced });
        return;
      }
      case 'world':
        this.rig.flyTo(new THREE.Vector3(-2, 0, -2), this.fitDist(), { reduced, el: 0.66 });
        return;
      case 'tile': {
        const p = tileToWorld(t.x, t.y);
        this.rig.flyTo(new THREE.Vector3(p.x, 0, p.z), t.zoom ? 60 / t.zoom : this.rig.goal.dist, { reduced });
        return;
      }
    }
  }

  /** Camera footprint in tile space (for the minimap). */
  getViewTiles(): Vec[] {
    if (!this.ready) return [];
    const corners: [number, number][] = [
      [-1, 1],
      [1, 1],
      [1, -1],
      [-1, -1],
    ];
    return corners.map(([x, y]) => {
      const p = this.groundAt(x, y) ?? this.rig.target;
      return worldToTile(p.x, p.z);
    });
  }

  get zoom(): number {
    return 60 / this.rig.dist;
  }

  private groundAt(ndcX: number, ndcY: number): THREE.Vector3 | null {
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.rig.camera);
    const hit = this.raycaster.ray.intersectPlane(this.ground, new THREE.Vector3());
    if (!hit) return null;
    const d = hit.distanceTo(this.rig.target);
    if (d > 400) hit.sub(this.rig.target).setLength(400).add(this.rig.target);
    return hit;
  }

  // ───────────────────────── events (visual consequences) ─────────────────────────

  onEvent(e: WorldEvent): void {
    if (!this.ready) return;
    let agentId: ID | null = null;
    let projectId: ID | null = null;
    if (e.type === 'agent.task_completed') {
      agentId = e.payload.agentId;
      projectId = e.payload.projectId;
    } else if (e.type === 'file.added') {
      agentId = e.payload.file.agentId;
      projectId = e.payload.file.projectId;
    } else return;
    if (!agentId) return;
    const u = this.units.get(agentId);
    const b = (projectId && this.buildings.get(projectId)) || (u?.at ? this.buildings.get(u.at) : undefined);
    if (!u || !b) return;
    const now = performance.now();
    if (now - (this.lastParcel.get(agentId) ?? 0) < 1500) return;
    this.lastParcel.set(agentId, now);
    this.parcels.launch(u.pos.clone(), b.signWorld);
  }

  // ───────────────────────── input ─────────────────────────

  private bindInput(cv: HTMLCanvasElement): void {
    const pointers = new Map<number, { x: number; y: number }>();
    let mode: 'pan' | 'orbit' | null = null;
    let down = { x: 0, y: 0, t: 0 };
    let moved = false;
    let pinch = { d: 0, a: 0, mx: 0, my: 0 };
    let hoverRaf = 0;
    let lastMove: PointerEvent | null = null;
    // pan velocity (px/ms) for a gentle glide after release
    let vel = { x: 0, y: 0, t: 0 };

    const ndc = (x: number, y: number) => {
      const r = cv.getBoundingClientRect();
      return new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    };
    const panBy = (dx: number, dy: number) => {
      const upp = this.rig.unitsPerPixel;
      const { right, fwd } = this.rig.basis();
      const k = 1 / Math.max(0.35, Math.sin(this.rig.el));
      this.rig.pan(-right.x * dx * upp + fwd.x * dy * upp * k, -right.z * dx * upp + fwd.z * dy * upp * k);
    };

    const onDown = (e: PointerEvent) => {
      cv.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
      moved = false;
      mode = e.button === 2 || e.shiftKey || e.altKey ? 'orbit' : 'pan';
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), a: Math.atan2(b.y - a.y, b.x - a.x), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      if (!p) {
        lastMove = e;
        if (!hoverRaf) hoverRaf = requestAnimationFrame(() => {
          hoverRaf = 0;
          if (lastMove) this.hoverAt(lastMove.clientX, lastMove.clientY, ndc);
        });
        return;
      }
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) moved = true;
      if (!moved) return;
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        if (pinch.d > 0) this.rig.zoom(pinch.d / d);
        this.rig.orbit(-(ang - pinch.a), 0);
        panBy(mx - pinch.mx, my - pinch.my);
        pinch = { d, a: ang, mx, my };
        return;
      }
      if (mode === 'orbit') this.rig.orbit(-dx * 0.006, dy * 0.004);
      else {
        panBy(dx, dy);
        const now = performance.now();
        const span = Math.max(1, now - vel.t);
        const a = Math.min(1, span / 50);
        vel = { x: vel.x * (1 - a) + (dx / span) * a, y: vel.y * (1 - a) + (dy / span) * a, t: now };
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (cv.hasPointerCapture(e.pointerId)) cv.releasePointerCapture(e.pointerId);
      if (pointers.size > 0) return;
      if (!moved && e.button === 0) {
        const hit = this.pickAt(ndc(e.clientX, e.clientY));
        this.cb.onPick(hit);
      } else if (mode === 'pan' && performance.now() - vel.t < 60 && !this.reduced) {
        // glide: carry ~180 ms of the release velocity (the camera's damping eases it out)
        const speed = Math.hypot(vel.x, vel.y);
        if (speed > 0.15) panBy(vel.x * 180, vel.y * 180);
      }
      vel = { x: 0, y: 0, t: 0 };
      mode = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const factor = Math.exp(THREE.MathUtils.clamp(e.deltaY * unit, -240, 240) * (e.ctrlKey ? 0.006 : 0.0013));
      const n = ndc(e.clientX, e.clientY);
      this.raycaster.setFromCamera(n, this.rig.camera);
      const g = this.raycaster.ray.intersectPlane(this.ground, new THREE.Vector3());
      this.rig.zoom(factor, g ?? undefined);
    };
    const onDbl = (e: MouseEvent) => {
      const n = ndc(e.clientX, e.clientY);
      const hit = this.pickAt(n);
      if (hit) {
        this.focus(hit.kind === 'agent' ? { type: 'agent', id: hit.id } : hit.kind === 'citadel' ? { type: 'citadel' } : { type: 'project', id: hit.id });
        return;
      }
      this.raycaster.setFromCamera(n, this.rig.camera);
      const g = this.raycaster.ray.intersectPlane(this.ground, new THREE.Vector3());
      if (g) this.cb.onDoubleClickTerritory(territoryAtWorld(g.x, g.z));
    };
    const onLeave = () => {
      if (this.hover) this.cb.onHover(null);
      cv.style.cursor = '';
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
      const step = 90;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          panBy(step, 0);
          break;
        case 'ArrowRight':
        case 'd':
          panBy(-step, 0);
          break;
        case 'ArrowUp':
        case 'w':
          panBy(0, step);
          break;
        case 'ArrowDown':
        case 's':
          panBy(0, -step);
          break;
        case 'q':
          this.rig.orbit(0.35, 0);
          break;
        case 'e':
          this.rig.orbit(-0.35, 0);
          break;
        case '+':
        case '=':
          this.rig.zoom(0.75);
          break;
        case '-':
          this.rig.zoom(1.33);
          break;
        default:
          return;
      }
    };
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp);
    cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('pointerleave', onLeave);
    cv.addEventListener('wheel', onWheel, { passive: false });
    cv.addEventListener('dblclick', onDbl);
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', onKey);
    this.cleanup.push(() => {
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(hoverRaf);
    });
  }

  private pickAt(n: THREE.Vector2): Pick {
    this.raycaster.setFromCamera(n, this.rig.camera);
    const hits = this.raycaster.intersectObjects(this.pickables, false);
    if (!hits.length) return null;
    const agent = hits.find((h) => h.object.userData.pick?.kind === 'agent');
    const pick = (agent ?? hits[0]).object.userData.pick as Pick;
    return pick ? { ...pick } : null;
  }

  private hoverAt(x: number, y: number, ndc: (x: number, y: number) => THREE.Vector2): void {
    const p = this.pickAt(ndc(x, y));
    const same = (p?.kind ?? null) === (this.hover?.kind ?? null) && (p?.id ?? null) === (this.hover?.id ?? null);
    this.renderer.domElement.style.cursor = p ? 'pointer' : '';
    if (!same) this.cb.onHover(p);
  }

  // ───────────────────────── frame ─────────────────────────

  private frame(): void {
    if (this.destroyed || !this.state) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    this.time += dt;
    const t = this.time;
    const rig = this.rig;
    rig.update(dt);
    const dist = rig.dist;
    const lod: Lod = dist > 118 ? 'far' : dist > 46 ? 'mid' : 'near';
    this.lod = lod;
    const camDir = this.camDir.set(Math.sin(rig.az), 0, Math.cos(rig.az));
    this.frameNo++;

    for (const b of this.buildings.values()) {
      b.setLod(lod, camDir, dist);
      b.tick(t, dt, this.reduced);
      b.setBeaconScale(lod === 'far' ? Math.min(3, dist / 70) : 1);
    }
    const far = lod === 'far';
    for (const [id, u] of this.units) {
      u.tick(t, dt, this.reduced, far, dist);
      agentPositions.set(id, worldToTile(u.pos.x, u.pos.z));
    }
    this.life.tick(t, this.reduced);
    this.life.group.visible = dist < 175;
    this.parcels.tick(dt);
    if (!far) tickScreens(dt);

    // sun + shadow frustum follow the area of interest
    const half = THREE.MathUtils.clamp(dist * 0.62, 16, 110);
    const sc = this.sun.shadow.camera;
    if (sc.right !== half) {
      sc.left = -half;
      sc.right = half;
      sc.top = half;
      sc.bottom = -half;
      sc.near = 1;
      sc.far = 400;
      sc.updateProjectionMatrix();
    }
    const texel = (half * 2) / 2048;
    const tx = Math.round(rig.target.x / texel) * texel;
    const tz = Math.round(rig.target.z / texel) * texel;
    this.sun.position.set(tx - 70, 120, tz + 34);
    this.sun.target.position.set(tx, 0, tz);
    this.sun.target.updateMatrixWorld();
    const fog = this.scene.fog as THREE.Fog;
    fog.near = dist * 1.25 + 40;
    fog.far = dist * 3.4 + 160;

    this.updateLabels(dist);

    const terr: TerritoryId | null = dist > 135 ? null : territoryAtWorld(rig.target.x, rig.target.z);
    if (terr !== this.lastTerritory) {
      this.lastTerritory = terr;
      this.cb.onCameraTerritory(terr);
    }

    const key = `${tx.toFixed(2)}|${tz.toFixed(2)}|${half.toFixed(1)}`;
    if (key !== this.shadowKey || this.frameNo % 2 === 0) {
      this.shadowKey = key;
      this.renderer.shadowMap.needsUpdate = true;
    }
    this.renderer.render(this.scene, rig.camera);
    this.adaptQuality(dt);
  }

  /** Keep 60 FPS on modest machines: step quality down if frames run long (pixel ratio, then shadow resolution). */
  private adaptQuality(dt: number): void {
    if (document.hidden) return;
    this.frameAvg = this.frameAvg * 0.95 + dt * 1000 * 0.05;
    if (this.time < 3 || this.frameAvg < 22) return;
    if (this.pixelRatio > 1) {
      this.pixelRatio = Math.max(1, this.pixelRatio - 0.25);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.resize();
    } else if (this.shadowSize > 1024) {
      this.shadowSize = 1024;
      this.sun.shadow.mapSize.set(1024, 1024);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
      this.renderer.shadowMap.needsUpdate = true;
    }
    this.frameAvg = 16;
  }

  private updateLabels(dist: number): void {
    const s = this.state!;
    const cam = this.rig.camera;
    const { w, h } = this;
    // focus label: hovered thing, else selected thing
    this.overlay.safe = this.rig.insets;
    const f = this.hover ?? this.selection;
    let info: LabelInfo | null = null;
    let at: THREE.Vector3 | null = null;
    if (f?.kind === 'agent') {
      const a = s.agents[f.id];
      const u = this.units.get(f.id);
      if (a && u) {
        info = { title: a.name, line: a.currentTask?.title ?? (a.state === 'idle' ? 'Available' : a.role), status: STATE_LABEL[a.state], color: hexCss(STATE_HEX[a.state]) };
        at = u.pos.clone().setY(u.pos.y + (this.lod === 'far' ? 2.8 : 1.35));
      }
    } else if (f) {
      const b = this.buildings.get(f.id);
      if (b) {
        const p = s.projects[f.id];
        const waiting = b.waiting > 0;
        info = p
          ? { title: p.structure, line: p.name, status: waiting ? 'Needs Francisco' : p.status, color: waiting ? hexCss(STATE_HEX.waiting) : p.status === 'blocked' ? hexCss(STATE_HEX.blocked) : '#9fd3a8' }
          : { title: 'Command Citadel', line: 'Today · Inbox · Decisions', status: waiting ? 'Needs Francisco' : 'Online', color: waiting ? hexCss(STATE_HEX.waiting) : '#9fd3a8' };
        at = b.center.setY(b.height + 0.8);
      }
    }
    this.overlay.setFocus(info, at, cam, w, h);

    const tAlpha = THREE.MathUtils.clamp((dist - 118) / 40, 0, 1);
    this.overlay.setTerritories(
      TERRITORIES.map((tr) => {
        const c = territoryCenterWorld(tr.id);
        return { id: tr.id, name: tr.name, tagline: tr.tagline, at: new THREE.Vector3(c.x, 6, c.z) };
      }),
      tAlpha,
      cam,
      w,
      h,
    );
    const chips = dist > 100;
    this.overlay.setChips(
      [...this.buildings.values()]
        .filter((b) => b.id !== CITADEL_ID)
        .map((b) => {
          const p = s.projects[b.id];
          const color = b.waiting ? hexCss(STATE_HEX.waiting) : p?.status === 'blocked' ? hexCss(STATE_HEX.blocked) : p?.status === 'paused' ? '#8e9196' : b.activityTarget > 0 ? '#7cc595' : '#c8c4bb';
          const text = (p?.structure ?? '').length > 24 ? `${p!.structure.slice(0, 22)}…` : p?.structure ?? '';
          const alert = b.waiting > 0 || p?.status === 'blocked';
          return { id: b.id, text, color, at: b.center.setY(b.height + 0.4), alert, rank: (alert ? 4 : 0) + (b.activityTarget > 0 ? 2 : 0) + (p?.priority === 'critical' || p?.priority === 'high' ? 1 : 0) };
        }),
      chips,
      cam,
      w,
      h,
    );
    const near = dist < 62;
    this.overlay.setNames(
      [...this.units.values()].map((u) => ({
        id: u.agent.id,
        name: u.agent.name,
        color: hexCss(STATE_HEX[u.agent.state]),
        at: u.pos.clone().setY(u.pos.y + 1.15),
        show: near && !(f?.kind === 'agent' && f.id === u.agent.id) && u.pos.distanceTo(this.rig.target) < dist * 0.9,
      })),
      cam,
      w,
      h,
    );
  }
}

/** Shortest way around the gate ring (gates are adjacent in GATE_RING order). */
function ringPath(a: Exclude<TerritoryId, 'citadel'>, b: Exclude<TerritoryId, 'citadel'>): Exclude<TerritoryId, 'citadel'>[] {
  const n = GATE_RING.length;
  const ia = GATE_RING.indexOf(a);
  const ib = GATE_RING.indexOf(b);
  const cw = (ib - ia + n) % n;
  const ccw = (ia - ib + n) % n;
  const out: Exclude<TerritoryId, 'citadel'>[] = [];
  const dir = cw <= ccw ? 1 : -1;
  for (let i = ia; ; i = (i + dir + n) % n) {
    out.push(GATE_RING[i]);
    if (i === ib) break;
  }
  return out;
}

