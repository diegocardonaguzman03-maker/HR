import type { EquipmentData } from '../../types/equipment';

/**
 * Sistema de enfriamiento de la máquina de colada: primario (molde) + secundario (aspersión) + agua de emergencia.
 * Configuración de referencia: FT-ACE-001 v0.3 §4 (10 zonas aire-agua, agua específica 0.8–1.2 L/kg,
 * torre de agua de emergencia + bombas diésel, entrada automática ≤ 15 s). CONFIGURABLE, no verificado.
 */
export const coolingSystem: EquipmentData = {
  id: 'coolingSystem',
  name: 'Sistema de enfriamiento de la máquina de colada',
  shortName: 'Enfriamiento',
  category: 'cooling',
  processStages: ['SHELL_FORMATION', 'SECONDARY_COOLING', 'SOLIDIFICATION', 'STRAIGHTENING', 'FINAL_SOLIDIFICATION'],
  tooltip: 'Extrae el calor del molde y de la barra con agua y aspersión aire-agua, zona por zona.',
  description:
    'El sistema de enfriamiento de la máquina extrae el calor del acero en dos etapas: enfriamiento primario a través de las placas de cobre del molde, y enfriamiento secundario con agua o neblina aire-agua (air-mist) rociada directo sobre la superficie de la barra en varias zonas. Un suministro de agua de emergencia protege el molde y la máquina si se pierde el agua normal.',
  purpose:
    'Completar la solidificación dentro de la longitud soportada y controlar la temperatura superficial de la barra para evitar grietas, abombamiento y recalentamiento.',
  howItWorks: [
    'Enfriamiento primario: agua tratada en circuito cerrado pasa por los canales del molde y extrae el calor que forma la costra inicial. Se vigila con el flujo y el aumento de temperatura en cada cara.',
    'Enfriamiento secundario: debajo del molde la barra pasa por una cámara de aspersión. Las boquillas rocían agua, o neblina aire-agua, sobre las caras. La configuración de referencia tiene 10 zonas, cada una con su propio control de flujo.',
    'El agua de cada zona la calcula un modelo de enfriamiento según la velocidad de colada, el grado y la sección. Un indicador sencillo es el agua específica: litros de agua de aspersión por kilogramo de acero colado (0.8–1.2 L/kg en la configuración de referencia).',
    'El enfriamiento es intenso cerca del molde (costra delgada, necesita resistencia) y más suave más abajo. Demasiada agua causa grietas superficiales y después recalentamiento; muy poca causa abombamiento y una longitud metalúrgica más larga.',
    'Parte del agua se convierte en vapor, que se extrae con el sistema de extracción de vapor; así se mantiene la visibilidad y se evita condensación sobre los equipos.',
    'Si fallan las bombas o la energía, un sistema de agua de emergencia (torre elevada y bombas diésel en la configuración de referencia) alimenta de forma automática el molde y la aspersión crítica en ≤ 15 s, mientras se detiene la colada.',
  ],
  inputs: ['Agua primaria tratada', 'Agua de aspersión', 'Aire comprimido (boquillas aire-agua)', 'Velocidad de colada / grado para el modelo de enfriamiento'],
  outputs: ['Calor extraído de la barra', 'Vapor (a extracción)', 'Agua de retorno a tratamiento', 'Señales de flujo/presión/temperatura'],
  components: [
    {
      id: 'primaryWater',
      name: 'Circuito de agua primaria (molde)',
      function: 'Sistema de agua tratada en circuito cerrado que enfría las placas del molde.',
      failureModes: ['Falla de bomba', 'Ensuciamiento del intercambiador de calor', 'Química del agua fuera de especificación (incrustación)', 'Fugas'],
      inspectionPoints: ['Flujo y presión', 'Temperatura de entrada', 'Química del agua', 'Detección de fugas'],
      maintenanceConsiderations: ['Perder el agua primaria cerca del acero líquido es uno de los peligros más altos de la máquina de colada.'],
      processConsequence: 'Sobrecalentamiento del molde, perforación (breakout), riesgo de explosión por vapor.',
    },
    {
      id: 'sprayZones',
      name: 'Zonas de enfriamiento secundario (10)',
      function: 'Grupos de boquillas con control independiente a lo largo de la barra.',
      failureModes: ['Falla de válvula de control', 'Error del medidor de flujo', 'Ajuste incorrecto del modelo de la zona'],
      inspectionPoints: ['Flujo real contra flujo fijado por zona', 'Presión por zona', 'Versión y parámetros del modelo'],
      maintenanceConsiderations: ['Las tablas de zonas son específicas de cada grado [Validar con Ingeniería de Proceso].'],
      processConsequence: 'Enfriamiento incorrecto de la zona → grietas, abombamiento, cambio de la longitud metalúrgica.',
    },
    {
      id: 'nozzles',
      name: 'Boquillas de aspersión (aire-agua)',
      function: 'Atomizan el agua con aire para formar un patrón de aspersión uniforme sobre la barra.',
      failureModes: ['Taponamiento', 'Desgaste (cambio de patrón)', 'Desalineación', 'Boquilla rota'],
      inspectionPoints: ['Prueba de patrón de aspersión', 'Alineación de boquillas', 'Estado de filtros'],
      maintenanceConsiderations: ['Una sola boquilla tapada crea una franja caliente en la barra.'],
      processConsequence: 'Enfriamiento no uniforme → franjas longitudinales, grietas, abombamiento local.',
    },
    {
      id: 'sprayChamber',
      name: 'Cámara de aspersión',
      function: 'Encierro alrededor de la barra que contiene el agua y el vapor.',
      failureModes: ['Acumulación de cascarilla', 'Daño en puertas / sellos'],
      inspectionPoints: ['Acumulación de cascarilla', 'Drenaje'],
      maintenanceConsiderations: ['Ambiente confinado, caliente y lleno de vapor.'],
      processConsequence: 'El drenaje tapado o la cascarilla interfieren con la aspersión y los rodillos.',
    },
    {
      id: 'emergencyWater',
      name: 'Sistema de agua de emergencia',
      function: 'Tanque elevado y bombas diésel que suministran agua de forma automática al perder energía o bombeo.',
      failureModes: ['Nivel bajo del tanque', 'La bomba diésel no arranca', 'Falla de la válvula automática'],
      inspectionPoints: ['Nivel del tanque', 'Registros de pruebas funcionales', 'Accionamiento de válvulas'],
      maintenanceConsiderations: ['Sistema crítico de seguridad; el régimen de pruebas es propio de cada planta (no se define aquí).'],
      processConsequence: 'Sin agua de emergencia, una pérdida de energía puede provocar daño al molde, perforación y explosión por vapor.',
    },
    {
      id: 'steamExhaust',
      name: 'Extracción de vapor',
      function: 'Ventiladores y ductos que extraen el vapor de la cámara de aspersión.',
      failureModes: ['Falla del ventilador', 'Ducto obstruido'],
      inspectionPoints: ['Operación del ventilador', 'Tiro / presión', 'Estado de ductos'],
      maintenanceConsiderations: ['Una mala extracción reduce la visibilidad en la máquina de colada.'],
      processConsequence: 'Condensación, corrosión, poca visibilidad para los operadores.',
    },
  ],
  processVariables: [
    { key: 'cc.specificWater', name: 'Agua específica', unit: 'L/kg', role: 'Intensidad global del enfriamiento secundario; más alta = enfriamiento más fuerte.', trainingRange: '0.8–1.2 L/kg', classification: 'CONFIGURABLE' },
    { key: 'cc.surfaceTemp', name: 'Temperatura superficial de la barra', unit: '°C', role: 'Resultado del enfriamiento; el objetivo evita el recalentamiento y el rango de baja ductilidad.', trainingRange: '≈ 900–1,100 °C — DATO SIMULADO DE CAPACITACIÓN', classification: 'ASSUMPTION' },
    { key: 'mold.waterDeltaT', name: 'ΔT del agua del molde', unit: '°C', role: 'Indicador de extracción de calor del enfriamiento primario.', trainingRange: '6–9 °C; alarma > 11 °C', classification: 'CONFIGURABLE' },
    { key: 'cc.metallurgicalLength', name: 'Longitud metalúrgica', unit: 'm', role: 'Cambia con la intensidad de enfriamiento y la velocidad.', trainingRange: '≈ 32 m a 1.2 m/min — DATO SIMULADO DE CAPACITACIÓN', classification: 'ASSUMPTION' },
    { key: 'cooling.zoneFlow', name: 'Flujo de aspersión por zona', unit: 'L/min', role: 'Flujo real de cada zona contra el punto de ajuste del modelo.', classification: 'PLANT_SPECIFIC' },
    { key: 'cooling.emergencyResponse', name: 'Tiempo de entrada del agua de emergencia', unit: 's', role: 'Tiempo para establecer el flujo de emergencia después de perder el suministro normal.', trainingRange: '≤ 15 s', classification: 'CONFIGURABLE' },
  ],
  whatCanGoWrong: [
    { event: 'Pérdida de agua primaria / energía', consequence: 'El molde se sobrecalienta rápido; peligro de perforación y explosión.', typicalResponse: 'El enclavamiento detiene la colada; el agua de emergencia entra automáticamente; respuesta en el área según el procedimiento de la planta.' },
    { event: 'Boquillas tapadas', consequence: 'Franjas calientes, abombamiento local, grietas longitudinales o internas.', typicalResponse: 'Revisión del patrón de aspersión; mantenimiento de filtros; cambio de boquillas.' },
    { event: 'Sobreenfriamiento', consequence: 'Superficie en el rango de baja ductilidad en la enderezadora → grietas transversales/de esquina; esfuerzos por recalentamiento posterior.', typicalResponse: 'Revisar las tablas de zonas para el grado y la velocidad.' },
    { event: 'Enfriamiento insuficiente', consequence: 'Costra delgada, abombamiento, longitud metalúrgica fuera del soporte.', typicalResponse: 'Verificar flujos; bajar la velocidad dentro de la práctica.' },
    { event: 'El modelo de enfriamiento no sigue los cambios de velocidad', consequence: 'Sobreenfriamiento o enfriamiento insuficiente transitorio durante cambios de velocidad y cambios de olla.', typicalResponse: 'Verificar el modelo dinámico y el seguimiento de las porciones de la barra.' },
  ],
  impact: {
    safety: 'Sistemas de agua junto al acero líquido; el agua de emergencia es una barrera crítica de seguridad.',
    quality: 'El enfriamiento secundario influye fuerte en grietas superficiales, grietas internas y segregación.',
    reliability: 'El estado de las boquillas y la calidad del agua generan defectos recurrentes.',
    productivity: 'La capacidad de enfriamiento (junto con la longitud soportada) limita la velocidad de colada máxima.',
  },
  qualityImpact: [
    {
      variable: 'cc.specificWater',
      mechanism: 'La intensidad de enfriamiento interactúa con la velocidad de colada, el sobrecalentamiento y la química del grado: cambia la temperatura superficial en la enderezadora (ductilidad) y la longitud metalúrgica (segregación). El estado de las boquillas decide si la intensidad promedio realmente es uniforme.',
      possibleDefects: ['Grietas transversales / de esquina', 'Grietas internas por recalentamiento', 'Abombamiento (bulging)', 'Segregación central'],
    },
  ],
  safetyHazards: [
    { category: 'water-molten-metal', description: 'Sistemas de agua cerca del acero líquido; posibilidad de explosión por vapor.' },
    { category: 'high-temperature', description: 'Vapor y barra caliente.' },
    { category: 'hydraulic', description: 'Líneas de agua a alta presión.' },
    { category: 'noise-dust', description: 'Vapor, ruido de la aspersión y de los ventiladores.' },
  ],
  maintenancePoints: [
    { component: 'Boquillas', function: 'Aspersión uniforme', failureMode: 'Taponamiento / desgaste', inspectionPoints: ['Prueba de patrón', 'Alineación', 'Filtros'], considerations: 'La calidad del agua provoca el taponamiento.', processConsequence: 'Defectos por enfriamiento no uniforme.' },
    { component: 'Agua de emergencia', function: 'Enfriamiento de respaldo', failureMode: 'No arranca', inspectionPoints: ['Nivel del tanque', 'Registros de pruebas funcionales'], considerations: 'Crítico de seguridad; régimen de pruebas definido por la planta.', processConsequence: 'Evento grave al perder la energía.' },
    { component: 'Circuito de agua primaria', function: 'Enfriamiento del molde', failureMode: 'Bomba/ensuciamiento/fuga', inspectionPoints: ['Flujo', 'Química', 'Temperaturas'], considerations: 'Control de la química del agua.', processConsequence: 'Daño al molde, perforación (breakout).' },
  ],
  specifications: [
    { label: 'Enfriamiento secundario', value: '10 zonas aire-agua (air-mist)', classification: 'CONFIGURABLE' },
    { label: 'Agua específica', value: '0.8–1.2 L/kg', classification: 'CONFIGURABLE' },
    { label: 'Agua de emergencia', value: 'Torre elevada + bombas diésel; entrada automática ≤ 15 s', classification: 'CONFIGURABLE' },
    { label: 'Tablas de zonas / modelo de enfriamiento', value: 'Por grado, según el modelo de la planta', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (configuración de referencia)', 'docs/assumptions/caster.md', 'Literatura general sobre enfriamiento secundario'],
};
