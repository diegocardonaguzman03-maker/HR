import type { EquipmentData } from '../../types/equipment';

/**
 * Ladle Furnace (LF) for secondary metallurgy. Vacuum degassing (RH/VTD) is NOT part of the
 * reference configuration (optional, disabled). Calcium treatment by CaSi cored wire is included.
 * Reference configuration from FT-ACE-001 v0.3 (draft, not plant-validated).
 * All numeric values are SIMULATED TRAINING DATA / reference values, never plant setpoints.
 */
export const ladleFurnace: EquipmentData = {
  id: 'ladleFurnace',
  name: 'Ladle Furnace (Secondary Metallurgy)',
  shortName: 'Ladle Furnace',
  category: 'secondary-metallurgy',
  processStages: ['SECONDARY_METALLURGY'],
  tooltip: 'Heats, alloys, desulfurises and cleans the steel in the ladle before it is sent to the caster.',
  description:
    'The ladle furnace is a treatment station where the ladle is covered by a water-cooled roof and heated by three electrodes, while argon stirring, alloy additions and wire feeding bring the steel to its final chemistry, temperature and cleanliness.',
  purpose:
    'Take primary steel from the EAF and deliver refined liquid steel with the target chemistry (including low sulfur and controlled aluminium), a homogeneous temperature matched to the caster, and inclusions reduced and modified.',
  howItWorks: [
    'The ladle car brings the ladle under the LF roof. Argon stirring is started through the porous plug, a temperature measurement and a sample are taken, and the slag is conditioned with lime and deoxidisers to make it basic and reducing (low FeO + MnO).',
    'The electrodes are lowered through the roof and arcs heat the steel through the slag (reference 4–5 °C/min with a 25 MVA transformer). A well-foamed or thick slag covers the arcs to protect the ladle slag line and roof.',
    'Desulfurization happens at the steel–slag interface: it needs a basic, fluid, reducing slag with low oxygen activity in the steel (Al-killed), high temperature and strong argon stirring (reference 400–600 NL/min) to renew the interface. Target S in the reference is ≤ 0.010%.',
    'Alloys (FeMn, FeSi, SiMn, FeNb, etc.) are added through the alloy chute in calculated amounts based on the sample, steel weight and expected recovery. Aluminium is trimmed with Al wire to the soluble Al target (reference 0.020–0.045% for Al-killed slab grades).',
    'Inclusion control: deoxidation creates alumina particles; gentle argon stirring lets them float to the slag. For castability, CaSi cored wire may be fed to modify solid alumina into liquid calcium aluminates; the Ca amount must be balanced against S and Al (too little or too much Ca can form solid, clogging inclusions such as CaS).',
    'Before release the steel is soft-stirred (reference ≥ 8 min at 50–150 NL/min), final temperature and chemistry are confirmed, and the release temperature is set as liquidus + tundish superheat + expected transport and casting losses. The ladle is then released to the casting crane.',
  ],
  inputs: [
    'Ladle with primary liquid steel and carry-over slag',
    'Electrical energy',
    'Argon',
    'Lime, synthetic slag formers, slag deoxidisers',
    'Ferroalloys and Al',
    'Cored wires (CaSi, Al, C)',
  ],
  outputs: [
    'Refined liquid steel at target chemistry and temperature',
    'Reducing, sulfur-rich ladle slag',
    'Off-gas and dust',
    'Heat treatment record (temperatures, samples, additions)',
  ],
  components: [
    {
      id: 'roof',
      name: 'Water-cooled LF Roof',
      function: 'Covers the ladle to contain heat and fumes and holds electrode, alloy and wire ports.',
      failureModes: ['Water leak', 'Skull build-up', 'Lift mechanism malfunction'],
      inspectionPoints: ['Cooling water flow balance and temperatures', 'Skull accumulation', 'Port refractories'],
      maintenanceConsiderations: ['Water leak detection is safety critical'],
      processConsequence: 'Leaks create water–molten metal risk and hydrogen pick-up; skull can fall into the ladle.',
    },
    {
      id: 'electrodes',
      name: 'Graphite Electrodes',
      function: 'Three electrodes that strike arcs on the slag/steel to heat the ladle.',
      failureModes: ['Breakage', 'Excessive tip consumption', 'Carbon pick-up from electrode contact with steel'],
      inspectionPoints: ['Column length', 'Joint condition', 'Consumption trend'],
      maintenanceConsiderations: ['Additions under electrical isolation'],
      processConsequence: 'Delays; electrode dipping into steel can raise carbon for low-carbon grades.',
    },
    {
      id: 'electrodeArms',
      name: 'Electrode Arms and Regulation',
      function: 'Position the electrodes and regulate arc length/current.',
      failureModes: ['Unstable regulation', 'Clamp slipping', 'Insulation failure'],
      inspectionPoints: ['Regulation response', 'Clamp condition', 'Arm cooling'],
      maintenanceConsiderations: ['Hydraulic and electrical isolation before work'],
      processConsequence: 'Slow heating, arc flare to refractory, higher electrode consumption.',
    },
    {
      id: 'transformer',
      name: 'LF Transformer',
      function: 'Supplies arc power for heating (reference 25 MVA).',
      failureModes: ['Tap changer malfunction', 'Overheating'],
      inspectionPoints: ['Oil and winding temperature', 'Tap changer condition'],
      maintenanceConsiderations: ['High-voltage equipment; authorised personnel only'],
      processConsequence: 'Loss of heating capacity lengthens treatment and can desynchronise the caster sequence.',
    },
    {
      id: 'argonSystem',
      name: 'Argon Stirring System',
      function: 'Controls argon flow to the porous plug(s) and a top lance for emergency stirring.',
      failureModes: ['Flow controller failure', 'Hose/coupling leak', 'Blocked plug not detected'],
      inspectionPoints: ['Flow vs. pressure response', 'Coupling condition', 'Backup lance availability'],
      maintenanceConsiderations: ['Argon is an asphyxiant; leaks in pits or enclosed spaces are hazardous'],
      processConsequence: 'Wrong stirring: poor desulfurization, inhomogeneity, or (excessive) open eye and re-oxidation.',
    },
    {
      id: 'wireFeeder',
      name: 'Cored Wire Feeder',
      function: 'Feeds CaSi, Al or C cored wire deep into the steel at controlled speed and length.',
      failureModes: ['Wire jamming or breakage', 'Wrong feed speed (wire melts too high in the bath)', 'Guide tube wear'],
      inspectionPoints: ['Pinch rolls', 'Guide tube alignment', 'Length counter calibration'],
      maintenanceConsiderations: ['Moving pinch rolls: guarding and isolation required'],
      processConsequence: 'Low Ca or Al recovery, poor inclusion modification and nozzle clogging risk.',
    },
    {
      id: 'alloyChute',
      name: 'Alloy and Flux Addition System',
      function: 'Weighs and adds ferroalloys, lime and slag formers into the ladle.',
      failureModes: ['Weighing error', 'Chute blockage', 'Wet or wrong material'],
      inspectionPoints: ['Scale calibration', 'Bin identification', 'Chute condition'],
      maintenanceConsiderations: ['Material identification and dryness are critical'],
      processConsequence: 'Chemistry out of specification or water/hydrogen pick-up.',
    },
    {
      id: 'ladleCar',
      name: 'Ladle Transfer Car',
      function: 'Moves the ladle between the tapping position, the LF treatment position and the crane pick-up point.',
      failureModes: ['Drive or wheel failure', 'Power cable damage', 'Positioning error'],
      inspectionPoints: ['Wheels and rails', 'Cable reel / festoon', 'Position sensors'],
      maintenanceConsiderations: ['Track area must be kept clear of steel spills and debris'],
      processConsequence: 'Car failure blocks the ladle route and delays treatment and casting.',
    },
  ],
  processVariables: [
    {
      key: 'lf.temperature',
      name: 'Steel temperature at LF',
      unit: '°C',
      role: 'Controlled by arc heating to meet the release temperature for the caster.',
      trainingRange: '≈ 1,560–1,620 °C (grade and route dependent; simulated)',
      classification: 'ASSUMPTION',
    },
    {
      key: 'lf.sulfur',
      name: 'Sulfur content',
      unit: '%',
      role: 'Removed to slag under basic, reducing conditions with strong stirring.',
      trainingRange: 'Target ≤ 0.010% (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.argonFlow',
      name: 'Argon flow',
      unit: 'NL/min',
      role: 'Strong stirring for desulfurization and homogenisation; soft stirring for inclusion flotation before release.',
      trainingRange: 'Strong 400–600; soft 50–150 NL/min (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.treatmentTime',
      name: 'Treatment time',
      unit: 'min',
      role: 'Must fit inside the caster sequence cadence.',
      trainingRange: '35–45 min (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.aluminium',
      name: 'Soluble aluminium',
      unit: '%',
      role: 'Keeps steel deoxidised (low oxygen activity) for desulfurization and grain control; excess increases re-oxidation products.',
      trainingRange: '0.020–0.045% for Al-killed slab grades (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.heatingRate',
      name: 'Heating rate',
      unit: '°C/min',
      role: 'Defines how much temperature correction is possible in the available time.',
      trainingRange: '4–5 °C/min (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.calcium',
      name: 'Calcium content after CaSi treatment',
      unit: 'ppm',
      role: 'Modifies alumina inclusions; the correct Ca level depends on Al, S and O and is grade specific.',
      classification: 'PLANT_SPECIFIC',
    },
    {
      key: 'lf.softStirTime',
      name: 'Soft-stirring time before release',
      unit: 'min',
      role: 'Allows inclusions to float to the slag after the last additions.',
      trainingRange: '≥ 8 min (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.slagFeOMnO',
      name: 'Slag FeO + MnO',
      unit: '%',
      role: 'Indicator of slag oxidising potential; low values are needed for desulfurization and clean steel.',
      trainingRange: 'Typically kept low (e.g. < 2%, industry guidance; plant value required)',
      classification: 'INDUSTRY_STANDARD',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'Oxidising slag (high FeO + MnO) due to EAF carry-over',
      consequence: 'Al fading, slow desulfurization, more alumina inclusions, possible P reversion.',
      typicalResponse: 'Slag deoxidation and conditioning; reduce carry-over at tapping.',
    },
    {
      event: 'Sulfur not reaching target in the available time',
      consequence: 'Longer treatment or heat re-graded; caster sequence at risk.',
      typicalResponse: 'Check slag basicity/fluidity, deoxidation state, temperature and stirring intensity.',
    },
    {
      event: 'Excessive stirring (large open eye)',
      consequence: 'Steel exposed to air: re-oxidation, nitrogen pick-up, slag entrainment.',
      typicalResponse: 'Reduce argon flow to the practice range; keep slag covering the eye.',
    },
    {
      event: 'Wrong calcium treatment (too little or too much Ca)',
      consequence: 'Solid alumina or CaS inclusions; nozzle clogging at the caster.',
      typicalResponse: 'Adjust wire length based on Al, S and steel weight; review Ca recovery and wire feeding practice.',
    },
    {
      event: 'Release temperature out of window',
      consequence: 'Low: nozzle freezing or clogging at the caster; high: casting speed limits, breakout risk, segregation.',
      typicalResponse: 'Reheat or wait/cool with stirring before release; coordinate with the caster.',
    },
    {
      event: 'Electrode breakage or dipping into steel',
      consequence: 'Carbon pick-up, delays.',
      typicalResponse: 'Remove the piece if possible, re-sample and correct chemistry.',
    },
  ],
  impact: {
    safety:
      'Molten metal, electrical arc power, water-cooled roof, alloy additions (splash if wet) and argon asphyxiation are the main hazards.',
    quality:
      'The LF sets final chemistry, temperature and much of the inclusion population sent to the caster; it is the last opportunity to correct steel before casting.',
    reliability:
      'LF availability and treatment time directly limit the caster sequence; electrodes, roof cooling and argon system are key.',
    productivity:
      'Treatment time must match caster cadence; stable EAF tapping reduces LF corrections and energy use.',
  },
  qualityImpact: [
    {
      variable: 'lf.sulfur',
      mechanism:
        'Desulfurization depends at the same time on slag basicity and fluidity, low slag FeO + MnO, low oxygen activity in steel (Al), temperature and stirring energy; no single variable guarantees the result.',
      possibleDefects: ['MnS inclusions (reduced ductility, lamellar tearing)', 'Poor HIC resistance in line pipe grades', 'Hot cracking susceptibility'],
    },
    {
      variable: 'lf.aluminium',
      mechanism:
        'Al controls oxygen activity; deoxidation forms alumina that must float out. Clogging also depends on Ca treatment, re-oxidation during transfer and casting, refractory reactions and superheat.',
      possibleDefects: ['Alumina clusters', 'Nozzle clogging', 'Slivers and surface defects after rolling'],
    },
    {
      variable: 'lf.argonFlow',
      mechanism:
        'Stirring promotes mixing and inclusion flotation but too strong stirring exposes steel to air and entrains slag; the net effect depends on slag cover, timing and ladle geometry.',
      possibleDefects: ['Re-oxidation inclusions', 'Nitrogen pick-up', 'Slag entrapment'],
    },
    {
      variable: 'lf.temperature',
      mechanism:
        'Release temperature determines tundish superheat together with ladle waiting time, lining condition and tundish preheat. Superheat influences solidification structure, clogging and breakout risk.',
      possibleDefects: ['Centre segregation and porosity (high superheat, with other factors)', 'Nozzle freezing/clogging (low superheat)'],
    },
    {
      variable: 'lf.calcium',
      mechanism:
        'Ca modifies alumina into liquid calcium aluminates only within a window defined by Al, S and total oxygen; outside it solid CaS or unmodified alumina form.',
      possibleDefects: ['Nozzle clogging', 'Hard, non-deformable inclusions (e.g. fatigue- or HIC-sensitive grades)'],
    },
  ],
  safetyHazards: [
    { category: 'molten-metal', description: 'Liquid steel and slag in the ladle; splashing during additions and stirring.' },
    { category: 'electrical', description: 'Arc heating with high-current secondary circuit.' },
    { category: 'water-molten-metal', description: 'Water-cooled roof above the ladle; wet additions.' },
    { category: 'gas', description: 'Argon (asphyxiant) and off-gas/fumes.' },
    { category: 'high-temperature', description: 'Radiant heat during sampling, temperature measurement and wire feeding.' },
    { category: 'moving-machinery', description: 'Ladle car, roof lift and wire feeder pinch rolls.' },
    { category: 'noise-dust', description: 'Arc noise and fume during heating and additions.' },
  ],
  maintenancePoints: [
    {
      component: 'argonSystem',
      function: 'Provide controlled stirring.',
      failureMode: 'Loss of flow or undetected blocked plug.',
      inspectionPoints: ['Flow/pressure response', 'Couplings and hoses', 'Backup lance'],
      considerations: 'Gas leaks are an asphyxiation hazard in pits and enclosed areas.',
      processConsequence: 'Poor desulfurization and cleanliness.',
    },
    {
      component: 'wireFeeder',
      function: 'Inject CaSi/Al/C wire.',
      failureMode: 'Jamming, wrong speed, guide tube wear.',
      inspectionPoints: ['Pinch rolls', 'Guide tube', 'Counter calibration'],
      considerations: 'Feed speed and guide alignment determine wire penetration depth and recovery.',
      processConsequence: 'Chemistry and inclusion control deviations.',
    },
    {
      component: 'roof',
      function: 'Contain heat and fumes.',
      failureMode: 'Water leak.',
      inspectionPoints: ['Flow balance', 'Outlet temperatures'],
      considerations: 'Leak detection interlocks must not be bypassed.',
      processConsequence: 'Safety stop and hydrogen pick-up.',
    },
    {
      component: 'electrodes',
      function: 'Heat the steel.',
      failureMode: 'Breakage or excessive consumption.',
      inspectionPoints: ['Joints', 'Column length'],
      considerations: 'Regulation settings influence consumption and refractory arc flare.',
      processConsequence: 'Delays and carbon pick-up.',
    },
  ],
  specifications: [
    { label: 'Number of units', value: '2 (LF-1, LF-2)', classification: 'CONFIGURABLE' },
    { label: 'Transformer', value: '25 MVA', classification: 'CONFIGURABLE' },
    { label: 'Electrodes', value: '457 mm (18") graphite', classification: 'CONFIGURABLE' },
    { label: 'Heating rate', value: '4–5 °C/min', classification: 'CONFIGURABLE' },
    { label: 'Argon stirring', value: 'Strong 400–600 NL/min; soft 50–150 NL/min (≥ 8 min before release)', classification: 'CONFIGURABLE' },
    { label: 'Wire feeder', value: '2 lines: CaSi, Al, C', classification: 'CONFIGURABLE' },
    { label: 'Targets', value: 'S ≤ 0.010%; Al soluble 0.020–0.045% (Al-killed slab grades)', classification: 'CONFIGURABLE' },
    { label: 'Treatment time', value: '35–45 min', classification: 'CONFIGURABLE' },
    { label: 'Vacuum degassing', value: 'Not installed in the reference configuration (optional, disabled)', classification: 'ASSUMPTION' },
    { label: 'Ca treatment window (ppm Ca vs. Al, S)', value: 'Grade- and plant-specific', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Steelmaking technical sheet (reference configuration, draft for validation)',
    'AIST, The Making, Shaping and Treating of Steel — Steelmaking and Refining Volume',
    'Industry literature on ladle desulfurization, alumina inclusion flotation and calcium treatment',
  ],
};
