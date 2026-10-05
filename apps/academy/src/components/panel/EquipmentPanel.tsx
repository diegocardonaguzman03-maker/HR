import type { EquipmentT } from '../../types/content';
import { idx } from '../../lib/content';
import { useShallow } from 'zustand/react/shallow';
import { useApp, type Tab } from '../../stores/useApp';
import { Tabs } from '../ui/Tabs';
import { Bullets, OpText, Section, Sources, StatusChip, btn } from '../ui/Status';
import { HazardCard } from './HazardCard';
import { DocumentCard } from '../library/DocumentCard';
import { track } from '../../lib/analytics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'GENERAL' }, { id: 'operation', label: 'OPERACIÓN' }, { id: 'components', label: 'COMPONENTES' },
  { id: 'safety', label: 'SEGURIDAD' }, { id: 'controls', label: 'CONTROL' }, { id: 'maintenance', label: 'MANTENIMIENTO' },
  { id: 'training', label: 'FORMACIÓN' }, { id: 'documents', label: 'DOCUMENTOS' }, { id: 'videos', label: 'VIDEOS' },
];

export function EquipmentPanel({ eq }: { eq: EquipmentT }) {
  const { tab, set, selectedComponentNode, setMode } = useApp(useShallow((s) => ({ tab: s.tab, set: s.set, selectedComponentNode: s.selectedComponentNode, setMode: s.setMode })));
  const hazards = eq.hazardIds.map((h) => idx.hazard.get(h)!).filter(Boolean);
  const crit = hazards.filter((h) => h.severity === 'critical');
  const tabs = TABS.map((t) => ({ ...t, badge: t.id === 'safety' ? hazards.length : t.id === 'documents' ? eq.documentIds.length : t.id === 'videos' ? eq.videoIds.length : undefined }));
  return (
    <div className="flex h-full flex-col" data-testid="equipment-panel">
      <header className="px-4 pb-3 pt-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[12px] text-[var(--color-accent)]">{String(eq.hotspotNumber).padStart(2, '0')}</span>
          <StatusChip status={eq.status} compact />
        </div>
        <h2 className="text-[19px] font-semibold leading-tight">{eq.name}</h2>
        <p className="mt-1 text-[13px] text-[var(--color-text-2)]">{eq.summary}</p>
        {crit.length > 0 && (
          <p role="note" className="mt-2 flex items-start gap-2 rounded border border-[var(--color-danger)]/50 bg-[var(--color-danger)]/10 px-2 py-1.5 text-[12.5px]">
            <span aria-hidden className="font-bold text-[var(--color-danger)]">▲</span>
            <span><strong>Peligros críticos:</strong> {crit.map((h) => h.name).join(' · ')}. Consulta la pestaña Seguridad.</span>
          </p>
        )}
      </header>
      <Tabs label={`Información de ${eq.name}`} tabs={tabs} value={tab} onChange={(t) => { set({ tab: t }); track('opened', `${eq.id}#${t}`); }} />
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="scroll-thin flex-1 overflow-y-auto px-4 py-4">
        {tab === 'overview' && (<>
          <Section title="Función"><p className="text-[13.5px] text-[var(--color-text-2)]"><OpText text={eq.function} /></p></Section>
          <Section title="Cómo funciona">
            <ol className="space-y-2">{eq.howItWorks.map((t, i) => (<li key={i} className="flex gap-3 text-[13.5px] text-[var(--color-text-2)]"><span className="font-mono text-[var(--color-accent)]">{i + 1}</span><OpText text={t} /></li>))}</ol>
          </Section>
          <Section title="Etapas del proceso donde participa">
            <div className="flex flex-wrap gap-1.5">{eq.stageIds.map((s) => { const st = idx.stage.get(s); return st ? <button key={s} className={btn} onClick={() => { useApp.getState().selectStage(s); useApp.getState().flyTo(st.camera); }}>{st.code} · {st.shortName}</button> : null; })}</div>
          </Section>
          <Sources ids={eq.sourceIds} />
        </>)}
        {tab === 'operation' && (<>
          <Section title="Entradas"><Bullets items={eq.inputs} /></Section>
          <Section title="Salidas"><Bullets items={eq.outputs} /></Section>
          <Section title="Movimientos"><Bullets items={eq.movements} /></Section>
          <Section title="Notas de operación"><Bullets items={eq.operationalNotes} /></Section>
          <Section title="Señales observables"><Bullets items={eq.observableSignals} /></Section>
          <Section title="Errores comunes"><Bullets items={eq.commonMistakes} /></Section>
        </>)}
        {tab === 'components' && (
          <ul className="space-y-2" data-testid="components-list">
            {eq.components.map((c) => {
              const active = c.nodeName && c.nodeName === selectedComponentNode;
              return (
                <li key={c.id} className={`rounded-lg border p-3 ${active ? 'border-[var(--color-accent)]' : 'border-[var(--color-line)]'} bg-[var(--color-surface-2)]`}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold">{c.name}</h4>
                    {c.nodeName && <button className={btn + ' !px-2 !py-0.5 text-[11px]'} aria-pressed={!!active} onClick={() => { set({ selectedComponentNode: active ? null : c.nodeName! }); useApp.getState().fitNodes([c.nodeName!]); }}>{active ? 'Quitar resaltado' : 'Ver en 3D'}</button>}
                  </div>
                  <p className="mt-1 text-[13px] text-[var(--color-text-2)]"><OpText text={c.function} /></p>
                  {c.failureModes.length > 0 && <div className="mt-2"><h5 className="label mb-1">Modos de falla</h5><Bullets items={c.failureModes} /></div>}
                  {c.inspectionPoints.length > 0 && <div className="mt-2"><h5 className="label mb-1">Puntos de inspección</h5><Bullets items={c.inspectionPoints} /></div>}
                </li>
              );
            })}
          </ul>
        )}
        {tab === 'safety' && (
          <div className="space-y-2" data-testid="safety-list">
            <p className="mb-3 rounded border border-[var(--color-line)] bg-[var(--color-surface-2)] p-2 text-[12.5px] text-[var(--color-text-2)]">
              <span aria-hidden>ⓘ </span>Información educativa. Las zonas de exclusión, permisos, bloqueos y condiciones de paro <strong>los define el procedimiento aprobado de la planta</strong>; aquí aparecen como pendientes.
            </p>
            {hazards.map((h, i) => <HazardCard key={h.id} h={h} open={i === 0} />)}
          </div>
        )}
        {tab === 'controls' && (<>
          <Section title="Fuentes de energía"><Bullets items={eq.energySources} /></Section>
          <Section title="Actuadores"><Bullets items={eq.actuators} /></Section>
          <Section title="Sensores"><Bullets items={eq.sensors} /></Section>
          <Section title="Señales de control"><Bullets items={eq.controlSignals} /></Section>
          <Section title="Dependencias"><Bullets items={eq.dependencies} /></Section>
        </>)}
        {tab === 'maintenance' && (<>
          <Section title="Modos de falla"><Bullets items={eq.maintenance.failureModes} /></Section>
          <Section title="Puntos de inspección"><Bullets items={eq.maintenance.inspectionPoints} /></Section>
          <Section title="Consideraciones"><Bullets items={eq.maintenance.considerations} /></Section>
        </>)}
        {tab === 'training' && (
          <div className="space-y-2">
            {eq.learningModuleIds.map((m) => { const mod = idx.module.get(m); return mod ? (
              <div key={m} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3">
                <div className="mb-1 flex items-center gap-2"><StatusChip status={mod.status} compact /><span className="font-mono text-[11px] text-[var(--color-text-3)]">{mod.durationMin} min · niveles {mod.levels.join(', ')}</span></div>
                <h4 className="font-semibold">{mod.title}</h4>
                <p className="mt-1 text-[13px] text-[var(--color-text-2)]">{mod.summary}</p>
                <button className={btn + ' mt-2'} onClick={() => { useApp.getState().set({ moduleId: m, lessonIdx: 0 }); setMode('learn'); }}>Abrir módulo</button>
              </div>) : null; })}
            {[...idx.wi.values()].filter((w) => w.equipmentIds.includes(eq.id)).map((w) => (
              <div key={w.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3">
                <div className="mb-1"><StatusChip status={w.status} compact /></div>
                <h4 className="font-semibold">{w.title}</h4>
                <button className={btn + ' mt-2'} onClick={() => { useApp.getState().set({ wiId: w.id }); setMode('perform'); }}>Ver instrucción (modo EJECUTAR)</button>
              </div>
            ))}
          </div>
        )}
        {tab === 'documents' && (
          <div className="space-y-2">{eq.documentIds.length ? eq.documentIds.map((d) => { const doc = idx.document.get(d); return doc ? <DocumentCard key={d} doc={doc} /> : null; }) : <p className="text-[var(--color-text-3)]">Sin documentos ligados todavía.</p>}</div>
        )}
        {tab === 'videos' && (
          <div className="space-y-2">{eq.videoIds.length ? eq.videoIds.map((v) => { const vid = idx.video.get(v); return vid ? (
            <button key={v} className="flex w-full items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3 text-left hover:border-[var(--color-text-3)]" onClick={() => useApp.getState().set({ videoId: v })}>
              <span aria-hidden className="grid h-10 w-14 place-items-center rounded bg-black text-[var(--color-accent)]">▶</span>
              <span className="flex-1"><span className="block font-semibold">{vid.title}</span><span className="font-mono text-[11px] text-[var(--color-text-3)]">{vid.durationSec} s · {vid.chapters.length} capítulos · subtítulos</span></span>
              <StatusChip status={vid.status} compact />
            </button>) : null; }) : <p className="text-[var(--color-text-3)]">Sin videos ligados todavía.</p>}</div>
        )}
      </div>
    </div>
  );
}
