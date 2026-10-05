import { create } from 'zustand';
import type { CameraT } from '../types/content';

export type Mode = 'explore' | 'learn' | 'perform' | 'assess' | 'library';
export type Quality = 'auto' | 'low' | 'medium' | 'high';
export type EffectiveQuality = Exclude<Quality, 'auto'>;
export type Tab = 'overview' | 'operation' | 'components' | 'safety' | 'controls' | 'maintenance' | 'training' | 'documents' | 'videos';

export interface AppState {
  mode: Mode;
  selectedEq: string | null;
  selectedStage: string | null;
  selectedComponentNode: string | null;
  hoverNode: string | null;
  tab: Tab;
  /** nodos a resaltar por la lección o la instrucción activa */
  focusNodes: string[];
  xray: boolean;
  section: boolean;
  explode: number;
  isolate: boolean;
  hidden: string[];
  hotspotsVisible: boolean;
  arcDemo: boolean;
  quality: Quality;
  effective: EffectiveQuality;
  cameraRequest: { camera?: CameraT; fitNodes?: string[]; key: number } | null;
  /** modo de selección para preguntas "identifica en el 3D" */
  picking: boolean;
  lastPick: { eqId: string; key: number } | null;
  assistantOpen: boolean;
  docId: string | null;
  videoId: string | null;
  moduleId: string | null;
  lessonIdx: number;
  wiId: string | null;
  assessmentId: string | null;
  loaded: boolean;
  set: (p: Partial<AppState>) => void;
  setMode: (m: Mode) => void;
  selectEquipment: (id: string | null, opts?: { tab?: Tab; fly?: boolean }) => void;
  selectStage: (id: string | null) => void;
  flyTo: (camera: CameraT) => void;
  fitNodes: (nodes: string[]) => void;
  toggleHidden: (node: string) => void;
  resetView: () => void;
}

let k = 0;
const initialQuality = (): Quality => {
  try { return (localStorage.getItem('adx.quality') as Quality) || 'auto'; } catch { return 'auto'; }
};
const autoStart = (): EffectiveQuality =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches ? 'low' : 'medium';

export const useApp = create<AppState>((set, get) => ({
  mode: 'explore',
  selectedEq: null,
  selectedStage: null,
  selectedComponentNode: null,
  hoverNode: null,
  tab: 'overview',
  focusNodes: [],
  xray: false,
  section: false,
  explode: 0,
  isolate: false,
  hidden: [],
  hotspotsVisible: true,
  arcDemo: false,
  quality: initialQuality(),
  effective: (() => { const q = initialQuality(); return q === 'auto' ? autoStart() : q; })(),
  cameraRequest: null,
  picking: false,
  lastPick: null,
  assistantOpen: false,
  docId: null,
  videoId: null,
  moduleId: null,
  lessonIdx: 0,
  wiId: null,
  assessmentId: null,
  loaded: false,
  set: (p) => set(p),
  setMode: (mode) => set({ mode, focusNodes: [], picking: false }),
  selectEquipment: (id, opts) => {
    set({ selectedEq: id, selectedStage: null, selectedComponentNode: null, tab: opts?.tab ?? 'overview' });
    if (id && opts?.fly !== false) get().fitNodes([`eaf__${id.replace(/^eq\./, '')}`]);
  },
  selectStage: (id) => set({ selectedStage: id, selectedEq: null }),
  flyTo: (camera) => set({ cameraRequest: { camera, key: ++k } }),
  fitNodes: (nodes) => set({ cameraRequest: { fitNodes: nodes, key: ++k } }),
  toggleHidden: (node) => set({ hidden: get().hidden.includes(node) ? get().hidden.filter((n) => n !== node) : [...get().hidden, node] }),
  resetView: () => set({ xray: false, section: false, explode: 0, isolate: false, hidden: [], cameraRequest: { camera: HOME, key: ++k } }),
}));

export const HOME: CameraT = { position: [17, 11, 19], target: [-1.5, 3, 0] };
