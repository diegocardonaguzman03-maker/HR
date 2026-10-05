import fs from 'node:fs';
import path from 'node:path';
import { ContentBundle, crossCheck } from '../src/lib/content/schema';

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
const parsed = ContentBundle.safeParse(raw);
if (!parsed.success) {
  for (const i of parsed.error.issues.slice(0, 60)) console.log(`✗ ${i.path.join('.')}: ${i.message}`);
  console.log(`\n${parsed.error.issues.length} errores de esquema`);
  process.exit(1);
}
let nodes: Set<string> | undefined;
const nodeFile = path.resolve('public/models/eaf.nodes.json');
if (fs.existsSync(nodeFile)) nodes = new Set(JSON.parse(fs.readFileSync(nodeFile, 'utf8')) as string[]);
const errs = crossCheck(parsed.data, nodes);
for (const e of errs) console.log(`✗ ${e}`);
const c = parsed.data;
const sme = JSON.stringify(c).match(/SME_REQUIRED/g)?.length ?? 0;
console.log(`\nContenido: ${c.processes.length} etapas · ${c.equipment.length} equipos · ${c.hazards.length} peligros · ${c.hotspots.length} hotspots · ${c.workInstructions.length} WI · ${c.training.length} módulos · ${c.questions.length} preguntas · ${c.documents.length} documentos · ${c.videos.length} videos · ${sme} campos SME_REQUIRED${nodes ? '' : ' · (sin lista de nodos 3D)'}`);
if (errs.length || missing) { console.log(`${errs.length} errores de referencias, ${missing} archivos faltantes`); process.exit(1); }
console.log('✓ Contenido válido');
