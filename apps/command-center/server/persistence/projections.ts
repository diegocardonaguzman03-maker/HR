// Projections: turn a state transition (prev → next) plus the events that
// caused it into SQL statements for the queryable tables.
//
// Pure — no I/O — so it is unit-tested without a database. Entity tables are
// derived by diffing records by reference (the reducer is immutable, so an
// unchanged record keeps its identity). History tables are derived from events.
import type { WorldState } from '@/services/worldState';
import type { ActivityItem, Agent, AppNotification, Conversation, Decision, FileDoc, Message, Mission, Project, Squad, Territory } from '@/types/domain';
import type { WorldEvent } from '@/types/events';

export interface Statement {
  text: string;
  values: unknown[];
}

const iso = (ms: number | undefined | null) => (ms ? new Date(ms).toISOString() : null);

type Row = Record<string, unknown>;

function upsert(table: string, row: Row, key = 'id'): Statement {
  const cols = Object.keys(row);
  const ph = cols.map((_, i) => `$${i + 1}`);
  const updates = cols.filter((c) => c !== key).map((c) => `${c} = EXCLUDED.${c}`);
  return {
    text: `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${ph.join(', ')}) ON CONFLICT (${key}) DO UPDATE SET ${updates.join(', ')}`,
    values: cols.map((c) => row[c]),
  };
}

function insertIgnore(table: string, row: Row): Statement {
  const cols = Object.keys(row);
  return {
    text: `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) ON CONFLICT DO NOTHING`,
    values: cols.map((c) => row[c]),
  };
}

const del = (table: string, id: string): Statement => ({ text: `DELETE FROM ${table} WHERE id = $1`, values: [id] });

// ───────────── row mappers ─────────────
const rows = {
  territories: (t: Territory): Row => ({ id: t.id, name: t.name, data: t, updated_at: new Date().toISOString() }),
  projects: (p: Project): Row => ({
    id: p.id, territory_id: p.territory, name: p.name, building: p.building, status: p.status, priority: p.priority,
    progress: Math.round(p.progress), tile_x: p.tile[0], tile_y: p.tile[1], data: p, updated_at: new Date().toISOString(),
  }),
  agents: (a: Agent): Row => ({
    id: a.id, name: a.name, role: a.role, state: a.state, territory_id: a.territory, home_project_id: a.homeProjectId,
    current_project_id: a.currentTask?.projectId ?? null, activity_source: a.activitySource, data: a, updated_at: iso(a.lastActivityAt),
  }),
  missions: (m: Mission): Row => ({
    id: m.id, project_id: m.projectId, title: m.title, level: m.level, status: m.status, progress: Math.round(m.progress),
    deadline: m.deadline || null, data: m, updated_at: new Date().toISOString(),
  }),
  conversations: (c: Conversation): Row => ({ id: c.id, agent_id: c.agentId, project_id: c.projectId, title: c.title, data: c, updated_at: iso(c.updatedAt) }),
  messages: (m: Message): Row => ({
    id: m.id, conversation_id: m.conversationId, role: m.role, agent_id: m.agentId ?? null, text: m.text, source: m.source ?? null, ts: iso(m.ts), data: m,
  }),
  files: (f: FileDoc): Row => ({ id: f.id, project_id: f.projectId, agent_id: f.agentId, name: f.name, kind: f.kind, simulated: !!f.simulated, data: f, updated_at: iso(f.updatedAt) }),
  decisions: (d: Decision): Row => ({
    id: d.id, project_id: d.projectId, agent_id: d.agentId, title: d.title, status: d.status, requested_at: iso(d.requestedAt), decided_at: iso(d.decidedAt), data: d,
  }),
  notifications: (n: AppNotification): Row => ({ id: n.id, kind: n.kind, priority: n.priority, read: n.read, ts: iso(n.ts), data: n }),
  squads: (q: Squad): Row => ({ id: q.id, project_id: q.projectId, active: q.active, data: q, updated_at: new Date().toISOString() }),
  activity_logs: (a: ActivityItem): Row => ({
    id: a.id, ts: iso(a.ts), text: a.text, event_type: a.eventType, agent_id: a.agentId ?? null, project_id: a.projectId ?? null,
    category: a.category, critical: a.critical, waiting_for_me: a.waitingForMe, completed: a.completed, source: a.source,
  }),
};

type MapKey = 'projects' | 'agents' | 'missions' | 'conversations' | 'messages' | 'files' | 'decisions' | 'squads';

function diffRecord<T extends { id: string }>(table: MapKey, prev: Record<string, T> | undefined, next: Record<string, T>, toRow: (x: T) => Row, out: Statement[]) {
  if (prev === next) return;
  for (const [id, rec] of Object.entries(next)) if (!prev || prev[id] !== rec) out.push(upsert(table, toRow(rec)));
  if (prev) for (const id of Object.keys(prev)) if (!(id in next)) out.push(del(table, id));
}

