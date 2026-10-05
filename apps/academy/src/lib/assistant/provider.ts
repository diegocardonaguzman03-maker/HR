/**
 * "Pregunta a Acería AI": interfaz de proveedor de respuestas.
 * El MVP usa LocalExtractiveProvider (sin red, sin LLM): responde solo con extractos citados del contenido.
 * Un proveedor generativo futuro (RAG con LLM) DEBE implementar la misma interfaz y las mismas reglas:
 * responder únicamente con los pasajes recuperados, citar, y negarse cuando no haya fuente aprobada.
 */
import { content } from '../content';
import { splitPending } from '../content/status';
import type { ValidationStatus } from '../content/schema';
import { Bm25, buildChunks, type Chunk } from './retriever';

export const NO_SOURCE = 'No tengo una fuente aprobada para esa información.';

export interface Citation { n: number; title: string; status: ValidationStatus; ref: Chunk['ref']; snippet: string; pending?: string }
export interface Answer { kind: 'answer' | 'no-source' | 'refused-safety' | 'plant-data-pending' | 'safety-first'; text: string; citations: Citation[]; note?: string }
export interface AskContext { equipmentId?: string | null; stageId?: string | null }
export interface AnswerProvider { readonly name: string; answer(q: string, ctx: AskContext): Promise<Answer> }

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// --- Reglas de seguridad (revisión ADX-04, RT-SAF-01…07). Se evalúan sobre texto normalizado sin acentos. ---
const UNSAFE_VERB = /\b(puente\w*|bypass\w*|by\s*-?\s*pass|b\s+y\s+p\s+a\s+s\s+s|override\w*|anul\w*|desactiv\w*|deshabilit\w*|inhib\w*|brinc\w*|burl\w*|engan\w*|forz\w*|fuerz\w*|desconect\w*|quit\w*|retir\w*|apag\w*|silenci\w*|reset\w*|restablec\w*|tap(a|ar|o)|jumper\w*|salt\w*|omit\w*|ignor\w*|evit\w*|esquiv\w*|entr(ar|o|e|amos|an)|sin)\b/;
const PROTECTION = /\b(enclavamiento\w*|resguardo\w*|zonas? de exclusion|barrera\w*|interlock\w*|candado\w*|loto|bloqueo\w*|permiso\w*|guarda\w*|sensor\w*|detector\w*|alarma\w*|paro\w* de emergencia|disparo\w*|proteccion\w*|interruptor\w*|final de carrera|tarjeta\w*|etiqueta\w*|careta|epp|arnes|casco|regla\w*)\b/;
const BODY_IN_DANGER = /\b(meter|meto|mete|poner(me)?|pongo|pasar|paso|entrar|entro|acercarme|me acerco|trabajar|trabajo)\b.{0,40}\b(mano|manos|debajo|bajo la|bajo el|dentro|fosa|sin)\b/;
export const isUnsafe = (q: string) => { const s = norm(q); return (UNSAFE_VERB.test(s) && PROTECTION.test(s)) || BODY_IN_DANGER.test(s); };
const EMERGENCY = /\b(fuga\w*|derram\w*|explosi\w*|incendi\w*|fuego|lesionad\w*|herid\w*|atrapad\w*|quemad\w*|desmay\w*|suena|sono|evacu\w*|emergencia\w*|se rompe|se rompio|se cae|se cayo)\b/;
/** «paro de emergencia» es un equipo, no una emergencia en curso. */
const isEmergency = (s: string) => EMERGENCY.test(s.replace(/\bparos? de emergencia\b/g, ''));
const PERMISSION = /^\s*¿?\s*(puedo|podemos|se puede|me puedo|nos podemos|esta bien (si|que)|es seguro|alcanzo a|da tiempo de)\b/;
const PLANT = /(cuant[oa]s?|valor|setpoint|consigna|limite|maxim[oa]|minim[oa]|temperatura|presion|caudal|flujo|voltaje|tension|corriente|amper|\bkv\b|mva|\bmw\b|kwh|\btap\b|taps|grados|°c|\bbar\b|psi|segundos|minutos|distancia|metros|par de apriete|torque|que pasos.*(loto|bloqueo)|secuencia|procedimiento de emergencia|logica de enclavamiento|adicion(es)?\s+de|cuando vaciar|zona de exclusion|\bradio\b|perimetro|pasos?\s+(de|del|para)\s+(loto|bloqueo|aislamiento|desenergiz)|desenergiz\w*|energia cero|evacuacion|potencia|diametro|calibre|espesor|\bmm\b|pulgadas?)/;

/**
 * SAF-01: el asistente nunca muestra cifras con unidades de ingeniería (pueden venir de borradores MS-ACE/FT
 * no validados). Se sustituyen por una marca SME_REQUIRED; el valor solo puede venir del procedimiento aprobado.
 */
const FIGURE = /\d+(?:[.,]\d+)?(?:\s*[-–a]\s*\d+(?:[.,]\d+)?)?\s*(?:mm|cm|pulg(?:adas?)?|mva|mvar|mw|kw|kwh|kv|ka|°\s*c|º\s*c|bar|psi|nm3|m3\/h|t\/h|hz|rpm)(?![a-z0-9ñ])/gi;
export const DRAFT_FIGURE_MARK = '[cifra omitida: SME_REQUIRED]';
export const scrubFigures = (t: string) => t.replace(FIGURE, DRAFT_FIGURE_MARK);

