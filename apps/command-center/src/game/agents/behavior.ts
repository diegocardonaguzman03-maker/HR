// Pure mapping: agent state → where the unit should be and how it behaves.
// The game layer calls this whenever the world state changes.
import { CITADEL_ID } from '@/data/agents';
import { territoryAt } from '@/data/territories';
import { citadelAnchor, citadelWaitingSlot, projectAnchor, slotOf, type Anchor, type Vec } from '@/services/geometry';
import type { WorldState } from '@/services/worldState';
import type { Agent, AgentState, ID, TerritoryId } from '@/types/domain';

export type MoveMode = 'stand' | 'patrol' | 'hold';

export interface UnitTarget {
  agentId: ID;
  /** Structure the agent is heading to (or null when holding position). */
  structureId: ID | null;
  pos: Vec | null;
  territory: TerritoryId | null;
  mode: MoveMode;
}

export const STATE_COLORS: Record<AgentState, number> = {
  working: 0x4ade80,
  researching: 0x60a5fa,
  collaborating: 0xa78bfa,
  waiting: 0xfacc15,
  reviewing: 0xfb923c,
  blocked: 0xef4444,
  idle: 0xd4d4d8,
  completed: 0x22c55e,
  paused: 0x9ca3af,
};

function structureFor(a: Agent): ID | null {
  switch (a.state) {
    case 'paused':
    case 'blocked':
    case 'completed':
      return null; // hold position
    case 'waiting':
      return CITADEL_ID;
    case 'idle':
      return a.homeProjectId;
    default:
      return a.currentTask?.projectId ?? (a.homeProjectId || CITADEL_ID);
  }
}

export function computeTargets(s: WorldState): Map<ID, UnitTarget> {
  const out = new Map<ID, UnitTarget>();
  const groups = new Map<ID, Agent[]>();
  const waiting: Agent[] = [];
  const agents = Object.values(s.agents).sort((x, y) => x.id.localeCompare(y.id));
  for (const a of agents) {
    let sid = structureFor(a);
    if (sid && sid !== CITADEL_ID && (!s.projects[sid] || s.projects[sid].status === 'archived')) sid = a.homeProjectId in s.projects ? a.homeProjectId : CITADEL_ID;
    if (a.state === 'waiting') {
      waiting.push(a);
      continue;
    }
    if (!sid) {
      out.set(a.id, { agentId: a.id, structureId: null, pos: null, territory: null, mode: 'hold' });
      continue;
    }
    const list = groups.get(sid) ?? [];
    list.push(a);
    groups.set(sid, list);
  }
  waiting.forEach((a, i) => {
    out.set(a.id, { agentId: a.id, structureId: CITADEL_ID, pos: citadelWaitingSlot(i), territory: 'citadel', mode: 'stand' });
  });
  for (const [sid, list] of groups) {
    const anchor: Anchor = sid === CITADEL_ID ? citadelAnchor() : projectAnchor(s.projects[sid]);
    list.forEach((a, i) => {
      const pos = slotOf(anchor, i);
      const mode: MoveMode = a.state === 'working' ? 'patrol' : 'stand';
      out.set(a.id, { agentId: a.id, structureId: sid, pos, territory: territoryAt(pos[0], pos[1]), mode });
    });
  }
  return out;
}

/** Count of agents actively working at each structure (drives building activity). */
export function presenceByStructure(s: WorldState): Map<ID, number> {
  const m = new Map<ID, number>();
  for (const a of Object.values(s.agents)) {
    if (!['working', 'researching', 'reviewing', 'collaborating'].includes(a.state)) continue;
    const sid = a.currentTask?.projectId ?? CITADEL_ID;
    m.set(sid, (m.get(sid) ?? 0) + 1);
  }
  return m;
}

export function waitingByStructure(s: WorldState): Map<ID, number> {
  const m = new Map<ID, number>();
  for (const a of Object.values(s.agents)) {
    if (a.state !== 'waiting') continue;
    const pid = a.currentTask?.projectId;
    if (pid) m.set(pid, (m.get(pid) ?? 0) + 1);
  }
  return m;
}
