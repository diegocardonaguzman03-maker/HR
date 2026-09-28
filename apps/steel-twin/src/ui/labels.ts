import type { MaterialState } from '../types/process';
import type { Classification, HazardCategory } from '../types/equipment';

export const MATERIAL_STATE_LABEL: Record<MaterialState, string> = {
  SOLID_RAW_MATERIAL: 'Solid raw material',
  PARTIALLY_MELTED: 'Partially melted',
  LIQUID_STEEL: 'Liquid steel',
  REFINED_LIQUID_STEEL: 'Refined liquid steel',
  LIQUID_IN_LADLE: 'Liquid steel in ladle',
  LIQUID_IN_TUNDISH: 'Liquid steel in tundish',
  LIQUID_IN_MOLD: 'Liquid steel in mold',
  THIN_SHELL_LIQUID_CORE: 'Thin shell + liquid core',
  THICK_SHELL_REDUCED_CORE: 'Thick shell + reduced core',
  FINAL_SOLIDIFICATION: 'Final solidification',
  SOLID_SLAB: 'Solid slab',
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
  INDUSTRY_STANDARD: { label: 'Industry standard', cls: 'text-emerald-300 border-emerald-400/40' },
  CONFIGURABLE: { label: 'Configurable', cls: 'text-sky-300 border-sky-400/40' },
  PLANT_SPECIFIC: { label: 'Plant-specific · confirm', cls: 'text-amber-300 border-amber-400/40' },
  ASSUMPTION: { label: 'Assumption', cls: 'text-zinc-300 border-zinc-400/40' },
};

export const HAZARD_LABEL: Record<HazardCategory, string> = {
  'molten-metal': 'Molten metal',
  'high-temperature': 'High temperature',
  electrical: 'Electrical energy',
  'moving-machinery': 'Moving machinery',
  'stored-energy': 'Stored energy',
  oxygen: 'Oxygen',
  gas: 'Gas',
  'water-molten-metal': 'Water / molten metal',
  'suspended-loads': 'Suspended loads',
  hydraulic: 'Hydraulic systems',
  'pinch-points': 'Pinch points',
  radiation: 'Radiation',
  'noise-dust': 'Noise / dust',
};
