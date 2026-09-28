import type { EquipmentData } from '../../types/equipment';

/**
 * Aguas arriba de la Acería: patio de pelet y plantas de reducción directa HYL y Midrex.
 * Interfaces de CV-GASM-001 v0.1 (borrador). Valores de referencia de la industria, marcados como
 * DATOS SIMULADOS DE CAPACITACIÓN; no son datos del licenciante ni puntos de ajuste de planta.
 */
export const pelletYard: EquipmentData = {
  id: 'pelletYard',
  name: 'Patio de Pelet (de la Peletizadora Manzanillo)',
  shortName: 'Patio de pelet',
  category: 'raw-materials',
  processStages: ['RAW_MATERIALS'],
  tooltip: 'Recibe por tren el pelet de la Peletizadora y alimenta a las plantas HYL y Midrex.',
  description:
    'El pelet grado reducción directa se hace en la Peletizadora Manzanillo con concentrado de las minas propias de GASM. Llega por ferrocarril al Complejo Acería Norte, se descarga, se apila y una recuperadora lo manda por banda a las dos plantas de reducción directa.',
  purpose: 'Tener pelet suficiente, seco y dentro de especificación para que HYL y Midrex nunca se detengan.',
  howItWorks: [
    'Las góndolas del tren se descargan en la fosa de recepción y el pelet sube por banda a la pila.',
    'La recuperadora toma pelet de la pila y lo manda por banda a las cribas de cada planta: los finos se separan antes de entrar al reactor.',
    'Laboratorio revisa la química (Fe, ganga), el tamaño y la resistencia (CCS, abrasión) de cada lote.',
  ],
  inputs: ['Pelet grado reducción directa por ferrocarril', 'Resultados de laboratorio de la Peletizadora'],
  outputs: ['Pelet cribado a HYL', 'Pelet cribado a Midrex', 'Finos de pelet a manejo aparte'],
  components: [
    { id: 'railUnloading', name: 'Descarga de Ferrocarril', function: 'Recibe y descarga las góndolas de pelet.', processConsequence: 'Si se retrasa el tren, baja el inventario de pelet.' },
    { id: 'stockpile', name: 'Pila de Pelet', function: 'Inventario de varios días para las dos plantas.', processConsequence: 'Pelet mojado o degradado genera finos y pegado en el reactor.' },
    { id: 'reclaimer', name: 'Recuperadora y Bandas', function: 'Toma el pelet de la pila y lo manda a las plantas.', processConsequence: 'Una falla deja sin alimentación a HYL o a Midrex.' },
  ],
  processVariables: [
    { key: 'pel.fe', name: 'Fe total del pelet', unit: '%', role: 'Más Fe y menos ganga dan un DRI más rico y menos escoria en el horno.', trainingRange: '≥ 67.0 % [Supuesto]', classification: 'CONFIGURABLE' },
    { key: 'pel.ccs', name: 'Resistencia a la compresión', unit: 'kg/pelet', role: 'Un pelet débil se rompe y genera finos que tapan el reactor.', trainingRange: '≥ 250 kg/pelet [Supuesto]', classification: 'CONFIGURABLE' },
  ],
  whatCanGoWrong: [
    { event: 'Pelet con muchos finos', consequence: 'Baja la permeabilidad del reactor y la productividad.', typicalResponse: 'Cribar más fino; avisar a la Peletizadora.' },
    { event: 'Retraso del tren', consequence: 'Inventario bajo.', typicalResponse: 'Plan de consumo con la reserva de la pila.' },
  ],
  impact: {
    safety: 'Ferrocarril, bandas y maquinaria móvil; polvo de pelet.',
    quality: 'La química y la resistencia del pelet definen la calidad del DRI y la escoria del horno.',
    reliability: 'La recuperadora y las bandas alimentan a las dos plantas.',
    productivity: 'Pelet fuerte y sin finos = reactores estables y mayor producción de DRI.',
  },
  qualityImpact: [{ variable: 'pel.fe', mechanism: 'La ganga del pelet pasa al DRI y termina como escoria en el horno.', possibleDefects: ['Más escoria', 'Más energía por tonelada'] }],
  safetyHazards: [
    { category: 'moving-machinery', description: 'Ferrocarril, recuperadora y bandas.' },
    { category: 'noise-dust', description: 'Polvo de pelet.' },
  ],
  maintenancePoints: [],
  specifications: [
    { label: 'Origen', value: 'Peletizadora Manzanillo (grate-kiln), concentrado de minas propias', classification: 'PLANT_SPECIFIC' },
    { label: 'Pelet a reducción directa', value: '≈ 3.55 Mt/año [Supuesto]', classification: 'ASSUMPTION' },
    { label: 'Tamaño', value: '9–16 mm ≥ 90 % [Supuesto]', classification: 'ASSUMPTION' },
  ],
  references: ['CV-GASM-001 §4.1', 'FT-PEL-001 (Peletizadora)'],
};

