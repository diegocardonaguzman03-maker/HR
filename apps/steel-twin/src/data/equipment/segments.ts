import type { EquipmentData } from '../../types/equipment';

/**
 * Strand guide / segments (CC1).
 * Reference configuration: FT-ACE-001 v0.3 §4 (vertical-curved, radius 9.5 m, metallurgical
 * length ≈ 32 m, 14 segments, roll gap per taper table ±0.5 mm, chain dummy bar inserted from
 * the bottom). CONFIGURABLE, not verified.
 */
export const segments: EquipmentData = {
  id: 'segments',
  name: 'Strand Guide and Segments',
  shortName: 'Segments',
  category: 'casting',
  processStages: ['SHELL_FORMATION', 'SECONDARY_COOLING', 'SOLIDIFICATION', 'STRAIGHTENING', 'FINAL_SOLIDIFICATION'],
  tooltip: 'Rows of rolls that support, bend, withdraw and straighten the strand while it solidifies.',
  description:
    'Below the mold, the strand still has a liquid core. The strand guide is a series of roll segments that support the thin shell against the internal pressure of the liquid, guide the strand along the curved path, pull it out (withdrawal) and straighten it to horizontal.',
  purpose:
    'Support the shell so it does not bulge, keep the strand geometry within tolerance, withdraw it at the set casting speed and straighten it without cracking, until complete solidification.',
  howItWorks: [
    'Just below the mold, a vertical zone and the bender segment support the thin shell with closely spaced rolls and progressively bend the strand onto the machine radius (9.5 m in the reference configuration).',
    'The curved segments follow the radius. Each segment is a frame with upper and lower rolls. The distance between them (roll gap) is set according to a taper table that follows the thermal shrinkage of the strand; tolerance in the reference configuration is ±0.5 mm.',
    'Some rolls are driven. Their motors pull the strand at the set casting speed. At start-up, a chain dummy bar inserted from the bottom closes the mold; the first steel freezes onto its head and the drives pull the dummy bar and the new strand together until the dummy bar is disconnected and parked.',
    'In the straightener the strand is unbent from the radius to horizontal. Straightening strains the surface; if it happens where the steel has low ductility (a temperature range that depends on grade), transverse cracks can open.',
    'The liquid core becomes thinner along the machine. The point where the centre finally solidifies is the metallurgical length (≈ 32 m in the reference configuration). It must stay inside the supported length; otherwise the unsupported strand can bulge and generate internal defects.',
  ],
  inputs: ['Strand from the mold (thin shell, liquid core)', 'Secondary cooling sprays', 'Drive power', 'Roll cooling water and lubrication'],
  outputs: ['Straightened, fully solidified (or solidifying) strand at casting speed towards the cutter', 'Roll gap and drive load signals'],
  components: [
    {
      id: 'benderSegment',
      name: 'Foot Rolls and Bender Segment',
      function: 'Support the thinnest shell just below the mold and bend the strand onto the machine radius.',
      failureModes: ['Misalignment with the mold', 'Seized rolls', 'Spray nozzle blockage in this critical zone'],
      inspectionPoints: ['Alignment mold–foot rolls–bender (gauge)', 'Roll rotation', 'Spray pattern'],
      maintenanceConsiderations: ['Alignment with the mold is critical because the shell is thinnest here.'],
      processConsequence: 'Misalignment or bulging here → mold level waves, cracks, breakout.',
    },
    {
      id: 'segments',
      name: 'Curved and Horizontal Segments (14)',
      function: 'Interchangeable roll frames that support and guide the strand along the machine.',
      failureModes: ['Roll gap out of tolerance', 'Hydraulic clamping loss', 'Structural distortion from heat'],
      inspectionPoints: ['Roll gap measurement (gap checker / offline)', 'Hydraulic cylinder condition', 'Water and lubrication connections'],
      maintenanceConsiderations: ['Segment exchange and offline alignment follow OEM criteria [Validate with OEM].'],
      processConsequence: 'Wrong roll gap → bulging, internal cracks, central segregation.',
    },
    {
      id: 'rolls',
      name: 'Rolls and Bearings',
      function: 'Contact elements that support the strand; internally water-cooled.',
      failureModes: ['Seized or stuck rolls', 'Bent rolls', 'Surface wear / cracking', 'Bearing failure'],
      inspectionPoints: ['Free rotation', 'Straightness / runout', 'Roll surface', 'Bearing temperature and lubrication'],
      maintenanceConsiderations: ['A stuck roll marks the slab and loses support.'],
      processConsequence: 'Surface scratches, bulging between rolls, internal cracks.',
    },
    {
      id: 'drives',
      name: 'Withdrawal Drives',
      function: 'Motors and gearboxes on driven rolls that pull the strand at the set casting speed.',
      failureModes: ['Motor / gearbox failure', 'Load imbalance between drives', 'Speed control error'],
      inspectionPoints: ['Motor current balance', 'Speed feedback', 'Gearbox condition'],
      maintenanceConsiderations: ['Speed stability matters because speed changes disturb mold level.'],
      processConsequence: 'Speed fluctuations → level fluctuation and quality defects; drive loss → forced stop.',
    },
    {
      id: 'straightener',
      name: 'Straightener',
      function: 'Unbends the strand from the arc to horizontal, in one or several points.',
      failureModes: ['Excessive strain concentration', 'Roll gap error in the unbending zone'],
      inspectionPoints: ['Roll gap', 'Strand surface temperature at the straightener'],
      maintenanceConsiderations: ['Surface temperature at straightening must avoid the grade-specific low-ductility range.'],
      processConsequence: 'Straightening in the low-ductility range → transverse and corner cracks.',
    },
    {
      id: 'dummyBar',
      name: 'Chain Dummy Bar',
      function: 'Plugs the mold bottom at start and pulls out the first metres of the strand; inserted from the bottom.',
      failureModes: ['Head damage / poor sealing', 'Chain link wear', 'Failure to disconnect'],
      inspectionPoints: ['Head condition and packing', 'Links and pins', 'Disconnection function'],
      maintenanceConsiderations: ['Mold sealing with the dummy bar head is key for a safe start.'],
      processConsequence: 'Start-up breakout or failed start.',
    },
    {
      id: 'frame',
      name: 'Machine Frame and Foundations',
      function: 'Structure that holds the segments on the correct radius and alignment.',
      failureModes: ['Thermal distortion', 'Foundation movement'],
      inspectionPoints: ['Periodic survey of radius and alignment', 'Structural cracks'],
      maintenanceConsiderations: ['Radius survey requires specialised measurement.'],
      processConsequence: 'Global misalignment → recurring internal cracks and bulging.',
    },
  ],
  processVariables: [
    { key: 'cc.castingSpeed', name: 'Casting speed', unit: 'm/min', role: 'Withdrawal speed set by the drives; defines where solidification ends.', trainingRange: '0.8–1.6 m/min (nominal 1.2)', classification: 'CONFIGURABLE' },
    { key: 'cc.metallurgicalLength', name: 'Metallurgical length', unit: 'm', role: 'Distance from meniscus to the point of complete solidification; must stay within supported length. With e = K·√t: L = v·(h/2 / K)².', trainingRange: '≈ 32 m at 1.2 m/min (K = 22) — SIMULATED TRAINING DATA', classification: 'ASSUMPTION' },
    { key: 'cc.solidificationProgress', name: 'Solidification progress', unit: '%', role: 'Shell thickness ×2 / slab thickness at a strand position.', trainingRange: '0–100 % — SIMULATED TRAINING DATA', classification: 'ASSUMPTION' },
    { key: 'cc.surfaceTemp', name: 'Strand surface temperature', unit: '°C', role: 'Controls ductility during straightening and bulging tendency.', trainingRange: '≈ 900–1,100 °C along the strand — SIMULATED TRAINING DATA', classification: 'ASSUMPTION' },
    { key: 'segments.rollGap', name: 'Roll gap deviation', unit: 'mm', role: 'Difference between actual and taper-table gap.', trainingRange: '±0.5 mm', classification: 'CONFIGURABLE' },
    { key: 'segments.drivesLoad', name: 'Withdrawal drive load', unit: '%', role: 'High load may indicate bulging, a stuck roll or a solid strand in a narrow gap.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Bulging between rolls', consequence: 'Shell bulges under ferrostatic pressure; causes internal cracks, segregation and mold level waves.', typicalResponse: 'Check roll gap and roll condition, spray cooling in the zone, casting speed vs cooling.' },
    { event: 'Roll misalignment / gap out of tolerance', consequence: 'Internal cracks and midway cracks; central segregation.', typicalResponse: 'Gap measurement; segment exchange per maintenance planning.' },
    { event: 'Transverse cracks at straightener', consequence: 'Surface / corner cracks, especially micro-alloyed or peritectic grades.', typicalResponse: 'Review secondary cooling to move surface temperature out of low-ductility range; oscillation marks depth.' },
    { event: 'Metallurgical length beyond supported zone', consequence: 'Unsupported liquid core → bulging, internal cracks, possible late breakout at the cutter.', typicalResponse: 'Reduce casting speed or increase cooling within approved practice.' },
    { event: 'Dummy bar failure at start', consequence: 'Start-up breakout or aborted start.', typicalResponse: 'Pre-start checks of dummy bar head and packing; abort start per plant practice.' },
    { event: 'Stuck / seized roll', consequence: 'Surface marks, loss of support, drive overload.', typicalResponse: 'Identify via drive load / inspection; replace at next opportunity.' },
  ],
  impact: {
    safety: 'A breakout or bulging failure inside the machine releases liquid steel; drives and segments are heavy moving machinery with stored hydraulic energy.',
    quality: 'Roll gap accuracy, support and straightening conditions determine internal quality (cracks, segregation) and some surface cracks.',
    reliability: 'Roll and segment condition is the main mechanical reliability driver of a slab caster.',
    productivity: 'The supported length and cooling capability set the maximum safe casting speed.',
  },
  qualityImpact: [
    {
      variable: 'Roll gap / alignment',
      mechanism: 'Internal cracks and central segregation result from strain in the solidification front. Strain comes from bulging (depends on shell thickness, roll pitch, surface temperature and cooling), from misalignment and from straightening. Superheat and casting speed shift where the front is weak.',
      possibleDefects: ['Internal (midway) cracks', 'Central segregation', 'Centreline porosity'],
    },
    {
      variable: 'cc.surfaceTemp at straightener',
      mechanism: 'Steel has a low-ductility range whose position depends on chemistry (C, Nb, V, Ti, N, Al). Secondary cooling intensity, casting speed and oscillation mark depth combine: deep marks + strain + low ductility → transverse cracks.',
      possibleDefects: ['Transverse surface cracks', 'Corner cracks'],
    },
    {
      variable: 'cc.metallurgicalLength',
      mechanism: 'Final solidification position depends on speed, superheat, section and cooling. If the final liquid pocket closes where support or soft reduction (if available) is inadequate, solute-rich liquid is sucked to the centre.',
      possibleDefects: ['Central segregation', 'Centreline porosity / shrinkage'],
    },
  ],
  safetyHazards: [
    { category: 'molten-metal', description: 'Liquid core inside the strand; breakout risk.' },
    { category: 'moving-machinery', description: 'Rotating rolls, drives and dummy bar.' },
    { category: 'stored-energy', description: 'Hydraulic clamping and strand weight.' },
    { category: 'pinch-points', description: 'Between rolls and strand / dummy bar.' },
    { category: 'high-temperature', description: 'Hot strand and steam in the spray chamber.' },
  ],
  maintenancePoints: [
    { component: 'Segments', function: 'Support and guide', failureMode: 'Gap out of tolerance', inspectionPoints: ['Roll gap check', 'Hydraulics', 'Connections'], considerations: 'Offline alignment per OEM.', processConsequence: 'Bulging, internal cracks.' },
    { component: 'Rolls/bearings', function: 'Contact support', failureMode: 'Seizure / wear', inspectionPoints: ['Rotation', 'Runout', 'Lubrication'], considerations: 'Stuck rolls are common defect sources.', processConsequence: 'Marks, loss of support.' },
    { component: 'Dummy bar', function: 'Start-up', failureMode: 'Head damage / disconnection failure', inspectionPoints: ['Head', 'Links', 'Disconnect'], considerations: 'Pre-start readiness.', processConsequence: 'Start-up breakout.' },
    { component: 'Drives', function: 'Withdrawal', failureMode: 'Motor/gearbox fault', inspectionPoints: ['Current balance', 'Speed feedback'], considerations: 'Speed stability.', processConsequence: 'Level fluctuation / stop.' },
  ],
  specifications: [
    { label: 'Machine type', value: 'Vertical-curved, 1 strand', classification: 'CONFIGURABLE' },
    { label: 'Radius', value: '9.5 m', classification: 'CONFIGURABLE' },
    { label: 'Metallurgical length', value: '≈ 32 m', classification: 'CONFIGURABLE' },
    { label: 'Segments', value: '14', classification: 'CONFIGURABLE' },
    { label: 'Roll gap tolerance', value: '±0.5 mm vs taper table', classification: 'CONFIGURABLE' },
    { label: 'Dummy bar', value: 'Chain type, bottom insertion', classification: 'CONFIGURABLE' },
    { label: 'Roll pitch, diameters, driven rolls, soft reduction', value: 'Per OEM design', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (reference configuration)', 'docs/assumptions/caster.md', 'General strand guide and solidification literature'],
};
