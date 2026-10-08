// The authoritative world on the server.
//
//   command → events (pure) → reduce → store.append (events + projections, one
//   transaction) → broadcast
//
// Commits are serialised, so the event order in PostgreSQL is exactly the order
// in which the state was reduced. A failed append leaves state untouched.
import { createEmptyState, reduce, type WorldState } from '@/services/worldState';
import { uid } from '@/services/ids';
import type { WorldEvent } from '@/types/events';
import type { EventStore } from '../persistence/EventStore';

type Listener = (e: WorldEvent, seq: number) => void;

export interface WorldServiceOptions {
  /** Write a snapshot after this many events (faster recovery). */
  snapshotEvery?: number;
  log?: (msg: string) => void;
  /** Initial world for an empty database. */
  bootstrap?: () => WorldState;
}

export class WorldService {
  state!: WorldState;
  seq = 0;
  private lastSnapshotSeq = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<Listener>();
  private readonly snapshotEvery: number;
  private readonly log: (m: string) => void;
  private readonly bootstrap: () => WorldState;

  constructor(private store: EventStore, opts: WorldServiceOptions = {}) {
    this.snapshotEvery = opts.snapshotEvery ?? 200;
    this.log = opts.log ?? (() => {});
    this.bootstrap = opts.bootstrap ?? createEmptyState;
  }

  /** Load the latest snapshot, replay newer events, then make agent state honest. */
  async boot(): Promise<{ replayed: number; fresh: boolean }> {
    await this.store.init();
    const snap = await this.store.latestSnapshot();
    let fresh = false;
    if (snap) {
      this.state = snap.state;
      this.seq = this.lastSnapshotSeq = snap.seq;
    } else {
      fresh = true;
      this.state = this.bootstrap();
      await this.store.rebuildProjections(this.state);
      await this.store.saveSnapshot(0, this.state);
    }
    const tail = await this.store.eventsAfter(this.seq);
    for (const { seq, event } of tail) {
      this.state = reduce(this.state, event);
      this.seq = seq;
    }
    this.log(`world loaded from ${this.store.kind}: snapshot @${this.lastSnapshotSeq}, replayed ${tail.length} events, head @${this.seq}`);

    // Nothing survives a restart: any agent that looked busy is now idle.
    const busy = Object.values(this.state.agents).filter((a) => a.state !== 'idle' && a.state !== 'paused');
    if (busy.length)
      await this.commit(
        busy.map((a) => ({
          id: uid('ev'), ts: Date.now(), source: 'real', type: 'agent.state_changed',
          payload: { agentId: a.id, state: 'idle', note: 'Gateway restarted — no work in progress' },
        }) as WorldEvent),
      );
    return { replayed: tail.length, fresh };
  }

  onEvent(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Run `fn` against the latest state (serialised) and commit the events it returns. */
  run(fn: (state: WorldState) => WorldEvent[]): Promise<void> {
    return this.enqueue(async () => {
      const events = fn(this.state);
      if (events.length) await this.persist(events);
    });
  }

  commit(events: WorldEvent[]): Promise<void> {
    return this.enqueue(() => this.persist(events));
  }

  private enqueue(job: () => Promise<void>): Promise<void> {
    const p = this.queue.then(job);
    this.queue = p.catch(() => {});
    return p;
  }

  private async persist(events: WorldEvent[]): Promise<void> {
    const prev = this.state;
    let next = prev;
    for (const e of events) next = reduce(next, e);
    const seq = await this.store.append({ events, prev, next });
    this.state = next;
    const first = seq - events.length + 1;
    events.forEach((e, i) => {
      for (const l of this.listeners) l(e, first + i);
    });
    this.seq = seq;
    if (this.seq - this.lastSnapshotSeq >= this.snapshotEvery) {
      await this.store.saveSnapshot(this.seq, this.state);
      this.lastSnapshotSeq = this.seq;
      this.log(`snapshot @${this.seq}`);
    }
  }

  async close(): Promise<void> {
    await this.queue;
    if (this.seq > this.lastSnapshotSeq) await this.store.saveSnapshot(this.seq, this.state);
    await this.store.close();
  }
}
