// ClaudeAgentProvider — real agents inside a claude.ai artifact.
//
// • Agent work runs through the artifact runtime's `sample` capability (on the
//   viewer's own Claude account). A unit shows activity only while its call is
//   actually running; everything it produces is tagged `source: 'real'`.
// • Agents can act on the world through page tools (create/update projects,
//   assign missions, request decisions, show things on the map). Every effect
//   is an ordinary WorldEvent, visible in the activity feed.
// • The event log is persisted in the artifact's `db` (ArtifactLog), so the
//   world survives reloads and syncs across open tabs/devices.
import { withSeedClock } from '@/data/time';
import { uid } from '@/services/ids';
import { applyStructuralCommand } from '@/services/structuralCommands';
import { createEmptyState, reduce, type WorldState } from '@/services/worldState';
import type { Agent, AgentTask, ID, MessageAction, Priority, ProjectKind, ProjectStatus, TerritoryId } from '@/types/domain';
import type { Command, WorldEvent } from '@/types/events';
import type { AgentProvider, ProviderContext } from '../AgentProvider';
import { ArtifactLog } from './ArtifactLog';
import { claudeRuntime, type SampleError, type SampleFn, type SampleTool } from './runtime';

type Src = WorldEvent['source'];
type EvInput = { [K in WorldEvent['type']]: { type: K; payload: Extract<WorldEvent, { type: K }>['payload'] } }[WorldEvent['type']];

interface Job {
  kind: 'chat' | 'mission' | 'deliverable' | 'followup';
  agentId: ID;
  conversationId: ID;
  prompt: string;
  /** Recorded as Francisco's message before the agent runs (chat only). */
  userText?: string;
  title?: string;
  projectId?: ID | null;
  missionId?: ID | null;
  priority?: Priority;
}

const PERSONA: Record<string, string> = {
  aria: 'You are the orchestrator. You know every project and agent, triage what needs Francisco, and route work to the right agent with create_mission.',
  atlas: 'You write business cases, architecture options and executive recommendations.',
  forge: 'You design industrial learning: OJT, work instructions, certification and 3D training for steel and mining.',
  scout: 'You research and benchmark. Be explicit about what is known vs. what must be verified; you cannot browse the web, so say when a source needs checking.',
  talent: 'You work on recruiting, pipelines, succession and workforce planning.',
  nexus: 'You define KPIs, data models and analytics.',
  praxis: 'You build Praxia: positioning, offers and LinkedIn/thought-leadership content.',
  ledger: 'You handle budgets, cash-flow models and ROI, personal and professional.',
};

const TERRITORIES: TerritoryId[] = ['industrial', 'praxia', 'personal', 'frontier'];
const KINDS: ProjectKind[] = ['research', 'training', 'technology', 'recruiting', 'transformation', 'analytics', 'strategy', 'personal', 'praxia', 'experimental'];
const PRIORITIES: Priority[] = ['low', 'normal', 'high', 'critical'];
const STATUSES: ProjectStatus[] = ['active', 'paused', 'blocked', 'completed', 'planning'];

export class ClaudeAgentProvider implements AgentProvider {
  readonly kind = 'claude' as const;
  readonly label = 'Claude (your account)';
  private ctx: ProviderContext | null = null;
  private sample: SampleFn | null = null;
  private toolsAllowed = false;
  private log: ArtifactLog | null = null;
  private ready = false;
  private pending: Command[] = [];
  private running = new Map<ID, AbortController>();
  private queues = new Map<ID, Job[]>();
  private disabledReason: string | null = null;

  start(ctx: ProviderContext): void {
    this.ctx = ctx;
    ctx.onStatus('connecting', 'Connecting to Claude…');
    void this.init();
  }

  stop(): void {
    for (const c of this.running.values()) c.abort();
    this.running.clear();
    this.log?.close();
    this.ctx = null;
  }

