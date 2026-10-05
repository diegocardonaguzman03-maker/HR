import { useEffect, useRef, useState } from 'react';
import { missions, procedures } from '../content';
import type { ProcedureDocsT } from '../schema';
import { OpText } from '../../components/ui/Status';
import { DISCLAIMER } from '../../components/ui/Disclaimer';
import { asset, fileName } from '../../lib/download';
import { track } from '../../lib/analytics';

type Kind = 'wi' | 'manual' | 'checklist';
const KIND: Record<Kind, { label: string; short: string; icon: string }> = {
  wi: { label: 'Instrucción de trabajo', short: 'Instrucción', icon: '🛠' },
  manual: { label: 'Manual operativo', short: 'Manual', icon: '📘' },
  checklist: { label: 'Checklist', short: 'Checklist', icon: '☑' },
};

/** Botón de descarga de un documento (PDF). */
export function DocDownload({ p, kind, compact = false }: { p: ProcedureDocsT; kind: Kind; compact?: boolean }) {
  const d = p[kind];
  return (
    <a href={asset(d.file)} download={fileName(d.file)} onClick={() => track('downloaded', d.code)} data-testid={`dl-${d.code}`}
      className={`inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] font-semibold text-white transition hover:border-[var(--color-accent)] hover:bg-white/[0.08] ${compact ? 'px-3 py-1.5 text-[12.5px]' : 'px-4 py-2.5 text-[14px]'}`}>
      <span aria-hidden>{KIND[kind].icon}</span>{compact ? KIND[kind].short : KIND[kind].label}<span className="font-mono text-[10.5px] text-white/50">PDF ↓</span>
    </a>
  );
}

