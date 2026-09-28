// Genera los Procedimientos Operativos Visuales (POV) en PDF.
// Uso: node render.mjs [MO-EAF-07 ...]   (sin argumentos: todos los json/*.json)
// Salida: ../pdf/POV-<área>-<nn>-<titulo>.pdf  y  ../_build/<code>.html (para revisión)
import fs from 'node:fs';
import path from 'node:path';
import { icon, EPP, isIcon, isEpp } from './icons.mjs';
import { validate } from './validate.mjs';
import { catalogTitles } from './catalog.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const POV = path.resolve(here, '..');
const ACE = path.resolve(POV, '..'); // 10-plantas/01-steelmaking
const JSON_DIR = path.join(POV, 'json');
const OUT = path.join(POV, 'pdf');
const BUILD = path.join(POV, '_build');

export const AREAS = {
  EAF: { name: 'Hornos EAF', color: '#c62828' },
  OLL: { name: 'Ollas', color: '#6d4c41' },
  LF: { name: 'Horno Olla', color: '#ef6c00' },
  CC1: { name: 'Colada Continua 1 · Planchón', color: '#1565c0' },
  CC2: { name: 'Colada Continua 2 · Palanquilla', color: '#00838f' },
};
const LANE_COLORS = ['#1565c0', '#2e7d32', '#6a1b9a', '#00838f', '#c62828', '#ad1457', '#5d4037', '#455a64'];

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export { catalogTitles };

function wrap(text, max) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Medidas del diagrama (las usa validate.mjs para avisar si un texto no cabe). */
export function laneMetrics(nLanes) {
  const laneW = (700 - 26) / nLanes;
  const boxW = Math.min(laneW - 14, 190);
  const dw = Math.min(boxW, 150);
  const nW = Math.min(nLanes === 1 ? 200 : boxW, 200);
  return { titleChars: Math.max(12, Math.floor((boxW - 34) / 6.3)), questionChars: Math.floor(dw / 8), noChars: Math.floor(nW / 5.6) };
}
export { wrap };

