import type { EquipmentData } from '../../types/equipment';

/**
 * Ladle turret (CC1 slab caster).
 * Reference configuration: FT-ACE-001 v0.3 §4 (butterfly arms, 2 ladles, ladle weighing,
 * ladle shroud with argon seal). Plant values are CONFIGURABLE, not verified.
 */
export const turret: EquipmentData = {
  id: 'turret',
  name: 'Ladle Turret',
  shortName: 'Turret',
  category: 'casting',
  processStages: ['TURRET', 'TUNDISH_FILL', 'MOLD_FILL'],
  tooltip: 'Holds two ladles and rotates the full one over the tundish so casting never stops between heats.',
  description:
    'The ladle turret is a rotating stand with two arms. One arm holds the ladle that is casting; the other receives the next ladle from the crane. Rotating the turret swaps them in about a minute, which is what allows sequence casting of many heats without stopping the strand.',
  purpose:
    'Support the ladle safely above the tundish, measure how much steel is left, and exchange ladles quickly so the tundish level (and therefore the mold) is never starved of steel during a sequence.',
  howItWorks: [
    'The overhead crane places the ladle coming from the ladle furnace on the free arm (the "stand-by" position). The ladle rests on supports fitted with load cells, so the weight of steel is known at all times.',
    'The turret rotates 180° and brings the full ladle to the casting position above the tundish. The arm lowers the ladle until the slide gate nozzle can be connected to the ladle shroud.',
    'The ladle shroud is a refractory tube pressed against the ladle collector nozzle and immersed in the tundish steel. An argon seal at the joint prevents air from being sucked into the stream (reoxidation and nitrogen pick-up).',
    'The ladle slide gate is opened and steel flows into the tundish. The flow is regulated to keep the tundish weight inside its operating window, while the stopper rod (in the tundish) controls the flow into the mold.',
    'Near the end of the heat, the decreasing ladle weight and slag detection tell the operator when to close the slide gate so ladle slag does not pass to the tundish. Meanwhile the next ladle is already waiting on the other arm.',
    'During the ladle change the tundish acts as a buffer: its stored steel keeps feeding the mold while the turret rotates and the new ladle is opened. This is why the tundish weight is raised before the change.',
  ],
  inputs: ['Full ladle of refined steel from the ladle furnace (via crane)', 'Argon for the shroud seal', 'Electric / hydraulic power for rotation and lifting'],
  outputs: ['Controlled steel stream into the tundish', 'Empty ladle returned to the crane', 'Ladle weight signal for the casting control system'],
  components: [
    {
      id: 'base',
      name: 'Turret Base and Slewing Bearing',
      function: 'Fixed foundation and large-diameter slewing bearing that carries the full turret load and allows rotation.',
      failureModes: ['Bearing wear or loss of lubrication', 'Loosening of anchor bolts or foundation cracking', 'Excessive play causing ladle misalignment over the tundish'],
      inspectionPoints: ['Bearing rotation smoothness and noise', 'Lubrication condition', 'Bolt condition and foundation integrity', 'Tilt / play measurements'],
      maintenanceConsiderations: ['Critical load-bearing structure carrying two full ladles; any intervention requires engineering assessment and OEM criteria [Validate with OEM].'],
      processConsequence: 'Loss of rotation capability stops the sequence; structural failure under a full ladle is a major molten-metal hazard.',
    },
    {
      id: 'arms',
      name: 'Butterfly Arms',
      function: 'Two independent arms that hold the ladles and can lift / lower them over the tundish.',
      failureModes: ['Structural fatigue cracks at welds', 'Lift cylinder leak or drift', 'Arm not reaching the correct height for shroud connection'],
      inspectionPoints: ['Weld and structure condition (NDT per engineering criteria)', 'Lift cylinder seals and hoses', 'Position feedback of each arm'],
      maintenanceConsiderations: ['Arms are exposed to radiant heat and possible steel splash; heat shielding condition matters.'],
      processConsequence: 'An arm that cannot lower correctly prevents shroud connection and forces open-stream pouring or a stop in the sequence.',
    },
    {
      id: 'ladleSupports',
      name: 'Ladle Supports (Saddles)',
      function: 'Seats on each arm where the ladle trunnions rest in a defined position.',
      failureModes: ['Wear or deformation of seats', 'Build-up of skull or debris preventing correct seating'],
      inspectionPoints: ['Seat geometry and wear', 'Cleanliness before each ladle is placed'],
      maintenanceConsiderations: ['Incorrect seating shifts the ladle nozzle position and affects shroud alignment.'],
      processConsequence: 'Misaligned ladle nozzle → poor shroud seal → air aspiration and reoxidation inclusions.',
    },
    {
      id: 'loadCells',
      name: 'Ladle Load Cells',
      function: 'Weigh each ladle continuously to know the remaining steel and the pouring rate.',
      failureModes: ['Signal drift or loss', 'Mechanical damage or overheating of cells', 'Calibration error'],
      inspectionPoints: ['Zero and calibration checks against a reference', 'Cable and junction box condition', 'Heat shielding'],
      maintenanceConsiderations: ['Weight signal is used to anticipate end of ladle and slag carry-over; a wrong signal misleads the operator.'],
      processConsequence: 'Wrong weight → late slide gate closure (slag to tundish) or early closure (steel yield loss).',
    },
    {
      id: 'rotationDrive',
      name: 'Rotation Drive',
      function: 'Motor / gearbox (with emergency back-up drive) that rotates the turret between stand-by and casting positions.',
      failureModes: ['Motor or gearbox failure', 'Brake failure', 'Loss of main power during rotation'],
      inspectionPoints: ['Gear and pinion wear', 'Brake condition', 'Function of the emergency drive'],
      maintenanceConsiderations: ['The emergency drive exists so a full ladle can always be moved away from the casting position [Validate with OEM].'],
      processConsequence: 'A failed ladle change interrupts the sequence: the tundish empties and the strand must be stopped (end of sequence).',
    },
    {
      id: 'ladleShroud',
      name: 'Ladle Shroud (with Argon Seal)',
      function: 'Refractory tube that protects the ladle-to-tundish stream from air.',
      failureModes: ['Cracking by thermal shock', 'Erosion or clogging', 'Poor seal at the collector nozzle (air ingress)'],
      inspectionPoints: ['Visual condition before each use', 'Argon flow and pressure at the seal', 'Correct immersion in the tundish'],
      maintenanceConsiderations: ['Shroud is a consumable; preheating and handling practice affect its life [Validate with Process Engineering].'],
      processConsequence: 'Air ingress causes reoxidation (Al2O3 inclusions), nitrogen pick-up and higher SEN clogging tendency.',
    },
  ],
  processVariables: [
    { key: 'ladle.weight', name: 'Ladle steel weight', unit: 't', role: 'Remaining steel in the casting ladle; used to plan the ladle change and prevent slag carry-over.', trainingRange: 'Heat size to 0 t', classification: 'CONFIGURABLE' },
    { key: 'tundish.weight', name: 'Tundish steel weight', unit: 't', role: 'Buffer between ladle and mold; the turret operator regulates ladle flow to keep it in range.', trainingRange: '≈ 35–45 t (45 t nominal) — SIMULATED TRAINING DATA', classification: 'CONFIGURABLE' },
    { key: 'turret.shroudArgon', name: 'Shroud argon seal flow', unit: 'NL/min', role: 'Protects the stream from air at the shroud joint.', classification: 'PLANT_SPECIFIC' },
    { key: 'turret.ladleChangeTime', name: 'Ladle change time', unit: 's', role: 'Time the tundish must feed the mold alone; defines how much the tundish level falls.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Ladle slag carry-over at the end of the heat', consequence: 'Slag enters the tundish, increasing inclusions and SEN clogging risk; may appear as slag defects in the slab.', typicalResponse: 'Close the slide gate on slag detection / weight trend; keep an adequate residual steel in the ladle.' },
    { event: 'Shroud crack or poor seal', consequence: 'Air aspiration: reoxidation inclusions and nitrogen pick-up; visible flare at the joint.', typicalResponse: 'Check argon seal, reseat or replace shroud when possible; flag affected slabs for quality review.' },
    { event: 'Late ladle arrival', consequence: 'Tundish level falls; lower level means worse inclusion flotation and possible vortexing; eventually end of sequence.', typicalResponse: 'Reduce casting speed within limits to gain time; if no ladle, perform a planned end of cast.' },
    { event: 'Slide gate cannot be opened (frozen nozzle)', consequence: 'No flow into the tundish; sequence at risk.', typicalResponse: 'Apply the plant opening practice (e.g., oxygen lancing by authorised personnel); otherwise remove the ladle.' },
    { event: 'Rotation or lift failure with a full ladle', consequence: 'Sequence stops; a full ladle held in a non-standard position is a serious hazard.', typicalResponse: 'Use emergency drive / back-up system to reach a safe position; area clearance per plant procedure.' },
  ],
  impact: {
    safety: 'Handles the heaviest suspended molten-metal load of the caster; structural, hydraulic and rotation integrity are critical.',
    quality: 'Stream protection (shroud and argon) and slag control directly influence steel cleanliness in the slab.',
    reliability: 'The turret is a single point of failure for sequence casting; a failure ends the sequence.',
    productivity: 'Fast, reliable ladle changes enable long sequences and fewer strand restarts.',
  },
  qualityImpact: [
    {
      variable: 'Stream protection (shroud seal + argon) and ladle slag control',
      mechanism: 'Reoxidation at the ladle stream combines with ladle slag carry-over, tundish level during the change and SEN argon practice to determine how many alumina clusters reach the mold. None of these factors acts alone: a good seal with poor slag control still produces inclusions.',
      possibleDefects: ['Non-metallic inclusions (alumina clusters)', 'Slag entrapment slivers', 'Increased SEN clogging and resulting mold level fluctuation'],
    },
  ],
  safetyHazards: [
    { category: 'suspended-loads', description: 'Full ladles supported above working areas.' },
    { category: 'molten-metal', description: 'Possible splash or breakthrough from ladle, slide gate or shroud.' },
    { category: 'moving-machinery', description: 'Turret rotation and arm movement.' },
    { category: 'hydraulic', description: 'High-pressure hydraulic lift and slide gate systems.' },
    { category: 'high-temperature', description: 'Radiant heat from the ladle and stream.' },
  ],
  maintenancePoints: [
    { component: 'Slewing bearing', function: 'Carry and rotate the turret', failureMode: 'Wear / lubrication loss', inspectionPoints: ['Noise and smoothness', 'Lubrication', 'Play'], considerations: 'Structural critical item; OEM criteria apply.', processConsequence: 'Cannot change ladles → end of sequence.' },
    { component: 'Load cells', function: 'Ladle weighing', failureMode: 'Drift / signal loss', inspectionPoints: ['Calibration', 'Cabling', 'Heat shields'], considerations: 'Weight is used for slag and change decisions.', processConsequence: 'Slag carry-over or yield loss.' },
    { component: 'Ladle shroud manipulator and argon seal', function: 'Connect and seal the shroud', failureMode: 'Poor seal / misalignment', inspectionPoints: ['Argon flow', 'Seal seat', 'Alignment'], considerations: 'Consumable refractories; handling practice.', processConsequence: 'Reoxidation inclusions.' },
  ],
  specifications: [
    { label: 'Type', value: 'Butterfly arms, 2 ladles, independent lift', classification: 'CONFIGURABLE' },
    { label: 'Ladle weighing', value: 'Load cells on each arm', classification: 'CONFIGURABLE' },
    { label: 'Ladle shroud', value: 'Refractory shroud with argon seal', classification: 'CONFIGURABLE' },
    { label: 'Ladle capacity / heat size', value: 'Per plant ladle design', classification: 'PLANT_SPECIFIC' },
    { label: 'Rotation time', value: 'Per OEM', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (reference configuration)', 'docs/assumptions/caster.md', 'General continuous casting literature (e.g., AIST "The Making, Shaping and Treating of Steel", Casting Volume)'],
};
