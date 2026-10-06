// npm run db:migrate   — apply pending migrations
// npm run db:rebuild   — rebuild every projection table by replaying the event log
// npm run db:reset     — DROP everything (development only; asks for --yes)
import pg from 'pg';
import { reduce } from '@/services/worldState';
import { migrate } from './migrate';
import { PROJECTION_TABLES, projectTransition } from './projections';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
const pool = new pg.Pool({ connectionString: url });
const cmd = process.argv[2];

async function rebuild() {
  const base = await pool.query('SELECT seq, state FROM snapshots ORDER BY seq ASC LIMIT 1');
  if (!base.rows[0]) throw new Error('no snapshot found — start the gateway once to bootstrap the world');
  let state = base.rows[0].state;
  const events = await pool.query('SELECT seq, id, ts, type, source, payload FROM events WHERE seq > $1 ORDER BY seq', [base.rows[0].seq]);
  const c = await pool.connect();
  const run = async (stmts: ReturnType<typeof projectTransition>) => {
    for (const s of stmts) await c.query(s.text, s.values.map((v) => (v !== null && typeof v === 'object' && !(v instanceof Date) ? JSON.stringify(v) : v)));
  };
  try {
    await c.query('BEGIN');
    await c.query(`TRUNCATE ${PROJECTION_TABLES.join(', ')}`);
    await run(projectTransition(null, state, []));
    for (const row of events.rows) {
      const e = { id: row.id, ts: new Date(row.ts).getTime(), type: row.type, source: row.source, payload: row.payload };
      const next = reduce(state, e);
      await run(projectTransition(state, next, [e]));
      state = next;
    }
    await c.query('COMMIT');
    console.log(`rebuilt projections from snapshot @${base.rows[0].seq} + ${events.rows.length} events`);
  } catch (err) {
    await c.query('ROLLBACK');
    throw err;
  } finally {
    c.release();
  }
}

async function main() {
  if (cmd === 'migrate') {
    const applied = await migrate(pool, console.log);
    console.log(applied.length ? `applied ${applied.length} migration(s)` : 'database is up to date');
  } else if (cmd === 'rebuild') {
    await rebuild();
  } else if (cmd === 'reset') {
    if (!process.argv.includes('--yes')) throw new Error('refusing to drop data without --yes');
    await pool.query(`DROP TABLE IF EXISTS events, snapshots, schema_migrations, ${PROJECTION_TABLES.join(', ')} CASCADE`);
    console.log('dropped all tables');
  } else {
    throw new Error('usage: cli.ts migrate | rebuild | reset --yes');
  }
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
