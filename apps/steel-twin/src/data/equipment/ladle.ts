import type { EquipmentData } from '../../types/equipment';

/**
 * Steel ladle (150 t class). Reference configuration from FT-ACE-001 v0.3 (draft, not plant-validated).
 * All numeric values are SIMULATED TRAINING DATA / reference values, never plant setpoints.
 */
export const ladle: EquipmentData = {
  id: 'ladle',
  name: 'Steel Ladle (150 t)',
  shortName: 'Ladle',
  category: 'handling',
  processStages: ['TAPPING', 'SECONDARY_METALLURGY', 'TRANSFER', 'TURRET'],
  tooltip: 'Refractory-lined vessel that receives, holds, treats and transports liquid steel from the EAF to the caster.',
  description:
    'The ladle is a steel vessel lined with refractory that receives liquid steel from the EAF, serves as the reactor for secondary metallurgy at the ladle furnace and carries the steel to the continuous caster, where it is emptied through a slide gate in its bottom.',
  purpose:
    'Contain liquid steel safely, keep its heat, allow argon stirring and alloying, and deliver clean steel at the right temperature to the caster with no slag.',
  howItWorks: [
    'Before receiving steel the ladle is prepared: the slide gate is set up, the well block is filled with sealing sand (reference chromite), the porous plug is checked for gas flow and the lining is preheated (reference 1,000–1,100 °C hot face) to limit thermal shock and temperature loss.',
    'During tapping the ladle sits on a ladle car or transfer car under the EAF taphole. Argon is blown through the porous plug from the start, and deoxidisers (typically Al), alloys and synthetic slag formers are added during the tap.',
    'The full ladle moves to the ladle furnace, where the steel is heated, alloyed, desulfurised and cleaned. The ladle refractory (MgO-C slag line, Al₂O₃-MgO-C barrel and bottom in the reference) must resist the aggressive slag at the steel–slag interface.',
    'After treatment the casting crane lifts the ladle by its trunnions and places it on the caster turret. The slide gate is opened; the sealing sand falls out and steel flows through the shroud into the tundish. The goal is free opening without oxygen lancing.',
    'When the ladle is empty (or slag is detected) the gate is closed, the ladle returns for slag dumping, inspection, gate refurbishment and repreheating before the next cycle.',
  ],
  inputs: [
    'Primary liquid steel from the EAF',
    'Deoxidisers, alloys, lime and synthetic slag',
    'Argon (porous plug)',
    'Sealing sand and slide gate refractory',
    'Preheating energy',
  ],
  outputs: [
    'Treated liquid steel delivered to the tundish',
    'Ladle slag and skull for recycling/disposal',
    'Ladle weight and temperature data',
  ],
  components: [
    {
      id: 'shell',
      name: 'Ladle Shell',
      function: 'Steel structure that holds the refractory lining and transmits the load to the trunnions.',
      failureModes: ['Shell hot spots from worn refractory', 'Cracks near trunnion welds', 'Deformation'],
      inspectionPoints: ['Shell thermography during the cycle', 'Weld and structural inspection by NDT per plant rules'],
      maintenanceConsiderations: ['Structural integrity is critical because the ladle carries ≈ 150 t of liquid steel overhead'],
      processConsequence: 'Shell failure means loss of containment of liquid steel.',
    },
    {
      id: 'refractoryLining',
      name: 'Refractory Lining (Working and Safety Lining)',
      function: 'Insulates and contains the liquid steel; working lining in contact with steel, safety lining behind it.',
      failureModes: ['Erosion and corrosion of the working lining', 'Joint penetration', 'Spalling from thermal shock'],
      inspectionPoints: ['Visual inspection after each heat', 'Residual thickness measurement (e.g. laser scanning where available)', 'Heat count'],
      maintenanceConsiderations: ['Lining life depends on slag chemistry, temperature, residence time and preheating practice'],
      processConsequence: 'Worn lining risks breakout; eroded refractory is also a source of exogenous inclusions.',
    },
    {
      id: 'slagLine',
      name: 'Slag Line',
      function: 'Band of MgO-C refractory at the steel–slag interface, the most chemically attacked zone.',
      failureModes: ['Accelerated wear by FeO-rich or MgO-unsaturated slag', 'Arc flare damage at the LF', 'Oxidation of carbon in MgO-C bricks'],
      inspectionPoints: ['Slag line thickness', 'Local wear at arc impingement points'],
      maintenanceConsiderations: ['Slag line may be repaired or replaced independently from the barrel, per refractory practice'],
      processConsequence: 'Slag line wear often limits ladle campaign life.',
    },
    {
      id: 'slideGate',
      name: 'Slide Gate (Ladle Shroud Valve)',
      function: 'Bottom valve with sliding refractory plates that opens, throttles and closes the steel flow to the tundish.',
      failureModes: ['Non-free opening (sand sintering or frozen steel)', 'Plate erosion or cracking', 'Hydraulic cylinder failure', 'Steel leakage between plates'],
      inspectionPoints: ['Plate and nozzle condition at every turnaround', 'Mechanism spring/clamping load', 'Hydraulic connection'],
      maintenanceConsiderations: ['Refurbished every cycle according to plate wear; assembly quality is critical'],
      processConsequence: 'A leaking or blocked gate causes breakout risk, lancing (re-oxidation) or loss of the heat.',
    },
    {
      id: 'porousPlug',
      name: 'Porous Plug',
      function: 'Refractory plug in the ladle bottom through which argon is blown to stir the steel.',
      failureModes: ['Blocked plug (steel/slag infiltration)', 'Gas leakage around the plug', 'Erosion'],
      inspectionPoints: ['Flow vs. pressure response', 'Visual after emptying', 'Cleaning by oxygen as per plant practice'],
      maintenanceConsiderations: ['Plug replacement is often coordinated with the slide gate well block'],
      processConsequence: 'Without stirring: poor homogenisation, slow desulfurization and poor inclusion flotation.',
    },
    {
      id: 'trunnions',
      name: 'Trunnions',
      function: 'Lifting pins by which the crane lifter beam hooks the ladle.',
      failureModes: ['Wear or cracks', 'Deformation', 'Weld degradation'],
      inspectionPoints: ['Dimensional wear check', 'NDT inspection according to plant lifting rules'],
      maintenanceConsiderations: ['Trunnions are critical lifting points; acceptance criteria are OEM/plant-specific'],
      processConsequence: 'Trunnion failure under load is a catastrophic molten-metal event.',
    },
  ],
  processVariables: [
    {
      key: 'ladle.steelWeight',
      name: 'Steel weight in ladle',
      unit: 't',
      role: 'Needed for alloy calculation, freeboard control and caster sequence planning.',
      trainingRange: '≈ 150 t (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'ladle.temperature',
      name: 'Ladle steel temperature',
      unit: '°C',
      role: 'Drops by heat loss to lining and slag; must reach the LF and then the caster within its window.',
      trainingRange: '≈ 1,570–1,610 °C at LF arrival (simulated)',
      classification: 'ASSUMPTION',
    },
    {
      key: 'ladle.preheatTemperature',
      name: 'Lining hot-face preheat temperature',
      unit: '°C',
      role: 'A hot lining reduces temperature loss and thermal shock.',
      trainingRange: '1,000–1,100 °C (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'ladle.heatCount',
      name: 'Lining heat count',
      unit: 'heats',
      role: 'Indicator of lining campaign progress.',
      trainingRange: 'Life 60–80 heats (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'ladle.freeboard',
      name: 'Freeboard',
      unit: 'mm',
      role: 'Space above slag for stirring and additions without overflow.',
      classification: 'PLANT_SPECIFIC',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'Ladle slide gate does not open freely',
      consequence: 'Casting start is delayed; oxygen lancing re-oxidises steel and can damage the gate.',
      typicalResponse: 'Lancing according to plant practice; investigation of sand and well preparation.',
    },
    {
      event: 'Cold or insufficiently preheated ladle',
      consequence: 'Larger temperature drop, skull formation, more LF heating time.',
      typicalResponse: 'Adjust tap temperature and ladle cycle; improve preheating discipline.',
    },
    {
      event: 'Refractory wear-through (hot spot)',
      consequence: 'Risk of steel breakout through the ladle wall or bottom.',
      typicalResponse: 'Remove the ladle from service; emergency response if breakout occurs.',
    },
    {
      event: 'Porous plug blocked',
      consequence: 'No stirring; poor homogenisation, desulfurization and inclusion removal.',
      typicalResponse: 'Use alternate plug or bypass flow; plug cleaning or replacement at turnaround.',
    },
    {
      event: 'Slag carry-over to the tundish at end of ladle',
      consequence: 'Tundish slag contamination, inclusions and nozzle clogging.',
      typicalResponse: 'Slag detection where installed; closing the gate with a small steel remnant.',
    },
  ],
  impact: {
    safety:
      'The ladle carries ≈ 150 t of liquid steel overhead; shell, trunnion and refractory integrity are critical to prevent loss of containment.',
    quality:
      'Refractory condition, stirring and slag control in the ladle strongly influence cleanliness and temperature stability at the caster.',
    reliability:
      'Ladle availability (turnaround, refractory relining, gate refurbishment) can limit the melt shop cycle.',
    productivity:
      'Good preheating and free-opening rates reduce LF time, delays and lost heats.',
  },
  qualityImpact: [
    {
      variable: 'ladle.temperature',
      mechanism:
        'Temperature loss in the ladle depends on preheat, lining condition, slag cover, stirring intensity and waiting time; it must be combined with LF heating to meet the caster superheat window.',
      possibleDefects: ['Low superheat: nozzle freezing, clogging', 'High superheat: centre segregation, breakout risk (with other factors)'],
    },
    {
      variable: 'ladle.heatCount',
      mechanism:
        'Worn or eroded refractory releases exogenous particles and increases heat loss; cleanliness also depends on slag chemistry and stirring practice.',
      possibleDefects: ['Exogenous macro-inclusions', 'Slivers in rolled product'],
    },
  ],
  safetyHazards: [
    { category: 'molten-metal', description: 'Up to ≈ 150 t of liquid steel and slag contained in the ladle.' },
    { category: 'suspended-loads', description: 'Full ladle lifted and transported by overhead crane.' },
    { category: 'water-molten-metal', description: 'Any wet ladle, sand or addition in contact with steel.' },
    { category: 'high-temperature', description: 'Preheating stations and hot ladle surfaces.' },
    { category: 'hydraulic', description: 'Slide gate hydraulic actuator.' },
    { category: 'gas', description: 'Argon can displace oxygen in enclosed or low areas.' },
  ],
  maintenancePoints: [
    {
      component: 'slideGate',
      function: 'Open, throttle and close the steel flow.',
      failureMode: 'Non-free opening, plate erosion or leakage.',
      inspectionPoints: ['Plate wear', 'Nozzle seating', 'Mechanism clamping'],
      considerations: 'Refurbished each cycle; assembly quality and sand filling are key.',
      processConsequence: 'Delay, lancing, re-oxidation or loss of heat.',
    },
    {
      component: 'refractoryLining',
      function: 'Contain and insulate steel.',
      failureMode: 'Erosion/corrosion and joint penetration.',
      inspectionPoints: ['Visual after each heat', 'Residual thickness', 'Hot spots'],
      considerations: 'Removal criteria are defined by the refractory practice of the plant.',
      processConsequence: 'Breakout risk and inclusions.',
    },
    {
      component: 'trunnions',
      function: 'Lifting interface with the crane.',
      failureMode: 'Wear or cracking.',
      inspectionPoints: ['Dimensional wear', 'NDT'],
      considerations: 'Critical lifting component; OEM/plant acceptance criteria.',
      processConsequence: 'Catastrophic drop of liquid steel.',
    },
    {
      component: 'porousPlug',
      function: 'Argon stirring.',
      failureMode: 'Blockage.',
      inspectionPoints: ['Flow vs. pressure', 'Visual after emptying'],
      considerations: 'Cleaning or replacement at turnaround.',
      processConsequence: 'Poor refining and inclusion flotation.',
    },
  ],
  specifications: [
    { label: 'Capacity', value: '150 t liquid steel', classification: 'CONFIGURABLE' },
    { label: 'Fleet', value: '10 ladles (7 in cycle, 3 maintenance/reserve)', classification: 'CONFIGURABLE' },
    { label: 'Lining', value: 'MgO-C slag line; Al₂O₃-MgO-C barrel and bottom', classification: 'CONFIGURABLE' },
    { label: 'Lining life', value: '60–80 heats', classification: 'CONFIGURABLE' },
    { label: 'Slide gate', value: '2- or 3-plate; chromite sealing sand; free-opening target ≥ 98%', classification: 'CONFIGURABLE' },
    { label: 'Porous plugs', value: '1–2, argon', classification: 'CONFIGURABLE' },
    { label: 'Preheat', value: '1,000–1,100 °C hot face', classification: 'CONFIGURABLE' },
    { label: 'Ladle dimensions and freeboard', value: 'Must be confirmed with the ladle drawings', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Steelmaking technical sheet (reference configuration, draft for validation)',
    'AIST, The Making, Shaping and Treating of Steel — Steelmaking and Refining Volume',
    'Industry literature on ladle refractories and slide gate systems',
  ],
};
