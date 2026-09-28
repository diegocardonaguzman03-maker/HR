import { useEffect, useState } from 'react';
import { EQUIPMENT, equipmentName } from '../data/equipment';
import { LAYER_MARKERS } from '../data/layerMarkers';
import { useAppStore } from '../store/useAppStore';
import type { EquipmentData } from '../types/equipment';
import { CLASSIFICATION_LABEL, HAZARD_LABEL, MATERIAL_STATE_LABEL } from './labels';
import { fmt, useSnapshot } from './useSnapshot';

type Tab = 'what' | 'how' | 'variables' | 'wrong' | 'impact' | 'components' | 'safety' | 'quality' | 'maintenance' | 'specs';

const TABS: { id: Tab; label: string; level: number }[] = [
  { id: 'what', label: 'What is this?', level: 1 },
  { id: 'components', label: 'Components', level: 1 },
  { id: 'how', label: 'How it works', level: 2 },
  { id: 'variables', label: 'Variables', level: 3 },
  { id: 'wrong', label: 'What can go wrong', level: 4 },
  { id: 'impact', label: 'Impact', level: 5 },
  { id: 'safety', label: 'Safety', level: 1 },
  { id: 'quality', label: 'Quality', level: 3 },
  { id: 'maintenance', label: 'Maintenance', level: 3 },
  { id: 'specs', label: 'Specifications', level: 3 },
];

const H = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 first:mt-0">{children}</h4>
);

