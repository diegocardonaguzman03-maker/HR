// Minimal HTML labels over the 3D scene.
// · one floating label for the hovered / selected thing
// · territory names when zoomed out
// · compact project-state chips when zoomed out
// · small agent name tags only when close enough to be useful
import * as THREE from 'three';

const FONT = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

export interface LabelInfo {
  title: string;
  line: string;
  status: string;
  color: string;
}

export interface Safe {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type Rect = { x0: number; y0: number; x1: number; y1: number };
const hits = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

interface Tag {
  el: HTMLDivElement;
  visible: boolean;
  x: number;
  y: number;
}

const v = new THREE.Vector3();

export class Overlay {
  readonly root = document.createElement('div');
  private focus: Tag;
  private territory = new Map<string, Tag>();
  private chips = new Map<string, Tag>();
  private names = new Map<string, Tag>();
  /** Screen areas taken by territory names this frame (chips avoid them). */
  private taken: Rect[] = [];
  safe: Safe = { top: 56, right: 0, bottom: 90, left: 64 };

  constructor(parent: HTMLElement) {
    Object.assign(this.root.style, { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'hidden', fontFamily: FONT });
    parent.appendChild(this.root);
    this.focus = this.tag(
      'padding:7px 10px 7px 10px;border-radius:9px;background:rgba(22,24,27,0.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.09);box-shadow:0 6px 24px rgba(0,0,0,0.25);color:#f1ede4;min-width:120px;max-width:240px',
    );
    this.focus.el.style.transition = 'opacity 180ms ease';
  }

  private tag(css: string): Tag {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;left:0;top:0;opacity:0;will-change:transform,opacity;${css}`;
    this.root.appendChild(el);
    return { el, visible: false, x: 0, y: 0 };
  }

  private place(t: Tag, x: number, y: number, show: boolean, ax = 0.5, ay = 1): void {
    if (show !== t.visible) {
      t.visible = show;
      t.el.style.opacity = show ? '1' : '0';
    }
    if (!show) return;
    if (Math.abs(x - t.x) < 0.3 && Math.abs(y - t.y) < 0.3) return;
    t.x = x;
    t.y = y;
    t.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(${-ax * 100}%,${-ay * 100}%)`;
  }

  private project(p: THREE.Vector3, cam: THREE.Camera, w: number, h: number): { x: number; y: number; ok: boolean } {
    v.copy(p).project(cam);
    return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, ok: v.z < 1 && v.z > -1 };
  }

  setFocus(info: LabelInfo | null, at: THREE.Vector3 | null, cam: THREE.Camera, w: number, h: number): void {
    if (!info || !at) return this.place(this.focus, 0, 0, false);
    const key = `${info.title}|${info.line}|${info.status}|${info.color}`;
    if (this.focus.el.dataset.key !== key) {
      this.focus.el.dataset.key = key;
      this.focus.el.innerHTML =
        `<div style="font-size:10.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase">${esc(info.title)}</div>` +
        (info.line ? `<div style="font-size:11.5px;color:rgba(241,237,228,0.78);margin-top:2px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(info.line)}</div>` : '') +
        `<div style="display:flex;align-items:center;gap:5px;margin-top:4px;font-size:9.5px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${info.color}"><span style="width:6px;height:6px;border-radius:50%;background:${info.color}"></span>${esc(info.status)}</div>`;
    }
    const s = this.project(at, cam, w, h);
    this.place(this.focus, s.x, s.y - 10, s.ok);
  }

