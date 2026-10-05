/**
 * Analítica de aprendizaje NO invasiva.
 * - Solo eventos de aprendizaje (abrir equipo, completar lección, descargar documento, terminar evaluación).
 * - Sin movimiento del ratón, sin teclas, sin texto libre (las preguntas al asistente NO se guardan), sin datos personales.
 * - Se guarda solo en este navegador (localStorage) con un identificador seudónimo por equipo (aleatorio, sin nombre ni
 *   número de ficha). NO es anónimo: con la hora y la lista de quién usó el equipo se podría reidentificar (RL-18).
 * - Listo para enviarse a un LRS como sentencias xAPI cuando la planta lo habilite (toXapi / exportXapi).
 * - NINGÚN evento alimenta la certificación de tareas críticas (TD-P07) ni la emisión de DC-3 (TRN-06 / SAF-11):
 *   cada sentencia lleva la categoría «knowledge-check-non-certifying» y `certifies-competency: false`.
 * - El trabajador puede desactivar el registro y borrar lo guardado en un equipo compartido (TRN-12).
 * - RL-10: el aviso de registro se muestra al entrar a la app por primera vez en el equipo (FirstRunNotice).
 * - RL-19: ningún LRS/LMS se conecta sin la regla de exclusión de docs/architecture.md §4 bis.
 */
export type Verb = 'initialized' | 'opened' | 'mode-changed' | 'started' | 'progressed' | 'completed' | 'passed' | 'failed' | 'downloaded' | 'played' | 'asked' | 'checked' | 'answered';

export interface LearningEvent { id: string; ts: string; verb: Verb; object: string; result?: Record<string, string | number | boolean> }

const KEY = 'adx.events';
const ACTOR = 'adx.actor';
const MAX = 500;
const listeners = new Set<(e: LearningEvent) => void>();

