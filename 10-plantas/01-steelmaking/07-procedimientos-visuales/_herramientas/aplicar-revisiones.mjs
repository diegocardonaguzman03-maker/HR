// Aplica las correcciones de los revisores a json/*.json.
// Cada revisor escribe _revisiones/<revisor>/<código>.json:
//   { "review": {"area","who","status","date"},
//     "changes": [ {"op":"set"|"append"|"delete", "path":"steps[3].stop", "value":..., "reason":"..."} ] }
// Orden de aplicación (el último gana si dos cambian el mismo campo):
//   documentacion → usuario → laboral → seguridad → tecnica
// Uso: node aplicar-revisiones.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const POV = process.env.PLANTA ? path.join(path.resolve(process.env.PLANTA), '07-procedimientos-visuales') : path.resolve(here, '..');
const ORDER = ['documentacion', 'usuario', 'laboral', 'seguridad', 'tecnica'];
const dry = process.argv.includes('--dry');

function parsePath(p) {
  return p.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean).map((k) => (/^\d+$/.test(k) ? Number(k) : k));
}
function apply(obj, ch) {
  const keys = parsePath(ch.path);
  const last = keys.pop();
  let o = obj;
  for (const k of keys) {
    if (o[k] === undefined) throw new Error(`ruta inexistente ${ch.path}`);
    o = o[k];
  }
  if (ch.op === 'delete') {
    if (Array.isArray(o)) o.splice(last, 1); else delete o[last];
  } else if (ch.op === 'append') {
    if (!Array.isArray(o[last])) throw new Error(`${ch.path} no es una lista`);
    o[last].push(ch.value);
  } else o[last] = ch.value;
}

const log = [];
let total = 0;
for (const f of fs.readdirSync(path.join(POV, 'json')).filter((x) => x.endsWith('.json')).sort()) {
  const code = f.replace('.json', '');
  const p = JSON.parse(fs.readFileSync(path.join(POV, 'json', f), 'utf8'));
  for (const rev of ORDER) {
    const rf = path.join(POV, '_revisiones', rev, f);
    if (!fs.existsSync(rf)) continue;
    const r = JSON.parse(fs.readFileSync(rf, 'utf8'));
    // idempotente: si la firma de este revisor ya está en el POV, sus cambios ya se aplicaron
    if (r.review && p.review.some((x) => x.area === r.review.area)) continue;
    // borrados al final y de índice mayor a menor para no mover índices
    const changes = [...(r.changes ?? [])].sort((a, b) => (a.op === 'delete') - (b.op === 'delete') || (b.op === 'delete' ? b.path.localeCompare(a.path, undefined, { numeric: true }) : 0));
    for (const ch of changes) {
      try { apply(p, ch); total++; log.push(`${code}\t${rev}\t${ch.op ?? 'set'}\t${ch.path}\t${ch.reason ?? ''}`); } catch (e) { log.push(`${code}\t${rev}\tERROR\t${ch.path}\t${e.message}`); }
    }
    if (r.review && !p.review.some((x) => x.area === r.review.area)) p.review.push(r.review);
  }
  // renumerar pasos por si un revisor borró o agregó
  p.steps.forEach((s, i) => { s.n = i + 1; });
  if (!dry) fs.writeFileSync(path.join(POV, 'json', f), JSON.stringify(p, null, 2) + '\n');
}
// Bitácora completa de todas las correcciones registradas por los revisores (no depende de la corrida)
if (!dry) {
  const all = [];
  for (const rev of ORDER) {
    const dir = path.join(POV, '_revisiones', rev);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const ch of r.changes ?? []) all.push(`${f.replace('.json', '')}\t${rev}\t${ch.op ?? 'set'}\t${ch.path}\t${String(ch.reason ?? '').replace(/\s+/g, ' ')}`);
    }
  }
  fs.writeFileSync(path.join(POV, '_revisiones', 'cambios-aplicados.tsv'), 'proceso\trevisor\toperación\truta\tmotivo\n' + all.join('\n') + '\n');
}
for (const l of log.filter((x) => x.includes('\tERROR\t'))) console.log(l);
console.log(`${total} cambios aplicados${dry ? ' (simulación)' : ''}; errores: ${log.filter((l) => l.includes('\tERROR\t')).length}`);
