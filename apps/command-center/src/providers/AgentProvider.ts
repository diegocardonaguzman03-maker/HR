// The seam between the world and whatever actually runs the agents.
//
//   UI ──dispatch(Command)──▶ AgentProvider ──WorldEvent──▶ store.reduce ──▶ world/UI
//
// MockAgentProvider simulates activity in the browser (clearly marked as
// SIMULATED). RealAgentProvider forwards commands to a backend over WebSocket
// and only reflects events that backend emits — no fake activity.
import type { WorldState } from '@/services/worldState';
import type { Command, WorldEvent } from '@/types/events';

export type ProviderKind = 'mock' | 'real' | 'claude';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'simulated';

export interface ProviderContext {
  /** Read the current reduced world state (providers never mutate it directly). */
  getState(): WorldState;
  /** Emit an event into the world. */
  emit(event: WorldEvent): void;
  /** Replace the world (e.g. snapshot from a real backend on connect). */
  reset?(state: WorldState): void;
  onStatus(status: ConnectionStatus, detail?: string): void;
  /** Live text of a reply being written (null = finished). */
  onStream?(conversationId: string, agentId: string, text: string | null): void;
}

export interface AgentProvider {
  readonly kind: ProviderKind;
  readonly label: string;
  start(ctx: ProviderContext): void;
  stop(): void;
  dispatch(command: Command): void;
  /** Mock only: simulation speed multiplier. Real providers ignore it. */
  setSpeed?(multiplier: number): void;
}
