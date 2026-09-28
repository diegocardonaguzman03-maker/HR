import type { EquipmentData } from '../../types/equipment';

/**
 * Olla de acero (clase 150 t). Configuración de referencia de FT-ACE-001 v0.3 (borrador, no validado en planta).
 * Todos los valores numéricos son DATOS SIMULADOS DE CAPACITACIÓN / valores de referencia, nunca puntos de ajuste de planta.
 */
export const ladle: EquipmentData = {
  id: 'ladle',
  name: 'Olla de Acero (150 t)',
  shortName: 'Olla',
  category: 'handling',
  processStages: ['TAPPING', 'SECONDARY_METALLURGY', 'TRANSFER', 'TURRET'],
  tooltip: 'Recipiente con refractario que recibe, contiene, trata y transporta el acero líquido del HAE a la máquina de colada continua.',
  description:
    'La olla es un recipiente de acero con recubrimiento refractario. Recibe el acero líquido del Horno de Arco Eléctrico (HAE), sirve como reactor de la metalurgia secundaria en el Horno Olla (HO) y lleva el acero a la máquina de colada continua, donde se vacía por una válvula deslizante en su fondo.',
  purpose:
    'Contener el acero líquido de forma segura, conservar su calor, permitir la agitación con argón y la adición de ferroaleaciones, y entregar acero limpio a la temperatura correcta a la máquina de colada, sin escoria.',
  howItWorks: [
    'Antes de recibir acero se prepara la olla: se arma la válvula deslizante, el bloque asiento se llena con arena de sello (referencia: cromita), se revisa el flujo de gas del tapón poroso y el refractario se precalienta (referencia 1,000–1,100 °C en la cara caliente) para limitar el choque térmico y la pérdida de temperatura.',
    'Durante el vaciado la olla está en un carro de olla o carro de transferencia bajo la piquera del HAE. Se sopla argón por el tapón poroso desde el inicio y se agregan desoxidantes (normalmente Al), ferroaleaciones y formadores de escoria sintética durante el vaciado.',
    'La olla llena pasa al HO, donde el acero se calienta, se ajusta su química, se desulfura y se limpia. El refractario de la olla (línea de escoria de MgO-C; paredes y fondo de Al₂O₃-MgO-C en la referencia) debe resistir la escoria agresiva en la interfase acero–escoria.',
    'Después del tratamiento, la grúa de colada levanta la olla por sus muñones y la coloca en la torreta de la máquina de colada. Se abre la válvula deslizante; la arena de sello cae y el acero fluye por el tubo protector (shroud) al distribuidor. La meta es la apertura libre, sin lanceo con oxígeno.',
    'Cuando la olla se vacía (o se detecta escoria) se cierra la válvula. La olla regresa para vaciar la escoria, inspeccionarla, reacondicionar la válvula y volver a precalentarla antes del siguiente ciclo.',
  ],
  inputs: [
    'Acero líquido primario del HAE',
    'Desoxidantes, ferroaleaciones, cal y escoria sintética',
    'Argón (tapón poroso)',
    'Arena de sello y refractarios de la válvula deslizante',
    'Energía para el precalentamiento',
  ],
  outputs: [
    'Acero líquido tratado entregado al distribuidor',
    'Escoria y costra (skull) de olla para reciclaje/disposición',
    'Datos de peso y temperatura de la olla',
  ],
  components: [
    {
      id: 'shell',
      name: 'Casco de la Olla',
      function: 'Estructura de acero que sostiene el recubrimiento refractario y transmite la carga a los muñones.',
      failureModes: ['Puntos calientes en el casco por refractario desgastado', 'Grietas cerca de las soldaduras de los muñones', 'Deformación'],
      inspectionPoints: ['Termografía del casco durante el ciclo', 'Inspección de soldaduras y estructura por pruebas no destructivas (PND) según las reglas de la planta'],
      maintenanceConsiderations: ['La integridad estructural es crítica porque la olla lleva ≈ 150 t de acero líquido por encima de las personas y equipos'],
      processConsequence: 'Una falla del casco significa pérdida de contención del acero líquido.',
    },
    {
      id: 'refractoryLining',
      name: 'Recubrimiento Refractario (de Trabajo y de Seguridad)',
      function: 'Aísla y contiene el acero líquido; el recubrimiento de trabajo está en contacto con el acero y el de seguridad está detrás.',
      failureModes: ['Erosión y corrosión del recubrimiento de trabajo', 'Penetración en las juntas', 'Desconchado por choque térmico'],
      inspectionPoints: ['Inspección visual después de cada colada', 'Medición del espesor residual (por ejemplo, escaneo láser donde esté disponible)', 'Conteo de coladas'],
      maintenanceConsiderations: ['La vida del recubrimiento depende de la química de la escoria, la temperatura, el tiempo de residencia y la práctica de precalentamiento'],
      processConsequence: 'Un recubrimiento desgastado genera riesgo de perforación (breakout); el refractario erosionado también es fuente de inclusiones exógenas.',
    },
    {
      id: 'slagLine',
      name: 'Línea de Escoria',
      function: 'Franja de refractario de MgO-C en la interfase acero–escoria, la zona con mayor ataque químico.',
      failureModes: ['Desgaste acelerado por escoria rica en FeO o no saturada de MgO', 'Daño por radiación del arco en el HO', 'Oxidación del carbono de los ladrillos de MgO-C'],
      inspectionPoints: ['Espesor de la línea de escoria', 'Desgaste local en los puntos de impacto del arco'],
      maintenanceConsiderations: ['La línea de escoria se puede reparar o cambiar sin cambiar las paredes, según la práctica de refractario'],
      processConsequence: 'El desgaste de la línea de escoria con frecuencia limita la vida de la campaña de la olla.',
    },
    {
      id: 'slideGate',
      name: 'Válvula Deslizante de la Olla',
      function: 'Válvula en el fondo con placas refractarias deslizantes que abre, regula y cierra el flujo de acero al distribuidor.',
      failureModes: ['No abre libremente (arena sinterizada o acero congelado)', 'Erosión o agrietamiento de las placas', 'Falla del cilindro hidráulico', 'Fuga de acero entre las placas'],
      inspectionPoints: ['Estado de placas y buzas en cada reacondicionamiento', 'Carga de resortes/sujeción del mecanismo', 'Conexión hidráulica'],
      maintenanceConsiderations: ['Se reacondiciona en cada ciclo según el desgaste de las placas; la calidad del armado es crítica'],
      processConsequence: 'Una válvula con fuga o tapada causa riesgo de perforación (breakout), lanceo (reoxidación) o pérdida de la colada.',
    },
    {
      id: 'porousPlug',
      name: 'Tapón Poroso',
      function: 'Tapón refractario en el fondo de la olla por donde se sopla argón para agitar el acero.',
      failureModes: ['Tapón bloqueado (infiltración de acero/escoria)', 'Fuga de gas alrededor del tapón', 'Erosión'],
      inspectionPoints: ['Respuesta de flujo vs. presión', 'Inspección visual después de vaciar', 'Limpieza con oxígeno según la práctica de la planta'],
      maintenanceConsiderations: ['El cambio del tapón se coordina con frecuencia con el del bloque asiento de la válvula deslizante'],
      processConsequence: 'Sin agitación: mala homogeneización, desulfuración lenta y mala flotación de inclusiones.',
    },
    {
      id: 'trunnions',
      name: 'Muñones',
      function: 'Pernos de izaje de los que el balancín de la grúa engancha la olla.',
      failureModes: ['Desgaste o grietas', 'Deformación', 'Degradación de soldaduras'],
      inspectionPoints: ['Revisión dimensional del desgaste', 'Inspección por pruebas no destructivas (PND) según las reglas de izaje de la planta'],
      maintenanceConsiderations: ['Los muñones son puntos críticos de izaje; los criterios de aceptación son del fabricante (OEM) o de la planta'],
      processConsequence: 'Una falla de un muñón con carga es un evento catastrófico con metal líquido.',
    },
  ],
  processVariables: [
    {
      key: 'ladle.steelWeight',
      name: 'Peso del acero en la olla',
      unit: 't',
      role: 'Se necesita para calcular las ferroaleaciones, controlar el bordo libre y planear la secuencia de la máquina de colada.',
      trainingRange: '≈ 150 t (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'ladle.temperature',
      name: 'Temperatura del acero en la olla',
      unit: '°C',
      role: 'Baja por la pérdida de calor hacia el refractario y la escoria; debe llegar al HO y luego a la máquina de colada dentro de su ventana.',
      trainingRange: '≈ 1,570–1,610 °C a la llegada al HO (simulado)',
      classification: 'ASSUMPTION',
    },
    {
      key: 'ladle.preheatTemperature',
      name: 'Temperatura de precalentamiento de la cara caliente del refractario',
      unit: '°C',
      role: 'Un refractario caliente reduce la pérdida de temperatura y el choque térmico.',
      trainingRange: '1,000–1,100 °C (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'ladle.heatCount',
      name: 'Conteo de coladas del refractario',
      unit: 'coladas',
      role: 'Indicador del avance de la campaña del refractario.',
      trainingRange: 'Vida de 60–80 coladas (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'ladle.freeboard',
      name: 'Bordo libre',
      unit: 'mm',
      role: 'Espacio sobre la escoria para agitar y hacer adiciones sin derrames.',
      classification: 'PLANT_SPECIFIC',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'La válvula deslizante de la olla no abre libremente',
      consequence: 'Se retrasa el arranque de la colada; el lanceo con oxígeno reoxida el acero y puede dañar la válvula.',
      typicalResponse: 'Lanceo según la práctica de la planta; investigar la arena y la preparación del asiento.',
    },
    {
      event: 'Olla fría o con precalentamiento insuficiente',
      consequence: 'Mayor caída de temperatura, formación de costra (skull) y más tiempo de calentamiento en el HO.',
      typicalResponse: 'Ajustar la temperatura de vaciado y el ciclo de ollas; mejorar la disciplina de precalentamiento.',
    },
    {
      event: 'Desgaste total del refractario (punto caliente)',
      consequence: 'Riesgo de perforación (breakout) de acero por la pared o el fondo de la olla.',
      typicalResponse: 'Sacar la olla de servicio; respuesta a emergencias si ocurre la perforación.',
    },
    {
      event: 'Tapón poroso bloqueado',
      consequence: 'Sin agitación; mala homogeneización, desulfuración y eliminación de inclusiones.',
      typicalResponse: 'Usar el tapón alterno o el flujo de bypass; limpiar o cambiar el tapón en el reacondicionamiento.',
    },
    {
      event: 'Arrastre de escoria al distribuidor al final de la olla',
      consequence: 'Contaminación con escoria en el distribuidor, inclusiones y obstrucción (clogging) de buzas.',
      typicalResponse: 'Detección de escoria donde esté instalada; cerrar la válvula dejando un pequeño remanente de acero.',
    },
  ],
  impact: {
    safety:
      'La olla lleva ≈ 150 t de acero líquido suspendidas; la integridad del casco, los muñones y el refractario es crítica para evitar la pérdida de contención.',
    quality:
      'El estado del refractario, la agitación y el control de escoria en la olla influyen mucho en la limpieza del acero y en la estabilidad de temperatura en la máquina de colada.',
    reliability:
      'La disponibilidad de ollas (reacondicionamiento, cambio de refractario, reacondicionamiento de la válvula) puede limitar el ciclo de la acería.',
    productivity:
      'Un buen precalentamiento y un alto índice de apertura libre reducen el tiempo en el HO, las demoras y las coladas perdidas.',
  },
  qualityImpact: [
    {
      variable: 'ladle.temperature',
      mechanism:
        'La pérdida de temperatura en la olla depende del precalentamiento, el estado del refractario, la cubierta de escoria, la intensidad de agitación y el tiempo de espera; se debe combinar con el calentamiento en el HO para cumplir la ventana de sobrecalentamiento de la máquina de colada.',
      possibleDefects: ['Sobrecalentamiento bajo: congelamiento y obstrucción (clogging) de buzas', 'Sobrecalentamiento alto: segregación central y riesgo de perforación (breakout) (junto con otros factores)'],
    },
    {
      variable: 'ladle.heatCount',
      mechanism:
        'El refractario desgastado o erosionado libera partículas exógenas y aumenta la pérdida de calor; la limpieza también depende de la química de la escoria y de la práctica de agitación.',
      possibleDefects: ['Macroinclusiones exógenas', 'Astillas (slivers) en el producto laminado'],
    },
  ],
  safetyHazards: [
    { category: 'molten-metal', description: 'Hasta ≈ 150 t de acero y escoria líquidos contenidos en la olla.' },
    { category: 'suspended-loads', description: 'Olla llena levantada y transportada por la grúa viajera.' },
    { category: 'water-molten-metal', description: 'Cualquier olla, arena o adición húmeda en contacto con el acero.' },
    { category: 'high-temperature', description: 'Estaciones de precalentamiento y superficies calientes de la olla.' },
    { category: 'hydraulic', description: 'Actuador hidráulico de la válvula deslizante.' },
    { category: 'gas', description: 'El argón puede desplazar el oxígeno en áreas cerradas o bajas.' },
  ],
  maintenancePoints: [
    {
      component: 'slideGate',
      function: 'Abrir, regular y cerrar el flujo de acero.',
      failureMode: 'No abre libremente, erosión de placas o fuga.',
      inspectionPoints: ['Desgaste de placas', 'Asentamiento de la buza', 'Sujeción del mecanismo'],
      considerations: 'Se reacondiciona en cada ciclo; la calidad del armado y el llenado de arena son clave.',
      processConsequence: 'Demora, lanceo, reoxidación o pérdida de la colada.',
    },
    {
      component: 'refractoryLining',
      function: 'Contener y aislar el acero.',
      failureMode: 'Erosión/corrosión y penetración en las juntas.',
      inspectionPoints: ['Inspección visual después de cada colada', 'Espesor residual', 'Puntos calientes'],
      considerations: 'Los criterios para retirar la olla los define la práctica de refractario de la planta.',
      processConsequence: 'Riesgo de perforación (breakout) e inclusiones.',
    },
    {
      component: 'trunnions',
      function: 'Punto de enganche con la grúa.',
      failureMode: 'Desgaste o agrietamiento.',
      inspectionPoints: ['Desgaste dimensional', 'Pruebas no destructivas (PND)'],
      considerations: 'Componente crítico de izaje; criterios de aceptación del fabricante (OEM) o de la planta.',
      processConsequence: 'Caída catastrófica de acero líquido.',
    },
    {
      component: 'porousPlug',
      function: 'Agitación con argón.',
      failureMode: 'Bloqueo.',
      inspectionPoints: ['Flujo vs. presión', 'Inspección visual después de vaciar'],
      considerations: 'Limpieza o cambio en el reacondicionamiento.',
      processConsequence: 'Mala refinación y mala flotación de inclusiones.',
    },
  ],
  specifications: [
    { label: 'Capacidad', value: '150 t de acero líquido', classification: 'CONFIGURABLE' },
    { label: 'Flota', value: '10 ollas (7 en ciclo, 3 en mantenimiento/reserva)', classification: 'CONFIGURABLE' },
    { label: 'Refractario', value: 'Línea de escoria de MgO-C; paredes y fondo de Al₂O₃-MgO-C', classification: 'CONFIGURABLE' },
    { label: 'Vida del refractario', value: '60–80 coladas', classification: 'CONFIGURABLE' },
    { label: 'Válvula deslizante', value: '2 o 3 placas; arena de sello de cromita; meta de apertura libre ≥ 98%', classification: 'CONFIGURABLE' },
    { label: 'Tapones porosos', value: '1–2, argón', classification: 'CONFIGURABLE' },
    { label: 'Precalentamiento', value: '1,000–1,100 °C en la cara caliente', classification: 'CONFIGURABLE' },
    { label: 'Dimensiones de la olla y bordo libre', value: 'Deben confirmarse con los planos de la olla', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Ficha técnica de Acería (configuración de referencia, borrador para validación)',
    'AIST, The Making, Shaping and Treating of Steel — Steelmaking and Refining Volume',
    'Literatura de la industria sobre refractarios de olla y sistemas de válvula deslizante',
  ],
};
