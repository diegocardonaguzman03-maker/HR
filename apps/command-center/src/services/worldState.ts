// Pure, framework-free world state + event reducer. Everything the UI and the
// game layer show is derived from this state, and the state only changes by
// reducing WorldEvents. This is what makes mock and real providers swappable.
import { seedAgents, CITADEL_ID } from '@/data/agents';
import { seedProjects } from '@/data/projects';
import {
  seedActivity,
  seedCalendar,
  seedConversations,
  seedDecisions,
  seedFiles,
  seedInbox,
  seedMissions,
  seedNotifications,
  seedSquads,
} from '@/data/seed';
import { TERRITORIES } from '@/data/territories';
import type {
  ActivityCategory,
  ActivityItem,
  Agent,
  AppNotification,
  CalendarEvent,
  Conversation,
  Decision,
  FileDoc,
  ID,
  InboxItem,
  Message,
  Mission,
  Project,
  Squad,
  Territory,
} from '@/types/domain';
import type { WorldEvent } from '@/types/events';
import { citadelAnchor, doorOf, projectAnchor } from './geometry';

export interface WorldState {
  territories: Territory[];
  projects: Record<ID, Project>;
  missions: Record<ID, Mission>;
  agents: Record<ID, Agent>;
  conversations: Record<ID, Conversation>;
  messages: Record<ID, Message>;
  files: Record<ID, FileDoc>;
  decisions: Record<ID, Decision>;
  squads: Record<ID, Squad>;
  notifications: AppNotification[];
  activity: ActivityItem[];
  calendar: CalendarEvent[];
  inbox: InboxItem[];
  /** Append-only event log (capped) — enables history, replay and audit. */
  events: WorldEvent[];
}

const byId = <T extends { id: ID }>(xs: T[]): Record<ID, T> => Object.fromEntries(xs.map((x) => [x.id, x]));

export function createSeedState(): WorldState {
  const projects = seedProjects();
  const projectMap = byId(projects);
  const homeOf = (pid: string): [number, number] => {
    const p = projectMap[pid];
    return doorOf(p ? projectAnchor(p) : citadelAnchor());
  };
  const agents = seedAgents(homeOf);
  const missions = seedMissions();
  const files = seedFiles();
  const decisions = seedDecisions();
  const { conversations, messages } = seedConversations();

  for (const m of missions) projectMap[m.projectId]?.missionIds.push(m.id);
  for (const f of files) if (f.projectId) projectMap[f.projectId]?.fileIds.push(f.id);
  for (const d of decisions) if (d.projectId) projectMap[d.projectId]?.decisionIds.push(d.id);
  for (const a of agents) {
    const pids = new Set([a.homeProjectId, a.currentTask?.projectId, ...a.taskQueue.map((t) => t.projectId)]);
    for (const pid of pids) if (pid && projectMap[pid] && !projectMap[pid].agentIds.includes(a.id)) projectMap[pid].agentIds.push(a.id);
    a.conversationIds = conversations.filter((c) => c.agentId === a.id).map((c) => c.id);
  }
  for (const m of missions) for (const aid of m.agentIds) if (projectMap[m.projectId] && !projectMap[m.projectId].agentIds.includes(aid)) projectMap[m.projectId].agentIds.push(aid);

  return {
    territories: TERRITORIES,
    projects: projectMap,
    missions: byId(missions),
    agents: byId(agents),
    conversations: byId(conversations),
    messages: byId(messages),
    files: byId(files),
    decisions: byId(decisions),
    squads: byId(seedSquads()),
    notifications: seedNotifications(),
    activity: seedActivity(),
    calendar: seedCalendar(),
    inbox: seedInbox(),
    events: [],
  };
}

export function createEmptyState(): WorldState {
  // Used by the real provider: territories exist, everything else arrives as events/snapshot.
  const s = createSeedState();
  return { ...s, agents: Object.fromEntries(Object.values(s.agents).map((a) => [a.id, idleAgent(a)])), activity: [], events: [] };
}

export function idleAgent(a: Agent): Agent {
  return { ...a, state: 'idle', currentTask: null, activitySource: null, waitingFor: null, blockedReason: null, squadId: null };
}

// ─────────────────────────── reducer ───────────────────────────

const MAX_EVENTS = 500;
const MAX_ACTIVITY = 300;