  setTerritories(items: { id: string; name: string; tagline: string; at: THREE.Vector3 }[], alpha: number, cam: THREE.Camera, w: number, h: number): void {
    this.taken = [];
    for (const it of items) {
      let t = this.territory.get(it.id);
      if (!t) {
        t = this.tag('text-align:center;color:#2a2c30;text-shadow:0 0 10px rgba(246,243,236,0.9),0 0 2px rgba(246,243,236,0.9)');
        t.el.innerHTML = `<div style="font-size:13px;font-weight:700;letter-spacing:0.32em;text-transform:uppercase">${esc(it.name)}</div><div style="font-size:10.5px;letter-spacing:0.08em;opacity:0.8;margin-top:3px">${esc(it.tagline)}</div>`;
        this.territory.set(it.id, t);
      }
      const s = this.project(it.at, cam, w, h);
      this.place(t, s.x, s.y, alpha > 0.02 && s.ok, 0.5, 0.5);
      if (t.visible) t.el.style.opacity = alpha.toFixed(2);
      if (t.visible && alpha > 0.4) this.taken.push({ x0: s.x - 110, x1: s.x + 110, y0: s.y - 22, y1: s.y + 22 });
    }
  }

  setChips(items: { id: string; text: string; color: string; at: THREE.Vector3; alert: boolean; rank: number }[], show: boolean, cam: THREE.Camera, w: number, h: number): void {
    const seen = new Set<string>();
    const placed: Rect[] = [...this.taken];
    const sf = this.safe;
    // Most important first: needs-Francisco / blocked, then busy, then the rest. Overlapping chips are dropped.
    for (const it of [...items].sort((a, b) => b.rank - a.rank)) {
      seen.add(it.id);
      let t = this.chips.get(it.id);
      if (!t) {
        t = this.tag('display:flex;align-items:center;gap:5px;padding:3px 7px;border-radius:999px;background:rgba(22,24,27,0.72);color:#efebe2;font-size:10px;font-weight:600;letter-spacing:0.04em;white-space:nowrap;transition:opacity 220ms ease');
        this.chips.set(it.id, t);
      }
      const key = `${it.text}|${it.color}|${it.alert}`;
      if (t.el.dataset.key !== key) {
        t.el.dataset.key = key;
        t.el.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:${it.color}"></span>${esc(it.text)}${it.alert ? '<span style="color:#f0b33c;margin-left:2px">◆</span>' : ''}`;
      }
      const s = this.project(it.at, cam, w, h);
      const cw = it.text.length * 6.2 + (it.alert ? 30 : 22);
      const r: Rect = { x0: s.x - cw / 2 - 3, x1: s.x + cw / 2 + 3, y0: s.y - 22, y1: s.y + 1 };
      const inside = r.y0 > sf.top + 4 && r.y1 < h - sf.bottom - 4 && r.x0 > sf.left + 4 && r.x1 < w - sf.right - 4;
      const free = inside && !placed.some((p) => hits(p, r));
      if (show && s.ok && free) placed.push(r);
      this.place(t, s.x, s.y, show && s.ok && free);
    }
    for (const [id, t] of this.chips)
      if (!seen.has(id)) {
        t.el.remove();
        this.chips.delete(id);
      }
  }

  setNames(items: { id: string; name: string; color: string; at: THREE.Vector3; show: boolean }[], cam: THREE.Camera, w: number, h: number): void {
    const seen = new Set<string>();
    for (const it of items) {
      seen.add(it.id);
      let t = this.names.get(it.id);
      if (!t) {
        t = this.tag('display:flex;align-items:center;gap:4px;padding:1px 5px;border-radius:4px;background:rgba(22,24,27,0.6);color:#f1ede4;font-size:9px;font-weight:700;letter-spacing:0.12em;transition:opacity 200ms ease');
        this.names.set(it.id, t);
      }
      const key = `${it.name}|${it.color}`;
      if (t.el.dataset.key !== key) {
        t.el.dataset.key = key;
        t.el.innerHTML = `<span style="width:5px;height:5px;border-radius:50%;background:${it.color}"></span>${esc(it.name)}`;
      }
      const s = this.project(it.at, cam, w, h);
      this.place(t, s.x, s.y, it.show && s.ok);
    }
    for (const [id, t] of this.names)
      if (!seen.has(id)) {
        t.el.remove();
        this.names.delete(id);
      }
  }

  destroy(): void {
    this.root.remove();
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
