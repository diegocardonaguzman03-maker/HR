// Durable event log in the artifact's `db`.
//
// Events are batched into chunk documents (`log/<session>-<n>`, ≤ ~180 KB each)
// because the store caps documents per artifact. Each browser tab writes only
// its own chunks, so tabs never overwrite each other; every tab subscribes to
// the collection and applies events written elsewhere (multi-device, live).
import { uid } from '@/services/ids';
import type { WorldEvent } from '@/types/events';
import type { DB } from './runtime';

const MAX_CHUNK_BYTES = 180_000;
const MAX_CHUNK_EVENTS = 400;
const FLUSH_DELAY = 600;

interface Chunk {
  n: number;
  events: WorldEvent[];
  bytes: number;
}

export class ArtifactLog {
  readonly session = uid('s').replace(/[^A-Za-z0-9_-]/g, '');
  private chunk: Chunk = { n: 0, events: [], bytes: 0 };
  private dirty = new Map<number, WorldEvent[]>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private writing: Promise<void> = Promise.resolve();
  private seen = new Set<string>();
  private unsub: (() => void) | null = null;
  onError: (msg: string) => void = () => {};

  constructor(private db: DB) {}

  /** World creation time (pins seed dates) and every stored event, oldest first. */
  async load(): Promise<{ createdAt: number; events: WorldEvent[] }> {
    const metaRef = this.db.doc('meta/world');
    const meta = await metaRef.get();
    let createdAt = Number(meta.data()?.createdAt);
    if (!meta.exists || !Number.isFinite(createdAt)) {
      createdAt = Date.now();
      await metaRef.set({ createdAt, version: 1 });
    }
    const snap = await this.db.collection('log').get();
    const all: { e: WorldEvent; k: string; i: number }[] = [];
    for (const d of snap.docs) {
      const events = (d.data()?.events as WorldEvent[] | undefined) ?? [];
      events.forEach((e, i) => all.push({ e, k: d.id, i }));
    }
    all.sort((a, b) => a.e.ts - b.e.ts || a.k.localeCompare(b.k) || a.i - b.i);
    const events: WorldEvent[] = [];
    for (const { e } of all) if (!this.seen.has(e.id)) (this.seen.add(e.id), events.push(e));
    return { createdAt, events };
  }

  /** Live events written by other tabs/devices. */
  subscribe(onRemote: (e: WorldEvent) => void): void {
    this.unsub = this.db.collection('log').onSnapshot(
      (snap) => {
        for (const ch of snap.docChanges()) {
          if (ch.type === 'removed' || ch.doc.data()?.session === this.session) continue;
          for (const e of (ch.doc.data()?.events as WorldEvent[] | undefined) ?? []) {
            if (this.seen.has(e.id)) continue;
            this.seen.add(e.id);
            onRemote(e);
          }
        }
      },
      (err) => this.onError(`Live sync stopped (${err.code}). Reload to reconnect.`),
    );
  }

  append(e: WorldEvent): void {
    if (this.seen.has(e.id)) return;
    this.seen.add(e.id);
    const clean = JSON.parse(JSON.stringify(e)) as WorldEvent;
    const size = JSON.stringify(clean).length;
    if (this.chunk.events.length && (this.chunk.bytes + size > MAX_CHUNK_BYTES || this.chunk.events.length >= MAX_CHUNK_EVENTS)) {
      this.chunk = { n: this.chunk.n + 1, events: [], bytes: 0 };
    }
    this.chunk.events.push(clean);
    this.chunk.bytes += size;
    this.dirty.set(this.chunk.n, this.chunk.events);
    if (!this.timer) this.timer = setTimeout(() => this.flush(), FLUSH_DELAY);
  }

  /** One write at a time per document; coalesces bursts of events. */
  flush(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const batch = [...this.dirty.entries()];
    this.dirty.clear();
    this.writing = this.writing.then(async () => {
      for (const [n, events] of batch) {
        try {
          await this.db.doc(`log/${this.session}-${String(n).padStart(4, '0')}`).set({ session: this.session, n, events: [...events], updatedAt: Date.now() });
        } catch (err) {
          const code = (err as { code?: string }).code ?? 'error';
          this.onError(code === 'quota_exceeded' ? 'Storage is full — older history must be cleared before new changes can be saved.' : `Could not save changes (${code}).`);
          this.dirty.set(n, events); // keep for the next attempt
        }
      }
    });
    return this.writing;
  }

  close(): void {
    this.unsub?.();
    void this.flush();
  }
}
