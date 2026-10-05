import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { MissionT, SceneDefT, StepT } from '../schema';
import { useMission } from '../store';
import { Interaction } from '../interactions';
import { OpText } from '../../components/ui/Status';
import { DISCLAIMER } from '../../components/ui/Disclaimer';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { track } from '../../lib/analytics';

const MissionScene = lazy(() => import('../scene/MissionScene'));

const TYPE_LABEL: Record<StepT['type'], string> = { observe: 'Observa', identify: 'Identifica', confirm: 'Confirma', inspect: 'Inspecciona', select: 'Selecciona', sequence: 'Ordena', decide: 'Decide', demonstrate: 'Demuestra' };

/** Barra superior mínima: misión · paso · progreso. */
function MissionHeader({ m, i, onExit }: { m: MissionT; i: number; onExit: () => void }) {
  const results = useMission((s) => s.results);
  return (
    <header className="flex items-center gap-4 border-b border-white/10 bg-[#0c0e11]/95 px-4 py-2.5">
      <button onClick={onExit} className="rounded-md px-2 py-1 text-[13px] text-white/60 hover:bg-white/10 hover:text-white" aria-label="Salir al mapa de misiones" data-testid="exit-mission">← Mapa</button>
      <div className="min-w-0 leading-tight">
        <p className="font-mono text-[11px] tracking-widest text-[var(--color-accent)]">MISIÓN {m.number}</p>
        <p className="truncate text-[15px] font-semibold text-white">{m.title} <span className="font-normal text-white/50">· {m.subtitle}</span></p>
      </div>
      <div className="ml-auto flex items-center gap-3" aria-label={`Paso ${i + 1} de ${m.steps.length}`}>
        <span className="font-mono text-[13px] text-white" data-testid="step-counter">{String(i + 1).padStart(2, '0')} / {String(m.steps.length).padStart(2, '0')}</span>
        <ol className="hidden gap-1.5 sm:flex" aria-hidden>
          {m.steps.map((s, k) => <li key={s.id} title={s.title} className={`h-2.5 w-2.5 rounded-full ${results[s.id]?.done ? 'bg-[#30a46c]' : k === i ? 'bg-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40' : 'bg-white/20'}`} />)}
        </ol>
      </div>
    </header>
  );
}

/** Retroalimentación inmediata sobre el escenario. */
function FeedbackToast() {
  const fb = useMission((s) => s.feedback);
  const set = useMission((s) => s.set);
  // los errores NO se cierran solos: se leen a su ritmo (SAF-H-12, RT-MUX-03)
  useEffect(() => { if (!fb || fb.kind === 'bad' || fb.kind === 'warn') return; const t = setTimeout(() => set({ feedback: null }), 6000); return () => clearTimeout(t); }, [fb, set]);
  if (!fb) return null;
  const tone = fb.kind === 'ok' ? 'border-[#30a46c] bg-[#0f2a1d]' : fb.kind === 'bad' ? 'border-[#e5484d] bg-[#2a1214]' : fb.kind === 'warn' ? 'border-[#f5c518] bg-[#2a2410]' : 'border-[#6e9fd8] bg-[#121d2b]';
  const icon = fb.kind === 'ok' ? '✓' : fb.kind === 'bad' ? '↻' : fb.kind === 'warn' ? '' : '💡';
  return (
    <div role="status" aria-live="polite" data-testid="feedback" data-kind={fb.kind} key={fb.key}
      className={`pointer-events-auto absolute left-1/2 top-4 z-20 w-[min(560px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border-l-4 ${tone} px-4 py-3 shadow-2xl`}>
      <p className="text-[15px] font-semibold text-white"><span aria-hidden className="mr-1.5">{icon}</span>{fb.title}{fb.kind === 'bad' && <span className="ml-2 text-[12px] font-normal text-white/60">Intenta de nuevo</span>}</p>
      <p className="mt-0.5 text-[13.5px] text-white/85"><OpText text={fb.text} /></p>
      <button onClick={() => set({ feedback: null })} className="absolute right-2 top-2 rounded px-1.5 text-white/50 hover:text-white" aria-label="Cerrar mensaje">✕</button>
    </div>
  );
}