function patchAgent(s: WorldState, id: ID, fn: (a: Agent) => Agent): WorldState {
  const a = s.agents[id];
  if (!a) return s;
  return { ...s, agents: { ...s.agents, [id]: fn(a) } };
}
function patchProject(s: WorldState, id: ID | null | undefined, fn: (p: Project) => Project): WorldState {
  if (!id) return s;
  const p = s.projects[id];
  if (!p) return s;
  return { ...s, projects: { ...s.projects, [id]: fn(p) } };
}
function patchMission(s: WorldState, id: ID | null | undefined, fn: (m: Mission) => Mission): WorldState {
  if (!id) return s;
  const m = s.missions[id];
  if (!m) return s;
  return { ...s, missions: { ...s.missions, [id]: fn(m) } };
}
const pushRecent = (a: Agent, text: string): string[] => [text, ...a.recentActivities].slice(0, 12);
const addUnique = (xs: ID[], x: ID): ID[] => (xs.includes(x) ? xs : [...xs, x]);

export function reduce(state: WorldState, e: WorldEvent): WorldState {
  let s = reduceEntities(state, e);
  const item = activityFromEvent(s, e);
  s = {
    ...s,
    events: [...s.events.slice(-(MAX_EVENTS - 1)), e],
    activity: item ? [item, ...s.activity].slice(0, MAX_ACTIVITY) : s.activity,
  };
  return s;
}

