// PostgreSQL event store: events + snapshots are the source of truth; the
// projection tables are updated in the same transaction as the append, so
// they are always consistent with the event log.
import pg from 'pg';
import type { WorldState } from '@/services/worldState';
import type { WorldEvent } from '@/types/events';
import type { Commit, EventStore, StoredSnapshot } from './EventStore';
import { snapshotOf } from './EventStore';
import { migrate } from './migrate';
import { PROJECTION_TABLES, projectTransition, type Statement } from './projections';

// BIGSERIAL comes back as a string by default; our seqs fit in a JS number.
pg.types.setTypeParser(20, (v) => Number(v));

export class PostgresEventStore implements EventStore {
  readonly kind = 'postgres' as const;
  readonly pool: pg.Pool;

  constructor(connectionString: string, private log: (m: string) => void = () => {}) {
    this.pool = new pg.Pool({ connectionString, max: 5 });
  }

  async init() {
    await migrate(this.pool, this.log);
  }

  async latestSnapshot(): Promise<StoredSnapshot | null> {
    const r = await this.pool.query<{ seq: number; state: WorldState }>('SELECT seq, state FROM snapshots ORDER BY seq DESC LIMIT 1');
    return r.rows[0] ?? null;
  }

  async eventsAfter(seq: number) {
    const r = await this.pool.query<{ seq: number; id: string; ts: Date; type: string; source: string; payload: unknown }>(
      'SELECT seq, id, ts, type, source, payload FROM events WHERE seq > $1 ORDER BY seq',
      [seq],
    );
    return r.rows.map((row) => ({
      seq: row.seq,
      event: { id: row.id, ts: row.ts.getTime(), type: row.type, source: row.source, payload: row.payload } as WorldEvent,
    }));
  }

  async append({ events, prev, next }: Commit): Promise<number> {
    if (!events.length) return this.currentSeq();
    return this.tx(async (c) => {
      let last = 0;
      for (const e of events) {
        const r = await c.query<{ seq: number }>(
          'INSERT INTO events (id, ts, type, source, payload) VALUES ($1, $2, $3, $4, $5) RETURNING seq',
          [e.id, new Date(e.ts), e.type, e.source, JSON.stringify(e.payload)],
        );
        last = r.rows[0].seq;
      }
      await this.run(c, projectTransition(prev, next, events));
      return last;
    });
  }

  async saveSnapshot(seq: number, state: WorldState) {
    await this.pool.query('INSERT INTO snapshots (seq, state) VALUES ($1, $2) ON CONFLICT (seq) DO UPDATE SET state = EXCLUDED.state', [seq, JSON.stringify(snapshotOf(state))]);
  }

  async rebuildProjections(state: WorldState) {
    await this.tx(async (c) => {
      await c.query(`TRUNCATE ${PROJECTION_TABLES.filter((t) => !['agent_states', 'tasks'].includes(t)).join(', ')}`);
      await this.run(c, projectTransition(null, state, []));
    });
  }

  async close() {
    await this.pool.end();
  }

  private async currentSeq(): Promise<number> {
    const r = await this.pool.query<{ seq: number | null }>('SELECT max(seq) AS seq FROM events');
    return r.rows[0].seq ?? 0;
  }

  private async run(c: pg.PoolClient, statements: Statement[]) {
    for (const s of statements) await c.query(s.text, s.values.map((v) => (v !== null && typeof v === 'object' && !(v instanceof Date) ? JSON.stringify(v) : v)));
  }

  private async tx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
    const c = await this.pool.connect();
    try {
      await c.query('BEGIN');
      const out = await fn(c);
      await c.query('COMMIT');
      return out;
    } catch (err) {
      await c.query('ROLLBACK');
      throw err;
    } finally {
      c.release();
    }
  }
}
