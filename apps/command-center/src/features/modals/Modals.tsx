'use client';
import { useState } from 'react';
import { focusAgent, focusProject, openAgentChat } from '@/services/actions';
import { uid } from '@/services/ids';
import { useUi, type Modal as ModalState } from '@/store/uiStore';
import { dispatch, useWorld } from '@/store/worldStore';
import type { ID, Priority } from '@/types/domain';
import { DEFAULT_WS_URL, inClaudeViewer } from '@/providers';
import { getStoredApiKey, storeApiKey } from '@/providers/claude/browserBackend';
import { Modal } from '@/components/ui/Modal';
import { AgentAvatar, Btn, clock, cx, Empty, SectionTitle, StatusIndicator, timeAgo } from '@/components/ui/primitives';
import { DecisionButtons } from '../agents/AgentPanel';
import { CreateConversationModal } from '../chat/CreateConversationModal';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export function ModalRoot() {
  const m = useUi((s) => s.modal);
  if (!m) return null;
  return <ModalSwitch m={m} />;
}

function ModalSwitch({ m }: { m: NonNullable<ModalState> }) {
  switch (m.type) {
    case 'createProject': return <CreateProjectModal territory={m.territory} />;
    case 'createConversation': return <CreateConversationModal agentId={m.agentId} request={m.request} projectId={m.projectId} />;
    case 'assignTask': return <AssignTaskModal agentId={m.agentId} projectId={m.projectId} />;
    case 'moveAgent': return <MoveAgentModal agentId={m.agentId} />;
    case 'createAgent': return <CreateAgentModal />;
    case 'squad': return <SquadModal squadId={m.squadId} />;
    case 'file': return <FileModal fileId={m.fileId} />;
    case 'decision': return <DecisionModal decisionId={m.decisionId} />;
    case 'settings': return <SettingsModal />;
    case 'profile': return <ProfileModal />;
  }
}

const close = () => useUi.getState().closeModal();

