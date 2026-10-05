import { useEffect, useState } from 'react';
import { content, idx } from '../../lib/content';
import { track } from '../../lib/analytics';
import { nodesForEquipment, useApp } from '../../stores/useApp';
import { Bullets, OpText, Sources, StatusChip, btn, btnPrimary } from '../ui/Status';
import { DownloadLink } from '../library/DocumentCard';
import { HazardCard } from '../panel/HazardCard';

/** Modo EJECUTAR: ayuda de trabajo paso a paso. Nunca se presenta como instrucción aprobada si no lo es. */
export function PerformJobAid() {
  const wiId = useApp((s) => s.wiId), set = useApp((s) => s.set);
  const wi = wiId ? idx.wi.get(wiId) : null;
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (!wi) return;
    // RT-SW-01: el nodo 3D sale de equipment.nodeNames (contrato), no del ID del equipo
    const nodes = wi.equipmentIds.flatMap((e) => [...nodesForEquipment(e)]);
    set({ focusNodes: nodes, selectedEq: null });
    if (nodes.length) useApp.getState().fitNodes(nodes);
    setStep(0); setChecked(new Set()); setIntro(true);
    // TRN-06 / SAF-11: la práctica se registra como simulación, nunca como verificación OJT
    track('started', `${wi.id}#practica-sim`, { simulated: true });
  }, [wi, set]);

  if (!wi) {
    return (
      <div className="p-4" data-testid="wi-list">
        <h2 className="text-[19px] font-semibold">Ejecutar</h2>
        <p className="mb-4 text-[13px] text-[var(--color-text-2)]">Practica una instrucción paso a paso como ayuda de trabajo (job aid) en simulación.</p>
        {content.workInstructions.map((w) => (
          <article key={w.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3">
            <StatusChip status={w.status} compact />
            <h3 className="mt-1 font-semibold">{w.title}</h3>
            <p className="text-[12.5px] text-[var(--color-text-3)]">{w.steps.length} pasos · {w.role}</p>
            <button className={btnPrimary + ' mt-2'} onClick={() => set({ wiId: w.id })} data-testid={`open-${w.id}`}>Abrir</button>
          </article>
        ))}
      </div>
    );
  }
  const approved = wi.status === 'PLANT_APPROVED';
  const s = wi.steps[step];
  const stopStep = !!s && isStop(s);
  const stopIdx = wi.steps.findIndex(isStop);
  return (
    <div className="flex h-full flex-col" data-testid="perform-jobaid">
      <div className="border-b border-[var(--color-line)] p-4">
        <button className="label hover:text-[var(--color-text)]" onClick={() => set({ wiId: null, focusNodes: [] })}>← Instrucciones</button>
        <h2 className="mt-1 font-semibold leading-tight">{wi.title}</h2>
        {!approved && (
          <p role="alert" className="mt-2 rounded border border-[var(--color-st-demo)]/60 bg-[var(--color-st-demo)]/10 px-2 py-1.5 text-[12.5px]" data-testid="not-approved-banner">
            <strong><span aria-hidden>◇ </span>{wi.status === 'DEMO' ? 'DEMOSTRACIÓN' : 'NO VALIDADA'} — no es una instrucción aprobada.</strong> No la uses para operar. Los pasos marcados SME_REQUIRED los define el procedimiento aprobado de la planta.
          </p>
        )}
      </div>
      {intro ? (
        <div className="scroll-thin flex-1 overflow-y-auto p-4" data-testid="wi-intro">
          <p className="mb-3 text-[13.5px] text-[var(--color-text-2)]"><OpText text={wi.purpose} /></p>
          <p className="label mb-1">Rol</p><p className="mb-3 text-[13.5px]">{wi.role}</p>
          <p className="label mb-1">Requisitos previos</p><div className="mb-3"><Bullets items={wi.prerequisites} /></div>
          <p className="label mb-1">EPP</p><div className="mb-3"><Bullets items={wi.ppe} /></div>
          <p className="label mb-1">Herramientas</p><div className="mb-3"><Bullets items={wi.tools} /></div>
          <p className="label mb-2">Peligros</p>
          <div className="mb-3 space-y-2">{wi.hazardIds.map((h) => { const hz = idx.hazard.get(h); return hz ? <HazardCard key={h} h={hz} /> : null; })}</div>
          <div className="flex flex-wrap gap-2">{wi.documentIds.map((d) => { const doc = idx.document.get(d); return doc ? <span key={d} className="inline-flex flex-col gap-1"><span className="text-[11px] text-[var(--color-text-3)]">{doc.title}</span><DownloadLink doc={doc} /></span> : null; })}</div>
          <Sources ids={wi.sourceIds} />
        </div>
      ) : step >= wi.steps.length ? (
        <div className="scroll-thin flex-1 overflow-y-auto p-4" data-testid="wi-complete">
          <h3 className="mb-2 text-[18px] font-semibold"><span aria-hidden>✔ </span>Recorrido completo ({checked.size}/{wi.steps.length} pasos verificados)</h3>
          <p className="label mb-1">Cierre</p><Bullets items={wi.completion} />
          <p role="note" className="mt-3 rounded border border-[var(--color-st-sme)]/60 bg-[var(--color-st-sme)]/10 p-2 text-[13px]"><strong>Práctica en simulación.</strong> No acredita que puedas hacer la tarea en planta: eso lo evalúa un instructor en piso con el procedimiento aprobado.</p>
        </div>
      ) : (
        <div className="scroll-thin flex-1 overflow-y-auto p-4" data-testid={`wi-step-${s.n}`}>
          <ol className="mb-3 flex gap-1" aria-label="Pasos">
            {/* RT-UX-06: 24 px, número visible y marca de texto (no solo color) */}
            {wi.steps.map((x, k) => <li key={x.n} className="flex-1"><button onClick={() => setStep(k)} aria-label={`Paso ${x.n}${checked.has(x.n) ? ' (revisado en práctica)' : ''}${isStop(x) ? ' (ALTO)' : ''}`} aria-current={k === step ? 'step' : undefined}
              className={`grid h-6 w-full min-w-6 place-items-center rounded font-mono text-[11px] ${k === step ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : checked.has(x.n) ? 'border border-[var(--color-safe)] text-[var(--color-safe)]' : isStop(x) ? 'border border-[var(--color-danger)] text-[var(--color-danger)]' : 'border border-[var(--color-line-strong)] text-[var(--color-text-2)]'}`}>
              {checked.has(x.n) && k !== step ? '✔' : x.n}</button></li>)}
          </ol>
          <p className="label">Paso {s.n} de {wi.steps.length}</p>
          <h3 className={`mb-3 text-[18px] font-semibold leading-tight ${stopStep ? 'text-[var(--color-danger)]' : ''}`}>{stopStep && <span aria-hidden>⛔ </span>}{s.title}</h3>
          <Block t="Acción"><OpText text={s.action} /></Block>
          <Block t="Por qué"><OpText text={s.why} /></Block>
          {s.visual && <Block t="Apoyo visual"><span className="text-[var(--color-text-3)]"><OpText text={s.visual} /></span></Block>}
          <Block t="Verifica"><OpText text={s.check} /></Block>
          <Block t="Resultado esperado"><OpText text={s.expected} /></Block>
          {s.warning && <p role="note" className="mb-3 rounded border border-[var(--color-warning)]/60 bg-[var(--color-warning)]/10 p-2 text-[13px]"><strong><span aria-hidden>▲ </span>ADVERTENCIA: </strong><OpText text={s.warning} /></p>}
          {s.commonError && <Block t="Error común"><OpText text={s.commonError} /></Block>}
          {s.escalation && <p className="mb-3 rounded border border-[var(--color-mandatory)]/60 bg-[var(--color-mandatory)]/10 p-2 text-[13px]"><strong><span aria-hidden>☎ </span>Si algo no está bien: </strong><OpText text={s.escalation} /></p>}
          <label className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--color-line)] p-2 text-[13.5px]">
            <input type="checkbox" className="h-4 w-4 accent-[var(--color-accent)]" checked={checked.has(s.n)} data-testid="step-check"
              onChange={(e) => { const c = new Set(checked); if (e.target.checked) { c.add(s.n); track('checked', `${wi.id}#practica-sim-${s.n}`, { simulated: true }); } else c.delete(s.n); setChecked(c); }} />
            Revisé este paso (práctica)
          </label>
        </div>
      )}
      <div className="flex justify-between gap-2 border-t border-[var(--color-line)] p-3">
        <button className={btn} disabled={intro} onClick={() => (step === 0 ? setIntro(true) : setStep(step - 1))}>← Anterior</button>
        {!intro && step < wi.steps.length && stopIdx >= 0 && stopIdx !== step && <button className={btn + ' !border-[var(--color-danger)] text-[var(--color-danger)]'} onClick={() => setStep(stopIdx)} data-testid="stop-now"><span aria-hidden>⛔ </span>ALTO: detente y avisa</button>}
        {intro ? <button className={btnPrimary} onClick={() => setIntro(false)} data-testid="wi-begin">Comenzar pasos →</button>
          : step < wi.steps.length && <button className={btnPrimary} data-testid="next-step" onClick={() => { const n = step + 1; setStep(n); if (n >= wi.steps.length) track('completed', `${wi.id}#practica-sim`, { checked: checked.size, simulated: true }); }}>{step + 1 >= wi.steps.length ? 'Terminar' : 'Siguiente paso →'}</button>}
      </div>
    </div>
  );
}

/** Paso de paro: bandera `stop` del contenido o, si falta, título que empieza con ALTO / dice DETENTE (SAF-08, RT-SW-15). */
const isStop = (x: { title: string; stop?: boolean }) => x.stop ?? /^\s*ALTO\b|\bDET[EÉ]NTE\b/.test(x.title);

function Block({ t, children }: { t: string; children: React.ReactNode }) {
  return <div className="mb-3"><h4 className="label mb-0.5">{t}</h4><div className="text-[13.5px] text-[var(--color-text-2)]">{children}</div></div>;
}
