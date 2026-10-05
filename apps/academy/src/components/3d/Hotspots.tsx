import { Html } from '@react-three/drei';
import { useShallow } from 'zustand/react/shallow';
import { content, idx } from '../../lib/content';
import { nodesForEquipment, useApp } from '../../stores/useApp';
import { ANCHORS, EXPLODE } from './anchors';
import { track } from '../../lib/analytics';

/** Marcadores numerados accesibles (botones reales, alcanzables con teclado). */
export function Hotspots() {
  const { hotspotsVisible, picking, explode, hidden, isolate, selectedEq, focusNodes, mode } = useApp(useShallow((s) => ({
    hotspotsVisible: s.hotspotsVisible, picking: s.picking, explode: s.explode, hidden: s.hidden, isolate: s.isolate,
    selectedEq: s.selectedEq, focusNodes: s.focusNodes, mode: s.mode,
  })));
  // En EVALUAR los puntos no se muestran: abrir la ficha desmontaría la evaluación (RT-SW-04).
  // PENDIENTE decisión del Director (consulta a libro abierto, red-team §4 n.º 2).
  if (!hotspotsVisible || picking) return null; // libro abierto en EVALUAR (D-011-3A); ocultos solo al identificar
  const sel = nodesForEquipment(selectedEq);
  const emph = [...sel, ...focusNodes];
  const open = (kind: string, id: string) => {
    const st = useApp.getState();
    if (kind === 'process') { st.selectStage(id); const stg = idx.stage.get(id); if (stg) st.flyTo(stg.camera); }
    else if (idx.equipment.has(id)) st.selectEquipment(id);
    else return; // RT-SW-13: peligros u otros tipos sin panel propio todavía
    track('opened', id, { via: 'hotspot' });
  };
  return (
    <>
      {content.hotspots.map((h) => {
        const a = ANCHORS[h.nodeName];
        if (!a) return null;
        if (hidden.includes(h.nodeName)) return null;
        if (isolate && emph.length && !emph.some((f) => f === h.nodeName || f.startsWith(h.nodeName + '_'))) return null;
        const d = EXPLODE[h.nodeName] ?? [0, 0, 0];
        const pos: [number, number, number] = [a[0] + d[0] * explode, a[1] + d[1] * explode, a[2] + d[2] * explode];
        const eq = h.kind === 'equipment' ? idx.equipment.get(h.targetId) : undefined;
        const active = selectedEq === h.targetId;
        const dim = mode === 'learn' && focusNodes.length > 0 && !focusNodes.some((f) => f === h.nodeName || f.startsWith(h.nodeName + '_'));
        return (
          <Html key={h.id} position={pos} center zIndexRange={[30, 0]} style={{ pointerEvents: 'auto' }}>
            <button
              type="button"
              data-testid={`hotspot-${h.id}`}
              aria-label={`Punto ${h.number}: ${h.label}${eq ? ` — ${eq.summary.slice(0, 80)}` : ''}`}
              aria-current={active ? 'true' : undefined}
              onClick={() => open(h.kind, h.targetId)}
              className={`group relative flex items-center gap-2 whitespace-nowrap ${dim ? 'opacity-40' : ''}`}
            >
              <span className={`relative grid h-7 w-7 place-items-center rounded-full border font-mono text-[12px] font-medium shadow-lg transition ${active ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'border-white/30 bg-black/70 text-white hover:border-[var(--color-accent)] group-focus-visible:border-[var(--color-accent)]'} ${!active && !dim ? 'hotspot-pulse' : ''}`}>
                {String(h.number).padStart(2, '0')}
              </span>
              <span className={`rounded bg-black/80 px-2 py-0.5 text-[12px] text-white ${active ? 'block' : 'hidden group-hover:block group-focus-visible:block'}`}>{h.label}</span>
            </button>
          </Html>
        );
      })}
    </>
  );
}
