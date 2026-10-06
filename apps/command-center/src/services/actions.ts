'use client';
// High-level user actions shared by panels, chat action buttons, the command
// palette and natural-language navigation. One place = consistent behaviour.
import { CITADEL_ID } from '@/data/agents';
import { ui } from '@/store/uiStore';
import { dispatch, world } from '@/store/worldStore';
import type { ID, TerritoryId } from '@/types/domain';
import { uid } from './ids';

export function focusAgent(id: ID) {
  ui().select({ kind: 'agent', id });
}

export function focusProject(id: ID) {
  if (id === CITADEL_ID) return focusCitadel();
  ui().select({ kind: 'project', id });
}

export function focusCitadel() {
  ui().select({ kind: 'citadel', id: CITADEL_ID });
}

export function goTerritory(id: TerritoryId) {
  ui().select(null);
  ui().focus(id === 'citadel' ? { type: 'citadel' } : { type: 'territory', id });
}

/** Open (or create) the contextual conversation for an agent — optionally scoped to a project. */
export function openAgentChat(agentId: ID, projectId?: ID | null) {
  const s = world();
  const a = s.agents[agentId];
  if (!a) return;
  const pid = projectId !== undefined ? projectId : a.currentTask?.projectId ?? null;
  const convs = a.conversationIds.map((id) => s.conversations[id]).filter(Boolean);
  const match =
    convs.filter((c) => pid && c.projectId === pid).sort((x, y) => y.updatedAt - x.updatedAt)[0] ??
    (projectId === undefined ? convs.sort((x, y) => y.updatedAt - x.updatedAt)[0] : undefined);
  if (match) return ui().openChat(match.id);
  const conversationId = uid('c');
  const project = pid ? s.projects[pid] : undefined;
  dispatch({ type: 'conversation.start', conversationId, agentId, projectId: pid, title: project ? `${a.name} · ${project.name}` : `${a.name} · General` });
  ui().openChat(conversationId);
}

export function openAria() {
  openAgentChat('aria', null);
}

/** Execute a message/palette action string, e.g. "focus:project:p-3d". */
export function runAction(command: string) {
  const [verb, kind, id] = command.split(':');
  const u = ui();
  switch (verb) {
    case 'focus':
      if (kind === 'agent') {
        u.closeChat();
        return focusAgent(id);
      }
      if (kind === 'project') {
        u.closeChat();
        return focusProject(id);
      }
      if (kind === 'territory') return goTerritory(id as TerritoryId);
      return;
    case 'open':
      if (kind === 'project') return u.openWorkspace(id);
      if (kind === 'files') return id ? u.openWorkspace(id, 'files') : u.openDrawer('files');
      if (kind === 'decision') return u.openModal({ type: 'decision', decisionId: id });
      if (kind === 'agent') return u.openAgentProfile(id);
      if (kind === 'conversation') return u.openChat(id);
      return;
    case 'agent':
      if (kind === 'resume') return dispatch({ type: 'agent.resume', agentId: id });
      if (kind === 'pause') return dispatch({ type: 'agent.pause', agentId: id });
      return;
    case 'squad':
      return u.openModal({ type: 'squad', squadId: kind });
  }
}
