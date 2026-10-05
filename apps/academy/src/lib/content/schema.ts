/**
 * Contrato de contenido de ACERÍA DIGITAL ACADEMY.
 * Todo el contenido industrial vive en src/content/*.json y se valida con estos esquemas
 * (en build con scripts/check-content.mjs y en las pruebas). La UI nunca lleva contenido escrito.
 *
 * Regla: cualquier texto operativo específico de planta que no provenga de un documento aprobado
 * se escribe como "SME_REQUIRED: <qué dato falta>". La UI lo muestra como campo pendiente.
 */
import { z } from 'zod';

export const VALIDATION = ['GENERAL_EDUCATIONAL', 'DEMO', 'SME_REQUIRED', 'DRAFT_NOT_VALIDATED', 'PLANT_APPROVED'] as const;
export const Validation = z.enum(VALIDATION);

const id = (prefix: string) => z.string().regex(new RegExp(`^${prefix}\\.[a-z0-9.-]+$`), `ID debe empezar con "${prefix}."`);
const text = z.string().min(1);
const list = z.array(text);

/** Valor operativo: texto educativo o "SME_REQUIRED: …". */
export const OpValue = text;

export const Source = z.object({
  id: id('src'),
  title: text,
  kind: z.enum(['plant-draft', 'industry-general', 'demo', 'plant-approved']),
  status: Validation,
  path: z.string().optional(),
  note: z.string().optional(),
});

export const Camera = z.object({ position: z.tuple([z.number(), z.number(), z.number()]), target: z.tuple([z.number(), z.number(), z.number()]) });

export const ProcessStage = z.object({
  id: id('stage'),
  order: z.number().int().min(1),
  code: z.string().regex(/^\d\d$/),
  name: text,
  shortName: text,
  summary: text,
  purpose: text,
  inputs: list,
  outputs: list,
  equipmentIds: z.array(id('eq')),
  variables: z.array(z.object({ name: text, why: text, value: OpValue })),
  operatorDecisions: list,
  dependencies: list,
  hazardIds: z.array(id('haz')),
  nextStageId: id('stage').nullable(),
  camera: Camera,
  status: Validation,
  sourceIds: z.array(id('src')),
});

export const Component = z.object({
  id: id('cmp'),
  name: text,
  function: text,
  nodeName: z.string().optional(),
  failureModes: list.default([]),
  inspectionPoints: list.default([]),
});

export const Equipment = z.object({
  id: id('eq'),
  name: text,
  shortName: text,
  hotspotNumber: z.number().int().min(1),
  nodeNames: z.array(z.string().regex(/^eaf__[a-z0-9_]+$/)).min(1),
  stageIds: z.array(id('stage')),
  summary: text,
  function: text,
  howItWorks: list,
  components: z.array(Component),
  energySources: list,
  inputs: list,
  outputs: list,
  actuators: list,
  sensors: list,
  controlSignals: list,
  movements: list,
  dependencies: list,
  hazardIds: z.array(id('haz')),
  operationalNotes: list,
  commonMistakes: list.default([]),
  observableSignals: list.default([]),
  maintenance: z.object({ failureModes: list, inspectionPoints: list, considerations: list }),
  documentIds: z.array(id('doc')).default([]),
  videoIds: z.array(id('vid')).default([]),
  learningModuleIds: z.array(id('mod')).default([]),
  status: Validation,
  sourceIds: z.array(id('src')),
});

export const Control = z.object({
  type: z.enum(['elimination', 'substitution', 'engineering', 'administrative', 'ppe']),
  text: text,
});

export const Hazard = z.object({
  id: id('haz'),
  name: text,
  category: z.enum(['molten-metal', 'electrical', 'stored-energy', 'hydraulic', 'oxygen', 'gas', 'water-molten-metal', 'thermal', 'height', 'confined-space', 'mobile-equipment', 'line-of-fire', 'noise-dust', 'suspended-load']),
  severity: z.enum(['critical', 'high', 'medium']),
  description: text,
  consequence: text,
  controls: z.array(Control).min(1),
  ppe: list,
  exclusionZone: OpValue,
  interlock: OpValue,
  permit: OpValue,
  stopCondition: OpValue,
  escalation: OpValue,
  equipmentIds: z.array(id('eq')),
  stageIds: z.array(id('stage')),
  status: Validation,
  sourceIds: z.array(id('src')),
});

export const Hotspot = z.object({
  id: id('hs'),
  number: z.number().int().min(1),
  label: text,
  kind: z.enum(['equipment', 'hazard', 'process', 'inspection']),
  targetId: z.string(),
  nodeName: z.string().regex(/^eaf__[a-z0-9_]+$/),
});

