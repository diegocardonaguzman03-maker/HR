import { create } from 'zustand';
import type { CameraPresetId, NavigatorGroupId } from '../types/process';
import type { EquipmentId, LearningLevel } from '../types/equipment';
import { clock, steps } from '../sim/clock';

export type AppMode = 'explore' | 'guided' | 'follow';

export type LayerId =
  | 'processFlow'
  | 'equipment'
  | 'steelFlow'
  | 'cooling'
  | 'electrical'
  | 'gas'
  | 'safety'
  | 'quality'
  | 'maintenance'
  | 'temperature';

export const LAYERS: { id: LayerId; label: string }[] = [
  { id: 'processFlow', label: 'Flujo del proceso' },
  { id: 'equipment', label: 'Equipos' },
  { id: 'steelFlow', label: 'Flujo del acero' },
  { id: 'cooling', label: 'Sistema de enfriamiento' },
  { id: 'electrical', label: 'Eléctrico / energía' },
  { id: 'gas', label: 'Gas / oxígeno' },
  { id: 'safety', label: 'Seguridad' },
  { id: 'quality', label: 'Calidad' },
  { id: 'maintenance', label: 'Mantenimiento' },
  { id: 'temperature', label: 'Temperatura' },
];

export interface CameraRequest {
  kind: 'preset' | 'equipment' | 'fit';
  preset?: CameraPresetId;
  equipment?: EquipmentId;
  nonce: number;
}

export type PanelId = 'navigator' | 'help' | 'layers' | 'minimap';

interface AppState {
  started: boolean;
  panels: Record<PanelId, boolean>;
  startGame(mode: AppMode): void;
  togglePanel(id: PanelId, value?: boolean): void;
  mode: AppMode;
  playing: boolean;
  speed: number;
  stepIndex: number;
  /** Mirrors clock.stepTime at ~10 Hz for the UI. */
  uiTime: number;
  selected: EquipmentId | null;
  selectedComponent: string | null;
  hovered: { id: EquipmentId; component?: string; x: number; y: number } | null;
  componentMode: boolean;
  explode: number;
  xray: boolean;
  level: LearningLevel;
  layers: Record<LayerId, boolean>;
  cameraRequest: CameraRequest | null;
  followCamera: boolean;
  markerFocus: { layer: LayerId; id: string } | null;
  sectionS: number;
  sectionOpen: boolean;
  setSection(s: number, open?: boolean): void;

  setMode(mode: AppMode): void;
  play(): void;
  pause(): void;
  togglePlay(): void;
  setSpeed(speed: number): void;
  goToStep(index: number, moveCamera?: boolean): void;
  goToGroup(group: NavigatorGroupId): void;
  next(): void;
  prev(): void;
  restart(): void;
  syncFromClock(): void;
  select(id: EquipmentId | null, component?: string | null): void;
  setHovered(h: AppState['hovered']): void;
  setComponentMode(on: boolean): void;
  setExplode(v: number): void;
  setXray(on: boolean): void;
  setLevel(l: LearningLevel): void;
  toggleLayer(id: LayerId): void;
  requestCamera(r: Omit<CameraRequest, 'nonce'>): void;
  setMarkerFocus(m: AppState['markerFocus']): void;
  /** Equipment the learner has opened at least once (game progress). */
  inspected: EquipmentId[];
  /** Guided / follow run reached the finished slab. */
  missionComplete: boolean;
  dismissMission(): void;
  quizOpen: boolean;
  setQuizOpen(open: boolean): void;
  /** Spoken narration of each step (browser speech synthesis). */
  narration: boolean;
  setNarration(on: boolean): void;
}

const defaultLayers: Record<LayerId, boolean> = {
  processFlow: true, equipment: true, steelFlow: true, cooling: false, electrical: false,
  gas: false, safety: false, quality: false, maintenance: false, temperature: false,
};

let nonce = 0;

