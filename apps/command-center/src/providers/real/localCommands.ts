// World-structure commands are Francisco's own actions (create/archive a
// project, change priority, add files, decide). With a real backend they are
// applied immediately on the client as `source: 'user'` events and also
// forwarded to the gateway for persistence. No agent activity is invented here.
import { uid } from '@/services/ids';
import { buildProject } from '@/services/projectFactory';
import type { WorldState } from '@/services/worldState';
import type { Agent, FileDoc } from '@/types/domain';
import type { Command, WorldEvent } from '@/types/events';

type Emit = (e: WorldEvent) => void;
const ev = <T extends WorldEvent['type']>(type: T, payload: Extract<WorldEvent, { type: T }>['payload']) =>
  ({ id: uid('ev'), ts: Date.now(), source: 'user', type, payload }) as Extract<WorldEvent, { type: T }>;

const kindOf = (name: string): FileDoc['kind'] => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ext === 'pdf' ? 'pdf' : ['xls', 'xlsx', 'csv'].includes(ext) ? 'sheet' : ['ppt', 'pptx'].includes(ext) ? 'deck' : ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) ? 'image' : 'doc';
};

/** Returns true when the command was fully handled locally. */
export function applyLocalCommand(cmd: Command, s: WorldState, emit: Emit): boolean {
  switch (cmd.type) {
    case 'project.create': {
      const p = buildProject(s, { ...cmd.draft, autoAssign: false }, cmd.projectId, Date.now());
      if (!p) return true;
      emit(ev('project.created', { project: p }));
      setTimeout(() => emit(ev('project.construction_finished', { projectId: p.id })), 3500);
      for (const f of cmd.draft.files) emit(ev('file.added', { file: { id: uid('f'), name: f.name, kind: kindOf(f.name), projectId: p.id, agentId: null, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, updatedAt: Date.now(), summary: 'Added at project launch.' } }));
      return true;
    }
    case 'project.archive':
      emit(ev('project.status_changed', { projectId: cmd.projectId, status: 'archived' }));
      return true;
    case 'project.set_priority':
      emit(ev('project.priority_changed', { projectId: cmd.projectId, priority: cmd.priority }));
      return true;
    case 'project.set_status':
      emit(ev('project.status_changed', { projectId: cmd.projectId, status: cmd.status }));
      return true;
    case 'decision.resolve':
      emit(ev('decision.made', { decisionId: cmd.decisionId, status: cmd.status, note: cmd.note }));
      return false; // also tell the backend so the waiting agent can continue
    case 'file.add':
      for (const f of cmd.files) emit(ev('file.added', { file: { id: uid('f'), name: f.name, kind: kindOf(f.name), projectId: cmd.projectId, agentId: null, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, updatedAt: Date.now(), summary: 'Uploaded by Francisco.' } }));
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
      return false;
    }
    default:
      return false;
  }
}
