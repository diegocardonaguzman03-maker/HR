// A visible AI agent: small RTS-style unit that walks the roads, shows its
// state through a ground ring + icon, and can be clicked/tapped.
import { Circle, Container, Graphics, Text } from 'pixi.js';
import { territoryAt } from '@/data/territories';
import { dist, isoToScreen, routeBetween, type Vec } from '@/services/geometry';
import type { Agent, AgentLook, AgentState } from '@/types/domain';
import { shade } from '../world/draw';
import { STATE_COLORS, type UnitTarget } from './behavior';

const WALK_SPEED = 2.4; // tiles / second
const PATROL_SPEED = 0.7;
/** Units stay small (strategy-game scale) but must remain readable when zoomed out. */
export const UNIT_SCALE = 1.45;

export class AgentUnit extends Container {
  readonly id: string;
  pos: Vec;
  private route: Vec[] = [];
  private speed = WALK_SPEED;
  private target: UnitTarget | null = null;
  private patrolTimer = 2 + Math.random() * 3;
  private walking = false;
  private facing = 1;
  private phase = Math.random() * 10;
  private completedFlash = 0;

  private ring = new Graphics();
  private figure = new Container();
  private body = new Graphics();
  private accessory = new Graphics();
  private icon = new Graphics();
  private nameTag: Text;
  private color: number;
  private look: AgentLook;
  state: AgentState;
  selected = false;
  hovered = false;
  simulated = true;

