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
    /** RT-SW-15: paso de paro (ALTO). Si falta, la UI lo deduce del título. */
    stop: z.boolean().optional(),
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
  /** TRN-01 / SAF-09: preguntas de seguridad eliminatorias (todas deben estar bien para aprobar). */
  criticalQuestionIds: z.array(id('q')).default([]),
  /** TRN-01: preguntas que se muestran pero no cuentan para la calificación (p. ej. alcance de la plataforma). */
  unscoredQuestionIds: z.array(id('q')).default([]),
  /** TRN-10: la recomendación lleva a la lección exacta cuando trae lessonId. */
  recommendations: z.array(z.object({ topic: text, moduleId: id('mod'), lessonId: id('les').optional() })),
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

const MARK_G = /(SME_REQUIRED|PLACEHOLDER\s*[—-]\s*REQUIRES PLANT VALIDATION)\s*:?/g;
/** Mínimo de caracteres útiles después de una marca: qué dato falta y quién lo da (§3.7 de review-seguridad). */
export const MIN_MARK_DETAIL = 15;

/**
 * Marcas SME_REQUIRED / PLACEHOLDER vacías: la marca va seguida de menos de 15 caracteres
 * (sin contar un paréntesis) o solo de un paréntesis. Devuelve «ruta: texto».
 * Solo cuenta como marca la que inicia el texto o va después de «:», «.», «;» o «(» — no la mención en una frase.
 */
