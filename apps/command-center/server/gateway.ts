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
// Security (fail closed):
//   HOST             interface to bind (default 127.0.0.1 — local only)
//   GATEWAY_TOKEN    shared secret; required as ?token= on the WebSocket URL and as
//                    `Authorization: Bearer` on /api/events. Mandatory when HOST is not loopback.
//   ALLOWED_ORIGINS  comma-separated browser origins allowed to connect
//                    (default: http://localhost:3000, http://127.0.0.1:3000)
// Messages are size- and rate-limited; malformed commands are dropped.
//
// The gateway is the single writer: every change is an event, persisted in the
// same transaction as its projections, then broadcast. Agents only show
// activity while an LLM request is actually running.
import { timingSafeEqual } from 'node:crypto';
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
const HOST = process.env.HOST || '127.0.0.1';
const TOKEN = process.env.GATEWAY_TOKEN || '';
const ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);
const MAX_MESSAGE_BYTES = 256 * 1024;
const MAX_MESSAGES_PER_10S = 60;
const log = (m: string) => console.log(`[gateway] ${m}`);

const isLoopback = (h: string) => h === '127.0.0.1' || h === '::1' || h === 'localhost';

function tokenOk(given: string | null | undefined): boolean {
  if (!TOKEN) return true;
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

function originOk(origin: string | undefined): boolean {
  // Non-browser clients send no Origin; they still need the token when one is set.
  return !origin || ORIGINS.has(origin);
}

function isCommand(c: unknown): c is Command {
  return !!c && typeof c === 'object' && typeof (c as { type?: unknown }).type === 'string' && (c as { type: string }).type.length < 64;
}

function pickLLM(): LLMAdapter | null {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return createClaudeAdapter(undefined, process.env.AGENT_MODEL || 'claude-opus-5-5');
  if (process.env.OPENAI_API_KEY) return createOpenAIAdapter(process.env.OPENAI_API_KEY, process.env.AGENT_MODEL || undefined);
  return null;
}

async function main() {
  if (!isLoopback(HOST) && TOKEN.length < 24) {
    throw new Error(`refusing to listen on ${HOST} without GATEWAY_TOKEN (min 24 chars) — set one or keep HOST=127.0.0.1`);
  }
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
    const origin = req.headers.origin;
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('cache-control', 'no-store');
    res.setHeader('referrer-policy', 'no-referrer');
    if (origin && ORIGINS.has(origin)) {
      res.setHeader('access-control-allow-origin', origin);
      res.setHeader('vary', 'Origin');
    }
    if (req.method !== 'GET') {
      res.writeHead(405).end();
      return;
    }
    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, persistence: store.kind, seq: world.seq, llm: llm?.id ?? null }));
    }
    if (url.pathname === '/api/events') {
      const bearer = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1];
      if (!originOk(origin) || !tokenOk(bearer)) {
        res.writeHead(401).end();
        return;
      }
      const num = (v: string | null, d: number) => (v !== null && Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : d);
      const after = num(url.searchParams.get('after'), Math.max(0, world.seq - 100));
      const limit = Math.min(1000, num(url.searchParams.get('limit'), 100));
      const rows = (await store.eventsAfter(after)).slice(0, limit);
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(rows));
    }
    res.writeHead(404).end();
  });

  const wss = new WebSocketServer({
    server,
    maxPayload: MAX_MESSAGE_BYTES,
    verifyClient: ({ origin, req }, done) => {
      const token = new URL(req.url ?? '/', 'http://localhost').searchParams.get('token');
      if (!originOk(origin)) {
        log(`rejected connection from origin ${origin}`);
        return done(false, 403, 'Forbidden origin');
      }
      if (!tokenOk(token)) {
        log('rejected connection: missing or wrong token');
        return done(false, 401, 'Unauthorized');
      }
      done(true);
    },
  });
  wss.on('connection', (ws) => {
    let windowStart = Date.now();
    let count = 0;
    clients.add(ws);
    ws.send(JSON.stringify({ kind: 'hello', persistence: store.kind, agents: Object.keys(world.state.agents) }));
    ws.send(JSON.stringify({ kind: 'state', state: world.state, seq: world.seq }));
    ws.on('message', (raw) => {
      const now = Date.now();
      if (now - windowStart > 10_000) {
        windowStart = now;
        count = 0;
      }
      if (++count > MAX_MESSAGES_PER_10S) {
        ws.send(JSON.stringify({ kind: 'error', message: 'Too many messages — slow down' }));
        if (count > MAX_MESSAGES_PER_10S * 2) ws.close(1008, 'rate limit');
        return;
      }
      let msg: { kind?: string; command?: unknown };
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }
      if (msg.kind !== 'command' || !isCommand(msg.command)) return;
      const command = msg.command;
      handleCommand(command, world, runtime).catch((err) => {
        log(`command ${command.type} failed: ${(err as Error).message}`);
        ws.send(JSON.stringify({ kind: 'error', message: `${command.type} failed — not saved` }));
      });
    });
    ws.on('close', () => clients.delete(ws));
  });

  server.listen(PORT, HOST, () => log(`ws://${HOST}:${PORT}${TOKEN ? ' (token required)' : ''} · persistence: ${store.kind} · LLM: ${llm ? llm.id : 'none (agents stay idle)'}`));

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
