/**
 * Editable process configuration (section 4 of the brief).
 * Enable / disable optional operations here; the timeline, navigator,
 * guided mode and simulation are all derived from this list.
 */
import type { NavigatorGroup, ProcessStepConfig, SimState } from '../types/process';

export const NAVIGATOR_GROUPS: NavigatorGroup[] = [
  { id: 'raw', number: '01', label: 'Raw material', timelineLabel: 'Raw material' },
  { id: 'melting', number: '02', label: 'Melting', timelineLabel: 'EAF' },
  { id: 'refining', number: '03', label: 'Refining', timelineLabel: 'Refining' },
  { id: 'tapping', number: '04', label: 'Tapping', timelineLabel: 'Tapping' },
  { id: 'secondary', number: '05', label: 'Secondary metallurgy', timelineLabel: 'LF' },
  { id: 'castingPrep', number: '06', label: 'Casting preparation', timelineLabel: 'Ladle · Tundish' },
  { id: 'mold', number: '07', label: 'Mold', timelineLabel: 'Mold' },
  { id: 'solidification', number: '08', label: 'Solidification', timelineLabel: 'Strand' },
  { id: 'straightening', number: '09', label: 'Straightening', timelineLabel: 'Straightening' },
  { id: 'cutting', number: '10', label: 'Cutting', timelineLabel: 'Cutting' },
  { id: 'slab', number: '11', label: 'Slab', timelineLabel: 'Slab' },
];

/** Strand head position (m from meniscus) at start/end of each casting step. */
export const STRAND_RANGE: Partial<Record<SimState, [number, number]>> = {
  MOLD_FILL: [0.8, 0.8],
  SHELL_FORMATION: [0.8, 2],
  SECONDARY_COOLING: [2, 7],
  SOLIDIFICATION: [7, 14],
  STRAIGHTENING: [14, 18.5],
  FINAL_SOLIDIFICATION: [18.5, 34],
  CUTTING: [34, 46],
  COMPLETE: [46, 46],
};