/** Diagrama de carriles vertical: una columna por rol, los pasos bajan en orden. */
function swimlane(p, laneColor) {
  const lanes = [];
  for (const s of p.steps) if (!lanes.includes(s.role)) lanes.push(s.role);
  const roleName = (c) => p.roles.find((r) => r.code === c)?.name ?? c;
  const G = 26; // gutter de fases
  const W = 700;
  const laneW = (W - G) / lanes.length;
  const boxW = Math.min(laneW - 14, 190);
  const chars = Math.max(12, Math.floor((boxW - 34) / 6.3));
  const HEAD = 50;
  const rows = [];
  for (const s of p.steps) {
    const lines = wrap(s.title, chars).slice(0, 3);
    rows.push({ kind: 'step', s, lines, h: Math.max(40, 18 + lines.length * 13) });
    if (s.decision) rows.push({ kind: 'dec', s, h: 58 });
  }
  let y = HEAD + 10;
  const gap = 16;
  for (const r of rows) { r.y = y; y += r.h + gap; }
  const H = y + 6;
  const cx = (role) => G + laneW * lanes.indexOf(role) + laneW / 2;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Arial, Helvetica, sans-serif">
<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#546e7a"/></marker>
<marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#c62828"/></marker></defs>`;
  // fases
  const phaseRows = p.phases?.length ? p.phases.map((_, i) => rows.filter((r) => r.s.phase === i)) : [];
  phaseRows.forEach((rs, i) => {
    if (!rs.length) return;
    const y0 = rs[0].y - 8, y1 = rs[rs.length - 1].y + rs[rs.length - 1].h + 8;
    out += `<rect x="0" y="${y0}" width="${W}" height="${y1 - y0}" fill="${i % 2 ? '#ffffff' : '#f4f7f9'}"/>`;
    out += `<rect x="0" y="${y0}" width="${G - 6}" height="${y1 - y0}" fill="${laneColor}" opacity="0.9" rx="3"/>`;
    const my = (y0 + y1) / 2;
    out += `<text x="${(G - 6) / 2 + 4}" y="${my}" transform="rotate(-90 ${(G - 6) / 2 + 4} ${my})" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${esc(p.phases[i].toUpperCase())}</text>`;
  });
  // carriles
  lanes.forEach((role, i) => {
    const x = G + laneW * i;
    const col = LANE_COLORS[p.roles.findIndex((r) => r.code === role) % LANE_COLORS.length];
    out += `<line x1="${x}" y1="${HEAD}" x2="${x}" y2="${H}" stroke="#cfd8dc" stroke-dasharray="3 3"/>`;
    out += `<rect x="${x + 3}" y="2" width="${laneW - 6}" height="${HEAD - 8}" rx="5" fill="${col}"/>`;
    const nl = wrap(roleName(role), Math.floor((laneW - 10) / 5)).slice(0, 3);
    out += `<text x="${x + laneW / 2}" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${esc(role)}</text>`;
    nl.forEach((l, k) => { out += `<text x="${x + laneW / 2}" y="${24 + k * 9}" text-anchor="middle" font-size="7.8" fill="#fff">${esc(l)}</text>`; });
  });
  // elementos y flechas
  let prev = null; // {x, yBottom}
  const link = (x, yTop, label) => {
    if (!prev) return;
    const midY = prev.y + (yTop - prev.y) / 2;
    const d = prev.x === x ? `M${prev.x},${prev.y} L${x},${yTop - 1}` : `M${prev.x},${prev.y} L${prev.x},${midY} L${x},${midY} L${x},${yTop - 1}`;
    out += `<path d="${d}" fill="none" stroke="#546e7a" stroke-width="1.6" marker-end="url(#ar)"/>`;
    if (label) out += `<text x="${prev.x + 5}" y="${prev.y + 11}" font-size="9" font-weight="700" fill="#2e7d32">${label}</text>`;
  };
  for (const r of rows) {
    const x = cx(r.s.role);
    if (r.kind === 'step') {
      const s = r.s;
      link(x, r.y, prev?.yes ? 'Sí' : '');
      const bx = x - boxW / 2;
      out += `<rect x="${bx}" y="${r.y}" width="${boxW}" height="${r.h}" rx="7" fill="#fff" stroke="${s.critical ? '#E65100' : '#90a4ae'}" stroke-width="${s.critical ? 2.4 : 1.2}"/>`;
      out += `<circle cx="${bx + 15}" cy="${r.y + r.h / 2}" r="10" fill="${s.critical ? '#E65100' : '#37474f'}"/>`;
      out += `<text x="${bx + 15}" y="${r.y + r.h / 2 + 4}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#fff">${s.n}</text>`;
      const ty = r.y + r.h / 2 - ((r.lines.length - 1) * 13) / 2 + 4;
      r.lines.forEach((l, k) => { out += `<text x="${bx + 30}" y="${ty + k * 13}" font-size="10.5" font-weight="600" fill="#263238">${esc(l)}</text>`; });
      if (s.critical) out += `<text x="${bx + boxW - 12}" y="${r.y + 13}" text-anchor="middle" font-size="12" fill="#E65100">★</text>`;
      if (s.stop) out += `<g transform="translate(${bx + boxW - 12},${r.y + r.h - 11})"><polygon points="-6,-2.5 -2.5,-6 2.5,-6 6,-2.5 6,2.5 2.5,6 -2.5,6 -6,2.5" fill="#c62828"/><rect x="-3.5" y="-1" width="7" height="2" fill="#fff"/></g>`;
      prev = { x, y: r.y + r.h };
    } else {
      link(x, r.y);
      const dw = Math.min(boxW, 150), dh = r.h - 6;
      const dy = r.y + 3;
      out += `<polygon points="${x},${dy} ${x + dw / 2},${dy + dh / 2} ${x},${dy + dh} ${x - dw / 2},${dy + dh / 2}" fill="#fff8e1" stroke="#f9a825" stroke-width="1.6"/>`;
      const ql = wrap(r.s.decision.question, Math.floor(dw / 8)).slice(0, 2);
      ql.forEach((l, k) => { out += `<text x="${x}" y="${dy + dh / 2 + 4 - ((ql.length - 1) * 11) / 2 + k * 11}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#5d4037">${esc(l)}</text>`; });
      // caja "No" en el carril vecino
      const li = lanes.indexOf(r.s.role);
      const side = lanes.length === 1 || li < lanes.length - 1 ? 1 : -1;
      const nx = lanes.length === 1 ? x + dw / 2 + 110 : cx(lanes[li + side]);
      const nW = Math.min(lanes.length === 1 ? 200 : boxW, 200);
      const nl = wrap(r.s.decision.no, Math.floor(nW / 5.6)).slice(0, 3);
      const nh = 12 + nl.length * 11;
      const ny = dy + dh / 2 - nh / 2;
      out += `<rect x="${nx - nW / 2}" y="${ny}" width="${nW}" height="${nh}" rx="5" fill="#ffebee" stroke="#c62828" stroke-dasharray="4 2"/>`;
      nl.forEach((l, k) => { out += `<text x="${nx}" y="${ny + 14 + k * 11}" text-anchor="middle" font-size="8.8" fill="#b71c1c">${esc(l)}</text>`; });
      const fromX = x + side * dw / 2, toX = nx - side * nW / 2;
      out += `<path d="M${fromX},${dy + dh / 2} L${toX},${dy + dh / 2}" stroke="#c62828" stroke-width="1.5" marker-end="url(#arr)"/>`;
      out += `<text x="${(fromX + toX) / 2}" y="${dy + dh / 2 - 4}" text-anchor="middle" font-size="9" font-weight="700" fill="#c62828">No</text>`;
      prev = { x, y: dy + dh, yes: true };
    }
  }
  out += '</svg>';
  return { svg: out, lanes };
}

