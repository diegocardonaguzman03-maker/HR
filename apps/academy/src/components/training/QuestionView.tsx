import { useEffect, useRef } from 'react';
import type { QuestionT } from '../../types/content';
import { equipmentOrdered, idx } from '../../lib/content';
import { matchRightOrder, type Response } from '../../lib/assessment';
import { useApp } from '../../stores/useApp';
import { btn } from '../ui/Status';

const opt = (on: boolean) => `flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-[13.5px] transition ${on ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-[var(--color-line)] hover:border-[var(--color-text-3)]'}`;

/** Renderiza una pregunta de cualquier tipo. Las de "identificar" aceptan clic en 3D o lista (alternativa accesible). */
export function QuestionView({ q, r, onChange, disabled = false, critical = false }: { q: QuestionT; r: Response; onChange: (r: Response) => void; disabled?: boolean; critical?: boolean }) {
  const lastPick = useApp((s) => s.lastPick);
  const set = useApp((s) => s.set);
  // RT-SW-03: el clic 3D que ya existía al montar (pregunta anterior o lección) no es la respuesta de esta pregunta
  const pickAtMount = useRef(useApp.getState().lastPick?.key);
  useEffect(() => {
    if (q.kind !== 'identify' || disabled) return;
    set({ picking: true, selectedEq: null, lastPick: null });
    return () => set({ picking: false });
  }, [q.id, q.kind, disabled, set]);
  useEffect(() => {
    if (q.kind !== 'identify' || disabled || !lastPick || lastPick.key === pickAtMount.current) return;
    onChange({ kind: 'identify', eqId: lastPick.eqId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPick]);
  const move = (order: number[], pos: number, to: number) => { const o = [...order]; [o[to], o[pos]] = [o[pos], o[to]]; onChange({ kind: 'order', order: o, touched: true }); };

  return (
    <fieldset className="space-y-2" disabled={disabled} data-testid={`question-${q.id}`} data-critical={critical || undefined}>
      <legend className="mb-3 text-[15px] font-medium leading-snug">
        {critical && <span className="mb-1.5 block w-fit rounded border border-[var(--color-danger)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--color-danger)]" data-testid="critical-badge"><span aria-hidden>▲ </span>Pregunta de seguridad<span className="sr-only">: debes contestarla bien para aprobar.</span></span>}
        {q.prompt}
      </legend>
      {q.kind === 'mcq' && r.kind === 'mcq' && q.options.map((o, i) => (
        <label key={i} className={opt(r.choice === i)}>
          <input type="radio" name={q.id} className="mt-1 accent-[var(--color-accent)]" checked={r.choice === i} onChange={() => onChange({ kind: 'mcq', choice: i })} />
          <span>{o}</span>
        </label>
      ))}
      {q.kind === 'identify' && r.kind === 'identify' && (
        <div>
          <p className="mb-2 rounded border border-[var(--color-line)] bg-[var(--color-surface-2)] p-2 text-[12.5px] text-[var(--color-text-2)]">
            <span aria-hidden>◎ </span>Haz clic en el equipo en el modelo 3D <strong>o</strong> elígelo en el menú «Equipo seleccionado» de abajo.
          </p>
          <label className="block"><span className="label block">Equipo seleccionado</span>
            <select className="w-full rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-2 py-1.5" value={r.eqId ?? ''} onChange={(e) => onChange({ kind: 'identify', eqId: e.target.value || null })} data-testid="identify-select">
              <option value="">— Selecciona —</option>
              {equipmentOrdered.map((e) => <option key={e.id} value={e.id}>{String(e.hotspotNumber).padStart(2, '0')} · {e.name}</option>)}
            </select>
          </label>
          <p role="status" className="mt-2 text-[13px]">{r.eqId ? <>Elegiste: <strong>{idx.equipment.get(r.eqId)?.name}</strong></> : null}</p>
        </div>
      )}
      {q.kind === 'order' && r.kind === 'order' && !r.touched && <p className="text-[12.5px] text-[var(--color-text-3)]">Usa ↑ y ↓ para acomodar los elementos en el orden correcto.</p>}
      {q.kind === 'order' && r.kind === 'order' && (
        <ol className="space-y-1.5">
          {r.order.map((item, pos) => (
            <li key={item} className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] px-3 py-2 text-[13.5px]">
              <span className="w-5 font-mono text-[var(--color-accent)]">{pos + 1}</span>
              <span className="flex-1">{q.items[item]}</span>
              <button type="button" className={btn + ' !px-2 !py-0.5'} aria-label={`Subir «${q.items[item]}»`} disabled={pos === 0} onClick={() => move(r.order, pos, pos - 1)}>↑</button>
              <button type="button" className={btn + ' !px-2 !py-0.5'} aria-label={`Bajar «${q.items[item]}»`} disabled={pos === r.order.length - 1} onClick={() => move(r.order, pos, pos + 1)}>↓</button>
            </li>
          ))}
        </ol>
      )}
      {q.kind === 'match' && r.kind === 'match' && (() => {
        const right = matchRightOrder(q);
        return (
          <div className="space-y-2">
            {q.pairs.map((p, i) => (
              <label key={i} className="grid gap-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-2 sm:grid-cols-2 sm:items-center">
                <span className="text-[13.5px] font-medium">{p.left}</span>
                <select className="rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-2 py-1.5 text-[13px]" value={r.picks[i] ?? ''} onChange={(e) => { const picks = [...r.picks]; picks[i] = e.target.value === '' ? null : Number(e.target.value); onChange({ kind: 'match', picks }); }} aria-label={`Relaciona: ${p.left}`}>
                  <option value="">— Elige —</option>
                  {right.map((j) => <option key={j} value={j}>{q.pairs[j].right}</option>)}
                </select>
              </label>
            ))}
          </div>
        );
      })()}
    </fieldset>
  );
}
