import type { WorldState } from '@/services/worldState';
import type { WorldEvent } from '@/types/events';
import type { Commit, EventStore, StoredSnapshot } from './EventStore';
import { snapshotOf } from './EventStore';

/** Non-durable store: used when DATABASE_URL is not set, and in tests. */
export class MemoryEventStore implements EventStore {
  readonly kind = 'memory' as const;
  private log: { seq: number; event: WorldEvent }[] = [];
  private snapshot: StoredSnapshot | null = null;
  private seq = 0;

  async init() {}
  async latestSnapshot() {
    return this.snapshot ? { seq: this.snapshot.seq, state: structuredClone(this.snapshot.state) } : null;
  }
  async eventsAfter(seq: number) {
    return this.log.filter((x) => x.seq > seq);
  }
  async append({ events }: Commit) {
    for (const event of events) this.log.push({ seq: ++this.seq, event });
    return this.seq;
  }
  async saveSnapshot(seq: number, state: WorldState) {
    this.snapshot = { seq, state: structuredClone(snapshotOf(state)) };
  }
  async rebuildProjections() {}
  async close() {}
}
