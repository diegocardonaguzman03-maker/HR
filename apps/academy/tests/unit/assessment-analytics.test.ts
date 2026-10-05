import { describe, expect, it, beforeEach } from 'vitest';
import { content } from '../../src/lib/content';
import { emptyResponse, grade, isAnswered, isPassed, score, shuffledOrder, type Response } from '../../src/lib/assessment';
import type { QuestionT } from '../../src/lib/content/schema';
import { clearEvents, events, resetActor, anonymousActor, toXapi, track } from '../../src/lib/analytics';

const correct = (q: QuestionT): Response => {
  switch (q.kind) {
    case 'mcq': return { kind: 'mcq', choice: q.answer };
    case 'identify': return { kind: 'identify', eqId: q.answerEquipmentId };
    case 'order': return { kind: 'order', order: [...q.correctOrder], touched: true };
    case 'match': return { kind: 'match', picks: q.pairs.map((_, i) => i) };
  }
};

describe('evaluación', () => {
  it('califica correctas todas las respuestas correctas y 0 las vacías', () => {
    for (const q of content.questions) {
      expect(grade(q, correct(q)), q.id).toBe(true);
      expect(grade(q, emptyResponse(q)), q.id).toBe(false);
    }
  });
  it('«ordenar» no cuenta como contestada sin mover nada (TRN-17)', () => {
    const q = content.questions.find((x) => x.kind === 'order')!;
    expect(isAnswered(emptyResponse(q))).toBe(false);
    expect(isAnswered(correct(q))).toBe(true);
  });
  it('preguntas críticas eliminatorias y no calificadas (TRN-01 / SAF-09)', () => {
    const qs = content.questions.slice(0, 5);
    const rs = qs.map(correct);
    const [crit, uns] = [qs[0].id, qs[1].id];
    const all = score(qs, rs, { critical: [crit], unscored: [uns] });
    expect(all).toMatchObject({ correct: 4, total: 4, ratio: 1, criticalOk: true });
    // falla la no calificada: no cambia la calificación
    const r2 = rs.map((r, i) => (i === 1 ? emptyResponse(qs[1]) : r));
    expect(score(qs, r2, { critical: [crit], unscored: [uns] }).ratio).toBe(1);
    // falla la crítica: 75 % y no aprueba aunque el mínimo fuera 70 %
    const r3 = rs.map((r, i) => (i === 0 ? emptyResponse(qs[0]) : r));
    const s3 = score(qs, r3, { critical: [crit], unscored: [uns] });
    expect(s3).toMatchObject({ correct: 3, total: 4, criticalOk: false, criticalMissed: [crit] });
    expect(isPassed(s3, 0.7)).toBe(false);
    expect(isPassed(score(qs, r2, { critical: [crit], unscored: [uns] }), 0.7)).toBe(true);
  });
  it('calcula el puntaje y el orden inicial nunca es el correcto', () => {
    const qs = content.questions.slice(0, 4);
    expect(score(qs, qs.map(correct)).ratio).toBe(1);
    expect(shuffledOrder(5, 'x')).not.toEqual([0, 1, 2, 3, 4]);
  });
});

describe('analítica no invasiva', () => {
  beforeEach(() => { localStorage.clear(); clearEvents(); });
  it('guarda eventos locales sin datos personales y los mapea a xAPI con actor anónimo', () => {
    track('passed', 'asm.eaf-electrode', { score: 0.9, success: true });
    const [e] = events();
    const x = toXapi(e, 'anon-test');
    expect(x.actor).toEqual({ objectType: 'Agent', account: { homePage: 'urn:gasm:aceria-digital-academy', name: 'anon-test' } });
    expect(JSON.stringify(x)).not.toMatch(/mbox|email|@/);
    expect(x.result).toEqual({ score: { scaled: 0.9 }, success: true, extensions: { 'urn:gasm:adx:certifies-competency': false } });
  });
  it('xAPI: la evaluación y la práctica se marcan como no certificantes (TRN-06 / SAF-11)', () => {
    const asm = toXapi(track('passed', 'asm.eaf-electrode', { score: 0.9, success: true, raw: 8, max: 9, attempt: 2 })!, 'anon-test');
    expect(asm.object.definition?.type).toBe('http://adlnet.gov/expapi/activities/assessment');
    expect(asm.object.definition?.name['es-MX']).toMatch(/no certifica competencia; no válida para DC-3/);
    expect(asm.verb.id).toBe('http://adlnet.gov/expapi/verbs/passed');
    expect(asm.verb.display['es-MX']).toBe('comprensión suficiente en la comprobación de conocimiento (no certifica)');
    expect(toXapi(track('failed', 'asm.eaf-electrode', { success: false })!, 'anon-test').verb.display['es-MX']).toBe('aún sin comprensión suficiente en la comprobación de conocimiento (no certifica)');
    expect(asm.context.contextActivities.category[0].id).toBe('urn:gasm:adx:category:knowledge-check-non-certifying');
    expect(asm.result.score).toEqual({ scaled: 0.9, raw: 8, min: 0, max: 9 });
    expect(asm.result.extensions).toMatchObject({ 'urn:gasm:adx:certifies-competency': false, 'urn:gasm:adx:attempt': 2 });
    const sim = toXapi(track('checked', 'wi.electrode-system-check#practica-sim-3', { simulated: true })!, 'anon-test');
    expect(sim.object.definition?.type).toBe('http://adlnet.gov/expapi/activities/simulation');
    expect(sim.result.extensions).toMatchObject({ 'urn:gasm:adx:simulated': true, 'urn:gasm:adx:certifies-competency': false });
  });
  it('olvida el actor anónimo en un equipo compartido (TRN-12)', () => {
    const a = anonymousActor();
    resetActor();
    expect(anonymousActor()).not.toBe(a);
  });
  it('se puede desactivar', () => {
    localStorage.setItem('adx.analytics', 'off');
    expect(track('opened', 'eq.roof')).toBeNull();
    expect(events()).toHaveLength(0);
  });
});
