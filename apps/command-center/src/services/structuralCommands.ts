// World-structure commands are Francisco's own actions: create/archive a
// project, change priority or status, add files, decide, pause an agent…
// They translate 1:1 into `source: 'user'` events and never invent agent
// activity. The gateway (server/) runs this as the single writer, so every
// resulting event is persisted before it is broadcast.
import { uid } from '@/services/ids';
import { buildProject } from '@/services/projectFactory';
import type { WorldState } from '@/services/worldState';
import type { Agent, FileDoc } from '@/types/domain';
import type { Command, WorldEvent } from '@/types/events';

type Emit = (e: WorldEvent) => void;
type Schedule = (ms: number, fn: () => void) => void;

const ev = <T extends WorldEvent['type']>(type: T, payload: Extract<WorldEvent, { type: T }>['payload']) =>
  ({ id: uid('ev'), ts: Date.now(), source: 'user', type, payload }) as Extract<WorldEvent, { type: T }>;

export const fileKindOf = (name: string): FileDoc['kind'] => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'deck';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['glb', 'gltf', 'fbx', 'obj'].includes(ext)) return 'model';
  if (['doc', 'docx', 'md', 'txt'].includes(ext)) return 'doc';
  return 'other';
};

const fileOf = (f: { name: string; size: number }, projectId: string | null, summary: string): FileDoc => ({
  id: uid('f'),
  name: f.name,
  kind: fileKindOf(f.name),
  projectId,
  agentId: null,
  size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
  updatedAt: Date.now(),
  summary,
});

/**
 * Applies a structural command. Returns true when the command is fully
 * handled (no agent work involved); false means an agent runtime must act.
 */
export function applyStructuralCommand(cmd: Command, s: WorldState, emit: Emit, schedule: Schedule = (ms, fn) => void setTimeout(fn, ms)): boolean {
  switch (cmd.type) {
    case 'project.create': {
      const p = buildProject(s, cmd.draft, cmd.projectId, Date.now());
      if (!p) {
        emit(ev('notification.created', { notification: { id: uid('n'), kind: 'info', title: 'No free plot', body: `No room left in ${cmd.draft.territory}.`, ts: Date.now(), read: false, priority: 'high' } }));
        return true;
      }
      emit(ev('project.created', { project: p }));
      emit(ev('mission.created', {
        mission: {
          id: uid('m'), projectId: p.id, code: 'MISSION 01', title: 'Kick-off: scope, stakeholders and first deliverable', level: 'mission',
          status: 'pending', agentIds: p.agentIds, dependsOn: [], progress: 0, deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), outputs: [],
        },
      }));
      for (const f of cmd.draft.files) emit(ev('file.added', { file: fileOf(f, p.id, 'Added at project launch.') }));
      schedule(3500, () => emit(ev('project.construction_finished', { projectId: p.id })));
      return true;
    }
    case 'project.archive':
      emit(ev('project.status_changed', { projectId: cmd.projectId, status: 'archived' }));
      for (const a of Object.values(s.agents))
        if (a.currentTask?.projectId === cmd.projectId) emit(ev('agent.state_changed', { agentId: a.id, state: 'idle', note: 'Project archived — returned home' }));
      return true;
    case 'project.set_priority':
      emit(ev('project.priority_changed', { projectId: cmd.projectId, priority: cmd.priority }));
      return true;
    case 'project.set_status':
      emit(ev('project.status_changed', { projectId: cmd.projectId, status: cmd.status }));
      return true;
    case 'decision.resolve':
      if (s.decisions[cmd.decisionId]?.status !== 'pending') return true;
      emit(ev('decision.made', { decisionId: cmd.decisionId, status: cmd.status, note: cmd.note }));
      return true;
    case 'file.add':
      for (const f of cmd.files) emit(ev('file.added', { file: fileOf(f, cmd.projectId, 'Uploaded by Francisco (metadata only — content is not stored yet).') }));
      return true;
    case 'notification.read':
      emit(ev('notification.read', { ids: cmd.ids }));
      return true;
    case 'agent.pause':
      emit(ev('agent.paused', { agentId: cmd.agentId }));
      return true;
    case 'agent.resume':
      emit(ev('agent.resumed', { agentId: cmd.agentId }));
      return true;
    case 'agent.move':
      emit(ev('agent.assigned', { agentId: cmd.agentId, projectId: cmd.projectId }));
      return true;
    case 'agent.create': {
      const home = s.projects[cmd.homeProjectId];
      const agent: Agent = {
        id: cmd.agentId, name: cmd.name.toUpperCase(), role: cmd.role, specialization: cmd.role, description: 'Custom agent created by Francisco.',
        color: cmd.color, look: 'plain', skills: cmd.skills, tools: [], homeProjectId: home ? home.id : 'citadel', territory: home ? home.territory : 'citadel',
        state: 'idle', currentTask: null, taskQueue: [], conversationIds: [], collaborators: [], memory: [], recentActivities: ['Created'],
        activitySource: null, position: [34.5, 32.5], lastActivityAt: Date.now(), performance: { missionsCompleted: 0, avgCycleHours: 0, approvalRate: 0 },
        squadId: null, waitingFor: null, blockedReason: null,
      };
      emit(ev('agent.created', { agent }));
      return true;
    }
    default:
      return false;
  }
}