function laneColorOf(p, role) {
  const i = p.roles.findIndex((r) => r.code === role);
  return LANE_COLORS[(i < 0 ? 7 : i) % LANE_COLORS.length];
}

const img = (rel, caption, cls = '') => {
  const abs = path.join(ACE, rel);
  if (!fs.existsSync(abs)) throw new Error(`No existe la figura ${rel}`);
  return `<figure class="${cls}"><img src="file://${abs}"/>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
};

export function buildHtml(p, titles) {
  const area = AREAS[p.area];
  const lane = swimlane(p, area.color);
  const chip = (code) => `<span class="pchip"><b>${esc(code)}</b> ${esc(titles[code] ?? '')}</span>`;
  const critical = p.steps.filter((s) => s.critical);
  const own = p.roles.find((r) => r.code === p.owner) ?? p.roles.find((r) => r.raci === 'A');
  const ownerLabel = own ? `${own.code} ${own.name}` : 'tu supervisor';
  const stepCard = (s) => {
    const col = laneColorOf(p, s.role);
    const rn = p.roles.find((r) => r.code === s.role)?.name ?? '';
    return `<div class="step ${s.critical ? 'crit' : ''}">
      <div class="snum" style="background:${s.critical ? '#E65100' : '#37474f'}">${s.n}</div>
      <div class="sbody">
        <div class="shead"><span class="sico" style="border-color:${col};color:${col}">${icon(s.icon, { size: 22, color: col })}</span>
          <div><div class="stitle">${esc(s.title)}${s.critical ? ' <span class="star">★ CRÍTICO</span>' : ''}${s.quality ? ' <span class="q">🔎 CALIDAD</span>' : ''}</div>
          <div class="srole" style="background:${col}">${esc(s.role)} · ${esc(rn)}</div></div></div>
        <div class="sact"><b>Qué haces:</b> ${esc(s.action)}</div>
        <div class="schk">${icon('ok', { size: 13, color: '#2e7d32', stroke: 2.2 })} <b>Está bien si:</b> ${esc(s.check)}</div>
        ${s.stop ? `<div class="sstop">${icon('alto', { size: 13, color: '#fff', stroke: 2.2 })} <b>ALTO si:</b> ${esc(s.stop)} Detén la tarea y avisa a ${esc(ownerLabel)}.</div>` : ''}
        ${s.figure ? img(s.figure.file, s.figure.caption, 'sfig') : ''}
      </div></div>`;
  };
  const phaseBlocks = (p.phases?.length ? p.phases : ['Pasos']).map((ph, i) => {
    const ss = p.steps.filter((s) => (p.phases?.length ? s.phase === i : true));
    if (!ss.length) return '';
    return `<h3 class="phase" style="border-color:${area.color}"><span style="background:${area.color}">${i + 1}</span> ${esc(ph)}</h3><div class="steps">${ss.map(stepCard).join('')}</div>`;
  }).join('');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(p.pov)} ${esc(p.title)}</title>
<style>
@page { size: A4; margin: 15mm 12mm 16mm 12mm; }
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 9.6pt; color: #212121; line-height: 1.33; margin: 0; }
h2 { font-size: 13.5pt; color: #0d47a1; margin: 0 0 6px; padding-bottom: 3px; border-bottom: 2px solid #E65100; break-after: avoid; }
h2 .n { display:inline-block; background:#0d47a1; color:#fff; border-radius:3px; padding:0 6px; margin-right:6px; font-size:11pt; }
section { margin-bottom: 10px; }
.pb { break-before: page; }
.cover { border-radius: 8px; overflow: hidden; border: 1px solid #cfd8dc; }
.band { background: linear-gradient(90deg, #0d47a1, #1565c0); color: #fff; padding: 12px 14px 10px; position: relative; }
.band .areachip { display:inline-block; background:${area.color}; padding:2px 8px; border-radius:3px; font-size:8.5pt; font-weight:700; letter-spacing:.06em; }
.band .code { font-size: 9pt; opacity:.85; margin-left:8px; letter-spacing:.05em; }
.band h1 { font-size: 20pt; margin: 6px 0 2px; line-height:1.15; }
.band .sub { font-size: 8.5pt; opacity:.9; }
.band .for { position:absolute; right:14px; top:12px; text-align:right; font-size:8pt; opacity:.95; }
.band .for b { display:block; font-size:10.5pt; }
.intro { display:grid; grid-template-columns: 1.05fr 1fr; gap: 10px; padding: 10px 12px; }
.box { border:1px solid #cfd8dc; border-radius:6px; padding:7px 9px; background:#fafcfd; }
.box h4 { margin:0 0 3px; font-size:8.5pt; color:#546e7a; text-transform:uppercase; letter-spacing:.08em; }
.why { background:#fff3e0; border-color:#ffcc80; }
.flowline { display:flex; align-items:center; gap:6px; flex-wrap:wrap; font-size:8.3pt; }
.pchip { border:1px solid #b0bec5; border-radius:12px; padding:1px 7px; background:#fff; }
.pchip.me { background:#0d47a1; color:#fff; border-color:#0d47a1; }
.arrow { color:#90a4ae; font-weight:700; }
figure { margin: 4px 0; text-align:center; break-inside: avoid; }
figure img { max-width: 100%; max-height: 92mm; }
figcaption { font-size: 7.8pt; color:#607d8b; margin-top:2px; }
.roles { display:grid; grid-template-columns: repeat(2, 1fr); gap:6px; }
.role { display:flex; gap:7px; border:1px solid #cfd8dc; border-left-width:5px; border-radius:5px; padding:5px 7px; background:#fff; break-inside: avoid; }
.role .rc { font-weight:700; font-size:10pt; min-width:36px; }
.role .raci { display:inline-block; font-size:7.5pt; font-weight:700; color:#fff; border-radius:3px; padding:0 4px; margin-left:4px; }
.role .rn { font-weight:700; font-size:8.8pt; }
.role .rd { font-size:8.3pt; color:#37474f; }
.role .it { font-size:7.6pt; color:#607d8b; }
.gold { display:grid; grid-template-columns: repeat(3,1fr); gap:6px; }
.gold div { background:#E65100; color:#fff; border-radius:6px; padding:7px 8px; font-weight:700; font-size:9pt; line-height:1.25; }
.gold div span { display:block; font-size:16pt; line-height:1; margin-bottom:3px; }
.legend { display:flex; gap:14px; font-size:8pt; color:#455a64; margin:4px 0 6px; flex-wrap:wrap; align-items:center; }
.legend i { display:inline-block; width:14px; height:10px; border-radius:2px; vertical-align:middle; margin-right:3px; }
.lane svg { width:100%; height:auto; max-height: 238mm; display:block; margin: 0 auto; }
h3.phase { font-size:11pt; margin:8px 0 5px; padding-left:0; border-bottom:1.5px solid; color:#263238; break-after: avoid; }
h3.phase span { display:inline-block; color:#fff; border-radius:50%; width:18px; height:18px; text-align:center; line-height:18px; font-size:9pt; margin-right:5px; }
.steps { display:grid; grid-template-columns: 1fr 1fr; gap:6px; }
.step { display:flex; border:1px solid #cfd8dc; border-radius:6px; overflow:hidden; background:#fff; break-inside: avoid; }
.step.crit { border:2px solid #E65100; }
.snum { color:#fff; font-weight:700; font-size:15pt; min-width:30px; display:flex; align-items:flex-start; justify-content:center; padding-top:6px; }
.sbody { padding:5px 7px 6px; flex:1; }
.shead { display:flex; gap:6px; align-items:center; margin-bottom:3px; }
.sico { display:flex; align-items:center; justify-content:center; width:32px; height:32px; min-width:32px; border:2px solid; border-radius:50%; }
.stitle { font-weight:700; font-size:10pt; line-height:1.15; }
.star { color:#E65100; font-size:7.5pt; white-space:nowrap; }
.q { color:#6a1b9a; font-size:7.5pt; white-space:nowrap; }
.srole { display:inline-block; color:#fff; font-size:7.4pt; border-radius:3px; padding:0 5px; margin-top:2px; }
.sact { font-size:8.6pt; margin-bottom:3px; }
.schk { font-size:8.4pt; background:#e8f5e9; border-radius:4px; padding:2px 5px; }
.schk svg, .sstop svg { vertical-align:-2px; }
.sstop { font-size:8.3pt; background:#c62828; color:#fff; border-radius:4px; padding:2px 5px; margin-top:3px; }
.sfig img { max-height: 40mm; }
.safety { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
.epp { display:grid; grid-template-columns: repeat(4, 1fr); gap:5px; }
.epp div { border:1px solid #bbdefb; background:#e3f2fd; border-radius:6px; text-align:center; padding:5px 3px; font-size:7.6pt; line-height:1.15; color:#0d47a1; }
.epp svg { display:block; margin: 0 auto 2px; }
.zone { border-radius:6px; overflow:hidden; border:1px solid #cfd8dc; }
.zone div { padding:5px 8px; font-size:8.6pt; }
.zone .r { background:#c62828; color:#fff; font-weight:700; }
.zone .y { background:#fdd835; color:#3e2723; }
.zone .g { background:#eceff1; color:#263238; }
.hz { display:flex; gap:6px; align-items:center; border-bottom:1px dashed #e0e0e0; padding:4px 0; font-size:8.6pt; }
.hz svg { min-width: 20px; }
.emerg { border:2px solid #c62828; border-radius:6px; overflow:hidden; margin: 0 0 7px; break-inside: avoid; }
.emerg .eh { background:#c62828; color:#fff; font-weight:700; font-size:9pt; padding:4px 8px; display:flex; gap:6px; align-items:center; }
.emerg .eg { display:grid; grid-template-columns: repeat(4,1fr); } .emerg .eg div { padding:4px 6px; font-size:8pt; border-right:1px solid #ffcdd2; background:#fff5f5; } .emerg .eg b { display:block; color:#b71c1c; }
.emerg .ef { font-size:8pt; padding:4px 8px; background:#ffebee; }
.ab { display:grid; grid-template-columns: 1.1fr 1.6fr 0.9fr; border:1px solid #cfd8dc; border-radius:6px; overflow:hidden; margin-bottom:5px; break-inside: avoid; }
.ab > div { padding:5px 8px; font-size:8.5pt; }
.ab .if { background:#fff8e1; font-weight:700; display:flex; gap:6px; align-items:flex-start; }
.ab .do { background:#fff; border-left:1px solid #eceff1; }
.ab .call { background:#e3f2fd; border-left:1px solid #eceff1; }
.ab small { display:block; font-size:7pt; color:#78909c; text-transform:uppercase; letter-spacing:.08em; font-weight:700; }
table { width:100%; border-collapse:collapse; font-size:8.4pt; margin:4px 0; }
th { background:#455a64; color:#fff; text-align:left; padding:3px 5px; }
td { border:1px solid #cfd8dc; padding:3px 5px; vertical-align:top; }
tr:nth-child(even) td { background:#f5f7f8; }
.check li { list-style:none; margin: 0 0 4px; font-size:9.4pt; padding:4px 6px; border:1px solid #ffcc80; border-radius:5px; background:#fff8f0; break-inside: avoid; }
.check { padding:0; margin:4px 0; }
.check .cb { display:inline-block; width:13px; height:13px; border:1.8px solid #E65100; border-radius:2px; margin-right:6px; vertical-align:-2px; }
.two { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
.note { font-size:7.8pt; color:#607d8b; }
.gl dt { font-weight:700; font-size:8.6pt; } .gl dd { margin:0 0 3px 0; font-size:8.4pt; }
</style></head><body>

<section class="cover">
  <div class="band">
    <span class="areachip">${esc(area.name.toUpperCase())}</span><span class="code">${esc(p.pov)} · basado en ${esc(p.code)} · v${esc(p.version)} · Borrador para validación</span>
    <h1>${esc(p.title)}</h1>
    <div class="sub">Procedimiento Operativo Visual · ${esc(p.areaName)}</div>
  </div>
  <div class="intro">
    <div>
      <div class="box"><h4>¿Para qué sirve?</h4>${esc(p.purpose)}</div>
      <div class="box why" style="margin-top:6px"><h4>¿Por qué importa?</h4>${esc(p.whyItMatters)}</div>
      <div class="box" style="margin-top:6px"><h4>Empieza cuando</h4>${esc(p.startsWhen)}<h4 style="margin-top:5px">Termina cuando</h4>${esc(p.endsWhen)}</div>
      <div class="box" style="margin-top:6px"><h4>Dónde está en la cadena</h4>
        <div class="flowline">${p.previous.map(chip).join('<span class="arrow">+</span>')}<span class="arrow">→</span><span class="pchip me"><b>${esc(p.code)}</b></span><span class="arrow">→</span>${p.next.map(chip).join('<span class="arrow">+</span>')}</div></div>
    </div>
    <div>${img(p.heroFigure.file, p.heroFigure.caption)}</div>
  </div>
  <div style="padding:0 12px 10px">
    <h4 style="margin:2px 0 5px;font-size:8.5pt;color:#546e7a;text-transform:uppercase;letter-spacing:.08em">Mis 3 reglas de oro</h4>
    <div class="gold">${p.goldenRules.map((g, i) => `<div><span>${['①', '②', '③'][i] ?? '★'}</span>${esc(g)}</div>`).join('')}</div>
  </div>
</section>

<section class="pb">
  <h2><span class="n">1</span>¿Quién participa y qué le toca?</h2>
  <p class="note" style="margin:0 0 5px">R = lo hace · A = responde por el resultado · C = se le consulta · I = se le informa. Si eres nuevo, busca tu código de puesto y lee también tu Instrucción de Trabajo (IT).</p>
  <div class="roles">${p.roles.map((r) => {
    const col = laneColorOf(p, r.code);
    const rc = { R: '#2e7d32', A: '#0d47a1', C: '#6a1b9a', I: '#607d8b' }[r.raci] ?? '#607d8b';
    return `<div class="role" style="border-left-color:${col}"><div class="rc" style="color:${col}">${esc(r.code)}</div><div><div class="rn">${esc(r.name)}<span class="raci" style="background:${rc}">${esc(r.raci)}</span></div><div class="rd">${esc(r.does)}</div>${r.it ? `<div class="it">Tu instrucción de trabajo: ${esc(r.it)}</div>` : ''}</div></div>`;
  }).join('')}</div>
  <h2 style="margin-top:12px"><span class="n">2</span>Tu seguridad</h2>
  <div class="safety">
    <div>
      <h4 style="margin:0 0 4px;font-size:9pt">EPP obligatorio</h4>
      <div class="epp">${p.epp.map((e) => `<div>${icon(e, { size: 24, color: '#0d47a1' })}${esc(EPP[e][1])}</div>`).join('')}</div>
      ${p.hazards?.length ? `<h4 style="margin:8px 0 2px;font-size:9pt">Peligros principales</h4>${p.hazards.map((h) => `<div class="hz">${icon(h.icon, { size: 20, color: '#c62828' })}<span>${esc(h.text)}</span></div>`).join('')}` : ''}
    </div>
    <div>
      ${p.dangerZone ? `<h4 style="margin:0 0 4px;font-size:9pt">Zonas de peligro</h4><div class="zone"><div class="r">${esc(p.dangerZone.red)}</div><div class="y">${esc(p.dangerZone.yellow)}</div><div class="g">${esc(p.dangerZone.rule)}</div></div>` : ''}
      ${(p.figures ?? []).map((f) => img(f.file, f.caption)).join('')}
    </div>
  </div>
</section>

<section class="pb">
  <h2><span class="n">3</span>Así fluye el proceso</h2>
  <div class="legend"><span><i style="border:2.4px solid #E65100;background:#fff"></i>Paso crítico ★</span><span><i style="background:#c62828"></i>Condición de ALTO</span><span><i style="background:#fff8e1;border:1.5px solid #f9a825"></i>Decisión</span><span><i style="background:#ffebee;border:1px dashed #c62828"></i>Qué hacer si la respuesta es No</span><span>Cada columna es un puesto.</span></div>
  <div class="lane">${lane.svg}</div>
</section>

<section class="pb">
  <h2><span class="n">4</span>Paso a paso</h2>
  <p class="note" style="margin:0 0 4px">Sigue los pasos en orden. Los pasos ★ son críticos: se evalúan en tu certificación y nunca se saltan. Si se cumple una condición de ALTO, detén la tarea y avisa a ${esc(ownerLabel)}. ¿No conoces una palabra? Búscala en la sección 6 (Palabras que vas a escuchar). Un valor marcado [Supuesto] o [Validar con OEM] es de referencia: en planta usa el valor que te confirme tu supervisor.</p>
  ${phaseBlocks}

  <h2 style="margin-top:12px"><span class="n">5</span>Si algo sale mal</h2>
  <p class="note" style="margin:0 0 4px">Primero tu seguridad y la de tus compañeros. El personal sindicalizado detiene, avisa y escala; la decisión es del supervisor.</p>
  <div class="emerg"><div class="eh">${icon('alarma', { size: 18, color: '#fff' })} EN CUALQUIER EMERGENCIA · Tu detector personal de gases manda (MS-ACE-06)</div>
    <div class="eg"><div><b>CO ≥ 25 ppm</b> Sal a zona verde y avisa por radio.</div><div><b>CO ≥ 200 ppm</b> Evacuación del sector [Verificar NOM-010].</div><div><b>O₂ &lt; 19.5 % o &gt; 23.5 %</b> Sal. Nadie entra a rescatar sin equipo de respiración.</div><div><b>Gas natural ≥ 10 % LEL</b> Sal y no operes interruptores; ≥ 20 % LEL evacuación.</div></div>
    <div class="ef">Metal fuera de control, incendio o lesionado: aléjate a zona verde, avisa por radio al canal de emergencia y sigue a tu supervisor (MS-ACE-09). Nunca uses agua sobre metal líquido.</div></div>
  ${p.abnormal.map((a) => `<div class="ab"><div class="if">${icon(a.icon, { size: 18, color: '#e65100' })}<div><small>Si pasa esto</small>${esc(a.if)}</div></div><div class="do"><small>Haz esto</small>${esc(a.do)}</div><div class="call"><small>Avisa a</small>${esc(a.call)}</div></div>`).join('')}
</section>

<section class="pb">
  <h2><span class="n">6</span>Registros y certificación</h2>
  <table><tr><th>Registro</th><th>Cuándo</th><th>Dónde</th></tr>${p.records.map((r) => `<tr><td>${esc(r.what)}</td><td>${esc(r.when)}</td><td>${esc(r.where)}</td></tr>`).join('')}</table>
  <table style="margin-top:8px"><tr><th>Puesto</th><th>Nivel</th><th>Teoría</th><th>Práctica en el puesto (OJT)</th><th>Qué te evalúan</th><th>Vigencia</th></tr>${p.certification.map((c) => `<tr><td><b>${esc(c.role)}</b></td><td>${esc(c.level)}</td><td>${esc(c.theory)}</td><td>${esc(c.ojt)}</td><td>${esc(c.evaluated)}</td><td>${esc(c.validity)}</td></tr>`).join('')}</table>
  <div class="two" style="margin-top:8px">
    <div><h4 style="margin:0 0 4px;font-size:9pt">Palabras que vas a escuchar</h4><dl class="gl">${p.glossary.map((g) => `<dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd>`).join('')}</dl></div>
    <div><h4 style="margin:0 0 4px;font-size:9pt">Documentos relacionados</h4>
      <table><tr><td>Manual del proceso</td><td>${esc(p.code)} — ${esc(p.title)}</td></tr>
      <tr><td>Instrucciones de trabajo</td><td>${esc(p.roles.map((r) => r.it).filter(Boolean).join(', '))}</td></tr>
      <tr><td>Presentación de capacitación</td><td>${esc(p.deck ?? '—')}</td></tr>
      <tr><td>Procesos anterior / siguiente</td><td>${esc([...p.previous, ...p.next].join(', '))}</td></tr></table></div>
  </div>
</section>

<section class="pb">
  <h2><span class="n">7</span>Checklist de bolsillo — pasos críticos ★</h2>
  <p class="note" style="margin:0 0 5px">Úsalo cada vez que hagas este proceso. Si no puedes marcar una casilla, no sigas: avisa a tu supervisor.</p>
  <ul class="check">${critical.map((s) => `<li><span class="cb"></span><b>Paso ${s.n} · ${esc(s.title)}</b> (${esc(s.role)}) — ${esc(s.check)}</li>`).join('')}</ul>
  <div class="gold" style="margin-top:8px">${p.goldenRules.map((g, i) => `<div><span>${['①', '②', '③'][i] ?? '★'}</span>${esc(g)}</div>`).join('')}</div>
  <h2 style="margin-top:12px"><span class="n">8</span>Revisión y aprobación</h2>
  <table><tr><th>Revisión</th><th>Quién</th><th>Resultado</th><th>Fecha</th></tr>${p.review.map((r) => `<tr><td>${esc(r.area)}</td><td>${esc(r.who)}</td><td>${esc(r.status)}</td><td>${esc(r.date)}</td></tr>`).join('')}
  <tr><td>Aprobación</td><td>Director de Capacitación y Desarrollo</td><td>Pendiente</td><td>—</td></tr></table>
  <p class="note">Documento de capacitación, borrador para validación. Los valores técnicos provienen del manual ${esc(p.code)} y de la ficha FT-ACE-001 v0.3; lo marcado [Supuesto] o [Validar con OEM] se confirma con Ingeniería de Proceso antes de usarse en planta. Copia impresa = copia no controlada.</p>
</section>
</body></html>`;
}