/** Ayuda contextual: se abre encima del escenario y al cerrar regresas al mismo paso. */
function ContextDrawer({ m, step }: { m: MissionT; step: StepT }) {
  const { drawer, set } = useMission();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!drawer) return;
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') set({ drawer: null }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawer, set]);
  if (!drawer) return null;
  const title = drawer === 'why' ? '¿Por qué?' : drawer === 'procedure' ? 'Ver procedimiento' : 'Pregunta sobre este paso';
  const sections = m.procedure.sections.filter((s) => step.reference.includes(s.id));
  return (
    <aside ref={ref} role="dialog" aria-modal="false" aria-label={title} data-testid="context-drawer"
      className="absolute inset-y-3 right-3 z-30 flex w-[min(400px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#14181d]/97 shadow-2xl backdrop-blur">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-[16px] font-semibold text-white">{title}</h2>
        <button onClick={() => set({ drawer: null })} className="rounded-md px-2 py-1 text-[13px] text-white/70 hover:bg-white/10" data-testid="drawer-close">Volver al paso ✕</button>
      </header>
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[14px] text-white/85">
        {drawer === 'why' && (<>
          <p className="text-[15px] text-white"><OpText text={step.why} /></p>
          {step.safety && <p className="rounded-lg border border-[#f5c518]/50 bg-[#f5c518]/10 p-3"><span aria-hidden>⚠ </span><OpText text={step.safety} /></p>}
        </>)}
        {drawer === 'procedure' && (<>
          <p className="rounded-lg border border-[#a78bfa]/50 bg-[#a78bfa]/10 p-3 text-[12.5px]"><strong>◇ {m.procedure.title}.</strong> <OpText text={m.procedure.note} /></p>
          {(sections.length ? sections : m.procedure.sections).map((s) => (
            <section key={s.id}>
              <h3 className="mb-1 font-semibold text-white">{s.title}</h3>
              <ul className="space-y-1.5">{s.items.map((t, i) => <li key={i} className="flex gap-2"><span aria-hidden className="text-white/40">•</span><OpText text={t} /></li>)}</ul>
            </section>
          ))}
          {sections.length > 0 && sections.length < m.procedure.sections.length && <p className="text-[12px] text-white/50">Se muestra la parte del procedimiento de este paso.</p>}
        </>)}
        {drawer === 'ask' && (<>
          {step.faq.length ? step.faq.map((f, i) => (
            <details key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3" open={i === 0}>
              <summary className="cursor-pointer font-semibold text-white">{f.q}</summary>
              <p className="mt-2"><OpText text={f.a} /></p>
            </details>
          )) : <p>No hay preguntas registradas para este paso.</p>}
          <p className="text-[12px] text-white/50">Respuestas de demostración, pendientes de validación por Seguridad. El asistente de texto libre está desactivado en el piloto por decisión de Seguridad. Si tienes una duda sobre la tarea real, pregunta a tu supervisor.</p>
        </>)}
      </div>
      <p className="border-t border-white/10 px-4 py-2 text-[11px] text-white/50"><span aria-hidden>⚠ </span>{DISCLAIMER}</p>
    </aside>
  );
}

/** Tarjeta de inicio del paso: SHOW ME + EXPLAIN antes de LET ME TRY. */
function StepIntro({ step, i, total, onStart }: { step: StepT; i: number; total: number; onStart: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus(); }, []);
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/45 p-4" data-testid="step-intro">
      <div className="w-[min(520px,100%)] rounded-2xl border border-white/15 bg-[#14181d]/95 p-6 text-center shadow-2xl">
        <p className="font-mono text-[12px] tracking-widest text-[var(--color-accent)]">PASO {i + 1} DE {total} · {TYPE_LABEL[step.type].toUpperCase()}</p>
        <h2 className="mt-2 text-[26px] font-bold leading-tight text-white">{step.title}</h2>
        <p className="mx-auto mt-3 max-w-[42ch] text-[15px] text-white/80"><OpText text={step.why} /></p>
        <p className="mx-auto mt-3 max-w-[44ch] rounded-lg bg-white/[0.05] px-3 py-2 text-[14px] text-white"><span className="font-semibold text-[var(--color-accent)]">Lo que vas a hacer: </span><OpText text={step.instruction} /></p>
        {step.show.length > 0 && <p className="mt-2 text-[12px] text-white/55">Primero verás una demostración corta.</p>}
        <button ref={btn} onClick={onStart} className="mt-5 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-[16px] font-bold text-[#1a1203] hover:brightness-110" data-testid="step-start">Comenzar paso →</button>
      </div>
    </div>
  );
}

