import { useShallow } from 'zustand/react/shallow';
import { nodesForEquipment, useApp } from '../../stores/useApp';

const b = (on: boolean) => `rounded-md border px-2.5 py-1.5 font-mono text-[11px] font-medium tracking-wide transition disabled:opacity-35 ${on ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text)]' : 'border-[var(--color-line-strong)] bg-black/55 text-[var(--color-text-2)] hover:text-[var(--color-text)]'}`;

const STEP = Math.PI / 8;

/** Herramientas de vista: girar/acercar, enfocar, aislar, ocultar, rayos X, corte, despiece, arco demostrativo, restablecer. */
export function ViewToolbar() {
  const s = useApp(useShallow((st) => ({
    selectedEq: st.selectedEq, focusNodes: st.focusNodes, isolate: st.isolate, xray: st.xray, section: st.section, explode: st.explode,
    arcDemo: st.arcDemo, hotspotsVisible: st.hotspotsVisible, hidden: st.hidden, set: st.set, fitNodes: st.fitNodes, resetView: st.resetView, orbit: st.orbit,
  })));
  const sel = nodesForEquipment(s.selectedEq);
  const has = sel.length > 0;
  return (
    <div role="toolbar" aria-label="Herramientas de vista 3D" className="pointer-events-auto flex flex-wrap gap-1.5 rounded-lg bg-black/30 p-1.5 backdrop-blur" data-testid="view-toolbar">
      {/* RT-UX-07: giro y acercamiento sin ratón */}
      <button className={b(false)} aria-label="Girar a la izquierda" onClick={() => s.orbit(STEP, 0)} data-testid="cam-left">⟲</button>
      <button className={b(false)} aria-label="Girar a la derecha" onClick={() => s.orbit(-STEP, 0)} data-testid="cam-right">⟳</button>
      <button className={b(false)} aria-label="Acercar" onClick={() => s.orbit(0, 3)} data-testid="cam-in">+</button>
      <button className={b(false)} aria-label="Alejar" onClick={() => s.orbit(0, -3)} data-testid="cam-out">−</button>
      <button className={b(false)} disabled={!has} onClick={() => has && s.fitNodes([...sel])}>ENFOCAR</button>
      <button className={b(s.isolate)} aria-pressed={s.isolate} disabled={!has && !s.focusNodes.length} onClick={() => s.set({ isolate: !s.isolate })}>AISLAR</button>
      <button className={b(false)} disabled={!has} onClick={() => { if (has) s.set({ hidden: [...new Set([...s.hidden, ...sel])], selectedEq: null }); }}>OCULTAR</button>
      <button className={b(s.xray)} aria-pressed={s.xray} onClick={() => s.set({ xray: !s.xray })} data-testid="xray">RAYOS X</button>
      <button className={b(s.section)} aria-pressed={s.section} onClick={() => s.set({ section: !s.section })} data-testid="section">CORTE</button>
      <label className={b(s.explode > 0) + ' flex items-center gap-2'}>DESPIECE
        <input type="range" min={0} max={1} step={0.05} value={s.explode} onChange={(e) => s.set({ explode: Number(e.target.value) })} aria-label="Despiece" className="w-20 accent-[var(--color-accent)]" />
      </label>
      <button className={b(s.arcDemo)} aria-pressed={s.arcDemo} onClick={() => s.set({ arcDemo: !s.arcDemo })} title="Animación ilustrativa; no representa parámetros reales">ARCO (DEMO)</button>
      <button className={b(s.hotspotsVisible)} aria-pressed={s.hotspotsVisible} onClick={() => s.set({ hotspotsVisible: !s.hotspotsVisible })}>PUNTOS</button>
      {s.hidden.length > 0 && <button className={b(false)} onClick={() => s.set({ hidden: [] })}>MOSTRAR TODO ({s.hidden.length})</button>}
      <button className={b(false)} onClick={() => s.resetView()} data-testid="reset-view">RESTABLECER</button>
    </div>
  );
}
