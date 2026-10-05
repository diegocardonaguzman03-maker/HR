import { create } from 'zustand';
import type { LoadProgress } from '../lib/three/loadModel';

export const useLoad = create<LoadProgress & { set: (p: LoadProgress) => void }>((set) => ({
  phase: 'download', loaded: 0, total: 0,
  set: (p) => set(p),
}));
