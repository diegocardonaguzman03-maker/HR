import type { EquipmentData } from '../../types/equipment';

/**
 * Horno Olla (HO) para metalurgia secundaria. La desgasificación al vacío (RH/VTD) NO forma parte de la
 * configuración de referencia (opcional, deshabilitada). Se incluye el tratamiento con calcio por alambre tubular de CaSi.
 * Configuración de referencia de FT-ACE-001 v0.3 (borrador, no validado en planta).
 * Todos los valores numéricos son DATOS SIMULADOS DE CAPACITACIÓN / valores de referencia, nunca puntos de ajuste de planta.
 */
export const ladleFurnace: EquipmentData = {
  id: 'ladleFurnace',
  name: 'Horno Olla (Metalurgia Secundaria)',
  shortName: 'Horno olla',
  category: 'secondary-metallurgy',
  processStages: ['SECONDARY_METALLURGY'],
  tooltip: 'Calienta, ajusta la química, desulfura y limpia el acero en la olla antes de enviarlo a la máquina de colada.',
  description:
    'El Horno Olla (HO) es una estación de tratamiento donde la olla se cubre con una bóveda enfriada por agua y se calienta con tres electrodos. Mientras tanto, la agitación con argón, las adiciones de ferroaleaciones y la alimentación de alambre llevan el acero a su química, temperatura y limpieza finales.',
  purpose:
    'Recibir el acero primario del Horno de Arco Eléctrico (HAE) y entregar acero líquido refinado con la química objetivo (incluyendo azufre bajo y aluminio controlado), una temperatura homogénea ajustada a la máquina de colada, y con las inclusiones reducidas y modificadas.',
  howItWorks: [
    'El carro de olla lleva la olla bajo la bóveda del HO. Se inicia la agitación con argón por el tapón poroso, se toma temperatura y muestra, y se acondiciona la escoria con cal y desoxidantes para hacerla básica y reductora (bajo FeO + MnO).',
    'Los electrodos bajan a través de la bóveda y los arcos calientan el acero a través de la escoria (referencia 4–5 °C/min con un transformador de 25 MVA). Una escoria bien espumada o gruesa cubre los arcos para proteger la línea de escoria de la olla y la bóveda.',
    'La desulfuración ocurre en la interfase acero–escoria. Necesita escoria básica, fluida y reductora, baja actividad de oxígeno en el acero (calmado al Al), temperatura alta y agitación fuerte con argón (referencia 400–600 NL/min) para renovar la interfase. El S objetivo en la referencia es ≤ 0.010%.',
    'Las ferroaleaciones (FeMn, FeSi, SiMn, FeNb, etc.) se agregan por el chute de adiciones en cantidades calculadas según la muestra, el peso del acero y la recuperación esperada. El aluminio se ajusta con alambre de Al hasta la meta de Al soluble (referencia 0.020–0.045% para grados de planchón calmados al Al).',
    'Control de inclusiones: la desoxidación forma partículas de alúmina; una agitación suave con argón deja que floten a la escoria. Para mejorar la colabilidad se puede alimentar alambre tubular de CaSi para convertir la alúmina sólida en aluminatos de calcio líquidos. La cantidad de Ca se debe balancear contra el S y el Al: con poco Ca quedan alúmina o aluminatos sólidos, y con exceso de Ca se forma CaS sólido; ambos obstruyen las buzas.',
    'Antes de liberar la olla se hace agitación suave (referencia ≥ 8 min a 50–150 NL/min), se confirman la temperatura y la química finales, y se fija la temperatura de liberación como: líquidus + sobrecalentamiento en el distribuidor + pérdidas esperadas de transporte y colada. Después la olla se libera a la grúa de colada.',
  ],
  inputs: [
    'Olla con acero líquido primario y escoria de arrastre',
    'Energía eléctrica',
    'Argón',
    'Cal, formadores de escoria sintética, desoxidantes de escoria',
    'Ferroaleaciones y Al',
    'Alambres tubulares (CaSi, Al, C)',
  ],
  outputs: [
    'Acero líquido refinado con química y temperatura objetivo',
    'Escoria de olla reductora y rica en azufre',
    'Gases de proceso y polvo',
    'Registro del tratamiento de la colada (temperaturas, muestras, adiciones)',
  ],
  components: [
    {
      id: 'roof',
      name: 'Bóveda del HO Enfriada por Agua',
      function: 'Cubre la olla para contener el calor y los humos, y aloja los puertos de electrodos, adiciones y alambre.',
      failureModes: ['Fuga de agua', 'Acumulación de costra (skull)', 'Falla del mecanismo de levante'],
      inspectionPoints: ['Balance de flujo y temperaturas del agua de enfriamiento', 'Acumulación de costra', 'Refractarios de los puertos'],
      maintenanceConsiderations: ['La detección de fugas de agua es crítica para la seguridad'],
      processConsequence: 'Las fugas generan riesgo agua–metal líquido y absorción de hidrógeno; la costra puede caer a la olla.',
    },
    {
      id: 'electrodes',
      name: 'Electrodos de Grafito',
      function: 'Tres electrodos que forman arcos sobre la escoria/acero para calentar la olla.',
      failureModes: ['Rotura', 'Consumo excesivo de la punta', 'Absorción de carbono por contacto del electrodo con el acero'],
      inspectionPoints: ['Longitud de la columna', 'Estado de la unión', 'Tendencia de consumo'],
      maintenanceConsiderations: ['Las adiciones de electrodo se hacen con aislamiento eléctrico (LOTO)'],
      processConsequence: 'Demoras; si el electrodo se sumerge en el acero puede subir el carbono en grados de bajo carbono.',
    },
    {
      id: 'electrodeArms',
      name: 'Brazos Portaelectrodos y Regulación',
      function: 'Posicionan los electrodos y regulan la longitud del arco/corriente.',
      failureModes: ['Regulación inestable', 'Deslizamiento de la mordaza', 'Falla del aislamiento'],
      inspectionPoints: ['Respuesta de la regulación', 'Estado de la mordaza', 'Enfriamiento del brazo'],
      maintenanceConsiderations: ['Aislamiento hidráulico y eléctrico (LOTO) antes de trabajar'],
      processConsequence: 'Calentamiento lento, radiación del arco hacia el refractario y mayor consumo de electrodos.',
    },
    {
      id: 'transformer',
      name: 'Transformador del HO',
      function: 'Suministra la potencia del arco para el calentamiento (referencia 25 MVA).',
      failureModes: ['Falla del cambiador de derivaciones', 'Sobrecalentamiento'],
      inspectionPoints: ['Temperatura del aceite y de los devanados', 'Estado del cambiador de derivaciones'],
      maintenanceConsiderations: ['Equipo de alta tensión; solo personal autorizado'],
      processConsequence: 'Perder capacidad de calentamiento alarga el tratamiento y puede desfasar la secuencia de la máquina de colada.',
    },
    {
      id: 'argonSystem',
      name: 'Sistema de Agitación con Argón',
      function: 'Controla el flujo de argón a los tapones porosos y a una lanza superior para agitación de emergencia.',
      failureModes: ['Falla del controlador de flujo', 'Fuga en manguera/acoplamiento', 'Tapón bloqueado no detectado'],
      inspectionPoints: ['Respuesta de flujo vs. presión', 'Estado de los acoplamientos', 'Disponibilidad de la lanza de respaldo'],
      maintenanceConsiderations: ['El argón es asfixiante; las fugas en fosas o espacios cerrados son peligrosas'],
      processConsequence: 'Agitación incorrecta: mala desulfuración, falta de homogeneidad o (si es excesiva) ojo abierto y reoxidación.',
    },
    {
      id: 'wireFeeder',
      name: 'Alimentador de Alambre',
      function: 'Introduce alambre tubular de CaSi, Al o C a profundidad en el acero, con velocidad y longitud controladas.',
      failureModes: ['Atoramiento o rotura del alambre', 'Velocidad de alimentación incorrecta (el alambre se funde muy arriba en el baño)', 'Desgaste del tubo guía'],
      inspectionPoints: ['Rodillos de arrastre', 'Alineación del tubo guía', 'Calibración del contador de longitud'],
      maintenanceConsiderations: ['Rodillos de arrastre en movimiento: se requieren guardas y bloqueo y etiquetado (LOTO)'],
      processConsequence: 'Baja recuperación de Ca o Al, mala modificación de inclusiones y riesgo de obstrucción (clogging) de buzas.',
    },
    {
      id: 'alloyChute',
      name: 'Sistema de Adiciones de Ferroaleaciones y Fundentes',
      function: 'Pesa y agrega ferroaleaciones, cal y formadores de escoria a la olla.',
      failureModes: ['Error de pesaje', 'Obstrucción del chute', 'Material húmedo o equivocado'],
      inspectionPoints: ['Calibración de la báscula', 'Identificación de tolvas', 'Estado del chute'],
      maintenanceConsiderations: ['La identificación del material y que esté seco son críticos'],
      processConsequence: 'Química fuera de especificación o absorción de agua/hidrógeno.',
    },
    {
      id: 'ladleCar',
      name: 'Carro de Transferencia de Olla',
      function: 'Mueve la olla entre la posición de vaciado, la posición de tratamiento en el HO y el punto donde la toma la grúa.',
      failureModes: ['Falla de la transmisión o de las ruedas', 'Daño del cable de alimentación', 'Error de posicionamiento'],
      inspectionPoints: ['Ruedas y rieles', 'Carrete de cable / festón', 'Sensores de posición'],
      maintenanceConsiderations: ['La zona de vías debe mantenerse libre de derrames de acero y de escombros'],
      processConsequence: 'Una falla del carro bloquea la ruta de la olla y retrasa el tratamiento y la colada.',
    },
  ],
  processVariables: [
    {
      key: 'lf.temperature',
      name: 'Temperatura del acero en el HO',
      unit: '°C',
      role: 'Se controla con el calentamiento por arco para cumplir la temperatura de liberación hacia la máquina de colada.',
      trainingRange: '≈ 1,560–1,620 °C (depende del grado y de la ruta; simulado)',
      classification: 'ASSUMPTION',
    },
    {
      key: 'lf.sulfur',
      name: 'Contenido de azufre',
      unit: '%',
      role: 'Se elimina hacia la escoria en condiciones básicas y reductoras con agitación fuerte.',
      trainingRange: 'Meta ≤ 0.010% (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.argonFlow',
      name: 'Flujo de argón',
      unit: 'NL/min',
      role: 'Agitación fuerte para desulfurar y homogeneizar; agitación suave para la flotación de inclusiones antes de liberar.',
      trainingRange: 'Fuerte 400–600; suave 50–150 NL/min (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.treatmentTime',
      name: 'Tiempo de tratamiento',
      unit: 'min',
      role: 'Debe caber dentro del ritmo de la secuencia de la máquina de colada.',
      trainingRange: '35–45 min (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.aluminium',
      name: 'Aluminio soluble',
      unit: '%',
      role: 'Mantiene el acero desoxidado (baja actividad de oxígeno) para la desulfuración y el control de grano; el exceso aumenta los productos de reoxidación.',
      trainingRange: '0.020–0.045% para grados de planchón calmados al Al (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.heatingRate',
      name: 'Velocidad de calentamiento',
      unit: '°C/min',
      role: 'Define cuánta corrección de temperatura es posible en el tiempo disponible.',
      trainingRange: '4–5 °C/min (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.calcium',
      name: 'Contenido de calcio después del tratamiento con CaSi',
      unit: 'ppm',
      role: 'Modifica las inclusiones de alúmina; el nivel correcto de Ca depende del Al, el S y el O, y es específico de cada grado.',
      classification: 'PLANT_SPECIFIC',
    },
    {
      key: 'lf.softStirTime',
      name: 'Tiempo de agitación suave antes de liberar',
      unit: 'min',
      role: 'Permite que las inclusiones floten a la escoria después de las últimas adiciones.',
      trainingRange: '≥ 8 min (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'lf.slagFeOMnO',
      name: 'FeO + MnO de la escoria',
      unit: '%',
      role: 'Indicador del potencial oxidante de la escoria; se necesitan valores bajos para desulfurar y obtener acero limpio.',
      trainingRange: 'Normalmente se mantiene bajo (p. ej. < 2%, guía de la industria; se requiere el valor de planta)',
      classification: 'INDUSTRY_STANDARD',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'Escoria oxidante (FeO + MnO alto) por arrastre del HAE',
      consequence: 'Pérdida de Al (fading), desulfuración lenta, más inclusiones de alúmina y posible reversión de P.',
      typicalResponse: 'Desoxidar y acondicionar la escoria; reducir el arrastre en el vaciado.',
    },
    {
      event: 'El azufre no llega a la meta en el tiempo disponible',
      consequence: 'Tratamiento más largo o colada reasignada a otro grado; la secuencia de la máquina de colada queda en riesgo.',
      typicalResponse: 'Revisar la basicidad/fluidez de la escoria, el estado de desoxidación, la temperatura y la intensidad de agitación.',
    },
    {
      event: 'Agitación excesiva (ojo abierto grande)',
      consequence: 'Acero expuesto al aire: reoxidación, absorción de nitrógeno y atrapamiento de escoria.',
      typicalResponse: 'Reducir el flujo de argón al rango de la práctica; mantener la escoria cubriendo el ojo.',
    },
    {
      event: 'Tratamiento con calcio incorrecto (muy poco o demasiado Ca)',
      consequence: 'Inclusiones sólidas de alúmina o de CaS; obstrucción (clogging) de buzas en la máquina de colada.',
      typicalResponse: 'Ajustar la longitud de alambre según el Al, el S y el peso del acero; revisar la recuperación de Ca y la práctica de alimentación de alambre.',
    },
    {
      event: 'Temperatura de liberación fuera de ventana',
      consequence: 'Baja: congelamiento u obstrucción de buzas en la máquina de colada; alta: límites de velocidad de colada, riesgo de perforación (breakout) y segregación.',
      typicalResponse: 'Recalentar, o esperar/enfriar con agitación antes de liberar; coordinar con la máquina de colada.',
    },
    {
      event: 'Rotura del electrodo o electrodo sumergido en el acero',
      consequence: 'Absorción de carbono y demoras.',
      typicalResponse: 'Retirar el trozo si es posible, volver a muestrear y corregir la química.',
    },
  ],
  impact: {
    safety:
      'Los principales peligros son: metal líquido, potencia eléctrica del arco, bóveda enfriada por agua, adiciones de ferroaleaciones (salpicaduras si están húmedas) y asfixia por argón.',
    quality:
      'El HO fija la química final, la temperatura y gran parte de las inclusiones que llegan a la máquina de colada; es la última oportunidad para corregir el acero antes de colar.',
    reliability:
      'La disponibilidad del HO y el tiempo de tratamiento limitan directamente la secuencia de la máquina de colada; los electrodos, el enfriamiento de la bóveda y el sistema de argón son clave.',
    productivity:
      'El tiempo de tratamiento debe ajustarse al ritmo de la máquina de colada; un vaciado estable en el HAE reduce las correcciones y el consumo de energía en el HO.',
  },
  qualityImpact: [
    {
      variable: 'lf.sulfur',
      mechanism:
        'La desulfuración depende al mismo tiempo de la basicidad y fluidez de la escoria, de un FeO + MnO bajo en la escoria, de una baja actividad de oxígeno en el acero (Al), de la temperatura y de la energía de agitación; ninguna variable sola garantiza el resultado.',
      possibleDefects: ['Inclusiones de MnS (menor ductilidad, desgarre laminar)', 'Baja resistencia a HIC en grados para tubería de conducción', 'Mayor susceptibilidad al agrietamiento en caliente'],
    },
    {
      variable: 'lf.aluminium',
      mechanism:
        'El Al controla la actividad de oxígeno; la desoxidación forma alúmina que debe flotar. La obstrucción de buzas también depende del tratamiento con Ca, la reoxidación durante la transferencia y la colada, las reacciones con el refractario y el sobrecalentamiento.',
      possibleDefects: ['Cúmulos (clusters) de alúmina', 'Obstrucción (clogging) de buzas', 'Astillas (slivers) y defectos superficiales después de laminar'],
    },
    {
      variable: 'lf.argonFlow',
      mechanism:
        'La agitación favorece el mezclado y la flotación de inclusiones, pero una agitación demasiado fuerte expone el acero al aire y atrapa escoria; el efecto neto depende de la cubierta de escoria, del momento y de la geometría de la olla.',
      possibleDefects: ['Inclusiones de reoxidación', 'Absorción de nitrógeno', 'Escoria atrapada'],
    },
    {
      variable: 'lf.temperature',
      mechanism:
        'La temperatura de liberación define el sobrecalentamiento en el distribuidor, junto con el tiempo de espera de la olla, el estado del refractario y el precalentamiento del distribuidor. El sobrecalentamiento influye en la estructura de solidificación, la obstrucción de buzas y el riesgo de perforación (breakout).',
      possibleDefects: ['Segregación central y porosidad (sobrecalentamiento alto, junto con otros factores)', 'Congelamiento/obstrucción de buzas (sobrecalentamiento bajo)'],
    },
    {
      variable: 'lf.calcium',
      mechanism:
        'El Ca convierte la alúmina en aluminatos de calcio líquidos solo dentro de una ventana definida por el Al, el S y el oxígeno total; fuera de ella se forma CaS sólido o queda alúmina sin modificar.',
      possibleDefects: ['Obstrucción (clogging) de buzas', 'Inclusiones duras no deformables (críticas en grados sensibles a fatiga o a HIC)'],
    },
  ],
  safetyHazards: [
    { category: 'molten-metal', description: 'Acero y escoria líquidos en la olla; salpicaduras durante las adiciones y la agitación.' },
    { category: 'electrical', description: 'Calentamiento por arco con circuito secundario de alta corriente.' },
    { category: 'water-molten-metal', description: 'Bóveda enfriada por agua sobre la olla; adiciones húmedas.' },
    { category: 'gas', description: 'Argón (asfixiante) y gases de proceso/humos.' },
    { category: 'high-temperature', description: 'Calor radiante durante el muestreo, la medición de temperatura y la alimentación de alambre.' },
    { category: 'moving-machinery', description: 'Carro de olla, levante de la bóveda y rodillos de arrastre del alimentador de alambre.' },
    { category: 'noise-dust', description: 'Ruido del arco y humos durante el calentamiento y las adiciones.' },
  ],
  maintenancePoints: [
    {
      component: 'argonSystem',
      function: 'Dar una agitación controlada.',
      failureMode: 'Pérdida de flujo o tapón bloqueado no detectado.',
      inspectionPoints: ['Respuesta de flujo/presión', 'Acoplamientos y mangueras', 'Lanza de respaldo'],
      considerations: 'Las fugas de gas son un peligro de asfixia en fosas y áreas cerradas.',
      processConsequence: 'Mala desulfuración y mala limpieza del acero.',
    },
    {
      component: 'wireFeeder',
      function: 'Inyectar alambre de CaSi/Al/C.',
      failureMode: 'Atoramiento, velocidad incorrecta o desgaste del tubo guía.',
      inspectionPoints: ['Rodillos de arrastre', 'Tubo guía', 'Calibración del contador'],
      considerations: 'La velocidad de alimentación y la alineación de la guía determinan la profundidad de penetración y la recuperación del alambre.',
      processConsequence: 'Desviaciones en la química y en el control de inclusiones.',
    },
    {
      component: 'roof',
      function: 'Contener el calor y los humos.',
      failureMode: 'Fuga de agua.',
      inspectionPoints: ['Balance de flujo', 'Temperaturas de salida'],
      considerations: 'Los enclavamientos de detección de fugas no se deben puentear.',
      processConsequence: 'Paro por seguridad y absorción de hidrógeno.',
    },
    {
      component: 'electrodes',
      function: 'Calentar el acero.',
      failureMode: 'Rotura o consumo excesivo.',
      inspectionPoints: ['Uniones', 'Longitud de la columna'],
      considerations: 'Los ajustes de la regulación influyen en el consumo y en la radiación del arco hacia el refractario.',
      processConsequence: 'Demoras y absorción de carbono.',
    },
  ],
  specifications: [
    { label: 'Número de unidades', value: '2 (HO-1, HO-2)', classification: 'CONFIGURABLE' },
    { label: 'Transformador', value: '25 MVA', classification: 'CONFIGURABLE' },
    { label: 'Electrodos', value: 'Grafito de 457 mm (18")', classification: 'CONFIGURABLE' },
    { label: 'Velocidad de calentamiento', value: '4–5 °C/min', classification: 'CONFIGURABLE' },
    { label: 'Agitación con argón', value: 'Fuerte 400–600 NL/min; suave 50–150 NL/min (≥ 8 min antes de liberar)', classification: 'CONFIGURABLE' },
    { label: 'Alimentador de alambre', value: '2 líneas: CaSi, Al, C', classification: 'CONFIGURABLE' },
    { label: 'Metas', value: 'S ≤ 0.010%; Al soluble 0.020–0.045% (grados de planchón calmados al Al)', classification: 'CONFIGURABLE' },
    { label: 'Tiempo de tratamiento', value: '35–45 min', classification: 'CONFIGURABLE' },
    { label: 'Desgasificación al vacío', value: 'No instalada en la configuración de referencia (opcional, deshabilitada)', classification: 'ASSUMPTION' },
    { label: 'Ventana de tratamiento con Ca (ppm de Ca vs. Al, S)', value: 'Específica del grado y de la planta', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Ficha técnica de Acería (configuración de referencia, borrador para validación)',
    'AIST, The Making, Shaping and Treating of Steel — Steelmaking and Refining Volume',
    'Literatura de la industria sobre desulfuración en olla, flotación de inclusiones de alúmina y tratamiento con calcio',
  ],
};
