// Event-driven world contract.
// Providers (mock or real) emit WorldEvents. The store reduces them into state,
// and the game layer renders that state. Nothing else mutates domain state.
//
// User intent travels the other way as Commands: UI → provider.dispatch(command).

import type {
  ActivitySource,
  Agent,
  AgentState,
  AgentTask,
  AppNotification,
  Decision,
  FileDoc,
  ID,
  Message,
  Mission,
  MissionStatus,
  Priority,
  Project,
  ProjectStatus,
  Squad,
} from './domain';

interface Base<T extends string, P> {
  id: ID;
  type: T;
  ts: number;
  source: ActivitySource | 'user';
  payload: P;
}

export type WorldEvent =
  | Base<'agent.task_started', { agentId: ID; task: AgentTask }>
  | Base<'agent.task_progress', { agentId: ID; progress: number; note?: string }>
  | Base<'agent.task_completed', { agentId: ID; taskId: ID; projectId: ID | null; missionId?: ID | null; summary: string }>
  | Base<'agent.state_changed', { agentId: ID; state: AgentState; note?: string }>
  | Base<'agent.waiting_for_user', { agentId: ID; projectId: ID | null; question: string; decisionId?: ID }>
  | Base<'agent.blocked', { agentId: ID; reason: string }>
  | Base<'agent.paused', { agentId: ID }>
  | Base<'agent.resumed', { agentId: ID }>
  | Base<'agent.assigned', { agentId: ID; projectId: ID }>
  | Base<'agent.task_queued', { agentId: ID; task: AgentTask }>
  | Base<'agent.created', { agent: Agent }>
  | Base<'message.sent', { message: Message }>
  | Base<'conversation.created', { conversationId: ID; agentId: ID; projectId: ID | null; title: string }>
  | Base<'project.created', { project: Project }>
  | Base<'project.status_changed', { projectId: ID; status: ProjectStatus }>
  | Base<'project.priority_changed', { projectId: ID; priority: Priority }>
  | Base<'project.progress_changed', { projectId: ID; progress: number }>
  | Base<'project.construction_finished', { projectId: ID }>
  | Base<'mission.created', { mission: Mission }>
  | Base<'mission.status_changed', { missionId: ID; status: MissionStatus; progress?: number }>
  | Base<'file.added', { file: FileDoc; conversationId?: ID }>
  | Base<'decision.requested', { decision: Decision }>
  | Base<'decision.made', { decisionId: ID; status: Decision['status']; note?: string }>
  | Base<'squad.formed', { squad: Squad }>
  | Base<'squad.message', { squadId: ID; agentId: ID; text: string }>
  | Base<'squad.disbanded', { squadId: ID }>
  | Base<'notification.created', { notification: AppNotification }>;

export type WorldEventType = WorldEvent['type'];
export type EventOf<T extends WorldEventType> = Extract<WorldEvent, { type: T }>;

/** Commands = what Francisco asks the system to do. */
export type Command =
  | { type: 'chat.send'; conversationId: ID; agentId: ID; text: string; attachments?: { name: string; size: number }[] }
  | { type: 'conversation.start'; conversationId: ID; agentId: ID; projectId: ID | null; title?: string; firstMessage?: string }
  | { type: 'team.start'; conversationId: ID; agentIds: ID[]; request: string; projectId: ID | null }
  | { type: 'agent.assign_task'; agentId: ID; projectId: ID; title: string; priority: Priority }
  | { type: 'agent.pause'; agentId: ID }
  | { type: 'agent.resume'; agentId: ID }
  | { type: 'agent.move'; agentId: ID; projectId: ID }
  | { type: 'agent.create'; agentId: ID; name: string; role: string; color: number; homeProjectId: ID; skills: string[] }
  | { type: 'project.create'; projectId: ID; draft: ProjectDraft }
  | { type: 'project.archive'; projectId: ID }
  | { type: 'project.set_priority'; projectId: ID; priority: Priority }
  | { type: 'project.set_status'; projectId: ID; status: ProjectStatus }
  | { type: 'decision.resolve'; decisionId: ID; status: 'approved' | 'rejected' | 'revision'; note?: string }
  | { type: 'squad.form'; projectId: ID; objective: string; agentIds: ID[] }
  | { type: 'deliverable.create'; agentId: ID; projectId: ID | null; title: string }
  | { type: 'file.add'; projectId: ID | null; files: { name: string; size: number }[] };

export interface ProjectDraft {
  name: string;
  territory: Project['territory'];
  objective: string;
  kind: Project['kind'];
  agentIds: ID[];
  autoAssign: boolean;
  files: { name: string; size: number }[];
  context: string;
  priority: Priority;
}

export type CommandType = Command['type'];
