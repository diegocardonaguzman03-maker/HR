import { create } from 'zustand';
import type { Alert, AgentStatus, ChatMsg, Decision, FeedItem, ProjectDef, Task } from '../types';
import { AGENTS } from '../data/agents';
import { PROJECTS } from '../data/projects';
import { SEED_ALERTS, SEED_DECISIONS } from '../data/seed';
import { SIM_START_MIN } from '../config';

export type Mode = 'script' | 'meeting' | 'task' | 'review';

export interface AgentRT {
  status: AgentStatus;
  mode: Mode;
  task: string;
  project: string;
  next: string;
  progress: number;
  workload: number; // 0–100 illustrative
  taskId?: string;
  priority: string;
}

export interface ProjectRT { progress: number; updates: { at: number; text: string }[] }

export type Overlay =
  | { kind: 'none' }
  | { kind: 'projects' }
  | { kind: 'project'; id: string }
  | { kind: 'newtask'; agent?: string; project?: string }
  | { kind: 'newproject' }
  | { kind: 'chat'; agent: string }
  | { kind: 'decisions' }
  | { kind: 'help' };

export interface Packet { id: number; from: [number, number, number]; to: string; born: number; color: string; label: string }

export interface CommandResult { query: string; title: string; lines: { text: string; action?: Action }[] }
export type Action = { kind: 'agent' | 'project' | 'zone' | 'decisions' | 'projects' | 'newtask' | 'newproject'; id?: string };

interface State {
  simMinute: number;
  speed: number;
  view: 'operational' | 'strategic';
  selected: string | null;
  hovered: string | null;
  overlay: Overlay;
  agents: Record<string, AgentRT>;
  projects: Record<string, ProjectRT>;
  extraProjects: ProjectDef[];
  tasks: Task[];
  feed: FeedItem[];
  alerts: Alert[];
  alertsSeen: number;
  decisions: Decision[];
  chats: Record<string, ChatMsg[]>;
  focus: { kind: 'agent' | 'zone' | 'home' | 'director'; id?: string; nonce: number };
  packets: Packet[];
  command: CommandResult | null;
  leftOpen: boolean;
  toast: { text: string; nonce: number } | null;
  meetingNow: { project: string; title: string; members: string[] } | null;

