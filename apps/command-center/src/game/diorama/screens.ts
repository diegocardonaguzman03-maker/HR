// Live displays: small canvas textures redrawn a few times per second.
// When a building is busy its screens show these; otherwise they are dark.
import * as THREE from 'three';
import type { ScreenKind } from './kit';

const W = 256;
const H = 160;

interface Screen {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: THREE.CanvasTexture;
  mat: THREE.MeshBasicMaterial;
  seed: number;
}

const screens = new Map<ScreenKind, Screen>();
const KINDS: ScreenKind[] = ['chart', 'code', 'map', 'cad', 'people', 'video', 'kanban', 'finance'];

export function screenMaterial(kind: ScreenKind): THREE.MeshBasicMaterial {
  let s = screens.get(kind);
  if (!s) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    s = { canvas, ctx, tex, mat, seed: KINDS.indexOf(kind) * 17 + 3 };
    screens.set(kind, s);
    draw(kind, s, 0);
  }
  return s.mat;
}

let acc = 0;
let frame = 0;
/** Advance screen content (cheap: one screen kind per call, ~8 Hz overall). */
export function tickScreens(dt: number): void {
  acc += dt;
  if (acc < 0.12) return;
  acc = 0;
  frame++;
  const kind = KINDS[frame % KINDS.length];
  const s = screens.get(kind);
  if (!s) return;
  draw(kind, s, frame);
  s.tex.needsUpdate = true;
}

const BG = '#0f1a1f';
const INK = '#cfe9ee';
const CY = '#6cc4d3';
const AM = '#e2a24a';
const MUTED = 'rgba(207,233,238,0.28)';

function rnd(seed: number): () => number {
  let x = seed || 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
}

function draw(kind: ScreenKind, s: Screen, f: number): void {
  const g = s.ctx;
  const r = rnd(s.seed + Math.floor(f / KINDS.length));
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  g.fillRect(0, 0, W, 16);
  g.fillStyle = MUTED;
  g.fillRect(8, 6, 40, 4);
  const t = f / KINDS.length;
  switch (kind) {
    case 'chart':
    case 'finance': {
      g.strokeStyle = MUTED;
      g.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(12, 40 + i * 28);
        g.lineTo(W - 12, 40 + i * 28);
        g.stroke();
      }
      g.strokeStyle = kind === 'finance' ? AM : CY;
      g.lineWidth = 3;
      g.beginPath();
      for (let x = 0; x <= 20; x++) {
        const y = 110 - x * 2.4 - Math.sin((x + t) * 0.8) * 10 - r() * 8;
        if (x) g.lineTo(12 + x * 11.6, y);
        else g.moveTo(12, y);
      }
      g.stroke();
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 3 ? 'rgba(108,196,211,0.45)' : AM;
        const h = 10 + r() * 26;
        g.fillRect(14 + i * 30, H - 12 - h, 16, h);
      }
      break;
    }
    case 'code': {
      g.font = '9px monospace';
      for (let i = 0; i < 12; i++) {
        const indent = (i * 7 + t) % 4;
        g.fillStyle = i === (t % 12) ? AM : i % 3 ? INK : CY;
        g.globalAlpha = 0.75;
        g.fillRect(12 + indent * 10, 24 + i * 11, 30 + r() * 120, 5);
      }
      g.globalAlpha = 1;
      break;
    }
    case 'map': {
      g.strokeStyle = MUTED;
      for (let i = 0; i < 9; i++) {
        g.beginPath();
        g.moveTo(0, 20 + i * 16);
        g.bezierCurveTo(80, 10 + i * 18, 160, 40 + i * 12, W, 20 + i * 15);
        g.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const x = 30 + ((i * 41 + t * 3) % 200);
        const y = 30 + ((i * 29) % 110);
        g.fillStyle = i % 2 ? CY : AM;
        g.beginPath();
        g.arc(x, y, 4, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'cad': {
      g.strokeStyle = 'rgba(108,196,211,0.18)';
      for (let x = 0; x < W; x += 16) {
        g.beginPath();
        g.moveTo(x, 16);
        g.lineTo(x, H);
        g.stroke();
      }
      for (let y = 16; y < H; y += 16) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
      // wireframe furnace silhouette, slowly rotating highlight
      g.strokeStyle = CY;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(128, 110, 60, 16, 0, 0, Math.PI * 2);
      g.moveTo(68, 110);
      g.lineTo(76, 66);
      g.moveTo(188, 110);
      g.lineTo(180, 66);
      g.stroke();
      g.beginPath();
      g.ellipse(128, 66, 52, 14, 0, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = AM;
      for (let i = 0; i < 3; i++) {
        const x = 110 + i * 18;
        g.beginPath();
        g.moveTo(x, 66);
        g.lineTo(x, 26);
        g.stroke();
      }
      g.fillStyle = AM;
      g.fillRect(118 + Math.sin(t * 0.7) * 50, 90, 6, 6);
      break;
    }
    case 'people': {
      for (let i = 0; i < 8; i++) {
        const x = 18 + (i % 4) * 60;
        const y = 30 + Math.floor(i / 4) * 64;
        g.fillStyle = 'rgba(255,255,255,0.06)';
        g.fillRect(x - 6, y - 4, 52, 56);
        g.fillStyle = i === t % 8 ? AM : CY;
        g.beginPath();
        g.arc(x + 20, y + 14, 9, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = MUTED;
        g.fillRect(x + 4, y + 30, 32, 4);
        g.fillRect(x + 8, y + 38, 24, 3);
      }
      break;
    }
    case 'video': {
      const grd = g.createLinearGradient(0, 16, W, H);
      grd.addColorStop(0, '#2a3a40');
      grd.addColorStop(1, '#3d3329');
      g.fillStyle = grd;
      g.fillRect(0, 16, W, H - 16);
      g.fillStyle = 'rgba(226,162,74,0.65)';
      g.beginPath();
      g.arc(90 + Math.sin(t * 0.3) * 20, 90, 26, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(207,233,238,0.5)';
      g.fillRect(150, 50, 70, 8);
      g.fillRect(150, 66, 50, 6);
      g.fillStyle = MUTED;
      g.fillRect(12, H - 12, W - 24, 3);
      g.fillStyle = AM;
      g.fillRect(12, H - 12, ((t * 7) % (W - 24)) + 4, 3);
      break;
    }
    case 'kanban': {
      for (let c = 0; c < 4; c++) {
        g.fillStyle = 'rgba(255,255,255,0.05)';
        g.fillRect(10 + c * 61, 22, 55, H - 30);
        const n = 2 + ((c + t) % 3);
        for (let i = 0; i < n; i++) {
          g.fillStyle = c === 3 ? 'rgba(108,196,211,0.7)' : i === 0 && c === 1 ? AM : 'rgba(207,233,238,0.55)';
          g.fillRect(15 + c * 61, 28 + i * 24, 45, 18);
        }
      }
      break;
    }
  }
}
