// A project structure on the map. Visual state is a pure function of the
// Project (status, priority, construction) plus how many agents are present.
import { Container, Graphics, Rectangle, Text } from 'pixi.js';
import { CITADEL_TILE } from '@/data/territories';
import { CITADEL_SIZE, isoToScreen } from '@/services/geometry';
import type { Project } from '@/types/domain';
import { diamond, diamondStroke } from '../world/draw';
import { drawBuilding, type Art } from './buildingArt';

export const STATUS_COLOR = {
  blocked: 0xff5a4f,
  critical: 0xffa02e,
  completed: 0xe2bd5c,
  waiting: 0xf5d14a,
  select: 0xf2e6c8,
};

export type BuildingModel = Pick<Project, 'id' | 'name' | 'structure' | 'building' | 'territory' | 'tile' | 'size' | 'status' | 'priority' | 'underConstruction'>;

export function citadelModel(): BuildingModel {
  return {
    id: 'citadel',
    name: 'Command Citadel',
    structure: 'Command Citadel',
    building: 'citadel',
    territory: 'citadel',
    tile: CITADEL_TILE,
    size: CITADEL_SIZE,
    status: 'active',
    priority: 'normal',
  };
}

export class BuildingView extends Container {
  readonly id: string;
  private ground = new Graphics();
  private body = new Container();
  private base = new Graphics();
  private lights = new Graphics();
  private fx = new Graphics();
  private scaffold = new Graphics();
  private nameTag: Text;
  private art: Art;
  model: BuildingModel;
  agentsPresent = 0;
  waitingCount = 0;
  selected = false;
  hovered = false;
  private constructionT = 1;
  private reveal = 0;
  private phase = Math.random() * Math.PI * 2;

  constructor(model: BuildingModel) {
    super();
    this.id = model.id;
    this.model = model;
    const p = isoToScreen(model.tile[0], model.tile[1]);
    this.position.set(p.x, p.y);
    this.zIndex = p.y + (model.size * 16) / 2;
    this.sortableChildren = false;
    this.cullable = true;
    this.art = drawBuilding(model.building, model.size, model.territory, this.base, this.lights);
    this.body.addChild(this.base, this.lights, this.scaffold);
    this.addChild(this.ground, this.body, this.fx);

    this.nameTag = new Text({
      text: model.structure,
      style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 22, fontWeight: '600', fill: 0xf1ece0, letterSpacing: 0.5, dropShadow: { color: 0x000000, blur: 4, distance: 0, alpha: 0.9 } },
      resolution: 2,
    });
    this.nameTag.scale.set(0.5);
    this.nameTag.anchor.set(0.5, 1);
    this.nameTag.position.set(0, -this.art.height - 22);
    this.addChild(this.nameTag);

