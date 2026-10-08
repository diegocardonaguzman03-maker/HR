// RemoteOps — links the world to the viewer's real Claude Code sessions through
// the "Claude Code Remote" connector (artifact `mcp` capability).
//
// • Every session becomes an operation in the world: a structure, a lead agent
//   team and a conversation that mirrors the session's real transcript.
// • Session status drives the units: working → the team works at the
//   structure; needs input → the lead waits for Francisco at the Citadel.
// • Francisco (or an agent via a tool) can launch a NEW session: a real Claude
//   Code run on his repository that produces deliverables and a PR.
import { recommendAgents } from '@/services/agentRouter';
import { uid } from '@/services/ids';
import { buildProject } from '@/services/projectFactory';
import type { WorldState } from '@/services/worldState';
import type { ID, Message, RemoteSession, RemoteStatus } from '@/types/domain';
import type { RemoteTaskKind, WorldEvent } from '@/types/events';

export const REMOTE_SERVER = 'Claude Code Remote';
export const REMOTE_TOOLS = ['list_sessions', 'get_session', 'list_events', 'send_message', 'create_session', 'list_environments', 'list_repos', 'interrupt_session'];

type EvInput = { [K in WorldEvent['type']]: { type: K; payload: Extract<WorldEvent, { type: K }>['payload'] } }[WorldEvent['type']];

interface McpError {
  code: string;
  message: string;
}
export interface McpLike {
  callTool(server: string, tool: string, input?: unknown, options?: { cache?: false }): Promise<{ payload?: unknown }>;
}

interface Hooks {
  getState(): WorldState;
  emit(e: EvInput, source?: WorldEvent['source']): void;
  notify(title: string, body: string): void;
  onTranscript(sessionId: ID, messages: Message[]): void;
  onStatus(text: string): void;
}

/** Raw session as the connector returns it (only the fields we use). */
interface RawSession {
  id: string;
  title?: string;
  status_bucket?: string;
  session_status?: string;
  updated_at?: string;
  post_turn_summary?: { needs_action?: string; status_detail?: string; status_category?: string };
  external_metadata?: { post_turn_summary?: { needs_action?: string; status_detail?: string } };
  session_context?: { sources?: { git_repository?: { url?: string } }[]; outcomes?: { git_repository?: { git_info?: { repo?: string; branches?: string[] } } }[] };
}

const unwrap = (p: unknown): Record<string, unknown> => {
  const o = (p ?? {}) as Record<string, unknown>;
  return ((o.ccr as Record<string, unknown>) ?? o) as Record<string, unknown>;
};

export function normaliseStatus(s: RawSession): RemoteStatus {
  const b = `${s.status_bucket ?? ''} ${s.session_status ?? ''}`.toLowerCase();
  if (b.includes('blocked') || s.post_turn_summary?.status_category === 'need_input') return 'needs_input';
  if (b.includes('working') || b.includes('running')) return 'working';
  if (b.includes('review')) return 'review_ready';
  if (b.includes('fail')) return 'failed';
  if (b.includes('complet') || b.includes('archiv')) return 'completed';
  if (b.includes('idle')) return 'idle';
  return 'unknown';
}

export const sessionUrl = (id: ID) => `https://claude.ai/code/${id}`;

const KIND_PROMPT: Record<RemoteTaskKind, string> = {
  presentation:
    'Deliverable: an executive presentation. Produce a real .pptx (use the repository’s presentation skills — pptx/deck — when available; otherwise a slide-by-slide Markdown script) plus a one-page summary.',
  report: 'Deliverable: an executive report in Markdown following the repository’s deliverable templates.',
  progress: 'Deliverable: a progress update — status, what moved, risks, decisions needed, next steps — as Markdown, updating any tracking file the repository uses.',
  analysis: 'Deliverable: an analysis with sources, assumptions and a recommendation, as Markdown.',
  build: 'Deliverable: working changes in the repository (code or documents) with tests or checks where they apply.',
  other: 'Deliverable: whatever best answers the request, saved as files in the repository.',
};

export class RemoteOps {
  private envId: string | null = null;
  private repoUrl: string | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private syncing = false;
  available = false;
  lastError: string | null = null;

  constructor(private mcp: McpLike, private h: Hooks) {}

