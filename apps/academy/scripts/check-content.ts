import fs from 'node:fs';
import path from 'node:path';
import { ContentBundle, crossCheck, emptyMarks } from '../src/lib/content/schema';

const dir = path.resolve('src/content');
const files: Record<string, string> = {
  sources: 'sources.json', processes: 'processes.json', equipment: 'equipment.json', hazards: 'hazards.json',
  hotspots: 'hotspots.json', workInstructions: 'work-instructions.json', training: 'training.json', questions: 'questions.json',
  assessments: 'assessments.json', documents: 'documents.json', videos: 'videos.json', glossary: 'glossary.json',
};
const raw: Record<string, unknown> = {};
let missing = 0;
for (const [k, f] of Object.entries(files)) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) { console.log(`✗ falta ${f}`); missing++; raw[k] = []; continue; }
  try { raw[k] = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`✗ ${f}: JSON inválido — ${(e as Error).message}`); process.exit(1); }
}
// §3.7 (review-seguridad): marcas SME_REQUIRED / PLACEHOLDER vacías, con la ruta del archivo.
// Se revisan sobre el JSON crudo para dar la ubicación exacta; crossCheck aplica la misma regla.
const empty = Object.entries(raw).flatMap(([k, v]) => emptyMarks(v, files[k]));
for (const e of empty) console.log(`✗ ${e}`);
const parsed = ContentBundle.safeParse(raw);
if (!parsed.success) {
  for (const i of parsed.error.issues.slice(0, 60)) console.log(`✗ ${i.path.join('.')}: ${i.message}`);
  console.log(`\n${parsed.error.issues.length} errores de esquema`);
  process.exit(1);
}
let nodes: Set<string> | undefined;
const nodeFile = path.resolve('public/models/eaf.nodes.json');
if (fs.existsSync(nodeFile)) nodes = new Set(JSON.parse(fs.readFileSync(nodeFile, 'utf8')) as string[]);
// crossCheck incluye las marcas vacías (ya listadas arriba con su archivo): no se repiten.
const errs = crossCheck(parsed.data, nodes).filter((e) => !/marca (SME_REQUIRED|PLACEHOLDER) vacía/.test(e));
for (const e of errs) console.log(`✗ ${e}`);
const c = parsed.data;
const sme = JSON.stringify(c).match(/SME_REQUIRED/g)?.length ?? 0;
console.log(`\nContenido: ${c.processes.length} etapas · ${c.equipment.length} equipos · ${c.hazards.length} peligros · ${c.hotspots.length} hotspots · ${c.workInstructions.length} WI · ${c.training.length} módulos · ${c.questions.length} preguntas · ${c.documents.length} documentos · ${c.videos.length} videos · ${sme} campos SME_REQUIRED${nodes ? '' : ' · (sin lista de nodos 3D)'}`);
if (errs.length || missing || empty.length) { console.log(`${errs.length} errores de referencias y reglas, ${empty.length} marcas SME_REQUIRED vacías, ${missing} archivos faltantes`); process.exit(1); }
console.log('✓ Contenido válido');
