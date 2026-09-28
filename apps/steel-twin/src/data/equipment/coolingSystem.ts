import type { EquipmentData } from '../../types/equipment';

/**
 * Caster cooling system: primary (mold) + secondary (sprays) + emergency water.
 * Reference configuration: FT-ACE-001 v0.3 §4 (10 air-mist zones, specific water 0.8–1.2 L/kg,
 * emergency water tower + diesel pumps, automatic entry ≤ 15 s). CONFIGURABLE, not verified.
 */
export const coolingSystem: EquipmentData = {
  id: 'coolingSystem',
  name: 'Caster Cooling System',
  shortName: 'Cooling',
  category: 'cooling',
  processStages: ['SHELL_FORMATION', 'SECONDARY_COOLING', 'SOLIDIFICATION', 'STRAIGHTENING', 'FINAL_SOLIDIFICATION'],
  tooltip: 'Removes heat from the mold and the strand with water and air-mist sprays, zone by zone.',
  description:
    'The caster cooling system removes the heat of the steel in two stages: primary cooling through the mold copper plates, and secondary cooling with water or air–water mist sprayed directly on the strand surface in several zones. An emergency water supply protects the mold and machine if normal water is lost.',
  purpose:
    'Complete solidification inside the supported length while controlling the strand surface temperature to avoid cracking, bulging and reheating.',
  howItWorks: [
    'Primary cooling: closed-circuit, treated water flows through the mold channels and extracts the heat that forms the initial shell. It is monitored by flow and temperature rise per face.',
    'Secondary cooling: below the mold the strand passes through a spray chamber. Nozzles spray water, or air–water mist, onto the faces. The reference configuration has 10 zones, each with its own flow control.',
    'Water per zone is calculated by a cooling model based on casting speed, grade and section. A simple indicator is the specific water: litres of spray water per kilogram of steel cast (0.8–1.2 L/kg in the reference configuration).',
    'Cooling is intense near the mold (thin shell, needs strength) and softer further down. Too much water causes surface cracking and later reheating; too little causes bulging and a longer metallurgical length.',
    'The water turns partly into steam that is extracted by the steam exhaust system, keeping visibility and preventing condensation on equipment.',
    'If pumps or power fail, an emergency water system (elevated tower and diesel pumps in the reference configuration) automatically feeds the mold and critical sprays within ≤ 15 s, while casting is stopped.',
  ],
  inputs: ['Treated primary water', 'Spray water', 'Compressed air (mist nozzles)', 'Casting speed / grade for the cooling model'],
  outputs: ['Heat removed from the strand', 'Steam (to exhaust)', 'Return water to treatment', 'Flow/pressure/temperature signals'],
  components: [
    {
      id: 'primaryWater',
      name: 'Primary (Mold) Water Circuit',
      function: 'Closed-loop treated water system serving the mold plates.',
      failureModes: ['Pump failure', 'Heat exchanger fouling', 'Water chemistry out of spec (scaling)', 'Leaks'],
      inspectionPoints: ['Flow and pressure', 'Inlet temperature', 'Water chemistry', 'Leak detection'],
      maintenanceConsiderations: ['Loss of primary water near liquid steel is one of the highest hazards of the caster.'],
      processConsequence: 'Mold overheating, breakout, steam explosion risk.',
    },
    {
      id: 'sprayZones',
      name: 'Secondary Cooling Zones (10)',
      function: 'Independently controlled groups of nozzles along the strand.',
      failureModes: ['Control valve fault', 'Flow meter error', 'Zone model mis-setting'],
      inspectionPoints: ['Actual vs set flow per zone', 'Pressure per zone', 'Model version and parameters'],
      maintenanceConsiderations: ['Zone tables are grade-specific [Validate with Process Engineering].'],
      processConsequence: 'Wrong zone cooling → cracks, bulging, metallurgical length shift.',
    },
    {
      id: 'nozzles',
      name: 'Spray Nozzles (Air–Mist)',
      function: 'Atomise water with air to create a uniform spray pattern on the strand.',
      failureModes: ['Clogging', 'Wear (pattern change)', 'Misalignment', 'Broken nozzle'],
      inspectionPoints: ['Spray pattern test', 'Nozzle alignment', 'Filter condition'],
      maintenanceConsiderations: ['A single clogged nozzle creates a hot stripe on the strand.'],
      processConsequence: 'Non-uniform cooling → longitudinal stripes, cracks, local bulging.',
    },
    {
      id: 'sprayChamber',
      name: 'Spray Chamber',
      function: 'Enclosure around the strand that contains water and steam.',
      failureModes: ['Scale accumulation', 'Door / seal damage'],
      inspectionPoints: ['Scale build-up', 'Drainage'],
      maintenanceConsiderations: ['Confined, hot, steam-filled environment.'],
      processConsequence: 'Blocked drainage or scale interfere with sprays and rolls.',
    },
    {
      id: 'emergencyWater',
      name: 'Emergency Water System',
      function: 'Elevated tank and diesel pumps that supply water automatically on loss of power or pumping.',
      failureModes: ['Low tank level', 'Diesel pump fails to start', 'Automatic valve fails'],
      inspectionPoints: ['Tank level', 'Functional test records', 'Valve actuation'],
      maintenanceConsiderations: ['Safety-critical system; testing regime is plant-specific (not defined here).'],
      processConsequence: 'Without emergency water, a power loss can lead to mold damage, breakout and steam explosion.',
    },
    {
      id: 'steamExhaust',
      name: 'Steam Exhaust',
      function: 'Fans and ducts that extract steam from the spray chamber.',
      failureModes: ['Fan failure', 'Duct blockage'],
      inspectionPoints: ['Fan operation', 'Draft / pressure', 'Duct condition'],
      maintenanceConsiderations: ['Poor extraction reduces visibility at the caster.'],
      processConsequence: 'Condensation, corrosion, poor visibility for operators.',
    },
  ],
  processVariables: [
    { key: 'cc.specificWater', name: 'Specific water', unit: 'L/kg', role: 'Overall secondary cooling intensity; higher = harder cooling.', trainingRange: '0.8–1.2 L/kg', classification: 'CONFIGURABLE' },
    { key: 'cc.surfaceTemp', name: 'Strand surface temperature', unit: '°C', role: 'Result of cooling; target avoids reheating and low-ductility range.', trainingRange: '≈ 900–1,100 °C — SIMULATED TRAINING DATA', classification: 'ASSUMPTION' },
    { key: 'mold.waterDeltaT', name: 'Mold water ΔT', unit: '°C', role: 'Primary cooling heat extraction indicator.', trainingRange: '6–9 °C; alarm > 11 °C', classification: 'CONFIGURABLE' },
    { key: 'cc.metallurgicalLength', name: 'Metallurgical length', unit: 'm', role: 'Shifts with cooling intensity and speed.', trainingRange: '≈ 32 m at 1.2 m/min — SIMULATED TRAINING DATA', classification: 'ASSUMPTION' },
    { key: 'cooling.zoneFlow', name: 'Zone spray flow', unit: 'L/min', role: 'Per-zone actual flow vs model set point.', classification: 'PLANT_SPECIFIC' },
    { key: 'cooling.emergencyResponse', name: 'Emergency water entry time', unit: 's', role: 'Time to establish emergency flow after loss of normal supply.', trainingRange: '≤ 15 s', classification: 'CONFIGURABLE' },
  ],
  whatCanGoWrong: [
    { event: 'Loss of primary water / power', consequence: 'Mold overheats quickly; breakout and explosion hazard.', typicalResponse: 'Interlock stops casting; emergency water enters automatically; area response per plant procedure.' },
    { event: 'Clogged nozzles', consequence: 'Hot stripes, local bulging, longitudinal or internal cracks.', typicalResponse: 'Spray pattern checks; filter maintenance; nozzle replacement.' },
    { event: 'Overcooling', consequence: 'Surface in low-ductility range at straightener → transverse/corner cracks; later reheating stresses.', typicalResponse: 'Review zone tables for the grade and speed.' },
    { event: 'Undercooling', consequence: 'Thin shell, bulging, metallurgical length beyond support.', typicalResponse: 'Verify flows; reduce speed within practice.' },
    { event: 'Cooling model not following speed changes', consequence: 'Transient over/undercooling during speed changes and ladle changes.', typicalResponse: 'Verify dynamic model and tracking of strand segments.' },
  ],
  impact: {
    safety: 'Water systems adjacent to liquid steel; emergency water is a critical safety barrier.',
    quality: 'Secondary cooling strongly affects surface cracks, internal cracks and segregation.',
    reliability: 'Nozzle and water quality condition drive recurring defects.',
    productivity: 'Cooling capability (with support length) limits maximum casting speed.',
  },
  qualityImpact: [
    {
      variable: 'cc.specificWater',
      mechanism: 'Cooling intensity interacts with casting speed, superheat and grade chemistry: it shifts the surface temperature at the straightener (ductility) and the metallurgical length (segregation). Nozzle condition decides whether the average intensity is actually uniform.',
      possibleDefects: ['Transverse / corner cracks', 'Internal cracks from reheating', 'Bulging', 'Central segregation'],
    },
  ],
  safetyHazards: [
    { category: 'water-molten-metal', description: 'Water systems near liquid steel; steam explosion potential.' },
    { category: 'high-temperature', description: 'Steam and hot strand.' },
    { category: 'hydraulic', description: 'High-pressure water lines.' },
    { category: 'noise-dust', description: 'Steam, noise from sprays and fans.' },
  ],
  maintenancePoints: [
    { component: 'Nozzles', function: 'Uniform spray', failureMode: 'Clogging / wear', inspectionPoints: ['Pattern test', 'Alignment', 'Filters'], considerations: 'Water quality drives clogging.', processConsequence: 'Non-uniform cooling defects.' },
    { component: 'Emergency water', function: 'Backup cooling', failureMode: 'Fails to start', inspectionPoints: ['Tank level', 'Function test records'], considerations: 'Safety-critical; testing regime plant-defined.', processConsequence: 'Severe event on power loss.' },
    { component: 'Primary water circuit', function: 'Mold cooling', failureMode: 'Pump/fouling/leak', inspectionPoints: ['Flow', 'Chemistry', 'Temperatures'], considerations: 'Chemistry control.', processConsequence: 'Mold damage, breakout.' },
  ],
  specifications: [
    { label: 'Secondary cooling', value: '10 air–mist zones', classification: 'CONFIGURABLE' },
    { label: 'Specific water', value: '0.8–1.2 L/kg', classification: 'CONFIGURABLE' },
    { label: 'Emergency water', value: 'Elevated tower + diesel pumps; automatic entry ≤ 15 s', classification: 'CONFIGURABLE' },
    { label: 'Zone tables / cooling model', value: 'Per grade, per plant model', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (reference configuration)', 'docs/assumptions/caster.md', 'General secondary cooling literature'],
};