/** Demostración en el escenario (placeholder de video): cámara + resalte + subtítulo. */
function useDemo(m: MissionT, step: StepT, onEnd: () => void) {
  const { set, flyTo } = useMission.getState();
  const timers = useRef<number[]>([]);
  const stop = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; set({ demo: false, caption: null, focus: [] }); flyTo(step.camera); onEnd(); }, [set, flyTo, step, onEnd]);
  const play = useCallback(() => {
    const stops = step.show.length ? step.show : step.type === 'observe' ? step.tour : [{ camera: step.camera, focus: [], caption: step.why }];
    set({ demo: true, drawer: null });
    track('played', `${m.id}#${step.id}#demo`);
    stops.forEach((s, k) => timers.current.push(window.setTimeout(() => { flyTo(s.camera); set({ focus: s.focus, caption: s.caption }); }, k * 3200)));
    timers.current.push(window.setTimeout(stop, stops.length * 3200 + 400));
  }, [m.id, step, set, flyTo, stop]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { play, stop };
}

export function MissionPlayer({ m, scene, onExit, onComplete }: { m: MissionT; scene: SceneDefT; onExit: () => void; onComplete: () => void }) {
  const { stepIdx, phase, results, caption, demo, listMode, set, flyTo, record, resetStepScene } = useMission();
  const step = m.steps[stepIdx];
  const res = results[step.id];
  const done = !!res?.done;
  const [ready, setReady] = useState(false);
  const { play, stop } = useDemo(m, step, () => { if (useMission.getState().phase === 'show') set({ phase: 'try' }); });
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => { resetStepScene(); flyTo(step.camera); set({ phase: done ? 'done' : 'intro' }); }, [stepIdx]); // eslint-disable-line react-hooks/exhaustive-deps
  const onDone = useCallback((mistakes: number, wrong?: string[]) => {
    record(step.id, { mistakes, done: true, wrong });
    set({ phase: 'done' });
    track('progressed', `${m.id}#${step.id}`, { mistakes });
    setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-testid=continue]')?.focus(), 50);
  }, [m.id, step.id, record, set]);
  const next = () => {
    if (stepIdx + 1 >= m.steps.length) { set({ endedAt: Date.now() }); onComplete(); return; }
    set({ stepIdx: stepIdx + 1 });
  };

  return (
    <div className="flex h-full flex-col bg-[#0c0e11] text-white" data-testid="mission-player">
      <MissionHeader m={m} i={stepIdx} onExit={onExit} />
      <main className="relative min-h-[42vh] flex-1" aria-label="Escenario">
        <ErrorBoundary fallback={<div className="grid h-full place-items-center p-6 text-center text-white/70">El 3D no está disponible en este equipo. Puedes continuar con la opción «Usar lista».</div>}>
          <Suspense fallback={<div className="grid h-full place-items-center text-white/60">Cargando escenario…</div>}>
            <MissionScene scene={scene} onReady={() => setReady(true)} />
          </Suspense>
        </ErrorBoundary>
        {!ready && <div className="absolute inset-0 grid place-items-center bg-[#0c0e11] text-white/60" data-testid="scene-loading">Preparando el escenario…</div>}
        {caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-4" aria-live="polite">
            <p className="max-w-[640px] rounded-xl bg-black/75 px-4 py-2.5 text-center text-[16px] font-medium text-white shadow-xl" data-testid="caption">{demo && <span className="mr-2 font-mono text-[11px] text-[#a78bfa]">▶ DEMO</span>}{caption}</p>
          </div>
        )}
        {demo && <button onClick={stop} className="absolute right-4 top-4 z-20 rounded-lg bg-black/70 px-3 py-1.5 text-[13px] text-white hover:bg-black/90">Saltar demostración ✕</button>}
        <FeedbackToast />
        <ContextDrawer m={m} step={step} />
        {ready && phase === 'intro' && <StepIntro step={step} i={stepIdx} total={m.steps.length} onStart={() => { track('started', `${m.id}#${step.id}`); if (step.show.length) { set({ phase: 'show' }); play(); } else set({ phase: 'try' }); }} />}
      </main>

      <section ref={panel} aria-label={`Paso ${stepIdx + 1}: ${step.title}`} className="scroll-thin max-h-[48vh] overflow-y-auto border-t border-white/10 bg-[#111418] px-4 py-3 sm:px-6 lg:max-h-none" data-testid="step-panel">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] tracking-widest text-[var(--color-accent)]">PASO {stepIdx + 1} · {TYPE_LABEL[step.type].toUpperCase()}</p>
            <h1 className="text-[20px] font-bold leading-tight text-white" data-testid="step-title">{step.title}</h1>
            {phase === 'done' ? (
              <p className="mt-1 text-[14.5px] text-[#7ee2a8]" role="status" data-testid="step-done"><span aria-hidden>✓ </span><OpText text={step.done} /></p>
            ) : (
              <p className="mt-1 text-[14.5px] text-white/85" data-testid="step-instruction"><OpText text={step.instruction} /></p>
            )}
            {step.safety && phase !== 'intro' && <p className="mt-2 rounded-lg border border-[#f5c518]/40 bg-[#f5c518]/10 px-3 py-1.5 text-[13px] text-white"><span aria-hidden>⚠ </span><OpText text={step.safety} /></p>}
            {phase === 'show' && <p className="mt-2 text-[13px] text-white/60">Mira la demostración… <button onClick={stop} className="ml-1 text-[var(--color-accent)] underline" data-testid="skip-demo">Saltar</button></p>}
            {(phase === 'try' || phase === 'done') && (
              <div className="mt-2.5">
                <Interaction key={step.id} step={step} scene={scene} onDone={onDone} done={done} />
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-2 lg:w-60">
            <button onClick={next} disabled={!done} data-testid="continue"
              className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-[16px] font-bold text-[#1a1203] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40">
              {stepIdx + 1 >= m.steps.length ? 'Terminar misión ✓' : 'Continuar →'}
            </button>
            {!done && phase !== 'intro' && <p className="text-center text-[11.5px] text-white/45">Se habilita al completar el paso</p>}
            <div className="flex flex-wrap justify-center gap-1 lg:justify-start" role="group" aria-label="Ayuda del paso">
              <Help onClick={() => set({ drawer: 'why' })} icon="?" label="¿Por qué?" testid="help-why" />
              <Help onClick={play} icon="▶" label="Demostración" testid="help-demo" />
              <Help onClick={() => set({ drawer: 'procedure' })} icon="📄" label="Procedimiento (demo)" testid="help-procedure" />
              <Help onClick={() => set({ drawer: 'ask' })} icon="✦" label="Preguntas" testid="help-ask" />
              {(step.type === 'identify' || step.type === 'select') && <Help onClick={() => set({ listMode: !listMode })} icon="☰" label={listMode ? 'Usar 3D' : 'Usar lista'} testid="help-list" />}
            </div>
          </div>
        </div>
      </section>
      <footer className="flex items-center gap-2 border-t border-white/10 bg-[#0c0e11] px-4 py-1.5 text-[11px] text-white/55" data-testid="disclaimer">
        <span aria-hidden className="text-[#f5c518]">⚠</span><span><strong className="text-white/80">DEMOSTRACIÓN.</strong> {DISCLAIMER} La plataforma no certifica competencia.</span>
      </footer>
    </div>
  );
}

function Help({ icon, label, onClick, testid }: { icon: string; label: string; onClick: () => void; testid: string }) {
  return <button onClick={onClick} data-testid={testid} className="rounded-lg px-2 py-1 text-[12.5px] text-white/70 hover:bg-white/10 hover:text-white"><span aria-hidden className="mr-1">{icon}</span>{label}</button>;
}
