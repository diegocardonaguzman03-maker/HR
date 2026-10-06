// MockAgentProvider — in-browser simulation of a multi-agent backend.
//
// It plays the same role as a real backend: receives Commands, emits WorldEvents.
// Every event it produces for agent work is tagged `source: 'simulated'` so the
// UI can label it. Replace it with RealAgentProvider without touching the UI.
import { CITADEL_ID } from '@/data/agents';
import { recommendAgents } from '@/services/agentRouter';
import { uid } from '@/services/ids';
import { buildProject } from '@/services/projectFactory';
import type { WorldState } from '@/services/worldState';
import type {
  Agent,
  AgentTask,
  AppNotification,
  Decision,
  FileDoc,
  ID,
  Message,
  MessageAction,
  Priority,
  Squad,
} from '@/types/domain';
import type { Command, WorldEvent } from '@/types/events';
import type { AgentProvider, ProviderContext } from '../AgentProvider';
import { BLOCKERS, FINDINGS, TASK_LIBRARY, type TaskTemplate } from './library';

type Src = WorldEvent['source'];
type EvInput = { [K in WorldEvent['type']]: { type: K; payload: Extract<WorldEvent, { type: K }>['payload'] } }[WorldEvent['type']];

const TICK_MS = 2500;

export class MockAgentProvider implements AgentProvider {
  readonly kind = 'mock' as const;
  readonly label = 'Demo engine (simulated activity)';
  private ctx: ProviderContext | null = null;
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private interval: ReturnType<typeof setInterval> | null = null;
  private speed = 1;
  private libraryCursor: Record<string, number> = {};
  /** Tasks interrupted by squads, restored when the squad disbands. */
  private suspended: Record<ID, AgentTask | null> = {};
  /** Random events wait until the scripted opening has played out. */
  private quietUntil = 0;

  start(ctx: ProviderContext): void {
    this.ctx = ctx;
    ctx.onStatus('simulated', 'Mock engine running in the browser');
    this.interval = setInterval(() => this.tick(), TICK_MS);
    this.quietUntil = Date.now() + 70_000;
    this.scriptOpening();
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    for (const t of this.timers) clearTimeout(t);
    this.timers.clear();
    this.ctx = null;
  }

  setSpeed(multiplier: number): void {
    this.speed = Math.max(0.25, Math.min(4, multiplier));
  }

  // ───────────────────────── plumbing ─────────────────────────

  private get s(): WorldState {
    return this.ctx!.getState();
  }

  private emit(e: EvInput, source: Src = 'simulated'): void {
    if (!this.ctx) return;
    this.ctx.emit({ id: uid('ev'), ts: Date.now(), source, ...e } as WorldEvent);
  }

  private later(ms: number, fn: () => void): void {
    const t = setTimeout(() => {
      this.timers.delete(t);
      if (this.ctx) fn();
    }, ms / this.speed);
    this.timers.add(t);
  }

  private agent(id: ID): Agent | undefined {
    return this.s.agents[id];
  }

  private notify(n: Omit<AppNotification, 'id' | 'ts' | 'read'>): void {
    this.emit({ type: 'notification.created', payload: { notification: { id: uid('n'), ts: Date.now(), read: false, ...n } } });
  }

  private makeTask(t: Pick<TaskTemplate, 'title' | 'projectId' | 'state' | 'missionId'>, priority: Priority = 'normal', progress = 0): AgentTask {
    return {
      id: uid('t'),
      title: t.title,
      projectId: t.projectId === CITADEL_ID ? null : t.projectId,
      missionId: t.missionId ?? null,
      state: t.state,
      progress,
      startedAt: Date.now(),
      priority,
    };
  }

  private startTask(agentId: ID, task: AgentTask, source: Src = 'simulated'): void {
    this.emit({ type: 'agent.task_started', payload: { agentId, task } }, source);
  }

  // ───────────────────────── demo script ─────────────────────────

  /** The opening scenario from the product brief, then the random tick takes over. */
  private scriptOpening(): void {
    // NEXUS finishes its audience analytics shortly after load.
    this.later(9000, () => this.complete('nexus'));
    // TALENT hits a blocker (warning icon over the unit).
    this.later(17000, () => this.block('talent', BLOCKERS[0], 38000));
    // FORGE joins SCOUT at the Digital Twin Lab once SCOUT has arrived.
    this.later(40000, () => this.formSquad('p-3d', 'Translate OJT benchmark into 3D scene requirements', ['scout', 'forge'], 45000));
    // PRAXIS asks for a review of the LinkedIn drafts.
    this.later(58000, () => {
      const a = this.agent('praxis');
      if (!a || a.state === 'paused') return;
      this.emit({ type: 'agent.waiting_for_user', payload: { agentId: 'praxis', projectId: 'p-content', question: '3 LinkedIn drafts are ready. Publish, or request changes?', decisionId: 'd-posts' } });
    });
  }