  setSpeed: (s: number) => void;
  setView: (v: 'operational' | 'strategic') => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  open: (o: Overlay) => void;
  close: () => void;
  setAgent: (id: string, patch: Partial<AgentRT>) => void;
  log: (text: string, agent?: string, kind?: FeedItem['kind']) => void;
  alert: (a: Omit<Alert, 'id' | 'at'>) => void;
  markAlertsSeen: () => void;
  bumpProject: (id: string, delta: number, update?: string) => void;
  addTask: (t: Omit<Task, 'id' | 'stage' | 'progress' | 'createdAt'>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addDecision: (d: Omit<Decision, 'id'>) => void;
  resolveDecision: (id: string, choice: string) => void;
  say: (agent: string, msg: ChatMsg) => void;
  flyTo: (kind: 'agent' | 'zone' | 'home' | 'director', id?: string) => void;
  sendPacket: (p: Omit<Packet, 'id' | 'born'>) => void;
  dropPacket: (id: number) => void;
  setCommand: (c: CommandResult | null) => void;
  setLeftOpen: (v: boolean) => void;
  notify: (text: string) => void;
  setMeeting: (m: State['meetingNow']) => void;
  addProject: (p: ProjectDef) => void;
  tick: (minute: number) => void;
}

let feedId = 1;
let alertId = 100;
let packetId = 1;
// In-app tasks use their own series so they never collide with the official board (T-AAMM-NNN).
let taskSeq = 1;

const initialAgents = Object.fromEntries(
  AGENTS.map((a, i) => {
    const s = a.script[0];
    return [a.id, { status: s.status, mode: 'script', task: s.task, project: s.project, next: s.next, progress: 20 + ((i * 17) % 60), workload: 45 + ((i * 23) % 50), priority: 'U2' } satisfies AgentRT];
  }),
);
// Workload follows the portfolio: Uziel and Maribel carry most projects.
initialAgents.uziel.workload = 96;
initialAgents.maribel.workload = 92;
initialAgents.sheccid.workload = 38;

const initialProjects = Object.fromEntries(PROJECTS.map((p) => [p.id, { progress: p.progress, updates: [] as ProjectRT['updates'] }]));

export const fmtTime = (m: number) => {
  const mm = Math.floor(m) % (24 * 60);
  return `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`;
};

export const useStore = create<State>((set, get) => ({
  simMinute: SIM_START_MIN,
  speed: 1,
  view: 'operational',
  selected: null,
  hovered: null,
  overlay: { kind: 'none' },
  agents: initialAgents,
  projects: initialProjects,
  extraProjects: [],
  tasks: [],
  feed: [
    { id: feedId++, at: SIM_START_MIN, text: 'Jornada iniciada. El equipo revisó la cartera y el tablero de tareas.', kind: 'info' },
  ],
  alerts: SEED_ALERTS.map((a) => ({ ...a, at: SIM_START_MIN })),
  alertsSeen: 0,
  decisions: SEED_DECISIONS,
  chats: {},
  focus: { kind: 'home', nonce: 0 },
  packets: [],
  command: null,
  leftOpen: true,
  toast: null,
  meetingNow: null,

  setSpeed: (speed) => set({ speed }),
  setView: (view) => set({ view }),
  select: (selected) => set({ selected }),
  hover: (hovered) => set({ hovered }),
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: { kind: 'none' } }),
  setAgent: (id, patch) => set((s) => ({ agents: { ...s.agents, [id]: { ...s.agents[id], ...patch } } })),
  log: (text, agent, kind) =>
    set((s) => ({ feed: [{ id: feedId++, at: s.simMinute, agent, text, kind }, ...s.feed].slice(0, 120) })),
  alert: (a) => set((s) => ({ alerts: [{ ...a, id: `al${alertId++}`, at: s.simMinute }, ...s.alerts] })),
  markAlertsSeen: () => set((s) => ({ alertsSeen: s.alerts.length })),
  bumpProject: (id, delta, update) =>
    set((s) => {
      const p = s.projects[id];
      if (!p) return {};
      return {
        projects: {
          ...s.projects,
          [id]: {
            progress: Math.min(100, Math.round((p.progress + delta) * 10) / 10),
            updates: update ? [{ at: s.simMinute, text: update }, ...p.updates].slice(0, 20) : p.updates,
          },
        },
      };
    }),
  addTask: (t) => {
    const task: Task = { ...t, id: `APP-${String(taskSeq++).padStart(3, '0')}`, stage: 'queued', progress: 0, createdAt: get().simMinute };
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },
  updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  addDecision: (d) => set((s) => ({ decisions: [{ ...d, id: `dc${Date.now()}${Math.random().toString(36).slice(2, 5)}` }, ...s.decisions] })),
  resolveDecision: (id, choice) => {
    const d = get().decisions.find((x) => x.id === id);
    set((s) => ({ decisions: s.decisions.map((x) => (x.id === id ? { ...x, resolved: choice } : x)) }));
    if (d) {
      get().log(`Decisión registrada: ${d.title} → ${choice}.`, 'pmo', 'info');
      if (d.taskId) get().updateTask(d.taskId, { stage: 'done', progress: 100 });
      get().alert({ level: 'done', text: `Decisión tomada: ${d.title}.`, source: 'Simulación', target: d.project ? { kind: 'project', id: d.project } : undefined });
    }
  },
  say: (agent, msg) => set((s) => ({ chats: { ...s.chats, [agent]: [...(s.chats[agent] ?? []), msg] } })),
  flyTo: (kind, id) => set((s) => ({ focus: { kind, id, nonce: s.focus.nonce + 1 } })),
  sendPacket: (p) => set((s) => ({ packets: [...s.packets, { ...p, id: packetId++, born: performance.now() }] })),
  dropPacket: (id) => set((s) => ({ packets: s.packets.filter((p) => p.id !== id) })),
  setCommand: (command) => set({ command }),
  setLeftOpen: (leftOpen) => set({ leftOpen }),
  notify: (text) => set((s) => ({ toast: { text, nonce: (s.toast?.nonce ?? 0) + 1 } })),
  setMeeting: (meetingNow) => set({ meetingNow }),
  addProject: (p) =>
    set((s) => ({ extraProjects: [...s.extraProjects, p], projects: { ...s.projects, [p.id]: { progress: p.progress, updates: [] } } })),
  tick: (simMinute) => set({ simMinute }),
}));

export const allProjects = (extra: ProjectDef[]) => [...PROJECTS, ...extra];