function reduceEntities(s: WorldState, e: WorldEvent): WorldState {
  const src = e.source === 'user' ? undefined : e.source;
  switch (e.type) {
    case 'agent.task_started': {
      const { agentId, task } = e.payload;
      s = patchAgent(s, agentId, (a) => ({
        ...a,
        currentTask: task,
        state: a.state === 'paused' ? 'paused' : task.state,
        stateBeforePause: a.state === 'paused' ? task.state : a.stateBeforePause,
        taskQueue: a.taskQueue.filter((t) => t.id !== task.id),
        activitySource: src ?? a.activitySource,
        waitingFor: null,
        blockedReason: null,
        lastActivityAt: e.ts,
        recentActivities: pushRecent(a, `Started: ${task.title}`),
      }));
      s = patchProject(s, task.projectId, (p) => ({ ...p, agentIds: addUnique(p.agentIds, agentId) }));
      s = patchMission(s, task.missionId, (m) => ({ ...m, status: m.status === 'pending' ? 'active' : m.status, agentIds: addUnique(m.agentIds, agentId) }));
      return s;
    }
    case 'agent.task_progress':
      return patchAgent(s, e.payload.agentId, (a) =>
        a.currentTask ? { ...a, currentTask: { ...a.currentTask, progress: e.payload.progress }, lastActivityAt: e.ts } : a,
      );
    case 'agent.task_completed': {
      const { agentId, summary } = e.payload;
      return patchAgent(s, agentId, (a) => ({
        ...a,
        state: 'completed',
        currentTask: null,
        lastActivityAt: e.ts,
        performance: { ...a.performance, missionsCompleted: a.performance.missionsCompleted + 1 },
        recentActivities: pushRecent(a, `Completed: ${summary}`),
      }));
    }
    case 'agent.state_changed':
      return patchAgent(s, e.payload.agentId, (a) => ({
        ...a,
        state: e.payload.state,
        activitySource: e.payload.state === 'idle' ? null : src ?? a.activitySource,
        currentTask: e.payload.state === 'idle' ? null : a.currentTask,
        waitingFor: e.payload.state === 'waiting' ? a.waitingFor : null,
        blockedReason: e.payload.state === 'blocked' ? a.blockedReason : null,
        lastActivityAt: e.ts,
        recentActivities: e.payload.note ? pushRecent(a, e.payload.note) : a.recentActivities,
      }));
    case 'agent.waiting_for_user':
      return patchAgent(s, e.payload.agentId, (a) => ({
        ...a,
        state: 'waiting',
        waitingFor: { question: e.payload.question, decisionId: e.payload.decisionId },
        lastActivityAt: e.ts,
        activitySource: src ?? a.activitySource,
        recentActivities: pushRecent(a, 'Requested Francisco’s input'),
      }));
    case 'agent.blocked':
      return patchAgent(s, e.payload.agentId, (a) => ({
        ...a,
        state: 'blocked',
        blockedReason: e.payload.reason,
        lastActivityAt: e.ts,
        recentActivities: pushRecent(a, `Blocked: ${e.payload.reason}`),
      }));
    case 'agent.paused':
      return patchAgent(s, e.payload.agentId, (a) =>
        a.state === 'paused' ? a : { ...a, stateBeforePause: a.state, state: 'paused', recentActivities: pushRecent(a, 'Paused by Francisco') },
      );
    case 'agent.resumed':
      return patchAgent(s, e.payload.agentId, (a) =>
        a.state !== 'paused'
          ? a
          : {
              ...a,
              state: a.stateBeforePause && a.stateBeforePause !== 'paused' ? a.stateBeforePause : a.currentTask ? a.currentTask.state : 'idle',
              stateBeforePause: undefined,
              recentActivities: pushRecent(a, 'Resumed by Francisco'),
            },
      );
    case 'agent.assigned':
      return patchProject(s, e.payload.projectId, (p) => ({ ...p, agentIds: addUnique(p.agentIds, e.payload.agentId) }));
    case 'agent.task_queued':
      s = patchAgent(s, e.payload.agentId, (a) => ({ ...a, taskQueue: [...a.taskQueue, e.payload.task] }));
      return patchProject(s, e.payload.task.projectId, (p) => ({ ...p, agentIds: addUnique(p.agentIds, e.payload.agentId) }));
    case 'agent.created':
      return { ...s, agents: { ...s.agents, [e.payload.agent.id]: e.payload.agent } };
    case 'message.sent': {
      const m = e.payload.message;
      const c = s.conversations[m.conversationId];
      if (!c) return s;
      return {
        ...s,
        messages: { ...s.messages, [m.id]: m },
        conversations: { ...s.conversations, [c.id]: { ...c, messageIds: [...c.messageIds, m.id], updatedAt: m.ts } },
      };
    }
    case 'conversation.created': {
      const { conversationId, agentId, projectId, title } = e.payload;
      if (s.conversations[conversationId]) return s;
      s = { ...s, conversations: { ...s.conversations, [conversationId]: { id: conversationId, agentId, projectId, title, messageIds: [], updatedAt: e.ts } } };
      return patchAgent(s, agentId, (a) => ({ ...a, conversationIds: addUnique(a.conversationIds, conversationId) }));
    }
    case 'project.created':
      return { ...s, projects: { ...s.projects, [e.payload.project.id]: e.payload.project } };
    case 'project.status_changed':
      return patchProject(s, e.payload.projectId, (p) => ({ ...p, status: e.payload.status }));
    case 'project.priority_changed':
      return patchProject(s, e.payload.projectId, (p) => ({ ...p, priority: e.payload.priority }));
    case 'project.progress_changed':
      return patchProject(s, e.payload.projectId, (p) => ({ ...p, progress: Math.max(0, Math.min(100, e.payload.progress)) }));
    case 'project.construction_finished':
      return patchProject(s, e.payload.projectId, (p) => ({ ...p, underConstruction: false }));
    case 'mission.created': {
      const m = e.payload.mission;
      s = { ...s, missions: { ...s.missions, [m.id]: m } };
      return patchProject(s, m.projectId, (p) => ({ ...p, missionIds: addUnique(p.missionIds, m.id) }));
    }
    case 'mission.status_changed':
      return patchMission(s, e.payload.missionId, (m) => ({ ...m, status: e.payload.status, progress: e.payload.progress ?? m.progress }));
    case 'file.added': {
      const f = e.payload.file;
      s = { ...s, files: { ...s.files, [f.id]: f } };
      return patchProject(s, f.projectId, (p) => ({ ...p, fileIds: addUnique(p.fileIds, f.id) }));
    }
    case 'decision.requested': {
      const d = e.payload.decision;
      s = { ...s, decisions: { ...s.decisions, [d.id]: d } };
      return patchProject(s, d.projectId, (p) => ({ ...p, decisionIds: addUnique(p.decisionIds, d.id) }));
    }
    case 'decision.made': {
      const d = s.decisions[e.payload.decisionId];
      if (!d) return s;
      return { ...s, decisions: { ...s.decisions, [d.id]: { ...d, status: e.payload.status, decidedAt: e.ts } } };
    }
    case 'squad.formed': {
      const q = e.payload.squad;
      s = { ...s, squads: { ...s.squads, [q.id]: q } };
      for (const aid of q.agentIds) s = patchAgent(s, aid, (a) => ({ ...a, squadId: q.id, collaborators: Array.from(new Set([...a.collaborators, ...q.agentIds.filter((x) => x !== aid)])) }));
      return s;
    }
    case 'squad.message': {
      const q = s.squads[e.payload.squadId];
      if (!q) return s;
      return { ...s, squads: { ...s.squads, [q.id]: { ...q, discussion: [...q.discussion, { agentId: e.payload.agentId, text: e.payload.text, ts: e.ts }] } } };
    }
    case 'squad.disbanded': {
      const q = s.squads[e.payload.squadId];
      if (!q) return s;
      s = { ...s, squads: { ...s.squads, [q.id]: { ...q, active: false } } };
      for (const aid of q.agentIds) s = patchAgent(s, aid, (a) => (a.squadId === q.id ? { ...a, squadId: null } : a));
      return s;
    }
    case 'notification.created':
      return { ...s, notifications: [e.payload.notification, ...s.notifications].slice(0, 100) };
    case 'notification.read': {
      const ids = e.payload.ids;
      return { ...s, notifications: s.notifications.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)) };
    }
    default:
      return s;
  }
}

