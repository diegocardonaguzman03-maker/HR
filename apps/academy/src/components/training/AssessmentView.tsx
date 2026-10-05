import { useMemo, useRef, useState } from 'react';
import { content, idx } from '../../lib/content';
import { emptyResponse, grade, isAnswered, isPassed, score, type Response } from '../../lib/assessment';
import { recordAttempt, resetProgress } from '../../lib/progress';
import { clearEvents, enabled, resetActor, setEnabled, track } from '../../lib/analytics';
import { useApp } from '../../stores/useApp';
import { QuestionView } from './QuestionView';
import { StatusChip, btn, btnPrimary } from '../ui/Status';
import type { AssessmentT, QuestionT } from '../../types/content';

/** TRN-03: para qué NO se usa el resultado (pendiente de visto bueno de experto-relaciones-laborales). */
export const NOT_FOR_HR = 'Esta evaluación es solo para tu aprendizaje. No es una constancia DC-3, no te habilita para operar y no se usa para escalafón, ascensos, cambios de puesto, sanciones ni bonos. Puedes repetirla las veces que necesites.';
const CRITICAL_MISSED = 'Para terminar necesitas contestar bien todas las preguntas de seguridad (marcadas con ▲). Repasa el módulo de seguridad y vuelve a intentarlo.';

function NotForHr() {
  return <p role="note" className="mb-3 rounded border border-[var(--color-line)] bg-[var(--color-surface-2)] p-2 text-[13px]" data-testid="not-for-hr"><strong><span aria-hidden>ⓘ </span>{NOT_FOR_HR.split('. ')[0]}.</strong> {NOT_FOR_HR.split('. ').slice(1).join('. ')}</p>;
}

/** TRN-12: aviso de registro local y control para desactivarlo o borrar lo guardado en un equipo compartido. */
function RecordingNotice() {
  const [on, setOn] = useState(enabled());
  const [cleared, setCleared] = useState(false);
  return (
    <div className="mb-4 rounded border border-[var(--color-line)] p-2 text-[12.5px] text-[var(--color-text-2)]" data-testid="recording-notice">
      <p>
        {on
          ? 'Esta plataforma guarda en este equipo, sin tu nombre, qué lecciones viste y tu resultado, para mejorar el curso.'
          : 'El registro está desactivado: en este equipo no se guarda qué lecciones viste ni tu resultado.'}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button className={btn} aria-pressed={!on} onClick={() => { setEnabled(!on); setOn(!on); }} data-testid="toggle-recording">{on ? 'Desactivar registro' : 'Activar registro'}</button>
        <button className={btn} onClick={() => { clearEvents(); resetProgress(); resetActor(); setCleared(true); }} data-testid="clear-shared">Terminar sesión en equipo compartido</button>
      </div>
      {cleared && <p role="status" className="mt-1">Listo: se borró lo guardado en este equipo.</p>}
    </div>
  );
}

const scoreOf = (a: AssessmentT, qs: QuestionT[], rs: Response[]) => score(qs, rs, { critical: a.criticalQuestionIds, unscored: a.unscoredQuestionIds });

