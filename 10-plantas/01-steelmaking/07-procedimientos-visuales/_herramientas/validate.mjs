// Validación de un POV (json) antes de generar el PDF. Devuelve una lista de errores.
// También se puede correr sola: node validate.mjs  (valida todos los json/*.json)
import fs from 'node:fs';
import path from 'node:path';
import { isIcon, isEpp } from './icons.mjs';
import { catalogTitles } from './catalog.mjs';
import { laneMetrics, wrap } from './render.mjs';

const REQUIRED = ['code', 'pov', 'title', 'area', 'areaName', 'version', 'owner', 'manual', 'purpose', 'whyItMatters', 'startsWhen', 'endsWhen',
  'previous', 'next', 'heroFigure', 'roles', 'goldenRules', 'epp', 'phases', 'steps', 'abnormal', 'records', 'certification', 'glossary', 'review'];
const AREAS = ['EAF', 'OLL', 'LF', 'CC1', 'CC2'];

export function validate(p, titles, ace) {
  const e = [];
  for (const k of REQUIRED) if (p[k] === undefined) e.push(`falta el campo "${k}"`);
  if (e.length) return e;
  if (!AREAS.includes(p.area)) e.push(`área inválida ${p.area}`);
  if (!titles[p.code]) e.push(`${p.code} no está en el catálogo`);
  if (!fs.existsSync(path.join(ace, p.manual))) e.push(`no existe el manual ${p.manual}`);
  for (const c of [...p.previous, ...p.next]) if (!titles[c]) e.push(`proceso relacionado desconocido ${c}`);
  const figs = [p.heroFigure, ...(p.figures ?? []), ...p.steps.map((s) => s.figure).filter(Boolean)];
  for (const f of figs) if (!fs.existsSync(path.join(ace, f.file))) e.push(`no existe la figura ${f.file}`);
  const roleCodes = p.roles.map((r) => r.code);
  for (const r of p.roles) {
    if (!/^[SC]-\d\d$/.test(r.code)) e.push(`código de rol inválido ${r.code}`);
    if (!['R', 'A', 'C', 'I'].includes(r.raci)) e.push(`RACI inválido en ${r.code}`);
    if (r.it && !fs.readdirSync(path.join(ace, '06-instrucciones-trabajo')).some((f) => f.startsWith(r.it + '-'))) e.push(`no existe la instrucción ${r.it}`);
  }
  if (!p.roles.some((r) => r.raci === 'A')) e.push('ningún rol tiene A (dueño)');
  if (p.glossary.length < 5 || p.glossary.length > 14) e.push(`glosario con ${p.glossary.length} términos (debe tener 5–14)`);
  if (p.goldenRules.length !== 3) e.push('deben ser exactamente 3 reglas de oro');
  for (const x of p.epp) if (!isEpp(x)) e.push(`EPP desconocido ${x}`);
  for (const h of p.hazards ?? []) if (!isIcon(h.icon)) e.push(`icono de peligro desconocido ${h.icon}`);
  for (const a of p.abnormal) {
    if (!isIcon(a.icon)) e.push(`icono desconocido en condición anormal: ${a.icon}`);
    if (!a.if || !a.do || !a.call) e.push('condición anormal incompleta');
  }
  if (p.steps.length < 4 || p.steps.length > 22) e.push(`número de pasos fuera de rango (${p.steps.length}, debe ser 4–22)`);
  p.steps.forEach((s, i) => {
    const tag = `paso ${s.n ?? i + 1}`;
    if (s.n !== i + 1) e.push(`${tag}: numeración debe ser consecutiva desde 1`);
    if (!roleCodes.includes(s.role)) e.push(`${tag}: el rol ${s.role} no está en roles[]`);
    else if (!['R', 'A'].includes(p.roles.find((r) => r.code === s.role).raci)) e.push(`${tag}: lo ejecuta ${s.role}, que no es R ni A`);
    if (!isIcon(s.icon)) e.push(`${tag}: icono desconocido ${s.icon}`);
    if (!(s.phase >= 0 && s.phase < p.phases.length)) e.push(`${tag}: fase inválida`);
    if (i && s.phase < p.steps[i - 1].phase) e.push(`${tag}: las fases deben ir en orden`);
    if (!s.title || s.title.length > 42) e.push(`${tag}: título vacío o de más de 42 caracteres`);
    if (!s.action || s.action.length > 260) e.push(`${tag}: "action" vacío o de más de 260 caracteres`);
    if (!s.check) e.push(`${tag}: falta "check"`);
    if (s.decision && (!s.decision.question || !s.decision.no)) e.push(`${tag}: decisión incompleta`);
    if (s.decision && s.decision.question.length > 34) e.push(`${tag}: la pregunta de decisión debe tener ≤ 34 caracteres`);
  });
  if (!p.steps.some((s) => s.critical)) e.push('no hay pasos críticos ★');
  const m = laneMetrics(new Set(p.steps.map((s) => s.role)).size);
  for (const s of p.steps) {
    if (wrap(s.title, m.titleChars).length > 3) e.push(`paso ${s.n}: el título no cabe en el diagrama (máx. 3 líneas de ${m.titleChars} caracteres)`);
    if (s.decision && wrap(s.decision.question, m.questionChars).length > 2) e.push(`paso ${s.n}: la pregunta no cabe en el rombo (máx. 2 líneas de ${m.questionChars} caracteres)`);
    if (s.decision && wrap(s.decision.no, m.noChars).length > 3) e.push(`paso ${s.n}: el texto "No" no cabe (máx. 3 líneas de ${m.noChars} caracteres)`);
  }
  const inLanes = new Set(p.steps.map((s) => s.role));
  if (inLanes.size > 6) e.push(`demasiados carriles (${inLanes.size}); máximo 6 puestos ejecutan pasos`);
  for (const c of p.certification) if (!roleCodes.includes(c.role)) e.push(`certificación de rol no listado ${c.role}`);
  return e;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const here = path.dirname(new URL(import.meta.url).pathname);
  const dir = path.resolve(here, '../json');
  const ace = path.resolve(here, '../..');
  const titles = catalogTitles();
  let bad = 0;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    let p;
    try { p = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (err) { console.log('JSON inválido', f, err.message); bad++; continue; }
    const errs = validate(p, titles, ace);
    if (errs.length) { bad++; console.log(`✗ ${f}\n  - ${errs.join('\n  - ')}`); } else console.log(`✓ ${f}`);
  }
  process.exitCode = bad ? 1 : 0;
}