export const REFUSE = 'No puedo ayudar a omitir, puentear ni anular bloqueos, enclavamientos, permisos, alarmas o protecciones, ni a exponerte a una zona de peligro. Si una protección impide trabajar, detén la tarea y avisa a tu supervisor: solo el procedimiento aprobado de la planta y las personas autorizadas deciden.';
export const SAFETY_FIRST = 'Si esto está pasando ahora: DETENTE, aléjate a una zona segura, avisa de inmediato por radio a tu supervisor o al púlpito y no dejes que nadie se acerque. No intentes corregirlo tú. La respuesta de emergencia de la planta la define su procedimiento aprobado (SME_REQUIRED: MS-ACE-09 en borrador; Seguridad C-16).';
export const NO_AUTH = 'La plataforma no autoriza tareas ni excepciones. Si tienes duda, la respuesta es NO: detente y pregúntale a tu supervisor.';

export class LocalExtractiveProvider implements AnswerProvider {
  readonly name = 'Recuperación local (BM25) con citas — sin modelo generativo';
  private index = new Bm25(buildChunks(content));
  /** Umbral mínimo de relevancia: debajo de esto no hay fuente. */
  constructor(private minScore = 3.2) {}

  async answer(q: string, ctx: AskContext): Promise<Answer> {
    const query = q.trim();
    if (!query) return { kind: 'no-source', text: NO_SOURCE, citations: [] };
    if (isUnsafe(query)) return { kind: 'refused-safety', text: REFUSE, citations: [], note: 'Regla de seguridad del asistente (revisión ADX-04).' };
    const qTokens = this.index.queryTokens(query).length;
    // preguntas cortas ("¿qué componentes tiene?") dependen del equipo o etapa seleccionada
    const ctxW = qTokens <= 2 ? 3 : 1.35;
    const boost = (c: Chunk) => (ctx.equipmentId && c.ref.id === ctx.equipmentId) || (ctx.stageId && c.ref.id === ctx.stageId) ? ctxW : 1;
    // preguntas de definición de una palabra («¿Qué es el DRI?»): el término del glosario va primero
    const glossBoost = (c: Chunk) => (qTokens <= 2 && c.ref.kind === 'glossary' && this.index.queryTokens(c.ref.id).some((t) => this.index.queryTokens(query).includes(t)) ? 4 : 1);
    const hits = this.index.search(query, 6, (c) => boost(c) * glossBoost(c)).filter((h) => h.score >= this.minScore && h.matched >= Math.min(2, qTokens));
    const citations: Citation[] = hits.slice(0, 3).map((h, i) => {
      const sp = splitPending(h.chunk.text);
      return { n: i + 1, title: scrubFigures(h.chunk.title), status: h.chunk.status, ref: h.chunk.ref, snippet: scrubFigures(snippet(sp.before || h.chunk.text, query)), pending: sp.pending ? scrubFigures(sp.pending.text) : undefined };
    });
    const s = norm(query);
    if (isEmergency(s)) return { kind: 'safety-first', text: SAFETY_FIRST, citations, note: 'Abajo hay contexto educativo; no es el procedimiento de emergencia de la planta.' };
    if (PERMISSION.test(s)) return { kind: 'safety-first', text: NO_AUTH, citations, note: 'Abajo hay contexto educativo general; no es una autorización.' };
    if (PLANT.test(s)) {
      const pend = citations[0]?.pending ? citations[0] : undefined;
      return {
        kind: 'plant-data-pending',
        text: NO_SOURCE + (pend ? ` Ese dato es de planta y está pendiente de validación (SME_REQUIRED): ${pend.pending}` : ' Los valores de operación (límites, consignas, temperaturas, presiones, secuencias) solo pueden venir del procedimiento aprobado de la planta.'),
        citations,
        note: citations.length ? 'Abajo hay contexto educativo general relacionado, no valores de planta.' : undefined,
      };
    }
    if (!citations.length) return { kind: 'no-source', text: NO_SOURCE, citations: [], note: 'No encontré ese tema en el contenido del módulo.' };
    return { kind: 'answer', text: 'Según el contenido del módulo (educativo, no es un procedimiento aprobado):', citations };
  }
}

/** Extrae las 1–2 oraciones más relacionadas con la pregunta. */
function snippet(text: string, q: string): string {
  const qt = new Set(q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9ñ]+/).filter((t) => t.length > 3));
  const sents = text.split(/(?<=[.;])\s+/).filter(Boolean);
  const scored = sents.map((s, i) => ({ s, i, k: [...qt].filter((t) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(t.slice(0, Math.max(4, t.length - 2)))).length }));
  const best = scored.sort((a, b) => b.k - a.k || a.i - b.i).slice(0, 2).sort((a, b) => a.i - b.i).map((x) => x.s).join(' ');
  return (best || text).slice(0, 420);
}

export const provider: AnswerProvider = new LocalExtractiveProvider();
