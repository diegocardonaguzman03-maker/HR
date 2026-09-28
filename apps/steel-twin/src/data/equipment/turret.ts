import type { EquipmentData } from '../../types/equipment';

/**
 * Torreta giratoria de ollas (máquina de colada de planchón CC1).
 * Configuración de referencia: FT-ACE-001 v0.3 §4 (brazos tipo mariposa, 2 ollas, pesaje de olla,
 * tubo protector de olla (shroud) con sello de argón). Los valores de planta son CONFIGURABLES, no verificados.
 */
export const turret: EquipmentData = {
  id: 'turret',
  name: 'Torreta giratoria',
  shortName: 'Torreta',
  category: 'casting',
  processStages: ['TURRET', 'TUNDISH_FILL', 'MOLD_FILL'],
  tooltip: 'Sostiene dos ollas y gira la olla llena sobre el distribuidor para que la colada no se detenga entre coladas.',
  description:
    'La torreta giratoria es una base que gira y tiene dos brazos. Un brazo sostiene la olla que está colando; el otro recibe de la grúa la siguiente olla. Al girar la torreta, las ollas se intercambian en cerca de un minuto. Esto permite la colada en secuencia de muchas coladas sin detener la barra (strand).',
  purpose:
    'Sostener la olla de forma segura sobre el distribuidor, medir cuánto acero queda e intercambiar ollas rápido, para que el nivel del distribuidor (y por lo tanto el molde) nunca se quede sin acero durante una secuencia.',
  howItWorks: [
    'La grúa viajera coloca la olla que viene del Horno Olla (HO) en el brazo libre (posición de "espera"). La olla descansa en asientos con celdas de carga, así se conoce en todo momento el peso de acero.',
    'La torreta gira 180° y lleva la olla llena a la posición de colada sobre el distribuidor. El brazo baja la olla hasta que la buza de la válvula deslizante se puede conectar al tubo protector de olla (shroud).',
    'El tubo protector de olla (shroud) es un tubo refractario que se presiona contra la buza colectora de la olla y queda sumergido en el acero del distribuidor. Un sello de argón en la junta evita que el chorro succione aire (reoxidación y absorción de nitrógeno).',
    'Se abre la válvula deslizante de la olla y el acero fluye al distribuidor. El flujo se regula para mantener el peso del distribuidor dentro de su ventana de operación, mientras la barra tapón (en el distribuidor) controla el flujo al molde.',
    'Cerca del final de la colada, la baja del peso de la olla y la detección de escoria le indican al operador cuándo cerrar la válvula deslizante para que la escoria de la olla no pase al distribuidor. Mientras tanto, la siguiente olla ya espera en el otro brazo.',
    'Durante el cambio de olla, el distribuidor funciona como reserva: el acero que tiene almacenado sigue alimentando el molde mientras la torreta gira y se abre la olla nueva. Por eso se sube el peso del distribuidor antes del cambio.',
  ],
  inputs: ['Olla llena de acero refinado del Horno Olla (con la grúa)', 'Argón para el sello del tubo protector (shroud)', 'Energía eléctrica / hidráulica para giro y elevación'],
  outputs: ['Chorro de acero controlado hacia el distribuidor', 'Olla vacía devuelta a la grúa', 'Señal de peso de olla para el sistema de control de colada'],
  components: [
    {
      id: 'base',
      name: 'Base de la torreta y rodamiento de giro',
      function: 'Cimentación fija y rodamiento de giro de gran diámetro que soporta toda la carga de la torreta y permite el giro.',
      failureModes: ['Desgaste del rodamiento o pérdida de lubricación', 'Aflojamiento de anclas o grietas en la cimentación', 'Juego excesivo que desalinea la olla sobre el distribuidor'],
      inspectionPoints: ['Suavidad y ruido del giro del rodamiento', 'Estado de la lubricación', 'Estado de pernos e integridad de la cimentación', 'Mediciones de inclinación / juego'],
      maintenanceConsiderations: ['Estructura crítica que soporta dos ollas llenas; cualquier intervención requiere evaluación de ingeniería y criterios del OEM [Validar con OEM].'],
      processConsequence: 'Si no puede girar, se detiene la secuencia; una falla estructural con la olla llena es un peligro mayor de metal líquido.',
    },
    {
      id: 'arms',
      name: 'Brazos tipo mariposa',
      function: 'Dos brazos independientes que sostienen las ollas y pueden subirlas o bajarlas sobre el distribuidor.',
      failureModes: ['Grietas por fatiga estructural en soldaduras', 'Fuga o deriva del cilindro de elevación', 'El brazo no alcanza la altura correcta para conectar el tubo protector (shroud)'],
      inspectionPoints: ['Estado de soldaduras y estructura (END según criterio de ingeniería)', 'Sellos y mangueras del cilindro de elevación', 'Retroalimentación de posición de cada brazo'],
      maintenanceConsiderations: ['Los brazos están expuestos a calor radiante y posibles salpicaduras de acero; importa el estado de las pantallas térmicas.'],
      processConsequence: 'Un brazo que no baja bien impide conectar el tubo protector (shroud) y obliga a colar con chorro abierto o a detener la secuencia.',
    },
    {
      id: 'ladleSupports',
      name: 'Asientos de olla (silletas)',
      function: 'Asientos en cada brazo donde descansan los muñones de la olla en una posición definida.',
      failureModes: ['Desgaste o deformación de los asientos', 'Acumulación de zamarra o residuos que impide asentar bien la olla'],
      inspectionPoints: ['Geometría y desgaste de los asientos', 'Limpieza antes de colocar cada olla'],
      maintenanceConsiderations: ['Un asentamiento incorrecto mueve la posición de la buza de la olla y afecta la alineación del tubo protector (shroud).'],
      processConsequence: 'Buza de olla desalineada → mal sello del tubo protector → aspiración de aire e inclusiones por reoxidación.',
    },
    {
      id: 'loadCells',
      name: 'Celdas de carga de la olla',
      function: 'Pesan cada olla en forma continua para saber el acero que queda y el ritmo de vaciado.',
      failureModes: ['Deriva o pérdida de señal', 'Daño mecánico o sobrecalentamiento de las celdas', 'Error de calibración'],
      inspectionPoints: ['Revisión de cero y calibración contra una referencia', 'Estado de cables y caja de conexiones', 'Pantallas térmicas'],
      maintenanceConsiderations: ['La señal de peso se usa para anticipar el final de la olla y el paso de escoria; una señal errónea confunde al operador.'],
      processConsequence: 'Peso erróneo → cierre tardío de la válvula deslizante (escoria al distribuidor) o cierre anticipado (pérdida de rendimiento de acero).',
    },
    {
      id: 'rotationDrive',
      name: 'Accionamiento de giro',
      function: 'Motor / reductor (con accionamiento de emergencia de respaldo) que gira la torreta entre las posiciones de espera y de colada.',
      failureModes: ['Falla del motor o del reductor', 'Falla del freno', 'Pérdida de energía principal durante el giro'],
      inspectionPoints: ['Desgaste de corona y piñón', 'Estado del freno', 'Funcionamiento del accionamiento de emergencia'],
      maintenanceConsiderations: ['El accionamiento de emergencia existe para que una olla llena siempre se pueda retirar de la posición de colada [Validar con OEM].'],
      processConsequence: 'Un cambio de olla fallido interrumpe la secuencia: el distribuidor se vacía y hay que detener la barra (fin de secuencia).',
    },
    {
      id: 'ladleShroud',
      name: 'Tubo protector de olla (shroud) con sello de argón',
      function: 'Tubo refractario que protege del aire el chorro de la olla al distribuidor.',
      failureModes: ['Agrietamiento por choque térmico', 'Erosión o taponamiento', 'Mal sello en la buza colectora (entrada de aire)'],
      inspectionPoints: ['Estado visual antes de cada uso', 'Flujo y presión de argón en el sello', 'Inmersión correcta en el distribuidor'],
      maintenanceConsiderations: ['El tubo protector es un consumible; el precalentamiento y la forma de manejarlo afectan su vida [Validar con Ingeniería de Proceso].'],
      processConsequence: 'La entrada de aire causa reoxidación (inclusiones de Al2O3), absorción de nitrógeno y mayor tendencia al taponamiento de la buza sumergida (SEN).',
    },
  ],
  processVariables: [
    { key: 'ladle.weight', name: 'Peso de acero en la olla', unit: 't', role: 'Acero que queda en la olla que está colando; se usa para planear el cambio de olla y evitar el paso de escoria.', trainingRange: 'Del tamaño de colada a 0 t', classification: 'CONFIGURABLE' },
    { key: 'tundish.weight', name: 'Peso de acero en el distribuidor', unit: 't', role: 'Reserva entre olla y molde; el operador de torreta regula el flujo de la olla para mantenerlo en rango.', trainingRange: '≈ 35–45 t (45 t nominal) — DATOS SIMULADOS DE CAPACITACIÓN', classification: 'CONFIGURABLE' },
    { key: 'turret.shroudArgon', name: 'Flujo de argón del sello del tubo protector (shroud)', unit: 'NL/min', role: 'Protege el chorro del aire en la junta del tubo protector.', classification: 'PLANT_SPECIFIC' },
    { key: 'turret.ladleChangeTime', name: 'Tiempo de cambio de olla', unit: 's', role: 'Tiempo en que el distribuidor alimenta solo al molde; define cuánto baja el nivel del distribuidor.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Paso de escoria de la olla al final de la colada', consequence: 'La escoria entra al distribuidor, aumentan las inclusiones y el riesgo de taponamiento de la buza sumergida (SEN); puede aparecer como defectos de escoria en el planchón.', typicalResponse: 'Cerrar la válvula deslizante al detectar escoria / según la tendencia del peso; dejar un remanente de acero adecuado en la olla.' },
    { event: 'Tubo protector (shroud) agrietado o mal sellado', consequence: 'Aspiración de aire: inclusiones por reoxidación y absorción de nitrógeno; flama visible en la junta.', typicalResponse: 'Revisar el sello de argón, reasentar o cambiar el tubo protector cuando sea posible; marcar los planchones afectados para revisión de calidad.' },
    { event: 'Llegada tardía de la olla', consequence: 'Baja el nivel del distribuidor; con menos nivel flotan peor las inclusiones y puede formarse vórtice; al final, fin de secuencia.', typicalResponse: 'Bajar la velocidad de colada dentro de límites para ganar tiempo; si no hay olla, hacer un fin de colada planeado.' },
    { event: 'La válvula deslizante no abre (buza congelada)', consequence: 'No hay flujo al distribuidor; la secuencia está en riesgo.', typicalResponse: 'Aplicar la práctica de apertura de la planta (por ejemplo, lanceo con oxígeno por personal autorizado); si no, retirar la olla.' },
    { event: 'Falla de giro o de elevación con olla llena', consequence: 'Se detiene la secuencia; una olla llena detenida en una posición no estándar es un peligro grave.', typicalResponse: 'Usar el accionamiento de emergencia / sistema de respaldo para llegar a una posición segura; despejar el área según el procedimiento de planta.' },
  ],
  impact: {
    safety: 'Maneja la carga suspendida de metal líquido más pesada de la máquina de colada; la integridad estructural, hidráulica y de giro es crítica.',
    quality: 'La protección del chorro (tubo protector y argón) y el control de escoria influyen directamente en la limpieza del acero en el planchón.',
    reliability: 'La torreta es un punto único de falla para la colada en secuencia; una falla termina la secuencia.',
    productivity: 'Cambios de olla rápidos y confiables permiten secuencias largas y menos rearranques de la barra.',
  },
  qualityImpact: [
    {
      variable: 'Protección del chorro (sello del tubo protector + argón) y control de escoria de la olla',
      mechanism: 'La reoxidación en el chorro de la olla se combina con el paso de escoria de la olla, el nivel del distribuidor durante el cambio y la práctica de argón en la buza sumergida (SEN) para definir cuántos cúmulos de alúmina llegan al molde. Ningún factor actúa solo: un buen sello con mal control de escoria sigue generando inclusiones.',
      possibleDefects: ['Inclusiones no metálicas (cúmulos de alúmina)', 'Laminaciones (slivers) por atrapamiento de escoria', 'Mayor taponamiento de la buza sumergida (SEN) y la fluctuación de nivel de molde que provoca'],
    },
  ],
  safetyHazards: [
    { category: 'suspended-loads', description: 'Ollas llenas sostenidas sobre áreas de trabajo.' },
    { category: 'molten-metal', description: 'Posible salpicadura o fuga desde la olla, la válvula deslizante o el tubo protector (shroud).' },
    { category: 'moving-machinery', description: 'Giro de la torreta y movimiento de los brazos.' },
    { category: 'hydraulic', description: 'Sistemas hidráulicos de alta presión de elevación y de la válvula deslizante.' },
    { category: 'high-temperature', description: 'Calor radiante de la olla y del chorro.' },
  ],
  maintenancePoints: [
    { component: 'Rodamiento de giro', function: 'Soportar y girar la torreta', failureMode: 'Desgaste / pérdida de lubricación', inspectionPoints: ['Ruido y suavidad', 'Lubricación', 'Juego'], considerations: 'Elemento estructural crítico; aplican criterios del OEM.', processConsequence: 'No se pueden cambiar ollas → fin de secuencia.' },
    { component: 'Celdas de carga', function: 'Pesaje de la olla', failureMode: 'Deriva / pérdida de señal', inspectionPoints: ['Calibración', 'Cableado', 'Pantallas térmicas'], considerations: 'El peso se usa para decidir sobre escoria y cambio de olla.', processConsequence: 'Paso de escoria o pérdida de rendimiento.' },
    { component: 'Manipulador del tubo protector y sello de argón', function: 'Conectar y sellar el tubo protector (shroud)', failureMode: 'Mal sello / desalineación', inspectionPoints: ['Flujo de argón', 'Asiento del sello', 'Alineación'], considerations: 'Refractarios consumibles; práctica de manejo.', processConsequence: 'Inclusiones por reoxidación.' },
  ],
  specifications: [
    { label: 'Tipo', value: 'Brazos tipo mariposa, 2 ollas, elevación independiente', classification: 'CONFIGURABLE' },
    { label: 'Pesaje de olla', value: 'Celdas de carga en cada brazo', classification: 'CONFIGURABLE' },
    { label: 'Tubo protector de olla (shroud)', value: 'Tubo refractario con sello de argón', classification: 'CONFIGURABLE' },
    { label: 'Capacidad de olla / tamaño de colada', value: 'Según el diseño de olla de la planta', classification: 'PLANT_SPECIFIC' },
    { label: 'Tiempo de giro', value: 'Según el OEM', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (configuración de referencia)', 'docs/assumptions/caster.md', 'Literatura general de colada continua (p. ej., AIST "The Making, Shaping and Treating of Steel", Casting Volume)'],
};