function AssignTaskModal({ agentId, projectId }: { agentId: ID; projectId?: ID }) {
  const world = useWorld((s) => s.world);
  const a = world.agents[agentId];
  const [title, setTitle] = useState('');
  const [pid, setPid] = useState(projectId ?? a?.currentTask?.projectId ?? Object.keys(world.projects)[0]);
  const [priority, setPriority] = useState<Priority>('normal');
  if (!a) return null;
  const submit = () => {
    if (!title.trim() || !pid) return;
    dispatch({ type: 'agent.assign_task', agentId, projectId: pid, title: title.trim(), priority });
    useUi.getState().showToast(`Mission assigned to ${a.name}`);
    close();
  };
  return (
    <Modal title={`Assign mission to ${a.name}`} subtitle={a.currentTask ? `Currently: ${a.currentTask.title}` : 'Agent is free'} onClose={close} footer={<><Btn onClick={close}>Cancel</Btn><Btn variant="primary" icon="target" disabled={!title.trim()} onClick={submit}>Assign</Btn></>}>
      <div className="space-y-3">
        <input autoFocus className="field w-full" placeholder="Mission objective…" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <div className="grid grid-cols-2 gap-2">
          <select className="field" value={pid} onChange={(e) => setPid(e.target.value)}>
            {Object.values(world.projects).filter((p) => p.status !== 'archived').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="field" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {(['low', 'normal', 'high', 'critical'] as Priority[]).map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <p className="text-[11px] text-zinc-500">If {a.name} is busy, the mission is queued; otherwise the agent heads to the project now.</p>
      </div>
    </Modal>
  );
}

function MoveAgentModal({ agentId }: { agentId: ID }) {
  const world = useWorld((s) => s.world);
  const a = world.agents[agentId];
  if (!a) return null;
  return (
    <Modal title={`Move ${a.name} to another project`} onClose={close}>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {Object.values(world.projects).filter((p) => p.status !== 'archived').map((p) => (
          <button key={p.id} type="button" onClick={() => { dispatch({ type: 'agent.move', agentId, projectId: p.id }); close(); focusAgent(agentId); }} className="rounded-lg border border-white/8 px-3 py-2 text-left hover:border-[var(--accent)]/50">
            <div className="text-[12.5px] text-zinc-100">{p.name}</div>
            <div className="text-[10.5px] text-zinc-500">{p.structure}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

const COLORS = [0x5b8def, 0xf08a24, 0x3cc8c0, 0xe86a8a, 0x9aa7ff, 0x7bc67b, 0xe7c35a, 0xc084fc, 0xf87171, 0x94a3b8];

function CreateAgentModal() {
  const world = useWorld((s) => s.world);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [color, setColor] = useState(COLORS[7]);
  const [home, setHome] = useState('citadel');
  const ok = name.trim().length >= 2 && role.trim().length >= 2;
  const submit = () => {
    if (!ok) return;
    const agentId = uid('agent');
    dispatch({ type: 'agent.create', agentId, name: name.trim(), role: role.trim(), color, homeProjectId: home, skills: skills.split(',').map((s) => s.trim()).filter(Boolean) });
    close();
    setTimeout(() => focusAgent(agentId), 100);
  };
  return (
    <Modal title="Create agent" subtitle="New agents appear at the Command Citadel and stay idle until assigned." onClose={close} footer={<><Btn onClick={close}>Cancel</Btn><Btn variant="primary" icon="bot" disabled={!ok} onClick={submit}>Create</Btn></>}>
      <div className="space-y-3">
        <input autoFocus className="field w-full" placeholder="Name (e.g. SENTINEL)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field w-full" placeholder="Role (e.g. Safety Compliance Agent)" value={role} onChange={(e) => setRole(e.target.value)} />
        <input className="field w-full" placeholder="Skills, comma separated" value={skills} onChange={(e) => setSkills(e.target.value)} />
        <select className="field w-full" value={home} onChange={(e) => setHome(e.target.value)}>
          <option value="citadel">Home: Command Citadel</option>
          {Object.values(world.projects).map((p) => <option key={p.id} value={p.id}>Home: {p.structure}</option>)}
        </select>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button key={c} type="button" aria-label="Agent colour" onClick={() => setColor(c)} className={cx('h-7 w-7 rounded-md border-2', color === c ? 'border-white' : 'border-transparent')} style={{ background: `#${c.toString(16).padStart(6, '0')}` }} />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function SquadModal({ squadId }: { squadId: ID }) {
  const world = useWorld((s) => s.world);
  const q = world.squads[squadId];
  if (!q) return null;
  const p = world.projects[q.projectId];
  const members = q.agentIds.map((id) => world.agents[id]).filter(Boolean);
  return (
    <Modal title={q.name} subtitle={q.active ? 'Active squad' : 'Disbanded'} onClose={close} width={600}>
      <div className="space-y-4">
        <div><SectionTitle>Objective</SectionTitle><p className="text-[13px] text-zinc-200">{q.objective}</p>{p && <button type="button" className="mt-1 text-[12px] text-[var(--accent)] hover:underline" onClick={() => { close(); focusProject(p.id); }}>{p.name} →</button>}</div>
        <div>
          <SectionTitle>Members & current activities</SectionTitle>
          {members.map((a) => (
            <div key={a.id} className="flex items-center gap-2.5 py-1.5">
              <AgentAvatar agent={a} size={26} />
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[12.5px] font-semibold text-zinc-100">{a.name}<StatusIndicator state={a.state} /></div><div className="truncate text-[11px] text-zinc-500">{a.currentTask?.title ?? '—'}</div></div>
              <Btn size="sm" variant="ghost" icon="chat" onClick={() => openAgentChat(a.id, q.projectId)}>Chat</Btn>
            </div>
          ))}
        </div>
        <div><SectionTitle>Dependencies</SectionTitle><p className="text-[12px] text-zinc-400">{q.dependencies.length ? q.dependencies.join(', ') : 'None'}</p></div>
        <div>
          <SectionTitle>Discussion</SectionTitle>
          {q.discussion.length ? q.discussion.map((d, i) => (
            <div key={i} className="mb-1.5 text-[12px]"><span className="font-semibold text-zinc-200">{world.agents[d.agentId]?.name}</span> <span className="text-[10px] text-zinc-600">{clock(d.ts)}</span><p className="text-zinc-400">{d.text}</p></div>
          )) : <Empty>The squad is just getting started.</Empty>}
        </div>
        <div><SectionTitle>Outputs</SectionTitle><p className="text-[12px] text-zinc-400">{q.active ? 'Delivered when the squad finishes.' : 'See the project files.'}</p></div>
      </div>
    </Modal>
  );
}

function FileModal({ fileId }: { fileId: ID }) {
  const world = useWorld((s) => s.world);
  const f = world.files[fileId];
  if (!f) return null;
  const agent = f.agentId ? world.agents[f.agentId] : undefined;
  const project = f.projectId ? world.projects[f.projectId] : undefined;
  return (
    <Modal title={f.name} subtitle={`${f.kind.toUpperCase()} · ${f.size} · updated ${timeAgo(f.updatedAt)}`} onClose={close}
      footer={<>
        {agent && <Btn variant="outline" icon="edit" onClick={() => { close(); openAgentChat(agent.id, f.projectId); setTimeout(() => dispatch({ type: 'chat.send', conversationId: useUi.getState().chat?.conversationId ?? '', agentId: agent.id, text: `Please revise “${f.name}”.` }), 50); }}>Request revision</Btn>}
        {project && <Btn variant="subtle" icon="building" onClick={() => { close(); useUi.getState().openWorkspace(project.id, 'files'); }}>Open project</Btn>}
      </>}>
      <div className="space-y-3 text-[12.5px]">
        {f.content ? (
          <>
            <div className="max-h-[50dvh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/8 bg-black/25 p-3 text-[12.5px] leading-relaxed text-zinc-200">{f.content}</div>
            <Btn
              size="sm"
              variant="outline"
              icon="file"
              onClick={(e) => {
                const btn = e.currentTarget;
                navigator.clipboard?.writeText(f.content!).then(() => (btn.textContent = 'Copied'), () => (btn.textContent = 'Select the text to copy'));
              }}
            >
              Copy text
            </Btn>
          </>
        ) : (
          <p className="text-zinc-300">{f.summary}</p>
        )}
        <div className="grid grid-cols-[90px_1fr] gap-y-1">
          <span className="text-zinc-500">Author</span><span className="text-zinc-200">{agent ? agent.name : 'Francisco'}</span>
          <span className="text-zinc-500">Project</span><span className="text-zinc-200">{project?.name ?? '—'}</span>
        </div>
        <p className="rounded-md border border-sky-400/20 bg-sky-400/5 px-3 py-2 text-[11px] text-sky-200/80">
          {f.simulated ? 'Simulated deliverable — the demo engine created the record, not real content.' : f.content ? `Written by ${agent ? agent.name : 'an agent'} with Claude.` : 'Only the file name and size are stored; previews need a storage integration (Google Drive / OneDrive).'}
        </p>
      </div>
    </Modal>
  );
}

function DecisionModal({ decisionId }: { decisionId: ID }) {
  const world = useWorld((s) => s.world);
  const d = world.decisions[decisionId];
  if (!d) return null;
  const agent = d.agentId ? world.agents[d.agentId] : undefined;
  return (
    <Modal title={d.title} subtitle={`Requested ${timeAgo(d.requestedAt)}${d.dueBy ? ` · decide by ${d.dueBy}` : ''}`} onClose={close} width={600}>
      <div className="space-y-4 text-[12.5px]">
        <p className="text-zinc-300">{d.context}</p>
        <div><SectionTitle>Options</SectionTitle><ul className="space-y-1">{d.options.map((o) => <li key={o} className="rounded-md bg-white/[0.035] px-3 py-2 text-zinc-200">{o}</li>)}</ul></div>
        <div><SectionTitle>Recommendation</SectionTitle><p className="text-zinc-200">{d.recommendation}</p></div>
        {d.status === 'pending' ? (
          <div onClick={() => setTimeout(close, 50)}><DecisionButtons decisionId={d.id} /></div>
        ) : (
          <p className="font-semibold uppercase tracking-wider text-emerald-300">{d.status}{d.decidedAt ? ` · ${timeAgo(d.decidedAt)}` : ''}</p>
        )}
        {agent && <Btn variant="ghost" icon="chat" onClick={() => { close(); openAgentChat(agent.id, d.projectId); }}>Discuss with {agent.name}</Btn>}
      </div>
    </Modal>
  );
}

function SettingsModal() {
  const conn = useWorld((s) => s.connection);
  const speed = useWorld((s) => s.speed);
  const reduced = useUi((s) => s.reducedMotion);
  const [url, setUrl] = useState(conn.wsUrl || DEFAULT_WS_URL);
  const viewer = inClaudeViewer();
  const [apiKey, setApiKey] = useState(() => getStoredApiKey() ?? '');
  const saveKey = () => {
    storeApiKey(apiKey.trim() || null);
    switchTo(apiKey.trim() ? 'claude' : 'mock');
  };
  const switchTo = (kind: 'mock' | 'real' | 'claude') => {
    useWorld.getState().switchProvider(kind, url);
    useUi.getState().showToast(kind === 'mock' ? 'Demo mode: simulated agents' : kind === 'claude' ? 'Live mode: agents run on Claude' : `Connecting to ${url}…`);
  };
  const option = (kind: 'mock' | 'real' | 'claude', title: string, body: string, on: string) => (
    <button key={kind} type="button" onClick={() => switchTo(kind)} className={cx('rounded-lg border p-3 text-left', conn.kind === kind ? on : 'border-white/10 hover:border-white/25')}>
      <div className="font-semibold text-zinc-100">{title}</div>
      <div className="text-[11px] text-zinc-400">{body}</div>
    </button>
  );
  return (
    <Modal title="Settings" onClose={close} width={560}>
      <div className="space-y-5 text-[12.5px]">
        <div>
          <SectionTitle>Agent mode</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {option(
              'claude',
              'Live — Claude',
              viewer ? 'Agents answer and act with Claude on your account. Changes are saved to this page.' : 'Agents answer and act with Claude using your Anthropic API key. Changes are saved in this browser.',
              'border-emerald-400/60 bg-emerald-400/8',
            )}
            {option('mock', 'Demo', 'Simulated activity to explore the world. Nothing is saved; clearly labelled.', 'border-sky-400/60 bg-sky-400/8')}
            {!viewer && option('real', 'Live gateway', 'Your own backend over WebSocket (npm run gateway).', 'border-emerald-400/60 bg-emerald-400/8')}
          </div>
          {!viewer && (
            <div className="mt-2 rounded-lg border border-white/10 p-3">
              <label htmlFor="api-key" className="mb-1 block text-[11px] text-zinc-400">Anthropic API key (for Live — Claude on the web)</label>
              <div className="flex gap-2">
                <input id="api-key" type="password" autoComplete="off" className="field flex-1 font-mono text-[12px]" placeholder="sk-ant-…" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <Btn variant="primary" onClick={saveKey}>{apiKey.trim() ? 'Save & go live' : 'Remove key'}</Btn>
              </div>
              <p className="mt-1.5 text-[10.5px] leading-snug text-zinc-500">Stored only in this browser and sent only to api.anthropic.com. Usage is billed to your Anthropic account. Get a key at console.anthropic.com.</p>
            </div>
          )}
          {conn.kind === 'real' && <input className="field mt-2 w-full font-mono text-[12px]" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Gateway WebSocket URL" />}
          <p className="mt-1 text-[11px] text-zinc-500">Status: <span className="text-zinc-300">{conn.status}</span>{conn.detail ? ` — ${conn.detail}` : ''}. Switching reloads the world for that mode, so simulated and real activity never mix.</p>
        </div>
        {conn.kind === 'mock' && (
          <div>
            <SectionTitle>Simulation speed</SectionTitle>
            <div className="flex gap-1.5">
              {[0.5, 1, 2, 4].map((x) => (
                <button key={x} type="button" onClick={() => useWorld.getState().setSpeed(x)} className={cx('rounded-md border px-3 py-1.5', speed === x ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-white/10 text-zinc-400')}>{x}×</button>
              ))}
            </div>
          </div>
        )}
        <div>
          <SectionTitle>Accessibility & performance</SectionTitle>
          <label className="flex items-center gap-2 text-zinc-200">
            <input type="checkbox" checked={reduced} onChange={(e) => useUi.getState().setReducedMotion(e.target.checked)} className="accent-[var(--accent)]" />
            Reduce motion (no smoke, pulses or bobbing)
          </label>
        </div>
        <div>
          <SectionTitle>Keyboard</SectionTitle>
          <ul className="grid grid-cols-2 gap-1 text-[11.5px] text-zinc-400">
            <li><kbd className="kbd">⌘/Ctrl K</kbd> command palette</li>
            <li><kbd className="kbd">Esc</kbd> back one level</li>
            <li><kbd className="kbd">1–7</kbd> command bar</li>
            <li><kbd className="kbd">H</kbd> Command Center</li>
            <li><kbd className="kbd">N</kbd> new conversation</li>
            <li><kbd className="kbd">P</kbd> new project</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function ProfileModal() {
  const world = useWorld((s) => s.world);
  const done = world.activity.filter((a) => a.completed).length;
  return (
    <Modal title="Francisco" subtitle="Owner of this command center" onClose={close}>
      <div className="space-y-3 text-[12.5px]">
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Projects', Object.values(world.projects).filter((p) => p.status !== 'archived').length],
            ['Agents', Object.keys(world.agents).length],
            ['Completed (log)', done],
          ].map(([l, v]) => <div key={l} className="rounded-lg bg-white/[0.035] p-3"><div className="text-[10.5px] text-zinc-500">{l}</div><div className="font-mono text-lg text-zinc-100">{v}</div></div>)}
        </div>
        <p className="text-[11.5px] text-zinc-500">No authentication in the MVP. Add an auth provider before exposing the gateway beyond your machine.</p>
      </div>
    </Modal>
  );
}
