import { describe, expect, it, beforeEach } from 'vitest';
import { content } from '../../src/lib/content';
import { emptyResponse, grade, score, shuffledOrder, type Response } from '../../src/lib/assessment';
import type { QuestionT } from '../../src/lib/content/schema';
import { clearEvents, events, toXapi, track } from '../../src/lib/analytics';

const correct = (q: QuestionT): Response => {
  switch (q.kind) {
    case 'mcq': return { kind: 'mcq', choice: q.answer };
    case 'identify': return { kind: 'identify', eqId: q.answerEquipmentId };
    case 'order': return { kind: 'order', order: [...q.correctOrder] };
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
    expect(x.result).toEqual({ score: { scaled: 0.9 }, success: true });
  });
  it('se puede desactivar', () => {
    localStorage.setItem('adx.analytics', 'off');
    expect(track('opened', 'eq.roof')).toBeNull();
    expect(events()).toHaveLength(0);
  });
});
