import type { QuestionT } from './content/schema';

export type Response =
  | { kind: 'mcq'; choice: number | null }
  | { kind: 'identify'; eqId: string | null }
  /** touched: el alumno movió al menos un elemento (TRN-17); sin eso la pregunta no cuenta como contestada. */
  | { kind: 'order'; order: number[]; touched?: boolean }
  | { kind: 'match'; picks: (number | null)[] };

export function emptyResponse(q: QuestionT): Response {
  switch (q.kind) {
    case 'mcq': return { kind: 'mcq', choice: null };
    case 'identify': return { kind: 'identify', eqId: null };
    case 'order': return { kind: 'order', order: shuffledOrder(q.items.length, q.id), touched: false };
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
    case 'order': return r.touched === true;
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

export interface ScoreOptions { critical?: readonly string[]; unscored?: readonly string[] }
export interface Score { correct: number; total: number; ratio: number; criticalOk: boolean; criticalMissed: string[] }

/**
 * Puntaje de conocimiento (TRN-01 / SAF-09).
 * - Las preguntas `unscored` se muestran pero no cuentan para la calificación.
 * - `criticalOk` es falso si alguna pregunta crítica de seguridad quedó mal.
 */
export function score(qs: QuestionT[], rs: Response[], opt: ScoreOptions = {}): Score {
  const scored = qs.map((q, i) => ({ q, ok: grade(q, rs[i]) })).filter(({ q }) => !opt.unscored?.includes(q.id));
  const correct = scored.filter((x) => x.ok).length;
  const criticalMissed = qs.filter((q, i) => opt.critical?.includes(q.id) && !grade(q, rs[i])).map((q) => q.id);
  return { correct, total: scored.length, ratio: scored.length ? correct / scored.length : 0, criticalOk: criticalMissed.length === 0, criticalMissed };
}

/** Aprobar la evaluación de conocimiento = alcanzar el mínimo **y** contestar bien todas las preguntas críticas. */
export const isPassed = (s: Score, passScore: number) => s.ratio >= passScore && s.criticalOk;
