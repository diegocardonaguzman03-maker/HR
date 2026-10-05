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
export interface Answer { kind: 'answer' | 'no-source' | 'refused-safety' | 'plant-data-pending'; text: string; citations: Citation[]; note?: string }
export interface AskContext { equipmentId?: string | null; stageId?: string | null }
export interface AnswerProvider { readonly name: string; answer(q: string, ctx: AskContext): Promise<Answer> }

const UNSAFE = /(puente(a|ar|o)|bypass|anul(a|ar)|desactiv(a|ar)|deshabilit(a|ar)|brinc(a|ar)|salt(a|ar)(me)?\s+(el|la|los)?\s*(bloqueo|enclavamiento|interlock|candado|loto|permiso)|forz(a|ar)\s+(el|la)?\s*(enclavamiento|interlock|se[ñn]al)|sin\s+(bloqueo|loto|permiso|candado))/i;
const PLANT = /(cu[aá]nt[oa]s?|valor|setpoint|consigna|l[ií]mite|m[aá]xim[oa]|m[ií]nim[oa]|temperatura|presi[oó]n|caudal|flujo|voltaje|tensi[oó]n|corriente|amper|kv\b|mva|mw\b|kwh|tap\b|taps|grados|°c|bar\b|psi|segundos|minutos|distancia|metros|par de apriete|torque|qu[ée] pasos.*(loto|bloqueo)|secuencia|procedimiento de emergencia|l[oó]gica de enclavamiento|adici[oó]n(es)?\s+de|cu[aá]ndo vaciar)/i;

export class LocalExtractiveProvider implements AnswerProvider {
  readonly name = 'Recuperación local (BM25) con citas — sin modelo generativo';
  private index = new Bm25(buildChunks(content));
  /** Umbral mínimo de relevancia: debajo de esto no hay fuente. */
  constructor(private minScore = 3.2) {}

  async answer(q: string, ctx: AskContext): Promise<Answer> {
    const query = q.trim();
    if (!query) return { kind: 'no-source', text: NO_SOURCE, citations: [] };
    if (UNSAFE.test(query)) {
      return {
        kind: 'refused-safety',
        text: 'No puedo ayudar a omitir, puentear ni anular bloqueos, enclavamientos, permisos o protecciones. Si una protección impide trabajar, detén la tarea y avisa a tu supervisor: solo el procedimiento aprobado de la planta y las personas autorizadas deciden.',
        citations: [],
        note: 'Regla de seguridad del asistente (revisión ADX-04).',
      };
    }
    const qTokens = this.index.queryTokens(query).length;
    // preguntas cortas ("¿qué componentes tiene?") dependen del equipo o etapa seleccionada
    const ctxW = qTokens <= 2 ? 3 : 1.35;
    const boost = (c: Chunk) => (ctx.equipmentId && c.ref.id === ctx.equipmentId) || (ctx.stageId && c.ref.id === ctx.stageId) ? ctxW : 1;
    const hits = this.index.search(query, 6, boost).filter((h) => h.score >= this.minScore && h.matched >= Math.min(2, qTokens));
    if (!hits.length) return { kind: 'no-source', text: NO_SOURCE, citations: [], note: 'No encontré ese tema en el contenido del módulo.' };
    const citations: Citation[] = hits.slice(0, 3).map((h, i) => {
      const sp = splitPending(h.chunk.text);
      return { n: i + 1, title: h.chunk.title, status: h.chunk.status, ref: h.chunk.ref, snippet: snippet(sp.before || h.chunk.text, query), pending: sp.pending?.text };
    });
    const plantQ = PLANT.test(query);
    if (plantQ) {
      const pend = citations.find((c) => c.pending);
      return {
        kind: 'plant-data-pending',
        text: NO_SOURCE + (pend ? ` Ese dato es de planta y está marcado como SME_REQUIRED: ${pend.pending}` : ' Los valores de operación (límites, consignas, temperaturas, presiones, secuencias) solo pueden venir del procedimiento aprobado de la planta.'),
        citations,
        note: 'Abajo hay contexto educativo general relacionado, no valores de planta.',
      };
    }
    return { kind: 'answer', text: 'Según el contenido del módulo (educativo, no es un procedimiento aprobado):', citations };
  }
}

/** Extrae las 1–2 oraciones más relacionadas con la pregunta. */
function snippet(text: string, q: string): string {
  const qt = new Set(q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9ñ]+/).filter((t) => t.length > 3));
  const sents = text.split(/(?<=[.;:])\s+/).filter(Boolean);
  const scored = sents.map((s, i) => ({ s, i, k: [...qt].filter((t) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(t.slice(0, Math.max(4, t.length - 2)))).length }));
  const best = scored.sort((a, b) => b.k - a.k || a.i - b.i).slice(0, 2).sort((a, b) => a.i - b.i).map((x) => x.s).join(' ');
  return (best || text).slice(0, 420);
}

export const provider: AnswerProvider = new LocalExtractiveProvider();