function diffList<T extends { id: string }>(table: string, prev: T[] | undefined, next: T[], toRow: (x: T) => Row, out: Statement[]) {
  if (prev === next) return;
  const before = new Map((prev ?? []).map((x) => [x.id, x]));
  for (const rec of next) if (before.get(rec.id) !== rec) out.push(upsert(table, toRow(rec)));
}

function projectAgentLinks(prev: WorldState | null, next: WorldState, out: Statement[]) {
  if (prev && prev.projects === next.projects) return;
  for (const p of Object.values(next.projects)) {
    const before = prev?.projects[p.id];
    if (before && before.agentIds === p.agentIds) continue;
    out.push({ text: 'DELETE FROM project_agents WHERE project_id = $1', values: [p.id] });
    for (const a of p.agentIds)
      out.push({ text: 'INSERT INTO project_agents (project_id, agent_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', values: [p.id, a] });
  }
}

/** History tables are append-only and come straight from events. */
function historyFromEvents(events: WorldEvent[], next: WorldState, out: Statement[]) {
  for (const e of events) {
    const ts = iso(e.ts);
    switch (e.type) {
      case 'agent.task_started': {
        const t = e.payload.task;
        out.push(upsert('tasks', {
          id: t.id, agent_id: e.payload.agentId, project_id: t.projectId, mission_id: t.missionId ?? null, title: t.title, state: t.state,
          status: 'active', priority: t.priority, source: e.source, started_at: ts, completed_at: null,
        }));
        out.push(agentState(e.payload.agentId, next.agents[e.payload.agentId]?.state ?? t.state, e));
        break;
      }
      case 'agent.task_queued': {
        const t = e.payload.task;
        out.push(insertIgnore('tasks', {
          id: t.id, agent_id: e.payload.agentId, project_id: t.projectId, mission_id: t.missionId ?? null, title: t.title, state: t.state,
          status: 'queued', priority: t.priority, source: e.source,
        }));
        break;
      }
      case 'agent.task_completed':
        out.push({ text: `UPDATE tasks SET status = 'completed', completed_at = $2 WHERE id = $1`, values: [e.payload.taskId, ts] });
        out.push(agentState(e.payload.agentId, 'completed', e));
        break;
      case 'agent.state_changed':
        out.push(agentState(e.payload.agentId, e.payload.state, e));
        break;
      case 'agent.waiting_for_user':
        out.push(agentState(e.payload.agentId, 'waiting', e));
        break;
      case 'agent.blocked':
        out.push(agentState(e.payload.agentId, 'blocked', e));
        break;
      case 'agent.paused':
        out.push(agentState(e.payload.agentId, 'paused', e));
        break;
      case 'agent.resumed':
        out.push(agentState(e.payload.agentId, next.agents[e.payload.agentId]?.state ?? 'idle', e));
        break;
    }
  }
}

function agentState(agentId: string, state: string, e: WorldEvent): Statement {
  return {
    text: 'INSERT INTO agent_states (agent_id, state, event_id, source, ts) VALUES ($1, $2, $3, $4, $5)',
    values: [agentId, state, e.id, e.source, iso(e.ts)],
  };
}

/**
 * Statements that bring the projection tables from `prev` to `next`.
 * `prev = null` means "full rebuild" (first boot or `npm run db:rebuild`).
 */
export function projectTransition(prev: WorldState | null, next: WorldState, events: WorldEvent[]): Statement[] {
  const out: Statement[] = [];
  if (!prev || prev.territories !== next.territories) for (const t of next.territories) out.push(upsert('territories', rows.territories(t)));
  diffRecord('projects', prev?.projects, next.projects, rows.projects, out);
  diffRecord('agents', prev?.agents, next.agents, rows.agents, out);
  diffRecord('missions', prev?.missions, next.missions, rows.missions, out);
  diffRecord('conversations', prev?.conversations, next.conversations, rows.conversations, out);
  diffRecord('messages', prev?.messages, next.messages, rows.messages, out);
  diffRecord('files', prev?.files, next.files, rows.files, out);
  diffRecord('decisions', prev?.decisions, next.decisions, rows.decisions, out);
  diffRecord('squads', prev?.squads, next.squads, rows.squads, out);
  diffList('notifications', prev?.notifications, next.notifications, rows.notifications, out);
  // Activity is prepended and capped in memory; the table keeps everything.
  if (!prev || prev.activity !== next.activity) {
    const seen = new Set((prev?.activity ?? []).map((a) => a.id));
    for (const a of next.activity) if (!seen.has(a.id)) out.push(insertIgnore('activity_logs', rows.activity_logs(a)));
  }
  projectAgentLinks(prev, next, out);
  historyFromEvents(events, next, out);
  return out;
}

export const PROJECTION_TABLES = [
  'territories', 'projects', 'agents', 'project_agents', 'missions', 'conversations', 'messages', 'files', 'decisions',
  'notifications', 'squads', 'agent_states', 'tasks', 'activity_logs',
] as const;
