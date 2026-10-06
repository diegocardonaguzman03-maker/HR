// Turns a ProjectDraft into a Project with a building, a plot and a structure name.
import { territoryById } from '@/data/territories';
import type { BuildingType, Project, ProjectKind } from '@/types/domain';
import type { ProjectDraft } from '@/types/events';
import { recommendAgents } from './agentRouter';
import { dist } from './geometry';
import type { WorldState } from './worldState';

export const BUILDING_FOR_KIND: Record<ProjectKind, { building: BuildingType; structure: string }> = {
  research: { building: 'laboratory', structure: 'Laboratory' },
  training: { building: 'academy', structure: 'Academy' },
  technology: { building: 'techlab', structure: 'Tech Lab' },
  recruiting: { building: 'tower', structure: 'Talent Tower' },
  transformation: { building: 'citadel', structure: 'Command Center' },
  analytics: { building: 'observatory', structure: 'Data Observatory' },
  strategy: { building: 'temple', structure: 'Strategy Temple' },
  personal: { building: 'outpost', structure: 'Jungle Outpost' },
  praxia: { building: 'studio', structure: 'Innovation Studio' },
  experimental: { building: 'hangar', structure: 'Prototype Hangar' },
};

export const KIND_LABEL: Record<ProjectKind, string> = {
  research: 'Research',
  training: 'Training initiative',
  technology: 'Technology',
  recruiting: 'Recruiting',
  transformation: 'Transformation',
  analytics: 'Analytics',
  strategy: 'Strategy',
  personal: 'Personal',
  praxia: 'Praxia initiative',
  experimental: 'Experimental',
};

/** First free plot in the territory (a plot is taken if any structure is within 3 tiles). */
export function findFreePlot(state: WorldState, territory: ProjectDraft['territory']): [number, number] | null {
  const t = territoryById(territory);
  if (!t) return null;
  const taken = Object.values(state.projects).map((p) => p.tile);
  for (const plot of t.plots) if (!taken.some((x) => dist(x, plot) < 3)) return plot;
  // Fallback: scan the territory for open ground.
  const [x0, y0] = t.polygon[0];
  const [x1, y1] = t.polygon[2];
  for (let y = y0 + 3; y < y1 - 3; y += 2)
    for (let x = x0 + 3; x < x1 - 3; x += 2) if (!taken.some((p) => dist(p, [x, y]) < 4.5)) return [x, y];
  return null;
}

export function buildProject(state: WorldState, draft: ProjectDraft, id: string, now: number): Project | null {
  const tile = findFreePlot(state, draft.territory);
  if (!tile) return null;
  const { building, structure } = BUILDING_FOR_KIND[draft.kind];
  const agentIds = draft.autoAssign
    ? recommendAgents(`${draft.name} ${draft.objective} ${draft.context}`, Object.values(state.agents)).agentIds
    : draft.agentIds;
  return {
    id,
    name: draft.name.trim(),
    structure: draft.territory === 'personal' && draft.kind === 'personal' ? 'Outpost' : structure,
    kind: draft.kind,
    building: draft.territory === 'frontier' && draft.kind !== 'experimental' ? 'outpost' : building,
    territory: draft.territory,
    tile,
    size: 3,
    objective: draft.objective.trim() || 'To be defined',
    description: draft.context.trim(),
    status: 'active',
    priority: draft.priority,
    owner: 'Francisco',
    progress: 0,
    agentIds,
    missionIds: [],
    fileIds: [],
    decisionIds: [],
    dependencies: [],
    kpis: [{ label: 'Missions', value: '0' }],
    createdAt: now,
    underConstruction: true,
  };
}