export const WorkInstruction = z.object({
  id: id('wi'),
  title: text,
  purpose: text,
  role: text,
  status: Validation,
  equipmentIds: z.array(id('eq')),
  hazardIds: z.array(id('haz')),
  prerequisites: list,
  ppe: list,
  tools: list,
  steps: z.array(z.object({
    n: z.number().int().min(1),
    title: text,
    action: text,
    why: text,
    visual: z.string().optional(),
    check: text,
    expected: text,
    warning: z.string().optional(),
    commonError: z.string().optional(),
    escalation: z.string().optional(),
  })).min(3),
  completion: list,
  documentIds: z.array(id('doc')),
  sourceIds: z.array(id('src')),
});

export const Lesson = z.object({
  id: id('les'),
  title: text,
  stageId: id('stage').optional(),
  focus: z.array(z.string()).default([]),
  camera: Camera.optional(),
  body: list,
  keyPoints: list,
  checkIds: z.array(id('q')).default([]),
});

export const TrainingModule = z.object({
  id: id('mod'),
  title: text,
  summary: text,
  levels: z.array(z.number().int().min(1).max(5)).min(1),
  durationMin: z.number().int().min(1),
  objectives: list,
  lessons: z.array(Lesson).min(1),
  workInstructionIds: z.array(id('wi')).default([]),
  assessmentId: id('asm').optional(),
  status: Validation,
  sourceIds: z.array(id('src')),
});

const QBase = { id: id('q'), prompt: text, topic: text, explanation: text, level: z.number().int().min(1).max(5) };
export const Question = z.discriminatedUnion('kind', [
  z.object({ ...QBase, kind: z.literal('mcq'), options: z.array(text).min(2), answer: z.number().int().min(0) }),
  z.object({ ...QBase, kind: z.literal('identify'), answerEquipmentId: id('eq') }),
  z.object({ ...QBase, kind: z.literal('order'), items: z.array(text).min(3), correctOrder: z.array(z.number().int()) }),
  z.object({ ...QBase, kind: z.literal('match'), pairs: z.array(z.object({ left: text, right: text })).min(2) }),
]);

export const Assessment = z.object({
  id: id('asm'),
  title: text,
  passScore: z.number().min(0).max(1),
  questionIds: z.array(id('q')).min(3),
  recommendations: z.array(z.object({ topic: text, moduleId: id('mod') })),
  status: Validation,
});

export const DocumentItem = z.object({
  id: id('doc'),
  title: text,
  type: z.enum(['SOP', 'WI', 'Checklist', 'JobAid', 'TrainingGuide', 'TechnicalManual', 'SafetyProcedure']),
  status: Validation,
  owner: text,
  version: text,
  approvalDate: z.string().nullable(),
  file: z.string(),
  description: text,
  processIds: z.array(id('stage')),
  equipmentIds: z.array(id('eq')),
  roles: list,
  moduleIds: z.array(id('mod')),
});

export const Video = z.object({
  id: id('vid'),
  title: text,
  file: z.string(),
  captions: z.string(),
  durationSec: z.number().positive(),
  chapters: z.array(z.object({ t: z.number().min(0), title: text })),
  status: Validation,
  equipmentIds: z.array(id('eq')),
  stageIds: z.array(id('stage')),
});

export const GlossaryTerm = z.object({ term: text, definition: text, status: Validation });

export const ContentBundle = z.object({
  sources: z.array(Source),
  processes: z.array(ProcessStage),
  equipment: z.array(Equipment),
  hazards: z.array(Hazard),
  hotspots: z.array(Hotspot),
  workInstructions: z.array(WorkInstruction),
  training: z.array(TrainingModule),
  questions: z.array(Question),
  assessments: z.array(Assessment),
  documents: z.array(DocumentItem),
  videos: z.array(Video),
  glossary: z.array(GlossaryTerm),
});

export type ValidationStatus = z.infer<typeof Validation>;
export type SourceT = z.infer<typeof Source>;
export type ProcessStageT = z.infer<typeof ProcessStage>;
export type EquipmentT = z.infer<typeof Equipment>;
export type HazardT = z.infer<typeof Hazard>;
export type HotspotT = z.infer<typeof Hotspot>;
export type WorkInstructionT = z.infer<typeof WorkInstruction>;
export type TrainingModuleT = z.infer<typeof TrainingModule>;
export type LessonT = z.infer<typeof Lesson>;
export type QuestionT = z.infer<typeof Question>;
export type AssessmentT = z.infer<typeof Assessment>;
export type DocumentT = z.infer<typeof DocumentItem>;
export type VideoT = z.infer<typeof Video>;
export type GlossaryTermT = z.infer<typeof GlossaryTerm>;
export type ContentBundleT = z.infer<typeof ContentBundle>;

/** Verdadero si el texto es un pendiente de experto de planta. */
export const isSmeRequired = (s: string | undefined) => !!s && /^SME_REQUIRED\b/.test(s);