  constructor(agent: Agent) {
    super();
    this.id = agent.id;
    this.pos = [...agent.position] as Vec;
    this.color = agent.color;
    this.look = agent.look;
    this.state = agent.state;
    this.figure.addChild(this.body, this.accessory);
    this.addChild(this.ring, this.figure, this.icon);
    this.drawBody();
    this.nameTag = new Text({
      text: agent.name,
      style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 20, fontWeight: '700', fill: 0xffffff, letterSpacing: 1, dropShadow: { color: 0x000000, blur: 3, distance: 0, alpha: 1 } },
      resolution: 2,
    });
    this.nameTag.anchor.set(0.5, 0);
    this.nameTag.scale.set(0.5);
    this.nameTag.position.set(0, 6);
    this.addChild(this.nameTag);
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.hitArea = new Circle(0, -10, 16);
    this.scale.set(UNIT_SCALE);
    this.syncScreen();
  }

  /** Apply new domain state; re-route when the destination changes. */
  apply(agent: Agent, target: UnitTarget | undefined): void {
    if (agent.state === 'completed' && this.state !== 'completed') this.completedFlash = 2.4;
    this.state = agent.state;
    this.simulated = agent.activitySource !== 'real';
    if (agent.color !== this.color) {
      this.color = agent.color;
      this.drawBody();
    }
    if (!target) return;
    if (target.mode === 'hold' || !target.pos) {
      // stop where we are (blocked, paused, completing)
      if (this.state === 'blocked' || this.state === 'paused') this.route = [];
      this.target = target;
      return;
    }
    const prev = this.target?.pos;
    const changed = !prev || dist(prev, target.pos) > 0.2 || this.target?.structureId !== target.structureId;
    this.target = target;
    if (changed) {
      const from = territoryAt(this.pos[0], this.pos[1]);
      this.route = routeBetween(this.pos, from, target.pos, target.territory ?? territoryAt(target.pos[0], target.pos[1]));
      this.speed = WALK_SPEED;
    }
  }

  /** Teleport (used on first placement). */
  place(p: Vec): void {
    this.pos = [...p] as Vec;
    this.route = [];
    this.syncScreen();
  }

  get isMoving(): boolean {
    return this.route.length > 0;
  }

  tick(t: number, dt: number, zoom: number, reduced: boolean): void {
    // movement
    if (this.route.length && this.state !== 'paused' && this.state !== 'blocked') {
      const next = this.route[0];
      const dx = next[0] - this.pos[0], dy = next[1] - this.pos[1];
      const d = Math.hypot(dx, dy);
      const step = this.speed * dt;
      if (d <= step) {
        this.pos = [next[0], next[1]];
        this.route.shift();
      } else {
        this.pos = [this.pos[0] + (dx / d) * step, this.pos[1] + (dy / d) * step];
      }
      const sdx = dx - dy; // screen-space x direction
      if (Math.abs(sdx) > 0.01) this.facing = sdx > 0 ? 1 : -1;
      this.walking = true;
    } else {
      this.walking = false;
      // working agents move around their building (ambient "busy" behaviour)
      if (this.target?.mode === 'patrol' && this.target.pos && this.state === 'working') {
        this.patrolTimer -= dt;
        if (this.patrolTimer <= 0) {
          this.patrolTimer = 3 + Math.random() * 4;
          const [x, y] = this.target.pos;
          this.route = [[x + (Math.random() - 0.5) * 1.6, y + (Math.random() - 0.5) * 1.6]];
          this.speed = PATROL_SPEED;
        }
      }
    }
    this.syncScreen();

    // figure animation
    const bob = this.walking && !reduced ? Math.abs(Math.sin(t * 10 + this.phase)) * 2 : 0;
    this.figure.y = -bob;
    this.figure.scale.x = this.facing;
    this.accessory.y = this.look === 'cube' && !reduced ? Math.sin(t * 3 + this.phase) * 1.5 : 0;

    // state ring + selection
    const g = this.ring;
    g.clear();
    const sc = STATE_COLORS[this.state];
    g.ellipse(0, 0, 9, 4.5).fill({ color: 0x000000, alpha: 0.35 });
    const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 3 + this.phase);
    g.ellipse(0, 0, 10, 5).stroke({ color: sc, width: 2, alpha: 0.85 });
    if (this.selected) {
      g.ellipse(0, 0, 15 + pulse * 2, 7.5 + pulse).stroke({ color: 0xf2e6c8, width: 2, alpha: 0.95 });
    } else if (this.hovered) {
      g.ellipse(0, 0, 14, 7).stroke({ color: 0xf2e6c8, width: 1.5, alpha: 0.6 });
    }
    if (this.state === 'researching' && !reduced) {
      const r = 10 + ((t * 12 + this.phase * 5) % 14);
      g.ellipse(0, 0, r, r / 2).stroke({ color: sc, width: 1, alpha: Math.max(0, 1 - (r - 10) / 14) * 0.8 });
    }
    if (this.state === 'collaborating') {
      g.ellipse(0, 0, 13, 6.5).stroke({ color: sc, width: 1, alpha: 0.5 + 0.3 * pulse });
    }

    this.drawIcon(t, reduced);
    if (this.completedFlash > 0) this.completedFlash -= dt;

    this.nameTag.visible = this.selected || this.hovered || zoom > 1.05;
    const inv = 1 / Math.max(0.7, Math.min(1.8, zoom));
    this.nameTag.scale.set((0.5 * inv) / UNIT_SCALE);
    this.alpha = this.state === 'paused' ? 0.7 : 1;
  }

  private drawIcon(t: number, reduced: boolean): void {
    const g = this.icon;
    g.clear();
    const y = -34 + (reduced ? 0 : Math.sin(t * 2.4 + this.phase) * 1.2);
    if (this.state === 'waiting') {
      g.circle(0, y, 6.5).fill(0xfacc15);
      g.rect(-1, y - 4, 2, 5).fill(0x1d1a10);
      g.rect(-1, y + 2, 2, 1.8).fill(0x1d1a10);
    } else if (this.state === 'blocked') {
      g.poly([0, y - 7, 7, y + 5, -7, y + 5]).fill(0xef4444);
      g.rect(-0.9, y - 3, 1.8, 4.5).fill(0x210808);
      g.rect(-0.9, y + 2.4, 1.8, 1.6).fill(0x210808);
    } else if (this.state === 'completed' || this.completedFlash > 0) {
      const a = Math.min(1, this.completedFlash > 0 ? this.completedFlash : 1);
      g.circle(0, y, 6.5).fill({ color: 0x22c55e, alpha: a });
      g.moveTo(-3, y).lineTo(-0.8, y + 2.4).lineTo(3.4, y - 2.6).stroke({ color: 0xffffff, width: 1.6, alpha: a });
    } else if (this.state === 'paused') {
      g.roundRect(-5.5, y - 5, 11, 10, 2).fill({ color: 0x9ca3af, alpha: 0.95 });
      g.rect(-2.6, y - 3, 1.8, 6).fill(0x1f2937);
      g.rect(0.8, y - 3, 1.8, 6).fill(0x1f2937);
    }
  }

  private drawBody(): void {
    const b = this.body;
    const c = this.color;
    b.clear();
    // legs
    b.roundRect(-3.4, -7, 2.6, 7, 1).fill(shade(c, 0.35));
    b.roundRect(0.8, -7, 2.6, 7, 1).fill(shade(c, 0.3));
    // torso
    b.roundRect(-5, -18, 10, 12, 3).fill(c);
    b.roundRect(0.5, -18, 4.5, 12, 2).fill({ color: shade(c, 0.78), alpha: 0.9 });
    // head
    b.circle(0, -22, 4.2).fill(mixLight(c));
    b.circle(1.2, -22.5, 1.1).fill({ color: 0x1b1d22, alpha: 0.8 });
    const a = this.accessory;
    a.clear();
    switch (this.look) {
      case 'halo':
        a.ellipse(0, -28.5, 5.5, 1.8).stroke({ color: 0xe2bd5c, width: 1.6 });
        break;
      case 'cape':
        b.poly([-5, -17, -8, -6, -2, -8]).fill(shade(c, 0.6));
        b.roundRect(-6, -18.5, 12, 3, 1.5).fill(shade(c, 1.2));
        break;
      case 'hardhat':
        a.moveTo(-5, -23).arc(0, -23, 5, Math.PI, 0).closePath().fill(0xf6a31d);
        a.rect(-6, -23.4, 12, 1.4).fill(0xd4870f);
        break;
      case 'visor':
        a.rect(-3, -23.4, 7.6, 2).fill(0x0d2b2b);
        a.rect(-0.5, -31, 1, 5).fill(0x9aa3b2);
        a.circle(0, -31.5, 1.3).fill(0x3cc8c0);
        break;
      case 'tie':
        b.poly([-0.8, -17.5, 0.8, -17.5, 1.2, -10, 0, -8.5, -1.2, -10]).fill(0x2a1a22);
        break;
      case 'cube':
        a.rect(6, -30, 5, 5).fill(0xc7ceff);
        a.rect(8.5, -30, 2.5, 5).fill(0x8f98e0);
        break;
      case 'leaf':
        a.ellipse(4, -27, 3.4, 1.6).fill(0x9fe08f);
        a.ellipse(-3.5, -14, 2.2, 1.2).fill(0x9fe08f);
        break;
      case 'coin':
        b.circle(-1.5, -13, 2.2).fill(0xfff1b8);
        a.rect(-4, -27, 8, 1.6).fill(0x8a6d1d);
        a.rect(-2.6, -30, 5.2, 3).fill(0x8a6d1d);
        break;
      default:
        break;
    }
  }

  private syncScreen(): void {
    const p = isoToScreen(this.pos[0], this.pos[1]);
    this.position.set(p.x, p.y);
    this.zIndex = p.y + 1;
  }
}

function mixLight(c: number): number {
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  const f = (v: number) => Math.round(v + (245 - v) * 0.6);
  return (f(r) << 16) | (f(g) << 8) | f(b);
}
