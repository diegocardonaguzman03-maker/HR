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
const UNSAFE_VERB = /\b(desarm\w*|puente\w*|bypass\w*|by\s*-?\s*pass|b\s+y\s+p\s+a\s+s\s+s|override\w*|anul\w*|desactiv\w*|deshabilit\w*|inhib\w*|brinc\w*|burl\w*|engan\w*|forz\w*|fuerz\w*|desconect\w*|quit\w*|retir\w*|apag\w*|silenci\w*|reset\w*|restablec\w*|tap(a|ar|o)|jumper\w*|salt\w*|omit\w*|ignor\w*|evit\w*|esquiv\w*|entr(ar|o|e|amos|an)|desbloque\w*|cancel\w*|sin)\b/;
const PROTECTION = /\b(enclavamiento\w*|resguardo\w*|zonas? de exclusion|barrera\w*|interlock\w*|candado\w*|loto|bloqueo\w*|permiso\w*|guarda\w*|sensor\w*|detector\w*|alarma\w*|paro\w* de emergencia|disparo\w*|proteccion\w*|interruptor\w*|final de carrera|tarjeta\w*|etiqueta\w*|careta|epp|arnes|casco|regla\w*)\b/;
const BODY_IN_DANGER = /\b(meter|meto|mete|poner(me)?|pongo|pasar|paso|entrar|entro|acercarme|me acerco|trabajar|trabajo|me paro|pararme|quedarme|me quedo|cruzar|cruzo)\b.{0,40}\b(mano|manos|debajo|abajo|bajo la|bajo el|dentro|fosa|sin)\b/;
// RT-SAF-10: engañar una protección o trabajar con equipo energizado (revisión ADX-04 §8.4).
const DEFEAT = /\bpara que no (se )?(dispare|suene|active|detecte|bote)\b|\b(crea|piense|marque|lea|detecte|simule) que (esta|estan|sigue)\b/;
const LIVE_WORK = /\b(destrab\w*|desator\w*|zaf\w*|saco|sacar|quito|quitar|abr\w*|cambi\w*|meto|meter|limpi\w*|repar\w*|ajust\w*|toc\w*|trabaj\w*|subo|subir|entr\w*)\b.{0,50}\b(energizad\w*|prendid\w*|encendid\w*|andando|en marcha|funcionando)\b/;
export const isUnsafe = (q: string) => { const s = norm(q); return (UNSAFE_VERB.test(s) && PROTECTION.test(s)) || BODY_IN_DANGER.test(s) || DEFEAT.test(s) || LIVE_WORK.test(s); };
// RT-SAF-09: agua o humedad con metal líquido o escoria (conducta general ya revisada en q.safety-1 y q.asm-water-1).
const WATER = /\b(agua|manguera\w*|mojad\w*|humed\w*|hielo)\b/;
const MELT = /\b(escoria|metal|acero|bano|olla|fosa|horno|pie liquido|liquid\w*)\b/;
const WATER_ACT = /\b(meto|meter\w*|echo|echar\w*|tiro|tirar|avent\w*|roci\w*|enfri\w*|cargo|cargar|carga|se vale|sigo|seguir)\b/;
const EMERGENCY = /\b(fuga\w*|derram\w*|explosi\w*|incendi\w*|fuego|lesionad\w*|herid\w*|atrapad\w*|quemad\w*|desmay\w*|huele\w*|olor a|le cayo|me cayo|me (queme|corte|golpee|cai|lastime|electrocute|intoxique)|se (quemo|corto|golpeo|lastimo|electrocuto|intoxico)|vapor|humo|chispa\w*|ator\w*|atasc\w*|prensad\w*|gotea\w*|suena|sono|evacu\w*|emergencia\w*|se rompe|se rompio|se cae|se cayo)\b/;
/** «paro de emergencia» es un equipo, no una emergencia en curso. */
const isEmergency = (s: string) => EMERGENCY.test(s.replace(/\bparos? de emergencia\b/g, ''));
const PERMISSION = /^\s*¿?\s*(puedo|podemos|se puede|me puedo|nos podemos|esta bien (si|que)|es seguro|alcanzo a|da tiempo de|se vale|hay problema si|pasa algo si)\b|¿\s*(sigo|continuo|le sigo)\b/;
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
export const WATER_NO = 'NO. El agua o la humedad en contacto con metal líquido o escoria puede causar una explosión de vapor. No eches agua ni cargues material mojado. Si ves agua, vapor o material mojado cerca de metal líquido: detente, aléjate y avisa de inmediato a tu supervisor o al púlpito. SME_REQUIRED: manejo aprobado del DRI mojado y respuesta ante agua con metal líquido; los dan C-07 y Seguridad C-16 (MO-EAF-02 / MS-ACE-03 / MS-ACE-09 en borrador).';
export const NO_AUTH = 'La plataforma no autoriza tareas ni excepciones. Si tienes duda, la respuesta es NO: detente y pregúntale a tu supervisor.';