  async start(): Promise<void> {
    await this.sync();
    this.timer = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') void this.sync();
    }, 45_000);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async call(tool: string, input?: unknown): Promise<unknown> {
    const r = await this.mcp.callTool(REMOTE_SERVER, tool, input, { cache: false });
    return r.payload;
  }

  private explain(e: McpError): string {
    switch (e.code) {
      case 'server_not_connected':
      case 'selection_required':
        return 'Connect “Claude Code Remote” in claude.ai Settings → Connectors to link your sessions.';
      case 'needs_reauth':
        return 'Reconnect “Claude Code Remote” in claude.ai Settings → Connectors.';
      case 'not_in_manifest':
      case 'not_granted':
      case 'blocked_by_policy':
        return 'Access to your Claude Code sessions was not allowed for this page. Allow it from the page’s Permissions menu.';
      default:
        return `Claude Code sessions are unreachable right now (${e.code}).`;
    }
  }

  /** Pull the session list and reconcile it with the world. */
  async sync(): Promise<void> {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const payload = unwrap(await this.call('list_sessions', { limit: 50, mine: true }));
      const sessions = ((payload.data ?? payload.sessions ?? []) as RawSession[]).filter((s) => s && typeof s.id === 'string');
      this.available = true;
      this.lastError = null;
      for (const s of sessions) this.reconcile(s);
      this.h.onStatus(`${sessions.length} Claude Code session${sessions.length === 1 ? '' : 's'} linked`);
    } catch (err) {
      this.available = false;
      this.lastError = this.explain(err as McpError);
      this.h.onStatus(this.lastError);
    } finally {
      this.syncing = false;
    }
  }

  private reconcile(s: RawSession): void {
    const state = this.h.getState();
    const status = normaliseStatus(s);
    const pts = s.post_turn_summary ?? s.external_metadata?.post_turn_summary;
    const needsAction = status === 'needs_input' ? pts?.needs_action || pts?.status_detail || 'Waiting for your input' : null;
    const outcome = s.session_context?.outcomes?.[0]?.git_repository?.git_info;
    const repo = outcome?.repo ?? s.session_context?.sources?.[0]?.git_repository?.url?.replace('https://github.com/', '') ?? null;
    const branch = outcome?.branches?.[0] ?? null;
    if (!this.repoUrl && repo) this.repoUrl = `https://github.com/${repo}`;
    const title = s.title || 'Claude Code session';
    let r = state.remote?.[s.id];

    if (!r) {
      // An existing session we have never seen: give it its own structure.
      const projectId = `p-cc-${s.id.slice(-10)}`;
      const lead = recommendAgents(title, Object.values(state.agents), 2).agentIds;
      const agentIds = lead.length ? lead : ['aria'];
      if (!state.projects[projectId]) {
        const p = buildProject(state, { name: title, territory: 'industrial', objective: `Claude Code session: ${title}`, kind: /present|deck|pptx/i.test(title) ? 'strategy' : 'transformation', agentIds, autoAssign: false, files: [], context: repo ? `Repository ${repo}` : '', priority: 'normal' }, projectId, Date.now());
        if (!p) return;
        this.h.emit({ type: 'project.created', payload: { project: { ...p, structure: 'Claude Code Operation', underConstruction: false } } }, 'real');
      }
      const conversationId = `c-remote-${s.id}`;
      this.h.emit({ type: 'conversation.created', payload: { conversationId, agentId: agentIds[0], projectId, title, remoteSessionId: s.id } }, 'real');
      r = { id: s.id, title, projectId, agentIds, conversationId, status: 'unknown', needsAction: null, repo, branch, updatedAt: s.updated_at ?? '', launchedHere: false };
      this.h.emit({ type: 'remote.session_linked', payload: { session: r } }, 'real');
    }

    const changed = r.status !== status || r.needsAction !== needsAction || r.updatedAt !== (s.updated_at ?? r.updatedAt) || r.title !== title;
    if (!changed) return;
    const prevStatus = r.status;
    this.h.emit({ type: 'remote.session_updated', payload: { sessionId: s.id, patch: { status, needsAction, updatedAt: s.updated_at ?? r.updatedAt, title, branch: branch ?? r.branch } } }, 'real');
    this.applyStatus({ ...r, status, needsAction, title }, prevStatus);
  }

  /** Move the session's team to reflect what the session is really doing. */
  private applyStatus(r: RemoteSession, prev: RemoteStatus): void {
    const state = this.h.getState();
    const [lead, ...rest] = r.agentIds.filter((id) => state.agents[id]);
    if (!lead) return;
    const startTask = (agentId: ID, title: string) =>
      this.h.emit({ type: 'agent.task_started', payload: { agentId, task: { id: uid('t'), title, projectId: r.projectId, state: 'working', progress: 0, startedAt: Date.now(), priority: 'normal' } } }, 'real');
    switch (r.status) {
      case 'working':
        for (const id of [lead, ...rest]) {
          const a = this.h.getState().agents[id];
          if (a && a.state !== 'paused' && !(a.currentTask?.projectId === r.projectId && a.state === 'working')) startTask(id, `Claude Code: ${r.title}`);
        }
        break;
      case 'needs_input':
        this.h.emit({ type: 'agent.waiting_for_user', payload: { agentId: lead, projectId: r.projectId, question: `${r.title}: ${r.needsAction}` } }, 'real');
        for (const id of rest) this.idle(id, r.projectId);
        if (prev !== 'needs_input') this.h.notify(`${state.agents[lead]?.name ?? 'A session'} needs your input`, r.needsAction ?? r.title);
        break;
      case 'failed':
        this.h.emit({ type: 'agent.blocked', payload: { agentId: lead, reason: `Claude Code session failed: ${r.title}` } }, 'real');
        for (const id of rest) this.idle(id, r.projectId);
        break;
      default:
        for (const id of [lead, ...rest]) this.idle(id, r.projectId);
        if (prev === 'working' && (r.status === 'review_ready' || r.status === 'idle' || r.status === 'completed'))
          this.h.notify('Claude Code session finished a turn', r.title);
    }
  }

  private idle(agentId: ID, projectId: ID) {
    const a = this.h.getState().agents[agentId];
    if (!a || a.state === 'paused' || a.state === 'idle') return;
    if (a.currentTask?.projectId !== projectId && a.state !== 'waiting') return;
    this.h.emit({ type: 'agent.state_changed', payload: { agentId, state: 'idle', note: 'Session idle' } }, 'real');
  }

  /** Read the session's real conversation (main thread, text only). */
  async transcript(sessionId: ID): Promise<void> {
    try {
      const payload = unwrap(await this.call('list_events', { session_id: sessionId, limit: 100, kinds: ['user', 'assistant'] }));
      const events = (payload.data ?? []) as Record<string, unknown>[];
      const r = this.h.getState().remote?.[sessionId];
      const conversationId = r?.conversationId ?? `c-remote-${sessionId}`;
      const out: Message[] = [];
      for (const ev of events) {
        const role = ev.user ? 'user' : ev.assistant ? 'agent' : null;
        if (!role) continue;
        const inner = (ev.user ?? ev.assistant) as Record<string, unknown>;
        const body = (inner.internal_anthropic_catchall ?? inner) as Record<string, unknown>;
        if (body.parent_tool_use_id) continue; // sub-agent traffic
        const msg = (body.message ?? {}) as { content?: unknown };
        let text = '';
        if (typeof msg.content === 'string') text = msg.content;
        else if (Array.isArray(msg.content)) text = msg.content.filter((b) => b?.type === 'text').map((b) => String(b.text ?? '')).join('\n\n');
        text = text.trim();
        if (!text || (role === 'user' && /^(<|Another Claude session|\[SYSTEM)/.test(text))) continue;
        out.push({
          id: String(inner.uuid ?? `${sessionId}-${out.length}`),
          conversationId,
          role,
          agentId: role === 'agent' ? r?.agentIds[0] : undefined,
          text: text.length > 6000 ? `${text.slice(0, 6000)}…` : text,
          ts: Date.parse(String(ev.created_at ?? '')) || Date.now(),
          source: role === 'agent' ? 'real' : undefined,
        });
      }
      this.h.onTranscript(sessionId, out);
    } catch (err) {
      this.h.onTranscript(sessionId, [{ id: uid('msg'), conversationId: `c-remote-${sessionId}`, role: 'system', text: this.explain(err as McpError), ts: Date.now() }]);
    }
  }

  /** Send Francisco's message into the real session. */
  async send(sessionId: ID, text: string): Promise<boolean> {
    try {
      await this.call('send_message', { session_id: sessionId, message: text });
      setTimeout(() => void this.transcript(sessionId), 4000);
      setTimeout(() => void this.sync(), 6000);
      return true;
    } catch (err) {
      this.h.notify('Message not delivered', this.explain(err as McpError));
      return false;
    }
  }

  async interrupt(sessionId: ID): Promise<void> {
    await this.call('interrupt_session', { session_id: sessionId }).catch(() => {});
    setTimeout(() => void this.sync(), 3000);
  }

  private async environment(): Promise<string | null> {
    if (this.envId) return this.envId;
    const p = unwrap(await this.call('list_environments', {}));
    const envs = (p.environments ?? p.data ?? []) as { environment_id?: string; state?: string }[];
    this.envId = envs.find((e) => e.state === 'active')?.environment_id ?? envs[0]?.environment_id ?? null;
    return this.envId;
  }

  private async repository(): Promise<string | null> {
    if (this.repoUrl) return this.repoUrl;
    const p = unwrap(await this.call('list_repos', { limit: 5 }));
    const repos = (p.repos ?? p.data ?? []) as { url?: string; can_push?: boolean }[];
    this.repoUrl = repos.find((r) => r.can_push)?.url ?? repos[0]?.url ?? null;
    return this.repoUrl;
  }

  /** Launch a real Claude Code session for a team. Returns the session id. */
  async launch(opts: { title: string; request: string; projectId: ID | null; agentIds: ID[]; kind: RemoteTaskKind }): Promise<ID | null> {
    const state = this.h.getState();
    const team = opts.agentIds.map((id) => state.agents[id]).filter(Boolean);
    const project = opts.projectId ? state.projects[opts.projectId] : undefined;
    const today = new Date().toISOString().slice(0, 10);
    const prompt = [
      `Task from Francisco, sent from his Command Center.`,
      `Request: ${opts.request}`,
      project ? `Project: ${project.name} — ${project.objective}` : '',
      team.length ? `Team (work as this team; use the repository’s own subagents where they fit): ${team.map((a) => `${a.name} (${a.role})`).join('; ')}.` : '',
      KIND_PROMPT[opts.kind],
      `Save deliverables under entregables/${today}-<short-topic>/ and follow the repository’s CLAUDE.md conventions (language, templates, decision section).`,
      'Commit and push your work and open a draft pull request. End with a short summary: what you produced, where it is, and anything Francisco must decide.',
    ].filter(Boolean).join('\n\n');
    try {
      const [environment_id, source_url] = await Promise.all([this.environment(), this.repository()]);
      if (!environment_id) throw { code: 'tool_error', message: 'No Claude Code environment found' };
      const base = { prompt, title: opts.title.slice(0, 120), environment_id, ...(source_url ? { source_url } : {}), tags: ['command-center'] };
      let payload: unknown;
      try {
        payload = await this.call('create_session', { ...base, permission_mode: 'auto' });
      } catch (e) {
        if ((e as McpError).code !== 'tool_error') throw e;
        payload = await this.call('create_session', base); // permission mode not allowed from here
      }
      const p = unwrap(payload);
      const sessionId = String(p.id ?? p.session_id ?? (p.session as Record<string, unknown> | undefined)?.id ?? '');
      if (!sessionId.startsWith('session_')) throw { code: 'tool_error', message: 'The session was created but no id came back' };

      // Link it to the chosen project (or give it a new structure).
      let projectId = opts.projectId;
      if (!projectId || !this.h.getState().projects[projectId]) {
        projectId = `p-cc-${sessionId.slice(-10)}`;
        const p2 = buildProject(this.h.getState(), { name: opts.title, territory: 'industrial', objective: opts.request.slice(0, 200), kind: opts.kind === 'presentation' ? 'strategy' : 'transformation', agentIds: opts.agentIds, autoAssign: !opts.agentIds.length, files: [], context: '', priority: 'high' }, projectId, Date.now());
        if (p2) this.h.emit({ type: 'project.created', payload: { project: { ...p2, structure: 'Claude Code Operation' } } }, 'user');
      }
      const agentIds = opts.agentIds.length ? opts.agentIds : recommendAgents(opts.request, Object.values(this.h.getState().agents), 2).agentIds;
      const conversationId = `c-remote-${sessionId}`;
      this.h.emit({ type: 'conversation.created', payload: { conversationId, agentId: agentIds[0] ?? 'aria', projectId, title: opts.title, remoteSessionId: sessionId } }, 'user');
      this.h.emit({ type: 'remote.session_linked', payload: { session: { id: sessionId, title: opts.title, projectId: projectId!, agentIds, conversationId, status: 'unknown', needsAction: null, repo: null, branch: null, updatedAt: '', launchedHere: true } } }, 'user');
      this.h.notify('Real work launched', `${opts.title} — a Claude Code session is now working on it.`);
      setTimeout(() => void this.sync(), 5000);
      return sessionId;
    } catch (err) {
      this.h.notify('Could not launch the session', (err as McpError).message ? `${this.explain(err as McpError)} ${(err as McpError).message}` : this.explain(err as McpError));
      return null;
    }
  }
}
