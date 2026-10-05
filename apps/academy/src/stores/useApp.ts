import { create } from 'zustand';
import type { CameraT } from '../types/content';
import { idx } from '../lib/content';

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
  /** petición a la cámara: ir a una vista, encuadrar nodos o girar/acercar (controles de teclado) */
  cameraRequest: { camera?: CameraT; fitNodes?: string[]; rotate?: number; dolly?: number; key: number } | null;
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
  orbit: (rotate: number, dolly: number) => void;
  toggleHidden: (node: string) => void;
  resetView: () => void;
}

let k = 0;
export const QUALITIES: readonly Quality[] = ['auto', 'low', 'medium', 'high'];
export const isQuality = (q: unknown): q is Quality => typeof q === 'string' && (QUALITIES as readonly string[]).includes(q);
/** Un valor desconocido en localStorage (p. ej. de una versión anterior) cae a 'auto' (RT-SW-02). */
const initialQuality = (): Quality => {
  try { const q = localStorage.getItem('adx.quality'); return isQuality(q) ? q : 'auto'; } catch { return 'auto'; }
};

/**
 * Nodos 3D de un equipo según el contrato de contenido (`equipment.nodeNames`), nunca derivados del ID (RT-SW-01).
 * Devuelve [] si el equipo no existe.
 */
const NO_NODES: readonly string[] = Object.freeze([]);
export function nodesForEquipment(id: string | null | undefined): readonly string[] {
  return (id && idx.equipment.get(id)?.nodeNames) || NO_NODES;
}
/** ¿El nodo `name` pertenece a alguno de `nodes` (es el mismo o un descendiente por nombre, p. ej. eaf__arms_clamp ⊂ eaf__arms)? */
export const nodeMatches = (name: string, nodes: readonly string[]) => nodes.some((n) => name === n || name.startsWith(n + '_'));
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
  setMode: (mode) => {
    const changed = get().mode !== mode;
    set({
      mode, focusNodes: [], picking: false, lastPick: null,
      // UX-02: al cambiar de modo no se arrastra la selección del modo anterior
      ...(changed ? { selectedEq: null, selectedComponentNode: null, hoverNode: null } : {}),
      ...(changed && mode !== 'explore' ? { selectedStage: null } : {}),
      // UX-08: las lecciones y la instrucción parten de una vista completa (nada oculto ni aislado)
      ...(changed && (mode === 'learn' || mode === 'perform') ? { hidden: [], isolate: false, explode: 0 } : {}),
    });
  },
  selectEquipment: (id, opts) => {
    set({ selectedEq: id, selectedStage: null, selectedComponentNode: null, tab: opts?.tab ?? 'overview' });
    const nodes = nodesForEquipment(id);
    if (nodes.length && opts?.fly !== false) get().fitNodes([...nodes]);
  },
  selectStage: (id) => set({ selectedStage: id, selectedEq: null, selectedComponentNode: null }),
  flyTo: (camera) => set({ cameraRequest: { camera, key: ++k } }),
  fitNodes: (nodes) => set({ cameraRequest: { fitNodes: nodes, key: ++k } }),
  orbit: (rotate, dolly) => set({ cameraRequest: { rotate, dolly, key: ++k } }),
  toggleHidden: (node) => set({ hidden: get().hidden.includes(node) ? get().hidden.filter((n) => n !== node) : [...get().hidden, node] }),
  resetView: () => set({ xray: false, section: false, explode: 0, isolate: false, hidden: [], cameraRequest: { camera: HOME, key: ++k } }),
}));

export const HOME: CameraT = { position: [25, 15, 27], target: [-3, 2.5, 0] };