export const PROCESS_STEPS: ProcessStepConfig[] = [
  {
    state: 'RAW_MATERIALS', title: 'Raw material preparation', navigatorGroup: 'raw', enabled: true, duration: 7,
    camera: 'rawMaterials', activeEquipment: ['rawMaterials'], materialStates: ['SOLID_RAW_MATERIAL'],
    whatHappens: 'Scrap is classified and loaded into the charging bucket; DRI is stored in the silo; lime and dolomite are ready in the flux bins.',
    why: 'The metallic charge and fluxes define how much energy is needed and which residual elements end up in the steel.',
  },
  {
    state: 'CHARGING', title: 'Charging the EAF', navigatorGroup: 'raw', enabled: true, duration: 8,
    camera: 'eaf', activeEquipment: ['crane', 'eaf'], materialStates: ['SOLID_RAW_MATERIAL'],
    whatHappens: 'The roof swings open and the crane empties the scrap bucket into the furnace on top of the liquid hot heel.',
    why: 'A controlled charge protects the furnace bottom and creates the bed that the arcs will melt.',
  },
  {
    state: 'ARC_IGNITION', title: 'Arc ignition', navigatorGroup: 'melting', enabled: true, duration: 6,
    camera: 'eaf', activeEquipment: ['eaf'], materialStates: ['SOLID_RAW_MATERIAL', 'PARTIALLY_MELTED'],
    whatHappens: 'The roof closes, the three graphite electrodes descend and the arcs strike on the scrap: electrical energy becomes heat.',
    why: 'Arcs at several thousand degrees are the main energy source of the EAF.',
  },
  {
    state: 'MELTING', title: 'Melting', navigatorGroup: 'melting', enabled: true, duration: 10,
    camera: 'eaf', activeEquipment: ['eaf'], materialStates: ['PARTIALLY_MELTED', 'LIQUID_STEEL'],
    whatHappens: 'Electrodes bore through the scrap; the bath grows while DRI is fed continuously through the roof and burners/oxygen add chemical energy.',
    why: 'All the solid charge must turn into a homogeneous liquid bath before refining.',
  },
  {
    state: 'REFINING', title: 'Refining & foamy slag', navigatorGroup: 'refining', enabled: true, duration: 9,
    camera: 'eaf', activeEquipment: ['eaf'], materialStates: ['LIQUID_STEEL', 'REFINED_LIQUID_STEEL'],
    whatHappens: 'Oxygen decarburizes the bath; carbon injection foams the slag, which covers the arcs. Phosphorus moves into the basic slag. Temperature is raised to the tapping window.',
    why: 'Refining adjusts carbon, removes phosphorus and reaches the tapping temperature while foamy slag protects the furnace walls.',
  },
  {
    state: 'TAPPING', title: 'Tapping', navigatorGroup: 'tapping', enabled: true, duration: 8,
    camera: 'eaf', activeEquipment: ['eaf', 'ladle'], materialStates: ['REFINED_LIQUID_STEEL', 'LIQUID_IN_LADLE'],
    whatHappens: 'The furnace tilts toward the EBT; steel flows into the preheated ladle while deoxidizers and alloys are added. The furnace tilts back to keep the slag and hot heel inside.',
    why: 'Slag-free tapping protects chemistry and cleanliness downstream.',
  },
  {
    state: 'SECONDARY_METALLURGY', title: 'Secondary metallurgy (LF)', navigatorGroup: 'secondary', enabled: true, duration: 10,
    camera: 'secondary', activeEquipment: ['ladle', 'ladleFurnace'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'At the ladle furnace the steel is reheated by arcs, alloyed, desulfurized under a basic slag, stirred with argon and treated with calcium wire.',
    why: 'The LF sets the final chemistry, temperature and inclusion control required by the caster.',
  },
  {
    state: 'VACUUM_TREATMENT', title: 'Vacuum treatment (optional)', navigatorGroup: 'secondary', enabled: false, optional: true, duration: 8,
    camera: 'secondary', activeEquipment: ['ladle'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'Optional RH/VTD degassing — not part of the reference configuration.',
    why: 'Used for grades needing very low hydrogen, nitrogen or carbon.',
  },
  {
    state: 'TRANSFER', title: 'Ladle transport', navigatorGroup: 'castingPrep', enabled: true, duration: 8,
    camera: 'transfer', activeEquipment: ['crane', 'ladle'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'The casting crane lifts the full ladle by its trunnions and carries it to the caster turret.',
    why: 'The heat must arrive on time and at the right temperature to keep the casting sequence running.',
  },
  {
    state: 'TURRET', title: 'Ladle turret', navigatorGroup: 'castingPrep', enabled: true, duration: 6,
    camera: 'caster', activeEquipment: ['turret', 'ladle'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'The ladle is placed on the turret arm, weighed, and rotated into casting position above the tundish.',
    why: 'The turret allows ladle exchange without stopping the caster (sequence casting).',
  },
  {
    state: 'TUNDISH_FILL', title: 'Tundish filling', navigatorGroup: 'castingPrep', enabled: true, duration: 7,
    camera: 'tundish', activeEquipment: ['ladle', 'tundish'], materialStates: ['LIQUID_IN_LADLE', 'LIQUID_IN_TUNDISH'],
    whatHappens: 'The slide gate opens; steel flows through the argon-shrouded ladle shroud into the tundish until the working level is reached.',
    why: 'The tundish is a buffer and distributor that lets inclusions float and feeds the mold at a steady rate.',
  },
  {
    state: 'MOLD_FILL', title: 'Mold filling', navigatorGroup: 'mold', enabled: true, duration: 6,
    camera: 'mold', activeEquipment: ['tundish', 'mold'], materialStates: ['LIQUID_IN_TUNDISH', 'LIQUID_IN_MOLD'],
    whatHappens: 'The stopper rod opens and steel enters the water-cooled copper mold through the submerged entry nozzle, over the dummy bar head.',
    why: 'Controlled filling and a stable meniscus are the start of a good slab surface.',
  },
  {
    state: 'SHELL_FORMATION', title: 'Initial shell formation', navigatorGroup: 'mold', enabled: true, duration: 8,
    camera: 'mold', activeEquipment: ['mold'], materialStates: ['LIQUID_IN_MOLD', 'THIN_SHELL_LIQUID_CORE'],
    whatHappens: 'Against the oscillating copper plates a thin solid shell forms; mold powder melts on the meniscus and lubricates. Withdrawal starts.',
    why: 'At mold exit the shell must already be strong enough to hold the liquid core.',
  },
  {
    state: 'SECONDARY_COOLING', title: 'Secondary cooling', navigatorGroup: 'solidification', enabled: true, duration: 8,
    camera: 'strand', activeEquipment: ['segments', 'coolingSystem'], materialStates: ['THIN_SHELL_LIQUID_CORE'],
    whatHappens: 'Air-mist sprays cool the strand surface while rolls support the shell against the ferrostatic pressure of the liquid core.',
    why: 'Cooling must be strong enough to grow the shell but gentle enough to avoid cracks.',
  },
  {
    state: 'SOLIDIFICATION', title: 'Progressive solidification', navigatorGroup: 'solidification', enabled: true, duration: 9,
    camera: 'crossSection', activeEquipment: ['segments', 'coolingSystem'], materialStates: ['THIN_SHELL_LIQUID_CORE', 'THICK_SHELL_REDUCED_CORE'],
    whatHappens: 'Along the bow the shell keeps growing (e = K·√t) and the liquid core narrows.',
    why: 'The solidification rate sets how fast the machine can cast and influences internal quality.',
  },
  {
    state: 'STRAIGHTENING', title: 'Straightening', navigatorGroup: 'straightening', enabled: true, duration: 7,
    camera: 'straightener', activeEquipment: ['segments'], materialStates: ['THICK_SHELL_REDUCED_CORE'],
    whatHappens: 'At the end of the bow the strand is gradually straightened to horizontal, still with a liquid core.',
    why: 'Straightening strain must be applied at a temperature and rate that avoid transverse cracks.',
  },
  {
    state: 'FINAL_SOLIDIFICATION', title: 'Final solidification', navigatorGroup: 'straightening', enabled: true, duration: 9,
    camera: 'strand', activeEquipment: ['segments', 'coolingSystem'], materialStates: ['THICK_SHELL_REDUCED_CORE', 'FINAL_SOLIDIFICATION'],
    whatHappens: 'The two shells meet at the metallurgical length: the slab becomes fully solid.',
    why: 'The point of final solidification governs centre segregation and must stay inside the supported strand.',
  },
  {
    state: 'CUTTING', title: 'Torch cutting', navigatorGroup: 'cutting', enabled: true, duration: 8,
    camera: 'cutting', activeEquipment: ['torchCutter'], materialStates: ['SOLID_SLAB'],
    whatHappens: 'The torch car clamps to the moving strand and oxy-gas torches cut it to the ordered slab length.',
    why: 'Slab length is set by the rolling order; the cut must be square and clean.',
  },
  {
    state: 'COMPLETE', title: 'Finished slab', navigatorGroup: 'slab', enabled: true, duration: 7,
    camera: 'slab', activeEquipment: ['slab'], materialStates: ['SOLID_SLAB'],
    whatHappens: 'The slab is marked with its heat and slab ID, leaves on the run-out table and is transferred toward the slab yard / hot strip mill.',
    why: 'Traceability links every slab to its heat chemistry and casting conditions.',
  },
];

export const enabledSteps = () => PROCESS_STEPS.filter((s) => s.enabled);
