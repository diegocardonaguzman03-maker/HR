// Reference agent gateway for RealAgentProvider.
//
//   node --experimental-strip-types server/gateway.ts      (npm run gateway)
//
// Speaks the WebSocket protocol in src/providers/real/RealAgentProvider.ts:
//   client → { kind: 'command', command }   server → { kind: 'event', event }
//
// Agents only show activity while this process is actually calling an LLM.
// Without ANTHROPIC_API_KEY (or OPENAI_API_KEY) nothing runs and every agent
// stays IDLE — the gateway never fabricates work.
import { WebSocketServer, type WebSocket } from 'ws';
import { createClaudeAdapter } from '../src/integrations/llm/claude.ts';
import { createOpenAIAdapter } from '../src/integrations/llm/openai.ts';
import type { ChatTurn, LLMAdapter } from '../src/integrations/types.ts';

const PORT = Number(process.env.PORT ?? 8787);

// Persona prompts. Keep ids in sync with src/data/agents.ts.
const PERSONAS: Record<string, { name: string; role: string; focus: string }> = {
  aria: { name: 'ARIA', role: 'Executive Assistant / Orchestrator', focus: 'prioritisation, routing work to other agents and concise briefings' },
  atlas: { name: 'ATLAS', role: 'Strategy Agent', focus: 'business cases, architecture options and executive recommendations' },
  forge: { name: 'FORGE', role: 'Industrial Learning Agent', focus: 'OJT, work instructions and technical training for steel and mining' },
  scout: { name: 'SCOUT', role: 'Research Agent', focus: 'benchmarks and evidence-based research with sources' },
  talent: { name: 'TALENT', role: 'Talent Intelligence Agent', focus: 'recruiting, pipelines, succession and workforce planning' },
  nexus: { name: 'NEXUS', role: 'Data & Analytics Agent', focus: 'KPIs, data models and analytics' },
  praxis: { name: 'PRAXIS', role: 'Praxia Strategy Agent', focus: 'positioning, offers and thought-leadership content for Praxia' },
  ledger: { name: 'LEDGER', role: 'Financial Agent', focus: 'budgets, cash-flow models and ROI' },
};

function pickLLM(): LLMAdapter | null {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return createClaudeAdapter(undefined, process.env.AGENT_MODEL || 'claude-opus-5-5');
  if (process.env.OPENAI_API_KEY) return createOpenAIAdapter(process.env.OPENAI_API_KEY, process.env.AGENT_MODEL || undefined);
  return null;
}

const llm = pickLLM();
const history = new Map<string, ChatTurn[]>(); // conversationId → turns
const convAgent = new Map<string, string>(); // conversationId → agentId
const clients = new Set<WebSocket>();
let seq = 0;

type Json = Record<string, unknown>;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${(++seq).toString(36)}`;

function broadcast(type: string, payload: Json, source: 'real' | 'user' = 'real') {
  const msg = JSON.stringify({ kind: 'event', event: { id: id('ev'), ts: Date.now(), source, type, payload } });
  for (const c of clients) if (c.readyState === c.OPEN) c.send(msg);
}

function systemPrompt(agentId: string): string {
  const p = PERSONAS[agentId] ?? { name: agentId.toUpperCase(), role: 'Assistant', focus: 'general help' };
  return `You are ${p.name}, the ${p.role} in Francisco's command center. You focus on ${p.focus}. Answer concisely and concretely. If you need a decision from Francisco, say so explicitly.`;
}

