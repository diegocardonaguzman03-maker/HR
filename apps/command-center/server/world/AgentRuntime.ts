// Runs agent work through a real LLM and records it as events.
// Agents look busy only while a request is actually in flight.
import { uid } from '@/services/ids';
import type { AgentTask, ID } from '@/types/domain';
import type { WorldEvent } from '@/types/events';
import type { ChatTurn, LLMAdapter } from '../../src/integrations/types';
import type { WorldService } from './WorldService';

// Persona prompts. Keep ids in sync with src/data/agents.ts.
export const PERSONAS: Record<string, { name: string; role: string; focus: string }> = {
  aria: { name: 'ARIA', role: 'Executive Assistant / Orchestrator', focus: 'prioritisation, routing work to other agents and concise briefings' },
  atlas: { name: 'ATLAS', role: 'Strategy Agent', focus: 'business cases, architecture options and executive recommendations' },
  forge: { name: 'FORGE', role: 'Industrial Learning Agent', focus: 'OJT, work instructions and technical training for steel and mining' },
  scout: { name: 'SCOUT', role: 'Research Agent', focus: 'benchmarks and evidence-based research with sources' },
  talent: { name: 'TALENT', role: 'Talent Intelligence Agent', focus: 'recruiting, pipelines, succession and workforce planning' },
  nexus: { name: 'NEXUS', role: 'Data & Analytics Agent', focus: 'KPIs, data models and analytics' },
  praxis: { name: 'PRAXIS', role: 'Praxia Strategy Agent', focus: 'positioning, offers and thought-leadership content for Praxia' },
  ledger: { name: 'LEDGER', role: 'Financial Agent', focus: 'budgets, cash-flow models and ROI' },
};

const ev = <T extends WorldEvent['type']>(type: T, payload: Extract<WorldEvent, { type: T }>['payload'], source: WorldEvent['source'] = 'real') =>
  ({ id: uid('ev'), ts: Date.now(), source, type, payload }) as Extract<WorldEvent, { type: T }>;

export class AgentRuntime {
  constructor(private world: WorldService, private llm: LLMAdapter | null) {}

  private systemPrompt(agentId: ID): string {
    const a = this.world.state.agents[agentId];
    const p = PERSONAS[agentId] ?? { name: a?.name ?? agentId.toUpperCase(), role: a?.role ?? 'Assistant', focus: a?.specialization ?? 'general help' };
    const memory = a?.memory.length ? `\nWhat you remember: ${a.memory.join('; ')}.` : '';
    return `You are ${p.name}, the ${p.role} in Francisco's command center. You focus on ${p.focus}. Answer concisely and concretely. If you need a decision from Francisco, say so explicitly.${memory}`;
  }

  /** Conversation history from the persisted world (survives restarts). */
  private history(conversationId: ID): ChatTurn[] {
    const s = this.world.state;
    const c = s.conversations[conversationId];
    if (!c) return [];
    const turns: ChatTurn[] = [];
    for (const id of c.messageIds) {
      const m = s.messages[id];
      if (!m || m.role === 'system') continue;
      const role = m.role === 'user' ? 'user' : 'assistant';
      if (!turns.length && role === 'assistant') continue; // must start with the user
      const last = turns[turns.length - 1];
      if (last?.role === role) last.content += `\n\n${m.text}`;
      else turns.push({ role, content: m.text });
    }
    return turns;
  }

  async ensureConversation(conversationId: ID, agentId: ID, projectId: ID | null, title: string) {
    await this.world.run((s) => (s.conversations[conversationId] ? [] : [ev('conversation.created', { conversationId, agentId, projectId, title }, 'user')]));
  }

  /** Record Francisco's message and, if an LLM is configured, run the agent on it. */
  async respond(agentId: ID, conversationId: ID, text: string, opts: { taskTitle?: string; projectId?: ID | null; attachments?: { name: string; size: number }[] } = {}) {
    await this.world.commit([
      ev('message.sent', { message: { id: uid('msg'), conversationId, role: 'user', text, ts: Date.now(), attachments: opts.attachments?.map((a) => ({ fileId: '', name: a.name })) } }, 'user'),
    ]);
    const agent = this.world.state.agents[agentId];
    if (!agent) return;
    if (!this.llm) {
      await this.world.commit([
        ev('message.sent', { message: { id: uid('msg'), conversationId, role: 'system', text: 'No AI provider is configured on the gateway (set ANTHROPIC_API_KEY). The agent stays idle.', ts: Date.now() } }),
      ]);
      return;
    }
    if (agent.state === 'paused') {
      await this.world.commit([ev('message.sent', { message: { id: uid('msg'), conversationId, role: 'system', text: `${agent.name} is paused. Resume the agent to run this request.`, ts: Date.now() } })]);
      return;
    }

    const conv = this.world.state.conversations[conversationId];
    const task: AgentTask = {
      id: uid('t'),
      title: opts.taskTitle ?? `Responding: ${text.slice(0, 60)}`,
      projectId: opts.projectId ?? conv?.projectId ?? null,
      state: 'working',
      progress: 0,
      startedAt: Date.now(),
      priority: 'normal',
    };
    await this.world.commit([ev('agent.task_started', { agentId, task })]);
    try {
      const reply = await this.llm.complete({ system: this.systemPrompt(agentId), messages: this.history(conversationId) });
      await this.world.commit([
        ev('message.sent', { message: { id: uid('msg'), conversationId, role: 'agent', agentId, text: reply, ts: Date.now(), source: 'real' } }),
        ev('agent.task_completed', { agentId, taskId: task.id, projectId: task.projectId, summary: opts.taskTitle ?? 'a reply' }),
      ]);
      setTimeout(() => {
        void this.world.run((s) =>
          s.agents[agentId]?.state === 'completed' ? [ev('agent.state_changed', { agentId, state: 'idle', note: 'Finished — waiting for the next request' })] : [],
        );
      }, 1500);
    } catch (err) {
      await this.world.commit([ev('agent.blocked', { agentId, reason: `LLM error: ${(err as Error).message.slice(0, 160)}` })]);
    }
  }
}
