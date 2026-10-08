import { describe, expect, it } from 'vitest';
import { computeTargets } from '@/game/agents/behavior';
import type { AgentTask } from '@/types/domain';
import type { WorldEvent } from '@/types/events';
import { recommendAgents } from './agentRouter';
import { citadelAnchor, dist, isoToScreen, ringBetween, routeBetween, screenToIso } from './geometry';
import { buildProject, findFreePlot } from './projectFactory';
import { search } from './search';
import { createSeedState, reduce, selectors } from './worldState';

let n = 0;
const ev = <T extends WorldEvent['type']>(type: T, payload: Extract<WorldEvent, { type: T }>['payload'], source: WorldEvent['source'] = 'simulated') =>
  ({ id: `e${++n}`, ts: Date.now(), source, type, payload }) as Extract<WorldEvent, { type: T }>;

describe('seed world', () => {
  it('has 4 territories, 8 agents and 12+ structures', () => {
    const s = createSeedState();
    expect(s.territories).toHaveLength(4);
    expect(Object.keys(s.agents)).toHaveLength(8);
    expect(Object.keys(s.projects).length).toBeGreaterThanOrEqual(12);
  });
  it('plays the demo scenario: ATLAS waits, LEDGER is idle, SCOUT researches the 3D lab', () => {
    const s = createSeedState();
    expect(s.agents.atlas.state).toBe('waiting');
    expect(s.agents.ledger.state).toBe('idle');
    expect(s.agents.ledger.activitySource).toBeNull();
    expect(s.agents.scout.state).toBe('researching');
    expect(s.agents.scout.currentTask?.projectId).toBe('p-3d');
  });
  it('links missions, files and decisions to their projects', () => {
    const s = createSeedState();
    expect(s.projects['p-3d'].missionIds).toContain('m-3d-1');
    expect(s.projects['p-3d'].decisionIds).toContain('d-3d-arch');
    expect(s.projects['p-3d'].fileIds.length).toBeGreaterThan(0);
  });
});

describe('event reducer', () => {
  it('task_started makes an agent work on a project and logs activity', () => {
    let s = createSeedState();
    const task: AgentTask = { id: 't1', title: 'Budget Q4', projectId: 'p-fin', state: 'working', progress: 0, startedAt: Date.now(), priority: 'normal' };
    s = reduce(s, ev('agent.task_started', { agentId: 'ledger', task }));
    expect(s.agents.ledger.state).toBe('working');
    expect(s.agents.ledger.activitySource).toBe('simulated');
    expect(s.activity[0].text).toContain('LEDGER started');
    expect(s.events.at(-1)?.type).toBe('agent.task_started');
  });
  it('pause/resume restores the previous state', () => {
    let s = createSeedState();
    s = reduce(s, ev('agent.paused', { agentId: 'forge' }, 'user'));
    expect(s.agents.forge.state).toBe('paused');
    s = reduce(s, ev('agent.resumed', { agentId: 'forge' }, 'user'));
    expect(s.agents.forge.state).toBe('working');
  });
  it('a task starting while paused keeps the agent paused', () => {
    let s = createSeedState();
    s = reduce(s, ev('agent.paused', { agentId: 'forge' }, 'user'));
    const task: AgentTask = { id: 't2', title: 'X', projectId: 'p-ojt', state: 'reviewing', progress: 0, startedAt: 0, priority: 'normal' };
    s = reduce(s, ev('agent.task_started', { agentId: 'forge', task }));
    expect(s.agents.forge.state).toBe('paused');
    s = reduce(s, ev('agent.resumed', { agentId: 'forge' }, 'user'));
    expect(s.agents.forge.state).toBe('reviewing');
  });
  it('idle clears the task and the activity source (no fake activity)', () => {
    let s = createSeedState();
    s = reduce(s, ev('agent.state_changed', { agentId: 'forge', state: 'idle' }));
    expect(s.agents.forge.currentTask).toBeNull();
    expect(s.agents.forge.activitySource).toBeNull();
  });
  it('decision.made resolves the pending decision', () => {
    let s = createSeedState();
    expect(selectors.pendingDecisions(s).map((d) => d.id)).toContain('d-3d-arch');
    s = reduce(s, ev('decision.made', { decisionId: 'd-3d-arch', status: 'approved' }, 'user'));
    expect(s.decisions['d-3d-arch'].status).toBe('approved');
    expect(s.activity[0].text).toContain('approved');
  });
  it('message.sent appends to the conversation', () => {
    let s = createSeedState();
    const before = s.conversations['c-atlas-3d'].messageIds.length;
    s = reduce(s, ev('message.sent', { message: { id: 'm1', conversationId: 'c-atlas-3d', role: 'user', text: 'hi', ts: Date.now() } }, 'user'));
    expect(s.conversations['c-atlas-3d'].messageIds).toHaveLength(before + 1);
  });
  it('squads link and unlink their members', () => {
    let s = createSeedState();
    s = reduce(s, ev('squad.formed', { squad: { id: 'sq1', name: 'Sq', objective: 'o', projectId: 'p-3d', agentIds: ['scout', 'forge'], dependencies: [], outputs: [], discussion: [], createdAt: 0, active: true } }));
    expect(s.agents.scout.squadId).toBe('sq1');
    s = reduce(s, ev('squad.disbanded', { squadId: 'sq1' }));
    expect(s.agents.scout.squadId).toBeNull();
    expect(s.squads.sq1.active).toBe(false);
  });
  it('ignores events for unknown entities', () => {
    const s = createSeedState();
    const next = reduce(s, ev('agent.paused', { agentId: 'nobody' }));
    expect(next.agents).toBe(s.agents);
  });
});