function safeGet(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const enabledListeners = new Set<() => void>();
export function enabled(): boolean { return safeGet('adx.analytics') !== 'off'; }
export function setEnabled(on: boolean) { safeSet('adx.analytics', on ? 'on' : 'off'); enabledListeners.forEach((l) => l()); }
/** Para que los dos avisos de registro (al entrar y en EVALUAR) muestren el mismo estado. */
export function subscribeEnabled(l: () => void) { enabledListeners.add(l); return () => { enabledListeners.delete(l); }; }

/** RL-10: el aviso de registro se recuerda por equipo (navegador). */
const NOTICE = 'adx.recording-notice-seen';
export function noticeSeen(): boolean { return safeGet(NOTICE) === '1'; }
export function markNoticeSeen() { safeSet(NOTICE, '1'); }
export function forgetNoticeSeen() { try { localStorage.removeItem(NOTICE); } catch { /* sin almacenamiento */ } }

/** TRN-12: olvida el identificador seudónimo de este navegador (equipo compartido). */
export function resetActor() { try { localStorage.removeItem(ACTOR); } catch { /* sin almacenamiento */ } }

export function anonymousActor(): string {
  let a = safeGet(ACTOR);
  if (!a) { a = 'anon-' + rid(); safeSet(ACTOR, a); }
  return a;
}

export function track(verb: Verb, object: string, result?: LearningEvent['result']): LearningEvent | null {
  if (!enabled()) return null;
  const e: LearningEvent = { id: rid(), ts: new Date().toISOString(), verb, object, result };
  const all = events();
  all.push(e);
  safeSet(KEY, JSON.stringify(all.slice(-MAX)));
  listeners.forEach((l) => l(e));
  return e;
}

export function events(): LearningEvent[] {
  try { return JSON.parse(safeGet(KEY) ?? '[]') as LearningEvent[]; } catch { return []; }
}
export function clearEvents() { safeSet(KEY, '[]'); }
export function subscribe(l: (e: LearningEvent) => void) { listeners.add(l); return () => { listeners.delete(l); }; }

const VERB_IRI: Record<Verb, string> = {
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  opened: 'http://activitystrea.ms/schema/1.0/open',
  'mode-changed': 'http://adlnet.gov/expapi/verbs/interacted',
  started: 'http://adlnet.gov/expapi/verbs/launched',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
  passed: 'http://adlnet.gov/expapi/verbs/passed',
  failed: 'http://adlnet.gov/expapi/verbs/failed',
  downloaded: 'http://id.tincanapi.com/verb/downloaded',
  played: 'https://w3id.org/xapi/video/verbs/played',
  asked: 'http://adlnet.gov/expapi/verbs/asked',
  checked: 'http://adlnet.gov/expapi/verbs/interacted',
  answered: 'http://adlnet.gov/expapi/verbs/answered',
};

const ACT = 'http://adlnet.gov/expapi/activities/';
/** Tipo y nombre de la actividad a partir del ID (sin leer el contenido: la analítica no depende de la UI). */
export function activityDefinition(object: string): { type: string; name: Record<string, string> } | undefined {
  if (/#practica-sim/.test(object)) return { type: `${ACT}simulation`, name: { 'es-MX': 'Práctica en simulación (no es verificación OJT ni certificación TD-P07)' } };
  if (object.startsWith('asm.')) return { type: `${ACT}assessment`, name: { 'es-MX': 'Evaluación de conocimiento (no certifica competencia; no válida para DC-3 ni para tareas críticas)' } };
  if (object.startsWith('q.')) return { type: 'http://adlnet.gov/expapi/activities/cmi.interaction', name: { 'es-MX': 'Pregunta de comprobación de conocimiento' } };
  if (object.startsWith('mod.')) return { type: `${ACT}module`, name: { 'es-MX': 'Módulo de aprendizaje (formativo)' } };
  if (object.startsWith('les.')) return { type: `${ACT}lesson`, name: { 'es-MX': 'Lección (formativa)' } };
  if (object.startsWith('doc.')) return { type: `${ACT}file`, name: { 'es-MX': 'Documento de capacitación (no es procedimiento aprobado)' } };
  if (object.startsWith('vid.')) return { type: `${ACT}media`, name: { 'es-MX': 'Video de demostración' } };
  return undefined;
}

const NON_CERT = {
  objectType: 'Activity',
  id: 'urn:gasm:adx:category:knowledge-check-non-certifying',
  definition: { name: { 'es-MX': 'Evidencia de conocimiento. No es DC-3 ni certificación TD-P07' } },
} as const;

/** Sentencia xAPI 1.0.3 con actor seudónimo por equipo (cuenta, sin nombre, ficha ni correo). */
export function toXapi(e: LearningEvent, actor = anonymousActor()) {
  const r = e.result ?? {};
  const asm = e.object.startsWith('asm.');
  // RL-19 (display): mismo lenguaje que el resultado en pantalla (RL-04); la IRI ADL se conserva
  const display = asm && e.verb === 'passed' ? 'comprensión suficiente en la comprobación de conocimiento (no certifica)' : asm && e.verb === 'failed' ? 'aún sin comprensión suficiente en la comprobación de conocimiento (no certifica)' : e.verb;
  const def = activityDefinition(e.object);
  const score = {
    ...(typeof r.score === 'number' ? { scaled: r.score } : {}),
    ...(typeof r.raw === 'number' ? { raw: r.raw } : {}),
    ...(typeof r.max === 'number' ? { min: 0, max: r.max } : {}),
  };
  const ext: Record<string, string | number | boolean> = { 'urn:gasm:adx:certifies-competency': false };
  if (typeof r.attempt === 'number') ext['urn:gasm:adx:attempt'] = r.attempt;
  if (typeof r.simulated === 'boolean') ext['urn:gasm:adx:simulated'] = r.simulated;
  if (typeof r.criticalOk === 'boolean') ext['urn:gasm:adx:critical-ok'] = r.criticalOk;
  return {
    id: e.id,
    timestamp: e.ts,
    actor: { objectType: 'Agent', account: { homePage: 'urn:gasm:aceria-digital-academy', name: actor } },
    verb: { id: VERB_IRI[e.verb], display: { 'es-MX': display } },
    object: { objectType: 'Activity', id: `urn:gasm:adx:${e.object}`, ...(def ? { definition: def } : {}) },
    result: {
      ...(Object.keys(score).length ? { score } : {}),
      ...(typeof r.success === 'boolean' ? { success: r.success } : {}),
      ...(typeof r.durationSec === 'number' ? { duration: `PT${Math.max(0, Math.round(r.durationSec))}S` } : {}),
      extensions: ext,
    },
    context: {
      platform: 'Acería Digital Academy',
      language: 'es-MX',
      contextActivities: { category: [NON_CERT] },
      extensions: { 'urn:gasm:adx:note': 'Evidencia de aprendizaje; no certifica competencia' },
    },
  };
}
export const exportXapi = () => events().map((e) => toXapi(e));
