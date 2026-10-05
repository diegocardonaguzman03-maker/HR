import { useEffect, useRef } from 'react';
import { courses, missions, sceneFor } from '../content';
import { completedMissions, markCompleted, savedProgress, useMission } from '../store';
import type { MissionT } from '../schema';
import { MissionPlayer } from './MissionPlayer';
import { Procedures } from './Procedures';
import { DISCLAIMER } from '../../components/ui/Disclaimer';
import { FirstRunNotice, RecordingControls } from '../../components/ui/RecordingNotice';
import { track } from '../../lib/analytics';

const DEFAULT = 'heights-prep';

/** Pantalla de inicio: SOLO misión, objetivo, progreso y un botón grande. */
function MissionIntro({ m, onStart, onPath }: { m: MissionT; onStart: (resume: boolean) => void; onPath: () => void }) {
  const saved = savedProgress(m.id);
  const done = Object.values(saved?.results ?? {}).filter((r) => r.done).length;
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus(); }, []);
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#0c0e11] px-6 text-center text-white" data-testid="mission-intro">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(232,163,61,.25), transparent 60%)' }} />
      <p className="relative font-mono text-[13px] tracking-[0.3em] text-[var(--color-accent)]">MISIÓN {m.number}</p>
      <h1 className="relative mt-2 text-[40px] font-bold leading-none sm:text-[56px]">{m.title.toUpperCase()}</h1>
      <p className="relative mt-2 text-[18px] text-white/70">{m.subtitle}</p>
      <p className="relative mt-6 max-w-[46ch] text-[18px] text-white/90">{m.objective}</p>
      <p className="relative mt-4 font-mono text-[14px] text-white/60" data-testid="intro-progress">{done} / {m.steps.length} pasos completados · ~{m.estimatedMin} min</p>
      <button ref={btn} onClick={() => onStart(!!saved && done > 0)} data-testid="start-mission"
        className="relative mt-8 rounded-2xl bg-[var(--color-accent)] px-10 py-4 text-[20px] font-bold tracking-wide text-[#1a1203] shadow-[0_10px_40px_rgba(232,163,61,.35)] hover:brightness-110">
        {saved && done > 0 ? `CONTINUAR MISIÓN (paso ${Math.min(saved.stepIdx + 1, m.steps.length)})` : 'COMENZAR MISIÓN'}
      </button>
      {saved && done > 0 && <button onClick={() => onStart(false)} className="relative mt-3 text-[13px] text-white/60 underline-offset-2 hover:underline">Empezar de nuevo</button>}
      <button onClick={onPath} className="relative mt-6 text-[13px] text-white/50 hover:text-white" data-testid="to-path">Ver el mapa de misiones</button>
      <p className="absolute inset-x-0 bottom-3 mx-auto max-w-3xl px-4 text-[12px] text-white/75"><span className="text-[#a78bfa]">◇ DEMOSTRACIÓN</span> — secuencia ilustrativa; antes de usarse en operación se reemplaza por el procedimiento aprobado de la planta (Operaciones y Seguridad). {DISCLAIMER}</p>
    </div>
  );
}

