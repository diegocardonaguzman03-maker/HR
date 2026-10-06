'use client';
// Level 3 — full project workspace with tabs.
import { useMemo, useRef, useState } from 'react';
import { territoryName } from '@/data/territories';
import { focusAgent, focusProject, openAgentChat } from '@/services/actions';
import { useUi, type ProjectTab } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { Priority, Project } from '@/types/domain';
import { Icon } from '@/components/ui/Icon';
import { AgentAvatar, Btn, Empty, IconBtn, PriorityBadge, Progress, ProjectStatusBadge, SectionTitle, StatusIndicator, Tabs, clock, timeAgo } from '@/components/ui/primitives';
import { ActivityEvent } from '../activity/ActivityFeed';
import { DecisionButtons } from '../agents/AgentPanel';
import { MissionCard } from '../missions/MissionCard';
import { FileRow } from './FileRow';

export function ProjectWorkspace({ project, tab }: { project: Project; tab: ProjectTab }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const missions = project.missionIds.map((id) => world.missions[id]).filter(Boolean);
  const agents = project.agentIds.map((id) => world.agents[id]).filter(Boolean);
  const files = project.fileIds.map((id) => world.files[id]).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
  const decisions = project.decisionIds.map((id) => world.decisions[id]).filter(Boolean);
  const convs = Object.values(world.conversations).filter((c) => c.projectId === project.id).sort((a, b) => b.updatedAt - a.updatedAt);
  const activity = world.activity.filter((a) => a.projectId === project.id);
  const squads = Object.values(world.squads).filter((q) => q.projectId === project.id && q.active);

  const tabs: { id: ProjectTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'missions', label: 'Missions', count: missions.length },
    { id: 'agents', label: 'Agents', count: agents.length },
    { id: 'chat', label: 'Chat', count: convs.length },
    { id: 'files', label: 'Files', count: files.length },
    { id: 'timeline', label: 'Timeline' },
    { id: 'decisions', label: 'Decisions', count: decisions.filter((d) => d.status === 'pending').length },
    { id: 'metrics', label: 'Metrics' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-white/8 px-5 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{territoryName(project.territory)} · {project.structure}</div>
            <h2 className="mt-0.5 truncate text-lg font-semibold text-zinc-50">{project.name}</h2>
          </div>
          <div className="flex shrink-0 gap-0.5">
            <IconBtn icon="crosshair" label="Show on map" onClick={() => focusProject(project.id)} />
            <IconBtn icon="x" label="Close workspace (Esc)" onClick={() => u.closeWorkspace()} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-5">
          <Meta label="Status"><ProjectStatusBadge status={project.status} /></Meta>
          <Meta label="Priority"><PriorityBadge priority={project.priority} /></Meta>
          <Meta label="Owner">{project.owner}</Meta>
          <Meta label="Agents">
            <span className="flex -space-x-1">{agents.slice(0, 6).map((a) => <AgentAvatar key={a.id} agent={a} size={18} />)}</span>
          </Meta>
          <Meta label={`Progress ${project.progress}%`}><Progress value={project.progress} tone="emerald" /></Meta>
        </div>
      </header>
      <div className="px-3">
        <Tabs tabs={tabs} value={tab} onChange={(t) => u.openWorkspace(project.id, t)} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {tab === 'overview' && (
          <div className="space-y-5">
            <div>
              <SectionTitle>Objective</SectionTitle>
              <p className="text-[13px] leading-relaxed text-zinc-200">{project.objective}</p>
              {project.description && <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-400">{project.description}</p>}
            </div>
            {project.components && (
              <div>
                <SectionTitle>Inside this structure</SectionTitle>
                <div className="flex flex-wrap gap-1.5">{project.components.map((c) => <span key={c} className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-300">{c}</span>)}</div>
              </div>
            )}
            {squads.length > 0 && (
              <div>
                <SectionTitle>Active squads</SectionTitle>
                {squads.map((q) => (
                  <button key={q.id} type="button" onClick={() => u.openModal({ type: 'squad', squadId: q.id })} className="flex w-full items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/8 px-3 py-2 text-left text-[12px] text-violet-100 hover:bg-violet-500/12">
                    <Icon name="users" size={14} /> <span className="flex-1">{q.objective}</span> <span className="text-[10px] font-semibold tracking-wider">VIEW SQUAD</span>
                  </button>
                ))}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <SectionTitle>Dependencies</SectionTitle>
                {project.dependencies.length ? project.dependencies.map((d) => world.projects[d]).filter(Boolean).map((d) => (
                  <button key={d.id} type="button" onClick={() => u.openWorkspace(d.id)} className="block text-[12px] text-[var(--accent)] hover:underline">{d.name}</button>
                )) : <p className="text-xs text-zinc-500">None</p>}
              </div>
              <div>
                <SectionTitle>Next missions</SectionTitle>
                {missions.filter((m) => m.status !== 'done').slice(0, 3).map((m) => <p key={m.id} className="truncate text-[12px] text-zinc-300">{m.code.replace('MISSION ', 'M')} · {m.title}</p>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" icon="target" onClick={() => u.openWorkspace(project.id, 'missions')}>NEW MISSION</Btn>
              <Btn variant="outline" icon="users" onClick={() => u.openModal({ type: 'createConversation', projectId: project.id, request: `Squad for ${project.name}: ` })}>FORM SQUAD</Btn>
              <Btn variant="outline" icon="sparkles" onClick={() => u.openModal({ type: 'createConversation', projectId: project.id })}>NEW CONVERSATION</Btn>
            </div>
          </div>
        )}
        {tab === 'missions' && <MissionsTab project={project} />}
        {tab === 'agents' && (
          <div className="space-y-2">
            {agents.length === 0 && <Empty>No agents assigned yet.</Empty>}
            {agents.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg bg-white/[0.035] p-3">
                <button type="button" onClick={() => focusAgent(a.id)}><AgentAvatar agent={a} size={34} /></button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="text-[13px] font-semibold tracking-wider text-zinc-100">{a.name}</span><StatusIndicator state={a.state} /></div>
                  <p className="truncate text-[11.5px] text-zinc-400">{a.currentTask ? a.currentTask.title : a.role}</p>
                </div>
                <Btn size="sm" variant="subtle" icon="chat" onClick={() => openAgentChat(a.id, project.id)}>Chat</Btn>
                <Btn size="sm" variant="ghost" icon="target" onClick={() => u.openModal({ type: 'assignTask', agentId: a.id, projectId: project.id })}>Assign</Btn>
              </div>
            ))}
            <AddAgent project={project} />
          </div>
        )}
        {tab === 'chat' && (
          <div className="space-y-2">
            {convs.length === 0 && <Empty>No conversations in this project yet.</Empty>}
            {convs.map((c) => {
              const a = world.agents[c.agentId];
              const last = world.messages[c.messageIds[c.messageIds.length - 1]];
              return (
                <button key={c.id} type="button" onClick={() => u.openChat(c.id)} className="flex w-full items-center gap-3 rounded-lg bg-white/[0.035] p-3 text-left hover:bg-white/[0.06]">
                  {a && <AgentAvatar agent={a} size={30} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[12.5px]"><span className="font-medium text-zinc-100">{c.title}</span><span className="text-[10px] text-zinc-500">{timeAgo(c.updatedAt)}</span></div>
                    <p className="truncate text-[11.5px] text-zinc-400">{last?.text ?? 'No messages'}</p>
                  </div>
                </button>
              );
            })}
            <Btn variant="outline" icon="plus" onClick={() => u.openModal({ type: 'createConversation', projectId: project.id })}>NEW CONVERSATION</Btn>
          </div>
        )}
        {tab === 'files' && <FilesTab projectId={project.id} files={files} />}
        {tab === 'timeline' && (
          <div className="space-y-4">
            <div>
              <SectionTitle>Mission timeline</SectionTitle>
              <ol className="relative ml-2 border-l border-white/10">
                {[...missions].sort((a, b) => a.deadline.localeCompare(b.deadline)).map((m) => (
                  <li key={m.id} className="mb-3 ml-4">
                    <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${m.status === 'done' ? 'bg-emerald-400' : m.status === 'active' ? 'bg-[var(--accent)]' : 'bg-zinc-600'}`} />
                    <div className="text-[10.5px] font-mono text-zinc-500">{m.deadline}</div>
                    <div className="text-[12.5px] text-zinc-200">{m.code} · {m.title}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <SectionTitle>Event history</SectionTitle>
              {world.events.filter((e) => JSON.stringify(e.payload).includes(project.id)).slice(-25).reverse().map((e) => (
                <div key={e.id} className="flex gap-2 text-[11px] text-zinc-400"><span className="font-mono text-zinc-600">{clock(e.ts)}</span><span className="font-mono text-zinc-300">{e.type}</span><span className="text-zinc-600">{e.source}</span></div>
              ))}
              {!world.events.some((e) => JSON.stringify(e.payload).includes(project.id)) && <p className="text-xs text-zinc-500">No events recorded this session.</p>}
            </div>
          </div>
        )}
        {tab === 'decisions' && (
          <div className="space-y-2">
            {decisions.length === 0 && <Empty>No decisions recorded.</Empty>}
            {decisions.map((d) => (
              <div key={d.id} className="rounded-lg bg-white/[0.035] p-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[13px] font-medium text-zinc-100">{d.title}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${d.status === 'pending' ? 'text-yellow-300' : d.status === 'approved' ? 'text-emerald-300' : 'text-zinc-400'}`}>{d.status}</span>
                </div>
                <p className="mt-1 text-[12px] text-zinc-400">{d.context}</p>
                <p className="mt-1 text-[11.5px] text-zinc-300">Recommendation: {d.recommendation}</p>
                <div className="mt-2"><DecisionButtons decisionId={d.id} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === 'metrics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {project.kpis.map((k) => (
                <div key={k.label} className="rounded-lg bg-white/[0.035] p-3">
                  <div className="text-[10.5px] text-zinc-500">{k.label}</div>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="font-mono text-lg text-zinc-50">{k.value}</span>
                    {k.trend && <span className={`text-[11px] ${k.good === false ? 'text-red-300' : k.good ? 'text-emerald-300' : 'text-zinc-400'}`}>{k.trend === 'up' ? '▲' : k.trend === 'down' ? '▼' : '■'}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <SectionTitle>Mission progress</SectionTitle>
              <div className="space-y-2">
                {missions.map((m) => (
                  <div key={m.id} className="grid grid-cols-[1fr_40px] items-center gap-2 text-[11px]">
                    <div>
                      <div className="mb-0.5 truncate text-zinc-400">{m.code.replace('MISSION ', 'M')} · {m.title}</div>
                      <Progress value={m.progress} tone={m.status === 'done' ? 'emerald' : 'amber'} />
                    </div>
                    <span className="text-right font-mono text-zinc-300">{m.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10.5px] text-zinc-500">KPI values are seed data. Connect real systems through the integration layer to make them live.</p>
          </div>
        )}
        {tab === 'activity' && (
          <div>{activity.length ? activity.map((i) => <ActivityEvent key={i.id} item={i} />) : <Empty>No activity yet.</Empty>}</div>
        )}
      </div>
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="text-zinc-200">{children}</div>
    </div>
  );
}

function MissionsTab({ project }: { project: Project }) {
  const world = useWorld((s) => s.world);
  const missions = project.missionIds.map((id) => world.missions[id]).filter(Boolean);
  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState(project.agentIds[0] ?? Object.keys(world.agents)[0]);
  const [priority, setPriority] = useState<Priority>('normal');
  const create = () => {
    if (!title.trim()) return;
    dispatch({ type: 'agent.assign_task', agentId, projectId: project.id, title: title.trim(), priority });
    setTitle('');
  };
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-white/10 p-3">
        <SectionTitle>New mission</SectionTitle>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} placeholder="Mission objective…" className="field flex-1" />
          <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="field sm:w-32">
            {Object.values(world.agents).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="field sm:w-28">
            {(['low', 'normal', 'high', 'critical'] as Priority[]).map((p) => <option key={p}>{p}</option>)}
          </select>
          <Btn variant="primary" icon="plus" onClick={create} disabled={!title.trim()}>Create</Btn>
        </div>
      </div>
      {missions.length === 0 && <Empty>No missions yet.</Empty>}
      {missions.map((m) => <MissionCard key={m.id} mission={m} />)}
    </div>
  );
}

function AddAgent({ project }: { project: Project }) {
  const agents = useWorld((s) => s.world.agents);
  const available = useMemo(() => Object.values(agents).filter((a) => !project.agentIds.includes(a.id)), [agents, project.agentIds]);
  const [id, setId] = useState('');
  if (!available.length) return null;
  return (
    <div className="flex gap-2 pt-1">
      <select value={id} onChange={(e) => setId(e.target.value)} className="field flex-1">
        <option value="">Move an agent to this project…</option>
        {available.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.role}</option>)}
      </select>
      <Btn variant="outline" icon="move" disabled={!id} onClick={() => { dispatch({ type: 'agent.move', agentId: id, projectId: project.id }); setId(''); }}>Move here</Btn>
    </div>
  );
}

function FilesTab({ projectId, files }: { projectId: string; files: ReturnType<typeof useWorld.getState>['world']['files'][string][] }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <input ref={ref} type="file" multiple hidden onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) dispatch({ type: 'file.add', projectId, files: fs.map((f) => ({ name: f.name, size: f.size })) }); e.target.value = ''; }} />
      <Btn variant="outline" icon="clip" onClick={() => ref.current?.click()}>ADD FILES</Btn>
      {files.length === 0 && <Empty>No files yet.</Empty>}
      {files.map((f) => <FileRow key={f.id} file={f} />)}
    </div>
  );
}
