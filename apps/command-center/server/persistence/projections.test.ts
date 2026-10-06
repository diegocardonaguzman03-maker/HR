import { describe, expect, it } from 'vitest';
import { createEmptyState, reduce } from '@/services/worldState';
import type { AgentTask } from '@/types/domain';
import type { WorldEvent } from '@/types/events';
import { projectTransition } from './projections';

const ev = <T extends WorldEvent['type']>(type: T, payload: Extract<WorldEvent, { type: T }>['payload'], source: WorldEvent['source'] = 'real') =>
  ({ id: `e-${type}-${Math.random()}`, ts: Date.now(), source, type, payload }) as Extract<WorldEvent, { type: T }>;
const tables = (stmts: { text: string }[]) => new Set(stmts.map((s) => /(?:INTO|FROM|UPDATE)\s+(\w+)/.exec(s.text)![1]));

describe('projections', () => {
  it('a full rebuild writes every entity table', () => {
    const s = createEmptyState();
    const t = tables(projectTransition(null, s, []));
    for (const name of ['territories', 'projects', 'agents', 'missions', 'conversations', 'messages', 'files', 'decisions', 'notifications', 'project_agents'])
      expect(t.has(name), name).toBe(true);
  });

  it('a decision only touches decisions and the activity log', () => {
    const prev = createEmptyState();
    const e = ev('decision.made', { decisionId: 'd-3d-arch', status: 'approved' }, 'user');
    const next = reduce(prev, e);
    const stmts = projectTransition(prev, next, [e]);
    expect(tables(stmts)).toEqual(new Set(['decisions', 'activity_logs']));
    expect(stmts.find((s) => s.text.includes('decisions'))!.values).toContain('approved');
  });

  it('task lifecycle feeds tasks and agent_states history', () => {
    let s = createEmptyState();
    const task: AgentTask = { id: 't1', title: 'Budget', projectId: 'p-fin', state: 'working', progress: 0, startedAt: Date.now(), priority: 'normal' };
    const started = ev('agent.task_started', { agentId: 'ledger', task });
    const s1 = reduce(s, started);
    const a = projectTransition(s, s1, [started]);
    expect(a.some((x) => x.text.startsWith('INSERT INTO tasks') && x.values.includes('active'))).toBe(true);
    expect(a.some((x) => x.text.startsWith('INSERT INTO agent_states') && x.values.includes('working'))).toBe(true);
    s = s1;
    const done = ev('agent.task_completed', { agentId: 'ledger', taskId: 't1', projectId: 'p-fin', summary: 'budget' });
    const b = projectTransition(s, reduce(s, done), [done]);
    expect(b.some((x) => x.text.startsWith('UPDATE tasks SET status'))).toBe(true);
  });

  it('unchanged records produce no statements', () => {
    const s = createEmptyState();
    expect(projectTransition(s, s, [])).toEqual([]);
  });
});
