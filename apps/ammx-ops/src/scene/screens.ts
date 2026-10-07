import * as THREE from 'three';
import type { ScreenKind } from '../data/zones';
import { useStore, fmtTime } from '../store/useStore';
import { PROJECTS, PROJECT_STATUS } from '../data/projects';
import { AGENTS, STATUS_META } from '../data/agents';

// Every in-world screen is a CanvasTexture redrawn a few times per second by one shared ticker.
// Values on screens are SIMULATED (seeded noise), never real plant or HR data.

type Ctx = CanvasRenderingContext2D;
interface Screen { kind: ScreenKind; canvas: HTMLCanvasElement; tex: THREE.CanvasTexture; seed: number }
const screens: Screen[] = [];

const NAVY = '#0a1628';
const ORANGE = '#F58220';
const GRID = 'rgba(148,163,184,0.12)';
const TXT = '#cbd5e1';
const DIM = '#64748b';

export function makeScreen(kind: ScreenKind, w = 512, h = 288) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const s = { kind, canvas, tex, seed: screens.length * 7.13 + 1 };
  screens.push(s);
  draw(s, performance.now() / 1000);
  return tex;
}

// Screens are redrawn in three staggered groups to keep texture uploads small per frame.
let tickN = 0;
export function tickScreens(t: number) {
  tickN++;
  screens.forEach((s, i) => {
    if (i % 3 !== tickN % 3) return;
    draw(s, t);
    s.tex.needsUpdate = true;
  });
}

const noise = (x: number) => Math.sin(x * 12.9898) * 43758.5453 % 1;
const n01 = (x: number) => Math.abs(noise(x));

function frame(c: Ctx, w: number, h: number, title: string, accent = ORANGE) {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d1b30');
  g.addColorStop(1, '#071020');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.strokeStyle = GRID;
  c.lineWidth = 1;
  for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.fillStyle = accent;
  c.fillRect(0, 0, 6, h);
  c.fillStyle = '#e2e8f0';
  c.font = '600 20px Oxanium, Inter, sans-serif';
  c.fillText(title.toUpperCase(), 18, 30);
  c.fillStyle = DIM;
  c.font = '500 11px Inter, sans-serif';
  c.fillText('SIMULACIÓN · ' + fmtTime(useStore.getState().simMinute), w - 150, 28);
}

function bars(c: Ctx, x: number, y: number, w: number, h: number, vals: number[], color: string) {
  const bw = w / vals.length;
  vals.forEach((v, i) => {
    c.fillStyle = color;
    c.globalAlpha = 0.35 + 0.65 * v;
    c.fillRect(x + i * bw + 3, y + h - v * h, bw - 6, v * h);
  });
  c.globalAlpha = 1;
}

function line(c: Ctx, x: number, y: number, w: number, h: number, f: (u: number) => number, color: string) {
  c.strokeStyle = color;
  c.lineWidth = 3;
  c.beginPath();
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const v = f(u);
    if (i === 0) c.moveTo(x + u * w, y + h - v * h);
    else c.lineTo(x + u * w, y + h - v * h);
  }
  c.stroke();
}

function pill(c: Ctx, x: number, y: number, w: number, h: number, fill: string, text?: string, tc = '#0b1220') {
  c.fillStyle = fill;
  c.beginPath();
  c.roundRect(x, y, w, h, h / 2);
  c.fill();
  if (text) {
    c.fillStyle = tc;
    c.font = '600 12px Inter, sans-serif';
    c.fillText(text, x + 8, y + h / 2 + 4);
  }
}

function kpi(c: Ctx, x: number, y: number, label: string, value: string, color = '#e2e8f0') {
  c.fillStyle = DIM;
  c.font = '500 12px Inter, sans-serif';
  c.fillText(label, x, y);
  c.fillStyle = color;
  c.font = '700 30px Oxanium, Inter, sans-serif';
  c.fillText(value, x, y + 32);
}

