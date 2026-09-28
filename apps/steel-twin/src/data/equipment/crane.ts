import type { EquipmentData } from '../../types/equipment';

/**
 * Grúa viajera de ollas (colada). Configuración de referencia de FT-ACE-001 v0.3 (borrador, no validado en planta).
 * Todos los valores numéricos son DATOS SIMULADOS DE CAPACITACIÓN / valores de referencia, nunca consignas de planta.
 */
export const crane: EquipmentData = {
  id: 'crane',
  name: 'Grúa viajera (grúa de ollas)',
  shortName: 'Grúa',
  category: 'handling',
  processStages: ['TRANSFER', 'TURRET'],
  tooltip: 'Grúa viajera de gran capacidad que levanta y lleva las ollas llenas de acero a la torreta de la máquina de colada.',
  description:
    'La grúa de ollas es una grúa viajera de servicio pesado, diseñada para metal líquido. Levanta las ollas llenas por sus muñones y las mueve entre el Horno Olla (HO), la torreta de la máquina de colada y el área de preparación de ollas.',
  purpose:
    'Transportar ollas con ≈ 150 t de acero líquido de forma segura y a tiempo, para que la máquina de colada reciba la siguiente olla antes de que se vacíe la actual.',
  howItWorks: [
    'La grúa se desplaza sobre rieles a lo largo de la nave de ollas. Su puente lleva un carro principal con el polipasto principal y, por lo general, un carro/polipasto auxiliar para voltear la olla (por ejemplo, para vaciar escoria).',
    'El polipasto principal baja el balancín portaollas (gancho de olla), cuyos dos ganchos toman los muñones de la olla. La carga se levanta despacio, se revisa y luego se traslada por la nave con aceleración controlada para evitar que se balancee.',
    'Las grúas para metal líquido se construyen con redundancia: en la configuración de referencia tienen doble sistema de frenos y finales de carrera redundantes, para que una sola falla no deje caer la carga. El pesaje de la carga apoya el balance de masa de la colada.',
    'En la máquina de colada, la grúa coloca la olla en el brazo libre de la torreta; después la torreta la gira a la posición de colada. El tiempo de esta transferencia forma parte de la planeación de la secuencia.',
  ],
  inputs: ['Olla tratada del HO', 'Olla vacía de la torreta', 'Energía eléctrica', 'Órdenes de movimiento del operador/despacho'],
  outputs: ['Olla colocada en la torreta de la máquina de colada', 'Olla vacía devuelta a preparación', 'Lectura del peso de la olla'],
  components: [
    {
      id: 'bridge',
      name: 'Puente (vigas principales y testeros)',
      function: 'Estructura principal que cruza la nave y se desplaza sobre los rieles de rodamiento.',
      failureModes: ['Grietas por fatiga estructural', 'Desgaste de ruedas/rieles y desalineación (sesgo)', 'Falla del accionamiento o del freno de traslación'],
      inspectionPoints: ['Soldaduras de las vigas (END según reglas de planta)', 'Ruedas, rieles y alineación', 'Frenos de traslación'],
      maintenanceConsiderations: ['El calor radiante de las ollas acelera el desgaste de los componentes bajo las vigas'],
      processConsequence: 'Una grúa fuera de servicio bloquea la logística de ollas y puede detener la colada.',
    },
    {
      id: 'trolley',
      name: 'Carros principal y auxiliar',
      function: 'Se desplazan a lo largo del puente y cargan los polipastos.',
      failureModes: ['Falla del accionamiento o del freno del carro', 'Desgaste de rieles', 'Choque contra los topes'],
      inspectionPoints: ['Accionamientos y frenos', 'Rieles del carro', 'Finales de carrera'],
      maintenanceConsiderations: ['Los finales de carrera son dispositivos de seguridad y deben probarse según las reglas de planta'],
      processConsequence: 'Pérdida de precisión al posicionar la olla en la torreta o en el HO.',
    },
    {
      id: 'hoist',
      name: 'Polipasto principal (accionamiento y frenos redundantes)',
      function: 'Sube y baja el balancín portaollas y la olla.',
      failureModes: ['Desgaste del cable o alambres rotos', 'Degradación de frenos', 'Daño en reductor o tambor', 'Sobrecarga'],
      inspectionPoints: ['Cables de acero (alambres rotos, reducción de diámetro, daño por calor)', 'Frenos de servicio y de emergencia', 'Finales de carrera superior/inferior', 'Celda de carga'],
      maintenanceConsiderations: ['Los criterios de desecho de cables y de frenos siguen al OEM y a las normas de izaje aplicables'],
      processConsequence: 'Una falla del polipasto con la olla llena es un escenario catastrófico de metal líquido.',
    },
    {
      id: 'lifterBeam',
      name: 'Balancín portaollas (gancho de olla)',
      function: 'Viga con dos ganchos que toman los muñones de la olla.',
      failureModes: ['Desgaste o grietas en los ganchos', 'Enganche incorrecto en los muñones', 'Daño por calor'],
      inspectionPoints: ['Garganta del gancho y superficies de desgaste', 'END según reglas de izaje de la planta', 'Pantallas térmicas'],
      maintenanceConsiderations: ['Accesorio de izaje crítico; la revisión visual antes de cada izaje es práctica común en la industria'],
      processConsequence: 'Un enganche incorrecto o la falla del gancho pueden hacer caer o voltear la olla.',
    },
  ],
  processVariables: [
    {
      key: 'crane.load',
      name: 'Carga en el gancho',
      unit: 't',
      role: 'Confirma el peso de la olla y protege contra sobrecarga.',
      trainingRange: 'Hasta ≈ 250 t de capacidad del gancho principal (referencia)',
      classification: 'CONFIGURABLE',
    },
    {
      key: 'crane.transferTime',
      name: 'Tiempo de transferencia HO–torreta',
      unit: 'min',
      role: 'Aumenta la pérdida de temperatura y debe ajustarse a la secuencia de la máquina de colada.',
      classification: 'PLANT_SPECIFIC',
    },
  ],
  whatCanGoWrong: [
    {
      event: 'Balanceo de la carga durante la traslación',
      consequence: 'Salpicaduras de acero, golpes contra estructuras, pérdida de posicionamiento.',
      typicalResponse: 'Aceleración suave, control antibalanceo donde esté instalado, ruta de traslación despejada.',
    },
    {
      event: 'Falla de freno o de polipasto con la olla suspendida',
      consequence: 'Posible descenso sin control del acero líquido.',
      typicalResponse: 'Entra el freno redundante; plan de emergencia y zona de exclusión según reglas de planta.',
    },
    {
      event: 'Enganche incorrecto en los muñones',
      consequence: 'La olla se voltea o se cae.',
      typicalResponse: 'Confirmación visual de ambos ganchos antes de levantar; primer izaje lento.',
    },
    {
      event: 'Grúa no disponible durante la secuencia',
      consequence: 'La siguiente olla no llega a la torreta; se corta la secuencia en la máquina de colada.',
      typicalResponse: 'Se usa la segunda grúa; se ajustan la secuencia y el plan de ollas.',
    },
  ],
  impact: {
    safety:
      'Trasladar acero líquido por encima de la nave es una de las actividades de mayor severidad en la acería; nadie debe estar nunca bajo cargas suspendidas.',
    quality: 'Los retrasos en la transferencia bajan la temperatura y pueden sacar al acero de la ventana de sobrecalentamiento de la máquina de colada.',
    reliability: 'La disponibilidad de la grúa de ollas es crítica porque normalmente hay poca redundancia en la nave de ollas.',
    productivity: 'Los tiempos de ciclo de la grúa influyen directamente en la rotación de ollas y en la continuidad de la secuencia.',
  },
  qualityImpact: [
    {
      variable: 'crane.transferTime',
      mechanism:
        'Una transferencia más larga aumenta la pérdida de temperatura; el efecto en el sobrecalentamiento del distribuidor también depende de la temperatura de liberación del HO, del estado del refractario de la olla y de la cobertura de escoria.',
      possibleDefects: ['Taponamiento relacionado con bajo sobrecalentamiento (indirecto)'],
    },
  ],
  safetyHazards: [
    { category: 'suspended-loads', description: 'Ollas llenas de acero líquido trasladadas por encima de la nave.' },
    { category: 'molten-metal', description: 'Salpicadura o derrame de una olla en movimiento.' },
    { category: 'moving-machinery', description: 'Traslación del puente y del carro; riesgo de choque.' },
    { category: 'electrical', description: 'Barras conductoras y sistemas eléctricos de la grúa.' },
    { category: 'high-temperature', description: 'Calor radiante sobre la cabina, los cables y los ganchos.' },
    { category: 'pinch-points', description: 'Enganche de ganchos y muñones.' },
  ],
  maintenancePoints: [
    {
      component: 'hoist',
      function: 'Subir y bajar la olla.',
      failureMode: 'Degradación del cable o del freno.',
      inspectionPoints: ['Estado del cable de acero', 'Frenos', 'Finales de carrera'],
      considerations: 'Criterios de desecho y aceptación según el OEM y las normas de izaje (verificar con SSO).',
      processConsequence: 'Paro de la grúa; evento catastrófico si falla con carga.',
    },
    {
      component: 'lifterBeam',
      function: 'Tomar los muñones.',
      failureMode: 'Desgaste o grietas en los ganchos.',
      inspectionPoints: ['Superficies de desgaste del gancho', 'END'],
      considerations: 'Accesorio de izaje crítico.',
      processConsequence: 'Caída o volteo de la olla.',
    },
    {
      component: 'bridge',
      function: 'Desplazarse a lo largo de la nave.',
      failureMode: 'Fatiga estructural o falla del accionamiento.',
      inspectionPoints: ['Soldaduras', 'Ruedas y rieles', 'Frenos'],
      considerations: 'La exposición al calor acelera la degradación.',
      processConsequence: 'Grúa no disponible.',
    },
  ],
  specifications: [
    { label: 'Número de grúas de ollas', value: '2', classification: 'CONFIGURABLE' },
    { label: 'Capacidad', value: '250 t principal / 63 t auxiliar', classification: 'CONFIGURABLE' },
    { label: 'Diseño de seguridad', value: 'Doble sistema de frenos y finales de carrera redundantes', classification: 'CONFIGURABLE' },
    { label: 'Claro, altura de izaje, velocidades', value: 'Deben confirmarse con los datos del OEM de la grúa', classification: 'PLANT_SPECIFIC' },
  ],
  references: [
    'FT-ACE-001 v0.3 Ficha técnica de Acería (configuración de referencia, borrador para validación)',
    'Práctica general de la industria para grúas viajeras de metal líquido (verificar normas aplicables con SSO)',
  ],
};
