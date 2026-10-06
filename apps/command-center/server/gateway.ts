// Agent gateway for RealAgentProvider — now with PostgreSQL persistence.
//
//   DATABASE_URL=postgres://… npm run gateway        (durable)
//   npm run gateway                                   (in-memory, not durable)
//
// WebSocket protocol (see src/providers/real/RealAgentProvider.ts):
//   client → { kind: 'command', command }
//   server → { kind: 'hello', persistence } · { kind: 'state', state, seq } · { kind: 'event', event }
// HTTP: GET /health · GET /api/events?after=<seq>&limit=<n>  (audit / replay)
//
// The gateway is the single writer: every change is an event, persisted in the
// same transaction as its projections, then broadcast. Agents only show
// activity while an LLM request is actually running.
import http from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { createClaudeAdapter } from '../src/integrations/llm/claude';
import { createOpenAIAdapter } from '../src/integrations/llm/openai';
import type { LLMAdapter } from '../src/integrations/types';
import type { Command } from '@/types/events';
import type { EventStore } from './persistence/EventStore';
import { MemoryEventStore } from './persistence/MemoryEventStore';
import { PostgresEventStore } from './persistence/PostgresEventStore';
import { AgentRuntime } from './world/AgentRuntime';
import { handleCommand } from './world/handleCommand';
import { WorldService } from './world/WorldService';

const PORT = Number(process.env.PORT ?? 8787);
const log = (m: string) => console.log(`[gateway] ${m}`);

function pickLLM(): LLMAdapter | null {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return createClaudeAdapter(undefined, process.env.AGENT_MODEL || 'claude-opus-5-5');
  if (process.env.OPENAI_API_KEY) return createOpenAIAdapter(process.env.OPENAI_API_KEY, process.env.AGENT_MODEL || undefined);
  return null;
}

async function main() {
  const store: EventStore = process.env.DATABASE_URL ? new PostgresEventStore(process.env.DATABASE_URL, log) : new MemoryEventStore();
  if (store.kind === 'memory') log('DATABASE_URL not set — using the in-memory store (nothing survives a restart)');

  const world = new WorldService(store, { log, snapshotEvery: Number(process.env.SNAPSHOT_EVERY ?? 200) });
  await world.boot();
  const llm = pickLLM();
  const runtime = new AgentRuntime(world, llm);

  const clients = new Set<WebSocket>();
  world.onEvent((event) => {
    const msg = JSON.stringify({ kind: 'event', event });
    for (const c of clients) if (c.readyState === c.OPEN) c.send(msg);
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    res.setHeader('access-control-allow-origin', '*');
    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, persistence: store.kind, seq: world.seq, llm: llm?.id ?? null }));
    }
    if (url.pathname === '/api/events') {
      const after = Number(url.searchParams.get('after') ?? Math.max(0, world.seq - 100));
      const limit = Math.min(1000, Number(url.searchParams.get('limit') ?? 100));
      const rows = (await store.eventsAfter(after)).slice(0, limit);
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(rows));
    }
    res.writeHead(404).end();
  });

  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ kind: 'hello', persistence: store.kind, agents: Object.keys(world.state.agents) }));
    ws.send(JSON.stringify({ kind: 'state', state: world.state, seq: world.seq }));
    ws.on('message', (raw) => {
      let msg: { kind?: string; command?: Command };
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (msg.kind !== 'command' || !msg.command) return;
      handleCommand(msg.command, world, runtime).catch((err) => {
        log(`command ${msg.command?.type} failed: ${(err as Error).message}`);
        ws.send(JSON.stringify({ kind: 'error', message: `${msg.command?.type} failed — not saved` }));
      });
    });
    ws.on('close', () => clients.delete(ws));
  });

  server.listen(PORT, () => log(`ws://localhost:${PORT} · persistence: ${store.kind} · LLM: ${llm ? llm.id : 'none (agents stay idle)'}`));

  const shutdown = async () => {
    log('shutting down…');
    wss.close();
    server.close();
    await world.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[gateway] failed to start:', err);
  process.exit(1);
});
