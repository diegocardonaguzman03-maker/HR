import { useEffect, useRef, useState } from 'react';
import { provider, type Answer } from '../../lib/assistant/provider';
import { idx } from '../../lib/content';
import { useApp } from '../../stores/useApp';
import { track } from '../../lib/analytics';
import { StatusChip, btn, btnPrimary } from '../ui/Status';

interface Turn { q: string; a: Answer }
const SUGGEST = ['¿Para qué sirve el 5.º agujero?', '¿Qué hace el transformador del horno?', '¿Por qué es peligrosa el agua cerca del metal líquido?', '¿Cuál es la temperatura de vaciado?'];

export function AskAceria() {
  const { assistantOpen, set, selectedEq, selectedStage, selectEquipment } = useApp();
  const [q, setQ] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (assistantOpen) input.current?.focus(); }, [assistantOpen]);
  if (!assistantOpen) return null;
  const ctxLabel = selectedEq ? idx.equipment.get(selectedEq)?.shortName : selectedStage ? idx.stage.get(selectedStage)?.shortName : null;
  const ask = async (text: string) => {
    if (!text.trim()) return;
    setBusy(true);
    const a = await provider.answer(text, { equipmentId: selectedEq, stageId: selectedStage });
    // privacidad: no se guarda el texto de la pregunta, solo el tipo de respuesta
    track('asked', 'assistant', { outcome: a.kind });
    setTurns((t) => [...t, { q: text, a }]);
    setQ('');
    setBusy(false);
  };
  return (
    <aside aria-label="Pregunta a Acería AI" className="fixed bottom-12 right-4 z-40 flex max-h-[72vh] w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] shadow-2xl" data-testid="assistant">
      <header className="flex items-start justify-between gap-2 border-b border-[var(--color-line)] px-4 py-3">
        <div>
          <h2 className="font-semibold">Pregunta a Acería AI</h2>
          <p className="text-[11.5px] text-[var(--color-text-3)]">Responde solo con el contenido del módulo y cita la fuente. No da valores de planta ni autoriza tareas.</p>
        </div>
        <button onClick={() => set({ assistantOpen: false })} aria-label="Cerrar asistente" className="rounded px-2 py-1 text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]">✕</button>
      </header>
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {!turns.length && (
          <div>
            <p className="label mb-2">Prueba con</p>
            <div className="flex flex-wrap gap-1.5">{SUGGEST.map((s) => <button key={s} className={btn + ' !py-1 text-[12px]'} onClick={() => void ask(s)}>{s}</button>)}</div>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} data-testid="assistant-turn">
            <p className="mb-1.5 ml-8 rounded-lg bg-[var(--color-surface-3)] px-3 py-2 text-[13px]">{t.q}</p>
            <div className={`rounded-lg border px-3 py-2 text-[13px] ${t.a.kind === 'answer' ? 'border-[var(--color-line)]' : t.a.kind === 'refused-safety' ? 'border-[var(--color-danger)]/60 bg-[var(--color-danger)]/10' : 'border-[var(--color-st-sme)]/60 bg-[var(--color-st-sme)]/10'}`} data-kind={t.a.kind}>
              <p className="font-medium">{t.a.kind === 'refused-safety' && <span aria-hidden>⛔ </span>}{t.a.kind !== 'answer' && t.a.kind !== 'refused-safety' && <span aria-hidden>⚠ </span>}{t.a.text}</p>
              {t.a.note && <p className="mt-1 text-[12px] text-[var(--color-text-3)]">{t.a.note}</p>}
              {t.a.citations.length > 0 && (
                <ol className="mt-2 space-y-2">
                  {t.a.citations.map((c) => (
                    <li key={c.n} className="rounded border border-[var(--color-line)] bg-[var(--color-surface-2)] p-2">
                      <p className="text-[var(--color-text-2)]">{c.snippet}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] text-[var(--color-text-3)]">
                        <span className="font-mono">[{c.n}]</span>
                        {c.ref.kind === 'equipment' ? <button className="underline hover:text-[var(--color-text)]" onClick={() => selectEquipment(c.ref.id)}>{c.title}</button> : <span>{c.title}</span>}
                        <StatusChip status={c.status} compact />
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ))}
      </div>
      <form className="flex gap-2 border-t border-[var(--color-line)] p-3" onSubmit={(e) => { e.preventDefault(); void ask(q); }}>
        <label className="flex-1"><span className="sr-only">Tu pregunta</span>
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={ctxLabel ? `Pregunta sobre ${ctxLabel}…` : 'Escribe tu pregunta…'} className="w-full rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-3 py-1.5 text-[13px]" data-testid="assistant-input" />
        </label>
        <button className={btnPrimary} disabled={busy || !q.trim()} data-testid="assistant-send">Preguntar</button>
      </form>
    </aside>
  );
}
