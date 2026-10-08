'use client';
// Launch REAL work: a Claude Code session on Francisco's repository, run by a team.
import { useMemo, useState } from 'react';
import { recommendAgents } from '@/services/agentRouter';
import { useUi } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { ID } from '@/types/domain';
import type { RemoteTaskKind } from '@/types/events';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { AgentAvatar, Btn, cx } from '@/components/ui/primitives';

const KINDS: { id: RemoteTaskKind; label: string; hint: string }[] = [
  { id: 'presentation', label: 'Presentation', hint: '.pptx deck + one-page summary' },
  { id: 'progress', label: 'Progress update', hint: 'status, risks, decisions, next steps' },
  { id: 'report', label: 'Report', hint: 'executive report' },
  { id: 'analysis', label: 'Analysis', hint: 'evidence + recommendation' },
  { id: 'build', label: 'Build / change', hint: 'code or documents in the repo' },
  { id: 'other', label: 'Other', hint: 'free-form' },
];

export function LaunchRemoteModal({ projectId: initialProject, agentIds: initialAgents, request: initialRequest }: { projectId?: ID | null; agentIds?: ID[]; request?: string }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const [projectId, setProjectId] = useState<ID | ''>(initialProject ?? '');
  const [kind, setKind] = useState<RemoteTaskKind>('presentation');
  const [request, setRequest] = useState(initialRequest ?? '');
  const [title, setTitle] = useState('');
  const project = projectId ? world.projects[projectId] : undefined;
  const rec = useMemo(() => recommendAgents(`${request} ${project?.name ?? ''}`, Object.values(world.agents), 3).agentIds, [request, project, world.agents]);
  const [team, setTeam] = useState<ID[] | null>(initialAgents?.length ? initialAgents : null);
  const members = team ?? (rec.length ? rec : project?.agentIds.slice(0, 3) ?? []);
  const ok = request.trim().length > 8;

  const launch = () => {
    if (!ok) return;
    const t = title.trim() || `${KINDS.find((k) => k.id === kind)?.label}: ${request.trim().slice(0, 60)}`;
    dispatch({ type: 'remote.launch', title: t, request: request.trim(), projectId: projectId || null, agentIds: members, kind });
    u.closeModal();
    u.showToast('Launching a real Claude Code session…');
  };

  return (
    <Modal
      title="Launch real work"
      subtitle="A Claude Code session on your repository does the work and opens a pull request."
      onClose={() => u.closeModal()}
      width={640}
      footer={
        <>
          <Btn onClick={() => u.closeModal()}>Cancel</Btn>
          <Btn variant="primary" icon="zap" disabled={!ok} onClick={launch}>LAUNCH SESSION</Btn>
        </>
      }
    >
      <div className="space-y-4 text-[12.5px]">
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {KINDS.map((k) => (
            <button key={k.id} type="button" onClick={() => setKind(k.id)} className={cx('rounded-lg border px-2.5 py-2 text-left', kind === k.id ? 'border-[var(--accent)] bg-[var(--accent)]/8' : 'border-white/10 hover:border-white/25')}>
              <div className="font-semibold text-zinc-100">{k.label}</div>
              <div className="text-[10.5px] text-zinc-500">{k.hint}</div>
            </button>
          ))}
        </div>
        <label className="block">
          <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">What should the team do?</span>
          <textarea id="remote-request" autoFocus rows={4} className="field w-full" value={request} onChange={(e) => setRequest(e.target.value)} placeholder="e.g. Prepare the monthly progress presentation of the 3D learning platform for the HR director: status, KPIs, risks and the decisions I need." />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Project</span>
            <select id="remote-project" className="field w-full" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">New operation (own structure)</option>
              {Object.values(world.projects).filter((p) => p.status !== 'archived').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Title (optional)</span>
            <input id="remote-title" className="field w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short name" />
          </label>
        </div>
        <div>
          <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Team</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(world.agents).map((a) => {
              const on = members.includes(a.id);
              return (
                <button key={a.id} type="button" onClick={() => setTeam(on ? members.filter((x) => x !== a.id) : [...members, a.id])} className={cx('flex items-center gap-1.5 rounded-md border py-1 pl-1 pr-2 text-[11px]', on ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-zinc-100' : 'border-white/10 text-zinc-400')}>
                  <AgentAvatar agent={a} size={18} /> {a.name}
                </button>
              );
            })}
          </div>
        </div>
        <p className="flex gap-2 rounded-md border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] leading-snug text-zinc-400">
          <Icon name="alert" size={14} className="mt-0.5 shrink-0 text-amber-300" />
          This starts a real Claude Code session on your account and repository (it uses your Claude usage). You can follow and answer it from its chat here or in Claude.
        </p>
      </div>
    </Modal>
  );
}
