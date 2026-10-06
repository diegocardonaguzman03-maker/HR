'use client';
// UI/navigation store. Separate from domain state on purpose:
// selection, panels and camera requests are about *where Francisco is*, not *what is happening*.
import { create } from 'zustand';
import type { ActivityCategory, ID, TerritoryId } from '@/types/domain';

export type Selection = { kind: 'agent' | 'project' | 'citadel'; id: ID } | null;

export type CameraTarget =
  | { type: 'agent'; id: ID }
  | { type: 'project'; id: ID }
  | { type: 'territory'; id: TerritoryId }
  | { type: 'citadel' }
  | { type: 'world' }
  | { type: 'tile'; x: number; y: number; zoom?: number };

export type DrawerKind = 'agents' | 'projects' | 'conversations' | 'files' | 'missions' | 'notifications' | 'decisions';

export type ProjectTab = 'overview' | 'missions' | 'agents' | 'chat' | 'files' | 'timeline' | 'decisions' | 'metrics' | 'activity';
export type AgentTab = 'overview' | 'queue' | 'activity' | 'files' | 'conversations' | 'memory';
export type OsSection =
  | 'today' | 'priorities' | 'projects' | 'agents' | 'conversations' | 'decisions' | 'calendar' | 'inbox' | 'files' | 'notifications' | 'search' | 'system';

export type Modal =
  | { type: 'createProject'; territory?: TerritoryId }
  | { type: 'createConversation'; agentId?: ID; request?: string; projectId?: ID | null }
  | { type: 'assignTask'; agentId: ID; projectId?: ID }
  | { type: 'moveAgent'; agentId: ID }
  | { type: 'createAgent' }
  | { type: 'squad'; squadId: ID }
  | { type: 'file'; fileId: ID }
  | { type: 'decision'; decisionId: ID }
  | { type: 'settings' }
  | { type: 'profile' }
  | null;

export type FeedFilter = 'all' | ActivityCategory | 'critical' | 'waiting' | 'completed';

interface UiStore {
  selection: Selection;
  hover: Selection;
  chat: { conversationId: ID } | null;
  workspace: { projectId: ID; tab: ProjectTab } | null;
  agentProfile: { agentId: ID; tab: AgentTab } | null;
  os: { section: OsSection } | null;
  drawer: DrawerKind | null;
  modal: Modal;
  paletteOpen: boolean;
  paletteSeed: string;
  feedOpen: boolean;
  feedFilter: FeedFilter;
  navCollapsed: boolean;
  camera: { target: CameraTarget; n: number } | null;
  cameraTerritory: TerritoryId | null;
  reducedMotion: boolean;
  toast: { text: string; n: number } | null;

  select(sel: Selection, opts?: { focus?: boolean }): void;
  setHover(sel: Selection): void;
  focus(target: CameraTarget): void;
  openChat(conversationId: ID): void;
  closeChat(): void;
  openWorkspace(projectId: ID, tab?: ProjectTab): void;
  closeWorkspace(): void;
  openAgentProfile(agentId: ID, tab?: AgentTab): void;
  closeAgentProfile(): void;
  openOs(section?: OsSection): void;
  closeOs(): void;
  openDrawer(d: DrawerKind | null): void;
  openModal(m: Modal): void;
  closeModal(): void;
  setPalette(open: boolean, seed?: string): void;
  setFeed(open: boolean): void;
  setFeedFilter(f: FeedFilter): void;
  setNavCollapsed(v: boolean): void;
  setCameraTerritory(t: TerritoryId | null): void;
  setReducedMotion(v: boolean): void;
  showToast(text: string): void;
  /** ESC: close the top-most layer and return to the previous level. */
  back(): void;
}

let cameraN = 0;

export const useUi = create<UiStore>((set, get) => ({
  selection: null,
  hover: null,
  chat: null,
  workspace: null,
  agentProfile: null,
  os: null,
  drawer: null,
  modal: null,
  paletteOpen: false,
  paletteSeed: '',
  feedOpen: true,
  feedFilter: 'all',
  navCollapsed: false,
  camera: null,
  cameraTerritory: null,
  reducedMotion: false,
  toast: null,

  select(sel, opts) {
    set({ selection: sel });
    if (sel && opts?.focus !== false) {
      get().focus(sel.kind === 'citadel' ? { type: 'citadel' } : { type: sel.kind, id: sel.id });
    }
  },
  setHover(hover) {
    const h = get().hover;
    if (h?.id === hover?.id && h?.kind === hover?.kind) return;
    set({ hover });
  },
  focus(target) {
    set({ camera: { target, n: ++cameraN } });
  },
  openChat(conversationId) {
    set({ chat: { conversationId } });
  },
  closeChat() {
    set({ chat: null });
  },
  openWorkspace(projectId, tab = 'overview') {
    set({ workspace: { projectId, tab }, agentProfile: null, os: null, selection: { kind: 'project', id: projectId } });
  },
  closeWorkspace() {
    set({ workspace: null });
  },
  openAgentProfile(agentId, tab = 'overview') {
    set({ agentProfile: { agentId, tab }, workspace: null, os: null, selection: { kind: 'agent', id: agentId } });
  },
  closeAgentProfile() {
    set({ agentProfile: null });
  },
  openOs(section = 'today') {
    set({ os: { section }, workspace: null, agentProfile: null, drawer: null });
  },
  closeOs() {
    set({ os: null });
  },
  openDrawer(drawer) {
    set({ drawer: get().drawer === drawer ? null : drawer });
  },
  openModal(modal) {
    set({ modal, paletteOpen: false });
  },
  closeModal() {
    set({ modal: null });
  },
  setPalette(paletteOpen, seed = '') {
    set({ paletteOpen, paletteSeed: seed });
  },
  setFeed(feedOpen) {
    set({ feedOpen });
  },
  setFeedFilter(feedFilter) {
    set({ feedFilter });
  },
  setNavCollapsed(navCollapsed) {
    set({ navCollapsed });
  },
  setCameraTerritory(cameraTerritory) {
    if (get().cameraTerritory !== cameraTerritory) set({ cameraTerritory });
  },
  setReducedMotion(reducedMotion) {
    set({ reducedMotion });
  },
  showToast(text) {
    set({ toast: { text, n: ++cameraN } });
  },
  back() {
    const s = get();
    if (s.paletteOpen) return set({ paletteOpen: false });
    if (s.modal) return set({ modal: null });
    if (s.chat) return set({ chat: null });
    if (s.workspace) return set({ workspace: null });
    if (s.agentProfile) return set({ agentProfile: null });
    if (s.os) return set({ os: null });
    if (s.drawer) return set({ drawer: null });
    if (s.selection) return set({ selection: null });
    if (s.cameraTerritory) return get().focus({ type: 'world' });
  },
}));

export const ui = () => useUi.getState();
