'use client';
// Domain store: holds the reduced WorldState and the active AgentProvider.
// Components read from here; they never mutate domain state directly —
// they dispatch Commands, and providers answer with WorldEvents.
import { create } from 'zustand';
import { createProvider, DEFAULT_PROVIDER, DEFAULT_WS_URL, type AgentProvider, type ConnectionStatus, type ProviderKind } from '@/providers';
import { createSeedState, reduce, type WorldState } from '@/services/worldState';
import type { ID } from '@/types/domain';
import type { Command, WorldEvent } from '@/types/events';

type Listener = (e: WorldEvent) => void;

interface WorldStore {
  world: WorldState;
  connection: { kind: ProviderKind; status: ConnectionStatus; detail?: string; wsUrl: string; label: string };
  typing: Record<ID, boolean>;
  speed: number;
  started: boolean;
  start(): void;
  dispatch(cmd: Command): void;
  switchProvider(kind: ProviderKind, wsUrl?: string): void;
  setSpeed(x: number): void;
  /** Mark notifications as read (persisted by the real backend). */
  markRead(ids?: ID[]): void;
  /** Subscribe to the raw event stream (the game layer uses this for one-shot effects). */
  onEvent(fn: Listener): () => void;
}

let provider: AgentProvider | null = null;
const listeners = new Set<Listener>();
const typingTimers: Record<ID, ReturnType<typeof setTimeout>> = {};

export const useWorld = create<WorldStore>((set, get) => {
  const emit = (e: WorldEvent) => {
    set((s) => {
      const world = reduce(s.world, e);
      let typing = s.typing;
      if (e.type === 'message.sent' && e.payload.message.role !== 'user' && typing[e.payload.message.conversationId]) {
        typing = { ...typing, [e.payload.message.conversationId]: false };
      }
      return { world, typing };
    });
    for (const l of listeners) l(e);
  };

  const startProvider = (kind: ProviderKind, wsUrl: string) => {
    provider?.stop();
    provider = createProvider(kind, wsUrl);
    provider.setSpeed?.(get().speed);
    set((s) => ({ connection: { ...s.connection, kind, wsUrl, label: provider!.label, status: kind === 'mock' ? 'simulated' : 'connecting' } }));
    provider.start({
      getState: () => get().world,
      emit,
      reset: (world) => set({ world }),
      onStatus: (status, detail) => set((s) => ({ connection: { ...s.connection, status, detail } })),
    });
  };

  return {
    world: createSeedState(),
    connection: { kind: DEFAULT_PROVIDER, status: 'connecting', wsUrl: DEFAULT_WS_URL, label: '' },
    typing: {},
    speed: 1,
    started: false,
    start() {
      if (get().started) return;
      set({ started: true });
      startProvider(get().connection.kind, get().connection.wsUrl);
    },
    dispatch(cmd) {
      if (cmd.type === 'chat.send' || (cmd.type === 'conversation.start' && cmd.firstMessage) || cmd.type === 'team.start') {
        const cid = cmd.conversationId;
        set((s) => ({ typing: { ...s.typing, [cid]: true } }));
        clearTimeout(typingTimers[cid]);
        typingTimers[cid] = setTimeout(() => set((s) => ({ typing: { ...s.typing, [cid]: false } })), 15000);
      }
      provider?.dispatch(cmd);
    },
    switchProvider(kind, wsUrl) {
      // Switching resets to seed data so simulated and real activity never mix.
      set({ world: createSeedState(), typing: {} });
      startProvider(kind, wsUrl ?? get().connection.wsUrl);
    },
    setSpeed(x) {
      set({ speed: x });
      provider?.setSpeed?.(x);
    },
    markRead(ids) {
      provider?.dispatch({ type: 'notification.read', ids });
    },
    onEvent(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
});

/** Non-hook access for event handlers and the game bridge. */
export const world = () => useWorld.getState().world;
export const dispatch = (cmd: Command) => useWorld.getState().dispatch(cmd);
