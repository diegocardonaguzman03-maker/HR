import { create } from 'zustand';
import type { CameraT, MissionT } from './schema';

export type View = 'path' | 'intro' | 'play' | 'complete' | 'procedures';
export type Phase = 'intro' | 'show' | 'try' | 'done';
export type Drawer = null | 'why' | 'procedure' | 'ask';
export interface StepResult { mistakes: number; done: boolean; wrong?: string[] }
export interface Feedback { kind: 'ok' | 'bad' | 'info' | 'warn'; title: string; text: string; key: number }
export interface Marker { objectId: string; kind: 'found' | 'hint' | 'wrong' | 'selected' | 'tap'; label?: string }

interface S {
  view: View;
  missionId: string | null;
  stepIdx: number;
  phase: Phase;
  results: Record<string, StepResult>;
  startedAt: number;
  endedAt: number;
  /** objetos clicables en el paso actual (solo esos reaccionan) */
  interactive: string[];
  /** objetos resaltados (demostración, foco) */
  focus: string[];
  markers: Marker[];
  /** zonas de inspección activas: objectId → estado por zona */
  zones: { objectId: string; states: Record<string, 'pending' | 'ok' | 'defect'> } | null;
  click: { id: string; key: number } | null;
  camera: { cam: CameraT; key: number } | null;
  caption: string | null;
  demo: boolean;
  drawer: Drawer;
  feedback: Feedback | null;
  sceneFlags: Record<string, string | number | boolean>;
  listMode: boolean;
  set: (p: Partial<S>) => void;
  flyTo: (cam: CameraT) => void;
  toast: (kind: Feedback['kind'], title: string, text: string) => void;
  pick: (id: string) => void;
  start: (m: MissionT, resume?: boolean) => void;
  record: (stepId: string, r: StepResult) => void;
  resetStepScene: () => void;
}

let k = 0;
const KEY = (id: string) => `adx.mission.${id}`;
export function savedProgress(id: string): { stepIdx: number; results: Record<string, StepResult>; startedAt: number } | null {
  try { const v = localStorage.getItem(KEY(id)); return v ? JSON.parse(v) : null; } catch { return null; }
}
export function completedMissions(): string[] {
  try { return JSON.parse(localStorage.getItem('adx.missions.done') ?? '[]'); } catch { return []; }
}
export function markCompleted(id: string) {
  try { const d = new Set(completedMissions()); d.add(id); localStorage.setItem('adx.missions.done', JSON.stringify([...d])); localStorage.removeItem(KEY(id)); } catch { /* sin almacenamiento */ }
}

export const useMission = create<S>((set, get) => ({
  view: 'path', missionId: null, stepIdx: 0, phase: 'intro', results: {}, startedAt: 0, endedAt: 0,
  interactive: [], focus: [], markers: [], zones: null, click: null, camera: null, caption: null, demo: false,
  drawer: null, feedback: null, sceneFlags: {}, listMode: false,
  set: (p) => {
    set(p);
    const s = get();
    if (s.missionId && s.view === 'play' && ('stepIdx' in p || 'results' in p)) {
      try { localStorage.setItem(KEY(s.missionId), JSON.stringify({ stepIdx: s.stepIdx, results: s.results, startedAt: s.startedAt })); } catch { /* */ }
    }
  },
  flyTo: (cam) => set({ camera: { cam, key: ++k } }),
  toast: (kind, title, text) => set({ feedback: { kind, title, text, key: ++k } }),
  pick: (id) => set({ click: { id, key: ++k } }),
  start: (m, resume) => {
    const saved = resume ? savedProgress(m.id) : null;
    if (!resume) { try { localStorage.removeItem(KEY(m.id)); } catch { /* */ } }
    set({ view: 'play', missionId: m.id, stepIdx: saved?.stepIdx ?? 0, results: saved?.results ?? {}, startedAt: saved?.startedAt ?? Date.now(), endedAt: 0, phase: 'intro', drawer: null, feedback: null, sceneFlags: {} });
  },
  record: (stepId, r) => get().set({ results: { ...get().results, [stepId]: r } }),
  resetStepScene: () => set({ interactive: [], focus: [], markers: [], zones: null, caption: null, demo: false, feedback: null }),
}));