// ─────────────────────────── activity feed ───────────────────────────

function categoryOf(s: WorldState, projectId?: ID | null): ActivityCategory {
  const t = projectId ? s.projects[projectId]?.territory : undefined;
  if (t === 'praxia') return 'praxia';
  if (t === 'personal') return 'personal';
  if (t === 'frontier') return 'frontier';
  return 'work';
}

export function activityFromEvent(s: WorldState, e: WorldEvent): ActivityItem | null {
  const name = (id: ID) => s.agents[id]?.name ?? id;
  const base = (text: string, x: Partial<Omit<ActivityItem, 'projectId'>> & { projectId?: ID | null }): ActivityItem => ({
    id: `act-${e.id}`,
    ts: e.ts,
    text,
    eventType: e.type,
    category: categoryOf(s, x.projectId),
    critical: false,
    waitingForMe: false,
    completed: false,
    source: e.source,
    ...x,
    projectId: x.projectId ?? undefined,
  });
  switch (e.type) {
    case 'agent.task_started':
      return base(`${name(e.payload.agentId)} started “${e.payload.task.title}”.`, {
        agentId: e.payload.agentId,
        projectId: e.payload.task.projectId,
        critical: e.payload.task.priority === 'critical',
      });
    case 'agent.task_completed':
      return base(`${name(e.payload.agentId)} completed ${e.payload.summary}.`, { agentId: e.payload.agentId, projectId: e.payload.projectId, completed: true });
    case 'agent.waiting_for_user':
      return base(`${name(e.payload.agentId)} requested Francisco’s decision.`, { agentId: e.payload.agentId, projectId: e.payload.projectId, waitingForMe: true, critical: true });
    case 'agent.blocked':
      return base(`${name(e.payload.agentId)} is blocked: ${e.payload.reason}`, {
        agentId: e.payload.agentId,
        projectId: s.agents[e.payload.agentId]?.currentTask?.projectId,
        critical: true,
      });
    case 'agent.paused':
      return base(`${name(e.payload.agentId)} paused.`, { agentId: e.payload.agentId });
    case 'agent.resumed':
      return base(`${name(e.payload.agentId)} resumed.`, { agentId: e.payload.agentId });
    case 'agent.created':
      return base(`New agent ${e.payload.agent.name} joined.`, { agentId: e.payload.agent.id });
    case 'project.created':
      return base(`Project “${e.payload.project.name}” launched — ${e.payload.project.structure} under construction.`, {
        projectId: e.payload.project.id,
        critical: e.payload.project.priority === 'critical',
      });
    case 'project.status_changed':
      return base(`${s.projects[e.payload.projectId]?.name ?? 'Project'} is now ${e.payload.status}.`, {
        projectId: e.payload.projectId,
        critical: e.payload.status === 'blocked',
        completed: e.payload.status === 'completed',
      });
    case 'file.added':
      return base(`${e.payload.file.agentId ? name(e.payload.file.agentId) : 'Francisco'} added ${e.payload.file.name}.`, {
        agentId: e.payload.file.agentId ?? undefined,
        projectId: e.payload.file.projectId,
        completed: !!e.payload.file.agentId,
      });
    case 'decision.made':
      return base(`Francisco ${e.payload.status === 'revision' ? 'requested a revision of' : e.payload.status} “${s.decisions[e.payload.decisionId]?.title ?? 'decision'}”.`, {
        projectId: s.decisions[e.payload.decisionId]?.projectId,
      });
    case 'squad.formed':
      return base(`Squad formed: ${e.payload.squad.agentIds.map(name).join(' + ')} — ${e.payload.squad.objective}`, { projectId: e.payload.squad.projectId });
    case 'mission.created':
      return base(`Mission created: ${e.payload.mission.title}`, { projectId: e.payload.mission.projectId });
    default:
      return null;
  }
}

/** Convenience selectors (pure). */
export const selectors = {
  waitingAgents: (s: WorldState) => Object.values(s.agents).filter((a) => a.state === 'waiting'),
  pendingDecisions: (s: WorldState) => Object.values(s.decisions).filter((d) => d.status === 'pending'),
  projectsAtRisk: (s: WorldState) =>
    Object.values(s.projects).filter((p) => p.status === 'blocked' || (p.priority === 'critical' && p.status !== 'completed' && p.status !== 'archived')),
  agentsAt: (s: WorldState, projectId: ID) =>
    Object.values(s.agents).filter((a) => (a.currentTask?.projectId ?? (a.homeProjectId === projectId && a.state === 'idle' ? projectId : null)) === projectId),
  citadelId: CITADEL_ID,
};