  // ───────────────────────── simulation loop ─────────────────────────

  private tick(): void {
    const agents = Object.values(this.s.agents);
    for (const a of agents) {
      if (a.activitySource !== 'simulated' || !a.currentTask) continue;
      if (!['working', 'researching', 'reviewing', 'collaborating'].includes(a.state)) continue;
      if (a.squadId) continue; // squads are driven by their own timer
      const pf = a.currentTask.priority === 'critical' ? 1.6 : a.currentTask.priority === 'high' ? 1.3 : 1;
      const next = Math.min(100, a.currentTask.progress + Math.round((1 + Math.random() * 3) * pf * this.speed));
      if (next >= 100) this.complete(a.id);
      else this.emit({ type: 'agent.task_progress', payload: { agentId: a.id, progress: next } });
    }

    const busy = agents.filter((a) => a.activitySource === 'simulated' && a.currentTask && ['working', 'researching', 'reviewing'].includes(a.state) && !a.squadId);
    const r = Date.now() < this.quietUntil ? 1 : Math.random();
    const blocked = agents.filter((a) => a.state === 'blocked').length;
    const waiting = agents.filter((a) => a.state === 'waiting').length;
    if (r < 0.025 && blocked === 0 && busy.length) {
      const a = pick(busy);
      this.block(a.id, pick(BLOCKERS), 30000);
    } else if (r < 0.045 && waiting < 2 && busy.length) {
      const a = pick(busy);
      this.requestDecision(a);
    } else if (r < 0.065 && busy.length >= 2) {
      const [x, y] = shuffle(busy).slice(0, 2);
      const pid = x.currentTask?.projectId;
      if (pid) this.formSquad(pid, `Joint review: ${x.currentTask!.title}`, [x.id, y.id], 35000);
    } else if (r < 0.1 && busy.length) {
      const a = pick(busy.filter((b) => b.state === 'researching').concat(busy));
      const f = pick(FINDINGS[a.id] ?? ['New information found']);
      this.notify({ kind: 'info', title: `${a.name} found new information`, body: f, priority: 'low', target: { type: 'agent', id: a.id } });
    }
  }

  private complete(agentId: ID): void {
    const a = this.agent(agentId);
    if (!a?.currentTask || a.state === 'paused') return;
    const task = a.currentTask;
    const template = (TASK_LIBRARY[agentId] ?? []).find((t) => t.title === task.title);
    this.emit({ type: 'agent.task_completed', payload: { agentId, taskId: task.id, projectId: task.projectId, missionId: task.missionId, summary: lowerFirst(task.title) } });

    if (task.projectId) {
      const p = this.s.projects[task.projectId];
      if (p && p.status !== 'archived') this.emit({ type: 'project.progress_changed', payload: { projectId: p.id, progress: Math.min(100, p.progress + 1 + Math.round(Math.random() * 3)) } });
    }
    if (task.missionId) {
      const m = this.s.missions[task.missionId];
      if (m && m.status !== 'done') {
        const progress = Math.min(100, m.progress + 15 + Math.round(Math.random() * 15));
        this.emit({ type: 'mission.status_changed', payload: { missionId: m.id, status: progress >= 100 ? 'done' : m.status === 'pending' ? 'active' : m.status, progress } });
      }
    }
    const output = template?.output ?? (Math.random() < 0.35 ? `${task.title}.doc` : null);
    if (output) {
      const file = this.deliverable(agentId, task.projectId, output);
      this.notify({ kind: 'document_ready', title: `${a.name}: deliverable ready`, body: file.name, priority: 'low', target: { type: 'agent', id: agentId } });
    } else {
      this.notify({ kind: 'mission_completed', title: `${a.name} completed a task`, body: task.title, priority: 'low', target: { type: 'agent', id: agentId } });
    }
    this.later(4500, () => this.next(agentId));
  }

