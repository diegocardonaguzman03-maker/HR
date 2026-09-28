// Genera el mapa de procesos y roles de la Acería a partir de json/*.json:
//   pdf/00-MAPA-ACERIA-procesos-y-roles.pdf  (cadena de procesos por área, matriz puesto × proceso
//   y ruta de lectura para el personal de nuevo ingreso de cada puesto).
// Uso: node mapa.mjs
import fs from 'node:fs';
import path from 'node:path';
import { AREAS, fileName } from './render.mjs';
import { ACE, POV } from './catalog.mjs';
import { icon } from './icons.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const RACI_COLOR = { R: '#2e7d32', A: '#0d47a1', C: '#6a1b9a', I: '#90a4ae' };
const ORDER = ['EAF', 'OLL', 'LF', 'CC1', 'CC2'];

const procs = fs.readdirSync(path.join(POV, 'json')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(POV, 'json', f), 'utf8')));

// Nombres de puesto: primera aparición en los POV
const roleName = {};
for (const p of procs) for (const r of p.roles) roleName[r.code] ??= r.name;
const roleIt = {};
for (const p of procs) for (const r of p.roles) if (r.it) roleIt[r.code] ??= r.it;
const sortRole = (a, b) => (a[0] === b[0] ? a.localeCompare(b) : a[0] === 'S' ? -1 : 1);

// Agrupación en secciones del mapa: Hornos (EAF), Ollas y Horno Olla (OLL + LF), CC1, CC2
const SECTIONS = [
  { id: 'EAF', title: 'Hornos de arco eléctrico (EAF-1 / EAF-2)', areas: ['EAF'], color: AREAS.EAF.color },
  { id: 'OLL-LF', title: 'Ollas y Horno Olla (LF-1 / LF-2)', areas: ['OLL', 'LF'], color: AREAS.LF.color },
  { id: 'CC1', title: 'Colada Continua 1 · Planchón', areas: ['CC1'], color: AREAS.CC1.color },
  { id: 'CC2', title: 'Colada Continua 2 · Palanquilla', areas: ['CC2'], color: AREAS.CC2.color },
];

function chainSvg(list, color) {
  // Cadena de procesos en filas de 4 tarjetas con flechas en serpentina
  const per = 4, W = 700, cw = 150, ch = 62, gx = (W - per * cw) / (per - 1), gy = 34;
  const rows = Math.ceil(list.length / per);
  const H = rows * ch + (rows - 1) * gy + 8;
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" font-family="Arial">
  <defs><marker id="m" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#78909c"/></marker></defs>`;
  const pos = list.map((_, i) => {
    const r = Math.floor(i / per), c = i % per;
    const col = r % 2 === 0 ? c : per - 1 - c;
    return { x: col * (cw + gx), y: 4 + r * (ch + gy) };
  });
  list.forEach((p, i) => {
    const { x, y } = pos[i];
    if (i > 0) {
      const a = pos[i - 1];
      const linked = list[i - 1].next.includes(p.code) || p.previous.includes(list[i - 1].code);
      const st = linked ? 'stroke="#546e7a" stroke-width="2.2"' : 'stroke="#b0bec5" stroke-width="1.6" stroke-dasharray="4 3"';
      if (a.y === y) {
        const fx = a.x < x ? a.x + cw : a.x, tx = a.x < x ? x : x + cw;
        o += `<path d="M${fx},${y + ch / 2} L${tx},${y + ch / 2}" ${st} marker-end="url(#m)"/>`;
      } else o += `<path d="M${a.x + cw / 2},${a.y + ch} L${x + cw / 2},${y}" ${st} marker-end="url(#m)"/>`;
    }
    o += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="#fff" stroke="${color}" stroke-width="2"/>`;
    o += `<rect x="${x}" y="${y}" width="${cw}" height="18" rx="8" fill="${color}"/><rect x="${x}" y="${y + 10}" width="${cw}" height="8" fill="${color}"/>`;
    o += `<text x="${x + cw / 2}" y="${y + 13}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${esc(p.pov)}</text>`;
    const words = p.title.split(' ');
    const lines = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > 24 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
    if (cur) lines.push(cur);
    lines.slice(0, 3).forEach((l, k) => { o += `<text x="${x + cw / 2}" y="${y + 31 + k * 11}" text-anchor="middle" font-size="9" fill="#263238">${esc(l)}</text>`; });
  });
  return o + '</svg>';
}

