/**
 * Analítica de aprendizaje NO invasiva.
 * - Solo eventos de aprendizaje (abrir equipo, completar lección, descargar documento, terminar evaluación).
 * - Sin movimiento del ratón, sin teclas, sin texto libre (las preguntas al asistente NO se guardan), sin datos personales.
 * - Se guarda solo en este navegador (localStorage) con un identificador anónimo aleatorio.
 * - Listo para enviarse a un LRS como sentencias xAPI cuando la planta lo habilite (toXapi / exportXapi).
 */
export type Verb = 'initialized' | 'opened' | 'mode-changed' | 'started' | 'progressed' | 'completed' | 'passed' | 'failed' | 'downloaded' | 'played' | 'asked' | 'checked';

export interface LearningEvent { id: string; ts: string; verb: Verb; object: string; result?: Record<string, string | number | boolean> }

const KEY = 'adx.events';
const ACTOR = 'adx.actor';
const MAX = 500;
const listeners = new Set<(e: LearningEvent) => void>();

function safeGet(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function enabled(): boolean { return safeGet('adx.analytics') !== 'off'; }
export function setEnabled(on: boolean) { safeSet('adx.analytics', on ? 'on' : 'off'); }

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
};

/** Sentencia xAPI 1.0.3 con actor anónimo (cuenta, sin nombre ni correo). */
export function toXapi(e: LearningEvent, actor = anonymousActor()) {
  const r = e.result ?? {};
  return {
    id: e.id,
    timestamp: e.ts,
    actor: { objectType: 'Agent', account: { homePage: 'urn:gasm:aceria-digital-academy', name: actor } },
    verb: { id: VERB_IRI[e.verb], display: { 'es-MX': e.verb } },
    object: { objectType: 'Activity', id: `urn:gasm:adx:${e.object}` },
    ...(typeof r.score === 'number' || typeof r.success === 'boolean'
      ? { result: { ...(typeof r.score === 'number' ? { score: { scaled: r.score } } : {}), ...(typeof r.success === 'boolean' ? { success: r.success } : {}) } }
      : {}),
    context: { platform: 'Acería Digital Academy', language: 'es-MX', extensions: { 'urn:gasm:adx:note': 'Evidencia de aprendizaje; no certifica competencia' } },
  };
}
export const exportXapi = () => events().map((e) => toXapi(e));
