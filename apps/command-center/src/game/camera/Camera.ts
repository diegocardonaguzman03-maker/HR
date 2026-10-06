// RTS camera: pan, zoom-to-cursor, pinch, smooth fly-to with easing, bounds.
import type { Container } from 'pixi.js';
import { WORLD_SIZE } from '@/data/territories';
import { isoToScreen } from '@/services/geometry';

export const MIN_ZOOM = 0.3;
export const MAX_ZOOM = 2.6;

interface Tween {
  fromX: number; fromY: number; fromZ: number;
  toX: number; toY: number; toZ: number;
  t: number; dur: number;
}

export class Camera {
  /** World-space point at the centre of the unobstructed viewport. */
  x = 0;
  y = 1024;
  zoom = 0.6;
  vw = 1;
  vh = 1;
  /** Screen-space insets covered by UI (panels), so focus targets stay visible. */
  insets = { left: 0, right: 0, top: 0, bottom: 0 };
  private tween: Tween | null = null;
  private vx = 0;
  private vy = 0;
  dirty = true;

  constructor(private world: Container) {}

  resize(w: number, h: number): void {
    this.vw = w;
    this.vh = h;
    this.dirty = true;
  }

  /** Screen point of the camera centre (centre of the unobstructed area). */
  private anchor(): { x: number; y: number } {
    const { left, right, top, bottom } = this.insets;
    return { x: left + (this.vw - left - right) / 2, y: top + (this.vh - top - bottom) / 2 };
  }

  apply(): void {
    const a = this.anchor();
    this.world.scale.set(this.zoom);
    this.world.position.set(a.x - this.x * this.zoom, a.y - this.y * this.zoom);
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: (sx - this.world.position.x) / this.zoom, y: (sy - this.world.position.y) / this.zoom };
  }

  panBy(dx: number, dy: number): void {
    this.tween = null;
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
    this.clamp();
    this.dirty = true;
  }

  fling(vx: number, vy: number): void {
    this.vx = vx;
    this.vy = vy;
  }

  zoomAt(sx: number, sy: number, factor: number): void {
    this.tween = null;
    const before = this.screenToWorld(sx, sy);
    this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom * factor));
    this.apply();
    const after = this.screenToWorld(sx, sy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
    this.clamp();
    this.dirty = true;
  }

  flyTo(x: number, y: number, zoom: number, duration = 0.7): void {
    this.vx = this.vy = 0;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    if (duration <= 0) {
      this.x = x;
      this.y = y;
      this.zoom = zoom;
      this.clamp();
      this.dirty = true;
      return;
    }
    this.tween = { fromX: this.x, fromY: this.y, fromZ: this.zoom, toX: x, toY: y, toZ: zoom, t: 0, dur: duration };
  }

  /** Gently keep a moving target in view (used while an agent is selected). */
  follow(x: number, y: number, dt: number): void {
    if (this.tween) return;
    const k = 1 - Math.exp(-dt * 2.5);
    this.x += (x - this.x) * k;
    this.y += (y - this.y) * k;
    this.dirty = true;
  }

  get busy(): boolean {
    return !!this.tween;
  }

  update(dt: number): void {
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + dt / tw.dur);
      const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
      // zoom interpolated geometrically so it feels uniform
      this.zoom = tw.fromZ * Math.pow(tw.toZ / tw.fromZ, e);
      this.x = tw.fromX + (tw.toX - tw.fromX) * e;
      this.y = tw.fromY + (tw.toY - tw.fromY) * e;
      if (tw.t >= 1) this.tween = null;
      this.dirty = true;
    } else if (Math.abs(this.vx) + Math.abs(this.vy) > 0.5) {
      this.x -= (this.vx * dt) / this.zoom;
      this.y -= (this.vy * dt) / this.zoom;
      const f = Math.exp(-dt * 6);
      this.vx *= f;
      this.vy *= f;
      this.clamp();
      this.dirty = true;
    }
  }

  clamp(): void {
    const left = isoToScreen(0, WORLD_SIZE).x;
    const right = isoToScreen(WORLD_SIZE, 0).x;
    const bottom = isoToScreen(WORLD_SIZE, WORLD_SIZE).y;
    this.x = Math.max(left, Math.min(right, this.x));
    this.y = Math.max(-100, Math.min(bottom + 60, this.y));
  }

  /** Zoom that fits the whole world in the unobstructed viewport. */
  fitZoom(): number {
    const w = this.vw - this.insets.left - this.insets.right;
    const h = this.vh - this.insets.top - this.insets.bottom;
    const worldW = isoToScreen(WORLD_SIZE, 0).x * 2;
    const worldH = isoToScreen(WORLD_SIZE, WORLD_SIZE).y + 120;
    return Math.max(MIN_ZOOM, Math.min(1, Math.min(w / worldW, h / worldH) * 0.98));
  }

  /** Visible rectangle in world (container) coordinates. */
  viewRect(): { x: number; y: number; w: number; h: number } {
    const tl = this.screenToWorld(0, 0);
    const br = this.screenToWorld(this.vw, this.vh);
    return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };
  }
}