    const halfW = model.size * 32 + 10;
    this.hitArea = new Rectangle(-halfW, -this.art.height - 10, halfW * 2, this.art.height + model.size * 16 + 12);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    if (model.underConstruction) {
      this.constructionT = 0;
      this.reveal = 0;
    }
    this.redrawGround();
  }

  update(model: BuildingModel): void {
    const statusChanged = model.status !== this.model.status || model.priority !== this.model.priority;
    if (this.model.underConstruction && !model.underConstruction) this.constructionT = Math.max(this.constructionT, 0.999);
    this.model = model;
    if (statusChanged) this.redrawGround();
  }

  private redrawGround(): void {
    const g = this.ground;
    g.clear();
    const s = this.model.size;
    if (this.selected) {
      diamondStroke(g, 0, 0, s + 1.6, s + 1.6, STATUS_COLOR.select, 2, 0.9);
      diamond(g, 0, 0, s + 1.6, s + 1.6, STATUS_COLOR.select, 0.06);
    } else if (this.hovered) {
      diamondStroke(g, 0, 0, s + 1.4, s + 1.4, STATUS_COLOR.select, 1.5, 0.5);
    }
  }

  setSelected(sel: boolean, hov: boolean): void {
    if (sel === this.selected && hov === this.hovered) return;
    this.selected = sel;
    this.hovered = hov;
    this.redrawGround();
  }

  /** Per-frame animation. `t` = seconds, `zoom` = camera scale. */
  tick(t: number, dt: number, zoom: number, reduced: boolean): void {
    const m = this.model;
    // construction: rise from the ground with scaffolding
    if (this.constructionT < 1) {
      this.constructionT = Math.min(1, this.constructionT + dt / 3.2);
      const e = 1 - Math.pow(1 - this.constructionT, 3);
      this.body.scale.y = Math.max(0.02, e);
      this.drawScaffold(1 - e);
      if (this.constructionT >= 1) this.scaffold.clear();
    }
    this.reveal = Math.min(1, this.reveal + dt * 2);

    // lights by status
    const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2 + this.phase);
    let la = 0.9;
    switch (m.status) {
      case 'active':
        la = 0.72 + 0.28 * pulse * Math.min(1, 0.3 + this.agentsPresent * 0.35);
        break;
      case 'planning':
        la = 0.5;
        break;
      case 'paused':
        la = 0.22;
        break;
      case 'archived':
        la = 0.04;
        break;
      case 'blocked':
        la = 0.35 + 0.3 * pulse;
        break;
      case 'completed':
        la = 1;
        break;
    }
    this.lights.alpha = la;
    this.base.alpha = m.status === 'archived' ? 0.45 : 1;
    this.base.tint = m.status === 'paused' ? 0xb8b8b8 : m.status === 'archived' ? 0x8a8a8a : 0xffffff;

    // overlay fx (beacons, rings, waiting badge, activity pips)
    const g = this.fx;
    g.clear();
    const s = m.size;
    const by = this.art.beacon.y;
    if (m.priority === 'critical' && m.status !== 'completed' && m.status !== 'archived') {
      const r = s + 1.2 + (reduced ? 0 : 0.5 * pulse);
      diamondStroke(g, 0, 0, r, r, STATUS_COLOR.critical, 1.5, 0.35 + 0.35 * (1 - pulse));
    }
    if (m.status === 'blocked') {
      g.poly([0, by - 16, 10, by + 2, -10, by + 2]).fill({ color: STATUS_COLOR.blocked, alpha: 0.6 + 0.4 * pulse });
      g.rect(-1, by - 9, 2, 6).fill(0x1a0a0a);
      g.rect(-1, by - 1.5, 2, 2).fill(0x1a0a0a);
    } else if (m.status === 'completed') {
      g.poly([-9, by, -9, by - 9, -4, by - 4, 0, by - 12, 4, by - 4, 9, by - 9, 9, by]).fill(STATUS_COLOR.completed);
    }
    if (this.waitingCount > 0) {
      const y = by - (m.status === 'blocked' || m.status === 'completed' ? 24 : 4);
      g.circle(0, y, 8).fill({ color: STATUS_COLOR.waiting, alpha: 0.95 });
      g.rect(-1.2, y - 5, 2.4, 6).fill(0x1d1a10);
      g.rect(-1.2, y + 2.4, 2.4, 2.2).fill(0x1d1a10);
    }
    // activity pips: one per agent currently working here
    if (this.agentsPresent > 0 && m.status !== 'archived') {
      const n = Math.min(5, this.agentsPresent);
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * 7;
        const a = reduced ? 0.9 : 0.5 + 0.5 * Math.sin(t * 4 - i * 0.8);
        g.circle(x, -this.art.height - 8, 2.2).fill({ color: 0x8fe3b0, alpha: a });
      }
    }

    // LOD: labels only when zoomed in enough, or when focused
    const showLabel = this.selected || this.hovered || zoom > 0.85 || (m.building === 'citadel' && zoom > 0.45);
    this.nameTag.visible = showLabel;
    this.nameTag.alpha = this.selected || this.hovered ? 1 : Math.min(1, (zoom - 0.75) * 4 + (m.building === 'citadel' ? 1 : 0));
    // keep labels readable at any zoom
    const inv = 1 / Math.max(0.6, Math.min(1.6, zoom));
    this.nameTag.scale.set(0.5 * inv);
  }

  private drawScaffold(amount: number): void {
    const g = this.scaffold;
    g.clear();
    if (amount <= 0) return;
    const w = this.model.size * 26;
    const h = this.art.height * (1.05 - amount * 0.2);
    // scaffold sits outside the scaled body visually, so compensate scale
    const sy = 1 / Math.max(0.02, this.body.scale.y);
    for (const x of [-w, -w / 2, 0, w / 2, w]) g.rect(x - 0.8, -h * sy, 1.6, h * sy).fill({ color: 0xd8b25a, alpha: 0.8 });
    for (let y = 0; y < 4; y++) g.rect(-w, -((y + 1) * h * sy) / 4, w * 2, 1.4).fill({ color: 0xd8b25a, alpha: 0.7 });
  }

  get topY(): number {
    return this.y - this.art.height;
  }

  get smokePoints() {
    return this.art.smoke.map((p) => ({ x: this.x + p.x, y: this.y + p.y }));
  }
}
