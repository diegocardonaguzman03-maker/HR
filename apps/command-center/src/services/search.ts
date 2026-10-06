// Universal search across agents, projects, conversations, messages, missions,
// files, decisions, territories and topics. Pure function over WorldState.
import { TERRITORIES } from '@/data/territories';
import type { ID } from '@/types/domain';
import type { WorldState } from './worldState';

export type ResultType = 'agent' | 'project' | 'conversation' | 'message' | 'mission' | 'file' | 'decision' | 'territory' | 'person';

export interface SearchResult {
  type: ResultType;
  id: ID;
  title: string;
  subtitle: string;
  score: number;
  /** For messages: the conversation to open. */
  ref?: ID;
}

export const RESULT_LABEL: Record<ResultType, string> = {
  project: 'Projects',
  agent: 'Agents',
  conversation: 'Agent conversations',
  message: 'Messages',
  mission: 'Missions',
  file: 'Documents',
  decision: 'Decisions',
  territory: 'Territories',
  person: 'People',
};

function score(q: string, ...fields: (string | undefined)[]): number {
  let best = 0;
  for (const [i, f] of fields.entries()) {
    if (!f) continue;
    const t = f.toLowerCase();
    const idx = t.indexOf(q);
    if (idx < 0) continue;
    const s = (idx === 0 ? 3 : /\W/.test(t[idx - 1] ?? ' ') ? 2 : 1) * (i === 0 ? 2 : 1);
    best = Math.max(best, s);
  }
  return best;
}

export function search(s: WorldState, raw: string, limit = 40): SearchResult[] {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: SearchResult[] = [];
  const push = (r: Omit<SearchResult, 'score'>, sc: number) => sc > 0 && out.push({ ...r, score: sc });

  for (const p of Object.values(s.projects))
    push({ type: 'project', id: p.id, title: p.name, subtitle: `${p.structure} · ${p.status}` }, score(q, p.name, p.structure, p.objective, p.description, (p.components ?? []).join(' ')));
  for (const a of Object.values(s.agents))
    push({ type: 'agent', id: a.id, title: a.name, subtitle: `${a.role}${a.currentTask ? ` · ${a.currentTask.title}` : ''}` }, score(q, a.name, a.role, a.specialization, a.skills.join(' '), a.currentTask?.title));
  for (const c of Object.values(s.conversations)) {
    const a = s.agents[c.agentId];
    push({ type: 'conversation', id: c.id, title: `${a?.name ?? c.agentId} — ${c.title}`, subtitle: `${c.messageIds.length} messages` }, score(q, c.title, a?.name));
  }
  for (const m of Object.values(s.messages)) {
    const sc = score(q, m.text);
    if (!sc) continue;
    const a = m.agentId ? s.agents[m.agentId] : null;
    const i = m.text.toLowerCase().indexOf(q);
    const snippet = (i > 30 ? '…' : '') + m.text.slice(Math.max(0, i - 30), i + 60) + '…';
    push({ type: 'message', id: m.id, ref: m.conversationId, title: snippet, subtitle: a ? a.name : 'Francisco' }, sc * 0.6);
  }
  for (const m of Object.values(s.missions))
    push({ type: 'mission', id: m.id, title: m.title, subtitle: `${m.code} · ${s.projects[m.projectId]?.name ?? ''}` }, score(q, m.title, m.outputs.join(' ')));
  for (const f of Object.values(s.files))
    push({ type: 'file', id: f.id, title: f.name, subtitle: `${f.projectId ? s.projects[f.projectId]?.name : 'Unfiled'} · ${f.size}` }, score(q, f.name, f.summary));
  for (const d of Object.values(s.decisions))
    push({ type: 'decision', id: d.id, title: d.title, subtitle: `${d.status} · ${d.projectId ? s.projects[d.projectId]?.name : ''}` }, score(q, d.title, d.context, d.options.join(' ')));
  for (const t of TERRITORIES) push({ type: 'territory', id: t.id, title: t.name, subtitle: t.tagline }, score(q, t.name, t.tagline, t.represents));
  for (const i of s.inbox) push({ type: 'person', id: i.id, title: i.from, subtitle: i.subject }, score(q, i.from, i.subject));

  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function groupResults(rs: SearchResult[]): [ResultType, SearchResult[]][] {
  const order: ResultType[] = ['project', 'agent', 'conversation', 'file', 'mission', 'decision', 'message', 'territory', 'person'];
  const m = new Map<ResultType, SearchResult[]>();
  for (const r of rs) m.set(r.type, [...(m.get(r.type) ?? []), r]);
  return order.filter((t) => m.has(t)).map((t) => [t, m.get(t)!]);
}