/** Lector dentro de la app (sin salir): pestañas Instrucción · Manual · Checklist. */
function Reader({ p, onClose }: { p: ProcedureDocsT; onClose: () => void }) {
  const [tab, setTab] = useState<Kind>('wi');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); prev?.focus?.(); };
  }, [onClose]);
  const d = p[tab];
  return (
    <div className="anim-fade fixed inset-0 z-50 grid place-items-center bg-black/70 p-3" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={p.title} className="anim-pop flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#14181d] text-white shadow-2xl" data-testid="proc-reader">
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div><p className="font-mono text-[11px] tracking-widest text-[var(--color-accent)]">{p.area.toUpperCase()}</p><h2 className="text-[19px] font-bold">{p.title}</h2></div>
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-[13px] text-white/70 hover:bg-white/10" data-testid="reader-close">Cerrar ✕</button>
        </header>
        <div role="tablist" className="flex gap-1 border-b border-white/10 px-4">
          {(Object.keys(KIND) as Kind[]).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} data-testid={`reader-tab-${k}`}
              className={`border-b-2 px-3 py-2.5 text-[13.5px] font-semibold transition ${tab === k ? 'border-[var(--color-accent)] text-white' : 'border-transparent text-white/50 hover:text-white'}`}>
              {KIND[k].icon} {KIND[k].label}
            </button>
          ))}
        </div>
        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-5 py-4 text-[14px] text-white/85" key={tab}>
          <div className="anim-rise space-y-4">
            <p className="flex flex-wrap items-center gap-2 text-[12px] text-white/55"><span className="rounded border border-[#a78bfa]/50 px-1.5 py-0.5 font-mono text-[#c4b5fd]">◇ DEMO</span>{d.code} · v{d.version} · Dueño: {d.owner} · Sin aprobación</p>
            {tab === 'wi' && (<>
              <p><strong className="text-white">Propósito.</strong> <OpText text={p.wi.purpose} /></p>
              <p><strong className="text-white">Alcance.</strong> <OpText text={p.wi.scope} /></p>
              <h3 className="font-semibold text-white">Equipo de protección</h3>
              <ul className="list-disc space-y-1 pl-5">{p.wi.ppe.map((x, i) => <li key={i}><OpText text={x} /></li>)}</ul>
              <h3 className="font-semibold text-white">Pasos</h3>
              <ol className="space-y-2">{p.wi.steps.map((s) => (
                <li key={s.n} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-semibold text-white"><span className="mr-2 font-mono text-[var(--color-accent)]">{s.n}</span><OpText text={s.action} /></p>
                  <p className="mt-1 text-[13px]"><span className="text-white/50">Punto clave: </span><OpText text={s.keyPoint} /></p>
                  <p className="text-[13px]"><span className="text-white/50">Por qué: </span><OpText text={s.why} /></p>
                </li>))}</ol>
              <h3 className="font-semibold text-[#ff8a8d]">⛔ Detente y avisa si…</h3>
              <ul className="list-disc space-y-1 pl-5">{p.wi.stopConditions.map((x, i) => <li key={i}><OpText text={x} /></li>)}</ul>
            </>)}
            {tab === 'manual' && p.manual.sections.map((s, i) => (
              <section key={i}><h3 className="mb-1 font-semibold text-white">{s.title}</h3>
                {s.paragraphs.map((x, j) => <p key={j} className="mb-1"><OpText text={x} /></p>)}
                {s.bullets.length > 0 && <ul className="list-disc space-y-1 pl-5">{s.bullets.map((x, j) => <li key={j}><OpText text={x} /></li>)}</ul>}
              </section>))}
            {tab === 'checklist' && (<>
              <p className="rounded-lg border border-[#f5c518]/40 bg-[#f5c518]/10 p-3 text-[13px]"><OpText text={p.checklist.instructions} /></p>
              {p.checklist.sections.map((s, i) => (
                <section key={i}><h3 className="mb-1 font-semibold text-white">{s.title}</h3>
                  <ul className="space-y-1">{s.items.map((it, j) => <li key={j} className="flex gap-2"><span aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 rounded border border-white/40" /><span>{it.critical && <span className="font-semibold text-[#ff8a8d]">▲ Crítico · </span>}<OpText text={it.text} /></span></li>)}</ul>
                </section>))}
            </>)}
          </div>
        </div>
        <footer className="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-3">
          <DocDownload p={p} kind={tab} />
          <span className="text-[11px] text-white/45">{DISCLAIMER}</span>
        </footer>
      </div>
    </div>
  );
}

/** Menú de procedimientos: cada uno con su misión y sus tres documentos descargables. */
export function Procedures({ onPlay }: { onPlay: (missionId: string) => void }) {
  const [open, setOpen] = useState<ProcedureDocsT | null>(null);
  return (
    <div className="scroll-thin h-full overflow-y-auto bg-[#0c0e11] px-5 py-8 text-white" data-testid="procedures">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[30px] font-bold">Procedimientos</h1>
        <p className="mt-1 text-[14px] text-white/65">Practica cada procedimiento como misión y descarga sus documentos: instrucción de trabajo, manual operativo y checklist.</p>
        <p className="mt-3 rounded-xl border border-[#a78bfa]/40 bg-[#a78bfa]/10 px-3 py-2 text-[12.5px] text-white/85"><strong>◇ Documentos de demostración.</strong> No son procedimientos aprobados de la planta y no deben usarse para operar. Los datos de planta aparecen como «pendiente de validación».</p>
        <ul className="mt-6 space-y-4">
          {procedures.map((p) => {
            const m = missions[p.missionId];
            return (
              <li key={p.procedureId} className="anim-rise rounded-2xl border border-white/10 bg-white/[0.03] p-5" data-testid={`proc-${p.procedureId}`}>
                <p className="font-mono text-[11px] tracking-widest text-[var(--color-accent)]">{p.area.toUpperCase()}</p>
                <h2 className="mt-0.5 text-[20px] font-bold">{p.title}</h2>
                <p className="mt-1 text-[14px] text-white/70">{p.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m && <button onClick={() => onPlay(m.id)} className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-[14px] font-bold text-[#1a1203] hover:brightness-110" data-testid={`play-${m.id}`}>▶ Jugar misión</button>}
                  <button onClick={() => { setOpen(p); track('opened', p.procedureId); }} className="rounded-xl border border-white/20 px-4 py-2.5 text-[14px] font-semibold hover:bg-white/10" data-testid={`read-${p.procedureId}`}>Ver procedimiento</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Descargas">
                  {(['wi', 'manual', 'checklist'] as Kind[]).map((k) => <DocDownload key={k} p={p} kind={k} compact />)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {open && <Reader p={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
