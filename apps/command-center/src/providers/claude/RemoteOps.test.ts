import { describe, expect, it } from 'vitest';
import { createEmptyState, reduce, type WorldState } from '@/services/worldState';
import type { Message } from '@/types/domain';
import type { WorldEvent } from '@/types/events';
import { normaliseStatus, RemoteOps, type McpLike } from './RemoteOps';

const blocked = {
  id: 'session_01KNk188BQs5d5yrXcfpDDFP',
  title: 'Training and Development department structure',
  session_status: 'SESSION_STATUS_IDLE',
  status_bucket: 'SESSION_STATUS_BUCKET_BLOCKED',
  updated_at: '2026-10-06T14:39:29Z',
  post_turn_summary: { status_category: 'need_input', needs_action: '¿Aprueba la opción A?' },
  session_context: { outcomes: [{ git_repository: { git_info: { repo: 'owner/HR', branches: ['claude/x'] } } }] },
};

function harness(sessions: unknown[]) {
  let state: WorldState = createEmptyState();
  const calls: { tool: string; input: unknown }[] = [];
  const transcripts: Record<string, Message[]> = {};
  const mcp: McpLike = {
    async callTool(_server, tool, input) {
      calls.push({ tool, input });
      if (tool === 'list_sessions') return { payload: { ccr: { data: sessions } } };
      if (tool === 'list_environments') return { payload: { environments: [{ environment_id: 'env_1', state: 'active' }] } };
      if (tool === 'list_repos') return { payload: { repos: [{ url: 'https://github.com/owner/HR', can_push: true }] } };
      if (tool === 'create_session') return { payload: { id: 'session_NEW123456789' } };
      if (tool === 'list_events')
        return {
          payload: {
            ccr: {
              data: [
                { created_at: '2026-10-06T14:00:00Z', user: { uuid: 'u1', internal_anthropic_catchall: { message: { content: 'Haz el plan' } } } },
                { created_at: '2026-10-06T14:01:00Z', user: { uuid: 'u2', internal_anthropic_catchall: { message: { content: '<task-notification>x</task-notification>' } } } },
                { created_at: '2026-10-06T14:02:00Z', assistant: { uuid: 'a1', internal_anthropic_catchall: { parent_tool_use_id: 'sub', message: { content: [{ type: 'text', text: 'subagent noise' }] } } } },
                { created_at: '2026-10-06T14:03:00Z', assistant: { uuid: 'a2', internal_anthropic_catchall: { message: { content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: 'Plan listo. ¿Aprueba la opción A?' }] } } } },
              ],
            },
          },
        };
      return { payload: {} };
    },
  };
  const ops = new RemoteOps(mcp, {
    getState: () => state,
    emit: (e, source = 'real') => {
      state = reduce(state, { id: `e${Math.random()}`, ts: Date.now(), source, ...e } as WorldEvent);
    },
    notify: () => {},
    onTranscript: (id, msgs) => (transcripts[id] = msgs),
    onStatus: () => {},
  });
  return { ops, calls, transcripts, get state() { return state; } };
}

describe('RemoteOps', () => {
  it('maps status buckets', () => {
    expect(normaliseStatus(blocked)).toBe('needs_input');
    expect(normaliseStatus({ id: 'x', status_bucket: 'SESSION_STATUS_BUCKET_WORKING' })).toBe('working');
    expect(normaliseStatus({ id: 'x', status_bucket: 'SESSION_STATUS_BUCKET_FAILED' })).toBe('failed');
  });

  it('links an existing session as an operation whose lead waits for Francisco', async () => {
    const h = harness([blocked]);
    await h.ops.sync();
    const r = h.state.remote[blocked.id];
    expect(r.status).toBe('needs_input');
    expect(h.state.projects[r.projectId].name).toBe(blocked.title);
    expect(h.state.conversations[r.conversationId].remoteSessionId).toBe(blocked.id);
    const lead = h.state.agents[r.agentIds[0]];
    expect(lead.state).toBe('waiting');
    expect(lead.waitingFor?.question).toContain('¿Aprueba la opción A?');
    // a second sync with no change emits nothing new
    const n = h.state.events.length;
    await h.ops.sync();
    expect(h.state.events.length).toBe(n);
  });

  it('turns the team to work when the session is working', async () => {
    const h = harness([{ ...blocked, status_bucket: 'SESSION_STATUS_BUCKET_WORKING', post_turn_summary: undefined, updated_at: 'b' }]);
    await h.ops.sync();
    const r = h.state.remote[blocked.id];
    for (const id of r.agentIds) expect(h.state.agents[id].currentTask?.projectId).toBe(r.projectId);
  });

  it('reads only the main conversation text from the transcript', async () => {
    const h = harness([blocked]);
    await h.ops.sync();
    await h.ops.transcript(blocked.id);
    expect(h.transcripts[blocked.id].map((m) => m.text)).toEqual(['Haz el plan', 'Plan listo. ¿Aprueba la opción A?']);
  });

  it('launches a real session on the repository and links it to the project', async () => {
    const h = harness([]);
    const id = await h.ops.launch({ title: 'Avances 3D', request: 'Presentación de avances del proyecto 3D', projectId: 'p-3d', agentIds: ['atlas', 'forge'], kind: 'presentation' });
    expect(id).toBe('session_NEW123456789');
    const create = h.calls.find((c) => c.tool === 'create_session')!.input as Record<string, string>;
    expect(create.environment_id).toBe('env_1');
    expect(create.source_url).toBe('https://github.com/owner/HR');
    expect(create.prompt).toContain('Presentación de avances');
    expect(create.prompt).toContain('.pptx');
    expect(h.state.remote[id!].projectId).toBe('p-3d');
    expect(h.state.conversations[`c-remote-${id}`].remoteSessionId).toBe(id);
  });
});
