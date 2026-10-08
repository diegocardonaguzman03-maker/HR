// The persistence port. The world service only talks to this interface, so the
// gateway runs with PostgreSQL in production and in memory for quick demos/tests.
import type { WorldState } from '@/services/worldState';
import type { WorldEvent } from '@/types/events';

export interface StoredSnapshot {
  seq: number;
  state: WorldState;
}

export interface Commit {
  /** Events in the order they were reduced. */
  events: WorldEvent[];
  /** State before the first event and after the last one (used for projections). */
  prev: WorldState;
  next: WorldState;
}

export interface EventStore {
  readonly kind: 'postgres' | 'memory';
  init(): Promise<void>;
  latestSnapshot(): Promise<StoredSnapshot | null>;
  /** Events strictly after `seq`, oldest first. */
  eventsAfter(seq: number): Promise<{ seq: number; event: WorldEvent }[]>;
  /** Atomically append events and update projections. Returns the last seq. */
  append(commit: Commit): Promise<number>;
  saveSnapshot(seq: number, state: WorldState): Promise<void>;
  /** Drop and rebuild every projection table from `state` (prev = null). */
  rebuildProjections(state: WorldState): Promise<void>;
  close(): Promise<void>;
}

/** Snapshots never carry the in-memory event tail — events live in their own table. */
export const snapshotOf = (s: WorldState): WorldState => ({ ...s, events: [] });
