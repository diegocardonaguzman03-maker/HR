'use client';
// + NEW PROJECT — 7-step wizard. Launching builds a structure in the world.
import { useMemo, useRef, useState } from 'react';
import { TERRITORIES } from '@/data/territories';
import { inferKind, recommendAgents } from '@/services/agentRouter';
import { uid } from '@/services/ids';
import { BUILDING_FOR_KIND, findFreePlot, KIND_LABEL } from '@/services/projectFactory';
import { useUi } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { Priority, ProjectKind, TerritoryId } from '@/types/domain';
import type { ProjectDraft } from '@/types/events';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { AgentAvatar, Btn, cx, hex } from '@/components/ui/primitives';

const STEPS = ['Name', 'Territory', 'Objective', 'Agents', 'Files & context', 'Priority', 'Launch'];

export function CreateProjectModal({ territory: initialTerritory }: { territory?: TerritoryId }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProjectDraft>({
    name: '',
    territory: initialTerritory && initialTerritory !== 'citadel' ? initialTerritory : 'industrial',
    objective: '',
    kind: 'strategy',
    agentIds: [],
    autoAssign: true,
    files: [],
    context: '',
    priority: 'normal',
  });
  const [kindTouched, setKindTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<ProjectDraft>) => setDraft((d) => ({ ...d, ...p }));

  const kind: ProjectKind = kindTouched ? draft.kind : inferKind(`${draft.name} ${draft.objective}`, draft.territory);
  const rec = useMemo(() => recommendAgents(`${draft.name} ${draft.objective} ${draft.context}`, Object.values(world.agents)), [draft.name, draft.objective, draft.context, world.agents]);
  const plot = useMemo(() => findFreePlot(world, draft.territory), [world, draft.territory]);
  const canNext = [draft.name.trim().length > 1, !!plot, true, draft.autoAssign || draft.agentIds.length > 0, true, true, true][step];

  const launch = () => {
    const projectId = uid('p');
    dispatch({ type: 'project.create', projectId, draft: { ...draft, kind } });
    u.closeModal();
    u.showToast(`${draft.name} launched — construction started`);
    setTimeout(() => u.select({ kind: 'project', id: projectId }), 120);
  };

  return (
    <Modal
      title="New project"
      subtitle={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
      onClose={() => u.closeModal()}
      width={620}
      footer={
        <>
          <Btn variant="ghost" onClick={() => (step ? setStep(step - 1) : u.closeModal())}>{step ? 'Back' : 'Cancel'}</Btn>
          {step < STEPS.length - 1 ? (
            <Btn variant="primary" icon="chevronRight" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</Btn>
          ) : (
            <Btn variant="primary" icon="zap" onClick={launch}>LAUNCH PROJECT</Btn>
          )}
        </>
      }
    >
      <div className="mb-5 flex gap-1">
        {STEPS.map((s, i) => (
          <button key={s} type="button" disabled={i > step} onClick={() => setStep(i)} className={cx('h-1 flex-1 rounded-full', i <= step ? 'bg-[var(--accent)]' : 'bg-white/10')} aria-label={s} />
        ))}
      </div>

      {step === 0 && (
        <Field label="Project name">
          <input autoFocus className="field w-full" value={draft.name} onChange={(e) => set({ name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && canNext && setStep(1)} placeholder="e.g. Confined Spaces VR Training" />
        </Field>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {TERRITORIES.map((t) => {
            const free = findFreePlot(world, t.id);
            return (
              <button key={t.id} type="button" disabled={!free} onClick={() => set({ territory: t.id })} className={cx('rounded-xl border p-3 text-left transition disabled:opacity-40', draft.territory === t.id ? 'border-[var(--accent)] bg-[var(--accent)]/8' : 'border-white/10 hover:border-white/25')}>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-100"><span className="h-2.5 w-2.5 rounded-full" style={{ background: hex(t.palette.accent) }} />{t.name}</div>
                <div className="mt-0.5 text-[11.5px] text-zinc-400">{t.tagline}</div>
                <div className="mt-1 text-[10.5px] text-zinc-500">{free ? 'Free plot available' : 'No free plot'}</div>
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Field label="Objective">
            <textarea autoFocus rows={3} className="field w-full" value={draft.objective} onChange={(e) => set({ objective: e.target.value })} placeholder="What does success look like?" />
          </Field>
          <Field label="Project type (decides the structure)">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {(Object.keys(KIND_LABEL) as ProjectKind[]).map((k) => (
                <button key={k} type="button" onClick={() => { setKindTouched(true); set({ kind: k }); }} className={cx('rounded-lg border px-2.5 py-2 text-left text-[11.5px]', kind === k ? 'border-[var(--accent)] bg-[var(--accent)]/8 text-zinc-100' : 'border-white/10 text-zinc-400 hover:border-white/25')}>
                  {KIND_LABEL[k]}
                  <span className="block text-[10px] text-zinc-500">→ {BUILDING_FOR_KIND[k].structure}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[12.5px] text-zinc-200">
            <input type="checkbox" checked={draft.autoAssign} onChange={(e) => set({ autoAssign: e.target.checked })} className="accent-[var(--accent)]" />
            Automatically assign agents
          </label>
          {draft.autoAssign ? (
            <div className="rounded-lg bg-white/[0.035] p-3">
              <div className="mb-2 text-[11px] text-zinc-500">Recommended for this project:</div>
              {rec.agentIds.map((id) => world.agents[id]).map((a) => (
                <div key={a.id} className="flex items-center gap-2 py-1 text-[12.5px] text-zinc-200"><AgentAvatar agent={a} size={22} />{a.name}<span className="text-[11px] text-zinc-500">· {rec.reasons[a.id]}</span></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-1.5 sm:grid-cols-2">
              {Object.values(world.agents).map((a) => {
                const on = draft.agentIds.includes(a.id);
                return (
                  <button key={a.id} type="button" onClick={() => set({ agentIds: on ? draft.agentIds.filter((x) => x !== a.id) : [...draft.agentIds, a.id] })} className={cx('flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left', on ? 'border-[var(--accent)] bg-[var(--accent)]/8' : 'border-white/10 hover:border-white/25')}>
                    <AgentAvatar agent={a} size={24} />
                    <div className="min-w-0"><div className="text-[12px] font-semibold text-zinc-100">{a.name}</div><div className="truncate text-[10.5px] text-zinc-500">{a.role}</div></div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <Field label="Context for the agents">
            <textarea rows={3} className="field w-full" value={draft.context} onChange={(e) => set({ context: e.target.value })} placeholder="Background, constraints, links…" />
          </Field>
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => set({ files: [...draft.files, ...Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size }))] })} />
          <Btn variant="outline" icon="clip" onClick={() => fileRef.current?.click()}>Add files</Btn>
          <div className="flex flex-wrap gap-1">{draft.files.map((f, i) => <span key={i} className="rounded bg-white/8 px-2 py-0.5 text-[11px] text-zinc-300">{f.name}</span>)}</div>
          <p className="text-[10.5px] text-zinc-500">In demo mode only file names and sizes are recorded; contents stay on your device.</p>
        </div>
      )}

      {step === 5 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(['low', 'normal', 'high', 'critical'] as Priority[]).map((p) => (
            <button key={p} type="button" onClick={() => set({ priority: p })} className={cx('rounded-lg border px-3 py-3 text-center text-[12px] font-semibold uppercase tracking-wider', draft.priority === p ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-white/10 text-zinc-400 hover:border-white/25')}>
              {p}
            </button>
          ))}
        </div>
      )}

      {step === 6 && (
        <div className="space-y-3 text-[12.5px]">
          <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/6 p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]"><Icon name="building" size={13} /> Ready to build</div>
            <div className="mt-1 text-base font-semibold text-zinc-50">{draft.name}</div>
            <div className="text-zinc-400">{BUILDING_FOR_KIND[kind].structure} in {TERRITORIES.find((t) => t.id === draft.territory)?.name}</div>
          </div>
          <Summary label="Objective">{draft.objective || '—'}</Summary>
          <Summary label="Agents">{(draft.autoAssign ? rec.agentIds : draft.agentIds).map((id) => world.agents[id]?.name).join(', ') || '—'}</Summary>
          <Summary label="Priority">{draft.priority}</Summary>
          <Summary label="Files">{draft.files.length}</Summary>
          <p className="text-[11px] text-zinc-500">On launch, a structure rises on a free plot, a kick-off mission is created and the agents walk there.</p>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid grid-cols-[90px_1fr] gap-2"><span className="text-zinc-500">{label}</span><span className="text-zinc-200">{children}</span></div>;
}
