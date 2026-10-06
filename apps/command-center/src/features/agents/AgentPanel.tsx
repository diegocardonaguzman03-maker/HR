'use client';
// Level 2 — selecting a unit in the world opens this RTS-style info panel.
import { useState } from 'react';
import { openAgentChat, focusProject } from '@/services/actions';
import { useUi } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { Agent } from '@/types/domain';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useNow } from '@/components/ui/Modal';
import { AgentAvatar, Btn, Progress, SectionTitle, SourceBadge, StatusIndicator, timeAgo } from '@/components/ui/primitives';

export function DecisionButtons({ decisionId, compact }: { decisionId: string; compact?: boolean }) {
  const d = useWorld((s) => s.world.decisions[decisionId]);
  if (!d || d.status !== 'pending') return null;
  const r = (status: 'approved' | 'rejected' | 'revision') => dispatch({ type: 'decision.resolve', decisionId, status });
  return (
    <div className="flex flex-wrap gap-1.5">
      <Btn size="sm" variant="primary" icon="thumbUp" onClick={() => r('approved')}>Approve</Btn>
      <Btn size="sm" variant="outline" icon="edit" onClick={() => r('revision')}>{compact ? 'Revise' : 'Request revision'}</Btn>
      <Btn size="sm" variant="danger" icon="thumbDown" onClick={() => r('rejected')}>Reject</Btn>
    </div>
  );
}

export function AgentPanel({ agent }: { agent: Agent }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const [more, setMore] = useState(false);
  useNow(20000);
  const task = agent.currentTask;
  const project = task?.projectId ? world.projects[task.projectId] : agent.homeProjectId in world.projects ? world.projects[agent.homeProjectId] : undefined;
  const squad = agent.squadId ? world.squads[agent.squadId] : null;
  const decision = agent.waitingFor?.decisionId ? world.decisions[agent.waitingFor.decisionId] : undefined;

  const actions: { label: string; icon: IconName; run: () => void; primary?: boolean }[] = [
    { label: 'Open chat', icon: 'chat', run: () => openAgentChat(agent.id), primary: true },
    { label: 'Assign task', icon: 'target', run: () => u.openModal({ type: 'assignTask', agentId: agent.id, projectId: project?.id }) },
    { label: 'View activity', icon: 'history', run: () => u.openAgentProfile(agent.id, 'activity') },
    { label: 'View files', icon: 'file', run: () => u.openAgentProfile(agent.id, 'files') },
    ...(project ? [{ label: 'View project', icon: 'building' as IconName, run: () => u.openWorkspace(project.id) }] : []),
    agent.state === 'paused'
      ? { label: 'Resume', icon: 'play' as IconName, run: () => dispatch({ type: 'agent.resume', agentId: agent.id }) }
      : { label: 'Pause', icon: 'pause' as IconName, run: () => dispatch({ type: 'agent.pause', agentId: agent.id }) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <AgentAvatar agent={agent} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-[0.12em] text-zinc-50">{agent.name}</h2>
            <SourceBadge source={agent.activitySource} />
          </div>
          <p className="text-xs text-zinc-400">{agent.role}</p>
          <div className="mt-1"><StatusIndicator state={agent.state} /></div>
        </div>
      </div>

      {agent.state === 'waiting' && (
        <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/8 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-300"><Icon name="bell" size={12} /> Waiting for you</div>
          <p className="text-[13px] leading-snug text-yellow-50">{agent.waitingFor?.question}</p>
          {decision && <p className="mt-1.5 text-[11px] text-yellow-100/70">Recommendation: {decision.recommendation}</p>}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Btn size="sm" variant="primary" icon="chat" onClick={() => openAgentChat(agent.id, decision?.projectId)}>Respond in chat</Btn>
            {decision && <Btn size="sm" variant="outline" icon="flag" onClick={() => u.openModal({ type: 'decision', decisionId: decision.id })}>Review decision</Btn>}
          </div>
        </div>
      )}
      {agent.state === 'blocked' && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/8 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-red-300"><Icon name="alert" size={12} /> Blocked</div>
          <p className="text-[13px] text-red-50">{agent.blockedReason}</p>
          <div className="mt-2 flex gap-1.5">
            <Btn size="sm" variant="outline" icon="chat" onClick={() => openAgentChat(agent.id)}>Help in chat</Btn>
          </div>
        </div>
      )}

      <div className="space-y-2.5 rounded-lg bg-white/[0.035] p-3">
        <Row label="Current mission">{task ? task.title : <span className="text-zinc-500">No active mission</span>}</Row>
        <Row label="Project">
          {project ? (
            <button type="button" className="text-left text-[var(--accent)] hover:underline" onClick={() => focusProject(project.id)}>{project.name}</button>
          ) : (
            'Command Citadel'
          )}
        </Row>
        {task && (
          <>
            <Row label="Started">{timeAgo(task.startedAt)}</Row>
            <div>
              <div className="mb-1 flex justify-between text-[11px]"><span className="text-zinc-500">Progress</span><span className="font-mono text-zinc-300">{task.progress}%</span></div>
              <Progress value={task.progress} />
            </div>
          </>
        )}
        {squad?.active && (
          <Row label="Squad">
            <button type="button" className="text-left text-violet-300 hover:underline" onClick={() => u.openModal({ type: 'squad', squadId: squad.id })}>
              {squad.agentIds.map((id) => world.agents[id]?.name).join(' + ')} — view squad
            </button>
          </Row>
        )}
      </div>

      <div>
        <SectionTitle>Recent activities</SectionTitle>
        <ul className="space-y-1">
          {agent.recentActivities.slice(0, 5).map((r, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-zinc-300"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-zinc-500" />{r}</li>
          ))}
        </ul>
      </div>

      {agent.taskQueue.length > 0 && (
        <div>
          <SectionTitle>Queue</SectionTitle>
          <ul className="space-y-1">
            {agent.taskQueue.slice(0, 3).map((t) => (
              <li key={t.id} className="truncate text-[12px] text-zinc-400">↳ {t.title}</li>
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
              {([
                ['user', 'Open full profile', () => u.openAgentProfile(agent.id)],
                ['move', 'Move to another project', () => u.openModal({ type: 'moveAgent', agentId: agent.id })],
                ['file', 'Create a deliverable', () => dispatch({ type: 'deliverable.create', agentId: agent.id, projectId: project?.id ?? null, title: `${project?.name ?? agent.name} — deliverable` })],
                ['users', 'Collaborate with another agent', () => u.openModal({ type: 'createConversation', agentId: agent.id, request: `Collaborate on ${project?.name ?? 'this'}`, projectId: project?.id })],
                ...(squad?.active ? [['users', 'View squad', () => u.openModal({ type: 'squad', squadId: squad.id })] as const] : []),
              ] as const).map(([icon, label, run]) => (
                <button key={label} type="button" onClick={() => { setMore(false); run(); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-zinc-200 hover:bg-white/8">
                  <Icon name={icon} size={14} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {agent.activitySource === 'simulated' && (
        <p className="text-[10.5px] leading-snug text-zinc-500">This agent’s activity is produced by the demo engine. Connect a real provider in Settings to see live work.</p>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-2 text-[12.5px]">
      <span className="text-zinc-500">{label}</span>
      <span className="min-w-0 text-zinc-100">{children}</span>
    </div>
  );
}
