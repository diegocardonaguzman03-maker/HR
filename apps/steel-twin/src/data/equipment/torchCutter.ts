import type { EquipmentData } from '../../types/equipment';

/**
 * Torch cutting machine (CC1).
 * Reference configuration: FT-ACE-001 v0.3 §4 (oxy-fuel cutting with O2 + natural gas,
 * slab length 8–11 m). CONFIGURABLE, not verified.
 */
export const torchCutter: EquipmentData = {
  id: 'torchCutter',
  name: 'Torch Cutting Machine',
  shortName: 'Torch Cutter',
  category: 'cutting',
  processStages: ['CUTTING'],
  tooltip: 'Travels with the moving strand and cuts it into slabs with oxygen–gas torches.',
  description:
    'The torch cutting machine cuts the continuous, fully solidified strand into slabs of the ordered length. Because the strand never stops, the machine clamps onto it and travels at casting speed while the torches cut across the width.',
  purpose:
    'Produce slabs of the correct length (8–11 m in the reference configuration) with clean cut faces, without interrupting casting.',
  howItWorks: [
    'A length measuring system tracks the strand. When the ordered length is reached, the torch car clamps onto the strand and moves synchronously with it.',
    'Oxygen–natural gas torches preheat the steel to ignition temperature; then a cutting oxygen jet burns and blows out the steel along the kerf.',
    'For wide slabs, usually two torches start at the edges and move towards the centre (one retracts before the end). Cutting time depends on thickness, width and temperature.',
    'After the cut the clamps release and the car returns to its home position. Slag (burr) formed at the bottom edge is removed by a deburrer.',
    'The strand must be fully solid at the cutter. Cutting a strand with liquid core would release liquid steel.',
  ],
  inputs: ['Solid strand at casting speed', 'Oxygen', 'Natural gas', 'Length set point from production schedule'],
  outputs: ['Cut slabs', 'Cutting slag and fumes', 'Slab length and identity data'],
  components: [
    { id: 'torchCar', name: 'Torch Car', function: 'Carriage that synchronises with the strand and carries the torches.', failureModes: ['Loss of synchronisation', 'Travel drive fault', 'Rail damage'], inspectionPoints: ['Synchronisation accuracy', 'Travel limits', 'Rails'], maintenanceConsiderations: ['Poor synchronisation creates oblique or stepped cuts.'], processConsequence: 'Length errors, poor cut quality, cut not completed before end of travel.' },
    { id: 'torches', name: 'Cutting Torches', function: 'Burners that preheat and cut with an oxygen jet.', failureModes: ['Nozzle wear / blockage', 'Flashback', 'Ignition failure'], inspectionPoints: ['Nozzle condition', 'Flame shape', 'Flashback arrestors'], maintenanceConsiderations: ['Nozzle condition defines kerf width and cut face.'], processConsequence: 'Incomplete cuts, wide kerf (yield loss), rough faces.' },
    { id: 'gasSupply', name: 'Gas Supply (O2 + Natural Gas)', function: 'Regulated supply of oxygen and fuel gas to the torches.', failureModes: ['Pressure fluctuation', 'Leaks', 'Regulator failure'], inspectionPoints: ['Supply pressures', 'Leak detection', 'Valve function'], maintenanceConsiderations: ['Oxygen-enriched atmospheres and fuel gas leaks are fire/explosion hazards.'], processConsequence: 'Cutting interruptions; fire risk.' },
    { id: 'clamps', name: 'Strand Clamps', function: 'Grip the strand edges so the car moves with it.', failureModes: ['Slip', 'Clamp cylinder failure'], inspectionPoints: ['Clamp force', 'Pad wear'], maintenanceConsiderations: ['Slip causes loss of synchronisation.'], processConsequence: 'Crooked cut, length error.' },
    { id: 'deburrer', name: 'Deburrer', function: 'Removes the slag burr at the bottom edge of the cut.', failureModes: ['Tool wear', 'Positioning error'], inspectionPoints: ['Tool condition', 'Burr residue on slabs'], maintenanceConsiderations: ['Residual burr can damage reheating furnace or mill rolls.'], processConsequence: 'Surface marks downstream.' },
    { id: 'marking', name: 'Slab Marking Machine', function: 'Applies slab identification (heat, strand, slab number).', failureModes: ['Illegible marking', 'Data mismatch'], inspectionPoints: ['Legibility', 'Data link to tracking'], maintenanceConsiderations: ['Identification errors break traceability.'], processConsequence: 'Loss of traceability, wrong slab to wrong order.' },
  ],
  processVariables: [
    { key: 'cutter.slabLength', name: 'Slab length', unit: 'm', role: 'Ordered length; defines slab weight for the hot rolling mill.', trainingRange: '8–11 m', classification: 'CONFIGURABLE' },
    { key: 'cc.castingSpeed', name: 'Casting speed', unit: 'm/min', role: 'Defines how far the car travels during a cut.', trainingRange: '0.8–1.6 m/min', classification: 'CONFIGURABLE' },
    { key: 'cc.solidificationProgress', name: 'Solidification progress at cutter', unit: '%', role: 'Must be 100 % (fully solid) before cutting.', trainingRange: '100 % — SIMULATED TRAINING DATA', classification: 'ASSUMPTION' },
    { key: 'cutter.cuttingTime', name: 'Cutting time', unit: 's', role: 'Depends on width, thickness and temperature.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Incomplete cut', consequence: 'Slabs remain joined; runout disruption.', typicalResponse: 'Recut per plant practice; inspect torches and gas supply.' },
    { event: 'Length error', consequence: 'Slab outside ordered weight; rejection or re-cut.', typicalResponse: 'Check length measurement and synchronisation.' },
    { event: 'Liquid core reaching the cutter', consequence: 'Liquid steel release on cutting.', typicalResponse: 'Speed / cooling review; metallurgical length must remain upstream of the cutter.' },
    { event: 'Gas leak or flashback', consequence: 'Fire / explosion hazard.', typicalResponse: 'Gas isolation per plant procedure.' },
  ],
  impact: {
    safety: 'Oxygen and fuel gas, hot slag, moving car and clamps.',
    quality: 'Cut face quality, burr and correct length.',
    reliability: 'Cutter failure forces casting stop when the strand reaches the runout limit.',
    productivity: 'Kerf losses and length accuracy affect yield.',
  },
  qualityImpact: [
    { variable: 'cutter.slabLength', mechanism: 'Length accuracy depends on strand tracking, synchronisation, clamp slip and slab temperature (thermal contraction after cooling).', possibleDefects: ['Off-length slabs', 'Oblique cut faces', 'Burr remaining'] },
  ],
  safetyHazards: [
    { category: 'oxygen', description: 'Oxygen-enriched atmosphere; fire risk.' },
    { category: 'gas', description: 'Natural gas leak / explosion.' },
    { category: 'high-temperature', description: 'Hot slab, cutting slag and sparks.' },
    { category: 'moving-machinery', description: 'Travelling torch car and clamps.' },
    { category: 'noise-dust', description: 'Cutting fumes.' },
  ],
  maintenancePoints: [
    { component: 'Torches', function: 'Cutting', failureMode: 'Nozzle wear / flashback', inspectionPoints: ['Nozzles', 'Flame', 'Arrestors'], considerations: 'Consumables.', processConsequence: 'Incomplete cuts.' },
    { component: 'Torch car / clamps', function: 'Synchronisation', failureMode: 'Slip / drive fault', inspectionPoints: ['Clamp force', 'Drive'], considerations: 'Tracking accuracy.', processConsequence: 'Length and squareness errors.' },
    { component: 'Gas supply', function: 'O2 + fuel', failureMode: 'Leaks / pressure', inspectionPoints: ['Pressures', 'Leak checks'], considerations: 'Fire/explosion hazard.', processConsequence: 'Cutting stop; fire risk.' },
  ],
  specifications: [
    { label: 'Cutting method', value: 'Oxy-fuel (O2 + natural gas)', classification: 'CONFIGURABLE' },
    { label: 'Slab length', value: '8–11 m', classification: 'CONFIGURABLE' },
    { label: 'Torch number, kerf, cutting speed', value: 'Per OEM', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (reference configuration)', 'docs/assumptions/caster.md'],
};
