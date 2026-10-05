/** Carga y valida el contenido una sola vez; expone índices de búsqueda por ID y por nodo 3D. */
import { ContentBundle, crossCheck, type ContentBundleT, type EquipmentT } from './schema';
import sources from '../../content/sources.json';
import processes from '../../content/processes.json';
import equipment from '../../content/equipment.json';
import hazards from '../../content/hazards.json';
import hotspots from '../../content/hotspots.json';
import workInstructions from '../../content/work-instructions.json';
import training from '../../content/training.json';
import questions from '../../content/questions.json';
import assessments from '../../content/assessments.json';
import documents from '../../content/documents.json';
import videos from '../../content/videos.json';
import glossary from '../../content/glossary.json';

export const raw = { sources, processes, equipment, hazards, hotspots, workInstructions, training, questions, assessments, documents, videos, glossary };

function load(): ContentBundleT {
  const r = ContentBundle.safeParse(raw);
  if (!r.success) {
    // El build valida antes (check:content); aquí solo se protege la ejecución.
    console.error('Contenido inválido', r.error.issues.slice(0, 10));
    throw new Error('El contenido de la academia no pasó la validación de esquema.');
  }
  const errs = crossCheck(r.data);
  if (errs.length) console.warn('Referencias de contenido con errores:', errs);
  return r.data;
}

export const content = load();

const byId = <T extends { id: string }>(arr: T[]) => new Map(arr.map((x) => [x.id, x] as const));
export const idx = {
  source: byId(content.sources),
  stage: byId(content.processes),
  equipment: byId(content.equipment),
  hazard: byId(content.hazards),
  hotspot: byId(content.hotspots),
  wi: byId(content.workInstructions),
  module: byId(content.training),
  question: byId(content.questions),
  assessment: byId(content.assessments),
  document: byId(content.documents),
  video: byId(content.videos),
};

/** nodo 3D de sistema (eaf__x) → equipo */
export const equipmentByNode = new Map<string, EquipmentT>();
for (const e of content.equipment) for (const n of e.nodeNames) equipmentByNode.set(n, e);

/** Sube por el nombre de nodo (eaf__arms_clamp → eaf__arms) hasta encontrar un equipo. */
export function equipmentForNode(name: string): EquipmentT | undefined {
  if (equipmentByNode.has(name)) return equipmentByNode.get(name);
  const m = /^(eaf__[a-z0-9]+)_/.exec(name);
  return m ? equipmentByNode.get(m[1]) : undefined;
}

export const stagesOrdered = [...content.processes].sort((a, b) => a.order - b.order);
export const equipmentOrdered = [...content.equipment].sort((a, b) => a.hotspotNumber - b.hotspotNumber);
