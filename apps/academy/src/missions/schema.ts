/**
 * MOTOR DE MISIONES — contrato de contenido.
 * Una misión = escenario 3D (objetos con ID) + pasos de 8 tipos reutilizables.
 * Agregar un proceso nuevo (LOTO, espacios confinados, grúas, EAF…) = escribir JSON, no código.
 *
 * Regla de contenido: lo específico de planta (procedimiento, límites, capacidades, permisos, rescate…)
 * se escribe "SME_REQUIRED: …" y se muestra como pendiente de validación.
 */
import { z } from 'zod';
import { Validation } from '../lib/content/schema';

const text = z.string().min(1);
const vec3 = z.tuple([z.number(), z.number(), z.number()]);
export const Camera = z.object({ position: vec3, target: vec3 });

/* ---------- escenario ---------- */
export const SCENE_KINDS = [
  'floor', 'platform', 'ladder', 'guardrail', 'opening', 'edge', 'powerline', 'spill', 'tools', 'person', 'barricade',
  'anchor', 'pipe', 'cabletray', 'bench', 'harness', 'lanyard', 'helmet', 'permitboard', 'luminaire', 'sign', 'wall', 'column',
] as const;
export const SceneObject = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(SCENE_KINDS),
  label: text,
  desc: z.string().optional(), // descripción de lo que se ve (alternativa no visual, SAF-H-06)
  position: vec3,
  rotation: vec3.default([0, 0, 0]),
  scale: vec3.default([1, 1, 1]),
  props: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export const SceneDef = z.object({ id: z.string(), objects: z.array(SceneObject).min(1), home: Camera });

/* ---------- pasos ---------- */
const TourStop = z.object({ camera: Camera, focus: z.array(z.string()).default([]), caption: text });
const Faq = z.object({ q: text, a: text });
const Option = z.object({ id: z.string(), label: text, correct: z.boolean(), feedback: text, objectId: z.string().optional() });

const StepBase = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: text, // verbo corto: «Identifica los peligros»
  instruction: text, // NIVEL 1 — qué hacer ahora (1–2 frases)
  why: text, // NIVEL 2 — ¿Por qué? (1–2 frases)
  camera: Camera,
  mastery: z.string(),
  show: z.array(TourStop).default([]), // SHOW ME — demostración breve en el escenario
  faq: z.array(Faq).default([]), // «Pregunta sobre este paso» (respuestas curadas, sin texto libre)
  safety: z.string().optional(), // nota de seguridad contextual (puede llevar SME_REQUIRED)
  reference: z.array(z.string()).default([]), // IDs de sección del procedimiento (NIVEL 3)
  done: text, // mensaje al completar: «Correcto. …»
  critical: z.boolean().default(false), // un error aquí podría ser fatal en planta (SAF-H-04)
};

export const Step = z.discriminatedUnion('type', [
  z.object({ ...StepBase, type: z.literal('observe'), tour: z.array(TourStop).min(1), confirm: text }),
  z.object({
    ...StepBase, type: z.literal('identify'),
    targets: z.array(z.object({ objectId: z.string(), label: text, why: text, control: text })).min(1),
    distractors: z.array(z.object({ objectId: z.string(), feedback: text })).default([]),
    required: z.number().int().min(1),
    hint: text,
  }),
  z.object({
    ...StepBase, type: z.literal('confirm'),
    prompt: text,
    items: z.array(z.object({ id: z.string(), label: text, detail: text, required: z.boolean(), feedback: text })).min(2),
  }),
  z.object({
    ...StepBase, type: z.literal('inspect'),
    objectId: z.string(),
    zones: z.array(z.object({ id: z.string(), label: text, observation: text, defect: z.boolean(), finding: text })).min(2),
    decision: z.object({ prompt: text, options: z.array(Option).min(2) }),
  }),
  z.object({ ...StepBase, type: z.literal('select'), prompt: text, options: z.array(Option).min(2) }),
  z.object({ ...StepBase, type: z.literal('sequence'), prompt: text, items: z.array(z.object({ id: z.string(), label: text })).min(3), hint: text }),
  z.object({ ...StepBase, type: z.literal('decide'), scenario: text, sceneChange: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}), options: z.array(Option).min(2) }),
  z.object({ ...StepBase, type: z.literal('demonstrate'), actions: z.array(z.object({ objectId: z.string(), label: text, feedback: text })).min(1) }),
]);

export const Mission = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  course: text,
  number: z.string(),
  title: text,
  subtitle: text,
  objective: text,
  estimatedMin: z.number().int().min(1),
  status: Validation,
  sceneId: z.string(),
  masteryAreas: z.array(z.object({ id: z.string(), label: text, review: text })).min(1),
  steps: z.array(Step).min(1),
  procedure: z.object({ title: text, status: Validation, note: text, sections: z.array(z.object({ id: z.string(), title: text, items: z.array(text) })) }),
  video: z.object({ title: text, caption: text }),
});

export const Course = z.object({
  id: z.string(),
  title: text,
  missions: z.array(z.object({ id: z.string(), number: z.string(), title: text, available: z.boolean(), note: z.string().optional() })),
});

export type SceneObjectT = z.infer<typeof SceneObject>;
export type SceneDefT = z.infer<typeof SceneDef>;
export type StepT = z.infer<typeof Step>;
export type MissionT = z.infer<typeof Mission>;
export type CourseT = z.infer<typeof Course>;
export type CameraT = z.infer<typeof Camera>;

/** Validación cruzada: IDs de objetos del escenario, áreas de dominio y secciones del procedimiento. */
export function checkMission(m: MissionT, scene: SceneDefT): string[] {
  const e: string[] = [];
  const objs = new Set(scene.objects.map((o) => o.id));
  const areas = new Set(m.masteryAreas.map((a) => a.id));
  const secs = new Set(m.procedure.sections.map((s) => s.id));
  const obj = (id: string | undefined, where: string) => { if (id && !objs.has(id)) e.push(`${where}: objeto inexistente ${id}`); };
  const seen = new Set<string>();
  for (const s of m.steps) {
    if (seen.has(s.id)) e.push(`paso duplicado ${s.id}`); seen.add(s.id);
    if (!areas.has(s.mastery)) e.push(`${s.id}: área de dominio inexistente ${s.mastery}`);
    s.reference.forEach((r) => { if (!secs.has(r)) e.push(`${s.id}: sección inexistente ${r}`); });
    s.show.forEach((t) => t.focus.forEach((f) => obj(f, `${s.id}.show`)));
    if (s.type === 'observe') s.tour.forEach((t) => t.focus.forEach((f) => obj(f, `${s.id}.tour`)));
    if (s.type === 'identify') {
      s.targets.forEach((t) => obj(t.objectId, s.id)); s.distractors.forEach((t) => obj(t.objectId, s.id));
      if (s.required !== s.targets.length) e.push(`${s.id}: todos los peligros deben identificarse (required = targets)`);
    }
    if (s.type === 'inspect') obj(s.objectId, s.id);
    if (s.type === 'select' || s.type === 'decide' || s.type === 'inspect') {
      const opts = s.type === 'inspect' ? s.decision.options : s.options;
      if (!opts.some((o) => o.correct)) e.push(`${s.id}: sin opción correcta`);
      opts.forEach((o) => obj(o.objectId, s.id));
    }
    if (s.type === 'demonstrate') s.actions.forEach((a) => obj(a.objectId, s.id));
  }
  if (m.status === 'PLANT_APPROVED') e.push(`${m.id}: PLANT_APPROVED no permitido sin firma de Seguridad y Operaciones`);
  return e;
}
