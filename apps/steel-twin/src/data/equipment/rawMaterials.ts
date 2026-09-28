import type { EquipmentData } from '../../types/equipment';

/**
 * Manejo de DRI, fundentes y retornos internos del HAE (decisión D-010: sin chatarra comprada).
 * Interfaces de CV-GASM-001 v0.1 y FT-ACE-001 v0.4 (borradores, no validados en planta).
 * Todos los valores numéricos son DATOS SIMULADOS DE CAPACITACIÓN / valores de referencia.
 */
export const rawMaterials: EquipmentData = {
  id: 'rawMaterials',
  name: 'Manejo de DRI, Fundentes y Retornos Internos',
  shortName: 'Silos de DRI',
  category: 'raw-materials',
  processStages: ['RAW_MATERIALS', 'CHARGING', 'MELTING', 'REFINING'],
  tooltip: 'Recibe el DRI por banda desde HYL y Midrex, lo guarda en silos de día y lo manda al horno; también cal, dolomita y retornos internos.',
  description:
    'Es la interfaz entre la Reducción Directa y la Acería. Dos bandas transportadoras cerradas traen el DRI de las plantas HYL y Midrex a los silos de día del Horno de Arco Eléctrico (HAE). De ahí sale por banda a la tolva de pesaje de la bóveda y entra en continuo por el 5.º agujero. También maneja los fundentes (cal y dolomita) y los retornos internos (despuntes, rechazos y derrames), que son como máximo el 5 % de la carga.',
  purpose:
    'Asegurar que el horno reciba DRI suficiente, seco y dentro de especificación (metalización, carbono, finos) al ritmo que pide la potencia del arco, sin que se detenga la colada ni se reoxide el material.',
  howItWorks: [
    'GASM no compra chatarra: el hierro viene del mineral propio. La Peletizadora hace pelet y las plantas HYL y Midrex lo reducen con gas a DRI (hierro metálico sólido, ≈ 93 % de metalización).',
    'Cada planta de reducción entrega su DRI por una banda cerrada directa a un silo de día. Las bandas llevan tapas y pasillos de inspección. En silos y transferencias se vigilan la temperatura y los gases, porque el DRI húmedo o caliente se reoxida, se calienta solo y puede generar H₂.',
    'Desde los silos, alimentadores de pesaje dosifican la mezcla HYL/Midrex a la banda de la bóveda. El DRI de HYL trae más carbono que el de Midrex: la mezcla fija el carbono que entra al horno y cuánto carbono hay que inyectar.',
    'La tasa de alimentación sigue a la potencia activa (≈ 30–35 kg/min por MW, ≈ 3.5–4.3 t/min [Supuesto]). Si se alimenta de más se forman "icebergs" de DRI sin fundir; si se alimenta de menos se sobrecalienta el baño.',
    'Los retornos internos (despuntes de colada continua, rechazos y derrames solidificados) se juntan en una bahía cubierta y se cargan de vez en cuando con una canasta pequeña sobre el pie líquido. Nunca se cargan mojados.',
    'La cal y la dolomita se dosifican desde tolvas junto con el DRI para formar la escoria básica y saturada de MgO. Con DRI hay más ganga (SiO₂ + Al₂O₃), por eso se necesita más cal que con chatarra.',
  ],
  inputs: [
    'DRI de la planta HYL por banda directa',
    'DRI de la planta Midrex por banda directa',
    'Cal viva y cal dolomítica',
    'Retornos internos: despuntes, rechazos y derrames (≤ 5 %)',
    'Plan de colada y grado de acero',
  ],
  outputs: [
    'Flujo continuo de DRI pesado por el 5.º agujero del HAE',
    'Adiciones dosificadas de fundentes',
    'Canasta ocasional de retornos internos',
    'Registros de peso, metalización y carbono de la carga',
  ],
  components: [
    {
      id: 'driBelts',
      name: 'Bandas de DRI desde HYL y Midrex',
      function: 'Bandas cerradas que traen el DRI de cada planta de reducción directa a su silo de día.',
      failureModes: ['Desalineación o rotura de la banda', 'Derrame de DRI en transferencias', 'Agua de lluvia o de lavado que entra a la banda'],
      inspectionPoints: ['Alineación y tensión', 'Estado de tapas y sellos', 'Paro de emergencia por cable (prueba)', 'Temperatura del DRI en la banda'],
      maintenanceConsiderations: ['Solo con la banda bloqueada (LOTO) y la energía cero verificada; atrapamiento en poleas y rodillos'],
      processConsequence: 'Si se para la banda, el silo de día se vacía y el horno tiene que bajar potencia o detenerse.',
    },
    {
      id: 'daySilos',
      name: 'Silos de Día de DRI',
      function: 'Guardan unas horas de DRI junto al horno y entregan la mezcla HYL/Midrex a la banda de la bóveda.',
      failureModes: ['Puenteo del material', 'Calentamiento o reoxidación del DRI', 'Falla del medidor de nivel'],
      inspectionPoints: ['Nivel y temperatura por zona', 'Gases (CO, H₂) y O₂ en la parte alta', 'Estado de la inertización con N₂ [Validar con OEM]'],
      maintenanceConsiderations: ['El silo es un espacio confinado con posible atmósfera pobre en O₂: solo con permiso y medición de gases'],
      processConsequence: 'Un silo con DRI caliente o reoxidado obliga a vaciarlo por la vía de rechazo y reduce la metalización que llega al horno.',
    },
    {
      id: 'conveyor',
      name: 'Banda de la Bóveda y Tolva de Pesaje',
      function: 'Pesa y lleva el DRI y los fundentes hasta el 5.º agujero de la bóveda.',
      failureModes: ['Tasa fuera de consigna', 'Bloqueo del chute del 5.º agujero', 'Falla de báscula'],
      inspectionPoints: ['Tasa real contra potencia activa', 'Calibración de la báscula', 'Estado del chute'],
      maintenanceConsiderations: ['Intervenciones en la bóveda solo con el horno sin tensión y bloqueado'],
      processConsequence: 'Una tasa mal ajustada forma icebergs de DRI o sobrecalienta el baño.',
    },
    {
      id: 'fluxBins',
      name: 'Tolvas de Fundentes',
      function: 'Almacenan y dosifican cal y dolomita para la escoria espumosa.',
      failureModes: ['Material húmedo o fino', 'Alimentador trabado'],
      inspectionPoints: ['Humedad y tamaño de la cal', 'Funcionamiento del alimentador de pesaje'],
      maintenanceConsiderations: ['Polvo de cal: irritante; usar respirador y lentes'],
      processConsequence: 'Sin cal suficiente la escoria no espuma bien y ataca el refractario.',
    },
    {
      id: 'returnsBay',
      name: 'Bahía de Retornos Internos',
      function: 'Junta despuntes, rechazos y derrames solidificados de la propia Acería para regresarlos al horno.',
      failureModes: ['Retornos mojados', 'Piezas demasiado grandes para la canasta'],
      inspectionPoints: ['Bahía techada y seca', 'Tamaño de las piezas'],
      maintenanceConsiderations: ['Retornos solo de la propia planta: no se reciben materiales externos'],
      processConsequence: 'Un retorno mojado cargado sobre el pie líquido puede causar una explosión.',
    },
    {
      id: 'returnsBucket',
      name: 'Canasta de Retornos',
      function: 'Carga ocasional de retornos internos sobre el pie líquido.',
      failureModes: ['Mecanismo de apertura trabado', 'Sobrecarga'],
      inspectionPoints: ['Mecanismo de apertura', 'Peso de la carga'],
      maintenanceConsiderations: ['Carga suspendida: nadie bajo la canasta'],
      processConsequence: 'Una canasta mal cargada daña la solera o los electrodos.',
    },
  ],
  processVariables: [
    { key: 'rd.metallization', name: 'Metalización del DRI', unit: '%', role: 'Porcentaje del hierro que ya está metálico. Si baja, sube la energía y el carbono que necesita el horno.', trainingRange: '≥ 92–93 % [Supuesto]', classification: 'CONFIGURABLE' },
    { key: 'rd.carbon', name: 'Carbono de la mezcla de DRI', unit: '%', role: 'Carbono que trae el DRI; HYL aporta más que Midrex. Define la inyección de carbono del horno.', trainingRange: 'HYL 3.0–4.5 % · Midrex 1.5–2.5 % [Supuesto]', classification: 'CONFIGURABLE' },
    { key: 'rd.beltRate', name: 'Flujo total de DRI por bandas', unit: 't/h', role: 'Lo que entregan HYL y Midrex juntas; debe cubrir el consumo de los dos hornos.', trainingRange: '≈ 300–320 t/h [Supuesto]', classification: 'ASSUMPTION' },
    { key: 'eaf.driFeedRate', name: 'Tasa de alimentación al HAE', unit: 't/min', role: 'Debe seguir a la potencia activa para que el DRI se funda al llegar.', trainingRange: '3.5–4.3 t/min [Supuesto]', classification: 'CONFIGURABLE' },
  ],
  whatCanGoWrong: [
    { event: 'Se para una banda de DRI', consequence: 'El silo de día baja y el horno tiene que reducir potencia.', typicalResponse: 'Avisar a Reducción Directa y al supervisor de hornos; usar la reserva del otro silo.' },
    { event: 'DRI caliente o reoxidado en el silo', consequence: 'Autocalentamiento, CO/H₂, menor metalización.', typicalResponse: 'Inertizar, vaciar por la vía de rechazo y avisar a SSO [Validar con OEM].' },
    { event: 'Agua en la banda o retornos mojados', consequence: 'Riesgo de explosión al contacto con el metal líquido.', typicalResponse: 'No cargar; separar el material y secarlo.' },
    { event: 'Alimentación mayor que la potencia', consequence: 'Icebergs de DRI sin fundir y ebullición violenta después.', typicalResponse: 'Bajar la tasa y recuperar sobrecalentamiento del baño.' },
  ],
  impact: {
    safety: 'Bandas (atrapamiento), silos (espacio confinado, bajo O₂, CO/H₂), DRI húmedo o caliente (explosión, autocalentamiento) y cargas suspendidas con la canasta de retornos.',
    quality: 'La metalización y la ganga del DRI definen el volumen de escoria, el carbono y los residuales muy bajos del acero (el DRI de mineral propio casi no trae Cu ni Sn).',
    reliability: 'Las bandas y los silos son el cuello de botella entre Reducción Directa y Acería: si fallan, se para el horno.',
    productivity: 'Una alimentación continua y estable mantiene el tiempo tap-to-tap y la energía por tonelada.',
  },
  qualityImpact: [
    { variable: 'rd.metallization', mechanism: 'Menos metalización significa más FeO por reducir en el horno: más energía, más carbono y más escoria.', possibleDefects: ['Tap-to-tap más largo', 'FeO alto en escoria'] },
    { variable: 'rd.carbon', mechanism: 'El carbono del DRI genera CO que espuma la escoria; una mezcla con poco carbono obliga a inyectar más.', possibleDefects: ['Escoria espumosa pobre', 'Mayor consumo de electrodo'] },
  ],
  safetyHazards: [
    { category: 'moving-machinery', description: 'Bandas transportadoras, poleas y rodillos.' },
    { category: 'gas', description: 'CO e H₂ por reoxidación del DRI; bajo O₂ si hay inertización con N₂.' },
    { category: 'water-molten-metal', description: 'DRI o retornos mojados que llegan al metal líquido.' },
    { category: 'suspended-loads', description: 'Canasta de retornos internos.' },
    { category: 'noise-dust', description: 'Polvo de DRI y de cal.' },
  ],
  maintenancePoints: [
    { component: 'driBelts', function: 'Traer el DRI de HYL y Midrex', failureMode: 'Rotura o desalineación', inspectionPoints: ['Alineación', 'Tapas', 'Paro por cable'], considerations: 'LOTO y energía cero antes de intervenir.', processConsequence: 'Paro del horno por falta de DRI.' },
    { component: 'daySilos', function: 'Almacén de día', failureMode: 'Puenteo o calentamiento', inspectionPoints: ['Temperatura', 'Gases', 'Nivel'], considerations: 'Espacio confinado con permiso.', processConsequence: 'Vaciado del silo y menor metalización.' },
  ],
  specifications: [
    { label: 'Carga metálica del HAE', value: '≈ 95–100 % DRI de pelet propio + retornos internos ≤ 5 %', classification: 'PLANT_SPECIFIC' },
    { label: 'Origen del DRI', value: 'Planta HYL (1.2 Mt/año) y planta Midrex (1.3 Mt/año)', classification: 'ASSUMPTION' },
    { label: 'Transporte', value: 'Bandas transportadoras cerradas directas a silos de día', classification: 'PLANT_SPECIFIC' },
    { label: 'Temperatura del DRI en banda', value: '≤ 80 °C [Supuesto]', classification: 'ASSUMPTION' },
    { label: 'Chatarra comprada', value: 'No se usa (decisión D-010)', classification: 'PLANT_SPECIFIC' },
  ],
  references: ['CV-GASM-001 Cadena de valor', 'FT-ACE-001 v0.4', 'MO-EAF-02 Recepción de DRI por bandas, silos de día y carga de retornos internos', 'MO-EAF-03 Alimentación continua de DRI'],
};
