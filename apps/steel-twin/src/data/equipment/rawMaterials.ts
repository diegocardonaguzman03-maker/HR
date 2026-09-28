import type { EquipmentData } from '../../types/equipment';

/**
 * Área de materias primas: patio de chatarra, canastas de chatarra, almacenamiento y transporte de HRD, tolvas de fundentes.
 * Configuración de referencia de FT-ACE-001 v0.3 (borrador, no validado en planta).
 * Todos los valores numéricos son DATOS SIMULADOS DE CAPACITACIÓN / valores de referencia, nunca puntos de ajuste de planta.
 */
export const rawMaterials: EquipmentData = {
  id: 'rawMaterials',
  name: 'Manejo de Materias Primas (Chatarra, HRD y Fundentes)',
  shortName: 'Materias primas',
  category: 'raw-materials',
  processStages: ['RAW_MATERIALS', 'CHARGING'],
  tooltip: 'Almacena, prepara y entrega la chatarra, el HRD (DRI) y los fundentes que forman la carga del HAE.',
  description:
    'El área de materias primas recibe, almacena, clasifica y entrega la carga metálica (chatarra y HRD, hierro de reducción directa) y los fundentes formadores de escoria (cal y dolomita) que el Horno de Arco Eléctrico (HAE) necesita en cada colada.',
  purpose:
    'Entregar al HAE la mezcla, el peso y la calidad correctos de carga metálica y fundentes en el momento correcto. Así la colada alcanza su química, temperatura y tiempo tap-to-tap objetivo, con el mínimo de elementos residuales y el mínimo riesgo.',
  howItWorks: [
    'La chatarra llega por ferrocarril o camión, pasa por un portal de detección de radiación y se descarga en el patio de chatarra. Ahí se separa por tipos (por ejemplo: pesada de fusión, fragmentada, rebaba de maquinado, pacas, chatarra interna), porque cada tipo trae distinta densidad, limpieza y contenido de elementos residuales (Cu, Sn, Ni, Cr, Mo).',
    'Para cada colada se prepara una "receta" de chatarra: una grúa de carga con electroimán o almeja carga los tipos seleccionados en una canasta, en un orden de capas definido (chatarra ligera abajo para proteger la solera del horno, piezas pesadas en medio, chatarra ligera arriba para permitir una perforación de la carga rápida con el arco). La canasta se pesa conforme se carga.',
    'En la configuración de referencia, cerca del 60% de la carga metálica es HRD/HBI. El HRD se almacena en silos cerrados (se puede reoxidar y autocalentar si se expone a humedad y aire). Se envía por banda transportadora cerrada a una tolva de pesaje arriba de la bóveda del HAE, desde donde se alimenta de forma continua por el 5.º agujero durante la fusión.',
    'La cal y la dolomita se almacenan en tolvas de fundentes y se dosifican con alimentadores de pesaje, ya sea en la canasta de chatarra o por el sistema de alimentación de la bóveda junto con el HRD. Su función es formar la escoria espumosa básica y saturada de MgO que necesita el horno.',
    'La receta de la canasta, el flujo de HRD y las adiciones de fundentes se coordinan con la acería para que la carga corresponda al grado de acero: los grados con límites estrictos de residuales necesitan más HRD o chatarra más limpia; los grados con límites amplios pueden usar más chatarra.',
  ],
  inputs: [
    'Chatarra comprada (varios tipos)',
    'Chatarra interna (propia) y retornos',
    'HRD / HBI de la planta de reducción directa',
    'Cal viva (CaO) y cal dolomítica (CaO-MgO)',
    'Receta del grado y plan de carga de la acería',
  ],
  outputs: [
    'Canastas de chatarra cargadas y pesadas',
    'Flujo continuo de HRD al sistema de alimentación por el 5.º agujero del HAE',
    'Adiciones dosificadas de fundentes',
    'Registros de peso y composición de la carga para el balance de masa',
  ],
  components: [
    {
      id: 'scrapYard',
      name: 'Patio de Chatarra',
      function: 'Recibe, inspecciona, clasifica y almacena la chatarra por tipo.',
      failureModes: [
        'Mezcla de tipos de chatarra (contaminación con elementos residuales)',
        'Entrada al patio de chatarra mojada, con nieve o hielo, o de recipientes cerrados',
        'Mala separación de no metálicos (tierra, hule, plásticos)',
      ],
      inspectionPoints: [
        'Inspección visual de las cargas que llegan: recipientes sellados, líquidos y no metálicos',
        'Separación por tipo y rotulado de las bahías',
        'Estado del drenaje del patio',
      ],
      maintenanceConsiderations: [
        'Los electroimanes y almejas de las grúas del patio y los pisos deben mantenerse en condiciones para un manejo seguro',
      ],
      processConsequence:
        'La chatarra de mala calidad aumenta los residuales (Cu, Sn), el volumen de escoria, el consumo de energía y el riesgo de explosiones por agua atrapada o recipientes sellados.',
    },
    {
      id: 'scrapBucket',
      name: 'Canasta de Chatarra (Canasta de Carga)',
      function: 'Lleva una carga de chatarra en capas y pesada del patio al HAE, y la descarga por un fondo de gajos (almeja).',
      failureModes: [
        'El fondo de gajos no abre o abre parcialmente',
        'Casco deformado o bisagras y seguros desgastados o agrietados',
        'Chatarra atorada (formando puente) dentro de la canasta',
      ],
      inspectionPoints: [
        'Gajos del fondo, bisagras y pernos',
        'Orejas de izaje y asa',
        'Deformación del casco y placas de desgaste',
        'Lectura de celda de carga / báscula',
      ],
      maintenanceConsiderations: [
        'Los puntos de izaje son elementos críticos y requieren inspección por condición según las reglas de la planta y del fabricante (OEM)',
      ],
      processConsequence:
        'Una canasta que no descarga bien retrasa la carga, alarga el tiempo sin arco (power-off) y puede dañar el horno o la bóveda.',
    },
    {
      id: 'driSilo',
      name: 'Silo de Almacenamiento de HRD',
      function: 'Almacena el HRD/HBI en condiciones controladas y lo entrega al sistema de transporte.',
      failureModes: [
        'Reoxidación y autocalentamiento del HRD (entrada de humedad o aire)',
        'Material que forma puente o chimenea (rat-holing) en la descarga del silo',
        'Acumulación de finos',
      ],
      inspectionPoints: [
        'Monitoreo de temperatura y gases del silo (CO, H₂) donde esté instalado',
        'Compuertas de descarga y alimentadores',
        'Medición de nivel',
        'Estado del sistema de inertización (si está instalado)',
      ],
      maintenanceConsiderations: [
        'El HRD debe mantenerse seco; las condiciones de almacenamiento y la práctica de inertización son propias de cada planta',
      ],
      processConsequence:
        'El HRD degradado (menor metalización, más finos) aumenta la energía y el FeO de la escoria, baja el rendimiento metálico y puede hacer irregular la alimentación.',
    },
    {
      id: 'conveyor',
      name: 'Banda Transportadora de HRD y Tolva de Pesaje',
      function: 'Transporta el HRD de los silos a la bóveda del HAE y dosifica su flujo de alimentación al horno.',
      failureModes: [
        'Desalineación, rotura o falla del empalme de la banda',
        'Desviación de la calibración del alimentador de pesaje',
        'Obstrucción de chutes o del tubo de alimentación del 5.º agujero',
        'HRD caliente que daña las bandas (si se usa HRD caliente)',
      ],
      inspectionPoints: [
        'Alineación de la banda, rodillos y poleas',
        'Verificación de la calibración de la báscula',
        'Recubrimientos antidesgaste de chutes y sellado contra polvo',
      ],
      maintenanceConsiderations: [
        'Los cables de paro de emergencia y las guardas forman parte del sistema de seguridad de la banda; se requiere bloqueo y etiquetado (LOTO) antes de cualquier intervención',
      ],
      processConsequence:
        'Un flujo irregular de HRD altera la temperatura del baño, la escoria espumosa y la estabilidad del arco; la sobrealimentación puede formar un "iceberg de HRD" en el baño.',
    },
    {
      id: 'fluxBins',
      name: 'Tolvas y Dosificación de Fundentes',
      function: 'Almacena y dosifica cal y dolomita para formar la escoria del horno.',
      failureModes: [
        'Cal hidratada (apagada) por humedad',
        'Obstrucción del tornillo o alimentador dosificador',
        'Error de pesaje',
      ],
      inspectionPoints: ['Indicadores de nivel de las tolvas', 'Funcionamiento del alimentador', 'Certificados de calidad de la cal (reactividad, humedad)'],
      maintenanceConsiderations: ['Mantener la cal seca; la cal hidratada introduce hidrógeno al acero'],
      processConsequence:
        'Una adición incorrecta de cal o dolomita cambia la basicidad y la saturación de MgO: más desgaste de refractario, peor desfosforación y peor espumado de la escoria.',
    },
    {
      id: 'radiationPortal',
      name: 'Portal de Detección de Radiación',
      function: 'Detecta fuentes radiactivas ocultas en la chatarra que llega, antes de descargarla.',
      failureModes: ['Detector fuera de calibración', 'Alarma puenteada o ignorada', 'Pérdida de energía eléctrica del portal'],
      inspectionPoints: ['Pruebas de funcionamiento con la fuente de verificación de la planta', 'Revisión del registro de alarmas'],
      maintenanceConsiderations: [
        'La respuesta a una alarma de radiación sigue el procedimiento de protección radiológica de la planta y los requisitos de la autoridad reguladora nacional',
      ],
      processConsequence:
        'Una fuente radiactiva fundida contamina el acero, el polvo y los equipos, y puede obligar a parar la acería.',
    },
  ],
  processVariables: [
    {
      key: 'raw.scrapFraction',
      name: 'Proporción de chatarra en la carga metálica',
      unit: '%',
      role: 'Define cuántos residuales y cuánta energía aporta la carga; el resto es HRD.',
      trainingRange: '≈ 40% (configuración de referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'raw.driFraction',
      name: 'Proporción de HRD en la carga metálica',
      unit: '%',
      role: 'El HRD diluye los residuales, pero aporta ganga (SiO₂, Al₂O₃) y FeO que deben manejarse con la escoria y el aporte de energía.',
      trainingRange: '≈ 60% (configuración de referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'raw.bucketWeight',
      name: 'Peso de carga de la canasta de chatarra',
      unit: 't',
      role: 'Controla la entrada metálica por canasta y el número de canastas por colada.',
      trainingRange: '55–70 t por canasta, 1–2 canastas (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'raw.driMetallization',
      name: 'Metalización del HRD',
      unit: '%',
      role: 'Fracción del hierro que ya es metálico; valores bajos significan más FeO por reducir, más energía y menor rendimiento.',
      trainingRange: '≈ 92–95% (típico; se requiere el valor de planta)',
      classification: 'PLANT_SPECIFIC',
    },
    {
      key: 'raw.limeAddition',
      name: 'Adición de cal',
      unit: 'kg/t',
      role: 'Principal formador de escoria; fija la basicidad para la desfosforación y la protección del refractario.',
      trainingRange: '30–45 kg/t (referencia)',
      classification: 'CONFIGURABLE',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'Se carga al horno chatarra mojada o un recipiente sellado',
      consequence: 'El agua atrapada bajo el metal líquido puede evaporarse de forma violenta y causar una explosión o erupción.',
      typicalResponse: 'La práctica de la industria es una inspección estricta de lo que llega, rechazar material sellado o mojado y mantener la chatarra seca.',
    },
    {
      event: 'Confusión de tipos de chatarra',
      consequence: 'Residuales (Cu, Sn, Ni, Cr, Mo) fuera de la especificación del grado; no se pueden eliminar en el HAE ni en el Horno Olla (HO).',
      typicalResponse: 'La colada se reasigna a otro grado o se diluye con HRD; se revisan la clasificación y la trazabilidad de la chatarra.',
    },
    {
      event: 'Alarma del portal de radiación',
      consequence: 'Posible fuente radiactiva en la carga.',
      typicalResponse: 'La carga se retiene y se aísla, y se aplica el procedimiento de protección radiológica de la planta.',
    },
    {
      event: 'Autocalentamiento del HRD en el almacenamiento',
      consequence: 'Pérdida de metalización, puntos calientes, generación de gases y posible incendio.',
      typicalResponse: 'Monitoreo de temperatura, inertización donde esté instalada y retiro controlado del material afectado.',
    },
    {
      event: 'Interrupción o sobrealimentación de HRD',
      consequence: 'Variaciones de temperatura del baño, pérdida del espumado de la escoria, acumulaciones de HRD sin fundir y mayor tiempo con arco (power-on).',
      typicalResponse: 'El flujo de alimentación se ajusta a la potencia activa y a la temperatura del baño; las obstrucciones se liberan con bloqueo y etiquetado (LOTO).',
    },
  ],
  impact: {
    safety:
      'La calidad de la carga es una barrera de seguridad de primera línea: la chatarra mojada, los recipientes cerrados y las fuentes radiactivas están entre los peligros más graves de la acería.',
    quality:
      'La carga fija el nivel de residuales y contribuye a la entrada de P, N y S; la calidad del HRD influye en el volumen de escoria y en el FeO.',
    reliability:
      'Un suministro irregular de HRD o problemas con las canastas paran o hacen más lento al HAE, el equipo más costoso de la acería.',
    productivity:
      'Una densidad correcta de la canasta y un flujo correcto de HRD reducen el tiempo sin arco (power-off), la energía y el consumo de electrodos, y apoyan la meta de tap-to-tap.',
  },
  qualityImpact: [
    {
      variable: 'raw.scrapFraction',
      mechanism:
        'Los residuales como Cu y Sn entran sobre todo con la chatarra y no se oxidan en el HAE. Su nivel final también depende de la dilución con HRD, del reciclaje de chatarra interna y de la selección de tipos de chatarra.',
      possibleDefects: ['Fragilidad en caliente superficial (Cu) durante el recalentamiento y la laminación', 'Residuales fuera de especificación'],
    },
    {
      variable: 'raw.driMetallization',
      mechanism:
        'Una metalización baja y mucha ganga aumentan el volumen de escoria y el FeO. Junto con la calidad de la cal y la práctica de inyección de carbono, esto afecta el rendimiento, la desfosforación y el arrastre de escoria a la olla.',
      possibleDefects: ['P más alto al vaciado', 'Mayor arrastre de escoria oxidada (influencia indirecta en la limpieza del acero)'],
    },
  ],
  safetyHazards: [
    { category: 'suspended-loads', description: 'Electroimanes, almejas y canastas de chatarra cargadas que las grúas mueven por encima.' },
    { category: 'water-molten-metal', description: 'Chatarra mojada o líquidos atrapados que después se cargan sobre metal líquido.' },
    { category: 'radiation', description: 'Posibles fuentes radiactivas huérfanas ocultas en la chatarra comprada.' },
    { category: 'moving-machinery', description: 'Bandas transportadoras, alimentadores y equipo móvil en el patio.' },
    { category: 'noise-dust', description: 'Polvo de finos de HRD, cal y manejo de chatarra; ruido del manejo de chatarra.' },
    { category: 'gas', description: 'El almacenamiento de HRD puede generar CO/H₂ y consumir el oxígeno en espacios cerrados.' },
  ],
  maintenancePoints: [
    {
      component: 'scrapBucket',
      function: 'Llevar y descargar la carga de chatarra.',
      failureMode: 'La almeja no abre por completo o se degradan los puntos de izaje.',
      inspectionPoints: ['Bisagras y pernos', 'Orejas de izaje y asa', 'Deformación del casco'],
      considerations: 'Los puntos de izaje son elementos críticos; los criterios de inspección siguen las reglas de izaje del fabricante (OEM) y de la planta.',
      processConsequence: 'Retrasos en la carga y posible daño a la bóveda o al casco del horno.',
    },
    {
      component: 'conveyor',
      function: 'Entregar HRD con un flujo controlado.',
      failureMode: 'Daño de la banda, obstrucción del chute o desviación del alimentador de pesaje.',
      inspectionPoints: ['Alineación de la banda', 'Recubrimientos del chute', 'Calibración de la báscula'],
      considerations: 'Bloqueo y etiquetado (LOTO) antes de cualquier intervención; control de polvo en los puntos de transferencia.',
      processConsequence: 'Flujo irregular de HRD, temperatura del baño inestable y mayor tiempo con arco (power-on).',
    },
    {
      component: 'driSilo',
      function: 'Almacenar el HRD de forma segura.',
      failureMode: 'Autocalentamiento u obstrucción de la descarga.',
      inspectionPoints: ['Monitoreo de temperatura/gases', 'Compuertas de descarga', 'Nivel'],
      considerations: 'Entrar a los silos es una actividad en espacio confinado regida por los procedimientos de la planta.',
      processConsequence: 'Pérdida de calidad o de suministro de HRD al HAE.',
    },
  ],
  specifications: [
    { label: 'Mezcla de carga metálica', value: '≈ 60% HRD/HBI + 40% chatarra', classification: 'CONFIGURABLE' },
    { label: 'Volumen de la canasta de chatarra', value: '90 m³ (carga típica 55–70 t)', classification: 'CONFIGURABLE' },
    { label: 'Canastas por colada', value: '1–2', classification: 'CONFIGURABLE' },
    { label: 'Flujo de alimentación de HRD', value: '3.5–4.3 t/min con arco estable y escoria espumosa', classification: 'CONFIGURABLE' },
    { label: 'Cal / dolomita', value: '30–45 kg/t de cal; 10–15 kg/t de dolomita', classification: 'CONFIGURABLE' },
    { label: 'Química y metalización del HRD', value: 'Debe confirmarse con la planta de reducción directa', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Ficha técnica de Acería (configuración de referencia, borrador para validación)',
    'AIST, The Making, Shaping and Treating of Steel — Steelmaking and Refining Volume',
    'Práctica general de materias primas para HAE (literatura de la industria)',
  ],
};