  private async init() {
    const rt = claudeRuntime();
    const [sample, db] = rt ? await Promise.all([rt.use('sample'), rt.use('db')]) : [null, null];
    if (!this.ctx) return;
    this.sample = sample;
    if (sample) {
      const limits = await sample.limits().catch(() => null);
      this.toolsAllowed = !!limits?.tools && limits.tools.maxCount >= 8;
    } else this.disabledReason = 'Claude is not available in this view.';

    let state: WorldState;
    if (db) {
      this.log = new ArtifactLog(db);
      this.log.onError = (m) => this.notifyLocal('Saving problem', m);
      try {
        const { createdAt, events } = await this.log.load();
        state = withSeedClock(createdAt, createEmptyState);
        for (const e of events) state = reduce(state, e);
      } catch {
        this.log = null;
        state = createEmptyState();
      }
    } else state = createEmptyState();
    if (!this.ctx) return;
    this.ctx.reset?.(state);
    // No call survives a reload: anything that looked busy is idle now.
    for (const a of Object.values(state.agents))
      if (!['idle', 'paused', 'waiting'].includes(a.state)) this.emit({ type: 'agent.state_changed', payload: { agentId: a.id, state: 'idle', note: 'Page reloaded — no work in progress' } }, 'real');
    this.log?.subscribe((e) => this.ctx?.emit(e));

    const saved = this.log ? 'saved to this artifact' : 'not saved (storage unavailable)';
    this.ctx.onStatus('connected', `${sample ? 'Claude ready' : 'Claude unavailable'} · ${saved}`);
    this.ready = true;
    for (const c of this.pending.splice(0)) this.dispatch(c);
  }

  // ───────────────────────── plumbing ─────────────────────────

  private get s(): WorldState {
    return this.ctx!.getState();
  }

  private emit(e: EvInput, source: Src = 'real'): WorldEvent | null {
    if (!this.ctx) return null;
    const ev = { id: uid('ev'), ts: Date.now(), source, ...e } as WorldEvent;
    this.ctx.emit(ev);
    this.log?.append(ev);
    return ev;
  }

  private emitRaw = (ev: WorldEvent) => {
    if (!this.ctx) return;
    this.ctx.emit(ev);
    this.log?.append(ev);
  };

  private notifyLocal(title: string, body: string) {
    this.emit({ type: 'notification.created', payload: { notification: { id: uid('n'), kind: 'info', title, body, ts: Date.now(), read: false, priority: 'high' } } });
  }

  private system(conversationId: ID, text: string, actions?: MessageAction[]) {
    this.emit({ type: 'message.sent', payload: { message: { id: uid('msg'), conversationId, role: 'system', text, ts: Date.now(), actions } } });
  }

  private ensureConversation(conversationId: ID, agentId: ID, projectId: ID | null, title: string) {
    if (!this.s.conversations[conversationId]) this.emit({ type: 'conversation.created', payload: { conversationId, agentId, projectId, title } }, 'user');
  }

  // ───────────────────────── commands ─────────────────────────

  dispatch(cmd: Command): void {
    if (!this.ctx) return;
    if (!this.ready) {
      this.pending.push(cmd);
      return;
    }
    const before = this.s;
    const handled = applyStructuralCommand(cmd, before, this.emitRaw, (ms, fn) => void setTimeout(fn, ms));
    if (handled) {
      if (cmd.type === 'decision.resolve') this.afterDecision(cmd.decisionId, cmd.status, before);
      if (cmd.type === 'agent.pause') this.running.get(cmd.agentId)?.abort();
      if (cmd.type === 'agent.resume') this.pump(cmd.agentId);
      return;
    }
    switch (cmd.type) {
      case 'conversation.start':
        this.ensureConversation(cmd.conversationId, cmd.agentId, cmd.projectId, cmd.title ?? 'Conversation');
        if (cmd.firstMessage) this.chat(cmd.agentId, cmd.conversationId, cmd.firstMessage);
        return;
      case 'chat.send': {
        const note = cmd.attachments?.length ? `\n\n[Attached: ${cmd.attachments.map((a) => a.name).join(', ')} — file contents are not readable yet]` : '';
        if (cmd.attachments?.length) this.dispatch({ type: 'file.add', projectId: this.s.conversations[cmd.conversationId]?.projectId ?? null, files: cmd.attachments });
        this.chat(cmd.agentId, cmd.conversationId, cmd.text + note);
        return;
      }
      case 'team.start':
        this.team(cmd.conversationId, cmd.agentIds, cmd.request, cmd.projectId);
        return;
      case 'squad.form': {
        const lead = cmd.agentIds[0];
        if (!lead) return;
        const conversationId = uid('c');
        this.ensureConversation(conversationId, lead, cmd.projectId, cmd.objective.slice(0, 60));
        this.team(conversationId, cmd.agentIds, cmd.objective, cmd.projectId);
        return;
      }
      case 'agent.cancel':
        this.running.get(cmd.agentId)?.abort();
        return;
      case 'agent.assign_task':
        this.assign(cmd.agentId, cmd.projectId, cmd.title, cmd.priority);
        return;
      case 'deliverable.create': {
        const conversationId = this.missionConversation(cmd.agentId, cmd.projectId);
        this.enqueue({ kind: 'deliverable', agentId: cmd.agentId, conversationId, title: cmd.title, projectId: cmd.projectId, prompt: `Write the deliverable “${cmd.title}”. Produce the actual content (concise, structured, ready to use), not a description of it.` });
        return;
      }
      default:
        return;
    }
  }