/** Resultado: decisiones correctas, tiempo, dominio por área y recomendación. */
function MissionComplete({ m, onRepeat, onPath }: { m: MissionT; onRepeat: () => void; onPath: () => void }) {
  const { results, startedAt, endedAt } = useMission();
  const correct = m.steps.filter((s) => results[s.id]?.done && results[s.id].mistakes === 0).length;
  const secs = Math.max(0, Math.round(((endedAt || Date.now()) - startedAt) / 1000));
  const areas = m.masteryAreas.map((a) => {
    const steps = m.steps.filter((s) => s.mastery === a.id);
    const score = steps.length ? steps.reduce((acc, s) => acc + Math.max(0, 1 - 0.25 * (results[s.id]?.mistakes ?? 0)), 0) / steps.length : 1;
    return { ...a, score, steps };
  });
  const weakest = [...areas].sort((x, y) => x.score - y.score)[0];
  const missed = m.steps.filter((s) => (results[s.id]?.mistakes ?? 0) > 0);
  // solo cuentan como críticas las opciones inseguras y los daños NO detectados; ser precavido no se castiga (SAF-H-R1)
  const critical = m.steps.filter((s) => s.critical && (results[s.id]?.wrong ?? []).some((id) => !id.startsWith('zona:') || (s.type === 'inspect' && s.zones.find((z) => `zona:${z.id}` === id)?.defect)));
  const wrongFeedback = (s: (typeof m.steps)[number]) => {
    const ids = results[s.id]?.wrong ?? [];
    const opts: { id: string; label: string; feedback: string }[] = s.type === 'inspect' ? s.decision.options : s.type === 'select' || s.type === 'decide' ? s.options : s.type === 'confirm' ? s.items.filter((i) => !i.required) : [];
    return opts.filter((o) => ids.includes(o.id)).map((o) => `Elegiste «${o.label}»: ${o.feedback}`);
  };
  useEffect(() => { if (!critical.length) markCompleted(m.id); track('completed', m.id, { correct, total: m.steps.length, seconds: secs }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="scroll-thin h-full overflow-y-auto bg-[#0c0e11] px-6 py-10 text-white" data-testid="mission-complete">
      <div className="mx-auto max-w-2xl">
        <p className={`font-mono text-[13px] tracking-[0.3em] ${critical.length ? 'text-[#e5484d]' : 'text-[#30a46c]'}`} data-testid="complete-title">{critical.length ? '⚠ PRÁCTICA TERMINADA — CON ERRORES CRÍTICOS' : '✓ PRÁCTICA TERMINADA'}</p>
        <h1 className="mt-1 text-[32px] font-bold">{m.title} — {m.subtitle}</h1>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="label">Resultado</p><p className="text-[28px] font-bold" data-testid="result-correct">{correct} / {m.steps.length}</p><p className="text-[13px] text-white/60">decisiones correctas al primer intento</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="label">Tiempo</p><p className="text-[28px] font-bold">{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</p><p className="text-[13px] text-white/60">minutos</p></div>
        </div>
        {critical.length > 0 && <p role="alert" className="mt-6 rounded-xl border-2 border-[#e5484d] bg-[#e5484d]/10 p-4 text-[14.5px]" data-testid="critical-alert">⚠ En esta práctica elegiste al menos una acción que, en una tarea real, puede causar una lesión grave o la muerte: <strong>{critical.map((s) => s.title).join(', ')}</strong>. En la planta no hay segundo intento. Repite la misión y repasa estos pasos con tu instructor o supervisor.</p>}
        <h2 className="label mb-3 mt-8">Aciertos por tema (práctica)</h2>
        <ul className="space-y-3" data-testid="mastery">
          {areas.map((a) => (
            <li key={a.id}>
              <div className="flex justify-between text-[14px]"><span>{a.label}</span><span className="font-mono">{Math.round(a.score * 100)} %</span></div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={a.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(a.score * 100)}>
                <div className={`h-full rounded-full ${a.score >= 0.99 ? 'bg-[#30a46c]' : a.score >= 0.7 ? 'bg-[var(--color-accent)]' : 'bg-[#e5484d]'}`} style={{ width: `${Math.round(a.score * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="label">Recomendación</p>
          <p className="mt-1 text-[15px]">{weakest.score < 1 ? <>Repasa: <strong>{weakest.label}</strong> — {weakest.review}.</> : 'Respondiste bien todos los temas de esta práctica. Esto no acredita tu competencia. Sigue con la próxima misión cuando esté disponible.'}</p>
        </div>
        {missed.length > 0 && (
          <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4" data-testid="missed">
            <summary className="cursor-pointer font-semibold">Revisar lo que fallaste ({missed.length})</summary>
            <ul className="mt-3 space-y-3 text-[14px] text-white/85">{missed.map((s) => <li key={s.id}><strong className="text-white">{s.critical ? '⚠ ' : ''}{s.title}.</strong> {s.why}{wrongFeedback(s).map((f, i) => <span key={i} className="mt-1 block text-[#ffb3b5]">{f}</span>)}</li>)}</ul>
          </details>
        )}
        <p className="mt-6 rounded-xl border border-[#f5c518]/40 bg-[#f5c518]/10 p-3 text-[13px]"><strong>Esta misión no te habilita para {m.authorization} ni certifica tu competencia.</strong> Es práctica de aprendizaje. Para {m.authorization} necesitas la capacitación y la autorización que exige la planta (SME_REQUIRED: requisitos de autorización — Seguridad). No se usa para escalafón, ascensos, sanciones ni bonos.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={onRepeat} className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10" data-testid="repeat">Repetir misión</button>
          <button onClick={onPath} className="rounded-xl bg-[var(--color-accent)] px-5 py-3 font-bold text-[#1a1203] hover:brightness-110" data-testid="continue-path">Continuar →</button>
        </div>
      </div>
    </div>
  );
}

/** Mapa de aprendizaje: progresión visual tipo videojuego. */
function LearningPath({ onOpen }: { onOpen: (id: string) => void }) {
  const done = completedMissions();
  return (
    <div className="scroll-thin h-full overflow-y-auto bg-[#0c0e11] px-6 py-10 text-white" data-testid="learning-path">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-[12px] tracking-[0.3em] text-white/50">ACERÍA DIGITAL ACADEMY</p>
        {courses.map((c) => {
          const firstOpen = c.missions.find((x) => x.available && !done.includes(x.id))?.id;
          return (
            <section key={c.id} className="mt-2">
              <h1 className="text-[30px] font-bold">{c.title}</h1>
              <ol className="relative mt-6">
                {c.missions.map((x, i) => {
                  const isDone = done.includes(x.id), current = x.id === firstOpen;
                  const state = isDone ? 'COMPLETADA' : current ? 'ACTUAL' : x.available ? 'DISPONIBLE' : 'BLOQUEADA';
                  return (
                    <li key={x.id} className="relative flex gap-4 pb-6">
                      {i < c.missions.length - 1 && <span aria-hidden className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${isDone ? 'bg-[#30a46c]' : 'bg-white/15'}`} />}
                      <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-mono text-[13px] font-bold ${isDone ? 'border-[#30a46c] bg-[#30a46c] text-white' : current ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[#1a1203]' : 'border-white/20 text-white/40'}`}>{isDone ? '✓' : x.available ? x.number : '🔒'}</span>
                      <div className="flex-1 pt-1">
                        <p className={`text-[17px] font-semibold ${x.available ? 'text-white' : 'text-white/45'}`}>{x.number !== '★' ? `${x.number} · ` : ''}{x.title}</p>
                        <p className="font-mono text-[11px] tracking-wider text-white/45">{state}{x.note ? ` · ${x.note}` : ''}</p>
                        {x.available && <button onClick={() => onOpen(x.id)} className={`mt-2 rounded-xl px-4 py-2 text-[14px] font-bold ${current ? 'bg-[var(--color-accent)] text-[#1a1203]' : 'border border-white/20 text-white hover:bg-white/10'}`} data-testid={`open-${x.id}`}>{isDone ? 'Repetir' : 'Jugar'}</button>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
        <details className="mt-6 rounded-xl border border-white/10 p-3 text-[13px] text-white/70" data-testid="privacy">
          <summary className="cursor-pointer font-semibold text-white/85">Privacidad y registro</summary>
          <div className="mt-2"><RecordingControls prefix="path-" /></div>
        </details>
        <p className="mt-6 border-t border-white/10 pt-4 text-[13px] text-white/50">
          ¿Buscas la ficha técnica del horno de arco eléctrico? <a href="#/explore" className="text-[var(--color-accent)] underline-offset-2 hover:underline">Abrir biblioteca técnica EAF</a>
        </p>
      </div>
    </div>
  );
}

/** Navegación mínima fuera de la misión: Misión actual · Misiones · Procedimientos. */
function TopNav({ view, onNav }: { view: string; onNav: (v: 'intro' | 'path' | 'procedures') => void }) {
  const item = (v: 'intro' | 'path' | 'procedures', label: string) => (
    <button onClick={() => onNav(v)} aria-current={view === v ? 'page' : undefined} data-testid={`nav-${v}`}
      className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${view === v ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white'}`}>{label}</button>
  );
  return (
    <nav aria-label="Secciones" className="flex items-center gap-1 border-b border-white/10 bg-[#0c0e11] px-4 py-2">
      <span className="mr-3 font-mono text-[11px] tracking-[0.25em] text-white/45">ACERÍA DIGITAL ACADEMY</span>
      {item('intro', 'Misión')}{item('path', 'Misiones')}{item('procedures', 'Procedimientos')}
    </nav>
  );
}

// precarga el escenario 3D mientras la persona lee la pantalla de inicio (arranque instantáneo)
const preloadScene = () => { void import('../scene/MissionScene'); };

export function MissionApp() {
  const view = useMission((s) => s.view), missionId = useMission((s) => s.missionId), set = useMission((s) => s.set), start = useMission((s) => s.start);
  const m = missions[missionId ?? DEFAULT];
  useEffect(() => { if (!missionId) set({ missionId: DEFAULT, view: 'intro' }); }, [missionId, set]);
  useEffect(() => { const id = window.setTimeout(preloadScene, 300); return () => clearTimeout(id); }, []);
  if (!m) return null;
  return (
    <div className="flex h-full flex-col">
      {view !== 'play' && <TopNav view={view} onNav={(v) => set({ view: v })} />}
      <div className="min-h-0 flex-1">
        {view === 'procedures' && <Procedures onPlay={(id) => set({ missionId: id, view: 'intro' })} />}
        {view === 'path' && <LearningPath onOpen={(id) => set({ missionId: id, view: 'intro' })} />}
        {view === 'intro' && <MissionIntro m={m} onStart={(resume) => start(m, resume)} onPath={() => set({ view: 'path' })} />}
        {view === 'play' && <MissionPlayer m={m} scene={sceneFor(m)} onExit={() => set({ view: 'path' })} onComplete={() => set({ view: 'complete' })} />}
        {view === 'complete' && <MissionComplete m={m} onRepeat={() => start(m, false)} onPath={() => set({ view: 'path' })} />}
      </div>
      {view !== 'play' && <FirstRunNotice where="También lo encuentras en el mapa de misiones → Privacidad y registro." />}
    </div>
  );
}
