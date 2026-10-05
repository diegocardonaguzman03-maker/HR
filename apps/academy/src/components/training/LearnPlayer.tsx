import { useEffect, useState } from 'react';
import { content, idx } from '../../lib/content';
import { emptyResponse, grade, isAnswered, type Response } from '../../lib/assessment';
import { getProgress, markLesson } from '../../lib/progress';
import { track } from '../../lib/analytics';
import { useApp } from '../../stores/useApp';
import { QuestionView } from './QuestionView';
import { Bullets, OpText, StatusChip, btn, btnPrimary } from '../ui/Status';

export function LearnPlayer() {
  const { moduleId, lessonIdx, set, setMode, flyTo } = useApp();
  const mod = moduleId ? idx.module.get(moduleId) : null;
  const lesson = mod?.lessons[lessonIdx];
  useEffect(() => {
    if (!lesson) { set({ focusNodes: [] }); return; }
    set({ focusNodes: lesson.focus, selectedEq: null, selectedStage: null });
    const st = lesson.stageId ? idx.stage.get(lesson.stageId) : null;
    const cam = lesson.camera ?? st?.camera;
    if (cam) flyTo(cam); else if (lesson.focus.length) useApp.getState().fitNodes(lesson.focus);
  }, [lesson, set, flyTo]);

  if (!mod) {
    const p = getProgress();
    return (
      <div className="scroll-thin h-full overflow-y-auto p-4" data-testid="module-list">
        <h2 className="text-[19px] font-semibold">Aprender</h2>
        <p className="mb-4 text-[13px] text-[var(--color-text-2)]">Lecciones guiadas sobre el modelo 3D. El modelo resalta lo que se explica.</p>
        <div className="space-y-2">{content.training.map((m) => { const doneN = (p.lessons[m.id] ?? []).length; return (
          <article key={m.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3">
            <div className="mb-1 flex items-center gap-2"><StatusChip status={m.status} compact /><span className="font-mono text-[11px] text-[var(--color-text-3)]">{m.durationMin} min · {m.lessons.length} lecciones · {doneN}/{m.lessons.length} completas</span></div>
            <h3 className="font-semibold">{m.title}</h3>
            <p className="mt-1 text-[12.5px] text-[var(--color-text-2)]">{m.summary}</p>
            <button className={btnPrimary + ' mt-2'} onClick={() => { set({ moduleId: m.id, lessonIdx: 0 }); track('started', m.id); }} data-testid={`open-${m.id}`}>{doneN ? 'Continuar' : 'Comenzar'}</button>
          </article>); })}</div>
      </div>
    );
  }
  const last = lessonIdx >= mod.lessons.length;
  return (
    <div className="flex h-full flex-col" data-testid="learn-player">
      <div className="border-b border-[var(--color-line)] p-4">
        <button className="label hover:text-[var(--color-text)]" onClick={() => set({ moduleId: null, focusNodes: [] })}>← Módulos</button>
        <h2 className="mt-1 font-semibold leading-tight">{mod.title}</h2>
        <div className="mt-2 flex gap-1" role="progressbar" aria-label="Avance del módulo" aria-valuemin={0} aria-valuemax={mod.lessons.length} aria-valuenow={Math.min(lessonIdx + 1, mod.lessons.length)}>
          {mod.lessons.map((l, i) => <button key={l.id} aria-label={`Lección ${i + 1}: ${l.title}`} onClick={() => set({ lessonIdx: i })} className={`h-1.5 flex-1 rounded ${i < lessonIdx ? 'bg-[var(--color-accent)]/60' : i === lessonIdx ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-3)]'}`} />)}
        </div>
      </div>
      {last ? (
        <div className="scroll-thin flex-1 overflow-y-auto p-4" data-testid="module-complete">
          <p className="label">Módulo completado</p>
          <h3 className="mb-2 text-[18px] font-semibold"><span aria-hidden>✔ </span>Terminaste «{mod.title}»</h3>
          <p className="mb-3 text-[13px] text-[var(--color-text-2)]">Objetivos trabajados:</p>
          <Bullets items={mod.objectives} />
          <div className="mt-4 flex flex-wrap gap-2">
            {mod.workInstructionIds.map((w) => <button key={w} className={btn} onClick={() => { set({ wiId: w }); setMode('perform'); }}>Practicar la instrucción (EJECUTAR)</button>)}
            {mod.assessmentId && <button className={btnPrimary} onClick={() => { set({ assessmentId: mod.assessmentId! }); setMode('assess'); }}>Ir a la evaluación</button>}
          </div>
        </div>
      ) : (
        <Lesson key={mod.lessons[lessonIdx].id} modId={mod.id} i={lessonIdx} />
      )}
      <div className="flex justify-between gap-2 border-t border-[var(--color-line)] p-3">
        <button className={btn} disabled={lessonIdx === 0} onClick={() => set({ lessonIdx: lessonIdx - 1 })}>← Anterior</button>
        {!last && <button className={btnPrimary} data-testid="next-lesson" onClick={() => { markLesson(mod.id, mod.lessons[lessonIdx].id); track('progressed', mod.lessons[lessonIdx].id); if (lessonIdx + 1 >= mod.lessons.length) track('completed', mod.id); set({ lessonIdx: lessonIdx + 1 }); }}>{lessonIdx + 1 >= mod.lessons.length ? 'Terminar módulo' : 'Siguiente lección →'}</button>}
      </div>
    </div>
  );
}

function Lesson({ modId, i }: { modId: string; i: number }) {
  const l = idx.module.get(modId)!.lessons[i];
  return (
    <div className="scroll-thin flex-1 overflow-y-auto p-4" data-testid={`lesson-${l.id}`}>
      <p className="label">Lección {i + 1}{l.stageId ? ` · Etapa ${idx.stage.get(l.stageId)?.code}` : ''}</p>
      <h3 className="mb-3 text-[18px] font-semibold leading-tight">{l.title}</h3>
      <div className="space-y-2 text-[14px] leading-relaxed text-[var(--color-text-2)]">{l.body.map((b, k) => <p key={k}><OpText text={b} /></p>)}</div>
      <div className="mt-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3">
        <h4 className="label mb-2">Puntos clave</h4>
        <Bullets items={l.keyPoints} />
      </div>
      {l.checkIds.map((qid) => <Check key={qid} qid={qid} />)}
    </div>
  );
}

function Check({ qid }: { qid: string }) {
  const q = idx.question.get(qid)!;
  const [r, setR] = useState<Response>(() => emptyResponse(q));
  const [shown, setShown] = useState(false);
  const ok = grade(q, r);
  return (
    <div className="mt-4 rounded-lg border border-[var(--color-line)] p-3" data-testid={`check-${qid}`}>
      <p className="label mb-2">Comprueba</p>
      <QuestionView q={q} r={r} onChange={(x) => { setR(x); setShown(false); }} />
      <button className={btn + ' mt-2'} disabled={!isAnswered(r)} onClick={() => { setShown(true); useApp.getState().set({ picking: false }); }}>Verificar</button>
      {shown && <p role="status" className="mt-2 text-[13px]"><strong className={ok ? 'text-[var(--color-safe)]' : 'text-[var(--color-danger)]'}>{ok ? '✔ Correcto. ' : '✕ Aún no. '}</strong>{q.explanation}</p>}
    </div>
  );
}
