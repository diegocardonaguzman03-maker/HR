import type { EquipmentData } from '../../types/equipment';

/**
 * Máquina de oxicorte (CC1).
 * Configuración de referencia: FT-ACE-001 v0.3 §4 (corte con oxígeno-gas combustible, O2 + gas natural,
 * longitud de planchón 8–11 m). CONFIGURABLE, no verificado.
 */
export const torchCutter: EquipmentData = {
  id: 'torchCutter',
  name: 'Máquina de oxicorte',
  shortName: 'Oxicorte',
  category: 'cutting',
  processStages: ['CUTTING'],
  tooltip: 'Avanza junto con la barra en movimiento y la corta en planchones con sopletes de oxígeno-gas.',
  description:
    'La máquina de oxicorte corta la barra continua, ya totalmente solidificada, en planchones de la longitud pedida. Como la barra nunca se detiene, la máquina se sujeta a ella y avanza a la velocidad de colada mientras los sopletes cortan a lo ancho.',
  purpose:
    'Producir planchones de la longitud correcta (8–11 m en la configuración de referencia) con caras de corte limpias, sin interrumpir la colada.',
  howItWorks: [
    'Un sistema de medición de longitud da seguimiento a la barra. Al llegar a la longitud pedida, el carro de sopletes se sujeta a la barra y se mueve sincronizado con ella.',
    'Los sopletes de oxígeno-gas natural precalientan el acero hasta la temperatura de ignición; luego un chorro de oxígeno de corte quema y expulsa el acero a lo largo de la ranura de corte.',
    'En planchones anchos, normalmente dos sopletes arrancan en las orillas y avanzan hacia el centro (uno se retira antes del final). El tiempo de corte depende del espesor, el ancho y la temperatura.',
    'Después del corte las mordazas se abren y el carro regresa a su posición de inicio. La escoria (rebaba) que se forma en la orilla inferior la quita un desrebabador.',
    'La barra debe estar totalmente sólida en el oxicorte. Cortar una barra con núcleo líquido liberaría acero líquido.',
  ],
  inputs: ['Barra sólida a velocidad de colada', 'Oxígeno', 'Gas natural', 'Longitud fijada por el programa de producción'],
  outputs: ['Planchones cortados', 'Escoria y humos de corte', 'Datos de longitud e identificación del planchón'],
  components: [
    { id: 'torchCar', name: 'Carro de sopletes', function: 'Carro que se sincroniza con la barra y lleva los sopletes.', failureModes: ['Pérdida de sincronización', 'Falla del motor de traslación', 'Daño en rieles'], inspectionPoints: ['Precisión de la sincronización', 'Límites de recorrido', 'Rieles'], maintenanceConsiderations: ['Una mala sincronización produce cortes oblicuos o escalonados.'], processConsequence: 'Errores de longitud, mala calidad de corte, corte sin terminar antes del fin de recorrido.' },
    { id: 'torches', name: 'Sopletes de corte', function: 'Quemadores que precalientan y cortan con un chorro de oxígeno.', failureModes: ['Desgaste / taponamiento de la boquilla', 'Retroceso de flama', 'Falla de encendido'], inspectionPoints: ['Estado de la boquilla', 'Forma de la flama', 'Arrestadores de flama'], maintenanceConsiderations: ['El estado de la boquilla define el ancho de la ranura y la cara de corte.'], processConsequence: 'Cortes incompletos, ranura ancha (pérdida de rendimiento), caras rugosas.' },
    { id: 'gasSupply', name: 'Suministro de gases (O2 + gas natural)', function: 'Suministro regulado de oxígeno y gas combustible a los sopletes.', failureModes: ['Variaciones de presión', 'Fugas', 'Falla del regulador'], inspectionPoints: ['Presiones de suministro', 'Detección de fugas', 'Funcionamiento de válvulas'], maintenanceConsiderations: ['Las atmósferas enriquecidas con oxígeno y las fugas de gas combustible son peligros de incendio/explosión.'], processConsequence: 'Interrupciones del corte; riesgo de incendio.' },
    { id: 'clamps', name: 'Mordazas de la barra', function: 'Sujetan las orillas de la barra para que el carro avance con ella.', failureModes: ['Deslizamiento', 'Falla del cilindro de la mordaza'], inspectionPoints: ['Fuerza de sujeción', 'Desgaste de las zapatas'], maintenanceConsiderations: ['El deslizamiento causa pérdida de sincronización.'], processConsequence: 'Corte chueco, error de longitud.' },
    { id: 'deburrer', name: 'Desrebabador', function: 'Quita la rebaba de escoria en la orilla inferior del corte.', failureModes: ['Desgaste de la herramienta', 'Error de posicionamiento'], inspectionPoints: ['Estado de la herramienta', 'Restos de rebaba en los planchones'], maintenanceConsiderations: ['La rebaba que queda puede dañar el horno de recalentamiento o los rodillos del molino.'], processConsequence: 'Marcas superficiales en procesos posteriores.' },
    { id: 'marking', name: 'Máquina de marcado de planchones', function: 'Aplica la identificación del planchón (colada, barra, número de planchón).', failureModes: ['Marcado ilegible', 'Datos que no coinciden'], inspectionPoints: ['Legibilidad', 'Enlace de datos con el sistema de seguimiento'], maintenanceConsiderations: ['Los errores de identificación rompen la trazabilidad.'], processConsequence: 'Pérdida de trazabilidad, planchón equivocado a la orden equivocada.' },
  ],
  processVariables: [
    { key: 'cutter.slabLength', name: 'Longitud del planchón', unit: 'm', role: 'Longitud pedida; define el peso del planchón para el molino de laminación en caliente.', trainingRange: '8–11 m', classification: 'CONFIGURABLE' },
    { key: 'cc.castingSpeed', name: 'Velocidad de colada', unit: 'm/min', role: 'Define cuánto recorre el carro durante un corte.', trainingRange: '0.8–1.6 m/min', classification: 'CONFIGURABLE' },
    { key: 'cc.solidificationProgress', name: 'Avance de la solidificación en el oxicorte', unit: '%', role: 'Debe ser 100 % (totalmente sólida) antes de cortar.', trainingRange: '100 % — DATO SIMULADO DE CAPACITACIÓN', classification: 'ASSUMPTION' },
    { key: 'cutter.cuttingTime', name: 'Tiempo de corte', unit: 's', role: 'Depende del ancho, el espesor y la temperatura.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Corte incompleto', consequence: 'Los planchones quedan unidos; se altera la mesa de salida.', typicalResponse: 'Volver a cortar según la práctica de la planta; revisar sopletes y suministro de gases.' },
    { event: 'Error de longitud', consequence: 'Planchón fuera del peso pedido; rechazo o recorte.', typicalResponse: 'Revisar la medición de longitud y la sincronización.' },
    { event: 'Núcleo líquido llega al oxicorte', consequence: 'Salida de acero líquido al cortar.', typicalResponse: 'Revisar velocidad / enfriamiento; la longitud metalúrgica debe quedar antes del oxicorte.' },
    { event: 'Fuga de gas o retroceso de flama', consequence: 'Peligro de incendio / explosión.', typicalResponse: 'Aislar los gases según el procedimiento de la planta.' },
  ],
  impact: {
    safety: 'Oxígeno y gas combustible, escoria caliente, carro y mordazas en movimiento.',
    quality: 'Calidad de la cara de corte, rebaba y longitud correcta.',
    reliability: 'Una falla del oxicorte obliga a detener la colada cuando la barra llega al límite de la mesa de salida.',
    productivity: 'Las pérdidas por ranura de corte y la precisión de longitud afectan el rendimiento.',
  },
  qualityImpact: [
    { variable: 'cutter.slabLength', mechanism: 'La precisión de longitud depende del seguimiento de la barra, la sincronización, el deslizamiento de las mordazas y la temperatura del planchón (contracción térmica al enfriarse).', possibleDefects: ['Planchones fuera de longitud', 'Caras de corte oblicuas', 'Rebaba remanente'] },
  ],
  safetyHazards: [
    { category: 'oxygen', description: 'Atmósfera enriquecida con oxígeno; riesgo de incendio.' },
    { category: 'gas', description: 'Fuga / explosión de gas natural.' },
    { category: 'high-temperature', description: 'Planchón caliente, escoria de corte y chispas.' },
    { category: 'moving-machinery', description: 'Carro de sopletes y mordazas en movimiento.' },
    { category: 'noise-dust', description: 'Humos de corte.' },
  ],
  maintenancePoints: [
    { component: 'Sopletes', function: 'Corte', failureMode: 'Desgaste de boquilla / retroceso de flama', inspectionPoints: ['Boquillas', 'Flama', 'Arrestadores'], considerations: 'Consumibles.', processConsequence: 'Cortes incompletos.' },
    { component: 'Carro de oxicorte / mordazas', function: 'Sincronización', failureMode: 'Deslizamiento / falla del motor', inspectionPoints: ['Fuerza de sujeción', 'Motor'], considerations: 'Precisión del seguimiento.', processConsequence: 'Errores de longitud y de escuadra.' },
    { component: 'Suministro de gases', function: 'O2 + combustible', failureMode: 'Fugas / presión', inspectionPoints: ['Presiones', 'Revisión de fugas'], considerations: 'Peligro de incendio/explosión.', processConsequence: 'Paro del corte; riesgo de incendio.' },
  ],
  specifications: [
    { label: 'Método de corte', value: 'Oxígeno-gas combustible (O2 + gas natural)', classification: 'CONFIGURABLE' },
    { label: 'Longitud del planchón', value: '8–11 m', classification: 'CONFIGURABLE' },
    { label: 'Número de sopletes, ancho de ranura, velocidad de corte', value: 'Según el fabricante (OEM)', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (configuración de referencia)', 'docs/assumptions/caster.md'],
};
