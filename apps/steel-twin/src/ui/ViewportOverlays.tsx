import { useMemo } from 'react';
import { EQUIPMENT, equipmentName } from '../data/equipment';
import { useAppStore } from '../store/useAppStore';
import { MATERIAL_STATE_COLOR, MATERIAL_STATE_LABEL, MATERIAL_STATE_ORDER } from './labels';
import { fmt, useSnapshot } from './useSnapshot';
import { metallurgicalLength, shellThickness, surfaceTemperature, centreTemperature, liquidFraction, SOLID_MODEL } from '../sim/solidification';

/** Critical UX card (brief §33): where / state / equipment / what / why / next. */
export function SteelStatus() {
  const { step, snap, next } = useSnapshot();
  const rows: [string, string][] = [
    ['¿Dónde está el acero?', snap.location],
    ['¿En qué estado está?', `${MATERIAL_STATE_LABEL[snap.materialState]} · ${fmt(snap.steelTemperature.value)} °C`],
    ['Equipo en operación', snap.currentEquipment ? equipmentName(snap.currentEquipment) : '—'],
    ['¿Qué está pasando?', step.whatHappens],
    ['¿Por qué?', step.why],
    ['¿Qué sigue?', next ? next.title : 'Colada terminada: reinicia o explora'],
  ];
  return (
    <div className="pointer-events-auto w-[360px] rounded-sm border border-white/10 bg-[#12151a]/90 p-3 shadow-2xl backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">Seguir el acero</span>
        <span className="font-mono text-[10px] text-zinc-500">{snap.heatId}</span>
      </div>
      <dl className="space-y-1.5">
        {rows.map(([k, v], i) => (
          <div key={k} className="grid grid-cols-[108px_1fr] gap-2">
            <dt className="text-[10.5px] text-zinc-500">{k}</dt>
            <dd className={`text-[11.5px] leading-snug ${i < 3 ? 'font-semibold text-zinc-100' : 'text-zinc-300'} ${i >= 3 ? 'line-clamp-2' : ''}`}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Visual material state model strip (brief §7). */
export function MaterialStrip() {
  const { snap } = useSnapshot();
  const cur = MATERIAL_STATE_ORDER.indexOf(snap.materialState);
  return (
    <div className="pointer-events-auto hidden items-stretch gap-[2px] hud-panel p-1.5 xl:flex">
      {MATERIAL_STATE_ORDER.map((m, i) => (
        <div key={m} title={MATERIAL_STATE_LABEL[m]} className={`flex w-[56px] flex-col items-center rounded-[2px] px-0.5 py-1 ${i === cur ? 'bg-white/10' : ''}`}>
          <div
            className={`h-2 w-full rounded-[1px] ${i === cur ? 'ring-1 ring-amber-300' : ''}`}
            style={{ background: MATERIAL_STATE_COLOR[m], opacity: i <= cur ? 1 : 0.35 }}
          />
          <div className={`mt-1 text-center text-[8.5px] leading-tight ${i === cur ? 'font-semibold text-zinc-50' : i < cur ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {MATERIAL_STATE_LABEL[m]}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Hover tooltip: short function only; details need a click (brief §9). */
export function HoverTooltip() {
  const hovered = useAppStore((s) => s.hovered);
  const componentMode = useAppStore((s) => s.componentMode);
  if (!hovered) return null;
  const eq = EQUIPMENT[hovered.id];
  const comp = componentMode && hovered.component ? eq.components.find((c) => c.id === hovered.component) : undefined;
  return (
    <div className="pointer-events-none fixed z-50 max-w-[260px] rounded-sm border border-sky-400/40 bg-[#12151a]/95 px-2.5 py-1.5 shadow-xl" style={{ left: hovered.x + 16, top: hovered.y + 14 }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-200">{comp ? comp.name : eq.shortName}</div>
      <div className="text-[11px] leading-snug text-zinc-300">{comp ? comp.function : eq.tooltip}</div>
      <div className="mt-0.5 text-[10px] text-zinc-500">Clic para inspeccionar</div>
    </div>
  );
}

export function TemperatureLegend() {
  const on = useAppStore((s) => s.layers.temperature);
  if (!on) return null;
  return (
    <div className="pointer-events-auto hidden rounded-sm border border-white/10 bg-[#12151a]/85 p-2 text-[10px] md:block text-zinc-400">
      <div className="mb-1 font-semibold uppercase tracking-wider text-zinc-300">Temperatura superficial de la barra · simulada</div>
      <div className="h-2 w-56 rounded-[1px]" style={{ background: 'linear-gradient(90deg,#2c4bd6,#22b8c9,#e6d33a,#e2461f,#fff3e0)' }} />
      <div className="mt-0.5 flex justify-between font-mono"><span>700 °C</span><span>1,125 °C</span><span>1,550 °C</span></div>
    </div>
  );
}

/** Cross-section + longitudinal solidification profile (brief §11, §34). */
export function SolidificationPanel() {
  const open = useAppStore((s) => s.sectionOpen && !s.selected);
  const s = useAppStore((st) => st.sectionS);
  const setSection = useAppStore((st) => st.setSection);
  const { snap } = useSnapshot();
  const lm = metallurgicalLength();
  const profile = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= 36; x += 0.5) pts.push(`${(x / 36) * 300},${80 - (shellThickness(x) / SOLID_MODEL.halfThicknessMm) * 70}`);
    return pts.join(' ');
  }, []);
  if (!open) return null;
  const e = shellThickness(s);
  const half = SOLID_MODEL.halfThicknessMm;
  const reached = s <= snap.strand.castLength;
  // section drawing: 1500 × 230 mm → 300 × 46 px (×2 thickness for legibility)
  const W = 300, T = 92;
  const ex = (e / 750) * W, et = (e / half) * (T / 2);
  return (
    <div className="pointer-events-auto w-full max-w-[340px] overflow-y-auto rounded-sm border border-sky-400/30 bg-[#12151a]/92 p-3 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200">Solidificación de la barra</span>
        <button onClick={() => setSection(s, false)} className="text-xs text-zinc-500 hover:text-zinc-200">✕</button>
      </div>
      <div className="mt-1 text-[10px] text-zinc-500">Sección 230 × 1,500 mm · espesor dibujado ×2 · e = K·√t, K = {SOLID_MODEL.K} mm/√min, v = {SOLID_MODEL.castingSpeed} m/min (simulado)</div>
      <svg viewBox={`0 0 ${W} ${T}`} className="mt-2 w-full">
        <rect x={0} y={0} width={W} height={T} fill={reached ? '#a3280d' : '#2a2e35'} rx={2} />
        {reached && liquidFraction(s) > 0 && <rect x={ex} y={et} width={Math.max(0, W - 2 * ex)} height={Math.max(0, T - 2 * et)} fill="#ffa640" rx={2} />}
        {!reached && <text x={W / 2} y={T / 2 + 4} textAnchor="middle" fill="#9aa1ab" fontSize="11">la barra todavía no llega a esta posición</text>}
      </svg>
      <div className="mt-1 flex justify-between text-[10px]">
        <span className="text-orange-300">■ costra sólida</span>
        <span className="text-amber-200">■ núcleo líquido</span>
      </div>
      <label className="mt-2 block text-[11px] text-zinc-400">
        Distancia desde el menisco: <span className="font-mono text-zinc-100">{s.toFixed(1)} m</span>
        <input type="range" min={0.2} max={36} step={0.1} value={s} onChange={(ev) => setSection(Number(ev.target.value), true)} className="w-full accent-sky-400" />
      </label>
      <div className="mt-1 grid grid-cols-2 gap-1.5 text-[11px]">
        {[
          ['Espesor de costra', `${fmt(e)} mm por cara`],
          ['Fracción líquida', `${fmt(liquidFraction(s) * 100)} %`],
          ['Temp. superficial', `${fmt(surfaceTemperature(s))} °C`],
          ['Temp. al centro', `${fmt(centreTemperature(s))} °C`],
          ['Tiempo de residencia', `${fmt(s / SOLID_MODEL.castingSpeed, 1)} min`],
          ['Longitud metalúrgica', `${fmt(lm, 1)} m`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-sm border border-white/[0.07] px-1.5 py-1">
            <div className="text-[9.5px] text-zinc-500">{k}</div>
            <div className="font-mono text-zinc-100">{v}</div>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 300 92" className="mt-2 w-full">
        <line x1={0} y1={80} x2={300} y2={80} stroke="#3a3f47" />
        <line x1={(lm / 36) * 300} y1={4} x2={(lm / 36) * 300} y2={80} stroke="#ffb020" strokeDasharray="3 3" />
        <text x={(lm / 36) * 300 - 4} y={12} textAnchor="end" fill="#ffb020" fontSize="9">longitud metalúrgica</text>
        <polyline points={profile} fill="none" stroke="#e0550f" strokeWidth={2} />
        <line x1={(s / 36) * 300} y1={4} x2={(s / 36) * 300} y2={80} stroke="#5aa9ff" />
        <text x={2} y={90} fill="#8a8f98" fontSize="9">0 m (menisco)</text>
        <text x={298} y={90} textAnchor="end" fill="#8a8f98" fontSize="9">36 m</text>
        <text x={2} y={20} fill="#8a8f98" fontSize="9">costra → 100 % sólido</text>
      </svg>
    </div>
  );
}
