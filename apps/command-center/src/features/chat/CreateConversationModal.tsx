'use client';
// + NEW CONVERSATION — pick an agent, or describe the request and AUTO SELECT.
import { useMemo, useState } from 'react';
import { openAgentChat } from '@/services/actions';
import { recommendAgents } from '@/services/agentRouter';
import { uid } from '@/services/ids';
import { useUi } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { ID } from '@/types/domain';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { AgentAvatar, Btn, cx, StatusIndicator } from '@/components/ui/primitives';

export function CreateConversationModal({ agentId, request: initialRequest, projectId }: { agentId?: ID; request?: string; projectId?: ID | null }) {
  const world = useWorld((s) => s.world);
  const u = useUi.getState();
  const [mode, setMode] = useState<'pick' | 'auto'>(initialRequest ? 'auto' : 'pick');
  const [request, setRequest] = useState(initialRequest ?? '');
  const [evaluated, setEvaluated] = useState(!!initialRequest);
  const [team, setTeam] = useState<ID[]>(() => (agentId ? [agentId] : []));
  const project = projectId ? world.projects[projectId] : undefined;

  const rec = useMemo(() => recommendAgents(request, Object.values(world.agents)), [request, world.agents]);
  const agents = Object.values(world.agents);

  const startSingle = (id: ID) => {
    u.closeModal();
    openAgentChat(id, projectId ?? undefined);
  };

  const startTeam = (ids: ID[]) => {
    if (!ids.length || !request.trim()) return;
    const conversationId = uid('c');
    dispatch({ type: 'team.start', conversationId, agentIds: ids, request: request.trim(), projectId: projectId ?? null });
    u.closeModal();
    u.openChat(conversationId);
  };

  const evaluate = () => {
    setEvaluated(true);
    setTeam(Array.from(new Set([...(agentId ? [agentId] : []), ...rec.agentIds])).slice(0, 4));
  };

  return (
    <Modal title="New conversation" subtitle={project ? `In ${project.name}` : 'Who do you want to work with?'} onClose={() => u.closeModal()} width={640}>
      <div className="mb-4 flex gap-1 rounded-lg bg-white/5 p-1">
        {(['pick', 'auto'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={cx('flex-1 rounded-md py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]', mode === m ? 'bg-white/10 text-zinc-100' : 'text-zinc-500')}>
            {m === 'pick' ? 'Choose agent' : 'Auto select agent'}
          </button>
        ))}
      </div>

      {mode === 'pick' && (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {agents.map((a) => (
            <button key={a.id} type="button" onClick={() => startSingle(a.id)} className="flex items-center gap-2.5 rounded-lg border border-white/8 px-3 py-2.5 text-left hover:border-[var(--accent)]/50 hover:bg-white/[0.03]">
              <AgentAvatar agent={a} size={30} />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold tracking-wider text-zinc-100">{a.name}</div>
                <div className="truncate text-[11px] text-zinc-500">{a.role}</div>
              </div>
              <StatusIndicator state={a.state} compact />
            </button>
          ))}
          <button type="button" onClick={() => setMode('auto')} className="flex items-center gap-2.5 rounded-lg border border-dashed border-[var(--accent)]/40 px-3 py-2.5 text-left text-[12.5px] text-[var(--accent)] hover:bg-[var(--accent)]/5">
            <Icon name="sparkles" size={18} /> Auto select agent
          </button>
        </div>
      )}

      {mode === 'auto' && (
        <div className="space-y-3">
          <textarea
            autoFocus
            rows={3}
            value={request}
            onChange={(e) => { setRequest(e.target.value); setEvaluated(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) evaluate(); }}
            placeholder="Describe what you want… e.g. “Benchmark the best digital OJT systems in steel companies.”"
            className="field w-full"
          />
          {!evaluated ? (
            <Btn variant="primary" icon="sparkles" disabled={request.trim().length < 4} onClick={evaluate}>Recommend agents</Btn>
          ) : (
            <div className="space-y-3">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Recommended team — tap to adjust</div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {agents.map((a) => {
                  const on = team.includes(a.id);
                  const recd = rec.agentIds.includes(a.id);
                  return (
                    <button key={a.id} type="button" onClick={() => setTeam(on ? team.filter((x) => x !== a.id) : [...team, a.id])} className={cx('flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left', on ? 'border-[var(--accent)] bg-[var(--accent)]/8' : 'border-white/8 opacity-70 hover:opacity-100')}>
                      <AgentAvatar agent={a} size={26} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-semibold text-zinc-100">{a.name}{recd && <span className="ml-1.5 text-[9.5px] font-bold text-[var(--accent)]">RECOMMENDED</span>}</div>
                        <div className="truncate text-[10.5px] text-zinc-500">{rec.reasons[a.id] ?? a.role}</div>
                      </div>
                      {on && <Icon name="check" size={14} className="text-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn variant="primary" icon="users" disabled={!team.length} onClick={() => startTeam(team)}>
                  {team.length > 1 ? `START WITH RECOMMENDED TEAM (${team.length})` : 'START CONVERSATION'}
                </Btn>
                {team.length > 1 && <Btn variant="ghost" onClick={() => startTeam([team[0]])}>Only {world.agents[team[0]]?.name}</Btn>}
              </div>
              <p className="text-[10.5px] text-zinc-500">A team becomes a temporary squad: the agents walk to the project and collaborate around it.</p>
            </div>
          )}
        </div>
      )}
      <div className="mt-4 border-t border-white/8 pt-3 text-right">
        <button type="button" onClick={() => u.openModal({ type: 'createProject' })} className="text-[11px] text-zinc-500 hover:text-zinc-200">Create a project instead →</button>
      </div>
    </Modal>
  );
}
