import type { EquipmentId } from './equipment';

/** Deterministic educational state machine states (docs/process-flow.md). */
export type SimState =
  | 'IDLE'
  | 'RAW_MATERIALS'
  | 'CHARGING'
  | 'ARC_IGNITION'
  | 'MELTING'
  | 'REFINING'
  | 'TAPPING'
  | 'SECONDARY_METALLURGY'
  | 'VACUUM_TREATMENT' // optional, disabled in the reference configuration
  | 'TRANSFER'
  | 'TURRET'
  | 'TUNDISH_FILL'
  | 'MOLD_FILL'
  | 'SHELL_FORMATION'
  | 'SECONDARY_COOLING'
  | 'SOLIDIFICATION'
  | 'STRAIGHTENING'
  | 'FINAL_SOLIDIFICATION'
  | 'CUTTING'
  | 'COMPLETE';

/** Visual state model of the steel (section 7 of the brief). */
export type MaterialState =
  | 'SOLID_RAW_MATERIAL'
  | 'PARTIALLY_MELTED'
  | 'LIQUID_STEEL'
  | 'REFINED_LIQUID_STEEL'
  | 'LIQUID_IN_LADLE'
  | 'LIQUID_IN_TUNDISH'
  | 'LIQUID_IN_MOLD'
  | 'THIN_SHELL_LIQUID_CORE'
  | 'THICK_SHELL_REDUCED_CORE'
  | 'FINAL_SOLIDIFICATION'
  | 'SOLID_SLAB';

export type CameraPresetId =
  | 'overview'
  | 'rawMaterials'
  | 'eaf'
  | 'secondary'
  | 'transfer'
  | 'caster'
  | 'tundish'
  | 'mold'
  | 'strand'
  | 'crossSection'
  | 'straightener'
  | 'cutting'
  | 'slab';

export interface ProcessStepConfig {
  state: SimState;
  /** Two-digit guided step number is derived from order. */
  title: string;
  /** Navigator group (11 groups, section 15). */
  navigatorGroup: NavigatorGroupId;
  enabled: boolean;
  optional?: boolean;
  /** Seconds at 1x speed. */
  duration: number;
  camera: CameraPresetId;
  activeEquipment: EquipmentId[];
  materialStates: MaterialState[];
  whatHappens: string;
  why: string;
}

export type NavigatorGroupId =
  | 'raw'
  | 'melting'
  | 'refining'
  | 'tapping'
  | 'secondary'
  | 'castingPrep'
  | 'mold'
  | 'solidification'
  | 'straightening'
  | 'cutting'
  | 'slab';

export interface NavigatorGroup {
  id: NavigatorGroupId;
  number: string;
  label: string;
  timelineLabel: string;
}

/** A simulated (or, in the future, real) process value. */
export interface ProcessValue {
  value: number;
  unit: string;
  decimals: number;
  label: string;
  /** true for every value produced by SimulationDataProvider. */
  simulated: boolean;
}

export interface ProcessSnapshot {
  state: SimState;
  /** 0..1 progress inside the current state. */
  progress: number;
  heatId: string;
  materialState: MaterialState;
  location: string;
  currentEquipment: EquipmentId | null;
  steelTemperature: ProcessValue;
  variables: Record<string, ProcessValue>;
  /** Continuous-casting specific geometry drivers (metres along strand). */
  strand: {
    castLength: number; // how far the strand head has advanced
    solidificationFront: number; // metallurgical length reached so far
    cutCount: number;
  };
}
