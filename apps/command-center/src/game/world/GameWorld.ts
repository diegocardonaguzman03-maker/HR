// GameWorld — the PixiJS scene. It knows nothing about React or providers:
// it receives WorldState snapshots + selection, renders them, and reports
// user picks through callbacks. (Game layer ⟂ application layer.)
import 'pixi.js/unsafe-eval'; // no eval(): required under the artifact CSP
import { Application, Container, Graphics, Sprite, Text, type Texture } from 'pixi.js';
import { CITADEL_TILE, TERRITORIES, territoryAt } from '@/data/territories';
import { isoToScreen, screenToIso, type Vec } from '@/services/geometry';
import type { WorldState } from '@/services/worldState';
import type { ID, TerritoryId } from '@/types/domain';
import { AgentUnit } from '../agents/AgentUnit';
import { computeTargets, presenceByStructure, waitingByStructure } from '../agents/behavior';
import { BuildingView, citadelModel, type BuildingModel } from '../buildings/BuildingView';
import { Camera } from '../camera/Camera';
import { buildDecor, buildGround, DecorAtlas } from './terrain';

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

export class GameWorld {
  private app = new Application();
  private root = new Container();
  private groundLayer = new Container();
  private objects = new Container();
  private overlay = new Container();
  private fogLayer = new Container();
  private atlas!: DecorAtlas;
  private camera = new Camera(this.root);
  private buildings = new Map<ID, BuildingView>();
  private units = new Map<ID, AgentUnit>();
  private decor: Sprite[] = [];
  private fog: Sprite[] = [];
  private smoke: { s: Sprite; life: number; vx: number }[] = [];
  private smokeTex: Texture | null = null;
  private stacks: { x: number; y: number }[] = [];
  private links = new Graphics();
  private territoryLabels: Text[] = [];
  private state: WorldState | null = null;
  private selection: Pick = null;
  private hover: Pick = null;
  private followId: ID | null = null;
  private time = 0;
  private reduced = false;
  private destroyed = false;
  private ready = false;
  private roadsKey = '';
  private el: HTMLElement | null = null;
  private cleanup: (() => void)[] = [];
  private lastTerritory: TerritoryId | null | undefined = undefined;

  constructor(private cb: GameCallbacks) {}

  async init(el: HTMLElement): Promise<void> {
    this.el = el;
    await this.app.init({
      resizeTo: el,
      background: 0x0e0f12,
      antialias: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true,
      preference: 'webgl',
    });
    if (this.destroyed) {
      this.app.destroy(true);
      return;
    }
    el.appendChild(this.app.canvas);
    this.app.canvas.style.touchAction = 'none';
    this.app.stage.eventMode = 'none';
    this.objects.sortableChildren = true;
    this.root.addChild(this.groundLayer, this.links, this.objects, this.overlay, this.fogLayer);
    this.app.stage.addChild(this.root);
    this.atlas = new DecorAtlas(this.app.renderer);
    for (const t of TERRITORIES) {
      const label = new Text({
        text: t.name.toUpperCase(),
        style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 64, fontWeight: '700', fill: 0xf1ece0, letterSpacing: 14, dropShadow: { color: 0x000000, blur: 8, distance: 0, alpha: 0.9 } },
        resolution: 1,
      });
      label.anchor.set(0.5);
      const p = isoToScreen(t.center[0], t.center[1]);
      label.position.set(p.x, p.y);
      label.alpha = 0;
      this.overlay.addChild(label);
      this.territoryLabels.push(label);
    }
    const sg = new Graphics().circle(0, 0, 8).fill({ color: 0xbfbfbf, alpha: 0.5 });
    this.smokeTex = this.app.renderer.generateTexture({ target: sg, resolution: 1 });
    sg.destroy();

