import { useMemo, useState } from 'react';
import { content, idx } from '../../lib/content';
import { emptyResponse, grade, isAnswered, score, type Response } from '../../lib/assessment';
import { recordAttempt } from '../../lib/progress';
import { track } from '../../lib/analytics';
import { useApp } from '../../stores/useApp';
import { QuestionView } from './QuestionView';
import { StatusChip, btn, btnPrimary } from '../ui/Status';

export function AssessmentView() {
  const { assessmentId, set, setMode } = useApp();
  const a = assessmentId ? idx.assessment.get(assessmentId) : null;
  if (!a) {
    return (
      <div className="p-4" data-testid="assessment-list">
        <h2 className="text-[19px] font-semibold">Evaluar</h2>
        <p className="mb-4 text-[13px] text-[var(--color-text-2)]">Comprueba tu comprensión. Es una evaluación de conocimiento: <strong>no certifica competencia</strong> para operar.</p>
        {content.assessments.map((x) => (
          <article key={x.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3">
            <StatusChip status={x.status} compact />
            <h3 className="mt-1 font-semibold">{x.title}</h3>
            <p className="text-[12.5px] text-[var(--color-text-3)]">{x.questionIds.length} preguntas · aprobación {Math.round(x.passScore * 100)} %</p>
            <button className={btnPrimary + ' mt-2'} onClick={() => { set({ assessmentId: x.id }); track('started', x.id); }} data-testid={`start-${x.id}`}>Comenzar</button>
          </article>
        ))}
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
  const { setMode, set } = useApp();
  const finish = () => {
    const s = score(qs, rs);
    const passed = s.ratio >= a.passScore;
    recordAttempt(a.id, s.ratio, passed);
    track(passed ? 'passed' : 'failed', a.id, { score: Number(s.ratio.toFixed(2)), success: passed });
    set({ picking: false });
    setDone(true);
  };
  if (done) {
    const s = score(qs, rs);
    const passed = s.ratio >= a.passScore;
    const wrongTopics = [...new Set(qs.filter((q, k) => !grade(q, rs[k])).map((q) => q.topic))];
    const recs = a.recommendations.filter((r) => wrongTopics.includes(r.topic));
    return (
      <div className="scroll-thin h-full overflow-y-auto p-4" data-testid="assessment-result">
        <p className="label">Resultado</p>
        <h2 className="text-[22px] font-semibold"><span aria-hidden>{passed ? '✔ ' : '✕ '}</span>{passed ? 'Aprobado' : 'No aprobado'} — {s.correct} de {s.total} ({Math.round(s.ratio * 100)} %)</h2>
        <p role="note" className="my-3 rounded border border-[var(--color-st-sme)]/60 bg-[var(--color-st-sme)]/10 p-2 text-[13px]">
          <strong><span aria-hidden>⚠ </span>Este resultado no certifica competencia.</strong> Es evidencia de conocimiento. La competencia para operar la evalúa y firma un evaluador en piso con el procedimiento aprobado de la planta, bajo supervisión.
        </p>
        {recs.length > 0 && (<>
          <h3 className="label mb-2 mt-4">Te recomendamos repasar</h3>
          <ul className="space-y-1.5">{recs.map((r, k) => (<li key={k}><button className={btn} onClick={() => { set({ moduleId: r.moduleId, lessonIdx: 0 }); setMode('learn'); }}>{r.topic} → {idx.module.get(r.moduleId)?.title}</button></li>))}</ul>
        </>)}
        <h3 className="label mb-2 mt-5">Revisión</h3>
        <ol className="space-y-2">{qs.map((q, k) => { const ok = grade(q, rs[k]); return (
          <li key={q.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3 text-[13px]">
            <p className="font-medium"><span className={ok ? 'text-[var(--color-safe)]' : 'text-[var(--color-danger)]'}>{ok ? '✔ Correcta' : '✕ Incorrecta'}</span> · {q.prompt}</p>
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
        <QuestionView key={q.id} q={q} r={rs[i]} onChange={(r) => setRs((x) => x.map((y, k) => (k === i ? r : y)))} />
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
