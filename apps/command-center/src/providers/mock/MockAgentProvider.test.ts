import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSeedState, reduce, type WorldState } from '@/services/worldState';
import type { WorldEvent } from '@/types/events';
import { MockAgentProvider } from './MockAgentProvider';

function harness() {
  let state: WorldState = createSeedState();
  const events: WorldEvent[] = [];
  const p = new MockAgentProvider();
  p.start({
    getState: () => state,
    emit: (e) => {
      events.push(e);
      state = reduce(state, e);
    },
    onStatus: () => {},
  });
  return { p, events, get state() { return state; } };
}

afterEach(() => vi.useRealTimers());

describe('MockAgentProvider', () => {
  it('replying to a waiting agent records the decision and sends it back to work', () => {
    vi.useFakeTimers();
    const h = harness();
    h.p.dispatch({ type: 'chat.send', conversationId: 'c-atlas-3d', agentId: 'atlas', text: 'Approved, go with A' });
    vi.advanceTimersByTime(4000);
    expect(h.state.decisions['d-3d-arch'].status).toBe('approved');
    expect(h.state.agents.atlas.state).toBe('working');
    expect(h.state.agents.atlas.currentTask?.projectId).toBe('p-3d');
    // a second agent joins the same structure a few seconds later
    vi.advanceTimersByTime(7000);
    expect(h.state.agents.forge.currentTask?.projectId).toBe('p-3d');
    h.p.stop();
  });

  it('creating a project builds it, adds a mission and sends agents there', () => {
    vi.useFakeTimers();
    const h = harness();
    h.p.dispatch({
      type: 'project.create',
      projectId: 'p-x',
      draft: { name: 'Confined spaces VR', territory: 'industrial', objective: 'VR training', kind: 'training', agentIds: ['forge'], autoAssign: false, files: [{ name: 'brief.pdf', size: 2048 }], context: '', priority: 'high' },
    });
    expect(h.state.projects['p-x'].underConstruction).toBe(true);
    expect(h.state.projects['p-x'].missionIds).toHaveLength(1);
    expect(h.state.projects['p-x'].fileIds).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(h.state.projects['p-x'].underConstruction).toBe(false);
    const forge = h.state.agents.forge;
    expect(forge.currentTask?.projectId === 'p-x' || forge.taskQueue.some((t) => t.projectId === 'p-x')).toBe(true);
    h.p.stop();
  });

  it('every agent-work event is tagged as simulated; user actions as user', () => {
    vi.useFakeTimers();
    const h = harness();
    h.p.dispatch({ type: 'agent.pause', agentId: 'forge' });
    vi.advanceTimersByTime(20000);
    expect(h.events.find((e) => e.type === 'agent.paused')?.source).toBe('user');
    for (const e of h.events.filter((x) => x.type === 'agent.task_progress' || x.type === 'agent.task_completed')) expect(e.source).toBe('simulated');
    h.p.stop();
  });

  it('never moves a paused agent', () => {
    vi.useFakeTimers();
    const h = harness();
    h.p.dispatch({ type: 'agent.pause', agentId: 'nexus' });
    vi.advanceTimersByTime(30000);
    expect(h.state.agents.nexus.state).toBe('paused');
    h.p.stop();
  });

  it('ARIA answers "what requires my attention" with TAKE ME THERE actions', () => {
    vi.useFakeTimers();
    const h = harness();
    h.p.dispatch({ type: 'chat.send', conversationId: 'c-aria', agentId: 'aria', text: 'What requires my attention?' });
    vi.advanceTimersByTime(3000);
    const reply = Object.values(h.state.messages).filter((m) => m.conversationId === 'c-aria' && m.role === 'agent').at(-1)!;
    expect(reply.text).toMatch(/attention/);
    expect(reply.actions?.some((a) => a.command === 'focus:agent:atlas')).toBe(true);
    h.p.stop();
  });
});