export const useAppStore = create<AppState>((set, get) => ({
  started: false,
  panels: { navigator: false, help: false, layers: false, minimap: true },
  startGame(mode) {
    set({ started: true });
    get().restart();
    get().setMode(mode);
  },
  togglePanel(id, value) {
    set({ panels: { ...get().panels, [id]: value ?? !get().panels[id] } });
  },
  mode: 'explore',
  playing: false,
  speed: 1,
  stepIndex: 0,
  uiTime: 0,
  selected: null,
  selectedComponent: null,
  hovered: null,
  componentMode: false,
  explode: 0,
  xray: false,
  level: 3,
  layers: defaultLayers,
  cameraRequest: { kind: 'preset', preset: 'overview', nonce: 0 },
  followCamera: false,
  markerFocus: null,
  sectionS: 6,
  sectionOpen: false,
  setSection(sectionS, open) {
    set({ sectionS, sectionOpen: open ?? get().sectionOpen });
  },

  setMode(mode) {
    set({ mode, followCamera: mode === 'follow' });
    if (mode === 'guided' || mode === 'follow') {
      if (get().stepIndex >= steps().length - 1 && clock.stepTime >= steps()[steps().length - 1].duration) get().restart();
      set({ selected: null, componentMode: false });
      get().goToStep(get().stepIndex, mode === 'guided');
      get().play();
    } else {
      get().pause();
      get().requestCamera({ kind: 'preset', preset: 'overview' });
    }
  },
  play() {
    clock.playing = true;
    set({ playing: true });
  },
  pause() {
    clock.playing = false;
    set({ playing: false });
  },
  togglePlay() {
    if (get().playing) get().pause();
    else get().play();
  },
  setSpeed(speed) {
    clock.speed = speed;
    set({ speed });
  },
  goToStep(index, moveCamera = true) {
    const s = steps();
    const i = Math.max(0, Math.min(s.length - 1, index));
    clock.stepIndex = i;
    clock.stepTime = 0;
    set({ stepIndex: i, uiTime: 0 });
    if (moveCamera && get().mode !== 'follow') get().requestCamera({ kind: 'preset', preset: s[i].camera });
  },
  goToGroup(group) {
    const i = steps().findIndex((s) => s.navigatorGroup === group);
    if (i >= 0) get().goToStep(i, true);
  },
  next() {
    get().goToStep(get().stepIndex + 1);
  },
  prev() {
    get().goToStep(get().stepIndex - 1);
  },
  restart() {
    clock.elapsed = 0;
    set({ missionComplete: false });
    get().goToStep(0);
  },
  syncFromClock() {
    const st = get();
    if (st.stepIndex !== clock.stepIndex) {
      set({ stepIndex: clock.stepIndex, uiTime: clock.stepTime });
      if (st.mode === 'guided') get().requestCamera({ kind: 'preset', preset: steps()[clock.stepIndex].camera });
    } else set({ uiTime: clock.stepTime });
    if (!clock.playing && st.playing) {
      set({ playing: false });
      const s = steps();
      const finished = clock.stepIndex === s.length - 1 && clock.stepTime >= s[s.length - 1].duration;
      if (finished && st.mode !== 'explore') set({ missionComplete: true });
    }
  },
  select(id, component = null) {
    set({ selected: id, selectedComponent: component, markerFocus: null });
    if (id && !get().inspected.includes(id)) set({ inspected: [...get().inspected, id] });
    if (id && !component) get().requestCamera({ kind: 'equipment', equipment: id });
    if (!id) set({ componentMode: false, explode: 0 });
  },
  setHovered(h) {
    set({ hovered: h });
  },
  setComponentMode(on) {
    set({ componentMode: on, explode: on ? get().explode : 0, selectedComponent: on ? get().selectedComponent : null });
  },
  setExplode(v) {
    set({ explode: v });
  },
  setXray(on) {
    set({ xray: on });
  },
  setLevel(level) {
    set({ level });
  },
  toggleLayer(id) {
    set({ layers: { ...get().layers, [id]: !get().layers[id] } });
  },
  requestCamera(r) {
    set({ cameraRequest: { ...r, nonce: ++nonce } });
  },
  setMarkerFocus(m) {
    set({ markerFocus: m });
  },
  inspected: [],
  missionComplete: false,
  dismissMission() {
    set({ missionComplete: false });
  },
  quizOpen: false,
  setQuizOpen(open) {
    if (open) get().pause();
    set({ quizOpen: open, missionComplete: false });
  },
  narration: false,
  setNarration(on) {
    set({ narration: on });
  },
}));