export function emptyMarks(value: unknown, path = ''): string[] {
  const out: string[] = [];
  const walk = (v: unknown, p: string) => {
    if (typeof v === 'string') {
      for (const m of v.matchAll(MARK_G)) {
        const at = m.index ?? 0;
        const prev = v.slice(0, at).trimEnd();
        if (prev && !/[:.;(—-]$/.test(prev)) continue; // mención dentro de una frase («los pasos marcados SME_REQUIRED…»)
        const rest = v.slice(at + m[0].length);
        const next = rest.search(MARK_G);
        const detail = (next >= 0 ? rest.slice(0, next) : rest).replace(/\([^)]*\)/g, '').replace(/[\s.;:,—-]+/g, ' ').trim();
        if (detail.length < MIN_MARK_DETAIL) out.push(`${p}: marca ${m[1].startsWith('SME') ? 'SME_REQUIRED' : 'PLACEHOLDER'} vacía (falta qué dato y quién lo valida) «${v.slice(Math.max(0, at - 30), at + m[0].length + 20)}»`);
      }
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, p ? `${p}.${k}` : k);
  };
  walk(value, path);
  return out;
}

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

  // SAF-16: nada puede estar PLANT_APPROVED en el MVP, en ninguna colección, sin la firma del Validation Board.
  const statusOf: [string, { id?: string; term?: string; status: ValidationStatus }[]][] = [
    ['sources', c.sources], ['processes', c.processes], ['equipment', c.equipment], ['hazards', c.hazards], ['workInstructions', c.workInstructions],
    ['training', c.training], ['assessments', c.assessments], ['documents', c.documents], ['videos', c.videos], ['glossary', c.glossary],
  ];
  for (const [col, arr] of statusOf) for (const x of arr) if (x.status === 'PLANT_APPROVED') e.push(`${x.id ?? `${col}:${x.term}`}: PLANT_APPROVED no permitido en el MVP sin firma del Validation Board (ADX-04 + C-16)`);
  for (const s of c.sources) if (s.kind === 'plant-approved') e.push(`${s.id}: fuente plant-approved no permitida en el MVP sin firma del Validation Board`);

  // §3.7: marcas SME_REQUIRED / PLACEHOLDER vacías
  e.push(...emptyMarks(c));

  for (const p of c.processes) {
    p.equipmentIds.forEach((r) => need(EQ, r, p.id)); p.hazardIds.forEach((r) => need(H, r, p.id)); p.sourceIds.forEach((r) => need(S, r, p.id));
    if (p.nextStageId) need(P, p.nextStageId, p.id);
  }
  for (const q of c.equipment) {
    q.stageIds.forEach((r) => need(P, r, q.id)); q.hazardIds.forEach((r) => need(H, r, q.id)); q.documentIds.forEach((r) => need(D, r, q.id));
    q.videoIds.forEach((r) => need(V, r, q.id)); q.learningModuleIds.forEach((r) => need(M, r, q.id)); q.sourceIds.forEach((r) => need(S, r, q.id));
    if (nodeNames) {
      q.nodeNames.forEach((n) => { if (!nodeNames.has(n)) e.push(`${q.id}: nodo 3D inexistente ${n}`); });
      q.components.forEach((k) => { if (k.nodeName && !nodeNames.has(k.nodeName)) e.push(`${q.id}/${k.id}: nodo 3D inexistente ${k.nodeName}`); });
    }
    // RT-SW-01 / SW-01b: el hotspot del equipo apunta a uno de sus nodos (contrato equipo → nodo)
    if (!c.hotspots.some((h) => h.targetId === q.id && q.nodeNames.includes(h.nodeName))) e.push(`${q.id}: ningún hotspot apunta a su nodo ${q.nodeNames[0]}`);
  }
  const nums = c.equipment.map((x) => x.hotspotNumber);
  if (new Set(nums).size !== nums.length) e.push('equipment: hotspotNumber duplicado');
  for (const h of c.hazards) { h.equipmentIds.forEach((r) => need(EQ, r, h.id)); h.stageIds.forEach((r) => need(P, r, h.id)); h.sourceIds.forEach((r) => need(S, r, h.id)); }
  for (const hs of c.hotspots) {
    const set = hs.kind === 'equipment' ? EQ : hs.kind === 'hazard' ? H : hs.kind === 'process' ? P : EQ;
    need(set, hs.targetId, hs.id);
    if (nodeNames && !nodeNames.has(hs.nodeName)) e.push(`${hs.id}: nodo 3D inexistente ${hs.nodeName}`);
  }
  for (const w of c.workInstructions) {
    w.equipmentIds.forEach((r) => need(EQ, r, w.id)); w.hazardIds.forEach((r) => need(H, r, w.id)); w.documentIds.forEach((r) => need(D, r, w.id)); w.sourceIds.forEach((r) => need(S, r, w.id));
    const ns = w.steps.map((s) => s.n); if (new Set(ns).size !== ns.length) e.push(`${w.id}: pasos con n repetido`);
  }
  const lessonModule = new Map<string, string>();
  const checkIds = new Map<string, string>();
  for (const m of c.training) {
    m.workInstructionIds.forEach((r) => need(W, r, m.id)); if (m.assessmentId) need(A, m.assessmentId, m.id); m.sourceIds.forEach((r) => need(S, r, m.id));
    for (const l of m.lessons) {
      lessonModule.set(l.id, m.id);
      if (l.stageId) need(P, l.stageId, l.id);
      l.checkIds.forEach((r) => { need(Q, r, l.id); checkIds.set(r, l.id); });
      if (nodeNames) l.focus.forEach((f) => { if (!nodeNames.has(f)) e.push(`${l.id}: focus con nodo 3D inexistente ${f}`); });
    }
  }
  for (const q of c.questions) {
    if (q.kind === 'mcq' && q.answer >= q.options.length) e.push(`${q.id}: respuesta fuera de rango`);
    if (q.kind === 'identify') need(EQ, q.answerEquipmentId, q.id);
    // RT-SW-10: orden numérico (con 11+ elementos el orden lexicográfico daba un error falso)
    if (q.kind === 'order' && [...q.correctOrder].sort((a, b) => a - b).join() !== q.items.map((_, i) => i).join()) e.push(`${q.id}: correctOrder no es una permutación de items`);
  }
  const topicOf = new Map(c.questions.map((q) => [q.id, q.topic] as const));
  for (const a of c.assessments) {
    a.questionIds.forEach((r) => need(Q, r, a.id));
    const inAsm = new Set(a.questionIds);
    if (inAsm.size !== a.questionIds.length) e.push(`${a.id}: pregunta repetida en questionIds`);
    // TRN-01: critical y unscored son subconjuntos de questionIds y no se cruzan
    a.criticalQuestionIds.forEach((r) => { if (!inAsm.has(r)) e.push(`${a.id}: criticalQuestionIds incluye ${r}, que no está en questionIds`); });
    a.unscoredQuestionIds.forEach((r) => { if (!inAsm.has(r)) e.push(`${a.id}: unscoredQuestionIds incluye ${r}, que no está en questionIds`); });
    a.criticalQuestionIds.forEach((r) => { if (a.unscoredQuestionIds.includes(r)) e.push(`${a.id}: ${r} no puede ser crítica y no calificada a la vez`); });
    if (a.unscoredQuestionIds.length >= a.questionIds.length) e.push(`${a.id}: no quedan preguntas calificadas`);
    // TRN-02: un ítem de la evaluación no se practica antes con respuesta en una lección (salvo los no calificados)
    for (const r of a.questionIds) if (checkIds.has(r) && !a.unscoredQuestionIds.includes(r)) e.push(`${a.id}: ${r} ya aparece como ejercicio en ${checkIds.get(r)} (usa un ítem paralelo)`);
    // TRN-10: recomendaciones con módulo, lección del mismo módulo y alguna pregunta de ese tema
    for (const rec of a.recommendations) {
      need(M, rec.moduleId, a.id);
      if (rec.lessonId && lessonModule.get(rec.lessonId) !== rec.moduleId) e.push(`${a.id}: la lección ${rec.lessonId} de la recomendación «${rec.topic}» no está en ${rec.moduleId}`);
      if (!a.questionIds.some((q) => topicOf.get(q) === rec.topic)) e.push(`${a.id}: recomendación sin pregunta del tema «${rec.topic}»`);
    }
  }
  for (const d of c.documents) { d.processIds.forEach((r) => need(P, r, d.id)); d.equipmentIds.forEach((r) => need(EQ, r, d.id)); d.moduleIds.forEach((r) => need(M, r, d.id)); if (d.status === 'PLANT_APPROVED' && !d.approvalDate) e.push(`${d.id}: aprobado sin fecha`); }
  for (const v of c.videos) {
    v.equipmentIds.forEach((r) => need(EQ, r, v.id)); v.stageIds.forEach((r) => need(P, r, v.id));
    if (v.chapters.some((ch, i) => i > 0 && ch.t < v.chapters[i - 1].t)) e.push(`${v.id}: capítulos desordenados`);
  }
  return e;
}