  private next(agentId: ID): void {
    const a = this.agent(agentId);
    if (!a || a.state === 'paused' || a.state === 'waiting' || a.state === 'blocked') return;
    if (a.currentTask && a.state !== 'completed') return;
    const suspended = this.suspended[agentId];
    if (suspended) {
      delete this.suspended[agentId];
      this.startTask(agentId, { ...suspended, startedAt: suspended.startedAt });
      return;
    }
    if (a.taskQueue.length) {
      this.startTask(agentId, { ...a.taskQueue[0], startedAt: Date.now(), progress: 0 });
      return;
    }
    const lib = TASK_LIBRARY[agentId] ?? [];
    if (!lib.length || a.activitySource !== 'simulated') {
      this.emit({ type: 'agent.state_changed', payload: { agentId, state: 'idle', note: 'Returned home — no queued work' } });
      return;
    }
    const i = (this.libraryCursor[agentId] ?? -1) + 1;
    this.libraryCursor[agentId] = i % lib.length;
    const tpl = lib[i % lib.length];
    if (this.s.projects[tpl.projectId]?.status === 'archived') return this.later(3000, () => this.next(agentId));
    this.startTask(agentId, this.makeTask(tpl));
  }

  private block(agentId: ID, reason: string, autoClearMs: number): void {
    const a = this.agent(agentId);
    if (!a || !a.currentTask || a.state === 'paused' || a.state === 'waiting') return;
    this.emit({ type: 'agent.blocked', payload: { agentId, reason } });
    if (a.currentTask.projectId) this.notify({ kind: 'project_blocked', title: `${a.name} is blocked`, body: reason, priority: 'high', target: { type: 'agent', id: agentId } });
    this.later(autoClearMs, () => {
      const b = this.agent(agentId);
      if (b?.state === 'blocked' && b.currentTask) this.emit({ type: 'agent.state_changed', payload: { agentId, state: b.currentTask.state, note: 'Unblocked — resumed work' } });
    });
  }

  private requestDecision(a: Agent): void {
    const task = a.currentTask!;
    const decision: Decision = {
      id: uid('d'),
      title: `Approve next step: ${task.title}`,
      context: `${a.name} reached a checkpoint and needs direction before continuing.`,
      projectId: task.projectId,
      agentId: a.id,
      options: ['Approve and continue', 'Request revision', 'Stop this task'],
      recommendation: 'Approve and continue',
      status: 'pending',
      requestedAt: Date.now(),
    };
    this.emit({ type: 'decision.requested', payload: { decision } });
    this.emit({ type: 'agent.waiting_for_user', payload: { agentId: a.id, projectId: task.projectId, question: `Checkpoint on “${task.title}”: approve to continue?`, decisionId: decision.id } });
    this.notify({ kind: 'input_needed', title: `${a.name} needs your input`, body: decision.title, priority: 'high', target: { type: 'agent', id: a.id } });
  }

  private formSquad(projectId: ID, objective: string, agentIds: ID[], durationMs: number, source: Src = 'simulated'): Squad | null {
    const members = agentIds.map((id) => this.agent(id)).filter((a): a is Agent => !!a && a.state !== 'paused' && a.state !== 'waiting' && !a.squadId);
    if (members.length < 2) return null;
    const squad: Squad = {
      id: uid('sq'),
      name: `Squad · ${this.s.projects[projectId]?.structure ?? 'Project'}`,
      objective,
      projectId,
      agentIds: members.map((m) => m.id),
      dependencies: this.s.projects[projectId]?.dependencies.map((d) => this.s.projects[d]?.name ?? d) ?? [],
      outputs: [],
      discussion: [],
      createdAt: Date.now(),
      active: true,
    };
    for (const m of members) {
      if (m.currentTask && m.currentTask.projectId !== projectId) this.suspended[m.id] = m.currentTask;
    }
    this.emit({ type: 'squad.formed', payload: { squad } }, source);
    for (const m of members) {
      this.startTask(m.id, this.makeTask({ title: objective, projectId, state: 'collaborating' }, 'high', 10));
    }
    const lines = members.map((m) => pick(FINDINGS[m.id] ?? ['Reviewing inputs']));
    members.forEach((m, i) => this.later(4000 + i * 3500, () => this.emit({ type: 'squad.message', payload: { squadId: squad.id, agentId: m.id, text: lines[i] } })));
    this.later(durationMs, () => {
      const q = this.s.squads[squad.id];
      if (!q?.active) return;
      const out = this.deliverable(members[0].id, projectId, `${objective.slice(0, 48)} — squad output.doc`);
      this.emit({ type: 'squad.disbanded', payload: { squadId: squad.id } });
      this.notify({ kind: 'document_ready', title: 'Squad delivered an output', body: out.name, priority: 'low', target: { type: 'project', id: projectId } });
      for (const m of members) {
        const cur = this.agent(m.id);
        if (cur?.currentTask?.title === objective && cur.state !== 'paused') {
          this.emit({ type: 'agent.task_completed', payload: { agentId: m.id, taskId: cur.currentTask.id, projectId, summary: lowerFirst(objective) } });
          this.later(3500, () => this.next(m.id));
        }
      }
    });
    return squad;
  }

