/**
 * Plant layout (metres, Y up, X = direction of material flow).
 * All positions are GENERIC educational placements (ASSUMPTION) — not a real plant layout.
 * Equipment dimensions follow the reference configuration (docs/process-assumptions.md).
 */
import type { CameraPresetId } from '../types/process';

type V3 = [number, number, number];

export const LAYOUT = {
  rawMaterials: { position: [-60, 0, 0] as V3, driSilo: [-50, 0, -9] as V3 },
  eaf: {
    position: [-38, 0, 0] as V3,
    platformHeight: 5,
    shellRadius: 3.65,
    shellHeight: 4.2,
    /** Tapping (EBT) side offset along +X. */
    tapOffsetX: 3.3,
    transformer: [-38, 0, -10] as V3,
  },
  ladle: { radius: 1.9, height: 3.8, tapPosition: [-33.8, 0, 0] as V3 },
  ladleFurnace: { position: [-18, 0, 0] as V3 },
  crane: { height: 22, span: [-22, 12] as [number, number] },
  turret: { position: [5, 0, 0] as V3, armRadius: 7, ladleBaseY: 14.6 },
  tundish: { position: [10.5, 12.3, 0] as V3, length: 7, width: 1.8, depth: 1.3, senX: 9, pourX: 12 },
  mold: { meniscus: [9, 11.5, 0] as V3, length: 0.9, width: 1.5 },
  strand: {
    /** Visual thickness exaggeration for legibility (documented in docs/3d-assets.md). */
    thicknessScale: 1.6,
    thickness: 0.23,
    width: 1.5,
    radius: 9.5,
    /** s where the vertical mold section ends and the bow starts. */
    verticalLength: 0.8,
    cutPosition: 36,
    slabLength: 10,
    totalLength: 50,
  },
  slabYard: [56, 0, 6] as V3,
} as const;

export interface CameraPreset {
  position: V3;
  target: V3;
  label: string;
}

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  overview: { position: [-2, 58, 88], target: [-4, 4, 0], label: 'Vista general de la planta' },
  rawMaterials: { position: [-80, 22, 34], target: [-55, 3, -2], label: 'Materias primas' },
  eaf: { position: [-27, 16, 17], target: [-37, 7, 0], label: 'Horno de arco eléctrico' },
  secondary: { position: [-4, 15, 22], target: [-18, 4, 0], label: 'Metalurgia secundaria' },
  transfer: { position: [-6, 32, 46], target: [-6, 11, 0], label: 'Traslado de olla' },
  caster: { position: [30, 26, 44], target: [16, 7, 0], label: 'Máquina de colada' },
  tundish: { position: [18, 18, 13], target: [10, 12.3, 0], label: 'Distribuidor' },
  mold: { position: [11.8, 11.9, 3.4], target: [9, 10.9, 0], label: 'Molde' },
  strand: { position: [26, 11, 26], target: [17, 5, 0], label: 'Barra' },
  crossSection: { position: [22, 10, 20], target: [15, 5.5, 0], label: 'Sección de la barra' },
  straightener: { position: [28, 8, 16], target: [19.5, 2, 0], label: 'Enderezado' },
  cutting: { position: [47, 8, 14], target: [39, 1.2, 0], label: 'Zona de oxicorte' },
  slab: { position: [64, 12, 22], target: [50, 1, 2], label: 'Planchón' },
};