function draw(s: Screen, t: number) {
  const c = s.canvas.getContext('2d')!;
  const { width: w, height: h } = s.canvas;
  const k = s.seed;
  const tt = t * 0.6 + k;
  switch (s.kind) {
    case 'funnel': {
      frame(c, w, h, 'Hiring funnel', '#3b82f6');
      const stages = ['Postulados', 'Filtro', 'Entrevista', 'Terna', 'Oferta', 'Ingreso'];
      stages.forEach((st, i) => {
        const fw = (w - 80) * (1 - i * 0.14);
        const x = (w - fw) / 2;
        const y = 48 + i * 38;
        c.fillStyle = `rgba(59,130,246,${0.85 - i * 0.1})`;
        c.fillRect(x, y, fw, 30);
        c.fillStyle = '#e0f2fe';
        c.font = '600 13px Inter, sans-serif';
        c.fillText(st, x + 10, y + 20);
      });
      // cards moving down the funnel
      for (let i = 0; i < 5; i++) {
        const u = ((tt * 0.15 + i / 5) % 1);
        const y = 48 + u * 220;
        c.fillStyle = ORANGE;
        c.fillRect(w / 2 - 40 + Math.sin(i * 3) * 60 * (1 - u), y, 18, 12);
      }
      break;
    }
    case 'vacancywall':
    case 'vacancies': {
      frame(c, w, h, 'Vacantes abiertas', '#3b82f6');
      for (let i = 0; i < 12; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const age = n01(k + i) * 90;
        const color = age > 60 ? '#ef4444' : age > 35 ? '#eab308' : '#22c55e';
        c.fillStyle = 'rgba(30,41,59,0.9)';
        c.fillRect(18 + col * 122, 50 + row * 76, 112, 66);
        c.fillStyle = color;
        c.fillRect(18 + col * 122, 50 + row * 76, 112, 4);
        c.fillStyle = TXT;
        c.font = '600 12px Inter, sans-serif';
        c.fillText(['Mant. eléctrico', 'Instrumentista', 'Op. de grúa', 'Metalurgista', 'Ing. proceso', 'Supervisor turno', 'Analista RH', 'Planeador mant.', 'Op. pellet', 'Ing. confiab.', 'Técnico LOTO', 'Jefe de área'][i], 26 + col * 122, 74 + row * 76);
        c.fillStyle = DIM;
        c.font = '500 11px Inter, sans-serif';
        c.fillText(`${Math.round(age)} días · ilustrativo`, 26 + col * 122, 96 + row * 76);
      }
      break;
    }
    case 'calendar':
    case 'trainingcal': {
      frame(c, w, h, s.kind === 'calendar' ? 'Agenda de entrevistas' : 'Calendario de capacitación', s.kind === 'calendar' ? '#3b82f6' : ORANGE);
      const days = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'];
      days.forEach((d, i) => {
        c.fillStyle = DIM;
        c.font = '600 12px Inter, sans-serif';
        c.fillText(d, 30 + i * 95, 60);
        for (let j = 0; j < 4; j++) {
          if (n01(k + i * 5 + j) > 0.45) {
            const pulse = (Math.floor(tt) + i + j) % 7 === 0;
            c.fillStyle = pulse ? ORANGE : ['#1d4ed8', '#0f766e', '#7c3aed', '#9a3412'][(i + j) % 4];
            c.fillRect(24 + i * 95, 72 + j * 50, 84, 40);
            c.fillStyle = '#f1f5f9';
            c.font = '500 11px Inter, sans-serif';
            c.fillText(s.kind === 'calendar' ? `Entrevista ${j + 1}` : ['SAFETS B1', 'LOTO', 'Alturas', 'Inducción', 'Liderazgo'][(i + j) % 5], 30 + i * 95, 96 + j * 50);
          }
        }
      });
      break;
    }
    case 'videocall': {
      frame(c, w, h, 'Intake · videollamada', '#0f766e');
      for (let i = 0; i < 4; i++) {
        const x = 20 + (i % 2) * 240;
        const y = 46 + Math.floor(i / 2) * 118;
        c.fillStyle = '#1e293b';
        c.fillRect(x, y, 228, 108);
        c.fillStyle = ['#64748b', '#94a3b8', '#475569', '#7c8798'][i];
        c.beginPath();
        c.arc(x + 114, y + 48, 24, 0, Math.PI * 2);
        c.fill();
        c.fillRect(x + 80, y + 76, 68, 32);
        if (i === Math.floor(tt) % 4) { c.strokeStyle = '#22c55e'; c.lineWidth = 3; c.strokeRect(x, y, 228, 108); }
      }
      break;
    }
    case 'succession': {
      frame(c, w, h, 'Matriz 9-box · sucesión', '#a855f7');
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
        c.fillStyle = `rgba(168,85,247,${0.12 + (r + q) * 0.07})`;
        c.fillRect(110 + q * 128, 44 + r * 78, 122, 72);
      }
      c.fillStyle = DIM;
      c.font = '500 11px Inter, sans-serif';
      c.fillText('Potencial ↑', 18, 60);
      c.fillText('Desempeño →', 380, 280);
      for (let i = 0; i < 10; i++) {
        const q = Math.floor(n01(k + i) * 3);
        const r = Math.floor(n01(k + i * 3) * 3);
        const drift = Math.sin(tt * 0.5 + i) * 6;
        c.fillStyle = i % 3 === 0 ? ORANGE : '#e9d5ff';
        c.beginPath();
        c.arc(140 + q * 128 + (i % 4) * 20 + drift, 66 + r * 78 + (i % 2) * 22, 8, 0, Math.PI * 2);
        c.fill();
      }
      break;
    }
    case 'talent': {
      frame(c, w, h, 'Readiness de sucesores', '#a855f7');
      ['Listo ahora', '1–2 años', '3+ años'].forEach((l, i) => {
        c.fillStyle = TXT;
        c.font = '600 13px Inter, sans-serif';
        c.fillText(l, 24, 74 + i * 64);
        const v = 0.3 + 0.5 * n01(k + i + Math.floor(tt / 6));
        pill(c, 130, 58 + i * 64, 340, 22, 'rgba(255,255,255,0.08)');
        pill(c, 130, 58 + i * 64, 340 * v, 22, ['#22c55e', '#eab308', '#a855f7'][i]);
      });
      c.fillStyle = DIM;
      c.font = '500 11px Inter, sans-serif';
      c.fillText('Valores ilustrativos · sin datos individuales', 24, h - 14);
      break;
    }
    case 'projectwall':
    case 'portfolio': {
      frame(c, w, h, s.kind === 'portfolio' ? 'Cartera · PMO' : 'Muro de proyectos', '#eab308');
      const st = useStore.getState();
      const list = PROJECTS.filter((p) => p.featured).slice(0, 12);
      list.forEach((p, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 16 + col * 122;
        const y = 46 + row * 78;
        c.fillStyle = ['#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0'][i % 4];
        c.fillRect(x, y, 112, 68);
        c.fillStyle = '#1f2937';
        c.font = '700 11px Inter, sans-serif';
        c.fillText(p.id, x + 6, y + 15);
        c.font = '500 10px Inter, sans-serif';
        wrap(c, p.name, x + 6, y + 30, 100, 12, 2);
        const prog = st.projects[p.id]?.progress ?? p.progress;
        c.fillStyle = 'rgba(0,0,0,0.15)';
        c.fillRect(x + 6, y + 56, 100, 5);
        c.fillStyle = PROJECT_STATUS[p.status].color;
        c.fillRect(x + 6, y + 56, prog, 5);
      });
      break;
    }
    case 'agents': {
      frame(c, w, h, 'Red de agentes', '#22d3ee');
      const st = useStore.getState();
      const cx = w / 2, cy = h / 2 + 14;
      AGENTS.forEach((a, i) => {
        const ang = (i / AGENTS.length) * Math.PI * 2 + tt * 0.05;
        const x = cx + Math.cos(ang) * 150;
        const y = cy + Math.sin(ang) * 95;
        c.strokeStyle = 'rgba(34,211,238,0.25)';
        c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke();
        c.fillStyle = STATUS_META[st.agents[a.id].status].color;
        c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill();
        c.fillStyle = TXT;
        c.font = '500 10px Inter, sans-serif';
        c.fillText(a.name.split(' ')[0], x + 9, y + 4);
      });
      c.fillStyle = '#22d3ee';
      c.beginPath(); c.arc(cx, cy, 14 + Math.sin(tt * 3) * 2, 0, Math.PI * 2); c.fill();
      break;
    }
    case 'auditqueue': {
      frame(c, w, h, 'Cola de auditoría', '#10b981');
      const crit = ['Responde lo pedido', 'Veracidad', 'Evidencia', 'Consistencia', 'Calidad de datos', 'Redacción', 'Privacidad / IA', 'Seguridad op.', 'Realidad op.', 'Negocio', 'Diseño / UX', 'Accionable'];
      crit.forEach((cr, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ok = n01(k + i + Math.floor(tt / 4)) > 0.18;
        c.fillStyle = ok ? '#10b981' : '#eab308';
        c.font = '700 14px Inter, sans-serif';
        c.fillText(ok ? '✔' : '✎', 24 + col * 240, 66 + row * 36);
        c.fillStyle = TXT;
        c.font = '500 12px Inter, sans-serif';
        c.fillText(cr, 46 + col * 240, 66 + row * 36);
      });
      break;
    }
    case 'risk': {
      frame(c, w, h, 'Matriz de riesgos', '#10b981');
      for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
        const sev = (r + q) / 6;
        c.fillStyle = sev > 0.66 ? 'rgba(239,68,68,0.55)' : sev > 0.4 ? 'rgba(234,179,8,0.45)' : 'rgba(16,185,129,0.35)';
        c.fillRect(120 + q * 90, 44 + r * 56, 86, 52);
      }
      ['C2', 'C9', 'C5', 'D1', 'C7', 'X1'].forEach((id, i) => {
        const q = [3, 3, 2, 2, 1, 1][i];
        const r = [0, 1, 1, 2, 2, 3][i];
        c.fillStyle = '#f8fafc';
        c.font = '700 12px Inter, sans-serif';
        c.fillText(id, 136 + q * 90 + (i % 2) * 30, 74 + r * 56 + Math.sin(tt + i) * 3);
      });
      c.fillStyle = DIM;
      c.font = '500 11px Inter, sans-serif';
      c.fillText('Impacto ↑ · Probabilidad →', 18, 60);
      break;
    }
    case 'academy': {
      frame(c, w, h, 'Roadmap de academias', ORANGE);
      const ac = ['Safety', 'Technical', 'Maintenance & Reliability', 'Leadership', 'Operational Excellence', 'Digital & AI'];
      ac.forEach((a, i) => {
        const y = 52 + i * 37;
        c.fillStyle = TXT;
        c.font = '600 12px Inter, sans-serif';
        c.fillText(a, 18, y + 16);
        const start = 190 + n01(k + i) * 80;
        const len = 120 + n01(k + i * 2) * 140;
        c.fillStyle = i === 2 ? ORANGE : 'rgba(245,130,32,0.35)';
        c.fillRect(start, y + 4, len, 18);
      });
      const nowX = 190 + ((tt * 8) % 300);
      c.strokeStyle = '#f8fafc';
      c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(nowX, 44); c.lineTo(nowX, h - 10); c.stroke();
      c.setLineDash([]);
      break;
    }
    case 'compliance': {
      frame(c, w, h, 'Cumplimiento de capacitación', ORANGE);
      ['LZC', 'Mina', 'Celaya/Pachuca'].forEach((site, i) => {
        const v = 0.72 + 0.2 * n01(k + i + Math.floor(tt / 5));
        const cx = 90 + i * 160, cy = 160;
        c.strokeStyle = 'rgba(255,255,255,0.1)';
        c.lineWidth = 14;
        c.beginPath(); c.arc(cx, cy, 52, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = v > 0.9 ? '#22c55e' : v > 0.8 ? '#eab308' : '#ef4444';
        c.beginPath(); c.arc(cx, cy, 52, -Math.PI / 2, -Math.PI / 2 + v * Math.PI * 2); c.stroke();
        c.fillStyle = '#f8fafc';
        c.font = '700 22px Oxanium, sans-serif';
        c.fillText(`${Math.round(v * 100)}%`, cx - 26, cy + 8);
        c.fillStyle = DIM;
        c.font = '600 12px Inter, sans-serif';
        c.fillText(site, cx - 30, cy + 84);
      });
      c.lineWidth = 1;
      break;
    }
    case 'charts':
    case 'kpis': {
      const ops = s.kind === 'kpis';
      frame(c, w, h, ops ? 'KPI de operación' : 'Analítica de aprendizaje', ops ? '#e5484d' : '#7c3aed');
      if (ops) {
        kpi(c, 20, 66, 'MTBF', `${Math.round(118 + Math.sin(tt) * 6)} h`);
        kpi(c, 140, 66, 'MTTR', `${(3.4 + Math.sin(tt * 0.7) * 0.3).toFixed(1)} h`);
        kpi(c, 260, 66, 'Disponibilidad', `${(91 + Math.sin(tt * 0.5) * 1.5).toFixed(1)}%`, '#22c55e');
        kpi(c, 400, 66, 'OEE', `${Math.round(78 + Math.sin(tt * 0.4) * 3)}%`);
      }
      bars(c, 20, ops ? 120 : 50, w - 40, ops ? 140 : 110, Array.from({ length: 14 }, (_, i) => 0.25 + 0.7 * n01(k + i + Math.floor(tt / 3))), ops ? '#e5484d' : '#a78bfa');
      if (!ops) line(c, 20, 170, w - 40, 100, (u) => 0.4 + 0.3 * Math.sin(u * 6 + tt) * 0.5 + u * 0.3, ORANGE);
      break;
    }
    case 'workinstr': {
      frame(c, w, h, 'Instrucción de trabajo · borrador', '#db2777');
      const steps = ['Identificar el riesgo', 'Verificar el permiso', 'Inspeccionar el equipo', 'Colocar EPP', 'Ejecutar con supervisión', 'Cerrar y registrar'];
      const cur = Math.floor(tt / 2) % steps.length;
      steps.forEach((st, i) => {
        c.fillStyle = i === cur ? ORANGE : i < cur ? '#22c55e' : 'rgba(255,255,255,0.15)';
        c.beginPath(); c.arc(32, 58 + i * 36, 10, 0, Math.PI * 2); c.fill();
        c.fillStyle = i === cur ? '#f8fafc' : TXT;
        c.font = `${i === cur ? 700 : 500} 13px Inter, sans-serif`;
        c.fillText(`${i + 1}. ${st}`, 52, 63 + i * 36);
      });
      c.fillStyle = DIM;
      c.font = '500 11px Inter, sans-serif';
      c.fillText('Material de aprendizaje · no sustituye el procedimiento oficial', 20, h - 12);
      break;
    }
    case 'video': {
      frame(c, w, h, 'Safety training', ORANGE);
      c.fillStyle = '#111827';
      c.fillRect(20, 44, w - 40, h - 80);
      // stylized worker silhouette climbing
      const y = 200 - ((tt * 20) % 120);
      c.strokeStyle = '#475569';
      c.lineWidth = 4;
      for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(200, 60 + i * 30); c.lineTo(300, 60 + i * 30); c.stroke(); }
      c.beginPath(); c.moveTo(200, 50); c.lineTo(200, 240); c.moveTo(300, 50); c.lineTo(300, 240); c.stroke();
      c.fillStyle = ORANGE;
      c.beginPath(); c.arc(250, y, 10, 0, Math.PI * 2); c.fill();
      c.fillRect(242, y + 10, 16, 26);
      c.strokeStyle = '#facc15';
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(250, y + 14); c.lineTo(250, 50); c.stroke();
      const prog = (tt * 4) % 100;
      c.fillStyle = 'rgba(255,255,255,0.15)';
      c.fillRect(20, h - 30, w - 40, 6);
      c.fillStyle = ORANGE;
      c.fillRect(20, h - 30, ((w - 40) * prog) / 100, 6);
      c.lineWidth = 1;
      break;
    }
    case 'certs': {
      frame(c, w, h, 'Certificaciones', '#22c55e');
      for (let i = 0; i < 18; i++) {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const v = n01(k + i);
        c.fillStyle = v > 0.82 ? '#ef4444' : v > 0.62 ? '#eab308' : '#22c55e';
        c.fillRect(20 + col * 80, 50 + row * 76, 70, 64);
        c.fillStyle = '#0b1220';
        c.font = '700 20px Oxanium, sans-serif';
        c.fillText(v > 0.82 ? '!' : '✓', 46 + col * 80, 90 + row * 76);
      }
      break;
    }
    case 'ojt': {
      frame(c, w, h, 'Matriz de habilitación OJT', ORANGE);
      const lv = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'];
      lv.forEach((l, i) => { c.fillStyle = DIM; c.font = '600 11px Inter, sans-serif'; c.fillText(l, 120 + i * 62, 56); });
      for (let r = 0; r < 6; r++) {
        c.fillStyle = TXT;
        c.font = '500 11px Inter, sans-serif';
        c.fillText(`Puesto ${r + 1}`, 20, 82 + r * 34);
        const lvl = Math.floor(n01(k + r + Math.floor(tt / 7)) * 6);
        for (let i = 0; i < 6; i++) {
          c.fillStyle = i <= lvl ? `rgba(245,130,32,${0.4 + i * 0.1})` : 'rgba(255,255,255,0.06)';
          c.fillRect(112 + i * 62, 68 + r * 34, 56, 24);
        }
      }
      break;
    }
    case 'process': {
      frame(c, w, h, 'Cadena de proceso', '#e5484d');
      const st = ['Mina', 'Pellet', 'Reducción', 'Acería EAF', 'Colada', 'Laminación'];
      st.forEach((p, i) => {
        const x = 18 + i * 82;
        c.fillStyle = 'rgba(229,72,77,0.18)';
        c.fillRect(x, 100, 72, 70);
        c.strokeStyle = '#e5484d';
        c.strokeRect(x, 100, 72, 70);
        c.fillStyle = TXT;
        c.font = '600 11px Inter, sans-serif';
        c.fillText(p, x + 6, 190);
        if (i < st.length - 1) {
          const u = (tt * 0.5 + i * 0.2) % 1;
          c.fillStyle = ORANGE;
          c.fillRect(x + 72 + u * 10, 132, 6, 6);
        }
      });
      c.fillStyle = i2c(Math.sin(tt * 2));
      c.beginPath(); c.arc(18 + 3 * 82 + 36, 135, 16 + Math.sin(tt * 5) * 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = DIM;
      c.font = '500 11px Inter, sans-serif';
      c.fillText('Esquema general · validar configuración con Operaciones del sitio', 18, h - 14);
      break;
    }
    case 'reliability': {
      frame(c, w, h, 'Confiabilidad y mantenimiento', '#e5484d');
      kpi(c, 20, 66, 'Backlog', `${Math.round(3.2 + Math.sin(tt * 0.3))} sem`);
      kpi(c, 170, 66, 'Preventivo', `${Math.round(64 + Math.sin(tt * 0.4) * 3)}%`);
      kpi(c, 330, 66, 'Alertas', `${Math.round(4 + Math.abs(Math.sin(tt * 0.2)) * 3)}`, '#eab308');
      line(c, 20, 120, w - 40, 140, (u) => 0.5 + 0.25 * Math.sin(u * 9 + tt * 0.8) - u * 0.1, '#e5484d');
      line(c, 20, 120, w - 40, 140, (u) => 0.35 + 0.2 * Math.cos(u * 7 + tt * 0.5), '#22c55e');
      break;
    }
    case 'safety': {
      frame(c, w, h, 'Seguridad', '#22c55e');
      kpi(c, 20, 70, 'Observaciones del turno', `${Math.round(14 + Math.abs(Math.sin(tt * 0.2)) * 9)}`, '#22c55e');
      ['LOTO', 'Alturas', 'Espacios conf.', 'Izajes'].forEach((r, i) => {
        pill(c, 20 + (i % 2) * 230, 140 + Math.floor(i / 2) * 50, 210, 34, 'rgba(34,197,94,0.15)');
        c.fillStyle = TXT;
        c.font = '600 13px Inter, sans-serif';
        c.fillText(`● ${r}`, 34 + (i % 2) * 230, 162 + Math.floor(i / 2) * 50);
      });
      break;
    }
  }
  c.fillStyle = 'rgba(255,255,255,0.03)';
  c.fillRect(0, (t * 80) % h, w, 2);
}

function i2c(v: number) {
  const a = 0.6 + 0.4 * v;
  return `rgba(255,${Math.round(120 + 60 * v)},40,${a})`;
}

function wrap(c: Ctx, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(' ');
  let lineStr = '';
  let n = 0;
  for (const w of words) {
    const test = lineStr ? `${lineStr} ${w}` : w;
    if (c.measureText(test).width > maxW && lineStr) {
      c.fillText(lineStr, x, y + n * lh);
      n++;
      lineStr = w;
      if (n >= maxLines) return;
    } else lineStr = test;
  }
  if (n < maxLines) c.fillText(lineStr, x, y + n * lh);
}

export { NAVY };
