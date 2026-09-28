import type { EquipmentData } from '../../types/equipment';

/**
 * Ladle (casting) overhead crane. Reference configuration from FT-ACE-001 v0.3 (draft, not plant-validated).
 * All numeric values are SIMULATED TRAINING DATA / reference values, never plant setpoints.
 */
export const crane: EquipmentData = {
  id: 'crane',
  name: 'Ladle (Casting) Overhead Crane',
  shortName: 'Ladle Crane',
  category: 'handling',
  processStages: ['TRANSFER', 'TURRET'],
  tooltip: 'Heavy overhead crane that lifts and carries full steel ladles to the caster turret.',
  description:
    'The ladle crane is a heavy-duty overhead travelling crane designed for molten-metal service that lifts full ladles by their trunnions and moves them between the ladle furnace, the caster turret and the ladle preparation area.',
  purpose:
    'Transport ladles with ≈ 150 t of liquid steel safely and on time, so that the caster receives the next ladle before the current one is empty.',
  howItWorks: [
    'The crane travels on rails along the ladle bay. Its bridge carries a main trolley with the main hoist and, typically, an auxiliary trolley/hoist used for tilting the ladle (e.g. slag dumping).',
    'The main hoist lowers a lifter beam (ladle hook) whose two hooks engage the ladle trunnions. The load is lifted slowly, checked, and then moved along the bay with controlled acceleration to avoid swinging.',
    'Cranes for molten-metal service are built with redundancy: in the reference configuration they have double braking systems and redundant limit switches, so that a single failure does not drop the load. Load weighing supports the heat mass balance.',
    'At the caster the crane places the ladle on the free arm of the turret; the turret then rotates it to the casting position. Timing of this transfer is part of the sequence planning.',
  ],
  inputs: ['Treated ladle from the LF', 'Empty ladle from the turret', 'Electrical power', 'Movement orders from the operator/dispatch'],
  outputs: ['Ladle placed on the caster turret', 'Empty ladle returned for preparation', 'Ladle weight reading'],
  components: [
    {
      id: 'bridge',
      name: 'Bridge (Girders and End Carriages)',
      function: 'Main structure spanning the bay that travels along the runway rails.',
      failureModes: ['Structural fatigue cracking', 'Wheel/rail wear and skewing', 'Travel drive or brake failure'],
      inspectionPoints: ['Girder welds (NDT per plant rules)', 'Wheels, rails and alignment', 'Travel brakes'],
      maintenanceConsiderations: ['Heat radiation from ladles accelerates wear of components under the girders'],
      processConsequence: 'Crane out of service blocks ladle logistics and can stop casting.',
    },
    {
      id: 'trolley',
      name: 'Main and Auxiliary Trolleys',
      function: 'Travel across the bridge carrying the hoists.',
      failureModes: ['Trolley drive or brake failure', 'Rail wear', 'Collision with limits'],
      inspectionPoints: ['Drives and brakes', 'Trolley rails', 'Limit switches'],
      maintenanceConsiderations: ['Limit switches are safety devices and must be tested per plant rules'],
      processConsequence: 'Loss of positioning accuracy at the turret or LF.',
    },
    {
      id: 'hoist',
      name: 'Main Hoist (Redundant Drive and Brakes)',
      function: 'Raises and lowers the lifter beam and the ladle.',
      failureModes: ['Wire rope wear or broken wires', 'Brake degradation', 'Gearbox or drum damage', 'Overload'],
      inspectionPoints: ['Wire ropes (broken wires, diameter reduction, heat damage)', 'Service and emergency brakes', 'Upper/lower limit switches', 'Load cell'],
      maintenanceConsiderations: ['Rope discard and brake criteria follow OEM and applicable lifting standards'],
      processConsequence: 'Hoist failure with a full ladle is a catastrophic molten-metal scenario.',
    },
    {
      id: 'lifterBeam',
      name: 'Lifter Beam (Ladle Hook)',
      function: 'Beam with two hooks that engage the ladle trunnions.',
      failureModes: ['Hook wear or cracks', 'Incorrect engagement on trunnions', 'Heat damage'],
      inspectionPoints: ['Hook throat and wear surfaces', 'NDT per plant lifting rules', 'Heat shields'],
      maintenanceConsiderations: ['Critical lifting accessory; visual check before each lift is common industry practice'],
      processConsequence: 'Incorrect engagement or hook failure can drop or tilt the ladle.',
    },
  ],
  processVariables: [
    {
      key: 'crane.load',
      name: 'Hook load',
      unit: 't',
      role: 'Confirms ladle weight and protects against overload.',
      trainingRange: 'Up to ≈ 250 t main hook rating (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'crane.transferTime',
      name: 'LF-to-turret transfer time',
      unit: 'min',
      role: 'Adds temperature loss and must fit the caster sequence.',
      classification: 'PLANT_SPECIFIC',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'Load swing during travel',
      consequence: 'Steel splashing, impact with structures, loss of positioning.',
      typicalResponse: 'Smooth acceleration, anti-sway controls where installed, clear travel path.',
    },
    {
      event: 'Brake or hoist fault with suspended ladle',
      consequence: 'Potential uncontrolled lowering of liquid steel.',
      typicalResponse: 'Redundant brake engages; emergency plan and exclusion zone per plant rules.',
    },
    {
      event: 'Incorrect trunnion engagement',
      consequence: 'Ladle tilts or drops.',
      typicalResponse: 'Visual confirmation of both hooks before lifting; slow initial lift.',
    },
    {
      event: 'Crane unavailable during sequence',
      consequence: 'Next ladle cannot reach the turret; sequence break at the caster.',
      typicalResponse: 'Second crane used; sequence and ladle plan adjusted.',
    },
  ],
  impact: {
    safety:
      'Carrying liquid steel overhead is one of the highest-severity activities in the melt shop; people must never be under suspended loads.',
    quality: 'Transfer delays reduce temperature and can push the steel outside the caster superheat window.',
    reliability: 'Ladle crane availability is critical because typically there is limited redundancy in the ladle bay.',
    productivity: 'Crane cycle times directly influence ladle turnaround and caster sequence continuity.',
  },
  qualityImpact: [
    {
      variable: 'crane.transferTime',
      mechanism:
        'Longer transfer increases temperature loss; the effect on tundish superheat also depends on LF release temperature, ladle lining condition and slag cover.',
      possibleDefects: ['Low superheat related clogging (indirect)'],
    },
  ],
  safetyHazards: [
    { category: 'suspended-loads', description: 'Full ladles of liquid steel carried overhead.' },
    { category: 'molten-metal', description: 'Splash or spill from a moving ladle.' },
    { category: 'moving-machinery', description: 'Bridge and trolley travel; collision risk.' },
    { category: 'electrical', description: 'Conductor rails and crane electrical systems.' },
    { category: 'high-temperature', description: 'Radiant heat on cab, ropes and hooks.' },
    { category: 'pinch-points', description: 'Hook and trunnion engagement.' },
  ],
  maintenancePoints: [
    {
      component: 'hoist',
      function: 'Lift and lower the ladle.',
      failureMode: 'Rope or brake degradation.',
      inspectionPoints: ['Wire rope condition', 'Brakes', 'Limit switches'],
      considerations: 'Discard and acceptance criteria per OEM and lifting standards (verify with SSO).',
      processConsequence: 'Crane stop; catastrophic event if failure under load.',
    },
    {
      component: 'lifterBeam',
      function: 'Engage trunnions.',
      failureMode: 'Hook wear or cracks.',
      inspectionPoints: ['Hook wear surfaces', 'NDT'],
      considerations: 'Critical lifting accessory.',
      processConsequence: 'Ladle drop or tilt.',
    },
    {
      component: 'bridge',
      function: 'Travel along the bay.',
      failureMode: 'Structural fatigue or drive failure.',
      inspectionPoints: ['Welds', 'Wheels and rails', 'Brakes'],
      considerations: 'Heat exposure accelerates degradation.',
      processConsequence: 'Crane unavailability.',
    },
  ],
  specifications: [
    { label: 'Number of ladle cranes', value: '2', classification: 'CONFIGURABLE' },
    { label: 'Capacity', value: '250 t main / 63 t auxiliary', classification: 'CONFIGURABLE' },
    { label: 'Safety design', value: 'Double braking system and redundant limits', classification: 'CONFIGURABLE' },
    { label: 'Span, lift height, speeds', value: 'Must be confirmed with crane OEM data', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Steelmaking technical sheet (reference configuration, draft for validation)',
    'General industry practice for molten-metal overhead cranes (verify applicable standards with SSO)',
  ],
};
