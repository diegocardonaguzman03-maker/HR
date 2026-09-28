/**
 * Elementos de juego: evaluación final, pantalla de misión completada,
 * progreso de equipos inspeccionados y narración por voz.
 */
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { EQUIPMENT } from '../../data/equipment';
import { QUIZ, QUIZ_PASS } from '../../data/quiz';
import { indexOfState, steps } from '../../sim/clock';

const BEST_KEY = 'steel-twin.bestScore';
const readBest = (): number | null => {
  try {
    const v = localStorage.getItem(BEST_KEY);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
};
const writeBest = (v: number) => {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* sin almacenamiento: el puntaje solo vive en esta sesión */
  }
};

const TOTAL_EQUIPMENT = Object.keys(EQUIPMENT).length;

/** Evaluación de opción múltiple con retroalimentación inmediata. */
export function QuizOverlay() {
  const open = useAppStore((s) => s.quizOpen);
  const setQuizOpen = useAppStore((s) => s.setQuizOpen);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(readBest);

  useEffect(() => {
    if (open) {
      setI(0);
      setPicked(null);
      setScore(0);
      setDone(false);
    }
  }, [open]);

  if (!open) return null;
  const q = QUIZ[i];
  const total = QUIZ.length;
  const pct = Math.round((score / total) * 100);

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 < total) {
      setI(i + 1);
      setPicked(null);
    } else {
      setDone(true);
      const final = Math.round((score / total) * 100);
      if (best === null || final > best) {
        setBest(final);
        writeBest(final);
      }
    }
  };
  const seeIn3D = () => {
    const st = useAppStore.getState();
    setQuizOpen(false);
    st.setMode('explore');
    const idx = indexOfState(q.step);
    if (idx >= 0) st.goToStep(idx, true);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
      <div className="hud-panel max-h-[92%] w-full max-w-[640px] overflow-y-auto p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div className="font-hud text-sm tracking-[0.3em] text-amber-400">EVALUACIÓN</div>
          <button onClick={() => setQuizOpen(false)} className="text-zinc-400 hover:text-white" aria-label="Cerrar evaluación">✕</button>
        </div>

        {!done ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-hud text-xs tracking-[0.2em] text-zinc-400">PREGUNTA {i + 1}/{total}</span>
              <div className="h-1 flex-1 bg-white/10">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${((i + (picked !== null ? 1 : 0)) / total) * 100}%` }} />
              </div>
              <span className="font-hud text-xs text-amber-300">{score} ✓</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-snug text-zinc-50 [text-wrap:balance]">{q.question}</h2>
            <div className="mt-4 grid gap-2">
              {q.options.map((o, k) => {
                const state = picked === null ? 'idle' : k === q.answer ? 'right' : k === picked ? 'wrong' : 'off';
                return (
                  <button
                    key={k}
                    onClick={() => choose(k)}
                    disabled={picked !== null}
                    className={`flex items-start gap-3 border px-3 py-2.5 text-left text-sm transition ${
                      state === 'idle' ? 'border-white/15 text-zinc-200 hover:border-amber-400/70 hover:bg-amber-400/[0.06]' :
                      state === 'right' ? 'border-emerald-400/70 bg-emerald-400/10 text-emerald-100' :
                      state === 'wrong' ? 'border-red-400/70 bg-red-500/10 text-red-100' : 'border-white/10 text-zinc-500'
                    }`}
                  >
                    <span className="font-hud mt-px text-xs text-zinc-400">{String.fromCharCode(65 + k)}</span>
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="mt-4 animate-[fadeUp_.3s_ease-out] border-l-2 border-amber-400/70 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300">
                <b className={picked === q.answer ? 'text-emerald-300' : 'text-red-300'}>{picked === q.answer ? '¡Correcto! ' : 'No es correcto. '}</b>
                {q.explanation}
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              {picked !== null && (
                <button onClick={seeIn3D} className="h-9 border border-white/20 px-4 text-xs font-semibold tracking-wide text-zinc-100 hover:border-white/40">
                  VER EN 3D
                </button>
              )}
              <button onClick={next} disabled={picked === null} className="hud-btn-primary !flex-row !items-center !px-5 !py-2 text-xs disabled:opacity-40">
                {i + 1 < total ? 'SIGUIENTE' : 'VER RESULTADO'}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 text-center">
            <div className={`font-hud text-6xl font-bold ${pct >= QUIZ_PASS * 100 ? 'text-emerald-300' : 'text-amber-300'}`}>{pct}%</div>
            <div className="mt-1 text-sm text-zinc-400">{score} de {total} respuestas correctas</div>
            <div className="font-hud mt-4 text-lg tracking-[0.2em] text-zinc-50">
              {pct >= QUIZ_PASS * 100 ? 'EVALUACIÓN APROBADA' : 'SIGUE PRACTICANDO'}
            </div>
            <p className="mx-auto mt-2 max-w-[440px] text-sm text-zinc-400">
              {pct >= QUIZ_PASS * 100
                ? 'Conoces el recorrido del acero de la chatarra al planchón.'
                : `Necesitas ${Math.round(QUIZ_PASS * 100)}% para aprobar. Repasa el recorrido guiado y vuelve a intentarlo.`}
            </p>
            {best !== null && <div className="mt-2 text-xs text-zinc-500">Mejor resultado en este dispositivo: {best}%</div>}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button onClick={() => { setI(0); setPicked(null); setScore(0); setDone(false); }} className="h-9 border border-white/20 px-4 text-xs font-semibold tracking-wide text-zinc-100 hover:border-white/40">
                REPETIR EVALUACIÓN
              </button>
              <button onClick={() => { setQuizOpen(false); useAppStore.getState().setMode('guided'); }} className="hud-btn-primary !flex-row !items-center !px-5 !py-2 text-xs">
                REPASAR RECORRIDO
              </button>
            </div>
            <p className="mt-4 text-[11px] text-zinc-600">Evaluación didáctica con datos simulados de capacitación.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Aparece cuando el recorrido guiado llega al planchón terminado. */
export function MissionCompleteOverlay() {
  const open = useAppStore((s) => s.missionComplete);
  const inspected = useAppStore((s) => s.inspected.length);
  if (!open) return null;
  const st = useAppStore.getState();
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
      <div className="hud-panel w-full max-w-[520px] animate-[fadeUp_.5s_ease-out] p-6 text-center">
        <div className="font-hud text-xs tracking-[0.5em] text-amber-400">MISIÓN COMPLETADA</div>
        <h2 className="font-hud mt-2 text-3xl font-bold uppercase tracking-wide text-zinc-50">¡Planchón terminado!</h2>
        <p className="mt-2 text-sm text-zinc-400">Seguiste la colada desde la chatarra hasta el planchón de 230 × 1,500 mm.</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            [String(steps().length), 'pasos'],
            ['11', 'estados del acero'],
            [`${inspected}/${TOTAL_EQUIPMENT}`, 'equipos inspeccionados'],
          ].map(([v, k]) => (
            <div key={k} className="border border-white/10 bg-white/[0.03] px-2 py-2.5">
              <div className="font-hud text-2xl font-bold text-amber-300">{v}</div>
              <div className="text-[11px] text-zinc-400">{k}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={() => st.setQuizOpen(true)} className="hud-btn-primary !flex-row !items-center !justify-center !px-5 !py-2.5 text-sm">
            PRESENTAR EVALUACIÓN
          </button>
          <button onClick={() => { st.dismissMission(); st.setMode('explore'); }} className="h-10 border border-white/20 px-4 text-xs font-semibold tracking-wide text-zinc-100 hover:border-white/40">
            EXPLORAR LIBRE
          </button>
          <button onClick={() => { st.restart(); st.setMode('guided'); }} className="h-10 border border-white/20 px-4 text-xs font-semibold tracking-wide text-zinc-100 hover:border-white/40">
            REPETIR
          </button>
        </div>
      </div>
    </div>
  );
}

/** Indicador de progreso: equipos inspeccionados. */
export function ProgressChip() {
  const inspected = useAppStore((s) => s.inspected);
  const pct = (inspected.length / TOTAL_EQUIPMENT) * 100;
  return (
    <div className="hud-panel pointer-events-auto hidden items-center gap-2 px-3 py-2 md:flex" title="Haz clic en cada equipo para inspeccionarlo">
      <span className="font-hud text-[10px] tracking-[0.25em] text-zinc-400">EQUIPOS</span>
      <div className="h-1.5 w-24 bg-white/10">
        <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-hud text-xs text-zinc-100">{inspected.length}/{TOTAL_EQUIPMENT}</span>
    </div>
  );
}

/** Narración por voz de cada paso (Web Speech API, voz en español si existe). */
export function Narrator() {
  const narration = useAppStore((s) => s.narration);
  const stepIndex = useAppStore((s) => s.stepIndex);
  const started = useAppStore((s) => s.started);
  const voice = useMemo(() => pickVoice(), [narration]);

  useEffect(() => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    if (!synth) return;
    if (!narration || !started) {
      synth.cancel();
      return;
    }
    const s = steps()[stepIndex];
    const u = new SpeechSynthesisUtterance(`${s.title}. ${s.whatHappens}`);
    u.lang = voice?.lang ?? 'es-MX';
    if (voice) u.voice = voice;
    u.rate = 1.02;
    synth.cancel();
    synth.speak(u);
  }, [narration, stepIndex, started, voice]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return null;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = typeof window !== 'undefined' ? window.speechSynthesis?.getVoices() ?? [] : [];
  return voices.find((v) => v.lang === 'es-MX') ?? voices.find((v) => v.lang === 'es-US') ?? voices.find((v) => v.lang.startsWith('es'));
}

export const speechAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
