/**
 * Editable process configuration (section 4 of the brief).
 * Enable / disable optional operations here; the timeline, navigator,
 * guided mode and simulation are all derived from this list.
 */
import type { NavigatorGroup, ProcessStepConfig, SimState } from '../types/process';

export const NAVIGATOR_GROUPS: NavigatorGroup[] = [
  { id: 'raw', number: '01', label: 'Materia prima', timelineLabel: 'Materia prima' },
  { id: 'melting', number: '02', label: 'Fusión', timelineLabel: 'HAE' },
  { id: 'refining', number: '03', label: 'Afinación', timelineLabel: 'Afinación' },
  { id: 'tapping', number: '04', label: 'Vaciado', timelineLabel: 'Vaciado' },
  { id: 'secondary', number: '05', label: 'Metalurgia secundaria', timelineLabel: 'Horno olla' },
  { id: 'castingPrep', number: '06', label: 'Preparación de colada', timelineLabel: 'Olla · Distribuidor' },
  { id: 'mold', number: '07', label: 'Molde', timelineLabel: 'Molde' },
  { id: 'solidification', number: '08', label: 'Solidificación', timelineLabel: 'Barra' },
  { id: 'straightening', number: '09', label: 'Enderezado', timelineLabel: 'Enderezado' },
  { id: 'cutting', number: '10', label: 'Corte', timelineLabel: 'Corte' },
  { id: 'slab', number: '11', label: 'Planchón', timelineLabel: 'Planchón' },
];

/** Strand head position (m from meniscus) at start/end of each casting step. */
export const STRAND_RANGE: Partial<Record<SimState, [number, number]>> = {
  MOLD_FILL: [0.8, 0.8],
  SHELL_FORMATION: [0.8, 2],
  SECONDARY_COOLING: [2, 7],
  SOLIDIFICATION: [7, 14],
  STRAIGHTENING: [14, 18.5],
  FINAL_SOLIDIFICATION: [18.5, 34],
  CUTTING: [34, 46],
  COMPLETE: [46, 46],
};