  private deliverable(agentId: ID, projectId: ID | null, name: string, source: Src = 'simulated'): FileDoc {
    const ext = name.split('.').pop() ?? 'doc';
    const kind = (['pdf', 'doc', 'sheet', 'deck', 'model', 'note'].includes(ext) ? ext : 'doc') as FileDoc['kind'];
    const file: FileDoc = {
      id: uid('f'),
      name,
      kind,
      projectId,
      agentId,
      size: `${(50 + Math.random() * 900).toFixed(0)} KB`,
      updatedAt: Date.now(),
      summary: 'Simulated deliverable generated by the demo engine (no real content).',
      simulated: true,
    };
    this.emit({ type: 'file.added', payload: { file } }, source);
    return file;
  }

  // ───────────────────────── commands ─────────────────────────

  dispatch(cmd: Command): void {
    if (!this.ctx) return;
    switch (cmd.type) {
      case 'chat.send':
        return this.onChat(cmd.conversationId, cmd.agentId, cmd.text, cmd.attachments ?? []);
      case 'conversation.start': {
        this.emit({ type: 'conversation.created', payload: { conversationId: cmd.conversationId, agentId: cmd.agentId, projectId: cmd.projectId, title: cmd.title ?? 'New conversation' } }, 'user');
        const a = this.agent(cmd.agentId);
        if (cmd.firstMessage) this.onChat(cmd.conversationId, cmd.agentId, cmd.firstMessage, []);
        else if (a) this.reply(cmd.conversationId, a, `Hi Francisco — ${a.name} here (${a.role}). ${a.currentTask ? `I'm currently on “${a.currentTask.title}”.` : 'I have no active mission right now.'} What do you need?`);
        return;
      }
      case 'team.start': {
        const [lead, ...rest] = cmd.agentIds;
        if (!lead) return;
        const pid = cmd.projectId ?? this.agent(lead)?.currentTask?.projectId ?? this.agent(lead)?.homeProjectId ?? null;
        this.emit({ type: 'conversation.created', payload: { conversationId: cmd.conversationId, agentId: lead, projectId: pid === CITADEL_ID ? null : pid, title: cmd.request.slice(0, 60) } }, 'user');
        this.emit({ type: 'message.sent', payload: { message: this.userMsg(cmd.conversationId, cmd.request) } }, 'user');
        const projectId = pid && pid !== CITADEL_ID ? pid : 'p-frontier';
        if (rest.length) {
          this.formSquad(projectId, cmd.request.slice(0, 80), cmd.agentIds, 60000);
          const names = cmd.agentIds.map((id) => this.agent(id)?.name).join(', ');
          this.reply(cmd.conversationId, this.agent(lead)!, `Team assembled: ${names}. We're gathering at ${this.s.projects[projectId]?.structure ?? 'the project'} to work on: “${cmd.request}”. I'll report back here.`, [
            { label: 'VIEW SQUAD', command: `focus:project:${projectId}` },
          ]);
        } else {
          this.queueOrStart(lead, cmd.request, projectId, 'normal', cmd.conversationId);
        }
        return;
      }
      case 'agent.assign_task': {
        const missionId = uid('m');
        const p = this.s.projects[cmd.projectId];
        this.emit({
          type: 'mission.created',
          payload: {
            mission: {
              id: missionId,
              projectId: cmd.projectId,
              code: `MISSION ${String((p?.missionIds.length ?? 0) + 1).padStart(2, '0')}`,
              title: cmd.title,
              level: cmd.priority === 'critical' ? 'critical' : 'mission',
              status: 'pending',
              agentIds: [cmd.agentId],
              dependsOn: [],
              progress: 0,
              deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              outputs: [],
            },
          },
        }, 'user');
        this.queueOrStart(cmd.agentId, cmd.title, cmd.projectId, cmd.priority, undefined, missionId);
        return;
      }
      case 'agent.pause':
        this.emit({ type: 'agent.paused', payload: { agentId: cmd.agentId } }, 'user');
        return;
      case 'agent.resume': {
        this.emit({ type: 'agent.resumed', payload: { agentId: cmd.agentId } }, 'user');
        const a = this.agent(cmd.agentId);
        if (a && (a.state === 'completed' || (a.state === 'idle' && a.taskQueue.length))) this.later(1000, () => this.next(cmd.agentId));
        return;
      }
      case 'agent.move': {
        const p = this.s.projects[cmd.projectId];
        if (!p) return;
        this.emit({ type: 'agent.assigned', payload: { agentId: cmd.agentId, projectId: cmd.projectId } }, 'user');
        const a = this.agent(cmd.agentId);
        if (a?.currentTask && a.currentTask.projectId !== cmd.projectId) this.emit({ type: 'agent.task_queued', payload: { agentId: a.id, task: { ...a.currentTask } } });
        this.startTask(cmd.agentId, this.makeTask({ title: `Support ${p.name}`, projectId: p.id, state: 'working' }, p.priority), 'user');
        return;
      }
      case 'agent.create': {
        const s = this.s;
        const home = s.projects[cmd.homeProjectId];
        const agent: Agent = {
          id: cmd.agentId,
          name: cmd.name.toUpperCase(),
          role: cmd.role,
          specialization: cmd.role,
          description: `Custom agent created by Francisco.`,
          color: cmd.color,
          look: 'plain',
          skills: cmd.skills,
          tools: [],
          homeProjectId: home ? home.id : CITADEL_ID,
          territory: home ? home.territory : 'citadel',
          state: 'idle',
          currentTask: null,
          taskQueue: [],
          conversationIds: [],
          collaborators: [],
          memory: [],
          recentActivities: ['Created'],
          activitySource: null,
          position: [34.5, 32.5],
          lastActivityAt: Date.now(),
          performance: { missionsCompleted: 0, avgCycleHours: 0, approvalRate: 0 },
          squadId: null,
          waitingFor: null,
          blockedReason: null,
        };
        this.emit({ type: 'agent.created', payload: { agent } }, 'user');
        return;
      }
      case 'project.create':
        return this.createProject(cmd.projectId, cmd.draft);
      case 'project.archive': {
        this.emit({ type: 'project.status_changed', payload: { projectId: cmd.projectId, status: 'archived' } }, 'user');
        for (const a of Object.values(this.s.agents))
          if (a.currentTask?.projectId === cmd.projectId) this.emit({ type: 'agent.state_changed', payload: { agentId: a.id, state: 'idle', note: 'Project archived — returned home' } });
        return;
      }
      case 'project.set_priority':
        this.emit({ type: 'project.priority_changed', payload: { projectId: cmd.projectId, priority: cmd.priority } }, 'user');
        return;
      case 'project.set_status':
        this.emit({ type: 'project.status_changed', payload: { projectId: cmd.projectId, status: cmd.status } }, 'user');
        return;
      case 'decision.resolve':
        return this.resolveDecision(cmd.decisionId, cmd.status, cmd.note);
      case 'squad.form':
        this.formSquad(cmd.projectId, cmd.objective, cmd.agentIds, 60000, 'user');
        return;
      case 'file.add':
        for (const f of cmd.files)
          this.emit({
            type: 'file.added',
            payload: { file: { id: uid('f'), name: f.name, kind: kindFromName(f.name), projectId: cmd.projectId, agentId: null, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, updatedAt: Date.now(), summary: 'Uploaded by Francisco (metadata only in the demo — content stays on your device).' } },
          }, 'user');
        return;
      case 'deliverable.create': {
        const a = this.agent(cmd.agentId);
        if (!a) return;
        this.later(2500, () => {
          const f = this.deliverable(cmd.agentId, cmd.projectId, `${cmd.title}.doc`);
          this.notify({ kind: 'document_ready', title: `${a.name}: deliverable ready`, body: f.name, priority: 'high', target: { type: 'agent', id: a.id } });
        });
        return;
      }
    }
  }

  private queueOrStart(agentId: ID, title: string, projectId: ID, priority: Priority, conversationId?: ID, missionId?: ID): void {
    const a = this.agent(agentId);
    if (!a) return;
    const p = this.s.projects[projectId];
    const state: AgentTask['state'] = /research|benchmark|find|compare|explore|scan/i.test(title) ? 'researching' : /review|check|audit/i.test(title) ? 'reviewing' : 'working';
    const task = this.makeTask({ title, projectId, state, missionId }, priority);
    const free = !a.currentTask || a.state === 'idle' || a.state === 'completed';
    if (free && a.state !== 'paused') this.startTask(agentId, task);
    else this.emit({ type: 'agent.task_queued', payload: { agentId, task } });
    if (conversationId)
      this.reply(
        conversationId,
        a,
        free
          ? `On it. Heading to ${p?.structure ?? 'the project'} to start “${title}”. I'll post updates here.`
          : `Understood. “${title}” is queued after my current mission (“${a.currentTask?.title}”). Say “change priority” to move it up.`,
      );
  }

  private createProject(projectId: ID, draft: Parameters<typeof buildProject>[1]): void {
    const project = buildProject(this.s, draft, projectId, Date.now());
    if (!project) {
      this.notify({ kind: 'info', title: 'No free plot', body: `No room left in ${draft.territory}. Archive a project or pick another territory.`, priority: 'high' });
      return;
    }
    this.emit({ type: 'project.created', payload: { project } }, 'user');
    const missionId = uid('m');
    this.emit({
      type: 'mission.created',
      payload: {
        mission: {
          id: missionId,
          projectId,
          code: 'MISSION 01',
          title: 'Kick-off: scope, stakeholders and first deliverable',
          level: 'mission',
          status: 'pending',
          agentIds: project.agentIds,
          dependsOn: [],
          progress: 0,
          deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          outputs: [],
        },
      },
    }, 'user');
    for (const f of draft.files)
      this.emit({
        type: 'file.added',
        payload: { file: { id: uid('f'), name: f.name, kind: kindFromName(f.name), projectId, agentId: null, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, updatedAt: Date.now(), summary: 'Context file added at project launch (metadata only in the demo).' } },
      }, 'user');
    this.later(3500, () => this.emit({ type: 'project.construction_finished', payload: { projectId } }, 'user'));
    project.agentIds.forEach((aid, i) =>
      this.later(1200 + i * 900, () => this.queueOrStart(aid, i === 0 ? `Kick-off: ${project.name}` : `Support kick-off: ${project.name}`, projectId, draft.priority, undefined, missionId)),
    );
    this.notify({ kind: 'info', title: 'Project launched', body: `${project.structure} is being built in ${draft.territory}.`, priority: 'low', target: { type: 'project', id: projectId } });
  }

  private resolveDecision(decisionId: ID, status: 'approved' | 'rejected' | 'revision', note?: string): void {
    const d = this.s.decisions[decisionId];
    if (!d || d.status !== 'pending') return;
    this.emit({ type: 'decision.made', payload: { decisionId, status, note } }, 'user');
    const a = Object.values(this.s.agents).find((x) => x.waitingFor?.decisionId === decisionId) ?? (d.agentId ? this.agent(d.agentId) : undefined);
    if (!a || a.state !== 'waiting') return;
    this.afterDecision(a, d, status);
  }

  /** The "Francisco responds → agent goes back to work" moment. */
  private afterDecision(a: Agent, d: Decision | undefined, status: 'approved' | 'rejected' | 'revision'): void {
    const projectId = d?.projectId ?? a.currentTask?.projectId ?? null;
    if (status === 'rejected') {
      this.emit({ type: 'agent.state_changed', payload: { agentId: a.id, state: 'idle', note: 'Task stopped after rejection' } });
      return;
    }
    const title = status === 'revision' ? `Revise: ${d?.title ?? a.currentTask?.title ?? 'deliverable'}` : `Execute approved: ${d?.title.replace(/^Approve( the)? /i, '') ?? a.currentTask?.title ?? 'next step'}`;
    this.startTask(a.id, this.makeTask({ title, projectId: projectId ?? CITADEL_ID, state: 'working' }, 'high', 10));
    if (a.currentTask?.missionId && status === 'approved') {
      this.emit({ type: 'mission.status_changed', payload: { missionId: a.currentTask.missionId, status: 'done', progress: 100 } });
    }
    if (projectId) {
      const p = this.s.projects[projectId];
      if (p) this.emit({ type: 'project.progress_changed', payload: { projectId, progress: p.progress + 4 } });
    }
    // Hand-off: a second agent joins the same structure a few seconds later.
    if (d?.id === 'd-3d-arch' && status === 'approved') {
      this.later(5000, () => {
        const forge = this.agent('forge');
        if (!forge || forge.state === 'paused') return;
        if (forge.squadId) this.emit({ type: 'squad.disbanded', payload: { squadId: forge.squadId } });
        if (forge.currentTask && forge.currentTask.projectId !== 'p-3d') this.emit({ type: 'agent.task_queued', payload: { agentId: 'forge', task: forge.currentTask } });
        this.emit({ type: 'mission.status_changed', payload: { missionId: 'm-3d-2', status: 'active' } });
        this.startTask('forge', this.makeTask({ title: 'Build EAF scene with approved architecture (Option A)', projectId: 'p-3d', missionId: 'm-3d-2', state: 'working' }, 'critical', 5));
      });
    }
  }

  // ───────────────────────── chat ─────────────────────────

  private userMsg(conversationId: ID, text: string, attachments?: Message['attachments']): Message {
    return { id: uid('msg'), conversationId, role: 'user', text, ts: Date.now(), attachments };
  }

  private reply(conversationId: ID, a: Agent, text: string, actions?: MessageAction[], attachments?: Message['attachments'], delay = 900 + Math.random() * 900): void {
    this.later(delay, () =>
      this.emit({ type: 'message.sent', payload: { message: { id: uid('msg'), conversationId, role: 'agent', agentId: a.id, text, ts: Date.now(), actions, attachments, source: 'simulated' } } }),
    );
  }

  private onChat(conversationId: ID, agentId: ID, text: string, files: { name: string; size: number }[]): void {
    const conv = this.s.conversations[conversationId];
    const a = this.agent(agentId);
    if (!conv || !a) return;
    const attachments = files.map((f) => {
      const file: FileDoc = { id: uid('f'), name: f.name, kind: kindFromName(f.name), projectId: conv.projectId, agentId: null, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, updatedAt: Date.now(), summary: 'Attached in chat (metadata only in the demo).' };
      this.emit({ type: 'file.added', payload: { file, conversationId } }, 'user');
      return { fileId: file.id, name: file.name };
    });
    this.emit({ type: 'message.sent', payload: { message: this.userMsg(conversationId, text, attachments.length ? attachments : undefined) } }, 'user');

    const t = text.toLowerCase();
    const projectId = conv.projectId ?? a.currentTask?.projectId ?? (a.homeProjectId === CITADEL_ID ? null : a.homeProjectId);
    const project = projectId ? this.s.projects[projectId] : undefined;

    if (a.id === 'aria' && /attention|need|today|priorit|what.*(me|now)|brief/.test(t)) return this.ariaBriefing(conversationId, a);

    if (a.state === 'waiting') {
      const status: 'approved' | 'rejected' | 'revision' = /\b(no|reject|stop|cancel)\b/.test(t) ? 'rejected' : /revis|change|adjust|modif/.test(t) ? 'revision' : 'approved';
      const d = a.waitingFor?.decisionId ? this.s.decisions[a.waitingFor.decisionId] : undefined;
      if (d && d.status === 'pending') this.emit({ type: 'decision.made', payload: { decisionId: d.id, status, note: text } }, 'user');
      const msg =
        status === 'approved'
          ? `Thank you, Francisco. Recorded your approval${d ? ` on “${d.title}”` : ''}. Heading back to ${project?.structure ?? 'work'} now.`
          : status === 'revision'
            ? `Understood — I'll revise it with your input and come back for approval.`
            : `Understood. I've stopped this line of work and returned to base.`;
      this.reply(conversationId, a, msg, project ? [{ label: 'TAKE ME THERE', command: `focus:project:${project.id}` }] : undefined, undefined, 700);
      this.later(1600, () => this.afterDecision(this.agent(a.id) ?? a, d, status));
      return;
    }

    if (/\b(stop|pause|halt)\b/.test(t)) {
      this.emit({ type: 'agent.paused', payload: { agentId: a.id } }, 'user');
      return this.reply(conversationId, a, `Paused. I've stopped “${a.currentTask?.title ?? 'my current work'}” and will hold position until you resume me.`, [{ label: 'RESUME', command: `agent:resume:${a.id}` }]);
    }
    if (/\b(resume|continue|carry on)\b/.test(t)) {
      this.dispatch({ type: 'agent.resume', agentId: a.id });
      return this.reply(conversationId, a, `Resuming${a.currentTask ? ` “${a.currentTask.title}”` : ''}.`);
    }
    if (/status|update|working on|what are you doing|progress/.test(t)) {
      const ct = a.currentTask;
      const lines = ct
        ? `Current mission: ${ct.title}\nProject: ${ct.projectId ? this.s.projects[ct.projectId]?.name : 'Command Citadel'}\nProgress: ${ct.progress}% · state: ${a.state}\nLast: ${a.recentActivities[0] ?? '—'}\nNext: ${a.taskQueue[0]?.title ?? 'awaiting your next mission'}`
        : `No active mission — I'm ${a.state}. Last: ${a.recentActivities[0] ?? '—'}.`;
      return this.reply(conversationId, a, lines, ct?.projectId ? [{ label: 'VIEW PROJECT', command: `open:project:${ct.projectId}` }] : undefined);
    }
    if (/show|found|finding|result|learn/.test(t)) {
      const findings = (FINDINGS[a.id] ?? []).slice(0, 3).map((f) => `• ${f}`).join('\n');
      const files = Object.values(this.s.files).filter((f) => f.agentId === a.id).sort((x, y) => y.updatedAt - x.updatedAt).slice(0, 2);
      return this.reply(conversationId, a, `Here is what I have so far:\n${findings || '• Nothing substantial yet.'}`, undefined, files.map((f) => ({ fileId: f.id, name: f.name })));
    }
    if (/priorit/.test(t) && project) {
      const priority: Priority = /critical/.test(t) ? 'critical' : /low/.test(t) ? 'low' : 'high';
      this.emit({ type: 'project.priority_changed', payload: { projectId: project.id, priority } }, 'user');
      return this.reply(conversationId, a, `Done — ${project.name} is now ${priority.toUpperCase()} priority. I'll reorder my queue accordingly.`);
    }
    if (/collaborat|team up|work with|squad/.test(t)) {
      const rec = recommendAgents(t, Object.values(this.s.agents).filter((x) => x.id !== a.id && x.id !== 'aria'), 1).agentIds[0] ?? a.collaborators.find((c) => c !== 'aria');
      const partner = rec ? this.agent(rec) : undefined;
      if (!partner || !project) return this.reply(conversationId, a, 'Who should I collaborate with? Mention an agent by name.');
      const sq = this.formSquad(project.id, `Collaborate on ${project.name}`, [a.id, partner.id], 50000, 'user');
      return this.reply(conversationId, a, sq ? `Squad formed with ${partner.name}. We're meeting at ${project.structure}.` : `${partner.name} is not available right now (paused, waiting or already in a squad).`, sq ? [{ label: 'VIEW SQUAD', command: `squad:${sq.id}` }] : undefined);
    }
    if (/deliverable|draft|create|write|report|summary|document/.test(t)) {
      const title = project ? `${project.name} — ${a.name} deliverable` : `${a.name} deliverable`;
      this.reply(conversationId, a, `Creating “${title}”. I'll attach it here when it's ready.`);
      this.later(3500, () => {
        const f = this.deliverable(a.id, projectId, `${title}.doc`);
        this.reply(conversationId, a, 'Deliverable ready for your review (simulated document — no real content in demo mode).', [{ label: 'VIEW FILES', command: `open:files:${projectId ?? ''}` }], [{ fileId: f.id, name: f.name }], 300);
        this.notify({ kind: 'document_ready', title: `${a.name}: deliverable ready`, body: f.name, priority: 'high', target: { type: 'agent', id: a.id } });
      });
      return;
    }
    this.queueOrStart(a.id, text.length > 70 ? `${text.slice(0, 67)}…` : text, projectId ?? 'p-frontier', 'normal', conversationId);
  }

  private ariaBriefing(conversationId: ID, a: Agent): void {
    const s = this.s;
    const items: { text: string; action: MessageAction }[] = [];
    for (const w of Object.values(s.agents).filter((x) => x.state === 'waiting'))
      items.push({ text: `${w.name} is waiting for you: ${w.waitingFor?.question ?? 'needs input'}`, action: { label: `TAKE ME TO ${w.name}`, command: `focus:agent:${w.id}` } });
    for (const b of Object.values(s.agents).filter((x) => x.state === 'blocked'))
      items.push({ text: `${b.name} is blocked: ${b.blockedReason}`, action: { label: `TAKE ME TO ${b.name}`, command: `focus:agent:${b.id}` } });
    for (const p of Object.values(s.projects).filter((x) => x.status === 'blocked'))
      items.push({ text: `${p.name} is blocked.`, action: { label: 'TAKE ME THERE', command: `focus:project:${p.id}` } });
    const critical = Object.values(s.missions).filter((m) => m.level === 'critical' && m.status !== 'done');
    for (const m of critical.slice(0, 2))
      items.push({ text: `Critical mission: ${m.title} (${s.projects[m.projectId]?.name}).`, action: { label: 'TAKE ME THERE', command: `focus:project:${m.projectId}` } });
    const top = items.slice(0, 4);
    const text = top.length
      ? `${top.length} item${top.length > 1 ? 's' : ''} need${top.length > 1 ? '' : 's'} your attention:\n${top.map((x, i) => `${i + 1}. ${x.text}`).join('\n')}`
      : 'Nothing requires your attention right now. All agents are progressing.';
    this.reply(conversationId, a, text, top.map((x) => x.action));
  }
}

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}
function shuffle<T>(xs: T[]): T[] {
  return [...xs].sort(() => Math.random() - 0.5);
}
function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
function kindFromName(name: string): FileDoc['kind'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'md', 'txt'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'deck';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['glb', 'gltf', 'fbx', 'obj'].includes(ext)) return 'model';
  return 'other';
}