export const hyl: EquipmentData = {
  id: 'hyl',
  name: 'Planta de Reducción Directa HYL',
  shortName: 'Planta HYL',
  category: 'direct-reduction',
  processStages: ['RAW_MATERIALS'],
  tooltip: 'Reduce el pelet con gas a alta presión y lo convierte en DRI, que va por banda a los hornos.',
  description:
    'Planta de reducción directa tipo HYL (esquema ZR, sin reformador externo). El gas natural se reforma dentro del reactor sobre el propio hierro. El pelet baja por gravedad y el gas reductor (H₂ + CO) sube a contracorriente y le quita el oxígeno. Sale DRI con alto carbono. Capacidad de referencia: 1.2 Mt/año.',
  purpose: 'Producir DRI con metalización y carbono en especificación para el horno eléctrico.',
  howItWorks: [
    'El pelet entra por arriba del reactor, que trabaja a presión (≈ 6–8 bar [Supuesto]).',
    'El gas se calienta en el calentador de gas de proceso (≈ 900–1,050 °C [Supuesto]) y entra al reactor. El H₂ y el CO le quitan el oxígeno al óxido de hierro.',
    'El gas que sale por arriba se lava, se le quita el agua y el CO₂ y se recircula con los compresores.',
    'El DRI sale por abajo, se enfría y va por banda cerrada a los silos de día de la Acería. Trae 3.0–4.5 % de carbono [Supuesto].',
  ],
  inputs: ['Pelet cribado', 'Gas natural', 'Oxígeno (según esquema)', 'Agua de proceso y enfriamiento', 'Nitrógeno para purgas', 'Electricidad'],
  outputs: ['DRI por banda a la Acería', 'CO₂ capturado', 'Finos de DRI'],
  components: [
    { id: 'reactor', name: 'Reactor de Reducción', function: 'Donde el pelet se convierte en hierro metálico con gas reductor.', processConsequence: 'Un reactor inestable baja la metalización del DRI.' },
    { id: 'gasHeater', name: 'Calentador de Gas de Proceso', function: 'Calienta el gas reductor antes de entrar al reactor.', processConsequence: 'Gas frío = reducción incompleta.' },
    { id: 'co2Removal', name: 'Remoción de CO₂', function: 'Quita el CO₂ del gas recirculado.', processConsequence: 'Mala remoción baja el poder reductor del gas.' },
    { id: 'compressor', name: 'Compresor de Gas de Proceso', function: 'Recircula el gas al reactor.', processConsequence: 'Una falla detiene la planta.' },
    { id: 'dischargeHYL', name: 'Descarga de DRI', function: 'Saca el DRI del reactor hacia la banda.', processConsequence: 'Descarga irregular cambia el tiempo de residencia y la calidad.' },
  ],
  processVariables: [
    { key: 'rd.metallization', name: 'Metalización', unit: '%', role: 'Indicador principal de calidad del DRI.', trainingRange: '≥ 93 % [Supuesto]', classification: 'CONFIGURABLE' },
    { key: 'rd.carbon', name: 'Carbono del DRI', unit: '%', role: 'Aporta energía química y espuma la escoria en el horno.', trainingRange: '3.0–4.5 % [Supuesto]', classification: 'CONFIGURABLE' },
  ],
  whatCanGoWrong: [
    { event: 'Fuga de gas de proceso', consequence: 'Gas tóxico (CO) e inflamable (H₂).', typicalResponse: 'Paro seguro, aislamiento y purga con N₂ según procedimiento de la planta.' },
    { event: 'Pegado del pelet en el reactor', consequence: 'Flujo irregular y baja producción.', typicalResponse: 'Ajustar temperatura y recubrimiento del pelet [Validar con OEM].' },
  ],
  impact: {
    safety: 'Gas H₂/CO a presión, gas natural, atmósferas pobres en O₂ por nitrógeno, altas temperaturas y espacios confinados.',
    quality: 'Define la metalización y el carbono del DRI que llega al horno.',
    reliability: 'Compresores, calentador y descarga son equipos críticos: si fallan, se detiene el flujo de DRI.',
    productivity: 'Aporta cerca de la mitad del DRI que consumen los hornos.',
  },
  qualityImpact: [{ variable: 'rd.metallization', mechanism: 'Temperatura y calidad del gas reductor, tiempo de residencia y calidad del pelet.', possibleDefects: ['DRI bajo en metalización', 'Más finos'] }],
  safetyHazards: [
    { category: 'gas', description: 'H₂ y CO a presión; gas natural; nitrógeno (bajo O₂).' },
    { category: 'high-temperature', description: 'Gas de proceso y calentador a más de 900 °C.' },
    { category: 'stored-energy', description: 'Recipientes y tuberías a presión.' },
  ],
  maintenancePoints: [],
  specifications: [
    { label: 'Tecnología', value: 'HYL, esquema ZR (reformado dentro del reactor)', classification: 'PLANT_SPECIFIC' },
    { label: 'Capacidad', value: '1.2 Mt/año de DRI [Supuesto]', classification: 'ASSUMPTION' },
    { label: 'Entrega a la Acería', value: 'Banda cerrada directa al silo de día', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['CV-GASM-001 §4.2', 'FT-RD-001 (Reducción Directa)'],
};

export const midrex: EquipmentData = {
  id: 'midrex',
  name: 'Planta de Reducción Directa Midrex',
  shortName: 'Planta Midrex',
  category: 'direct-reduction',
  processStages: ['RAW_MATERIALS'],
  tooltip: 'Reduce el pelet en un horno de cuba con gas del reformador y entrega DRI por banda a los hornos.',
  description:
    'Planta de reducción directa tipo Midrex. El gas natural y el gas recirculado se reforman en el reformador con catalizador y producen el gas reductor (H₂ + CO). Ese gas entra caliente al horno de cuba, donde reduce el pelet que baja por gravedad a baja presión. Capacidad de referencia: 1.3 Mt/año.',
  purpose: 'Producir DRI con metalización en especificación para el horno eléctrico.',
  howItWorks: [
    'El pelet entra por arriba del horno de cuba y baja lentamente.',
    'El reformador convierte el gas natural en gas reductor caliente (≈ 850–950 °C [Supuesto]) que entra por la zona media del horno.',
    'El gas de tope se lava en el lavador; una parte regresa al reformador y otra se usa como combustible.',
    'El DRI se enfría en la parte baja, se descarga y va por banda cerrada a la Acería. Trae 1.5–2.5 % de carbono [Supuesto].',
  ],
  inputs: ['Pelet cribado', 'Gas natural', 'Aire de combustión', 'Agua de proceso', 'Nitrógeno para purgas', 'Electricidad'],
  outputs: ['DRI por banda a la Acería', 'Gases de combustión del reformador', 'Finos de DRI'],
  components: [
    { id: 'shaftFurnace', name: 'Horno de Cuba', function: 'Donde el pelet se reduce con el gas del reformador.', processConsequence: 'Canalización del gas o pegado bajan la metalización.' },
    { id: 'reformer', name: 'Reformador de Gas', function: 'Convierte gas natural y gas reciclado en gas reductor con catalizador.', processConsequence: 'Tubos del reformador dañados reducen el gas disponible.' },
    { id: 'topGasScrubber', name: 'Lavador de Gas de Tope', function: 'Limpia y enfría el gas que sale del horno.', processConsequence: 'Un lavado deficiente ensucia compresores y reformador.' },
    { id: 'dischargeMidrex', name: 'Descarga de DRI', function: 'Saca el DRI frío del horno hacia la banda.', processConsequence: 'Descarga irregular cambia la calidad del DRI.' },
  ],
  processVariables: [
    { key: 'rd.metallization', name: 'Metalización', unit: '%', role: 'Indicador principal de calidad del DRI.', trainingRange: '≥ 93 % [Supuesto]', classification: 'CONFIGURABLE' },
    { key: 'rd.carbon', name: 'Carbono del DRI', unit: '%', role: 'Menor que el de HYL; la mezcla fija el carbono de carga del horno.', trainingRange: '1.5–2.5 % [Supuesto]', classification: 'CONFIGURABLE' },
  ],
  whatCanGoWrong: [
    { event: 'Falla de un quemador o tubo del reformador', consequence: 'Menos gas reductor y posible incendio.', typicalResponse: 'Reducir carga y aislar según procedimiento de la planta.' },
    { event: 'Fuga de gas de tope o reductor', consequence: 'CO tóxico, H₂ inflamable.', typicalResponse: 'Evacuar la zona, aislar y purgar con N₂.' },
  ],
  impact: {
    safety: 'Gas reductor (H₂/CO), gas natural, reformador a alta temperatura, nitrógeno (bajo O₂) y espacios confinados.',
    quality: 'Define la metalización y el carbono del DRI de su banda.',
    reliability: 'El reformador y los compresores de gas son críticos.',
    productivity: 'Aporta cerca de la mitad del DRI que consumen los hornos.',
  },
  qualityImpact: [{ variable: 'rd.metallization', mechanism: 'Temperatura y calidad del gas reductor, distribución del gas en la cuba y calidad del pelet.', possibleDefects: ['DRI bajo en metalización', 'Aglomerados'] }],
  safetyHazards: [
    { category: 'gas', description: 'Gas reductor H₂/CO y gas natural; nitrógeno (bajo O₂).' },
    { category: 'high-temperature', description: 'Reformador y gas reductor calientes.' },
    { category: 'stored-energy', description: 'Tuberías y recipientes de gas.' },
  ],
  maintenancePoints: [],
  specifications: [
    { label: 'Tecnología', value: 'Midrex, horno de cuba con reformador de gas natural', classification: 'PLANT_SPECIFIC' },
    { label: 'Capacidad', value: '1.3 Mt/año de DRI [Supuesto]', classification: 'ASSUMPTION' },
    { label: 'Entrega a la Acería', value: 'Banda cerrada directa al silo de día', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['CV-GASM-001 §4.2', 'FT-RD-001 (Reducción Directa)'],
};