export function AssessmentView() {
  const assessmentId = useApp((s) => s.assessmentId), set = useApp((s) => s.set), setMode = useApp((s) => s.setMode);
  const a = assessmentId ? idx.assessment.get(assessmentId) : null;
  if (!a) {
    return (
      <div className="scroll-thin h-full overflow-y-auto p-4" data-testid="assessment-list">
        <h2 className="text-[19px] font-semibold">Evaluar</h2>
        <p className="mb-3 text-[13px] text-[var(--color-text-2)]">Comprueba tu comprensión. Es una evaluación de conocimiento: <strong>no certifica competencia</strong> para operar.</p>
        <NotForHr />
        <RecordingNotice />
        {content.assessments.map((x) => {
          const scored = x.questionIds.length - x.unscoredQuestionIds.length;
          return (
            <article key={x.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3">
              <StatusChip status={x.status} compact />
              <h3 className="mt-1 font-semibold">{x.title}</h3>
              <p className="text-[12.5px] text-[var(--color-text-2)]">
                {x.questionIds.length} preguntas ({scored} calificadas) · mínimo {Math.round(x.passScore * 100)} %
                {x.criticalQuestionIds.length > 0 && <> y las {x.criticalQuestionIds.length} preguntas de seguridad (<span aria-hidden>▲</span><span className="sr-only">marcadas con triángulo</span>) bien contestadas</>}
              </p>
              <button className={btnPrimary + ' mt-2'} onClick={() => { set({ assessmentId: x.id }); track('started', x.id); }} data-testid={`start-${x.id}`}>Comenzar</button>
            </article>
          );
        })}
      </div>
    );
  }
  return <Runner key={a.id} asmId={a.id} onExit={() => { set({ assessmentId: null, picking: false }); setMode('assess'); }} />;
}

function Runner({ asmId, onExit }: { asmId: string; onExit: () => void }) {
  const a = idx.assessment.get(asmId)!;
  const qs = useMemo(() => a.questionIds.map((id) => idx.question.get(id)!).filter(Boolean), [a]);
  const [i, setI] = useState(0);
  const [rs, setRs] = useState<Response[]>(() => qs.map(emptyResponse));
  const [done, setDone] = useState(false);
  const t0 = useRef(Date.now());
  const set = useApp((s) => s.set), setMode = useApp((s) => s.setMode);
  const critical = new Set(a.criticalQuestionIds);
  const finish = () => {
    const s = scoreOf(a, qs, rs);
    const passed = isPassed(s, a.passScore);
    const attempt = recordAttempt(a.id, s.ratio, passed, s.criticalOk);
    // TRN-11 (mínimo): respuesta por ítem y puntaje bruto, intento y duración; sin texto libre
    qs.forEach((q, k) => track('answered', q.id, { success: grade(q, rs[k]), attempt, critical: critical.has(q.id), scored: !a.unscoredQuestionIds.includes(q.id) }));
    track(passed ? 'passed' : 'failed', a.id, { score: Number(s.ratio.toFixed(2)), success: passed, raw: s.correct, max: s.total, attempt, criticalOk: s.criticalOk, durationSec: Math.round((Date.now() - t0.current) / 1000) });
    set({ picking: false });
    setDone(true);
  };
  if (done) {
    const s = scoreOf(a, qs, rs);
    const passed = isPassed(s, a.passScore);
    const wrongTopics = [...new Set(qs.filter((q, k) => !grade(q, rs[k])).map((q) => q.topic))];
    const recs = a.recommendations.filter((r) => wrongTopics.includes(r.topic));
    const goTo = (moduleId: string, lessonId?: string) => {
      const mod = idx.module.get(moduleId);
      const k = lessonId && mod ? mod.lessons.findIndex((l) => l.id === lessonId) : -1;
      set({ moduleId, lessonIdx: Math.max(0, k) });
      setMode('learn');
    };
    return (
      <div className="scroll-thin h-full overflow-y-auto p-4" data-testid="assessment-result" data-passed={passed}>
        <p className="label">Resultado</p>
        <h2 className="text-[22px] font-semibold leading-tight"><span aria-hidden>{passed ? '✔ ' : '✕ '}</span>{passed ? 'Aprobaste la evaluación de conocimiento' : 'Aún no apruebas la evaluación de conocimiento'} — {s.correct} de {s.total} ({Math.round(s.ratio * 100)} %)</h2>
        {a.unscoredQuestionIds.length > 0 && <p className="mt-1 text-[12.5px] text-[var(--color-text-2)]">{a.unscoredQuestionIds.length === 1 ? 'Una pregunta es' : `${a.unscoredQuestionIds.length} preguntas son`} de repaso y no cuenta{a.unscoredQuestionIds.length === 1 ? '' : 'n'} para la calificación.</p>}
        {!s.criticalOk && (
          <p role="alert" className="mt-3 rounded border border-[var(--color-danger)]/70 bg-[var(--color-danger)]/10 p-2 text-[13px]" data-testid="critical-missed">
            <strong><span aria-hidden>▲ </span>{CRITICAL_MISSED}</strong>
          </p>
        )}
        <p role="note" className="my-3 rounded border border-[var(--color-st-sme)]/60 bg-[var(--color-st-sme)]/10 p-2 text-[13px]">
          <strong><span aria-hidden>⚠ </span>Este resultado no certifica competencia.</strong> Es evidencia de conocimiento. La competencia para operar la evalúa y firma un evaluador en piso con el procedimiento aprobado de la planta, bajo supervisión.
        </p>
        <NotForHr />
        {recs.length > 0 && (<>
          <h3 className="label mb-2 mt-4">Te recomendamos repasar</h3>
          <ul className="space-y-1.5">{recs.map((r, k) => {
            const les = r.lessonId ? idx.module.get(r.moduleId)?.lessons.find((l) => l.id === r.lessonId) : undefined;
            return <li key={k}><button className={btn + ' text-left'} onClick={() => goTo(r.moduleId, r.lessonId)} data-testid="recommendation">{r.topic} → {idx.module.get(r.moduleId)?.title}{les ? ` · ${les.title}` : ''}</button></li>;
          })}</ul>
        </>)}
        <h3 className="label mb-2 mt-5">Revisión</h3>
        <ol className="space-y-2">{qs.map((q, k) => { const ok = grade(q, rs[k]); const r = rs[k]; return (
          <li key={q.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3 text-[13px]">
            <p className="font-medium">
              <span className={ok ? 'text-[var(--color-safe)]' : 'text-[var(--color-danger)]'}>{ok ? '✔ Correcta' : '✕ Incorrecta'}</span>
              {critical.has(q.id) && <> · <span className="font-mono text-[11px]"><span aria-hidden>▲ </span>Pregunta de seguridad</span></>}
              {a.unscoredQuestionIds.includes(q.id) && <> · <span className="font-mono text-[11px] text-[var(--color-text-2)]">No cuenta para la calificación</span></>}
              {' · '}{q.prompt}
            </p>
            {/* TRN-17: en «ordenar» se muestra qué orden diste y cuál es el correcto */}
            {q.kind === 'order' && r.kind === 'order' && !ok && (
              <div className="mt-1 grid gap-1 text-[12.5px] sm:grid-cols-2">
                <div><span className="label block">Tu orden</span><ol className="list-decimal pl-5">{r.order.map((it) => <li key={it}>{q.items[it]}</li>)}</ol></div>
                <div><span className="label block">Orden correcto</span><ol className="list-decimal pl-5">{q.correctOrder.map((it) => <li key={it}>{q.items[it]}</li>)}</ol></div>
              </div>
            )}
            <p className="mt-1 text-[var(--color-text-2)]">{q.explanation}</p>
          </li>); })}</ol>
        <div className="mt-4 flex gap-2"><button className={btn} onClick={onExit}>Volver</button></div>
      </div>
    );
  }
  const q = qs[i];
  return (
    <div className="flex h-full flex-col" data-testid="assessment-runner">
      <div className="border-b border-[var(--color-line)] p-4">
        <p className="label">{a.title}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded bg-[var(--color-surface-3)]" role="progressbar" aria-valuemin={0} aria-valuemax={qs.length} aria-valuenow={i + 1} aria-label="Avance de la evaluación">
            <div className="h-full bg-[var(--color-accent)]" style={{ width: `${((i + 1) / qs.length) * 100}%` }} />
          </div>
          <span className="font-mono text-[12px] text-[var(--color-text-3)]">{i + 1}/{qs.length}</span>
        </div>
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto p-4">
        <QuestionView key={q.id} q={q} r={rs[i]} critical={critical.has(q.id)} onChange={(r) => setRs((x) => x.map((y, k) => (k === i ? r : y)))} />
      </div>
      <div className="flex justify-between gap-2 border-t border-[var(--color-line)] p-3">
        <button className={btn} disabled={i === 0} onClick={() => setI(i - 1)}>← Anterior</button>
        {i < qs.length - 1
          ? <button className={btnPrimary} disabled={!isAnswered(rs[i])} onClick={() => setI(i + 1)} data-testid="next-question">Siguiente →</button>
          : <button className={btnPrimary} disabled={!rs.every(isAnswered)} onClick={finish} data-testid="finish-assessment">Terminar evaluación</button>}
      </div>
    </div>
  );
}
