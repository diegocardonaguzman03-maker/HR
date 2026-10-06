// RealAgentProvider — connects the world to a backend that actually runs agents.
//
// Wire protocol (JSON over WebSocket, see server/gateway.ts for a reference):
//   client → server  { kind: 'command', command: Command }
//   server → client  { kind: 'event', event: WorldEvent }
//                    { kind: 'state', state: WorldState, seq: number }   (on connect: persisted world)
//                    { kind: 'snapshot', events: WorldEvent[] }           (optional catch-up)
//                    { kind: 'hello', agents?: string[], persistence?: 'postgres' | 'memory' }
//
// The gateway is the single writer: every command goes to it, it persists the
// resulting events (PostgreSQL) and broadcasts them. The client only reduces.
// It never invents activity: while disconnected every agent is shown IDLE.
import { idleAgent, type WorldState } from '@/services/worldState';
import type { Command, WorldEvent } from '@/types/events';
import type { AgentProvider, ProviderContext } from '../AgentProvider';

type ServerMessage =
  | { kind: 'event'; event: WorldEvent }
  | { kind: 'state'; state: WorldState; seq: number }
  | { kind: 'snapshot'; events: WorldEvent[] }
  | { kind: 'hello'; agents?: string[]; persistence?: 'postgres' | 'memory' }
  | { kind: 'error'; message: string };

export class RealAgentProvider implements AgentProvider {
  readonly kind = 'real' as const;
  readonly label: string;
  private ws: WebSocket | null = null;
  private ctx: ProviderContext | null = null;
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private outbox: Command[] = [];

  constructor(private readonly url: string) {
    this.label = `Live gateway (${url})`;
  }

  start(ctx: ProviderContext): void {
    this.ctx = ctx;
    this.markAllIdle();
    this.connect();
  }

  stop(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
    this.ctx = null;
  }

  dispatch(command: Command): void {
    this.send(command);
  }

  private send(command: Command): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ kind: 'command', command }));
    else this.outbox.push(command);
  }

  private connect(): void {
    if (!this.ctx) return;
    this.ctx.onStatus('connecting', this.url);
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch (err) {
      this.ctx.onStatus('disconnected', String(err));
      return this.scheduleReconnect();
    }
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      this.ctx?.onStatus('connected', this.url);
      for (const c of this.outbox.splice(0)) this.send(c);
    };
    ws.onmessage = (msg) => {
      let data: ServerMessage;
      try {
        data = JSON.parse(String(msg.data));
      } catch {
        return;
      }
      if (data.kind === 'hello') this.ctx?.onStatus('connected', `${this.url} · persistence: ${data.persistence ?? 'unknown'}`);
      else if (data.kind === 'state') this.ctx?.reset?.(data.state);
      else if (data.kind === 'error') this.ctx?.onStatus('connected', `Gateway error: ${data.message}`);
      else if (data.kind === 'event') this.ctx?.emit({ ...data.event, source: data.event.source === 'user' ? 'user' : 'real' });
      else if (data.kind === 'snapshot') for (const e of data.events) this.ctx?.emit({ ...e, source: e.source === 'user' ? 'user' : 'real' });
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.ctx?.onStatus('disconnected', 'Gateway connection closed');
      this.markAllIdle();
      this.scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  private scheduleReconnect(): void {
    if (!this.ctx) return;
    const delay = Math.min(30000, 1000 * 2 ** this.retry++);
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }

  /** No backend → nothing is executing → everyone is idle. */
  private markAllIdle(): void {
    if (!this.ctx?.reset) return;
    const s: WorldState = this.ctx.getState();
    this.ctx.reset({ ...s, agents: Object.fromEntries(Object.values(s.agents).map((a) => [a.id, idleAgent(a)])) });
  }
}
