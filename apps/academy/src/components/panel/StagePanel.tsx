import type { ProcessStageT } from '../../types/content';
import { idx, stagesOrdered } from '../../lib/content';
import { useApp } from '../../stores/useApp';
import { Bullets, OpText, Section, Sources, StatusChip, btn } from '../ui/Status';
import { HazardCard } from './HazardCard';

export function StagePanel({ st }: { st: ProcessStageT }) {
  const selectEquipment = useApp((s) => s.selectEquipment), selectStage = useApp((s) => s.selectStage), flyTo = useApp((s) => s.flyTo);
  const next = st.nextStageId ? idx.stage.get(st.nextStageId) : null;
  const prev = stagesOrdered.find((s) => s.nextStageId === st.id);
  return (
    <div className="scroll-thin h-full overflow-y-auto px-4 py-4" data-testid="stage-panel">
      <div className="mb-1 flex items-center gap-2"><span className="font-mono text-[12px] text-[var(--color-accent)]">ETAPA {st.code}</span><StatusChip status={st.status} compact /></div>
      <h2 className="text-[19px] font-semibold leading-tight">{st.name}</h2>
      <p className="mb-4 mt-1 text-[13px] text-[var(--color-text-2)]">{st.summary}</p>
      <Section title="Propósito"><p className="text-[13.5px] text-[var(--color-text-2)]"><OpText text={st.purpose} /></p></Section>
      <div className="grid grid-cols-2 gap-4">
        <Section title="Entradas"><Bullets items={st.inputs} /></Section>
        <Section title="Salidas"><Bullets items={st.outputs} /></Section>
      </div>
      <Section title="Equipos">
        <div className="flex flex-wrap gap-1.5">{st.equipmentIds.map((e) => { const q = idx.equipment.get(e); return q ? <button key={e} className={btn + ' !py-1 text-[12px]'} onClick={() => selectEquipment(e)}><span className="font-mono text-[var(--color-accent)]">{String(q.hotspotNumber).padStart(2, '0')}</span> {q.shortName}</button> : null; })}</div>
      </Section>
      <Section title="Variables de proceso">
        <div className="overflow-hidden rounded-lg border border-[var(--color-line)]">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-[var(--color-surface-2)]"><tr><th className="label p-2">Variable</th><th className="label p-2">Por qué importa</th><th className="label p-2">Valor de planta</th></tr></thead>
            <tbody>{st.variables.map((v, i) => (<tr key={i} className="border-t border-[var(--color-line)] align-top"><td className="p-2 font-medium">{v.name}</td><td className="p-2 text-[var(--color-text-2)]">{v.why}</td><td className="p-2"><OpText text={v.value} /></td></tr>))}</tbody>
          </table>
        </div>
      </Section>
      <Section title="Decisiones del operador"><Bullets items={st.operatorDecisions} /></Section>
      <Section title="Dependencias"><Bullets items={st.dependencies} /></Section>
      <Section title="Peligros de la etapa"><div className="space-y-2">{st.hazardIds.map((h) => { const hz = idx.hazard.get(h); return hz ? <HazardCard key={h} h={hz} /> : null; })}</div></Section>
      <div className="flex justify-between gap-2">
        <button className={btn} disabled={!prev} onClick={() => { if (prev) { selectStage(prev.id); flyTo(prev.camera); } }}>← {prev ? prev.shortName : 'Inicio'}</button>
        <button className={btn} disabled={!next} onClick={() => { if (next) { selectStage(next.id); flyTo(next.camera); } }}>{next ? next.shortName : 'Fin'} →</button>
      </div>
      <Sources ids={st.sourceIds} />
    </div>
  );
}
