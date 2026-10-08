// Integration test against a real PostgreSQL. Runs only when TEST_DATABASE_URL
// is set (e.g. postgres://fcc:fcc@localhost:5432/fcc_test). It DROPS the tables.
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AgentRuntime } from '../world/AgentRuntime';
import { handleCommand } from '../world/handleCommand';
import { WorldService } from '../world/WorldService';
import { PostgresEventStore } from './PostgresEventStore';
import { PROJECTION_TABLES } from './projections';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('PostgresEventStore (integration)', () => {
  let admin: pg.Pool;
  const count = async (table: string, where = '') => Number((await admin.query(`SELECT count(*) FROM ${table} ${where}`)).rows[0].count);

  beforeAll(async () => {
    admin = new pg.Pool({ connectionString: url });
    await admin.query(`DROP TABLE IF EXISTS events, snapshots, schema_migrations, ${PROJECTION_TABLES.join(', ')} CASCADE`);
  });
  afterAll(async () => admin.end());

  it('bootstraps, persists commands with projections, and survives a restart', async () => {
    const w1 = new WorldService(new PostgresEventStore(url!), { snapshotEvery: 3 });
    expect((await w1.boot()).fresh).toBe(true);
    expect(await count('projects')).toBeGreaterThan(10);
    expect(await count('agents')).toBe(8);

    const rt = new AgentRuntime(w1, { id: 'fake', complete: async () => 'On it — first findings attached.' });
    await handleCommand({
      type: 'project.create', projectId: 'p-pg',
      draft: { name: 'Persistence pilot', territory: 'frontier', objective: 'Prove durability', kind: 'experimental', agentIds: ['scout'], autoAssign: false, files: [{ name: 'brief.pdf', size: 4096 }], context: '', priority: 'high' },
    }, w1, rt);
    await handleCommand({ type: 'chat.send', conversationId: 'c-scout-ojt', agentId: 'scout', text: 'Status?' }, w1, rt);
    await handleCommand({ type: 'decision.resolve', decisionId: 'd-3d-arch', status: 'approved' }, w1, rt);
    await new Promise((r) => setTimeout(r, 3800)); // construction finishes as its own transaction
    const head = w1.seq;
    await w1.close();

    // projections are queryable SQL
    expect((await admin.query(`SELECT status, priority, tile_x FROM projects WHERE id = 'p-pg'`)).rows[0]).toMatchObject({ status: 'active', priority: 'high' });
    expect((await admin.query(`SELECT status FROM decisions WHERE id = 'd-3d-arch'`)).rows[0].status).toBe('approved');
    expect(await count('files', `WHERE project_id = 'p-pg'`)).toBe(1);
    expect(await count('missions', `WHERE project_id = 'p-pg'`)).toBe(1);
    expect(await count('messages', `WHERE conversation_id = 'c-scout-ojt' AND source = 'real'`)).toBe(1);
    expect(await count('tasks', `WHERE agent_id = 'scout' AND status = 'completed'`)).toBe(1);
    expect(await count('agent_states', `WHERE agent_id = 'scout'`)).toBeGreaterThanOrEqual(2);
    expect(await count('snapshots')).toBeGreaterThan(1);
    expect(await count('events')).toBe(head);

    // restart: a new process sees exactly the same world
    const w2 = new WorldService(new PostgresEventStore(url!));
    const r = await w2.boot();
    expect(r.fresh).toBe(false);
    expect(w2.state.projects['p-pg'].underConstruction).toBe(false);
    expect(w2.state.decisions['d-3d-arch'].status).toBe('approved');
    expect(w2.state.messages[w2.state.conversations['c-scout-ojt'].messageIds.at(-1)!].text).toBe('On it — first findings attached.');
    expect(Object.values(w2.state.agents).every((a) => a.state === 'idle' || a.state === 'paused')).toBe(true);
    await w2.close();
  }, 20000);

  it('rolls back a failed append: no partial events, state unchanged', async () => {
    const store = new PostgresEventStore(url!);
    const w = new WorldService(store);
    await w.boot();
    const before = await count('events');
    const dup = { id: 'dup-1', ts: Date.now(), source: 'user' as const, type: 'project.priority_changed' as const, payload: { projectId: 'p-ojt', priority: 'low' as const } };
    await w.commit([dup]);
    await expect(w.commit([{ ...dup, id: 'dup-2', payload: { projectId: 'p-ojt', priority: 'high' as const } }, dup])).rejects.toThrow();
    expect(await count('events')).toBe(before + 1);
    expect(w.state.projects['p-ojt'].priority).toBe('low');
    await w.close();
  });
});