const num = (t) => { const m = String(t ?? '').match(/(\d+(?:\.\d+)?)\s*h/); return m ? Number(m[1]) : 0; };
function hrs(rc, list) {
  const rows = list.flatMap((p) => p.certification.filter((c) => c.role === rc));
  const th = rows.reduce((a, c) => a + num(c.theory), 0), oj = rows.reduce((a, c) => a + num(c.ojt), 0);
  return th || oj ? `<div class="rh2">Formación de referencia en esta área: <b>${th} h</b> de teoría y <b>${oj} h</b> de práctica en el puesto (OJT) · DC-3 al certificarte</div>` : '';
}

function section(sec) {
  const list = procs.filter((p) => sec.areas.includes(p.area)).sort((a, b) => ORDER.indexOf(a.area) - ORDER.indexOf(b.area) || a.code.localeCompare(b.code));
  if (!list.length) return '';
  const roles = [...new Set(list.flatMap((p) => p.roles.map((r) => r.code)))].sort(sortRole);
  const matrix = `<table class="mx"><tr><th>Puesto</th>${list.map((p) => `<th class="v"><div>${esc(p.pov)}</div></th>`).join('')}</tr>
  ${roles.map((rc) => `<tr><td class="rn"><b>${esc(rc)}</b> ${esc(roleName[rc] ?? '')}</td>${list.map((p) => {
    const r = p.roles.find((x) => x.code === rc);
    return r ? `<td class="c" style="background:${RACI_COLOR[r.raci]}">${r.raci}</td>` : '<td class="c e"></td>';
  }).join('')}</tr>`).join('')}</table>`;
  const routes = roles.filter((rc) => list.some((p) => p.roles.some((r) => r.code === rc && ['R', 'A'].includes(r.raci)))).map((rc) => {
    const mine = list.filter((p) => p.roles.some((r) => r.code === rc && ['R', 'A'].includes(r.raci)));
    const crit = mine.reduce((n, p) => n + p.steps.filter((s) => s.role === rc && s.critical).length, 0);
    return `<div class="route"><div class="rh"><b>${esc(rc)}</b> ${esc(roleName[rc] ?? '')}</div>
      <ol><li><b>Primero tu seguridad:</b> MS-ACE-01 (metal líquido) y los MS que cita cada POV.</li><li>Lee tu instrucción de trabajo <b>${esc(roleIt[rc] ?? '—')}</b> (tu turno completo).</li>
      ${mine.map((p) => `<li><b>${esc(p.pov)}</b> ${esc(p.title)} <span class="pill">${p.roles.find((r) => r.code === rc).raci === 'A' ? 'eres dueño' : p.steps.some((s) => s.role === rc) ? `${p.steps.filter((s) => s.role === rc).length} pasos tuyos` : 'participas'}</span></li>`).join('')}
      </ol>
      ${hrs(rc, mine)}<div class="rf">${crit ? `${crit} pasos críticos ★ a certificar en esta área` : rc.startsWith('C') ? 'Supervisa, autoriza y responde por el resultado' : 'Sin pasos críticos propios en esta área'}</div></div>`;
  }).join('');
  return `<section class="pb"><div class="sh" style="background:${sec.color}">${esc(sec.title)}</div>
  <h2>Cadena de procesos</h2><p class="note">Cada tarjeta es un Procedimiento Operativo Visual (POV). Flecha sólida: un proceso sigue directamente al otro. Flecha punteada: solo orden de lectura; ese proceso ocurre cuando se necesita (por ejemplo, cambio de electrodos o de buza).</p>
  ${chainSvg(list, sec.color)}
  <table class="lst"><tr><th>POV</th><th>Proceso</th><th>Dueño (A)</th><th>Quién lo hace (R)</th><th>Pasos / ★</th><th>Archivo</th></tr>
  ${list.map((p) => `<tr><td><b>${esc(p.pov)}</b></td><td>${esc(p.title)}</td><td>${esc(p.roles.filter((r) => r.raci === 'A').map((r) => r.code).join(', '))}</td><td>${esc(p.roles.filter((r) => r.raci === 'R').map((r) => r.code).join(', '))}</td><td>${p.steps.length} / ${p.steps.filter((s) => s.critical).length}</td><td class="f">${esc(fileName(p))}</td></tr>`).join('')}</table>
  <h2>¿Quién hace qué? Matriz puesto × proceso</h2>
  <p class="note"><span class="k" style="background:${RACI_COLOR.R}">R</span> lo hace · <span class="k" style="background:${RACI_COLOR.A}">A</span> responde por el resultado · <span class="k" style="background:${RACI_COLOR.C}">C</span> se le consulta · <span class="k" style="background:${RACI_COLOR.I}">I</span> se le informa</p>
  ${matrix}
  <h2>Si eres nuevo: tu ruta de lectura</h2>
  <div class="routes">${routes}</div></section>`;
}

