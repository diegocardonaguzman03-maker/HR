import type { QuestionT } from './content/schema';

export type Response =
  | { kind: 'mcq'; choice: number | null }
  | { kind: 'identify'; eqId: string | null }
  | { kind: 'order'; order: number[] }
  | { kind: 'match'; picks: (number | null)[] };

export function emptyResponse(q: QuestionT): Response {
  switch (q.kind) {
    case 'mcq': return { kind: 'mcq', choice: null };
    case 'identify': return { kind: 'identify', eqId: null };
    case 'order': return { kind: 'order', order: shuffledOrder(q.items.length, q.id) };
    case 'match': return { kind: 'match', picks: q.pairs.map(() => null) };
  }
}

/** Orden inicial determinista (no igual al correcto) para que la prueba sea reproducible. */
export function shuffledOrder(n: number, seed: string): number[] {
  const a = [...Array(n).keys()];
  let h = [...seed].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 7);
  for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  if (a.every((x, i) => x === i) && n > 1) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

/** Orden mostrado para la columna derecha de "relacionar" (determinista). */
export const matchRightOrder = (q: Extract<QuestionT, { kind: 'match' }>) => shuffledOrder(q.pairs.length, q.id + 'R');

export function isAnswered(r: Response): boolean {
  switch (r.kind) {
    case 'mcq': return r.choice !== null;
    case 'identify': return r.eqId !== null;
    case 'order': return true;
    case 'match': return r.picks.every((p) => p !== null);
  }
}

export function grade(q: QuestionT, r: Response): boolean {
  if (q.kind === 'mcq' && r.kind === 'mcq') return r.choice === q.answer;
  if (q.kind === 'identify' && r.kind === 'identify') return r.eqId === q.answerEquipmentId;
  if (q.kind === 'order' && r.kind === 'order') return r.order.every((item, pos) => q.correctOrder[pos] === item);
  if (q.kind === 'match' && r.kind === 'match') return r.picks.every((p, i) => p === i);
  return false;
}

export function score(qs: QuestionT[], rs: Response[]): { correct: number; total: number; ratio: number } {
  const correct = qs.filter((q, i) => grade(q, rs[i])).length;
  return { correct, total: qs.length, ratio: qs.length ? correct / qs.length : 0 };
}