/** Referencias cruzadas: devuelve errores legibles (IDs que no existen, hotspots sin equipo, etc.). */
export function crossCheck(c: ContentBundleT, nodeNames?: Set<string>): string[] {
  const e: string[] = [];
  const ids = (arr: { id: string }[]) => new Set(arr.map((x) => x.id));
  const S = ids(c.sources), P = ids(c.processes), EQ = ids(c.equipment), H = ids(c.hazards), W = ids(c.workInstructions),
    M = ids(c.training), Q = ids(c.questions), A = ids(c.assessments), D = ids(c.documents), V = ids(c.videos);
  const need = (set: Set<string>, ref: string, where: string) => { if (!set.has(ref)) e.push(`${where}: referencia inexistente ${ref}`); };
  for (const all of [c.sources, c.processes, c.equipment, c.hazards, c.hotspots, c.workInstructions, c.training, c.questions, c.assessments, c.documents, c.videos] as { id: string }[][]) {
    const seen = new Set<string>();
    for (const x of all) { if (seen.has(x.id)) e.push(`ID duplicado ${x.id}`); seen.add(x.id); }
  }
  for (const p of c.processes) {
    p.equipmentIds.forEach((r) => need(EQ, r, p.id)); p.hazardIds.forEach((r) => need(H, r, p.id)); p.sourceIds.forEach((r) => need(S, r, p.id));
    if (p.nextStageId) need(P, p.nextStageId, p.id);
  }
  for (const q of c.equipment) {
    q.stageIds.forEach((r) => need(P, r, q.id)); q.hazardIds.forEach((r) => need(H, r, q.id)); q.documentIds.forEach((r) => need(D, r, q.id));
    q.videoIds.forEach((r) => need(V, r, q.id)); q.learningModuleIds.forEach((r) => need(M, r, q.id)); q.sourceIds.forEach((r) => need(S, r, q.id));
    if (nodeNames) q.nodeNames.forEach((n) => { if (!nodeNames.has(n)) e.push(`${q.id}: nodo 3D inexistente ${n}`); });
  }
  for (const h of c.hazards) { h.equipmentIds.forEach((r) => need(EQ, r, h.id)); h.stageIds.forEach((r) => need(P, r, h.id)); h.sourceIds.forEach((r) => need(S, r, h.id)); }
  for (const hs of c.hotspots) {
    const set = hs.kind === 'equipment' ? EQ : hs.kind === 'hazard' ? H : hs.kind === 'process' ? P : EQ;
    need(set, hs.targetId, hs.id);
    if (nodeNames && !nodeNames.has(hs.nodeName)) e.push(`${hs.id}: nodo 3D inexistente ${hs.nodeName}`);
  }
  for (const w of c.workInstructions) { w.equipmentIds.forEach((r) => need(EQ, r, w.id)); w.hazardIds.forEach((r) => need(H, r, w.id)); w.documentIds.forEach((r) => need(D, r, w.id)); w.sourceIds.forEach((r) => need(S, r, w.id)); if (w.status === 'PLANT_APPROVED') e.push(`${w.id}: no puede estar PLANT_APPROVED sin firma del Validation Board`); }
  for (const m of c.training) {
    m.workInstructionIds.forEach((r) => need(W, r, m.id)); if (m.assessmentId) need(A, m.assessmentId, m.id); m.sourceIds.forEach((r) => need(S, r, m.id));
    for (const l of m.lessons) { if (l.stageId) need(P, l.stageId, l.id); l.checkIds.forEach((r) => need(Q, r, l.id)); }
  }
  for (const q of c.questions) {
    if (q.kind === 'mcq' && q.answer >= q.options.length) e.push(`${q.id}: respuesta fuera de rango`);
    if (q.kind === 'identify') need(EQ, q.answerEquipmentId, q.id);
    if (q.kind === 'order' && [...q.correctOrder].sort().join() !== q.items.map((_, i) => i).join()) e.push(`${q.id}: correctOrder no es una permutación de items`);
  }
  for (const a of c.assessments) { a.questionIds.forEach((r) => need(Q, r, a.id)); a.recommendations.forEach((r) => need(M, r.moduleId, a.id)); }
  for (const d of c.documents) { d.processIds.forEach((r) => need(P, r, d.id)); d.equipmentIds.forEach((r) => need(EQ, r, d.id)); d.moduleIds.forEach((r) => need(M, r, d.id)); if (d.status === 'PLANT_APPROVED' && !d.approvalDate) e.push(`${d.id}: aprobado sin fecha`); }
  for (const v of c.videos) { v.equipmentIds.forEach((r) => need(EQ, r, v.id)); v.stageIds.forEach((r) => need(P, r, v.id)); }
  return e;
}
