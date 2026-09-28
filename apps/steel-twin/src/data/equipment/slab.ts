import type { EquipmentData } from '../../types/equipment';

/**
 * Slab (product) and runout area.
 * Reference configuration: FT-ACE-001 v0.3 §4 (230 mm × 900–1,650 mm × 8–11 m).
 * Runout, cross-transfer and yard layout are ASSUMPTION / PLANT_SPECIFIC.
 */
export const slab: EquipmentData = {
  id: 'slab',
  name: 'Slab and Runout Area',
  shortName: 'Slab',
  category: 'product',
  processStages: ['CUTTING', 'COMPLETE'],
  tooltip: 'The final product: a solid steel slab, identified and moved to the slab yard.',
  description:
    'The slab is the product of the caster: a solid block of steel (230 mm thick, 900–1,650 mm wide, 8–11 m long in the reference configuration). After cutting it travels on the runout table, is identified, transferred sideways and stored or sent hot to the rolling mill.',
  purpose:
    'Deliver identified, traceable slabs with the right dimensions and quality to the hot strip mill, and allow inspection and conditioning when needed.',
  howItWorks: [
    'After cutting, the slab is carried on the runout table rollers away from the cutter at a higher speed than casting, creating a gap to the strand.',
    'Each slab is marked with its identity (heat, sequence, slab number). This links it to steel chemistry, casting conditions and any quality events recorded during casting.',
    'A cross-transfer (pusher or transfer car) moves slabs sideways onto cooling beds, stacks or directly towards the reheating furnace (hot charging), depending on plant logistics.',
    'In the slab yard slabs are stacked, cooled if required and, when quality events suggest it, inspected or conditioned (e.g., scarfing) before rolling.',
  ],
  inputs: ['Cut slab from the torch cutter', 'Identification data from the tracking system'],
  outputs: ['Identified slab in the yard or to the mill', 'Quality and traceability records'],
  components: [
    { id: 'runoutTable', name: 'Runout Table', function: 'Driven roller table that moves cut slabs away from the cutter.', failureModes: ['Seized rollers', 'Drive failure'], inspectionPoints: ['Roller rotation', 'Drive function'], maintenanceConsiderations: ['Hot slab contact; roller cooling.'], processConsequence: 'Slabs cannot be cleared → casting must slow or stop.' },
    { id: 'slabId', name: 'Slab Identification', function: 'Marking and tracking that assigns each slab its identity.', failureModes: ['Illegible marks', 'Tracking mismatch'], inspectionPoints: ['Mark legibility', 'Tracking data vs physical slab'], maintenanceConsiderations: ['Traceability underpins quality release.'], processConsequence: 'Wrong slab allocation, quality claims.' },
    { id: 'crossTransfer', name: 'Cross-Transfer', function: 'Pushers / transfer cars that move slabs sideways off the runout.', failureModes: ['Pusher failure', 'Misalignment'], inspectionPoints: ['Stroke and alignment', 'Hydraulics'], maintenanceConsiderations: ['Heavy loads, pinch points.'], processConsequence: 'Runout congestion.' },
    { id: 'slabYard', name: 'Slab Yard', function: 'Storage, cooling, inspection and conditioning area before rolling.', failureModes: ['Stacking instability', 'Crane unavailability'], inspectionPoints: ['Stack condition', 'Crane availability'], maintenanceConsiderations: ['Layout and cooling practice are plant-specific.'], processConsequence: 'Logistics delays; cooling cracks in sensitive grades if cooled incorrectly.' },
  ],
  processVariables: [
    { key: 'cutter.slabLength', name: 'Slab length', unit: 'm', role: 'Ordered length / weight for the mill.', trainingRange: '8–11 m', classification: 'CONFIGURABLE' },
    { key: 'slab.width', name: 'Slab width', unit: 'mm', role: 'Set by the mold narrow faces.', trainingRange: '900–1,650 mm', classification: 'CONFIGURABLE' },
    { key: 'slab.thickness', name: 'Slab thickness', unit: 'mm', role: 'Mold section thickness.', trainingRange: '230 mm', classification: 'CONFIGURABLE' },
    { key: 'slab.surfaceTemp', name: 'Slab surface temperature at runout', unit: '°C', role: 'Relevant for hot charging and cooling practice.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Identification error', consequence: 'Traceability lost; slab may be rolled to the wrong order.', typicalResponse: 'Reconcile physical slab with tracking data before release.' },
    { event: 'Surface defects found (cracks, depressions)', consequence: 'Conditioning or downgrade.', typicalResponse: 'Link to casting events (level, BOP, speed changes) for root cause.' },
    { event: 'Internal defects (segregation, cracks)', consequence: 'Downgrade for demanding applications.', typicalResponse: 'Sampling (e.g., sulphur print / macro-etch) per quality plan.' },
    { event: 'Runout congestion', consequence: 'Caster must slow or stop.', typicalResponse: 'Coordinate yard crane and transfer.' },
  ],
  impact: {
    safety: 'Hot, heavy slabs; crane handling and stacking hazards.',
    quality: 'The slab carries all upstream quality history; identification ties it to the data.',
    reliability: 'Runout and transfer must keep pace with the caster.',
    productivity: 'Hot charging reduces reheating energy; yield depends on crop and conditioning losses.',
  },
  qualityImpact: [
    { variable: 'Casting history of the slab', mechanism: 'Slab quality is the combined result of chemistry, superheat, mold level stability, casting speed changes, secondary cooling, oscillation, powder and roll alignment. No single parameter explains a defect; casting event tracking helps attribute defects to their contributing causes.', possibleDefects: ['Longitudinal / transverse cracks', 'Inclusions / slivers', 'Central segregation', 'Depressions', 'Porosity / pinholes'] },
  ],
  safetyHazards: [
    { category: 'high-temperature', description: 'Hot slabs radiating heat.' },
    { category: 'suspended-loads', description: 'Slab handling by crane.' },
    { category: 'moving-machinery', description: 'Roller tables and transfer equipment.' },
    { category: 'pinch-points', description: 'Between slabs, rollers and pushers.' },
  ],
  maintenancePoints: [
    { component: 'Runout rollers', function: 'Slab transport', failureMode: 'Seizure', inspectionPoints: ['Rotation', 'Drives'], considerations: 'Hot service.', processConsequence: 'Congestion / caster stop.' },
    { component: 'Cross-transfer', function: 'Side transfer', failureMode: 'Hydraulic/mechanical fault', inspectionPoints: ['Stroke', 'Alignment'], considerations: 'Heavy loads.', processConsequence: 'Runout congestion.' },
  ],
  specifications: [
    { label: 'Section', value: '230 mm × 900–1,650 mm', classification: 'CONFIGURABLE' },
    { label: 'Length', value: '8–11 m', classification: 'CONFIGURABLE' },
    { label: 'Runout / yard layout, hot charging', value: 'Per plant logistics', classification: 'PLANT_SPECIFIC' },
    { label: 'Slab weight (230 × 1,650 × 11,000 mm, ρ ≈ 7.8 t/m³)', value: '≈ 32.6 t (max, calculated)', classification: 'ASSUMPTION' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (reference configuration)', 'docs/assumptions/caster.md'],
};
