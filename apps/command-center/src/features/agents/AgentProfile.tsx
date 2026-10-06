'use client';
// Level 3 — full agent profile (RTS unit card).
import { focusAgent, focusProject, openAgentChat } from '@/services/actions';
import { useUi, type AgentTab } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { Agent } from '@/types/domain';
import { ActivityEvent } from '../activity/ActivityFeed';
import { FileRow } from '../projects/FileRow';
import { AgentAvatar, Btn, Empty, IconBtn, Progress, SectionTitle, SourceBadge, StatusIndicator, Tabs, timeAgo } from '@/components/ui/primitives';

export function AgentProfile({ agent, tab }: { agent: Agent; tab: AgentTab }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const projects = Object.values(world.projects).filter((p) => p.agentIds.includes(agent.id) && p.status !== 'archived');
  const files = Object.values(world.files).filter((f) => f.agentId === agent.id).sort((a, b) => b.updatedAt - a.updatedAt);
  const convs = agent.conversationIds.map((id) => world.conversations[id]).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
  const activity = world.activity.filter((a) => a.agentId === agent.id);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-white/8 px-5 pb-3 pt-4">
        <div className="flex items-start gap-3">
          <AgentAvatar agent={agent} size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-[0.14em] text-zinc-50">{agent.name}</h2>
              <SourceBadge source={agent.activitySource} />
            </div>
            <p className="text-xs text-zinc-400">{agent.role} · {agent.specialization}</p>
            <div className="mt-1"><StatusIndicator state={agent.state} /></div>
          </div>
          <div className="flex shrink-0 gap-0.5">
            <IconBtn icon="crosshair" label="Locate on map" onClick={() => focusAgent(agent.id)} />
            <IconBtn icon="x" label="Close (Esc)" onClick={() => u.closeAgentProfile()} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Btn variant="primary" icon="chat" onClick={() => openAgentChat(agent.id)}>OPEN CHAT</Btn>
          <Btn variant="subtle" icon="target" onClick={() => u.openModal({ type: 'assignTask', agentId: agent.id })}>ASSIGN</Btn>
          <Btn variant="subtle" icon="move" onClick={() => u.openModal({ type: 'moveAgent', agentId: agent.id })}>MOVE</Btn>
          {agent.state === 'paused'
            ? <Btn variant="subtle" icon="play" onClick={() => dispatch({ type: 'agent.resume', agentId: agent.id })}>RESUME</Btn>
            : <Btn variant="subtle" icon="pause" onClick={() => dispatch({ type: 'agent.pause', agentId: agent.id })}>PAUSE</Btn>}
        </div>
      </header>
      <div className="px-3">
        <Tabs<AgentTab>
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'queue', label: 'Task queue', count: agent.taskQueue.length },
            { id: 'activity', label: 'History' },
            { id: 'files', label: 'Files', count: files.length },
            { id: 'conversations', label: 'Conversations', count: convs.length },
            { id: 'memory', label: 'Memory' },
          ]}
          value={tab}
          onChange={(t) => u.openAgentProfile(agent.id, t)}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {tab === 'overview' && (
          <div className="space-y-5">
            <p className="text-[13px] leading-relaxed text-zinc-300">{agent.description}</p>
            <div>
              <SectionTitle>Current task</SectionTitle>
              {agent.currentTask ? (
                <div className="rounded-lg bg-white/[0.035] p-3">
                  <div className="text-[13px] text-zinc-100">{agent.currentTask.title}</div>
                  <div className="mb-1.5 mt-0.5 text-[11px] text-zinc-500">Started {timeAgo(agent.currentTask.startedAt)} · {agent.currentTask.priority} priority</div>
                  <Progress value={agent.currentTask.progress} />
                </div>
              ) : <p className="text-xs text-zinc-500">No active task.</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <SectionTitle>Skills</SectionTitle>
                <div className="flex flex-wrap gap-1">{agent.skills.map((s) => <span key={s} className="rounded bg-white/6 px-1.5 py-0.5 text-[11px] text-zinc-300">{s}</span>)}</div>
              </div>
              <div>
                <SectionTitle>Tools</SectionTitle>
                <div className="flex flex-wrap gap-1">{agent.tools.length ? agent.tools.map((s) => <span key={s} className="rounded border border-white/10 px-1.5 py-0.5 text-[11px] text-zinc-400">{s}</span>) : <span className="text-xs text-zinc-500">None configured</span>}</div>
              </div>
            </div>
            <div>
              <SectionTitle>Active projects</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {projects.map((p) => <button key={p.id} type="button" onClick={() => focusProject(p.id)} className="rounded-md bg-white/5 px-2 py-1 text-[11.5px] text-zinc-200 hover:bg-white/10">{p.name}</button>)}
              </div>
            </div>
            <div>
              <SectionTitle>Collaborators</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {agent.collaborators.map((id) => world.agents[id]).filter(Boolean).map((a) => (
                  <button key={a.id} type="button" onClick={() => focusAgent(a.id)} className="flex items-center gap-1.5 rounded-md bg-white/5 py-1 pl-1 pr-2 text-[11px] text-zinc-200 hover:bg-white/10"><AgentAvatar agent={a} size={18} />{a.name}</button>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>Performance</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Missions completed', agent.performance.missionsCompleted],
                  ['Avg. cycle (h)', agent.performance.avgCycleHours],
                  ['Approval rate', `${agent.performance.approvalRate}%`],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[10px] text-zinc-500">{l}</div><div className="font-mono text-base text-zinc-100">{v}</div></div>
                ))}
              </div>
              <p className="mt-1.5 text-[10.5px] text-zinc-500">Performance figures are seed data until a real provider reports them.</p>
            </div>
          </div>
        )}
        {tab === 'queue' && (
          <div className="space-y-2">
            {agent.taskQueue.length === 0 && <Empty>Queue is empty.</Empty>}
            {agent.taskQueue.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white/[0.035] p-3 text-[12.5px]">
                <span className="font-mono text-zinc-500">{i + 1}</span>
                <span className="flex-1 text-zinc-200">{t.title}</span>
                <span className="text-[11px] text-zinc-500">{t.projectId ? world.projects[t.projectId]?.name : ''}</span>
              </div>
            ))}
            <Btn variant="outline" icon="plus" onClick={() => u.openModal({ type: 'assignTask', agentId: agent.id })}>ADD TASK</Btn>
          </div>
        )}
        {tab === 'activity' && (
          <div>
            <SectionTitle>Recent</SectionTitle>
            <ul className="mb-4 space-y-1">{agent.recentActivities.map((r, i) => <li key={i} className="text-[12px] text-zinc-300">• {r}</li>)}</ul>
            <SectionTitle>Event log</SectionTitle>
            {activity.length ? activity.map((i) => <ActivityEvent key={i.id} item={i} />) : <Empty>No logged events yet.</Empty>}
          </div>
        )}
        {tab === 'files' && <div className="space-y-2">{files.length ? files.map((f) => <FileRow key={f.id} file={f} showProject />) : <Empty>No files.</Empty>}</div>}
        {tab === 'conversations' && (
          <div className="space-y-2">
            {convs.map((c) => (
              <button key={c.id} type="button" onClick={() => u.openChat(c.id)} className="flex w-full items-center justify-between rounded-lg bg-white/[0.035] p-3 text-left text-[12.5px] hover:bg-white/[0.06]">
                <span className="text-zinc-100">{c.title}</span>
                <span className="text-[10.5px] text-zinc-500">{c.messageIds.length} msgs · {timeAgo(c.updatedAt)}</span>
              </button>
            ))}
            <Btn variant="outline" icon="plus" onClick={() => openAgentChat(agent.id)}>OPEN CHAT</Btn>
          </div>
        )}
        {tab === 'memory' && (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-500">Persistent notes this agent uses as context across conversations.</p>
            {agent.memory.length ? agent.memory.map((m, i) => <div key={i} className="rounded-lg bg-white/[0.035] px-3 py-2 text-[12.5px] text-zinc-200">{m}</div>) : <Empty>No memories yet.</Empty>}
          </div>
        )}
      </div>
    </div>
  );
}
