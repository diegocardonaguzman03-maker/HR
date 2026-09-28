// Títulos de los procesos del catálogo CAT-ACE-001 (para ligas "viene de / sigue").
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
export const ACE = path.resolve(here, '../..'); // 10-plantas/01-steelmaking

export function catalogTitles() {
  const md = fs.readFileSync(path.join(ACE, '00-catalogo-procesos-y-roles.md'), 'utf8');
  const t = {};
  for (const m of md.matchAll(/^\|\s*((?:MO|MM|MS)-[A-Z0-9]+-\d+)\s*\|\s*([^|]+)\|/gm)) t[m[1]] = m[2].trim().replace(/\s*\(.*$/, '');
  return t;
}
