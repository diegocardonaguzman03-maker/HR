/**
 * Shared equipment information schema.
 * Technical content lives in /src/data/equipment and never inside 3D components.
 */

/** Provenance of every technical statement (see /docs/process-assumptions.md). */
export type Classification =
  | 'INDUSTRY_STANDARD' // generally true for EAF / slab-caster steelmaking
  | 'CONFIGURABLE' // depends on the chosen plant configuration, editable in config
  | 'PLANT_SPECIFIC' // must be confirmed with the real plant before use
  | 'ASSUMPTION'; // educational placeholder chosen by the team

export type EquipmentCategory =
  | 'raw-materials'
  | 'direct-reduction'
  | 'steelmaking'
  | 'secondary-metallurgy'
  | 'handling'
  | 'casting'
  | 'cooling'
  | 'cutting'
  | 'product';

/** Learning depth levels (Agent 5). */
export type LearningLevel = 1 | 2 | 3 | 4 | 5;

export interface EquipmentComponent {
  id: string;
  name: string;
  /** Level 1: what is it (one sentence). */
  function: string;
  /** Maintenance view (Agent 4). No frequencies are ever invented. */
  failureModes?: string[];
  inspectionPoints?: string[];
  maintenanceConsiderations?: string[];
  processConsequence?: string;
}

export interface ProcessVariableDef {
  /** Key used by the ProcessDataProvider snapshot (e.g. 'eaf.bathTemperature'). */
  key: string;
  name: string;
  unit: string;
  /** Why this variable matters (Level 3). */
  role: string;
  /** Educational range only. Always labelled SIMULATED TRAINING DATA in the UI. */
  trainingRange?: string;
  classification: Classification;
}

export interface QualityLink {
  variable: string;
  mechanism: string; // conceptual, multi-causal explanation
  possibleDefects: string[];
}

export type HazardCategory =
  | 'molten-metal'
  | 'high-temperature'
  | 'electrical'
  | 'moving-machinery'
  | 'stored-energy'
  | 'oxygen'
  | 'gas'
  | 'water-molten-metal'
  | 'suspended-loads'
  | 'hydraulic'
  | 'pinch-points'
  | 'radiation'
  | 'noise-dust';

export interface SafetyHazard {
  category: HazardCategory;
  description: string; // generic hazard only; plant procedures are integrated separately
}

export interface MaintenancePoint {
  component: string;
  function: string;
  failureMode: string;
  inspectionPoints: string[];
  considerations: string;
  processConsequence: string;
}

export interface Specification {
  label: string;
  value: string;
  classification: Classification;
}

export interface WhatCanGoWrong {
  event: string;
  consequence: string;
  typicalResponse: string; // generic industry response, not a plant procedure
}

export interface EquipmentData {
  id: EquipmentId;
  name: string;
  shortName: string;
  category: EquipmentCategory;
  /** Process stages (ids from processConfig) where this equipment operates. */
  processStages: string[];
  /** Short hover tooltip: primary function in one sentence. */
  tooltip: string;
  /** Level 1 — What is this? */
  description: string;
  purpose: string;
  /** Level 2 — How does it work? (ordered short paragraphs) */
  howItWorks: string[];
  inputs: string[];
  outputs: string[];
  components: EquipmentComponent[];
  /** Level 3 — What process variables control it? */
  processVariables: ProcessVariableDef[];
  /** Level 4 — What can go wrong? */
  whatCanGoWrong: WhatCanGoWrong[];
  /** Level 5 — Impact on safety, quality, reliability, productivity. */
  impact: { safety: string; quality: string; reliability: string; productivity: string };
  qualityImpact: QualityLink[];
  safetyHazards: SafetyHazard[];
  maintenancePoints: MaintenancePoint[];
  specifications: Specification[];
  references: string[];
}

export type EquipmentId =
  | 'pelletYard'
  | 'hyl'
  | 'midrex'
  | 'rawMaterials'
  | 'eaf'
  | 'ladle'
  | 'ladleFurnace'
  | 'crane'
  | 'turret'
  | 'tundish'
  | 'mold'
  | 'segments'
  | 'coolingSystem'
  | 'torchCutter'
  | 'slab';
