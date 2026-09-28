import type { EquipmentData } from '../../types/equipment';

/**
 * Raw materials area: scrap yard, scrap buckets, DRI storage and conveying, flux bins.
 * Reference configuration from FT-ACE-001 v0.3 (draft, not plant-validated).
 * All numeric values are SIMULATED TRAINING DATA / reference values, never plant setpoints.
 */
export const rawMaterials: EquipmentData = {
  id: 'rawMaterials',
  name: 'Raw Materials Handling (Scrap, DRI and Fluxes)',
  shortName: 'Raw Materials',
  category: 'raw-materials',
  processStages: ['RAW_MATERIALS', 'CHARGING'],
  tooltip: 'Stores, prepares and delivers scrap, DRI and fluxes that make up the EAF charge.',
  description:
    'The raw materials area receives, stores, classifies and delivers the metallic charge (scrap and direct reduced iron, DRI) and the slag-forming fluxes (lime and dolomite) that the electric arc furnace needs for every heat.',
  purpose:
    'Deliver the right mix, weight and quality of metallic charge and fluxes to the EAF at the right time, so that the heat reaches its target chemistry, temperature and tap-to-tap time with minimum residual elements and minimum risk.',
  howItWorks: [
    'Scrap arrives by rail or truck, passes a radiation detection portal and is unloaded into the scrap yard, where it is sorted into grades (for example heavy melting, shredded, turnings, bundles, home scrap) because each grade brings a different density, cleanliness and residual-element content (Cu, Sn, Ni, Cr, Mo).',
    'For each heat a scrap "recipe" is prepared: a charging crane with a magnet or grab loads selected grades into a scrap bucket in a defined layering order (light scrap at the bottom to protect the furnace hearth, heavy pieces in the middle, light scrap on top to allow quick arc bore-in). The bucket is weighed as it is loaded.',
    'In the reference configuration about 60% of the metallic charge is DRI/HBI. DRI is stored in closed silos (it can re-oxidise and self-heat if exposed to moisture and air) and is sent by a closed belt conveyor to a weigh hopper above the EAF roof, from where it is fed continuously through the fifth roof hole during melting.',
    'Lime and dolomite are stored in flux bins and dosed by weigh feeders, either into the scrap bucket or through the roof feeding system together with DRI, to build the basic, MgO-saturated foamy slag the furnace needs.',
    'The bucket recipe, DRI rate and flux additions are coordinated with the melt shop so the charge matches the steel grade: grades with tight residual limits need more DRI or cleaner scrap, while grades with loose limits can use more scrap.',
  ],
  inputs: [
    'Purchased scrap (several grades)',
    'Home (internal) scrap and returns',
    'DRI / HBI from the direct reduction plant',
    'Burnt lime (CaO) and dolomitic lime (CaO-MgO)',
    'Grade recipe and charging plan from the melt shop',
  ],
  outputs: [
    'Loaded and weighed scrap buckets',
    'Continuous DRI flow to the EAF fifth-hole feeding system',
    'Dosed flux additions',
    'Charge weight and composition records for mass balance',
  ],
  components: [
    {
      id: 'scrapYard',
      name: 'Scrap Yard',
      function: 'Receives, inspects, classifies and stores scrap by grade.',
      failureModes: [
        'Mixing of scrap grades (residual-element contamination)',
        'Wet, snow- or ice-covered scrap, or closed containers entering the yard',
        'Poor segregation of non-metallics (dirt, rubber, plastics)',
      ],
      inspectionPoints: [
        'Visual inspection of incoming loads for sealed containers, liquids and non-metallics',
        'Grade segregation and labelling of bays',
        'Yard drainage condition',
      ],
      maintenanceConsiderations: [
        'Scrap yard crane magnets/grabs and floor surfaces must be kept in condition for safe handling',
      ],
      processConsequence:
        'Poor scrap quality raises residual elements (Cu, Sn), slag volume, energy consumption and the risk of explosions from trapped water or sealed containers.',
    },
    {
      id: 'scrapBucket',
      name: 'Scrap Bucket (Charging Basket)',
      function: 'Carries a layered, weighed scrap charge from the yard to the EAF and discharges it through a clamshell bottom.',
      failureModes: [
        'Clamshell bottom does not open or opens partially',
        'Deformed shell or worn/cracked hinges and latching',
        'Scrap bridging inside the bucket',
      ],
      inspectionPoints: [
        'Clamshell leaves, hinges and pins',
        'Lifting lugs and bail',
        'Shell deformation and wear plates',
        'Load cell / weighing reading',
      ],
      maintenanceConsiderations: [
        'Lifting points are critical items and need condition-based inspection according to plant and OEM rules',
      ],
      processConsequence:
        'A bucket that does not discharge properly delays charging, extends power-off time and can damage the furnace or roof.',
    },
    {
      id: 'driSilo',
      name: 'DRI Storage Silo',
      function: 'Stores DRI/HBI under controlled conditions and supplies it to the conveying system.',
      failureModes: [
        'DRI re-oxidation and self-heating (moisture or air ingress)',
        'Material bridging or rat-holing at the silo outlet',
        'Fines accumulation',
      ],
      inspectionPoints: [
        'Silo temperature and gas monitoring (CO, H₂) where installed',
        'Outlet gates and feeders',
        'Level measurement',
        'Inerting system condition (if installed)',
      ],
      maintenanceConsiderations: [
        'DRI must be kept dry; storage conditions and inerting practice are plant-specific',
      ],
      processConsequence:
        'Degraded DRI (lower metallization, more fines) increases energy and slag FeO, lowers metallic yield and can make feeding irregular.',
    },
    {
      id: 'conveyor',
      name: 'DRI Belt Conveyor and Weigh Hopper',
      function: 'Transports DRI from silos to the EAF roof and meters its feed rate into the furnace.',
      failureModes: [
        'Belt misalignment, tear or splice failure',
        'Weigh feeder calibration drift',
        'Blockage of chutes or the fifth-hole feed pipe',
        'Hot DRI damaging belts (if hot DRI is used)',
      ],
      inspectionPoints: [
        'Belt tracking, idlers and pulleys',
        'Weigh scale calibration checks',
        'Chute wear liners and dust sealing',
      ],
      maintenanceConsiderations: [
        'Pull-cords and guards are part of the conveyor safety system; isolation is required before any intervention',
      ],
      processConsequence:
        'Irregular DRI feed rate disturbs the bath temperature, the foamy slag and the arc stability; overfeeding can freeze a "DRI iceberg" in the bath.',
    },
    {
      id: 'fluxBins',
      name: 'Flux Bins and Dosing',
      function: 'Stores and doses lime and dolomite to form the furnace slag.',
      failureModes: [
        'Hydrated (slaked) lime due to moisture',
        'Dosing screw/feeder blockage',
        'Weighing error',
      ],
      inspectionPoints: ['Bin level indicators', 'Feeder operation', 'Lime quality (reactivity, moisture) certificates'],
      maintenanceConsiderations: ['Keep lime dry; hydrated lime brings hydrogen into the steel'],
      processConsequence:
        'Wrong lime or dolomite addition changes basicity and MgO saturation: more refractory wear, poorer dephosphorization and poorer slag foaming.',
    },
    {
      id: 'radiationPortal',
      name: 'Radiation Detection Portal',
      function: 'Detects radioactive sources hidden in incoming scrap before it is unloaded.',
      failureModes: ['Detector out of calibration', 'Alarm bypassed or ignored', 'Loss of power to the portal'],
      inspectionPoints: ['Functional checks with the plant check source', 'Alarm log review'],
      maintenanceConsiderations: [
        'Response to a radiation alarm follows the plant radiological protection procedure and the national regulator requirements',
      ],
      processConsequence:
        'A melted radioactive source contaminates steel, dust and equipment and can shut down the melt shop.',
    },
  ],
  processVariables: [
    {
      key: 'raw.scrapFraction',
      name: 'Scrap share of metallic charge',
      unit: '%',
      role: 'Defines how much residual elements and energy the charge brings; the rest is DRI.',
      trainingRange: '≈ 40% (reference configuration)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'raw.driFraction',
      name: 'DRI share of metallic charge',
      unit: '%',
      role: 'DRI dilutes residuals but brings gangue (SiO₂, Al₂O₃) and FeO that must be handled by the slag and energy input.',
      trainingRange: '≈ 60% (reference configuration)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'raw.bucketWeight',
      name: 'Scrap bucket charge weight',
      unit: 't',
      role: 'Controls the metallic input per bucket and the number of buckets per heat.',
      trainingRange: '55–70 t per bucket, 1–2 buckets (reference)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'raw.driMetallization',
      name: 'DRI metallization',
      unit: '%',
      role: 'Fraction of iron already metallic; lower values mean more FeO to reduce, more energy and lower yield.',
      trainingRange: '≈ 92–95% (typical; plant value required)',
      classification: 'PLANT_SPECIFIC',
    },
    {
      key: 'raw.limeAddition',
      name: 'Lime addition',
      unit: 'kg/t',
      role: 'Main slag former; sets basicity for dephosphorization and refractory protection.',
      trainingRange: '30–45 kg/t (reference)',
      classification: 'CONFIGURABLE',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'Wet scrap or sealed container charged into the furnace',
      consequence: 'Water trapped under molten metal can vaporise violently and cause an explosion or eruption.',
      typicalResponse: 'Industry practice is strict incoming inspection, rejection of sealed or wet material and keeping scrap dry.',
    },
    {
      event: 'Scrap grade mix-up',
      consequence: 'Residual elements (Cu, Sn, Ni, Cr, Mo) out of grade specification; they cannot be removed in the EAF or LF.',
      typicalResponse: 'Heat is re-graded or diluted with DRI; scrap classification and traceability are reviewed.',
    },
    {
      event: 'Radiation portal alarm',
      consequence: 'Possible radioactive source in the load.',
      typicalResponse: 'Load is held and isolated and the plant radiological protection procedure is applied.',
    },
    {
      event: 'DRI self-heating in storage',
      consequence: 'Loss of metallization, hot spots, gas generation and possible fire.',
      typicalResponse: 'Temperature monitoring, inerting where installed and controlled withdrawal of affected material.',
    },
    {
      event: 'DRI feed interruption or overfeed',
      consequence: 'Bath temperature swings, slag foaming loss, unmelted DRI accumulations and longer power-on time.',
      typicalResponse: 'Feed rate is matched to active power and bath temperature; blockages are cleared under isolation.',
    },
  ],
  impact: {
    safety:
      'Charge quality is a first-line safety barrier: wet scrap, closed containers and radioactive sources are among the most severe melt shop hazards.',
    quality:
      'The charge sets the residual-element level and contributes to P, N and S input; DRI quality influences slag volume and FeO.',
    reliability:
      'Irregular DRI supply or bucket problems stop or slow the EAF, the most expensive asset in the melt shop.',
    productivity:
      'Correct bucket density and DRI rate reduce power-off time, energy and electrode consumption and support the tap-to-tap target.',
  },
  qualityImpact: [
    {
      variable: 'raw.scrapFraction',
      mechanism:
        'Residual elements such as Cu and Sn enter mainly with scrap and are not oxidised in the EAF; their final level also depends on DRI dilution, home scrap recycling and scrap grade selection.',
      possibleDefects: ['Surface hot shortness (Cu) during reheating and rolling', 'Out-of-specification residuals'],
    },
    {
      variable: 'raw.driMetallization',
      mechanism:
        'Low metallization and high gangue raise slag volume and FeO; together with lime quality and carbon injection practice this affects yield, dephosphorization and slag carry-over into the ladle.',
      possibleDefects: ['Higher P at tap', 'Higher oxidised slag carry-over (indirect influence on cleanliness)'],
    },
  ],
  safetyHazards: [
    { category: 'suspended-loads', description: 'Magnets, grabs and loaded scrap buckets moved overhead by cranes.' },
    { category: 'water-molten-metal', description: 'Wet scrap or trapped liquids later charged onto molten metal.' },
    { category: 'radiation', description: 'Possible orphan radioactive sources hidden in purchased scrap.' },
    { category: 'moving-machinery', description: 'Belt conveyors, feeders and mobile equipment in the yard.' },
    { category: 'noise-dust', description: 'Dust from DRI fines, lime and scrap handling; noise from scrap handling.' },
    { category: 'gas', description: 'DRI storage can generate CO/H₂ and consume oxygen in enclosed spaces.' },
  ],
  maintenancePoints: [
    {
      component: 'scrapBucket',
      function: 'Carry and discharge the scrap charge.',
      failureMode: 'Clamshell does not open fully or lifting points degrade.',
      inspectionPoints: ['Hinges and pins', 'Lifting lugs and bail', 'Shell deformation'],
      considerations: 'Lifting points are critical items; inspection criteria follow OEM and plant lifting rules.',
      processConsequence: 'Charging delays and potential damage to the furnace roof or shell.',
    },
    {
      component: 'conveyor',
      function: 'Deliver DRI at a controlled rate.',
      failureMode: 'Belt damage, chute blockage or weigh feeder drift.',
      inspectionPoints: ['Belt tracking', 'Chute liners', 'Scale calibration'],
      considerations: 'Isolation before any intervention; dust control around transfer points.',
      processConsequence: 'Irregular DRI rate, unstable bath temperature and longer power-on time.',
    },
    {
      component: 'driSilo',
      function: 'Store DRI safely.',
      failureMode: 'Self-heating or outlet blockage.',
      inspectionPoints: ['Temperature/gas monitoring', 'Outlet gates', 'Level'],
      considerations: 'Entry into silos is a confined-space activity governed by plant procedures.',
      processConsequence: 'Loss of DRI quality or supply to the EAF.',
    },
  ],
  specifications: [
    { label: 'Metallic charge mix', value: '≈ 60% DRI/HBI + 40% scrap', classification: 'CONFIGURABLE' },
    { label: 'Scrap bucket volume', value: '90 m³ (typical load 55–70 t)', classification: 'CONFIGURABLE' },
    { label: 'Buckets per heat', value: '1–2', classification: 'CONFIGURABLE' },
    { label: 'DRI feed rate', value: '3.5–4.3 t/min at stable arc and foamy slag', classification: 'CONFIGURABLE' },
    { label: 'Lime / dolomite', value: '30–45 kg/t lime; 10–15 kg/t dolomite', classification: 'CONFIGURABLE' },
    { label: 'DRI chemistry and metallization', value: 'Must be confirmed with the DR plant', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Steelmaking technical sheet (reference configuration, draft for validation)',
    'AIST, The Making, Shaping and Treating of Steel — Steelmaking and Refining Volume',
    'General EAF raw-materials practice (industry literature)',
  ],
};