// §8.9-B (ADX-04): criterio por omisión — la plataforma EXPLICA, no instruye tareas. Toda pregunta de «cómo hacer»
// que no sea explicativa recibe NO_HOWTO. Además, una pregunta en primera persona con contexto de peligro
// (equipo encendido, metal, bloqueo…) que no sea explicativa también recibe NO_HOWTO (red de seguridad extra).
// HOWTO se conserva como documentación del criterio anterior (§8.9-B)
export const HOWTO = /\b(como|que hago para|forma de|manera de)\b/;
const EXPLAIN = /\bcomo (funciona\w*|se llama\w*|se forma|se produce\w*|se mide|se controla|es|son|esta hecho|se relaciona\w*|afecta\w*|influye\w*|se mueve\w*|trabaja\w*|opera\w*|llega\w*|sale\w*|entra\w*|circula\w*|se enfria\w*|se alimenta\w*|se conecta\w*|se usa\w*|se ve\w*|reconozco|identifico|se reporta|reporto|aviso|se avisa)\b/;
const EXPLANATORY = /^\s*¿?\s*(que es|que son|para que|por que|cual es la funcion|que hace|que significa|explica\w*|describe)\b/;
// §8.10-C: lista blanca — solo las preguntas explicativas reciben respuesta normal.
const ASK_INFO = /^\s*¿?\s*(que pasa si|que ocurre si|donde (esta|estan|se ubica\w*)|quien(es)?|que (controla\w*|mide|regula|vigila|detecta|protege|componentes|partes|peligros?|riesgos?|epp|equipos?|senales|tipos?|funcion|diferencia)|cual(es)? (es|son) (el |la |los |las )?(funcion|peligro\w*|riesgo\w*|parte\w*|componente\w*|diferencia\w*|objetivo|proposito)|la evaluacion)\b/;
const isExplanatory = (s: string) => EXPLANATORY.test(s) || ASK_INFO.test(s) || (EXPLAIN.test(s) && !/\bcomo (lo |la )?(hago|puedo)\b/.test(s));
export const NO_HOWTO = 'Esta plataforma explica cómo funciona el equipo; no da instrucciones para hacer tareas en planta. Cómo se hace una tarea lo define el procedimiento aprobado y te lo enseña tu supervisor o instructor en piso. Si tienes duda o algo no se ve bien: detente y pregunta.';

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
    if (WATER.test(s) && MELT.test(s) && WATER_ACT.test(s)) return { kind: 'safety-first', text: WATER_NO, citations, note: 'Abajo hay contexto educativo; no es el procedimiento de la planta.' };
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
    if (!isExplanatory(s) && (citations.length || HOWTO.test(s))) {
      return { kind: 'safety-first', text: NO_HOWTO, citations, note: 'Abajo hay contexto educativo general; no es una instrucción de trabajo.' };
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
