// Recommends agents for a free-text request ("AUTO SELECT AGENT").
// Deterministic keyword scoring — replace with an LLM router via the
// integration layer when a real provider is connected.
import type { Agent, ID, ProjectKind, TerritoryId } from '@/types/domain';

const KEYWORDS: Record<string, string[]> = {
  aria: ['attention', 'priorit', 'calendar', 'meeting', 'brief', 'agenda', 'inbox', 'organi', 'remind', 'today'],
  atlas: ['strategy', 'business case', 'architecture', 'option', 'roadmap', 'plan', 'decision', 'executive', 'transformation', 'review'],
  forge: ['ojt', 'work instruction', 'training', 'learning', 'curricul', 'academy', 'certif', 'safety', 'heights', 'loto', 'maintenance', '3d', 'furnace', 'operator', 'industrial'],
  scout: ['benchmark', 'research', 'compare', 'best', 'find', 'market', 'study', 'trend', 'investigat', 'explore', 'canad'],
  talent: ['recruit', 'vacanc', 'hiring', 'candidate', 'talent', 'succession', 'pipeline', 'workforce', 'interview', 'employer brand'],
  nexus: ['data', 'analytic', 'kpi', 'metric', 'dashboard', 'model', 'forecast', 'measure', 'report', 'roi'],
  praxis: ['praxia', 'linkedin', 'content', 'post', 'offer', 'positioning', 'brand', 'consulting', 'go-to-market', 'article'],
  ledger: ['financ', 'budget', 'money', 'cost', 'saving', 'invest', 'debt', 'cash', 'price', 'roi', 'business case'],
};

export interface Recommendation {
  agentIds: ID[];
  reasons: Record<ID, string>;
}

export function recommendAgents(request: string, agents: Agent[], max = 3): Recommendation {
  const text = request.toLowerCase();
  const scored = agents
    .map((a) => {
      const words = KEYWORDS[a.id] ?? a.skills.map((s) => s.toLowerCase());
      const hits = words.filter((w) => text.includes(w));
      return { a, score: hits.length, hits };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, max);
  if (scored.length === 0) {
    const aria = agents.find((a) => a.id === 'aria') ?? agents[0];
    return { agentIds: aria ? [aria.id] : [], reasons: aria ? { [aria.id]: 'General request — ARIA will route it.' } : {} };
  }
  return {
    agentIds: scored.map((x) => x.a.id),
    reasons: Object.fromEntries(scored.map((x) => [x.a.id, `Matches: ${x.hits.slice(0, 3).join(', ')}`])),
  };
}

/** Guess the territory and kind of a request (used by NL commands and the wizard). */
export function inferTerritory(text: string): TerritoryId {
  const t = text.toLowerCase();
  if (/praxia|linkedin|consult|client|offer|content/.test(t)) return 'praxia';
  if (/personal|gym|bike|cycl|finance|money|travel|family|home|health/.test(t)) return 'personal';
  if (/experiment|idea|prototype|explore|future|random/.test(t)) return 'frontier';
  return 'industrial';
}

export function inferKind(text: string, territory: TerritoryId): ProjectKind {
  const t = text.toLowerCase();
  if (territory === 'frontier') return 'experimental';
  if (territory === 'personal') return 'personal';
  if (/research|benchmark|study/.test(t)) return 'research';
  if (/recruit|hiring|vacanc|talent/.test(t)) return 'recruiting';
  if (/data|analytic|dashboard|kpi/.test(t)) return 'analytics';
  if (/training|academy|learning|ojt|course/.test(t)) return 'training';
  if (/tech|platform|3d|ai|software|app/.test(t)) return 'technology';
  if (/strategy|plan|business/.test(t)) return territory === 'praxia' ? 'praxia' : 'strategy';
  if (/transform|change|program/.test(t)) return 'transformation';
  return territory === 'praxia' ? 'praxia' : 'strategy';
}