export function fileName(p) {
  const slug = p.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return `${p.pov}-${slug}.pdf`;
}

async function main() {
  const { chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
  const args = process.argv.slice(2);
  const files = (args.length ? args.map((c) => `${c}.json`) : fs.readdirSync(JSON_DIR).filter((f) => f.endsWith('.json'))).sort();
  const titles = catalogTitles();
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage();
  let ok = 0, bad = 0;
  for (const f of files) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(JSON_DIR, f), 'utf8'));
      const errs = validate(p, titles, ACE);
      if (errs.length) throw new Error('Validación:\n  - ' + errs.join('\n  - '));
      const html = buildHtml(p, titles);
      const tmp = path.join(BUILD, `${p.code}.html`);
      fs.writeFileSync(tmp, html);
      await page.goto('file://' + tmp, { waitUntil: 'load' });
      await page.pdf({
        path: path.join(OUT, fileName(p)), format: 'A4', printBackground: true, displayHeaderFooter: true,
        headerTemplate: `<div style="font-size:7px;width:100%;padding:0 12mm;color:#607d8b;font-family:Arial;display:flex;justify-content:space-between"><span>GASM · Acería · Procedimiento Operativo Visual</span><span>${esc(p.pov)} · ${esc(p.title)}</span></div>`,
        footerTemplate: `<div style="font-size:7px;width:100%;padding:0 12mm;color:#607d8b;font-family:Arial;display:flex;justify-content:space-between"><span>Academia GASM · Borrador para validación · Copia no controlada</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
        margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
      });
      ok++; console.log('OK  ', f, '→', fileName(p));
    } catch (e) { bad++; console.log('FAIL', f, e.message); }
  }
  await browser.close();
  console.log(`\n${ok} PDF generados, ${bad} con error`);
  if (bad) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
