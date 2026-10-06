import { describe, expect, it } from 'vitest';
import type { AgentTask } from '@/types/domain';
import type { Command, WorldEvent } from '@/types/events';
import { MemoryEventStore } from '../persistence/MemoryEventStore';
import { AgentRuntime } from './AgentRuntime';
import { handleCommand } from './handleCommand';
import { WorldService } from './WorldService';

const started = (agentId: string): WorldEvent => ({
  id: `e-${Math.random()}`, ts: Date.now(), source: 'real', type: 'agent.task_started',
  payload: { agentId, task: { id: 't', title: 'x', projectId: 'p-3d', state: 'working', progress: 0, startedAt: 0, priority: 'normal' } as AgentTask },
});

describe('WorldService', () => {
  it('bootstraps an honest world: all agents idle, no simulated activity', async () => {
    const w = new WorldService(new MemoryEventStore());
    const r = await w.boot();
    expect(r.fresh).toBe(true);
    expect(Object.values(w.state.agents).every((a) => a.state === 'idle' && a.activitySource === null)).toBe(true);
    expect(w.state.activity).toHaveLength(0);
  });

  it('recovers from snapshot + event tail, and marks interrupted work idle', async () => {
    const store = new MemoryEventStore();
    const w1 = new WorldService(store, { snapshotEvery: 1000 });
    await w1.boot();
    await w1.commit([started('forge')]);
    expect(w1.state.agents.forge.state).toBe('working');
    // simulate a crash: no close(), the tail lives only in the event log
    const w2 = new WorldService(store);
    const r = await w2.boot();
    expect(r.replayed).toBe(1);
    expect(w2.state.agents.forge.state).toBe('idle');
    expect(w2.seq).toBe(2); // replayed event + the honest "idle" event
  });

  it('broadcasts events with their sequence numbers, in order', async () => {
    const w = new WorldService(new MemoryEventStore());
    await w.boot();
    const seen: number[] = [];
    w.onEvent((_, seq) => seen.push(seq));
    await w.commit([started('scout'), started('nexus')]);
    expect(seen).toEqual([1, 2]);
  });

  it('structural commands become persisted user events; chat without an LLM says so', async () => {
    const store = new MemoryEventStore();
    const w = new WorldService(store);
    await w.boot();
    const rt = new AgentRuntime(w, null);
    const cmd: Command = { type: 'project.set_priority', projectId: 'p-ojt', priority: 'critical' };
    await handleCommand(cmd, w, rt);
    expect(w.state.projects['p-ojt'].priority).toBe('critical');
    await handleCommand({ type: 'chat.send', conversationId: 'c-forge-ojt', agentId: 'forge', text: 'status?' }, w, rt);
    const msgs = w.state.conversations['c-forge-ojt'].messageIds.map((id) => w.state.messages[id]);
    expect(msgs.at(-1)!.role).toBe('system');
    expect(w.state.agents.forge.state).toBe('idle');
    const log = await store.eventsAfter(0);
    expect(log.map((x) => x.event.type)).toEqual(['project.priority_changed', 'message.sent', 'message.sent']);
    expect(log[0].event.source).toBe('user');
  });

  it('runs real agent work through the LLM adapter and records it', async () => {
    const w = new WorldService(new MemoryEventStore());
    await w.boot();
    const prompts: string[] = [];
    const rt = new AgentRuntime(w, { id: 'fake', complete: async ({ messages }) => { prompts.push(messages.at(-1)!.content); return 'Done: plan attached.'; } });
    await handleCommand({ type: 'agent.assign_task', agentId: 'scout', projectId: 'p-3d', title: 'Benchmark VR vendors', priority: 'high' }, w, rt);
    expect(prompts[0]).toContain('Benchmark VR vendors');
    expect(w.state.agents.scout.state).toBe('completed');
    const conv = w.state.conversations['c-missions-scout'];
    expect(w.state.messages[conv.messageIds.at(-1)!].text).toBe('Done: plan attached.');
    expect(w.state.messages[conv.messageIds.at(-1)!].source).toBe('real');
  });
});
