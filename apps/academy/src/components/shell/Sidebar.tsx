import { equipmentOrdered, stagesOrdered } from '../../lib/content';
import { useShallow } from 'zustand/react/shallow';
import { useApp } from '../../stores/useApp';
import { track } from '../../lib/analytics';

/** Mapa del proceso + lista de equipos (alternativa accesible al clic en 3D). */
export function Sidebar() {
  const { selectedStage, selectedEq, selectStage, flyTo, selectEquipment, picking, mode } = useApp(useShallow((s) => ({
    selectedStage: s.selectedStage, selectedEq: s.selectedEq, selectStage: s.selectStage, flyTo: s.flyTo,
    selectEquipment: s.selectEquipment, picking: s.picking, mode: s.mode,
  })));
  // En EVALUAR abrir una ficha desmontaría la evaluación (RT-SW-04). PENDIENTE decisión del Director (§4 n.º 2).
  const locked = picking || mode === 'assess';
  return (
    <nav aria-label="Proceso y equipos" className="scroll-thin flex h-full flex-col gap-5 overflow-y-auto p-3">
      <div>
        <h2 className="label mb-2 px-1">Mapa del proceso</h2>
        <ol className="relative space-y-1" data-testid="process-map">
          {stagesOrdered.map((s, i) => {
            const on = selectedStage === s.id;
            return (
              <li key={s.id} className="relative">
                {i < stagesOrdered.length - 1 && <span aria-hidden className="absolute left-[15px] top-8 h-3 w-px bg-[var(--color-line-strong)]" />}
                <button aria-current={on ? 'step' : undefined} data-testid={`stage-${s.id}`}
                  onClick={() => { selectStage(s.id); flyTo(s.camera); track('opened', s.id); }}
                  className={`flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left text-[13px] transition ${on ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]'}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10.5px] ${on ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'border-[var(--color-line-strong)]'}`}>{s.code}</span>
                  <span className="flex-1 leading-tight">{s.shortName}{s.id === 'stage.melt' && <span className="ml-1 font-mono text-[9.5px] text-[var(--color-accent)]">MVP</span>}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div>
        <h2 className="label mb-2 px-1">Equipos {picking ? <span className="text-[var(--color-accent)]">· modo identificar</span> : mode === 'assess' ? <span className="text-[var(--color-accent)]">· en evaluación</span> : null}</h2>
        <ul className="space-y-0.5" data-testid="equipment-list">
          {equipmentOrdered.map((e) => (
            <li key={e.id}>
              <button data-testid={`eq-${e.id}`} aria-current={selectedEq === e.id ? 'true' : undefined} disabled={locked}
                onClick={() => { selectEquipment(e.id); track('opened', e.id, { via: 'list' }); }}
                className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[13px] transition disabled:opacity-40 ${selectedEq === e.id ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]'}`}>
                <span className="w-6 font-mono text-[11px] text-[var(--color-accent)]">{String(e.hotspotNumber).padStart(2, '0')}</span>
                <span className="flex-1 leading-tight">{e.shortName}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
