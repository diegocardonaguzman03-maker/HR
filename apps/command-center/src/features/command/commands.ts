'use client';
// Command palette items + natural-language world navigation.
// "Take me to Praxia", "What is SCOUT doing?", "Show agents waiting for me", …
import type { IconName } from '@/components/ui/Icon';
import { TERRITORIES } from '@/data/territories';
import { focusAgent, focusCitadel, focusProject, goTerritory, openAgentChat, openAria } from '@/services/actions';
import { recommendAgents } from '@/services/agentRouter';
import { search, type SearchResult } from '@/services/search';
import type { WorldState } from '@/services/worldState';
import { ui } from '@/store/uiStore';
import type { TerritoryId } from '@/types/domain';

export interface PaletteItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: IconName;
  run: () => void;
}

const TERRITORY_ALIASES: [RegExp, TerritoryId][] = [
  [/praxia|jungle/, 'praxia'],
  [/industrial|citadel of industry|arcelor|work\b|steel/, 'industrial'],
  [/personal|sanctuary|home\b|life/, 'personal'],
  [/frontier|experiment/, 'frontier'],
  [/command citadel|citadel|center|centre/, 'citadel'],
];

function findAgent(s: WorldState, text: string) {
  const t = text.toLowerCase();
  return Object.values(s.agents).find((a) => new RegExp(`\\b${a.name.toLowerCase()}\\b`).test(t)) ??
    Object.values(s.agents).find((a) => t.includes(a.role.toLowerCase().replace(' agent', '')));
}

function findProject(s: WorldState, text: string) {
  const t = text.toLowerCase().replace(/^(open|show|go to|take me to)\s+(the\s+)?/, '').replace(/\s+project$/, '');
  if (t.length < 2) return undefined;
  const ps = Object.values(s.projects);
  return (
    ps.find((p) => p.name.toLowerCase() === t) ??
    ps.find((p) => p.name.toLowerCase().includes(t) || p.structure.toLowerCase().includes(t)) ??
    ps.find((p) => t.split(/\s+/).filter((w) => w.length > 1).every((w) => `${p.name} ${p.structure}`.toLowerCase().includes(w)))
  );
}

/** Interpret a natural-language command. Returns the best matching actions first. */
export function interpret(s: WorldState, input: string): PaletteItem[] {
  const t = input.trim().toLowerCase();
  if (!t) return [];
  const out: PaletteItem[] = [];
  const add = (x: Omit<PaletteItem, 'group'>) => out.push({ group: 'Suggested action', ...x });

  if (/^(take me|go|fly|navigate|show me|open)\b/.test(t) || /\bto\b/.test(t)) {
    for (const [re, id] of TERRITORY_ALIASES)
      if (re.test(t)) {
        const name = id === 'citadel' ? 'Command Citadel' : TERRITORIES.find((x) => x.id === id)!.name;
        add({ id: `go-${id}`, label: `Go to ${name}`, icon: 'map', run: () => (id === 'citadel' ? focusCitadel() : goTerritory(id)) });
        break;
      }
  }
  if (/waiting|need(s)? me|for me|attention/.test(t)) {
    add({ id: 'waiting', label: 'Show agents waiting for me', hint: `${Object.values(s.agents).filter((a) => a.state === 'waiting').length} waiting`, icon: 'bell', run: () => ui().openOs('today') });
    add({ id: 'aria-attn', label: 'Ask ARIA: what requires my attention?', icon: 'sparkles', run: () => { openAria(); } });
  }
  if (/critical/.test(t)) {
    add({ id: 'critical', label: 'Show critical projects & missions', icon: 'alert', run: () => ui().openOs('priorities') });
  }
  if (/(create|new|start)\b.*(project|initiative)/.test(t)) {
    add({ id: 'new-project', label: 'Create project', icon: 'building', run: () => ui().openModal({ type: 'createProject' }) });
  }
  if (/(create|new|start)\b.*(conversation|chat|mission|research)/.test(t)) {
    const req = input.replace(/^(create|new|start)\s+(a\s+)?(new\s+)?/i, '');
    add({ id: 'new-conv', label: 'New conversation', hint: req, icon: 'chat', run: () => ui().openModal({ type: 'createConversation', request: /research|mission/.test(t) ? req : undefined }) });
  }
  const agent = findAgent(s, t);
  if (agent) {
    if (/what|doing|status|where/.test(t))
      add({ id: `what-${agent.id}`, label: `What is ${agent.name} doing?`, hint: agent.currentTask?.title ?? agent.state, icon: 'eye', run: () => focusAgent(agent.id) });
    if (/talk|ask|chat|message|tell|review/.test(t))
      add({ id: `talk-${agent.id}`, label: `Talk to ${agent.name}`, hint: agent.role, icon: 'chat', run: () => openAgentChat(agent.id) });
    if (/find|locate|show|where/.test(t)) add({ id: `find-${agent.id}`, label: `Find ${agent.name} on the map`, icon: 'crosshair', run: () => focusAgent(agent.id) });
  }
  if (/\bopen\b|\bshow\b|\bgo to\b|project/.test(t)) {
    const p = findProject(s, t);
    if (p) add({ id: `open-${p.id}`, label: `Open ${p.name}`, hint: p.structure, icon: 'building', run: () => { focusProject(p.id); ui().openWorkspace(p.id); } });
  }
  if (/benchmark|research|analy|draft|create|write|plan|review/.test(t) && !/project/.test(t) && t.split(' ').length > 2) {
    const rec = recommendAgents(t, Object.values(s.agents));
    add({ id: 'delegate', label: `Delegate: “${input.trim()}”`, hint: `Recommended: ${rec.agentIds.map((id) => s.agents[id]?.name).join(', ')}`, icon: 'zap', run: () => ui().openModal({ type: 'createConversation', request: input.trim() }) });
  }
  return out;
}

