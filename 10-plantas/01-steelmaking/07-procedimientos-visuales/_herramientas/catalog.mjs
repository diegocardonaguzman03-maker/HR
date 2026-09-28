// Títulos de los procesos del catálogo CAT-ACE-001 (para ligas "viene de / sigue").
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
// Planta a documentar: por omisión la Acería. Para otra planta: PLANTA=/ruta/10-plantas/02-peletizadora node render.mjs
export const ACE = process.env.PLANTA ? path.resolve(process.env.PLANTA) : path.resolve(here, '../..');
export const POV = path.join(ACE, '07-procedimientos-visuales');

export function catalogTitles() {
  const md = fs.readFileSync(path.join(ACE, '00-catalogo-procesos-y-roles.md'), 'utf8');
  const t = {};
  for (const m of md.matchAll(/^\|\s*((?:MO|MM|MS)-[A-Z0-9]+-\d+)\s*\|\s*([^|]+)\|/gm)) t[m[1]] = m[2].trim().replace(/\s*\(.*$/, '');
  return t;
}