    this.camera.resize(el.clientWidth, el.clientHeight);
    const c = isoToScreen(CITADEL_TILE[0], CITADEL_TILE[1]);
    this.camera.flyTo(c.x, c.y - 40, this.camera.fitZoom() * 1.15, 0);
    this.bindInput(this.app.canvas);
    this.app.ticker.add((tk) => this.frame(Math.min(0.05, tk.deltaMS / 1000)));
    const ro = new ResizeObserver(() => {
      this.camera.resize(el.clientWidth, el.clientHeight);
    });
    ro.observe(el);
    this.cleanup.push(() => ro.disconnect());
    this.ready = true;
    if (this.state) this.setWorld(this.state, true);
  }

  destroy(): void {
    this.destroyed = true;
    for (const fn of this.cleanup) fn();
    agentPositions.clear();
    if (this.ready) {
      this.atlas.destroy();
      this.app.destroy(true, { children: true });
    }
  }

  setReducedMotion(v: boolean): void {
    this.reduced = v;
  }

  setInsets(insets: Partial<Camera['insets']>): void {
    this.camera.insets = { ...this.camera.insets, ...insets };
    this.camera.dirty = true;
  }

  // ───────────────────────── state sync ─────────────────────────

  setWorld(s: WorldState, force = false): void {
    const prev = this.state;
    this.state = s;
    if (!this.ready) return;

    const projects = Object.values(s.projects);
    // Rebuild roads/ground only when the set of structures changes.
    const key = projects.filter((p) => p.status !== 'archived').map((p) => p.id).sort().join('|');
    if (force || key !== this.roadsKey) {
      const first = this.roadsKey === '';
      this.roadsKey = key;
      this.groundLayer.removeChildren().forEach((c) => c.destroy());
      this.groundLayer.addChild(buildGround(projects));
      if (first) this.buildDecorLayer();
    }

    // Buildings
    const models: BuildingModel[] = [citadelModel(), ...projects];
    for (const m of models) {
      let b = this.buildings.get(m.id);
      if (!b) {
        b = new BuildingView(m);
        this.buildings.set(m.id, b);
        this.objects.addChild(b);
        if (m.territory === 'frontier') this.revealFog(m.tile);
      } else b.update(m);
    }
    const presence = presenceByStructure(s);
    const waiting = waitingByStructure(s);
    for (const [id, b] of this.buildings) {
      if (id !== 'citadel' && !s.projects[id]) {
        b.destroy({ children: true });
        this.buildings.delete(id);
        continue;
      }
      b.agentsPresent = presence.get(id) ?? 0;
      b.waitingCount = waiting.get(id) ?? 0;
    }

    // Agents
    if (!prev || prev.agents !== s.agents || force) {
      const targets = computeTargets(s);
      for (const a of Object.values(s.agents)) {
        let u = this.units.get(a.id);
        if (!u) {
          u = new AgentUnit(a);
          this.units.set(a.id, u);
          this.objects.addChild(u);
        }
        u.apply(a, targets.get(a.id));
      }
      for (const [id, u] of this.units) {
        if (!s.agents[id]) {
          u.destroy({ children: true });
          this.units.delete(id);
          agentPositions.delete(id);
        }
      }
    }
    this.applySelectionVisuals();
    this.camera.dirty = true;
  }

  setSelection(sel: Pick, hover: Pick): void {
    if (sel?.kind !== 'agent' || sel.id !== this.selection?.id) this.followId = null;
    this.selection = sel;
    this.hover = hover;
    this.applySelectionVisuals();
  }

  private applySelectionVisuals(): void {
    for (const [id, b] of this.buildings) {
      const isSel = (this.selection?.kind === 'project' || this.selection?.kind === 'citadel') && this.selection.id === id;
      const isHov = (this.hover?.kind === 'project' || this.hover?.kind === 'citadel') && this.hover.id === id;
      b.setSelected(isSel, isHov);
    }
    for (const [id, u] of this.units) {
      u.selected = this.selection?.kind === 'agent' && this.selection.id === id;
      u.hovered = this.hover?.kind === 'agent' && this.hover.id === id;
    }
  }

  private buildDecorLayer(): void {
    if (!this.state) return;
    const { objects, fog, stacks } = buildDecor(this.atlas, Object.values(this.state.projects));
    this.decor = objects;
    for (const d of objects) this.objects.addChild(d);
    this.fog = fog;
    for (const f of fog) this.fogLayer.addChild(f);
    this.stacks = stacks.map(([x, y]) => {
      const p = isoToScreen(x, y);
      return { x: p.x, y: p.y - 64 };
    });
  }

  private revealFog(tile: [number, number]): void {
    const c = isoToScreen(tile[0], tile[1]);
    for (const f of this.fog) {
      if (Math.hypot(f.x - c.x, (f.y - c.y) * 2) < 260) (f as Sprite & { fadeOut?: boolean }).fadeOut = true;
    }
  }

  // ───────────────────────── camera ─────────────────────────

  focus(t: FocusTarget): void {
    if (!this.ready) return;
    const cam = this.camera;
    const z = cam.zoom;
    switch (t.type) {
      case 'agent': {
        const u = this.units.get(t.id);
        if (!u) return;
        cam.flyTo(u.x, u.y - 20, Math.max(z, 1.45), 0.65);
        this.followId = t.id;
        return;
      }
      case 'project':
      case 'citadel': {
        const id = t.type === 'citadel' ? 'citadel' : t.id;
        const b = this.buildings.get(id);
        if (!b) return;
        cam.flyTo(b.x, b.y - 40, Math.max(Math.min(z, 1.6), id === 'citadel' ? 1.1 : 1.35), 0.7);
        return;
      }
      case 'territory': {
        const terr = TERRITORIES.find((x) => x.id === t.id);
        const center = terr ? terr.center : CITADEL_TILE;
        const p = isoToScreen(center[0], center[1]);
        cam.flyTo(p.x, p.y, t.id === 'citadel' ? 1.2 : 0.78, 0.8);
        return;
      }
      case 'world': {
        const p = isoToScreen(32, 32);
        cam.flyTo(p.x, p.y - 20, cam.fitZoom(), 0.8);
        return;
      }
      case 'tile': {
        const p = isoToScreen(t.x, t.y);
        cam.flyTo(p.x, p.y, t.zoom ?? cam.zoom, 0.5);
        return;
      }
    }
  }

  /** Camera footprint in tile space (for the minimap). */
  getViewTiles(): Vec[] {
    const r = this.camera.viewRect();
    return [
      screenToIso(r.x, r.y),
      screenToIso(r.x + r.w, r.y),
      screenToIso(r.x + r.w, r.y + r.h),
      screenToIso(r.x, r.y + r.h),
    ];
  }

  get zoom(): number {
    return this.camera.zoom;
  }

  // ───────────────────────── input ─────────────────────────

  private bindInput(canvas: HTMLCanvasElement): void {
    const pointers = new Map<number, { x: number; y: number }>();
    let downAt: { x: number; y: number; t: number } | null = null;
    let dragged = false;
    let lastMove = { x: 0, y: 0, t: 0 };
    let vel = { x: 0, y: 0 };
    let pinchDist = 0;

    const local = (e: PointerEvent | MouseEvent | WheelEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const p = local(e);
      pointers.set(e.pointerId, p);
      if (pointers.size === 1) {
        downAt = { ...p, t: performance.now() };
        dragged = false;
        lastMove = { ...p, t: performance.now() };
        vel = { x: 0, y: 0 };
        this.camera.fling(0, 0);
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        dragged = true;
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (!pointers.has(e.pointerId)) {
        if (e.pointerType === 'mouse') this.updateHover(p.x, p.y);
        return;
      }
      const prev = pointers.get(e.pointerId)!;
      pointers.set(e.pointerId, p);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0) this.camera.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinchDist);
        pinchDist = d;
        this.camera.panBy((p.x - prev.x) / 2, (p.y - prev.y) / 2);
        this.followId = null;
        return;
      }
      if (downAt && !dragged && Math.hypot(p.x - downAt.x, p.y - downAt.y) > 6) dragged = true;
      if (dragged) {
        this.camera.panBy(p.x - prev.x, p.y - prev.y);
        this.followId = null;
        const now = performance.now();
        const dt = Math.max(1, now - lastMove.t) / 1000;
        vel = { x: (p.x - lastMove.x) / dt, y: (p.y - lastMove.y) / dt };
        lastMove = { ...p, t: now };
        canvas.style.cursor = 'grabbing';
      }
    };
    const onUp = (e: PointerEvent) => {
      const p = local(e);
      pointers.delete(e.pointerId);
      canvas.style.cursor = '';
      if (pointers.size === 0 && downAt) {
        if (!dragged) this.cb.onPick(this.pick(p.x, p.y, e.pointerType !== 'mouse'));
        else if (performance.now() - lastMove.t < 80) this.camera.fling(vel.x * 0.9, vel.y * 0.9);
        downAt = null;
      }
      if (pointers.size < 2) pinchDist = 0;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = local(e);
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016));
      this.camera.zoomAt(p.x, p.y, factor);
    };
    const onDbl = (e: MouseEvent) => {
      const p = local(e);
      if (this.pick(p.x, p.y, false)) return;
      const w = this.camera.screenToWorld(p.x, p.y);
      const [tx, ty] = screenToIso(w.x, w.y);
      if (tx < 0 || ty < 0 || tx > 64 || ty > 64) return;
      this.cb.onDoubleClickTerritory(territoryAt(tx, ty));
    };
    const onLeave = () => this.cb.onHover(null);

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onDbl);
    canvas.addEventListener('pointerleave', onLeave);
    this.cleanup.push(() => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDbl);
      canvas.removeEventListener('pointerleave', onLeave);
    });
  }

  private lastHoverAt = 0;
  private updateHover(sx: number, sy: number): void {
    const now = performance.now();
    if (now - this.lastHoverAt < 40) return;
    this.lastHoverAt = now;
    const p = this.pick(sx, sy, false);
    this.el!.style.cursor = p ? 'pointer' : '';
    this.cb.onHover(p);
  }

  /** Manual picking: agents first (small, on top), then structures (front-most first). */
  private pick(sx: number, sy: number, touch: boolean): Pick {
    const w = this.camera.screenToWorld(sx, sy);
    const zoom = this.camera.zoom;
    const radius = (touch ? 22 : 14) / Math.max(0.6, zoom) + 4;
    let best: { id: ID; d: number } | null = null;
    for (const u of this.units.values()) {
      const d = Math.hypot(w.x - u.x, (w.y - (u.y - 18)) * 0.9);
      if (d < radius && (!best || d < best.d)) best = { id: u.id, d };
    }
    if (best) return { kind: 'agent', id: best.id };
    const sorted = [...this.buildings.values()].sort((a, b) => b.zIndex - a.zIndex);
    for (const b of sorted) {
      const ha = b.hitArea as { contains(x: number, y: number): boolean } | null;
      if (ha?.contains(w.x - b.x, w.y - b.y)) return b.id === 'citadel' ? { kind: 'citadel', id: 'citadel' } : { kind: 'project', id: b.id };
    }
    return null;
  }

  // ───────────────────────── frame loop ─────────────────────────

  private frame(dt: number): void {
    this.time += dt;
    const cam = this.camera;
    if (this.followId) {
      const u = this.units.get(this.followId);
      if (u?.isMoving) cam.follow(u.x, u.y - 20, dt);
    }
    cam.update(dt);
    const moved = cam.dirty;
    if (cam.dirty) {
      cam.apply();
      cam.dirty = false;
    }
    const zoom = cam.zoom;
    for (const b of this.buildings.values()) b.tick(this.time, dt, zoom, this.reduced);
    for (const u of this.units.values()) {
      u.tick(this.time, dt, zoom, this.reduced);
      agentPositions.set(u.id, u.pos);
    }
    this.drawSquadLinks();
    this.updateSmoke(dt);
    for (const f of this.fog as (Sprite & { fadeOut?: boolean })[]) {
      if (f.fadeOut && f.alpha > 0) f.alpha = Math.max(0, f.alpha - dt * 0.6);
      else if (!this.reduced) f.x += Math.sin(this.time * 0.1 + f.y) * 0.05;
    }
    if (moved) this.cull();
    // Territory names read like map labels when zoomed out, then fade away.
    const la = Math.max(0, Math.min(1, (0.75 - zoom) / 0.25));
    for (const l of this.territoryLabels) {
      l.alpha += (la * 0.55 - l.alpha) * Math.min(1, dt * 6);
      l.visible = l.alpha > 0.01;
    }
  }

  /** Viewport culling: hide decor and structures outside the view. */
  private cull(): void {
    const r = this.camera.viewRect();
    const m = 180;
    const x0 = r.x - m, x1 = r.x + r.w + m, y0 = r.y - m, y1 = r.y + r.h + m * 1.5;
    for (const d of this.decor) d.visible = d.x > x0 && d.x < x1 && d.y > y0 && d.y < y1;
    for (const b of this.buildings.values()) b.visible = b.x > x0 - 100 && b.x < x1 + 100 && b.y > y0 && b.y < y1 + 200;
    // LOD: hide small decor (bushes/rocks) when far away
    const far = this.camera.zoom < 0.45;
    for (const d of this.decor) if (far && d.scale.x < 0.8) d.visible = false;
    // report the territory under the camera
    const centre = this.camera.screenToWorld(this.camera.vw / 2, this.camera.vh / 2);
    const [tx, ty] = screenToIso(centre.x, centre.y);
    const t: TerritoryId | null = this.camera.zoom < 0.55 ? null : territoryAt(tx, ty);
    if (t !== this.lastTerritory) {
      this.lastTerritory = t;
      this.cb.onCameraTerritory(t);
    }
  }

  private drawSquadLinks(): void {
    const g = this.links;
    g.clear();
    if (!this.state) return;
    for (const q of Object.values(this.state.squads)) {
      if (!q.active) continue;
      const us = q.agentIds.map((id) => this.units.get(id)).filter((u): u is AgentUnit => !!u && !u.isMoving);
      for (let i = 1; i < us.length; i++) {
        g.moveTo(us[0].x, us[0].y).lineTo(us[i].x, us[i].y).stroke({ color: 0xa78bfa, width: 1.5, alpha: 0.45 + 0.25 * Math.sin(this.time * 3) });
      }
    }
  }

  private updateSmoke(dt: number): void {
    if (!this.smokeTex) return;
    if (this.reduced) {
      for (const p of this.smoke) p.s.destroy();
      this.smoke = [];
      return;
    }
    const emitters = [...this.stacks, ...[...this.buildings.values()].filter((b) => b.model.status === 'active').flatMap((b) => b.smokePoints)];
    if (emitters.length && this.smoke.length < 36 && Math.random() < dt * 10) {
      const e = emitters[Math.floor(Math.random() * emitters.length)];
      const s = new Sprite(this.smokeTex);
      s.anchor.set(0.5);
      s.position.set(e.x + (Math.random() - 0.5) * 4, e.y);
      s.alpha = 0.35;
      s.scale.set(0.5);
      this.overlay.addChild(s);
      this.smoke.push({ s, life: 0, vx: 4 + Math.random() * 6 });
    }
    this.smoke = this.smoke.filter((p) => {
      p.life += dt;
      p.s.y -= dt * 14;
      p.s.x += dt * p.vx;
      p.s.scale.set(0.5 + p.life * 0.45);
      p.s.alpha = Math.max(0, 0.35 * (1 - p.life / 4));
      if (p.life > 4) {
        p.s.destroy();
        return false;
      }
      return true;
    });
  }
}