export const PROCESS_STEPS: ProcessStepConfig[] = [
  {
    state: 'RAW_MATERIALS', title: 'Preparación de materia prima', navigatorGroup: 'raw', enabled: true, duration: 7,
    camera: 'rawMaterials', activeEquipment: ['rawMaterials'], materialStates: ['SOLID_RAW_MATERIAL'],
    whatHappens: 'La chatarra se clasifica y se carga en la canasta; el HRD (DRI) está en el silo; la cal y la dolomita están listas en las tolvas de fundentes.',
    why: 'La carga metálica y los fundentes definen cuánta energía se necesita y qué elementos residuales terminan en el acero.',
  },
  {
    state: 'CHARGING', title: 'Carga del horno', navigatorGroup: 'raw', enabled: true, duration: 8,
    camera: 'eaf', activeEquipment: ['crane', 'eaf'], materialStates: ['SOLID_RAW_MATERIAL'],
    whatHappens: 'La bóveda gira y se abre; la grúa vacía la canasta de chatarra dentro del horno, sobre el pie líquido.',
    why: 'Una carga controlada protege la solera del horno y forma la cama que los arcos van a fundir.',
  },
  {
    state: 'ARC_IGNITION', title: 'Encendido del arco', navigatorGroup: 'melting', enabled: true, duration: 6,
    camera: 'eaf', activeEquipment: ['eaf'], materialStates: ['SOLID_RAW_MATERIAL', 'PARTIALLY_MELTED'],
    whatHappens: 'La bóveda se cierra, bajan los tres electrodos de grafito y los arcos encienden sobre la chatarra: la energía eléctrica se convierte en calor.',
    why: 'Los arcos, a varios miles de grados, son la principal fuente de energía del horno de arco eléctrico.',
  },
  {
    state: 'MELTING', title: 'Fusión', navigatorGroup: 'melting', enabled: true, duration: 10,
    camera: 'eaf', activeEquipment: ['eaf'], materialStates: ['PARTIALLY_MELTED', 'LIQUID_STEEL'],
    whatHappens: 'Los electrodos perforan la chatarra; el baño crece mientras el HRD entra de forma continua por la bóveda y los quemadores y el oxígeno aportan energía química.',
    why: 'Toda la carga sólida debe convertirse en un baño líquido homogéneo antes de afinar.',
  },
  {
    state: 'REFINING', title: 'Afinación y escoria espumosa', navigatorGroup: 'refining', enabled: true, duration: 9,
    camera: 'eaf', activeEquipment: ['eaf'], materialStates: ['LIQUID_STEEL', 'REFINED_LIQUID_STEEL'],
    whatHappens: 'El oxígeno descarbura el baño; la inyección de carbón espuma la escoria, que cubre los arcos. El fósforo pasa a la escoria básica. La temperatura sube hasta la ventana de vaciado.',
    why: 'La afinación ajusta el carbono, elimina fósforo y alcanza la temperatura de vaciado mientras la escoria espumosa protege las paredes del horno.',
  },
  {
    state: 'TAPPING', title: 'Vaciado', navigatorGroup: 'tapping', enabled: true, duration: 8,
    camera: 'eaf', activeEquipment: ['eaf', 'ladle'], materialStates: ['REFINED_LIQUID_STEEL', 'LIQUID_IN_LADLE'],
    whatHappens: 'El horno se inclina hacia la piquera EBT; el acero cae a la olla precalentada mientras se agregan desoxidantes y ferroaleaciones. El horno regresa a tiempo para dejar dentro la escoria y el pie líquido.',
    why: 'Vaciar sin escoria protege la química y la limpieza del acero en los pasos siguientes.',
  },
  {
    state: 'SECONDARY_METALLURGY', title: 'Metalurgia secundaria (horno olla)', navigatorGroup: 'secondary', enabled: true, duration: 10,
    camera: 'secondary', activeEquipment: ['ladle', 'ladleFurnace'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'En el horno olla el acero se recalienta con arcos, se ajusta su química, se desulfura bajo una escoria básica, se agita con argón y se trata con alambre de calcio.',
    why: 'El horno olla fija la química final, la temperatura y el control de inclusiones que necesita la máquina de colada.',
  },
  {
    state: 'VACUUM_TREATMENT', title: 'Tratamiento al vacío (opcional)', navigatorGroup: 'secondary', enabled: false, optional: true, duration: 8,
    camera: 'secondary', activeEquipment: ['ladle'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'Desgasificado RH/VTD opcional; no forma parte de la configuración de referencia.',
    why: 'Se usa en grados que requieren hidrógeno, nitrógeno o carbono muy bajos.',
  },
  {
    state: 'TRANSFER', title: 'Traslado de la olla', navigatorGroup: 'castingPrep', enabled: true, duration: 8,
    camera: 'transfer', activeEquipment: ['crane', 'ladle'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'La grúa de colada levanta la olla llena por sus muñones y la lleva a la torreta de la máquina.',
    why: 'La colada debe llegar a tiempo y a la temperatura correcta para no romper la secuencia.',
  },
  {
    state: 'TURRET', title: 'Torreta de ollas', navigatorGroup: 'castingPrep', enabled: true, duration: 6,
    camera: 'caster', activeEquipment: ['turret', 'ladle'], materialStates: ['LIQUID_IN_LADLE'],
    whatHappens: 'La olla se coloca en el brazo de la torreta, se pesa y gira a posición de colada sobre el distribuidor.',
    why: 'La torreta permite cambiar de olla sin detener la máquina (colada en secuencia).',
  },
  {
    state: 'TUNDISH_FILL', title: 'Llenado del distribuidor', navigatorGroup: 'castingPrep', enabled: true, duration: 7,
    camera: 'tundish', activeEquipment: ['ladle', 'tundish'], materialStates: ['LIQUID_IN_LADLE', 'LIQUID_IN_TUNDISH'],
    whatHappens: 'Se abre la válvula deslizante; el acero baja por el tubo protector con argón hasta el distribuidor y llena hasta el nivel de trabajo.',
    why: 'El distribuidor amortigua y reparte el acero: deja flotar las inclusiones y alimenta el molde con un flujo estable.',
  },
  {
    state: 'MOLD_FILL', title: 'Llenado del molde', navigatorGroup: 'mold', enabled: true, duration: 6,
    camera: 'mold', activeEquipment: ['tundish', 'mold'], materialStates: ['LIQUID_IN_TUNDISH', 'LIQUID_IN_MOLD'],
    whatHappens: 'La barra tapón abre y el acero entra al molde de cobre enfriado por agua a través de la buza sumergida, sobre la cabeza de la barra falsa.',
    why: 'Un llenado controlado y un menisco estable son el inicio de una buena superficie del planchón.',
  },
  {
    state: 'SHELL_FORMATION', title: 'Formación de la costra', navigatorGroup: 'mold', enabled: true, duration: 8,
    camera: 'mold', activeEquipment: ['mold'], materialStates: ['LIQUID_IN_MOLD', 'THIN_SHELL_LIQUID_CORE'],
    whatHappens: 'Contra las placas de cobre que oscilan se forma una costra sólida delgada; el polvo de molde se funde en el menisco y lubrica. Inicia la extracción.',
    why: 'A la salida del molde la costra ya debe ser lo bastante fuerte para contener el núcleo líquido.',
  },
  {
    state: 'SECONDARY_COOLING', title: 'Enfriamiento secundario', navigatorGroup: 'solidification', enabled: true, duration: 8,
    camera: 'strand', activeEquipment: ['segments', 'coolingSystem'], materialStates: ['THIN_SHELL_LIQUID_CORE'],
    whatHappens: 'Las boquillas de aire-agua enfrían la superficie de la barra mientras los rodillos sostienen la costra contra la presión ferrostática del núcleo líquido.',
    why: 'El enfriamiento debe ser suficiente para hacer crecer la costra, pero suave para no generar grietas.',
  },
  {
    state: 'SOLIDIFICATION', title: 'Solidificación progresiva', navigatorGroup: 'solidification', enabled: true, duration: 9,
    camera: 'crossSection', activeEquipment: ['segments', 'coolingSystem'], materialStates: ['THIN_SHELL_LIQUID_CORE', 'THICK_SHELL_REDUCED_CORE'],
    whatHappens: 'A lo largo del arco la costra sigue creciendo (e = K·√t) y el núcleo líquido se angosta.',
    why: 'La velocidad de solidificación define qué tan rápido puede colar la máquina e influye en la calidad interna.',
  },
  {
    state: 'STRAIGHTENING', title: 'Enderezado', navigatorGroup: 'straightening', enabled: true, duration: 7,
    camera: 'straightener', activeEquipment: ['segments'], materialStates: ['THICK_SHELL_REDUCED_CORE'],
    whatHappens: 'Al final del arco la barra se endereza poco a poco hasta quedar horizontal, todavía con núcleo líquido.',
    why: 'La deformación de enderezado debe aplicarse a una temperatura y ritmo que eviten grietas transversales.',
  },
  {
    state: 'FINAL_SOLIDIFICATION', title: 'Solidificación final', navigatorGroup: 'straightening', enabled: true, duration: 9,
    camera: 'strand', activeEquipment: ['segments', 'coolingSystem'], materialStates: ['THICK_SHELL_REDUCED_CORE', 'FINAL_SOLIDIFICATION'],
    whatHappens: 'Las dos costras se unen en la longitud metalúrgica: el planchón queda totalmente sólido.',
    why: 'El punto de solidificación final influye en la segregación central y debe quedar dentro de la zona soportada por rodillos.',
  },
  {
    state: 'CUTTING', title: 'Oxicorte', navigatorGroup: 'cutting', enabled: true, duration: 8,
    camera: 'cutting', activeEquipment: ['torchCutter'], materialStates: ['SOLID_SLAB'],
    whatHappens: 'El carro de oxicorte se sujeta a la barra en movimiento y los sopletes de oxígeno-gas la cortan al largo pedido.',
    why: 'El largo del planchón lo define la orden de laminación; el corte debe quedar recto y limpio.',
  },
  {
    state: 'COMPLETE', title: 'Planchón terminado', navigatorGroup: 'slab', enabled: true, duration: 7,
    camera: 'slab', activeEquipment: ['slab'], materialStates: ['SOLID_SLAB'],
    whatHappens: 'El planchón se marca con su número de colada y de planchón, sale por la mesa de salida y se envía al patio de planchones o al molino de laminación en caliente.',
    why: 'La trazabilidad liga cada planchón con la química de su colada y sus condiciones de colado.',
  },
];

export const enabledSteps = () => PROCESS_STEPS.filter((s) => s.enabled);