describe('geometry & routing', () => {
  it('iso projection round-trips', () => {
    const p = isoToScreen(12.5, 40.25);
    const [x, y] = screenToIso(p.x, p.y);
    expect(x).toBeCloseTo(12.5);
    expect(y).toBeCloseTo(40.25);
  });
  it('routes between territories via the plaza gates, never through the Citadel', () => {
    const route = routeBetween([22, 54], 'personal', [17, 8], 'industrial');
    const c = citadelAnchor();
    for (const p of route) expect(Math.abs(p[0] - c.tile[0]) < c.size / 2 && Math.abs(p[1] - c.tile[1]) < c.size / 2).toBe(false);
    expect(route.at(-1)).toEqual([17, 8]);
  });
  it('opposite territories walk around the ring', () => {
    expect(ringBetween('industrial', 'frontier')).toHaveLength(3);
    expect(ringBetween('praxia', 'praxia')).toEqual(['praxia']);
  });
  it('waiting agents are sent to the Citadel', () => {
    const t = computeTargets(createSeedState());
    const atlas = t.get('atlas')!;
    expect(atlas.structureId).toBe('citadel');
    expect(dist(atlas.pos!, citadelAnchor().tile)).toBeLessThan(5);
    expect(t.get('ledger')!.structureId).toBe('p-fin');
  });
});

describe('agent router', () => {
  it('recommends research + learning agents for an OJT benchmark', () => {
    const s = createSeedState();
    const rec = recommendAgents('Benchmark the best digital OJT systems in steel companies.', Object.values(s.agents));
    expect(rec.agentIds).toContain('scout');
    expect(rec.agentIds).toContain('forge');
  });
  it('falls back to ARIA', () => {
    const s = createSeedState();
    expect(recommendAgents('zzz', Object.values(s.agents)).agentIds).toEqual(['aria']);
  });
});

describe('project factory', () => {
  it('builds a structure on a free plot of the chosen territory', () => {
    const s = createSeedState();
    const plot = findFreePlot(s, 'frontier');
    expect(plot).not.toBeNull();
    const p = buildProject(s, { name: 'AI shift coach', territory: 'frontier', objective: 'x', kind: 'experimental', agentIds: [], autoAssign: true, files: [], context: '', priority: 'high' }, 'p-new', 0)!;
    expect(p.building).toBe('hangar');
    expect(p.tile).toEqual(plot);
    expect(p.underConstruction).toBe(true);
    expect(p.agentIds.length).toBeGreaterThan(0);
  });
});

describe('search', () => {
  it('finds OJT across projects, documents, missions and decisions', () => {
    const rs = search(createSeedState(), 'OJT');
    const types = new Set(rs.map((r) => r.type));
    expect(types.has('project')).toBe(true);
    expect(types.has('file')).toBe(true);
    expect(types.has('mission')).toBe(true);
    expect(types.has('message')).toBe(true);
  });
});
