/** Progreso local del alumno (solo en este navegador). */
type Progress = { lessons: Record<string, string[]>; wi: Record<string, number[]>; attempts: { asm: string; ratio: number; passed: boolean; ts: string }[] };
const KEY = 'adx.progress';
export function getProgress(): Progress {
  try { return { lessons: {}, wi: {}, attempts: [], ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return { lessons: {}, wi: {}, attempts: [] }; }
}
export function saveProgress(p: Progress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* sin almacenamiento */ } }
export function markLesson(mod: string, les: string) {
  const p = getProgress(); const l = new Set(p.lessons[mod] ?? []); l.add(les); p.lessons[mod] = [...l]; saveProgress(p);
}
export function recordAttempt(asm: string, ratio: number, passed: boolean) {
  const p = getProgress(); p.attempts.push({ asm, ratio, passed, ts: new Date().toISOString() }); saveProgress(p);
}
export function resetProgress() { saveProgress({ lessons: {}, wi: {}, attempts: [] }); }