function areaFlow() {
  const n = (areas) => procs.filter((p) => areas.includes(p.area)).length;
  const box = (x, y, w, t, sub, color) => `<rect x="${x}" y="${y}" width="${w}" height="58" rx="9" fill="#fff" stroke="${color}" stroke-width="2.5"/><rect x="${x}" y="${y}" width="8" height="58" rx="4" fill="${color}"/><text x="${x + w / 2 + 4}" y="${y + 25}" text-anchor="middle" font-size="12" font-weight="700" fill="#263238">${t}</text><text x="${x + w / 2 + 4}" y="${y + 42}" text-anchor="middle" font-size="9.5" fill="#607d8b">${sub}</text>`;
  const ar = (x1, y1, x2, y2) => `<path d="M${x1},${y1} L${x2},${y2}" stroke="#90a4ae" stroke-width="2.5" marker-end="url(#fa)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 170" width="100%" font-family="Arial"><defs><marker id="fa" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#90a4ae"/></marker></defs>
  ${box(0, 56, 110, 'Patio', 'chatarra y DRI', '#795548')}${ar(110, 85, 136, 85)}
  ${box(138, 56, 140, 'Hornos EAF', `${n(['EAF'])} POV`, AREAS.EAF.color)}${ar(278, 85, 304, 85)}
  ${box(306, 56, 150, 'Ollas · Horno Olla', `${n(['OLL', 'LF'])} POV`, AREAS.LF.color)}${ar(456, 78, 492, 38)}${ar(456, 92, 492, 132)}
  ${box(494, 6, 206, 'CC1 · Planchón', `${n(['CC1'])} POV`, AREAS.CC1.color)}
  ${box(494, 106, 206, 'CC2 · Palanquilla', `${n(['CC2'])} POV`, AREAS.CC2.color)}</svg>`;
}

