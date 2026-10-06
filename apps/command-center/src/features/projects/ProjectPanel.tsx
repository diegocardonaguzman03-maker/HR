'use client';
// Level 2 — clicking a structure shows the project at a glance.
import { useState } from 'react';
import { territoryName } from '@/data/territories';
import { KIND_LABEL } from '@/services/projectFactory';
import { focusAgent, openAgentChat } from '@/services/actions';
import { useUi } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { Priority, Project } from '@/types/domain';
import { Icon, type IconName } from '@/components/ui/Icon';
import { AgentAvatar, Btn, MissionStatusBadge, PriorityBadge, Progress, ProjectStatusBadge, SectionTitle } from '@/components/ui/primitives';

export function ProjectPanel({ project }: { project: Project }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const [more, setMore] = useState(false);
  const agents = project.agentIds.map((id) => world.agents[id]).filter(Boolean);
  const present = agents.filter((a) => a.currentTask?.projectId === project.id);
  const missions = project.missionIds.map((id) => world.missions[id]).filter(Boolean);
  const open = missions.filter((m) => m.status !== 'done').slice(0, 3);
  const pendingDecisions = project.decisionIds.map((id) => world.decisions[id]).filter((d) => d?.status === 'pending');
  const lead = present[0] ?? agents[0];
  const sessions = Object.values(world.remote ?? {}).filter((r) => r.projectId === project.id);

  const actions: { label: string; icon: IconName; run: () => void; primary?: boolean }[] = [
    { label: 'Open workspace', icon: 'layers', run: () => u.openWorkspace(project.id), primary: true },
    { label: 'Chat', icon: 'chat', run: () => (lead ? openAgentChat(lead.id, project.id) : u.openModal({ type: 'createConversation', projectId: project.id })) },
    { label: 'Agents', icon: 'users', run: () => u.openWorkspace(project.id, 'agents') },
    { label: 'Missions', icon: 'target', run: () => u.openWorkspace(project.id, 'missions') },
    { label: 'Files', icon: 'file', run: () => u.openWorkspace(project.id, 'files') },
    { label: 'Metrics', icon: 'activity', run: () => u.openWorkspace(project.id, 'metrics') },
  ];
  const setPriority = (priority: Priority) => dispatch({ type: 'project.set_priority', projectId: project.id, priority });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {territoryName(project.territory)} · {KIND_LABEL[project.kind]}
        </div>
        <h2 className="text-base font-bold text-zinc-50">{project.structure}</h2>
        <p className="text-xs text-zinc-400">{project.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
          <span className="text-[11px] text-zinc-500">Owner · {project.owner}</span>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-[11px]"><span className="text-zinc-500">Progress</span><span className="font-mono text-zinc-300">{project.progress}%</span></div>
        <Progress value={project.progress} tone="emerald" />
      </div>

      <p className="text-[12.5px] leading-relaxed text-zinc-300">{project.objective}</p>

      {sessions.map((r) => (
        <button key={r.id} type="button" onClick={() => u.openChat(r.conversationId)} className="flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/6 px-3 py-2 text-left text-[12px] text-emerald-50 hover:bg-emerald-400/10">
          <Icon name="link" size={14} className="text-emerald-300" />
          <span className="min-w-0 flex-1">
            <span className="block truncate">Claude Code · {r.title}</span>
            <span className="block text-[10.5px] text-emerald-200/70">{r.needsAction ? `Waiting for you: ${r.needsAction}` : r.status.replace('_', ' ')}</span>
          </span>
          <Icon name="chevronRight" size={14} />
        </button>
      ))}

      {pendingDecisions.length > 0 && (
        <button type="button" onClick={() => u.openModal({ type: 'decision', decisionId: pendingDecisions[0].id })} className="flex items-center gap-2 rounded-lg border border-yellow-400/30 bg-yellow-400/8 px-3 py-2 text-left text-[12px] text-yellow-100 hover:bg-yellow-400/12">
          <Icon name="flag" size={14} className="text-yellow-300" />
          <span className="flex-1">{pendingDecisions[0].title}</span>
          <Icon name="chevronRight" size={14} />
        </button>
      )}

      <div>
        <SectionTitle right={<span className="text-[10px] text-zinc-500">{present.length} on site</span>}>Agents</SectionTitle>
        {agents.length ? (
          <div className="flex flex-wrap gap-1.5">
            {agents.map((a) => (
              <button key={a.id} type="button" onClick={() => focusAgent(a.id)} className="flex items-center gap-1.5 rounded-md bg-white/5 py-1 pl-1 pr-2 text-[11px] text-zinc-200 hover:bg-white/10">
                <AgentAvatar agent={a} size={20} /> {a.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No agents assigned.</p>
        )}
      </div>

      {project.kpis.length > 0 && <div>
        <SectionTitle>KPIs</SectionTitle>
        <div className="grid grid-cols-2 gap-1.5">
          {project.kpis.slice(0, 4).map((k) => (
            <div key={k.label} className="rounded-md bg-white/[0.035] px-2.5 py-2">
              <div className="truncate text-[10px] text-zinc-500">{k.label}</div>
              <div className="font-mono text-sm text-zinc-100">{k.value}</div>
            </div>
          ))}
        </div>
      </div>}

      {open.length > 0 && (
        <div>
          <SectionTitle>Next missions</SectionTitle>
          <ul className="space-y-1.5">
            {open.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => u.openWorkspace(project.id, 'missions')} className="flex w-full items-center gap-2 text-left text-[12px] text-zinc-300 hover:text-white">
                  <span className="font-mono text-[10px] text-zinc-500">{m.code.replace('MISSION ', 'M')}</span>
                  <span className="flex-1 truncate">{m.title}</span>
                  <MissionStatusBadge status={m.status} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {actions.map((a) => (
          <Btn key={a.label} variant={a.primary ? 'primary' : 'subtle'} icon={a.icon} onClick={a.run} className={a.primary ? 'col-span-2' : ''}>
            {a.label.toUpperCase()}
          </Btn>
        ))}
        <div className="relative col-span-2">
          <Btn variant="outline" icon="more" className="w-full" onClick={() => setMore((v) => !v)}>MORE</Btn>
          {more && (
            <div className="glass-solid absolute bottom-10 left-0 right-0 z-10 rounded-lg p-1">
              <div className="flex items-center gap-1 px-2 py-1.5 text-[11px] text-zinc-400">
                Priority:
                {(['low', 'normal', 'high', 'critical'] as Priority[]).map((p) => (
                  <button key={p} type="button" onClick={() => setPriority(p)} className={`rounded px-1.5 py-0.5 uppercase ${project.priority === p ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/8'}`}>{p}</button>
                ))}
              </div>
              {(
                [
                project.status === 'paused'
                  ? ['play', 'Resume project', () => dispatch({ type: 'project.set_status', projectId: project.id, status: 'active' })]
                  : ['pause', 'Pause project', () => dispatch({ type: 'project.set_status', projectId: project.id, status: 'paused' })],
                ['check', 'Mark completed', () => dispatch({ type: 'project.set_status', projectId: project.id, status: 'completed' })],
                ['zap', 'Ask a team for real work (Claude Code)', () => u.openModal({ type: 'launchRemote', projectId: project.id, agentIds: project.agentIds.slice(0, 3) })],
                ['users', 'Form a squad here', () => u.openModal({ type: 'createConversation', projectId: project.id, request: `Squad for ${project.name}: ` })],
                ['archive', 'Archive project', () => { dispatch({ type: 'project.archive', projectId: project.id }); u.select(null); }],
                ] as [IconName, string, () => void][]
              ).map(([icon, label, run]) => (
                <button key={label} type="button" onClick={() => { setMore(false); run(); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-zinc-200 hover:bg-white/8">
                  <Icon name={icon} size={14} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
