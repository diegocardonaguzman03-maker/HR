import type { EquipmentData } from '../../types/equipment';

/**
 * Guía de la barra / segmentos (CC1).
 * Configuración de referencia: FT-ACE-001 v0.3 §4 (vertical-curva, radio 9.5 m, longitud
 * metalúrgica ≈ 32 m, 14 segmentos, abertura de rodillos según tabla de conicidad ±0.5 mm, barra
 * falsa de cadena insertada por abajo). CONFIGURABLE, no verificado.
 */
export const segments: EquipmentData = {
  id: 'segments',
  name: 'Guía de la barra y segmentos de rodillos',
  shortName: 'Segmentos',
  category: 'casting',
  processStages: ['SHELL_FORMATION', 'SECONDARY_COOLING', 'SOLIDIFICATION', 'STRAIGHTENING', 'FINAL_SOLIDIFICATION'],
  tooltip: 'Hileras de rodillos que soportan, doblan, extraen y enderezan la barra mientras solidifica.',
  description:
    'Debajo del molde, la barra todavía tiene el núcleo líquido. La guía de la barra es una serie de segmentos de rodillos que soportan la costra delgada contra la presión interna del líquido, guían la barra por la trayectoria curva, la extraen y la enderezan hasta la horizontal.',
  purpose:
    'Soportar la costra para que no se abombe, mantener la geometría de la barra dentro de tolerancia, extraerla a la velocidad de colada fijada y enderezarla sin agrietarla, hasta la solidificación completa.',
  howItWorks: [
    'Justo debajo del molde, una zona vertical y el segmento de doblado soportan la costra delgada con rodillos muy juntos y doblan la barra poco a poco hasta el radio de la máquina (9.5 m en la configuración de referencia).',
    'Los segmentos curvos siguen el radio. Cada segmento es un bastidor con rodillos superiores e inferiores. La distancia entre ellos (abertura de rodillos) se ajusta con una tabla de conicidad que sigue la contracción térmica de la barra; la tolerancia en la configuración de referencia es ±0.5 mm.',
    'Algunos rodillos son motrices. Sus motores jalan la barra a la velocidad de colada fijada. En el arranque, una barra falsa de cadena insertada por abajo cierra el molde; el primer acero solidifica sobre su cabeza y los motores jalan juntas la barra falsa y la barra nueva hasta que la barra falsa se desconecta y se estaciona.',
    'En la enderezadora la barra pasa del radio a la horizontal. El enderezado deforma la superficie; si ocurre donde el acero tiene baja ductilidad (un rango de temperatura que depende del grado), se pueden abrir grietas transversales.',
    'El núcleo líquido se adelgaza a lo largo de la máquina. El punto donde el centro termina de solidificar es la longitud metalúrgica (≈ 32 m en la configuración de referencia). Debe quedar dentro de la longitud soportada; si no, la barra sin soporte puede abombarse y generar defectos internos.',
  ],
  inputs: ['Barra que sale del molde (costra delgada, núcleo líquido)', 'Aspersión del enfriamiento secundario', 'Energía para los motores', 'Agua de enfriamiento y lubricación de rodillos'],
  outputs: ['Barra enderezada, totalmente solidificada (o en solidificación), a velocidad de colada hacia el oxicorte', 'Señales de abertura de rodillos y de carga de motores'],
  components: [
    {
      id: 'benderSegment',
      name: 'Rodillos de pie y segmento de doblado',
      function: 'Soportar la costra más delgada justo debajo del molde y doblar la barra hasta el radio de la máquina.',
      failureModes: ['Desalineación con el molde', 'Rodillos trabados', 'Boquillas de aspersión tapadas en esta zona crítica'],
      inspectionPoints: ['Alineación molde–rodillos de pie–segmento de doblado (con calibrador)', 'Giro de rodillos', 'Patrón de aspersión'],
      maintenanceConsiderations: ['La alineación con el molde es crítica porque aquí la costra es más delgada.'],
      processConsequence: 'Desalineación o abombamiento aquí → ondas en el nivel del molde, grietas, perforación (breakout).',
    },
    {
      id: 'segments',
      name: 'Segmentos curvos y horizontales (14)',
      function: 'Bastidores de rodillos intercambiables que soportan y guían la barra a lo largo de la máquina.',
      failureModes: ['Abertura de rodillos fuera de tolerancia', 'Pérdida de sujeción hidráulica', 'Deformación estructural por calor'],
      inspectionPoints: ['Medición de abertura de rodillos (medidor de abertura / fuera de línea)', 'Estado de los cilindros hidráulicos', 'Conexiones de agua y lubricación'],
      maintenanceConsiderations: ['El cambio de segmentos y la alineación fuera de línea siguen los criterios del fabricante [Validar con OEM].'],
      processConsequence: 'Abertura incorrecta → abombamiento, grietas internas, segregación central.',
    },
    {
      id: 'rolls',
      name: 'Rodillos y rodamientos',
      function: 'Elementos de contacto que soportan la barra; enfriados internamente con agua.',
      failureModes: ['Rodillos trabados o pegados', 'Rodillos flexionados', 'Desgaste / agrietamiento de la superficie', 'Falla de rodamientos'],
      inspectionPoints: ['Giro libre', 'Rectitud / cabeceo (runout)', 'Superficie del rodillo', 'Temperatura y lubricación de rodamientos'],
      maintenanceConsiderations: ['Un rodillo pegado marca el planchón y deja de dar soporte.'],
      processConsequence: 'Rayas superficiales, abombamiento entre rodillos, grietas internas.',
    },
    {
      id: 'drives',
      name: 'Motores de extracción',
      function: 'Motores y reductores en los rodillos motrices que jalan la barra a la velocidad de colada fijada.',
      failureModes: ['Falla de motor / reductor', 'Desbalance de carga entre motores', 'Error en el control de velocidad'],
      inspectionPoints: ['Balance de corriente de motores', 'Retroalimentación de velocidad', 'Estado de reductores'],
      maintenanceConsiderations: ['La estabilidad de la velocidad importa porque los cambios de velocidad alteran el nivel del molde.'],
      processConsequence: 'Variaciones de velocidad → variación de nivel y defectos de calidad; pérdida de motores → paro forzado.',
    },
    {
      id: 'straightener',
      name: 'Enderezadora',
      function: 'Endereza la barra del arco a la horizontal, en uno o varios puntos.',
      failureModes: ['Concentración excesiva de deformación', 'Error de abertura de rodillos en la zona de enderezado'],
      inspectionPoints: ['Abertura de rodillos', 'Temperatura superficial de la barra en la enderezadora'],
      maintenanceConsiderations: ['La temperatura superficial en el enderezado debe evitar el rango de baja ductilidad propio de cada grado.'],
      processConsequence: 'Enderezar en el rango de baja ductilidad → grietas transversales y grietas de esquina.',
    },
    {
      id: 'dummyBar',
      name: 'Barra falsa de cadena',
      function: 'Tapa el fondo del molde en el arranque y extrae los primeros metros de la barra; se inserta por abajo.',
      failureModes: ['Cabeza dañada / mal sellado', 'Desgaste de eslabones de la cadena', 'Falla al desconectar'],
      inspectionPoints: ['Estado de la cabeza y del empaque', 'Eslabones y pernos', 'Función de desconexión'],
      maintenanceConsiderations: ['El sellado del molde con la cabeza de la barra falsa es clave para un arranque seguro.'],
      processConsequence: 'Perforación (breakout) en el arranque o arranque fallido.',
    },
    {
      id: 'frame',
      name: 'Estructura de la máquina y cimentación',
      function: 'Estructura que mantiene los segmentos en el radio y la alineación correctos.',
      failureModes: ['Deformación térmica', 'Movimiento de la cimentación'],
      inspectionPoints: ['Levantamiento periódico de radio y alineación', 'Grietas estructurales'],
      maintenanceConsiderations: ['El levantamiento del radio requiere medición especializada.'],
      processConsequence: 'Desalineación general → grietas internas y abombamiento recurrentes.',
    },
  ],
  processVariables: [
    { key: 'cc.castingSpeed', name: 'Velocidad de colada', unit: 'm/min', role: 'Velocidad de extracción fijada por los motores; define dónde termina la solidificación.', trainingRange: '0.8–1.6 m/min (nominal 1.2)', classification: 'CONFIGURABLE' },
    { key: 'cc.metallurgicalLength', name: 'Longitud metalúrgica', unit: 'm', role: 'Distancia del menisco al punto de solidificación completa; debe quedar dentro de la longitud soportada. Con e = K·√t: L = v·(h/2 / K)².', trainingRange: '≈ 32 m a 1.2 m/min (K = 22) — DATO SIMULADO DE CAPACITACIÓN', classification: 'ASSUMPTION' },
    { key: 'cc.solidificationProgress', name: 'Avance de la solidificación', unit: '%', role: 'Espesor de costra ×2 / espesor del planchón en una posición de la barra.', trainingRange: '0–100 % — DATO SIMULADO DE CAPACITACIÓN', classification: 'ASSUMPTION' },
    { key: 'cc.surfaceTemp', name: 'Temperatura superficial de la barra', unit: '°C', role: 'Controla la ductilidad durante el enderezado y la tendencia al abombamiento.', trainingRange: '≈ 900–1,100 °C a lo largo de la barra — DATO SIMULADO DE CAPACITACIÓN', classification: 'ASSUMPTION' },
    { key: 'segments.rollGap', name: 'Desviación de abertura de rodillos', unit: 'mm', role: 'Diferencia entre la abertura real y la de la tabla de conicidad.', trainingRange: '±0.5 mm', classification: 'CONFIGURABLE' },
    { key: 'segments.drivesLoad', name: 'Carga de motores de extracción', unit: '%', role: 'Una carga alta puede indicar abombamiento, un rodillo pegado o barra sólida en una abertura estrecha.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Abombamiento entre rodillos', consequence: 'La costra se abomba por la presión ferrostática; causa grietas internas, segregación y ondas en el nivel del molde.', typicalResponse: 'Revisar abertura y estado de rodillos, aspersión en la zona y velocidad de colada contra enfriamiento.' },
    { event: 'Rodillos desalineados / abertura fuera de tolerancia', consequence: 'Grietas internas e intermedias (midway); segregación central.', typicalResponse: 'Medir la abertura; cambio de segmento según la planeación de mantenimiento.' },
    { event: 'Grietas transversales en la enderezadora', consequence: 'Grietas superficiales / de esquina, sobre todo en grados microaleados o peritécticos.', typicalResponse: 'Revisar el enfriamiento secundario para sacar la temperatura superficial del rango de baja ductilidad; revisar la profundidad de marcas de oscilación.' },
    { event: 'Longitud metalúrgica fuera de la zona soportada', consequence: 'Núcleo líquido sin soporte → abombamiento, grietas internas, posible perforación tardía en el oxicorte.', typicalResponse: 'Bajar la velocidad de colada o aumentar el enfriamiento dentro de la práctica aprobada.' },
    { event: 'Falla de la barra falsa en el arranque', consequence: 'Perforación (breakout) en el arranque o arranque abortado.', typicalResponse: 'Revisiones previas al arranque de cabeza y empaque de la barra falsa; abortar el arranque según la práctica de la planta.' },
    { event: 'Rodillo pegado / trabado', consequence: 'Marcas en la superficie, pérdida de soporte, sobrecarga de motores.', typicalResponse: 'Identificarlo por la carga de motores / inspección; cambiarlo en la siguiente oportunidad.' },
  ],
  impact: {
    safety: 'Una perforación o falla por abombamiento dentro de la máquina libera acero líquido; motores y segmentos son maquinaria pesada en movimiento con energía hidráulica almacenada.',
    quality: 'La precisión de la abertura de rodillos, el soporte y las condiciones de enderezado definen la calidad interna (grietas, segregación) y algunas grietas superficiales.',
    reliability: 'El estado de rodillos y segmentos es el principal factor de confiabilidad mecánica de una máquina de planchón.',
    productivity: 'La longitud soportada y la capacidad de enfriamiento fijan la velocidad de colada máxima segura.',
  },
  qualityImpact: [
    {
      variable: 'Abertura / alineación de rodillos',
      mechanism: 'Las grietas internas y la segregación central vienen de la deformación en el frente de solidificación. La deformación viene del abombamiento (depende del espesor de costra, paso entre rodillos, temperatura superficial y enfriamiento), de la desalineación y del enderezado. El sobrecalentamiento y la velocidad de colada cambian dónde está débil el frente.',
      possibleDefects: ['Grietas internas (intermedias / midway)', 'Segregación central', 'Porosidad central'],
    },
    {
      variable: 'Temperatura superficial en la enderezadora',
      mechanism: 'El acero tiene un rango de baja ductilidad cuya posición depende de la química (C, Nb, V, Ti, N, Al). Se combinan la intensidad del enfriamiento secundario, la velocidad de colada y la profundidad de marcas de oscilación: marcas profundas + deformación + baja ductilidad → grietas transversales.',
      possibleDefects: ['Grietas transversales superficiales', 'Grietas de esquina'],
    },
    {
      variable: 'cc.metallurgicalLength',
      mechanism: 'La posición de la solidificación final depende de la velocidad, el sobrecalentamiento, la sección y el enfriamiento. Si la última bolsa de líquido cierra donde el soporte o la reducción suave (soft reduction, si existe) no son adecuados, el líquido rico en soluto es succionado al centro.',
      possibleDefects: ['Segregación central', 'Porosidad central / rechupe'],
    },
  ],
  safetyHazards: [
    { category: 'molten-metal', description: 'Núcleo líquido dentro de la barra; riesgo de perforación (breakout).' },
    { category: 'moving-machinery', description: 'Rodillos, motores y barra falsa en movimiento.' },
    { category: 'stored-energy', description: 'Sujeción hidráulica y peso de la barra.' },
    { category: 'pinch-points', description: 'Entre rodillos y barra / barra falsa.' },
    { category: 'high-temperature', description: 'Barra caliente y vapor en la cámara de aspersión.' },
  ],
  maintenancePoints: [
    { component: 'Segmentos', function: 'Soporte y guía', failureMode: 'Abertura fuera de tolerancia', inspectionPoints: ['Revisión de abertura de rodillos', 'Hidráulica', 'Conexiones'], considerations: 'Alineación fuera de línea según el fabricante (OEM).', processConsequence: 'Abombamiento, grietas internas.' },
    { component: 'Rodillos / rodamientos', function: 'Soporte por contacto', failureMode: 'Trabado / desgaste', inspectionPoints: ['Giro', 'Cabeceo (runout)', 'Lubricación'], considerations: 'Los rodillos pegados son fuente común de defectos.', processConsequence: 'Marcas, pérdida de soporte.' },
    { component: 'Barra falsa', function: 'Arranque', failureMode: 'Cabeza dañada / falla al desconectar', inspectionPoints: ['Cabeza', 'Eslabones', 'Desconexión'], considerations: 'Lista para el arranque.', processConsequence: 'Perforación en el arranque.' },
    { component: 'Accionamientos', function: 'Extracción', failureMode: 'Falla de motor/reductor', inspectionPoints: ['Balance de corriente', 'Retroalimentación de velocidad'], considerations: 'Estabilidad de la velocidad.', processConsequence: 'Variación de nivel / paro.' },
  ],
  specifications: [
    { label: 'Tipo de máquina', value: 'Vertical-curva, 1 barra', classification: 'CONFIGURABLE' },
    { label: 'Radio', value: '9.5 m', classification: 'CONFIGURABLE' },
    { label: 'Longitud metalúrgica', value: '≈ 32 m', classification: 'CONFIGURABLE' },
    { label: 'Segmentos', value: '14', classification: 'CONFIGURABLE' },
    { label: 'Tolerancia de abertura de rodillos', value: '±0.5 mm contra tabla de conicidad', classification: 'CONFIGURABLE' },
    { label: 'Barra falsa', value: 'De cadena, inserción por abajo', classification: 'CONFIGURABLE' },
    { label: 'Paso entre rodillos, diámetros, rodillos motrices, reducción suave', value: 'Según diseño del fabricante (OEM)', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (configuración de referencia)', 'docs/assumptions/caster.md', 'Literatura general sobre guía de la barra y solidificación'],
};