const total = procs.length;
const steps = procs.reduce((n, p) => n + p.steps.length, 0);
const crit = procs.reduce((n, p) => n + p.steps.filter((s) => s.critical).length, 0);
const allRoles = [...new Set(procs.flatMap((p) => p.roles.map((r) => r.code)))].sort(sortRole);

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Mapa de procesos y roles — Acería</title><style>
@page { size: A4; margin: 15mm 12mm 16mm 12mm; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 9.4pt; color:#212121; margin:0; line-height:1.3; }
.pb { break-before: page; }
.cover { background: linear-gradient(135deg,#0d47a1,#1565c0 60%,#E65100); color:#fff; border-radius:10px; padding:26px 24px; }
.cover h1 { font-size: 26pt; margin: 6px 0; line-height:1.1; } .cover .k1 { letter-spacing:.2em; font-size:9pt; opacity:.9 }
.stats { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; margin-top:16px; }
.stats div { background: rgba(255,255,255,.14); border-radius:8px; padding:8px; } .stats b { font-size:20pt; display:block; }
.how { display:grid; grid-template-columns: repeat(3,1fr); gap:8px; margin-top:14px; }
.how div { border:1px solid #cfd8dc; border-radius:8px; padding:9px; background:#fafcfd; }
.how div b { display:block; color:#0d47a1; font-size:10.5pt; margin:4px 0 3px; }
.sh { color:#fff; font-size:15pt; font-weight:700; padding:8px 12px; border-radius:6px; }
h2 { font-size:12.5pt; color:#0d47a1; border-bottom:2px solid #E65100; padding-bottom:2px; margin:12px 0 5px; break-after: avoid; }
.note { font-size:8pt; color:#607d8b; margin:0 0 5px; }
table { width:100%; border-collapse:collapse; font-size:8.3pt; margin:6px 0; }
th { background:#455a64; color:#fff; padding:3px 4px; text-align:left; } td { border:1px solid #cfd8dc; padding:2px 4px; vertical-align:top; }
.lst td.f { font-size:7pt; color:#607d8b; }
.mx th.v { height: 64px; vertical-align: bottom; padding:2px; width: 22px; } .mx th.v div { writing-mode: vertical-rl; transform: rotate(180deg); font-size:7.6pt; }
.mx td.c { text-align:center; color:#fff; font-weight:700; width:22px; padding:2px 0; } .mx td.e { background:#fff; }
.mx td.rn { font-size:8pt; white-space:nowrap; }
.k { display:inline-block; color:#fff; font-weight:700; border-radius:3px; padding:0 4px; }
.routes { display:grid; grid-template-columns: 1fr 1fr; gap:6px; }
.route { border:1px solid #cfd8dc; border-radius:6px; padding:6px 8px; break-inside: avoid; font-size:8.3pt; }
.route .rh { font-size:9.4pt; color:#0d47a1; margin-bottom:2px; } .route ol { margin:2px 0 2px 16px; padding:0; } .route li { margin-bottom:1px; }
.pill { font-size:7pt; background:#eceff1; border-radius:8px; padding:0 5px; color:#455a64; white-space:nowrap; }
.rh2 { font-size:7.6pt; color:#37474f; margin-top:2px; }
.rf { font-size:7.6pt; color:#E65100; font-weight:700; }
.idx td { font-size:8pt; }
</style></head><body>
<div class="cover"><div class="k1">GASM · ACERÍA NORTE · ACADEMIA GASM</div><h1>Mapa de procesos y roles</h1>
<div>Procedimientos Operativos Visuales (POV): cómo se conectan los procesos, quién hace qué y qué debe leer cada puesto.</div>
<div class="stats"><div><b>${total}</b>procesos operativos</div><div><b>${steps}</b>pasos dibujados</div><div><b>${crit}</b>pasos críticos ★</div><div><b>${allRoles.length}</b>puestos ligados</div></div></div>
<div class="how">
<div>${icon('personas', { size: 26, color: '#0d47a1' })}<b>1 · Busca tu puesto</b>Encuentra tu código (S-xx o C-xx) en la matriz de tu área o en el índice final.</div>
<div>${icon('ruta', { size: 26, color: '#0d47a1' })}<b>2 · Sigue tu ruta</b>Empieza por seguridad crítica, luego tu instrucción de trabajo (IT) y los POV donde eres R o A, en el orden de la cadena.</div>
<div>${icon('certificado', { size: 26, color: '#0d47a1' })}<b>3 · Certifícate</b>Los pasos ★ de cada POV son los que te evalúan en tu certificación (TD-P07).</div></div>
<h2>Así fluye el acero por las áreas</h2>${areaFlow()}
<h2>Documentos que se usan juntos</h2>
<table><tr><th>Documento</th><th>Qué es</th><th>Quién lo usa</th></tr>
<tr><td><b>DP</b> Descripción de puesto</td><td>Responsabilidades del puesto y procesos donde participa</td><td>Todos, al ingresar</td></tr>
<tr><td><b>IT</b> Instrucción de trabajo por rol</td><td>Tu turno completo, en todas tus tareas</td><td>El titular del puesto</td></tr>
<tr><td><b>POV</b> Procedimiento Operativo Visual</td><td>Un proceso completo, visto por todos los puestos que participan</td><td>Todos los puestos del proceso</td></tr>
<tr><td><b>MO</b> Manual de operación</td><td>Referencia técnica: parámetros, alarmas, criterios</td><td>Supervisión, ingeniería, instructores</td></tr></table>
${SECTIONS.map(section).join('')}
<section class="pb"><h2>Índice por puesto</h2><p class="note">Procesos donde participa cada puesto (R, A, C o I). Úsalo para planear la inducción y la ruta de certificación.</p>
<table class="idx"><tr><th>Puesto</th><th>IT</th><th>Lo hace (R)</th><th>Dueño (A)</th><th>Consultado / informado (C, I)</th></tr>
${allRoles.map((rc) => {
  const by = (k) => procs.filter((p) => p.roles.some((r) => r.code === rc && k.includes(r.raci))).map((p) => p.pov).join(', ');
  return `<tr><td><b>${esc(rc)}</b> ${esc(roleName[rc])}</td><td>${esc(roleIt[rc] ?? '—')}</td><td>${esc(by(['R']))}</td><td>${esc(by(['A']))}</td><td>${esc(by(['C', 'I']))}</td></tr>`;
}).join('')}</table>
<p class="note">Borrador para validación · Fuente: json/*.json de los POV, catálogo CAT-ACE-001 y descripciones de puesto DP-ACE. Copia impresa = copia no controlada.</p></section>
</body></html>`;

const { chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
fs.mkdirSync(path.join(POV, '_build'), { recursive: true });
const tmp = path.join(POV, '_build', 'mapa.html');
fs.writeFileSync(tmp, html);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage();
await page.goto('file://' + tmp, { waitUntil: 'load' });
await page.pdf({
  path: path.join(POV, 'pdf', '00-MAPA-ACERIA-procesos-y-roles.pdf'), format: 'A4', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<div style="font-size:7px;width:100%;padding:0 12mm;color:#607d8b;font-family:Arial">GASM · Acería · Mapa de procesos y roles</div>',
  footerTemplate: '<div style="font-size:7px;width:100%;padding:0 12mm;color:#607d8b;font-family:Arial;text-align:right">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
  margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
});
await browser.close();
console.log(`Mapa generado con ${total} procesos, ${allRoles.length} puestos.`);
