// Routes a client Command: structural commands become events directly; agent
// work goes to the AgentRuntime. Unsupported agent orchestration is reported
// honestly instead of being simulated.
import { uid } from '@/services/ids';
import { applyStructuralCommand } from '@/services/structuralCommands';
import type { Command, WorldEvent } from '@/types/events';
import type { AgentRuntime } from './AgentRuntime';
import type { WorldService } from './WorldService';

export async function handleCommand(cmd: Command, world: WorldService, runtime: AgentRuntime): Promise<void> {
  let structural = false;
  // `sink` is re-pointed for delayed follow-ups (e.g. construction finished),
  // which are committed as their own transaction when the timer fires.
  let sink: WorldEvent[] = [];
  await world.run((s) => {
    const out: WorldEvent[] = [];
    sink = out;
    structural = applyStructuralCommand(cmd, s, (e) => sink.push(e), (ms, fn) => {
      setTimeout(() => {
        void world.run(() => {
          const later: WorldEvent[] = [];
          sink = later;
          fn();
          return later;
        });
      }, ms);
    });
    return out;
  });
  if (structural) return;

  switch (cmd.type) {
    case 'conversation.start':
      await runtime.ensureConversation(cmd.conversationId, cmd.agentId, cmd.projectId, cmd.title ?? 'Conversation');
      if (cmd.firstMessage) await runtime.respond(cmd.agentId, cmd.conversationId, cmd.firstMessage);
      return;
    case 'chat.send':
      await runtime.respond(cmd.agentId, cmd.conversationId, cmd.text, { attachments: cmd.attachments });
      return;
    case 'team.start': {
      const lead = cmd.agentIds[0];
      if (!lead) return;
      await runtime.ensureConversation(cmd.conversationId, lead, cmd.projectId, cmd.request.slice(0, 60));
      await runtime.respond(lead, cmd.conversationId, cmd.request, { projectId: cmd.projectId });
      return;
    }
    case 'agent.assign_task': {
      const conversationId = `c-missions-${cmd.agentId}`;
      const name = world.state.agents[cmd.agentId]?.name ?? cmd.agentId;
      await runtime.ensureConversation(conversationId, cmd.agentId, cmd.projectId, `${name} · assigned missions`);
      await runtime.respond(cmd.agentId, conversationId, `New mission for ${world.state.projects[cmd.projectId]?.name ?? 'the project'}: ${cmd.title}. Plan it and give me the first result.`, {
        taskTitle: cmd.title,
        projectId: cmd.projectId,
      });
      return;
    }
    case 'deliverable.create': {
      const conversationId = `c-missions-${cmd.agentId}`;
      const name = world.state.agents[cmd.agentId]?.name ?? cmd.agentId;
      await runtime.ensureConversation(conversationId, cmd.agentId, cmd.projectId, `${name} · assigned missions`);
      await runtime.respond(cmd.agentId, conversationId, `Draft the deliverable “${cmd.title}”.`, { taskTitle: cmd.title, projectId: cmd.projectId });
      return;
    }
    case 'squad.form':
      await world.commit([
        {
          id: uid('ev'), ts: Date.now(), source: 'real', type: 'notification.created',
          payload: { notification: { id: uid('n'), kind: 'info', title: 'Squads are not available on the live gateway yet', body: 'Multi-agent orchestration is a Phase 3 item; talk to the agents one at a time for now.', ts: Date.now(), read: false, priority: 'high' } },
        },
      ]);
      return;
    default:
      return;
  }
}