  private missionConversation(agentId: ID, projectId: ID | null): ID {
    const id = `c-missions-${agentId}`;
    this.ensureConversation(id, agentId, projectId, `${this.s.agents[agentId]?.name ?? agentId} · missions & deliverables`);
    return id;
  }

  private chat(agentId: ID, conversationId: ID, text: string) {
    this.emit({ type: 'message.sent', payload: { message: { id: uid('msg'), conversationId, role: 'user', text, ts: Date.now() } } }, 'user');
    this.enqueue({ kind: 'chat', agentId, conversationId, prompt: text, projectId: this.s.conversations[conversationId]?.projectId ?? null });
  }

  private assign(agentId: ID, projectId: ID, title: string, priority: Priority): ID {
    const p = this.s.projects[projectId];
    const missionId = uid('m');
    this.emit({
      type: 'mission.created',
      payload: {
        mission: {
          id: missionId, projectId, code: `MISSION ${String((p?.missionIds.length ?? 0) + 1).padStart(2, '0')}`, title,
          level: priority === 'critical' ? 'critical' : 'mission', status: 'pending', agentIds: [agentId], dependsOn: [], progress: 0,
          deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), outputs: [],
        },
      },
    }, 'user');
    const conversationId = this.missionConversation(agentId, projectId);
    this.enqueue({
      kind: 'mission', agentId, conversationId, title, projectId, missionId, priority,
      prompt: `New mission for ${p?.name ?? 'the project'}: “${title}”. Do the first concrete piece of work now and deliver it (structured, concise). End with the next step you recommend.`,
    });
    return missionId;
  }

  private afterDecision(decisionId: ID, status: 'approved' | 'rejected' | 'revision', before: WorldState) {
    const waiting = Object.values(before.agents).find((a) => a.waitingFor?.decisionId === decisionId);
    if (!waiting) return;
    const d = before.decisions[decisionId];
    const conversationId = this.missionConversation(waiting.id, d?.projectId ?? null);
    this.enqueue({
      kind: 'followup', agentId: waiting.id, conversationId, projectId: d?.projectId ?? null, title: `Continue after decision: ${d?.title ?? ''}`,
      prompt: `Francisco ${status === 'revision' ? 'asked for a revision of' : status} your decision request “${d?.title}”. Continue accordingly and report what you did.`,
    });
  }

  // ───────────────────────── squads ─────────────────────────

  private async team(conversationId: ID, agentIds: ID[], request: string, projectId: ID | null) {
    const members = agentIds.filter((id) => this.s.agents[id] && this.s.agents[id].state !== 'paused');
    const lead = members[0];
    if (!lead) return;
    this.ensureConversation(conversationId, lead, projectId, request.slice(0, 60));
    this.emit({ type: 'message.sent', payload: { message: { id: uid('msg'), conversationId, role: 'user', text: request, ts: Date.now() } } }, 'user');
    if (members.length === 1) return this.enqueue({ kind: 'chat', agentId: lead, conversationId, prompt: request, projectId });
    const pid = projectId ?? this.s.agents[lead].currentTask?.projectId ?? (this.s.agents[lead].homeProjectId in this.s.projects ? this.s.agents[lead].homeProjectId : 'p-frontier');
    const squadId = uid('sq');
    this.emit({
      type: 'squad.formed',
      payload: { squad: { id: squadId, name: `Squad · ${this.s.projects[pid]?.structure ?? 'Project'}`, objective: request, projectId: pid, agentIds: members, dependencies: [], outputs: [], discussion: [], createdAt: Date.now(), active: true } },
    }, 'user');
    const contributions: string[] = [];
    for (const [i, agentId] of members.entries()) {
      if (!this.ctx) return;
      const prior = contributions.length ? `\n\nWhat your teammates said so far:\n${contributions.join('\n\n')}` : '';
      const role = i === 0 ? 'You lead this squad: frame the approach and split the work.' : i === members.length - 1 ? 'You speak last: add your part, then close with a short combined plan.' : 'Add your specialist contribution; do not repeat teammates.';
      const text = await this.runJob(
        { kind: 'chat', agentId, conversationId, projectId: pid, title: `Squad: ${request.slice(0, 50)}`, prompt: `Team request from Francisco: “${request}”. ${role}${prior}` },
        'collaborating',
      );
      if (text === null) break;
      contributions.push(`${this.s.agents[agentId]?.name}: ${text}`);
      this.emit({ type: 'squad.message', payload: { squadId, agentId, text: text.slice(0, 280) } });
    }
    if (contributions.length > 1) {
      this.emit({ type: 'file.added', payload: { file: { id: uid('f'), name: `Squad output — ${request.slice(0, 40)}.md`, kind: 'doc', projectId: pid, agentId: lead, size: `${Math.ceil(contributions.join('').length / 1024)} KB`, updatedAt: Date.now(), summary: `Combined work of ${members.map((m) => this.s.agents[m]?.name).join(', ')}.`, content: contributions.join('\n\n---\n\n') } } });
    }
    this.emit({ type: 'squad.disbanded', payload: { squadId } });
  }

  // ───────────────────────── job queue ─────────────────────────

  private enqueue(job: Job) {
    const q = this.queues.get(job.agentId) ?? [];
    q.push(job);
    this.queues.set(job.agentId, q);
    if (this.running.has(job.agentId) || this.s.agents[job.agentId]?.state === 'paused') {
      if (job.kind !== 'chat') this.emit({ type: 'agent.task_queued', payload: { agentId: job.agentId, task: this.taskOf(job) } }, 'user');
      return;
    }
    this.pump(job.agentId);
  }

  private pump(agentId: ID) {
    if (this.running.has(agentId) || this.s.agents[agentId]?.state === 'paused') return;
    const job = this.queues.get(agentId)?.shift();
    if (job) void this.runJob(job);
  }

  private taskOf(job: Job, state: AgentTask['state'] = 'working'): AgentTask {
    return {
      id: uid('t'),
      title: job.title ?? (job.kind === 'chat' ? `Replying: ${job.prompt.slice(0, 50)}` : job.prompt.slice(0, 60)),
      projectId: job.projectId ?? null,
      missionId: job.missionId ?? null,
      state: /research|benchmark|compare|investigat|find/i.test(job.prompt) ? 'researching' : state,
      progress: 0,
      startedAt: Date.now(),
      priority: job.priority ?? 'normal',
    };
  }

  /** Runs one job through Claude. Resolves with the reply text, or null on failure. */
  private async runJob(job: Job, state: AgentTask['state'] = 'working'): Promise<string | null> {
    const agent = this.s.agents[job.agentId];
    if (!agent || !this.ctx) return null;
    if (!this.sample) {
      this.system(job.conversationId, `${agent.name} can’t answer: ${this.disabledReason ?? 'Claude is unavailable.'} Switch to Demo mode in Settings to explore with simulated agents.`);
      return null;
    }
    const ctl = new AbortController();
    this.running.set(agent.id, ctl);
    const task = this.taskOf(job, state);
    this.emit({ type: 'agent.task_started', payload: { agentId: agent.id, task } });
    if (job.missionId) this.emit({ type: 'mission.status_changed', payload: { missionId: job.missionId, status: 'active', progress: 10 } });

    const actions: MessageAction[] = [];
    let waitingRequested = false;
    const tools = this.toolsAllowed ? this.tools(agent, job, actions, () => (waitingRequested = true)) : undefined;
    try {
      const { text, truncated } = await this.sample(this.input(agent, job), {
        cache: false,
        signal: ctl.signal,
        tools,
        onText: ({ text }) => this.ctx?.onStream?.(job.conversationId, agent.id, text),
      });
      this.ctx?.onStream?.(job.conversationId, agent.id, null);
      const body = truncated ? `${text}\n\n(Cut short — ask me to continue.)` : text;
      this.emit({ type: 'message.sent', payload: { message: { id: uid('msg'), conversationId: job.conversationId, role: 'agent', agentId: agent.id, text: body, ts: Date.now(), source: 'real', actions: actions.length ? actions : undefined } } });
      if (job.kind === 'mission' || job.kind === 'deliverable') {
        const name = `${(job.title ?? 'Deliverable').slice(0, 60)}.md`;
        this.emit({ type: 'file.added', payload: { file: { id: uid('f'), name, kind: 'doc', projectId: job.projectId ?? null, agentId: agent.id, size: `${Math.max(1, Math.ceil(body.length / 1024))} KB`, updatedAt: Date.now(), summary: body.slice(0, 160), content: body } } });
        this.emit({ type: 'notification.created', payload: { notification: { id: uid('n'), kind: 'document_ready', title: `${agent.name}: deliverable ready`, body: name, ts: Date.now(), read: false, priority: 'high', target: { type: 'agent', id: agent.id } } } });
      }
      if (job.missionId) {
        const m = this.s.missions[job.missionId];
        if (m) this.emit({ type: 'mission.status_changed', payload: { missionId: m.id, status: 'review', progress: Math.max(m.progress, 60) } });
      }
      if (job.projectId && this.s.projects[job.projectId] && job.kind !== 'chat') {
        const p = this.s.projects[job.projectId];
        this.emit({ type: 'project.progress_changed', payload: { projectId: p.id, progress: Math.min(100, p.progress + 3) } });
      }
      if (!waitingRequested) {
        this.emit({ type: 'agent.task_completed', payload: { agentId: agent.id, taskId: task.id, projectId: task.projectId, missionId: task.missionId, summary: task.title.charAt(0).toLowerCase() + task.title.slice(1) } });
        setTimeout(() => {
          if (this.s.agents[agent.id]?.state === 'completed' && !this.running.has(agent.id))
            this.emit({ type: 'agent.state_changed', payload: { agentId: agent.id, state: 'idle', note: 'Finished — ready for the next request' } });
        }, 2500);
      }
      return text;
    } catch (err) {
      this.ctx?.onStream?.(job.conversationId, agent.id, null);
      const e = err as SampleError;
      const kept = e.text ? `${e.text}\n\n(Interrupted.)` : null;
      if (kept && e.code !== 'refused') this.emit({ type: 'message.sent', payload: { message: { id: uid('msg'), conversationId: job.conversationId, role: 'agent', agentId: agent.id, text: kept, ts: Date.now(), source: 'real' } } });
      switch (e.code) {
        case 'cancelled':
          if (this.s.agents[agent.id]?.state !== 'paused') this.emit({ type: 'agent.state_changed', payload: { agentId: agent.id, state: 'idle', note: 'Stopped' } });
          break;
        case 'not_granted':
        case 'sampling_disabled':
        case 'not_declared':
        case 'capability_disabled':
        case 'capability_removed':
          this.sample = null;
          this.disabledReason = 'Claude access is not allowed for this page. Allow it from the artifact’s Permissions menu, then reload.';
          this.system(job.conversationId, this.disabledReason);
          this.emit({ type: 'agent.state_changed', payload: { agentId: agent.id, state: 'idle' } });
          break;
        case 'rate_limited':
          this.emit({ type: 'agent.blocked', payload: { agentId: agent.id, reason: 'Claude usage limit reached — try again later' } });
          this.system(job.conversationId, 'Claude is rate-limited right now. Try again in a little while.');
          break;
        case 'refused':
          this.system(job.conversationId, `${agent.name} declined this request. Rephrase it and try again.`);
          this.emit({ type: 'agent.state_changed', payload: { agentId: agent.id, state: 'idle' } });
          break;
        default:
          this.emit({ type: 'agent.blocked', payload: { agentId: agent.id, reason: `Claude request failed (${e.code ?? 'error'})` } });
          this.system(job.conversationId, `The request failed (${e.code ?? 'error'}). Send it again to retry.`);
      }
      return null;
    } finally {
      this.running.delete(agent.id);
      setTimeout(() => this.pump(agent.id), 50);
    }
  }

  // ───────────────────────── prompt ─────────────────────────

  private worldBrief(): string {
    const s = this.s;
    const projects = Object.values(s.projects)
      .filter((p) => p.status !== 'archived')
      .map((p) => `- ${p.id} | ${p.name} (${p.structure}) | ${p.territory} | ${p.status} | ${p.priority} | ${Math.round(p.progress)}% | agents: ${p.agentIds.join(',') || '—'}`)
      .join('\n');
    const agents = Object.values(s.agents).map((a) => `- ${a.id} | ${a.name} — ${a.role} | ${a.state}${a.currentTask ? ` | on: ${a.currentTask.title}` : ''}`).join('\n');
    const decisions = Object.values(s.decisions).filter((d) => d.status === 'pending').map((d) => `- ${d.id} | ${d.title} (asked by ${d.agentId ?? '—'})`).join('\n') || '- none';
    const missions = Object.values(s.missions).filter((m) => m.status !== 'done').slice(0, 30).map((m) => `- ${m.id} | ${m.projectId} | ${m.title} | ${m.status} ${m.progress}%`).join('\n');
    return `PROJECTS (id | name | territory | status | priority | progress | agents)\n${projects}\n\nAGENTS\n${agents}\n\nPENDING DECISIONS\n${decisions}\n\nOPEN MISSIONS\n${missions}`;
  }

  private input(agent: Agent, job: Job): { role: 'user' | 'assistant'; content: string }[] {
    const s = this.s;
    const project = job.projectId ? s.projects[job.projectId] : undefined;
    const rules = [
      `You are ${agent.name}, the ${agent.role} in Francisco's Command Center — a live operating system where projects are buildings on a map and AI agents are units.`,
      PERSONA[agent.id] ?? `Specialisation: ${agent.specialization}.`,
      agent.memory.length ? `What you remember: ${agent.memory.join('; ')}.` : '',
      project ? `Current project: ${project.name} — ${project.objective}` : '',
      'Write in the language Francisco uses. Be concise and concrete; use short headings or bullets when useful.',
      this.toolsAllowed
        ? 'You can act on the Command Center with the tools provided (create/update projects, create missions for agents, request a decision, resolve a decision, pause/resume agents, show something on the map). Use them only when Francisco asks for an action or it clearly helps; say what you changed. Never invent IDs — use the IDs listed below. To route work to another agent, use create_mission.'
        : 'You cannot change the Command Center yourself in this view; tell Francisco what to do in the UI instead.',
      'If you need Francisco to choose before you can continue, call request_decision instead of guessing.',
      `\nCURRENT STATE\n${this.worldBrief()}`,
    ].filter(Boolean).join('\n');

    const turns: { role: 'user' | 'assistant'; content: string }[] = [{ role: 'user', content: rules }];
    if (job.kind === 'chat') {
      const conv = s.conversations[job.conversationId];
      const history = (conv?.messageIds ?? []).map((id) => s.messages[id]).filter((m) => m && m.role !== 'system').slice(-24);
      for (const m of history) {
        const role = m.role === 'user' ? 'user' : 'assistant';
        const speaker = m.role === 'agent' && m.agentId && m.agentId !== agent.id ? `[${s.agents[m.agentId]?.name ?? m.agentId}] ` : '';
        turns.push({ role, content: speaker + m.text });
      }
      if (turns[turns.length - 1].role !== 'user' || job.title?.startsWith('Squad')) turns.push({ role: 'user', content: job.prompt });
    } else turns.push({ role: 'user', content: job.prompt });
    return turns;
  }

  // ───────────────────────── tools ─────────────────────────

  private tools(agent: Agent, job: Job, actions: MessageAction[], markWaiting: () => void): SampleTool[] {
    const s = () => this.s;
    const asId = (v: unknown) => String(v ?? '').trim();
    const pick = <T extends string>(v: unknown, xs: readonly T[], fallback: T): T => (xs.includes(String(v) as T) ? (String(v) as T) : fallback);
    const project = (v: unknown) => {
      const p = s().projects[asId(v)];
      if (!p) throw new Error(`Unknown project id “${asId(v)}”. Use an id from the state list.`);
      return p;
    };
    const runCmd = (cmd: Command) => applyStructuralCommand(cmd, s(), (e) => this.emitRaw({ ...e, source: 'real' }), (ms, fn) => void setTimeout(fn, ms));
    let started = 0;

    return [
      {
        name: 'create_project',
        description: 'Create a new project; a building is constructed on the map. Returns the new project id.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            objective: { type: 'string' },
            territory: { type: 'string', enum: TERRITORIES, description: 'industrial = professional work, praxia = Praxia business, personal = personal life, frontier = experiments' },
            kind: { type: 'string', enum: KINDS },
            priority: { type: 'string', enum: PRIORITIES },
            agentIds: { type: 'array', items: { type: 'string' } },
          },
          required: ['name', 'objective', 'territory'],
        },
        execute: (i) => {
          const projectId = uid('p');
          const agentIds = Array.isArray(i.agentIds) ? (i.agentIds as unknown[]).map(asId).filter((id) => s().agents[id]) : [];
          runCmd({
            type: 'project.create', projectId,
            draft: { name: String(i.name).slice(0, 80), objective: String(i.objective ?? ''), territory: pick(i.territory, TERRITORIES, 'frontier') as ProjectDraftTerritory, kind: pick(i.kind, KINDS, 'strategy'), priority: pick(i.priority, PRIORITIES, 'normal'), agentIds, autoAssign: agentIds.length === 0, files: [], context: `Created by ${agent.name}` },
          });
          if (!s().projects[projectId]) throw new Error('No free plot left in that territory.');
          actions.push({ label: `OPEN ${String(i.name).toUpperCase().slice(0, 24)}`, command: `focus:project:${projectId}` });
          return { projectId };
        },
      },
      {
        name: 'update_project',
        description: 'Change a project’s priority and/or status. Returns the updated values.',
        inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, priority: { type: 'string', enum: PRIORITIES }, status: { type: 'string', enum: STATUSES } }, required: ['projectId'] },
        execute: (i) => {
          const p = project(i.projectId);
          if (i.priority) runCmd({ type: 'project.set_priority', projectId: p.id, priority: pick(i.priority, PRIORITIES, p.priority) });
          if (i.status) runCmd({ type: 'project.set_status', projectId: p.id, status: pick(i.status, STATUSES, p.status as ProjectStatus) });
          return { projectId: p.id, priority: s().projects[p.id].priority, status: s().projects[p.id].status };
        },
      },
      {
        name: 'create_mission',
        description: 'Create a mission in a project and assign it to an agent, who starts working on it (a real Claude call) as soon as they are free. Returns the mission id. At most 2 per reply.',
        inputSchema: { type: 'object', properties: { projectId: { type: 'string' }, title: { type: 'string' }, agentId: { type: 'string' }, priority: { type: 'string', enum: PRIORITIES } }, required: ['projectId', 'title', 'agentId'] },
        execute: (i) => {
          const p = project(i.projectId);
          const target = s().agents[asId(i.agentId)];
          if (!target) throw new Error(`Unknown agent id “${asId(i.agentId)}”.`);
          if (started >= 2) throw new Error('Limit reached: at most 2 missions per reply. Tell Francisco to ask for more.');
          started++;
          const missionId = this.assign(target.id, p.id, String(i.title).slice(0, 120), pick(i.priority, PRIORITIES, 'normal'));
          actions.push({ label: `SEE ${target.name}`, command: `focus:agent:${target.id}` });
          return { missionId, agent: target.name, note: 'Queued; the agent will work on it right after this reply.' };
        },
      },
      {
        name: 'request_decision',
        description: 'Ask Francisco to decide before you continue. Creates a pending decision and puts you in “waiting for input” at the Command Citadel. Returns the decision id.',
        inputSchema: { type: 'object', properties: { title: { type: 'string' }, context: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, recommendation: { type: 'string' } }, required: ['title', 'options'] },
        execute: (i) => {
          const decisionId = uid('d');
          const title = String(i.title).slice(0, 120);
          this.emit({ type: 'decision.requested', payload: { decision: { id: decisionId, title, context: String(i.context ?? ''), projectId: job.projectId ?? null, agentId: agent.id, options: Array.isArray(i.options) ? (i.options as unknown[]).map(String).slice(0, 5) : [], recommendation: String(i.recommendation ?? ''), status: 'pending', requestedAt: Date.now() } } });
          this.emit({ type: 'agent.waiting_for_user', payload: { agentId: agent.id, projectId: job.projectId ?? null, question: title, decisionId } });
          markWaiting();
          actions.push({ label: 'REVIEW DECISION', command: `open:decision:${decisionId}` });
          return { decisionId };
        },
      },
      {
        name: 'resolve_decision',
        description: 'Record Francisco’s answer to a pending decision (only when he has clearly answered). status: approved | rejected | revision.',
        inputSchema: { type: 'object', properties: { decisionId: { type: 'string' }, status: { type: 'string', enum: ['approved', 'rejected', 'revision'] } }, required: ['decisionId', 'status'] },
        execute: (i) => {
          const d = s().decisions[asId(i.decisionId)];
          if (!d || d.status !== 'pending') throw new Error('No pending decision with that id.');
          const status = pick(i.status, ['approved', 'rejected', 'revision'] as const, 'approved');
          const before = s();
          runCmd({ type: 'decision.resolve', decisionId: d.id, status });
          if (d.agentId !== agent.id) this.afterDecision(d.id, status, before);
          return { decisionId: d.id, status };
        },
      },
      {
        name: 'set_agent_paused',
        description: 'Pause or resume an agent.',
        inputSchema: { type: 'object', properties: { agentId: { type: 'string' }, paused: { type: 'boolean' } }, required: ['agentId', 'paused'] },
        execute: (i) => {
          const a = s().agents[asId(i.agentId)];
          if (!a) throw new Error('Unknown agent id.');
          if (a.id === agent.id) throw new Error('You cannot pause yourself.');
          this.dispatch(i.paused ? { type: 'agent.pause', agentId: a.id } : { type: 'agent.resume', agentId: a.id });
          return { agentId: a.id, paused: !!i.paused };
        },
      },
      {
        name: 'show_on_map',
        description: 'Add a “take me there” button to your reply that moves Francisco’s camera to a project, an agent or a territory.',
        inputSchema: { type: 'object', properties: { type: { type: 'string', enum: ['project', 'agent', 'territory'] }, id: { type: 'string' } }, required: ['type', 'id'] },
        execute: (i) => {
          const type = pick(i.type, ['project', 'agent', 'territory'] as const, 'project');
          const id = asId(i.id);
          const label = type === 'project' ? s().projects[id]?.structure : type === 'agent' ? s().agents[id]?.name : id;
          if (!label) throw new Error('Unknown id.');
          actions.push({ label: `TAKE ME TO ${label.toUpperCase().slice(0, 28)}`, command: `focus:${type}:${id}` });
          return { ok: true };
        },
      },
      {
        name: 'add_memory',
        description: 'Remember a durable fact or preference of Francisco’s for future conversations (one short sentence).',
        inputSchema: { type: 'object', properties: { fact: { type: 'string' } }, required: ['fact'] },
        execute: (i) => {
          this.emit({ type: 'agent.memory_added', payload: { agentId: agent.id, fact: String(i.fact).slice(0, 200) } });
          return { ok: true };
        },
      },
    ];
  }
}

type ProjectDraftTerritory = Exclude<TerritoryId, 'citadel'>;