function SimValues({ keys }: { keys?: string[] }) {
  const { snap } = useSnapshot();
  const entries = Object.entries(snap.variables).filter(([k]) => !keys || keys.includes(k));
  if (!entries.length) return <p className="text-xs text-zinc-500">No live values at this process stage.</p>;
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="rounded-sm border border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
          <div className="truncate text-[10px] text-zinc-500">{v.label}</div>
          <div className="font-mono text-sm text-zinc-100">
            {fmt(v.value, v.decimals)} <span className="text-[10px] text-zinc-500">{v.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EquipmentPanel({ eq }: { eq: EquipmentData }) {
  const level = useAppStore((s) => s.level);
  const componentMode = useAppStore((s) => s.componentMode);
  const selectedComponent = useAppStore((s) => s.selectedComponent);
  const explode = useAppStore((s) => s.explode);
  const st = useAppStore.getState();
  const [tab, setTab] = useState<Tab>('what');
  const tabs = TABS.filter((t) => t.level <= level);
  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab('what');
  }, [level, tab, tabs]);
  useEffect(() => {
    if (selectedComponent) setTab('components');
  }, [selectedComponent]);
  const comp = eq.components.find((c) => c.id === selectedComponent);
  const liveKeys = eq.processVariables.map((v) => v.key);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 pb-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{eq.category.replace('-', ' ')}</div>
            <h2 className="text-base font-semibold text-zinc-50">{eq.name}</h2>
          </div>
          <button onClick={() => st.select(null)} className="rounded-sm border border-white/10 px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-100" aria-label="Close">
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">{eq.purpose}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => st.setComponentMode(!componentMode)}
            className={`h-7 rounded-sm px-3 text-[11px] font-semibold tracking-wide ${componentMode ? 'bg-amber-400 text-zinc-900' : 'border border-white/15 text-zinc-200 hover:border-white/35'}`}
          >
            {componentMode ? 'EXIT MACHINE VIEW' : 'EXPLORE MACHINE'}
          </button>
          {componentMode && (
            <label className="flex items-center gap-2 text-[11px] text-zinc-400">
              Exploded
              <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => st.setExplode(Number(e.target.value))} className="w-24 accent-amber-400" />
            </label>
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <div><span className="text-zinc-500">Inputs:</span> <span className="text-zinc-300">{eq.inputs.join(', ')}</span></div>
          <div><span className="text-zinc-500">Outputs:</span> <span className="text-zinc-300">{eq.outputs.join(', ')}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-white/10 px-3 py-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-sm px-2 py-1 text-[11px] ${tab === t.id ? 'bg-white/10 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 text-[12.5px] leading-relaxed text-zinc-300">
        {tab === 'what' && (
          <>
            <H>Level 1 · What is this?</H>
            <p>{eq.description}</p>
            <H>Process stages</H>
            <div className="flex flex-wrap gap-1">
              {eq.processStages.map((s) => (
                <span key={s} className="rounded-sm border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">{s}</span>
              ))}
            </div>
          </>
        )}
        {tab === 'components' && (
          <>
            {!componentMode && <p className="mb-2 text-xs text-zinc-500">Tip: press <b className="text-zinc-300">Explore machine</b> to isolate the equipment and click its parts in 3D.</p>}
            {comp && (
              <div className="mb-3 rounded-sm border border-amber-400/40 bg-amber-400/[0.06] p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-amber-300">Selected component</div>
                <div className="font-semibold text-zinc-50">{comp.name}</div>
                <p className="mt-1 text-xs">{comp.function}</p>
                {comp.failureModes?.length ? <p className="mt-1 text-xs"><span className="text-zinc-500">Failure modes:</span> {comp.failureModes.join('; ')}</p> : null}
                {comp.inspectionPoints?.length ? <p className="mt-1 text-xs"><span className="text-zinc-500">Inspection points:</span> {comp.inspectionPoints.join('; ')}</p> : null}
                {comp.processConsequence && <p className="mt-1 text-xs"><span className="text-zinc-500">Process consequence:</span> {comp.processConsequence}</p>}
              </div>
            )}
            <ul className="space-y-1">
              {eq.components.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      if (!componentMode) st.setComponentMode(true);
                      st.select(eq.id, c.id);
                    }}
                    className={`w-full rounded-sm px-2 py-1.5 text-left hover:bg-white/5 ${c.id === selectedComponent ? 'bg-white/[0.06]' : ''}`}
                  >
                    <div className={`text-xs font-semibold ${c.id === selectedComponent ? 'text-amber-200' : 'text-zinc-100'}`}>{c.name}</div>
                    <div className="text-[11px] text-zinc-400">{c.function}</div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {tab === 'how' && (
          <>
            <H>Level 2 · How does it work?</H>
            {eq.howItWorks.map((p, i) => (
              <p key={i} className="mb-2">{p}</p>
            ))}
          </>
        )}
        {tab === 'variables' && (
          <>
            <H>Live values · simulated training data</H>
            <SimValues keys={liveKeys} />
            <H>Level 3 · Controlling variables</H>
            <ul className="space-y-2">
              {eq.processVariables.map((v) => (
                <li key={v.key} className="rounded-sm border border-white/[0.07] p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-100">{v.name}</span>
                    <span className="font-mono text-[10px] text-zinc-500">{v.unit}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{v.role}</p>
                  {v.trainingRange && <p className="mt-0.5 text-[11px]"><span className="text-zinc-500">Training range:</span> <span className="font-mono text-zinc-300">{v.trainingRange}</span></p>}
                  <Badge c={v.classification} />
                </li>
              ))}
            </ul>
          </>
        )}
        {tab === 'wrong' && (
          <>
            <H>Level 4 · What can go wrong?</H>
            <ul className="space-y-2">
              {eq.whatCanGoWrong.map((w, i) => (
                <li key={i} className="rounded-sm border border-white/[0.07] p-2">
                  <div className="font-semibold text-zinc-100">{w.event}</div>
                  <p className="text-xs"><span className="text-zinc-500">Consequence:</span> {w.consequence}</p>
                  <p className="text-xs"><span className="text-zinc-500">Typical response:</span> {w.typicalResponse}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-zinc-500">Generic industry responses. Plant-specific procedures are integrated separately.</p>
          </>
        )}
        {tab === 'impact' && (
          <>
            <H>Level 5 · Impact</H>
            {(['safety', 'quality', 'reliability', 'productivity'] as const).map((k) => (
              <div key={k} className="mb-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{k}</div>
                <p>{eq.impact[k]}</p>
              </div>
            ))}
          </>
        )}
        {tab === 'safety' && (
          <>
            <H>Principal hazards</H>
            <ul className="space-y-1.5">
              {eq.safetyHazards.map((h, i) => (
                <li key={i} className="rounded-sm border border-red-400/20 bg-red-500/[0.04] p-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-red-300">{HAZARD_LABEL[h.category]}</div>
                  <p className="text-xs">{h.description}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-zinc-500">Hazard categories only — plant safety procedures are integrated separately.</p>
          </>
        )}
        {tab === 'quality' && (
          <>
            <H>Quality relationships</H>
            <p className="mb-2 text-[11px] text-zinc-500">Product quality usually depends on several interacting process parameters.</p>
            <ul className="space-y-2">
              {eq.qualityImpact.map((q, i) => (
                <li key={i} className="rounded-sm border border-violet-300/20 p-2">
                  <div className="font-semibold text-zinc-100">{q.variable}</div>
                  <p className="text-xs">{q.mechanism}</p>
                  <p className="mt-0.5 text-[11px] text-violet-200">Possible defects: {q.possibleDefects.join(', ')}</p>
                </li>
              ))}
            </ul>
          </>
        )}
        {tab === 'maintenance' && (
          <ul className="space-y-2">
            {eq.maintenancePoints.map((m, i) => (
              <li key={i} className="rounded-sm border border-sky-300/20 p-2 text-xs">
                <div className="text-sm font-semibold text-zinc-100">{m.component}</div>
                <p><span className="text-zinc-500">Function:</span> {m.function}</p>
                <p><span className="text-zinc-500">Failure mode:</span> {m.failureMode}</p>
                <p><span className="text-zinc-500">Inspection points:</span> {m.inspectionPoints.join('; ')}</p>
                <p><span className="text-zinc-500">Considerations:</span> {m.considerations}</p>
                <p><span className="text-zinc-500">Process consequence:</span> {m.processConsequence}</p>
              </li>
            ))}
            <li className="text-[11px] text-zinc-500">No maintenance frequencies are shown: they are plant- and OEM-specific.</li>
          </ul>
        )}
        {tab === 'specs' && (
          <>
            <table className="w-full text-xs">
              <tbody>
                {eq.specifications.map((s, i) => (
                  <tr key={i} className="border-b border-white/[0.06] align-top">
                    <td className="py-1.5 pr-2 text-zinc-400">{s.label}</td>
                    <td className="py-1.5 pr-2 text-zinc-100">{s.value}</td>
                    <td className="py-1.5"><Badge c={s.classification} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {eq.references.length > 0 && (
              <>
                <H>References</H>
                <ul className="list-disc pl-4 text-[11px] text-zinc-400">
                  {eq.references.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Badge({ c }: { c: keyof typeof CLASSIFICATION_LABEL }) {
  const b = CLASSIFICATION_LABEL[c];
  return <span className={`mt-1 inline-block whitespace-nowrap rounded-sm border px-1 py-px text-[9px] uppercase tracking-wider ${b.cls}`}>{b.label}</span>;
}

export function StagePanel() {
  const { step, snap, next } = useSnapshot();
  const st = useAppStore.getState();
  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-3 text-[12.5px] leading-relaxed text-zinc-300">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Current operation</div>
      <h2 className="text-base font-semibold text-zinc-50">{step.title}</h2>
      <H>What is happening</H>
      <p>{step.whatHappens}</p>
      <H>Why it is necessary</H>
      <p>{step.why}</p>
      <H>Equipment operating</H>
      <div className="flex flex-wrap gap-1.5">
        {step.activeEquipment.map((id) => (
          <button key={id} onClick={() => st.select(id)} className="rounded-sm border border-white/15 px-2 py-1 text-xs text-zinc-100 hover:border-amber-400/60">
            {equipmentName(id)} ›
          </button>
        ))}
      </div>
      <H>Process values · simulated training data</H>
      <SimValues />
      <H>Steel state</H>
      <p>{MATERIAL_STATE_LABEL[snap.materialState]} · {fmt(snap.steelTemperature.value)} °C</p>
      {next && (
        <>
          <H>Next</H>
          <p>{next.title}</p>
        </>
      )}
      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] text-zinc-500">
        Click any machine in the 3D view to inspect it. Values are educational and do not represent operating limits of a real plant.
      </p>
    </div>
  );
}

function MarkerPanel({ id }: { id: string }) {
  const m = LAYER_MARKERS.find((x) => x.id === id);
  const st = useAppStore.getState();
  if (!m) return null;
  return (
    <div className="px-4 py-3 text-[12.5px] text-zinc-300">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{m.layer} layer</div>
      <h2 className="text-base font-semibold text-zinc-50">{m.title}</h2>
      <p className="mt-2">{m.text}</p>
      <button onClick={() => st.select(m.equipment)} className="mt-3 rounded-sm border border-white/15 px-2 py-1 text-xs text-zinc-100 hover:border-amber-400/60">
        Open {equipmentName(m.equipment)} ›
      </button>
    </div>
  );
}

export function InfoPanel() {
  const selected = useAppStore((s) => s.selected);
  const markerFocus = useAppStore((s) => s.markerFocus);
  const eq = selected ? EQUIPMENT[selected] : null;
  return (
    eq || markerFocus ? (
      <aside className="hud-panel animate-slide pointer-events-auto flex min-h-0 w-full flex-1 md:max-h-[calc(100vh-240px)] md:w-[400px] md:flex-none flex-col">
        {eq ? <EquipmentPanel key={eq.id} eq={eq} /> : markerFocus ? <MarkerPanel id={markerFocus.id} /> : null}
      </aside>
    ) : null
  );
}
