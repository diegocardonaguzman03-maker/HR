import type { MaterialState } from '../types/process';
import type { Classification, HazardCategory } from '../types/equipment';

export const MATERIAL_STATE_LABEL: Record<MaterialState, string> = {
  SOLID_RAW_MATERIAL: 'DRI sólido',
  PARTIALLY_MELTED: 'Parcialmente fundido',
  LIQUID_STEEL: 'Acero líquido',
  REFINED_LIQUID_STEEL: 'Acero líquido afinado',
  LIQUID_IN_LADLE: 'Acero líquido en olla',
  LIQUID_IN_TUNDISH: 'Acero líquido en distribuidor',
  LIQUID_IN_MOLD: 'Acero líquido en molde',
  THIN_SHELL_LIQUID_CORE: 'Costra delgada + núcleo líquido',
  THICK_SHELL_REDUCED_CORE: 'Costra gruesa + núcleo reducido',
  FINAL_SOLIDIFICATION: 'Solidificación final',
  SOLID_SLAB: 'Planchón sólido',
};

/** Ordered visual state model (brief §7) — used by the state strip. */
export const MATERIAL_STATE_ORDER: MaterialState[] = [
  'SOLID_RAW_MATERIAL', 'PARTIALLY_MELTED', 'LIQUID_STEEL', 'REFINED_LIQUID_STEEL', 'LIQUID_IN_LADLE',
  'LIQUID_IN_TUNDISH', 'LIQUID_IN_MOLD', 'THIN_SHELL_LIQUID_CORE', 'THICK_SHELL_REDUCED_CORE', 'FINAL_SOLIDIFICATION', 'SOLID_SLAB',
];

/** Colour swatch per material state (solid grey → incandescent → solid). */
export const MATERIAL_STATE_COLOR: Record<MaterialState, string> = {
  SOLID_RAW_MATERIAL: '#6b5a4e',
  PARTIALLY_MELTED: '#b3471a',
  LIQUID_STEEL: '#ff6a00',
  REFINED_LIQUID_STEEL: '#ff8a1c',
  LIQUID_IN_LADLE: '#ff8a1c',
  LIQUID_IN_TUNDISH: '#ff9a2e',
  LIQUID_IN_MOLD: '#ffa640',
  THIN_SHELL_LIQUID_CORE: '#e0550f',
  THICK_SHELL_REDUCED_CORE: '#a3280d',
  FINAL_SOLIDIFICATION: '#6d2410',
  SOLID_SLAB: '#4b5159',
};

export const CLASSIFICATION_LABEL: Record<Classification, { label: string; cls: string }> = {
  INDUSTRY_STANDARD: { label: 'Estándar de la industria', cls: 'text-emerald-300 border-emerald-400/40' },
  CONFIGURABLE: { label: 'Configurable', cls: 'text-sky-300 border-sky-400/40' },
  PLANT_SPECIFIC: { label: 'Propio de planta · confirmar', cls: 'text-amber-300 border-amber-400/40' },
  ASSUMPTION: { label: 'Supuesto', cls: 'text-zinc-300 border-zinc-400/40' },
};

export const HAZARD_LABEL: Record<HazardCategory, string> = {
  'molten-metal': 'Metal fundido',
  'high-temperature': 'Alta temperatura',
  electrical: 'Energía eléctrica',
  'moving-machinery': 'Maquinaria en movimiento',
  'stored-energy': 'Energía almacenada',
  oxygen: 'Oxígeno',
  gas: 'Gas',
  'water-molten-metal': 'Agua / metal fundido',
  'suspended-loads': 'Cargas suspendidas',
  hydraulic: 'Sistemas hidráulicos',
  'pinch-points': 'Puntos de atrapamiento',
  radiation: 'Radiación',
  'noise-dust': 'Ruido / polvo',
};