async function runAgent(agentId: string, conversationId: string, text: string, taskTitle?: string) {
  const turns = history.get(conversationId) ?? [];
  turns.push({ role: 'user', content: text });
  history.set(conversationId, turns);
  broadcast('message.sent', { message: { id: id('msg'), conversationId, role: 'user', text, ts: Date.now() } }, 'user');

  if (!llm) {
    broadcast('message.sent', {
      message: { id: id('msg'), conversationId, role: 'system', text: 'No AI provider is configured on the gateway (set ANTHROPIC_API_KEY). The agent stays idle.', ts: Date.now() },
    });
    return;
  }

  const taskId = id('t');
  broadcast('agent.task_started', {
    agentId,
    task: { id: taskId, title: taskTitle ?? `Responding: ${text.slice(0, 60)}`, projectId: null, state: 'working', progress: 0, startedAt: Date.now(), priority: 'normal' },
  });
  try {
    const reply = await llm.complete({ system: systemPrompt(agentId), messages: turns });
    turns.push({ role: 'assistant', content: reply });
    broadcast('message.sent', { message: { id: id('msg'), conversationId, role: 'agent', agentId, text: reply, ts: Date.now(), source: 'real' } });
    broadcast('agent.task_completed', { agentId, taskId, projectId: null, summary: taskTitle ?? 'a reply' });
  } catch (err) {
    broadcast('agent.blocked', { agentId, reason: `LLM error: ${(err as Error).message.slice(0, 160)}` });
    return;
  }
  setTimeout(() => broadcast('agent.state_changed', { agentId, state: 'idle', note: 'Finished — waiting for the next request' }), 1500);
}

async function handle(cmd: Json & { type: string }) {
  switch (cmd.type) {
    case 'conversation.start': {
      const { conversationId, agentId, projectId, title, firstMessage } = cmd as Json & { conversationId: string; agentId: string; projectId: string | null; title?: string; firstMessage?: string };
      convAgent.set(conversationId, agentId);
      broadcast('conversation.created', { conversationId, agentId, projectId, title: title ?? 'Conversation' }, 'user');
      if (firstMessage) await runAgent(agentId, conversationId, firstMessage);
      return;
    }
    case 'chat.send': {
      const { conversationId, agentId, text } = cmd as Json & { conversationId: string; agentId: string; text: string };
      convAgent.set(conversationId, agentId);
      await runAgent(agentId, conversationId, text);
      return;
    }
    case 'team.start': {
      const { conversationId, agentIds, request, projectId } = cmd as Json & { conversationId: string; agentIds: string[]; request: string; projectId: string | null };
      const lead = agentIds[0];
      if (!lead) return;
      broadcast('conversation.created', { conversationId, agentId: lead, projectId, title: request.slice(0, 60) }, 'user');
      await runAgent(lead, conversationId, request);
      return;
    }
    case 'agent.assign_task': {
      const { agentId, title } = cmd as Json & { agentId: string; title: string };
      const conversationId = `gw-${agentId}`;
      if (!convAgent.has(conversationId)) {
        convAgent.set(conversationId, agentId);
        broadcast('conversation.created', { conversationId, agentId, projectId: null, title: `${PERSONAS[agentId]?.name ?? agentId} · assigned missions` }, 'user');
      }
      await runAgent(agentId, conversationId, `New mission: ${title}. Plan it and give me the first result.`, title);
      return;
    }
    case 'agent.pause':
      broadcast('agent.paused', { agentId: cmd.agentId }, 'user');
      return;
    case 'agent.resume':
      broadcast('agent.resumed', { agentId: cmd.agentId }, 'user');
      return;
    default:
      // World-structure commands (projects, files, decisions…) are applied by the
      // client itself; the gateway is where you would persist them (PostgreSQL).
      return;
  }
}

const wss = new WebSocketServer({ port: PORT });
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ kind: 'hello', agents: Object.keys(PERSONAS) }));
  ws.on('message', (raw) => {
    let msg: { kind?: string; command?: Json & { type: string } };
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    if (msg.kind === 'command' && msg.command) handle(msg.command).catch((e) => console.error('[gateway]', e));
  });
  ws.on('close', () => clients.delete(ws));
});

console.log(`[gateway] ws://localhost:${PORT} · LLM: ${llm ? llm.id : 'none (agents stay idle)'}`);
