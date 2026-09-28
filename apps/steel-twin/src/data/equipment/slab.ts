import type { EquipmentData } from '../../types/equipment';

/**
 * Planchón (producto) y área de salida.
 * Configuración de referencia: FT-ACE-001 v0.3 §4 (230 mm × 900–1,650 mm × 8–11 m).
 * La mesa de salida, la transferencia lateral y el arreglo del patio son ASSUMPTION / PLANT_SPECIFIC.
 */
export const slab: EquipmentData = {
  id: 'slab',
  name: 'Planchón y área de salida',
  shortName: 'Planchón',
  category: 'product',
  processStages: ['CUTTING', 'COMPLETE'],
  tooltip: 'El producto final: un planchón de acero sólido, identificado y enviado al patio de planchones.',
  description:
    'El planchón es el producto de la máquina de colada: un bloque sólido de acero (230 mm de espesor, 900–1,650 mm de ancho y 8–11 m de largo en la configuración de referencia). Después del corte avanza por la mesa de salida, se identifica, se transfiere de lado y se almacena o se manda caliente al molino de laminación.',
  purpose:
    'Entregar al molino de laminación en caliente planchones identificados y trazables, con las dimensiones y la calidad correctas, y permitir inspección y acondicionamiento cuando se necesite.',
  howItWorks: [
    'Después del corte, los rodillos de la mesa de salida alejan el planchón del oxicorte a una velocidad mayor que la de colada, para abrir un espacio con la barra.',
    'Cada planchón se marca con su identificación (colada, secuencia, número de planchón). Esto lo liga con la química del acero, las condiciones de colada y cualquier evento de calidad registrado durante la colada.',
    'Una transferencia lateral (empujador o carro de transferencia) mueve los planchones de lado hacia camas de enfriamiento, estibas o directo al horno de recalentamiento (carga en caliente), según la logística de la planta.',
    'En el patio de planchones se estiban, se enfrían si hace falta y, cuando los eventos de calidad lo indican, se inspeccionan o se acondicionan (por ejemplo, escarpado) antes de laminar.',
  ],
  inputs: ['Planchón cortado que viene del oxicorte', 'Datos de identificación del sistema de seguimiento'],
  outputs: ['Planchón identificado en el patio o hacia el molino', 'Registros de calidad y trazabilidad'],
  components: [
    { id: 'runoutTable', name: 'Mesa de salida', function: 'Mesa de rodillos motrices que aleja los planchones cortados del oxicorte.', failureModes: ['Rodillos trabados', 'Falla de motor'], inspectionPoints: ['Giro de rodillos', 'Funcionamiento de motores'], maintenanceConsiderations: ['Contacto con planchón caliente; enfriamiento de rodillos.'], processConsequence: 'No se pueden desalojar los planchones → hay que bajar la velocidad o detener la colada.' },
    { id: 'slabId', name: 'Identificación del planchón', function: 'Marcado y seguimiento que asignan a cada planchón su identidad.', failureModes: ['Marcas ilegibles', 'Datos de seguimiento que no coinciden'], inspectionPoints: ['Legibilidad de la marca', 'Datos de seguimiento contra planchón físico'], maintenanceConsiderations: ['La trazabilidad es la base de la liberación de calidad.'], processConsequence: 'Asignación equivocada de planchones, reclamaciones de calidad.' },
    { id: 'crossTransfer', name: 'Transferencia lateral', function: 'Empujadores / carros de transferencia que mueven los planchones de lado fuera de la mesa de salida.', failureModes: ['Falla del empujador', 'Desalineación'], inspectionPoints: ['Carrera y alineación', 'Hidráulica'], maintenanceConsiderations: ['Cargas pesadas, puntos de atrapamiento.'], processConsequence: 'Congestión en la mesa de salida.' },
    { id: 'slabYard', name: 'Patio de planchones', function: 'Área de almacenamiento, enfriamiento, inspección y acondicionamiento antes de laminar.', failureModes: ['Estibas inestables', 'Grúa no disponible'], inspectionPoints: ['Estado de las estibas', 'Disponibilidad de grúas'], maintenanceConsiderations: ['El arreglo y la práctica de enfriamiento son propios de cada planta.'], processConsequence: 'Retrasos de logística; grietas por enfriamiento en grados sensibles si se enfrían mal.' },
  ],
  processVariables: [
    { key: 'cutter.slabLength', name: 'Longitud del planchón', unit: 'm', role: 'Longitud / peso pedidos para el molino.', trainingRange: '8–11 m', classification: 'CONFIGURABLE' },
    { key: 'slab.width', name: 'Ancho del planchón', unit: 'mm', role: 'Lo fijan las caras angostas del molde.', trainingRange: '900–1,650 mm', classification: 'CONFIGURABLE' },
    { key: 'slab.thickness', name: 'Espesor del planchón', unit: 'mm', role: 'Espesor de la sección del molde.', trainingRange: '230 mm', classification: 'CONFIGURABLE' },
    { key: 'slab.surfaceTemp', name: 'Temperatura superficial del planchón en la mesa de salida', unit: '°C', role: 'Importa para la carga en caliente y la práctica de enfriamiento.', classification: 'PLANT_SPECIFIC' },
  ],
  whatCanGoWrong: [
    { event: 'Error de identificación', consequence: 'Se pierde la trazabilidad; el planchón puede laminarse para la orden equivocada.', typicalResponse: 'Conciliar el planchón físico con los datos de seguimiento antes de liberarlo.' },
    { event: 'Defectos superficiales detectados (grietas, depresiones)', consequence: 'Acondicionamiento o degradación.', typicalResponse: 'Relacionarlos con eventos de colada (nivel, BOP, cambios de velocidad) para la causa raíz.' },
    { event: 'Defectos internos (segregación, grietas)', consequence: 'Degradación para aplicaciones exigentes.', typicalResponse: 'Muestreo (por ejemplo, impresión de azufre Baumann / macroataque) según el plan de calidad.' },
    { event: 'Congestión en la mesa de salida', consequence: 'La máquina de colada debe bajar la velocidad o detenerse.', typicalResponse: 'Coordinar la grúa del patio y la transferencia.' },
  ],
  impact: {
    safety: 'Planchones calientes y pesados; peligros por manejo con grúa y estibado.',
    quality: 'El planchón trae toda la historia de calidad de los procesos anteriores; la identificación lo liga con los datos.',
    reliability: 'La mesa de salida y la transferencia deben seguir el ritmo de la máquina de colada.',
    productivity: 'La carga en caliente reduce la energía de recalentamiento; el rendimiento depende de las pérdidas por despunte y acondicionamiento.',
  },
  qualityImpact: [
    { variable: 'Historial de colado del planchón', mechanism: 'La calidad del planchón es el resultado combinado de la química, el sobrecalentamiento, la estabilidad del nivel del molde, los cambios de velocidad de colada, el enfriamiento secundario, la oscilación, el polvo de molde y la alineación de rodillos. Ningún parámetro por sí solo explica un defecto; el seguimiento de eventos de colada ayuda a atribuir los defectos a sus causas.', possibleDefects: ['Grietas longitudinales / transversales', 'Inclusiones / astillas (slivers)', 'Segregación central', 'Depresiones', 'Porosidad / pinholes'] },
  ],
  safetyHazards: [
    { category: 'high-temperature', description: 'Planchones calientes que irradian calor.' },
    { category: 'suspended-loads', description: 'Manejo de planchones con grúa.' },
    { category: 'moving-machinery', description: 'Mesas de rodillos y equipos de transferencia.' },
    { category: 'pinch-points', description: 'Entre planchones, rodillos y empujadores.' },
  ],
  maintenancePoints: [
    { component: 'Rodillos de la mesa de salida', function: 'Transporte de planchones', failureMode: 'Trabado', inspectionPoints: ['Giro', 'Motores'], considerations: 'Servicio en caliente.', processConsequence: 'Congestión / paro de la máquina de colada.' },
    { component: 'Transferencia lateral', function: 'Transferencia lateral', failureMode: 'Falla hidráulica/mecánica', inspectionPoints: ['Carrera', 'Alineación'], considerations: 'Cargas pesadas.', processConsequence: 'Congestión en la mesa de salida.' },
  ],
  specifications: [
    { label: 'Sección', value: '230 mm × 900–1,650 mm', classification: 'CONFIGURABLE' },
    { label: 'Longitud', value: '8–11 m', classification: 'CONFIGURABLE' },
    { label: 'Arreglo de mesa de salida / patio, carga en caliente', value: 'Según la logística de la planta', classification: 'PLANT_SPECIFIC' },
    { label: 'Peso del planchón (230 × 1,650 × 11,000 mm, ρ ≈ 7.8 t/m³)', value: '≈ 32.6 t (máximo, calculado)', classification: 'ASSUMPTION' },
  ],
  references: ['FT-ACE-001 v0.3 §4 (configuración de referencia)', 'docs/assumptions/caster.md'],
};
