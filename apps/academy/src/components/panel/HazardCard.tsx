import type { HazardT } from '../../types/content';
import { Bullets, OpText, StatusChip } from '../ui/Status';

const SEV = { critical: { t: 'CRÍTICO', c: 'var(--color-danger)', i: '▲' }, high: { t: 'ALTO', c: 'var(--color-warning)', i: '▲' }, medium: { t: 'MEDIO', c: 'var(--color-text-2)', i: '●' } } as const;
const CTRL = { elimination: 'Eliminación', substitution: 'Sustitución', engineering: 'Ingeniería', administrative: 'Administrativo', ppe: 'EPP' } as const;

/** Tarjeta de peligro: severidad con texto e icono, controles por jerarquía y campos de planta pendientes. */
export function HazardCard({ h, open = false }: { h: HazardT; open?: boolean }) {
  const s = SEV[h.severity];
  return (
    <details open={open} className="group rounded-lg border bg-[var(--color-surface-2)]" style={{ borderColor: `color-mix(in srgb, ${s.c} 40%, var(--color-line))` }} data-testid={`hazard-${h.id}`}>
      <summary className="flex cursor-pointer list-none items-start gap-3 p-3">
        <span className="mt-0.5 rounded px-1.5 py-0.5 font-mono text-[10.5px] font-bold" style={{ color: '#111', background: s.c }}>
          <span aria-hidden>{s.i} </span>{s.t}
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-[var(--color-text)]">{h.name}</span>
          <span className="block text-[12.5px] text-[var(--color-text-2)]">{h.consequence}</span>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <StatusChip status={h.status} compact />
            <span className="text-[11.5px] font-medium text-[var(--color-text)]"><span aria-hidden>✋ </span>Si un control falta o tienes duda: detente y avisa. Detenerte nunca se sanciona.</span>
          </span>
        </span>
        <span aria-hidden className="text-[var(--color-text-3)] transition group-open:rotate-90">›</span>
      </summary>
      <div className="space-y-3 border-t border-[var(--color-line)] p-3 text-[13px]">
        <p className="text-[var(--color-text-2)]">{h.description}</p>
        <div>
          <h4 className="label mb-1">Controles (jerarquía)</h4>
          <ul className="space-y-1">
            {h.controls.map((c, i) => (
              <li key={i} className="flex gap-2"><span className="w-24 shrink-0 font-mono text-[10.5px] uppercase text-[var(--color-text-3)]">{CTRL[c.type]}</span><OpText text={c.text} className="text-[var(--color-text-2)]" /></li>
            ))}
          </ul>
        </div>
        <div><h4 className="label mb-1">EPP</h4><Bullets items={h.ppe} /></div>
        {([['Zona de exclusión', h.exclusionZone], ['Enclavamiento', h.interlock], ['Permiso', h.permit], ['Condición de paro', h.stopCondition], ['Escalamiento', h.escalation]] as const).map(([k, v]) => (
          <div key={k}><h4 className="label mb-1">{k}</h4><OpText text={v} className="text-[var(--color-text-2)]" /></div>
        ))}
      </div>
    </details>
  );
}
