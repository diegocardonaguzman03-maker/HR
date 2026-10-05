import { useMemo, useState } from 'react';
import { content, idx } from '../../lib/content';
import { STATUS_META } from '../../lib/content/status';
import { DocumentCard, typeLabel } from './DocumentCard';
import { StatusChip } from '../ui/Status';
import { useApp } from '../../stores/useApp';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const sel = 'rounded-md border border-[var(--color-line-strong)] bg-[var(--color-surface-2)] px-2 py-1.5 text-[13px]';

export function Library() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState('');
  const [eq, setEq] = useState('');
  const [role, setRole] = useState('');
  const roles = useMemo(() => [...new Set(content.documents.flatMap((d) => d.roles))].sort(), []);
  const docs = content.documents.filter((d) =>
    (!q || norm(`${d.title} ${d.description}`).includes(norm(q))) && (!type || d.type === type) && (!status || d.status === status) &&
    (!stage || d.processIds.includes(stage)) && (!eq || d.equipmentIds.includes(eq)) && (!role || d.roles.includes(role)));
  return (
    <div className="scroll-thin h-full overflow-y-auto p-4" data-testid="library">
      <h2 className="text-[19px] font-semibold">Biblioteca</h2>
      <p className="mb-4 text-[13px] text-[var(--color-text-2)]">Documentos y videos del módulo. Ninguno está aprobado para operación: revisa el estado de cada uno.</p>
      <div className="mb-4 grid gap-2 sm:grid-cols-2" role="search">
        <label className="sm:col-span-2"><span className="sr-only">Buscar documentos</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título o descripción…" className={sel + ' w-full'} data-testid="library-search" /></label>
        <label><span className="label block">Tipo</span><select className={sel + ' w-full'} value={type} onChange={(e) => setType(e.target.value)} data-testid="filter-type"><option value="">Todos</option>{[...new Set(content.documents.map((d) => d.type))].map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}</select></label>
        <label><span className="label block">Estado</span><select className={sel + ' w-full'} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option>{Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}</select></label>
        <label><span className="label block">Etapa</span><select className={sel + ' w-full'} value={stage} onChange={(e) => setStage(e.target.value)}><option value="">Todas</option>{content.processes.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.shortName}</option>)}</select></label>
        <label><span className="label block">Equipo</span><select className={sel + ' w-full'} value={eq} onChange={(e) => setEq(e.target.value)}><option value="">Todos</option>{content.equipment.map((p) => <option key={p.id} value={p.id}>{p.shortName}</option>)}</select></label>
        <label className="sm:col-span-2"><span className="label block">Rol</span><select className={sel + ' w-full'} value={role} onChange={(e) => setRole(e.target.value)}><option value="">Todos</option>{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
      </div>
      <p className="label mb-2" aria-live="polite">{docs.length} documento(s)</p>
      <div className="space-y-2">{docs.map((d) => <DocumentCard key={d.id} doc={d} />)}</div>
      <h3 className="label mb-2 mt-6">Videos</h3>
      {content.videos.map((v) => (
        <button key={v.id} className="flex w-full items-center gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-2)] p-3 text-left hover:border-[var(--color-text-3)]" onClick={() => useApp.getState().set({ videoId: v.id })} data-testid={`video-${v.id}`}>
          <span aria-hidden className="grid h-10 w-14 place-items-center rounded bg-black text-[var(--color-accent)]">▶</span>
          <span className="flex-1"><span className="block font-semibold">{v.title}</span><span className="font-mono text-[11px] text-[var(--color-text-3)]">{v.durationSec} s · {v.chapters.length} capítulos · {v.equipmentIds.map((e) => idx.equipment.get(e)?.shortName).join(', ')}</span></span>
          <StatusChip status={v.status} compact />
        </button>
      ))}
    </div>
  );
}