export function staticCommands(): PaletteItem[] {
  const g = 'Commands';
  return [
    { id: 'c-today', group: g, label: 'What needs my attention today?', icon: 'target', run: () => ui().openOs('today') },
    { id: 'c-aria', group: g, label: 'Talk to ARIA (orchestrator)', icon: 'sparkles', run: openAria },
    { id: 'c-proj', group: g, label: 'Create project', icon: 'building', run: () => ui().openModal({ type: 'createProject' }) },
    { id: 'c-conv', group: g, label: 'New conversation', icon: 'chat', run: () => ui().openModal({ type: 'createConversation' }) },
    { id: 'c-agent', group: g, label: 'Create agent', icon: 'bot', run: () => ui().openModal({ type: 'createAgent' }) },
    { id: 'c-world', group: g, label: 'Zoom out to the whole world', icon: 'map', run: () => { ui().select(null); ui().focus({ type: 'world' }); } },
    ...TERRITORIES.map((t) => ({ id: `c-go-${t.id}`, group: 'Navigate', label: `Go to ${t.name}`, hint: t.tagline, icon: 'map' as IconName, run: () => goTerritory(t.id) })),
    { id: 'c-citadel', group: 'Navigate', label: 'Go to Command Citadel', icon: 'home', run: () => { focusCitadel(); ui().openOs('today'); } },
    { id: 'c-crit', group: g, label: 'Show critical missions', icon: 'alert', run: () => ui().openOs('priorities') },
    { id: 'c-dec', group: g, label: 'Show pending decisions', icon: 'flag', run: () => ui().openOs('decisions') },
    { id: 'c-settings', group: g, label: 'Settings — agent provider & simulation', icon: 'settings', run: () => ui().openModal({ type: 'settings' }) },
  ];
}

export function resultToItem(s: WorldState, r: SearchResult): PaletteItem {
  const icon: Record<SearchResult['type'], IconName> = {
    agent: 'bot', project: 'building', conversation: 'chat', message: 'chat', mission: 'target', file: 'file', decision: 'flag', territory: 'map', person: 'user',
  };
  const run = () => {
    const u = ui();
    switch (r.type) {
      case 'agent': return focusAgent(r.id);
      case 'project': return focusProject(r.id);
      case 'conversation': return u.openChat(r.id);
      case 'message': return r.ref && u.openChat(r.ref);
      case 'mission': {
        const m = s.missions[r.id];
        if (m) { focusProject(m.projectId); u.openWorkspace(m.projectId, 'missions'); }
        return;
      }
      case 'file': return u.openModal({ type: 'file', fileId: r.id });
      case 'decision': return u.openModal({ type: 'decision', decisionId: r.id });
      case 'territory': return goTerritory(r.id as TerritoryId);
      case 'person': return u.openOs('inbox');
    }
  };
  return { id: `r-${r.type}-${r.id}`, group: 'Search results', label: r.title, hint: r.subtitle, icon: icon[r.type], run };
}

export function paletteItems(s: WorldState, q: string): PaletteItem[] {
  if (!q.trim()) return staticCommands();
  const ql = q.toLowerCase();
  const nl = interpret(s, q);
  const cmds = staticCommands().filter((c) => c.label.toLowerCase().includes(ql));
  const results = search(s, q, 18).map((r) => resultToItem(s, r));
  const seen = new Set<string>();
  return [...nl, ...cmds, ...results].filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
}
