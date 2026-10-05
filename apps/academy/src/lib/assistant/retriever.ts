/**
 * Recuperación local (BM25) sobre el contenido validado por esquema. No hay red ni modelo generativo:
 * cada respuesta es un extracto con cita. Los fragmentos llevan su estado de validación.
 */
import type { ContentBundleT, ValidationStatus } from '../content/schema';

export interface Chunk { id: string; title: string; text: string; ref: { kind: 'equipment' | 'hazard' | 'stage' | 'wi' | 'lesson' | 'glossary' | 'document'; id: string }; status: ValidationStatus; sourceIds: string[] }

const STOP = new Set('a al algo como con cual cuales cuando de del el ella en entre era es esa ese eso esta este esto hay la las le les lo los mas me mi mis muy no nos o para pero por que quien se si sin sobre son su sus tambien te tiene tu un una uno unos y ya yo qué cómo cuál cuáles dónde donde hace hacer sirve sirven funciona the of and is'.split(' ').map((w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '')));

export function tokenize(s: string): string[] {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9ñ]+/).filter((t) => t.length > 1 && !STOP.has(t)).map(stem);
}
/** Lematizado ligero para español (plurales y algunas terminaciones). */
function stem(t: string): string {
  if (t.length > 5 && t.endsWith('es')) return t.slice(0, -2);
  if (t.length > 4 && t.endsWith('s')) return t.slice(0, -1);
  return t;
}

export function buildChunks(c: ContentBundleT): Chunk[] {
  const out: Chunk[] = [];
  for (const e of c.equipment) {
    const base = { ref: { kind: 'equipment' as const, id: e.id }, status: e.status, sourceIds: e.sourceIds };
    out.push({ id: `${e.id}#overview`, title: `${e.name} — general`, text: [e.summary, e.function, ...e.howItWorks].join(' '), ...base });
    out.push({ id: `${e.id}#operation`, title: `${e.name} — operación`, text: [...e.operationalNotes, ...e.observableSignals, ...e.commonMistakes, ...e.movements].join(' '), ...base });
    out.push({ id: `${e.id}#controls`, title: `${e.name} — control`, text: [...e.energySources, ...e.actuators, ...e.sensors, ...e.controlSignals, ...e.dependencies].join(' '), ...base });
    out.push({ id: `${e.id}#maintenance`, title: `${e.name} — mantenimiento`, text: [...e.maintenance.failureModes, ...e.maintenance.inspectionPoints, ...e.maintenance.considerations].join(' '), ...base });
    out.push({ id: `${e.id}#components`, title: `${e.name} — componentes`, text: `Componentes principales de ${e.name}: ${e.components.map((k) => k.name).join(', ')}.`, ...base });
    for (const k of e.components) out.push({ id: `${e.id}#${k.id}`, title: `${e.name} — ${k.name}`, text: [k.name, k.function, ...k.failureModes, ...k.inspectionPoints].join(' '), ...base });
  }
  for (const h of c.hazards) {
    out.push({ id: h.id, title: `Peligro: ${h.name}`, text: [h.name, h.description, h.consequence, ...h.controls.map((x) => x.text), ...h.ppe].join(' '), ref: { kind: 'hazard', id: h.id }, status: h.status, sourceIds: h.sourceIds });
    out.push({ id: `${h.id}#plant`, title: `Peligro: ${h.name} — datos de planta`, text: [`zona de exclusión: ${h.exclusionZone}`, `enclavamiento: ${h.interlock}`, `permiso: ${h.permit}`, `condición de paro: ${h.stopCondition}`, `escalamiento: ${h.escalation}`].join(' '), ref: { kind: 'hazard', id: h.id }, status: h.status, sourceIds: h.sourceIds });
  }
  for (const p of c.processes) {
    out.push({ id: p.id, title: `Etapa ${p.code}: ${p.name}`, text: [p.name, p.summary, p.purpose, ...p.inputs, ...p.outputs, ...p.operatorDecisions, ...p.dependencies].join(' '), ref: { kind: 'stage', id: p.id }, status: p.status, sourceIds: p.sourceIds });
    p.variables.forEach((v, i) => out.push({ id: `${p.id}#var${i}`, title: `Etapa ${p.code} — ${v.name}`, text: `${v.name}. ${v.why} Valor: ${v.value}`, ref: { kind: 'stage', id: p.id }, status: p.status, sourceIds: p.sourceIds }));
  }
  for (const w of c.workInstructions) for (const s of w.steps) {
    out.push({ id: `${w.id}#${s.n}`, title: `${w.title} — paso ${s.n}: ${s.title}`, text: [s.title, s.action, s.why, s.check, s.expected, s.warning ?? '', s.escalation ?? ''].join(' '), ref: { kind: 'wi', id: w.id }, status: w.status, sourceIds: w.sourceIds });
  }
  for (const m of c.training) for (const l of m.lessons) {
    out.push({ id: l.id, title: `Lección: ${l.title}`, text: [...l.body, ...l.keyPoints].join(' '), ref: { kind: 'lesson', id: m.id }, status: m.status, sourceIds: m.sourceIds });
  }
  for (const g of c.glossary) out.push({ id: `gl.${g.term}`, title: `Glosario: ${g.term}`, text: `${g.term}. ${g.definition}`, ref: { kind: 'glossary', id: g.term }, status: g.status, sourceIds: [] });
  return out;
}

export class Bm25 {
  private docs: { chunk: Chunk; tf: Map<string, number>; len: number }[];
  private df = new Map<string, number>();
  private avg: number;
  constructor(chunks: Chunk[], private k1 = 1.4, private b = 0.7) {
    this.docs = chunks.map((chunk) => {
      const toks = tokenize(`${chunk.title} ${chunk.title} ${chunk.text}`);
      const tf = new Map<string, number>();
      toks.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
      tf.forEach((_, t) => this.df.set(t, (this.df.get(t) ?? 0) + 1));
      return { chunk, tf, len: toks.length };
    });
    this.avg = this.docs.reduce((a, d) => a + d.len, 0) / Math.max(1, this.docs.length);
  }
  search(q: string, k = 5, boost?: (c: Chunk) => number): { chunk: Chunk; score: number; matched: number }[] {
    const qt = [...new Set(tokenize(q))];
    const N = this.docs.length;
    const res = this.docs.map((d) => {
      let s = 0, matched = 0;
      for (const t of qt) {
        const f = d.tf.get(t);
        if (!f) continue;
        matched++;
        const n = this.df.get(t) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        s += idf * ((f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * d.len) / this.avg)));
      }
      return { chunk: d.chunk, score: s * (boost ? boost(d.chunk) : 1), matched };
    });
    return res.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
  }
  get size() { return this.docs.length; }
  queryTokens(q: string) { return tokenize(q); }
}
