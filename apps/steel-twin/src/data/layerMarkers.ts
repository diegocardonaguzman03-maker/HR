/**
 * Contenido de las capas de SEGURIDAD / CALIDAD / MANTENIMIENTO.
 * Solo enunciados genéricos de la industria: sin procedimientos de planta, sin frecuencias
 * de mantenimiento, sin límites de operación (brief §18–20).
 */
import type { EquipmentId } from '../types/equipment';
import type { LayerId } from '../store/useAppStore';

export interface LayerMarker {
  id: string;
  layer: Extract<LayerId, 'safety' | 'quality' | 'maintenance'>;
  equipment: EquipmentId;
  position: [number, number, number];
  title: string;
  text: string;
}

export const LAYER_MARKERS: LayerMarker[] = [
  // SEGURIDAD — categorías de peligro
  { id: 's-eaf-molten', layer: 'safety', equipment: 'eaf', position: [-38, 12.5, 4.5], title: 'Metal líquido y alta temperatura', text: 'Acero y escoria líquidos a más de 1,600 °C, salpicaduras y calor radiante alrededor del horno, sobre todo al vaciar y al operar la puerta de escoria.' },
  { id: 's-eaf-elec', layer: 'safety', equipment: 'eaf', position: [-42, 13.5, -5], title: 'Energía eléctrica', text: 'Transformador del horno de alta tensión y circuito secundario de alta corriente (brazos, cables, electrodos). Antes de intervenir se requiere aislamiento y verificación de energía cero.' },
  { id: 's-eaf-water', layer: 'safety', equipment: 'eaf', position: [-34, 9.5, -4.2], title: 'Contacto agua / metal líquido', text: 'Paneles y bóveda enfriados con agua: una fuga hacia el baño puede causar una explosión por vapor. La chatarra o las adiciones mojadas son un peligro equivalente.' },
  { id: 's-eaf-o2', layer: 'safety', equipment: 'eaf', position: [-33.5, 7.8, 3.5], title: 'Oxígeno y gas combustible', text: 'El enriquecimiento con oxígeno aumenta la intensidad del fuego; los quemadores de gas natural agregan peligro de explosión. El proceso genera monóxido de carbono.' },
  { id: 's-tap-zone', layer: 'safety', equipment: 'ladle', position: [-33.8, 5.5, 3], title: 'Zona de exclusión del vaciado', text: 'Chorro de acero y llenado de la olla: nadie dentro de la zona roja durante el vaciado. Las distancias propias de la planta se definen por separado.' },
  { id: 's-crane', layer: 'safety', equipment: 'crane', position: [-6, 20, 3], title: 'Cargas suspendidas', text: 'Una olla llena pesa bastante más de 200 t: nunca te pares debajo de una carga suspendida; los frenos y límites de la grúa son críticos para la seguridad.' },
  { id: 's-lf-elec', layer: 'safety', equipment: 'ladleFurnace', position: [-18, 10.5, 3], title: 'Energía eléctrica y arcos', text: 'Arcos del horno olla, transformador y columnas de electrodos en movimiento.' },
  { id: 's-lf-gas', layer: 'safety', equipment: 'ladleFurnace', position: [-21.5, 2.5, 4], title: 'Gas inerte (argón)', text: 'El argón desplaza al oxígeno: si se acumula en fosas o espacios confinados hay peligro de asfixia.' },
  { id: 's-tundish', layer: 'safety', equipment: 'tundish', position: [13, 14.5, 2.5], title: 'Metal líquido en la plataforma de colada', text: 'La apertura de la olla y el manejo del distribuidor y del tubo protector (shroud) exponen a los operadores al acero líquido y al calor radiante.' },
  { id: 's-mold-bo', layer: 'safety', equipment: 'mold', position: [7, 10.2, 2], title: 'Peligro de perforación (breakout)', text: 'Si la costra se rompe debajo del molde, sale acero líquido: el área bajo el molde es zona de exclusión durante la colada.' },
  { id: 's-mold-water', layer: 'safety', equipment: 'coolingSystem', position: [5, 8, 4], title: 'Pérdida de enfriamiento del molde', text: 'Perder el agua del molde con acero líquido dentro es un peligro crítico: el agua de emergencia y la lógica de paro de colada son sistemas de seguridad.' },
  { id: 's-segments', layer: 'safety', equipment: 'segments', position: [22, 3.5, 2.5], title: 'Maquinaria en movimiento y energía almacenada', text: 'Rodillos motrices, puntos de atrapamiento, presión hidráulica y el peso de segmentos y barra falsa (gravedad).' },
  { id: 's-hydraulic', layer: 'safety', equipment: 'mold', position: [7.8, 9.2, -1.8], title: 'Sistemas hidráulicos', text: 'La hidráulica de oscilación y de segmentos almacena energía que debe liberarse antes de intervenir.' },
  { id: 's-cutter', layer: 'safety', equipment: 'torchCutter', position: [38.8, 3.6, 2.2], title: 'Gases de oxicorte y escoria caliente', text: 'Líneas de oxígeno y gas combustible, chispas y escoria de corte, carro de sopletes en movimiento.' },
  { id: 's-slab', layer: 'safety', equipment: 'slab', position: [50, 2.8, 2], title: 'Producto caliente y pesado', text: 'Planchones de varias toneladas a alta temperatura sobre mesas y transferencias en movimiento.' },

  // CALIDAD — relaciones entre varios parámetros
  { id: 'q-eaf-chem', layer: 'quality', equipment: 'eaf', position: [-40, 10.5, 3.5], title: 'Química y residuales', text: 'La selección de chatarra, la proporción de DRI y la práctica de escoria definen juntas los elementos residuales, el fósforo y el nitrógeno al vaciado.' },
  { id: 'q-tap-slag', layer: 'quality', equipment: 'ladle', position: [-31.5, 6.2, -2.5], title: 'Arrastre de escoria', text: 'La escoria del horno que llega a la olla puede revertir fósforo y aumentar las inclusiones de óxidos; influyen juntas la práctica de vaciado, el estado de la piquera y la detección de escoria.' },
  { id: 'q-lf', layer: 'quality', equipment: 'ladleFurnace', position: [-15, 7.5, 2.5], title: 'Limpieza y colabilidad', text: 'La desoxidación, la desulfuración, la agitación con argón y el tratamiento con calcio controlan juntos las inclusiones y el taponamiento de buzas en la colada.' },
  { id: 'q-tundish', layer: 'quality', equipment: 'tundish', position: [8, 14.6, -2], title: 'Sobrecalentamiento y flujo', text: 'El sobrecalentamiento, el nivel del distribuidor y los dispositivos de control de flujo influyen en la flotación de inclusiones y en la estructura de solidificación.' },
  { id: 'q-mold', layer: 'quality', equipment: 'mold', position: [10.6, 12.6, 1.5], title: 'Nivel de molde, polvo y oscilación', text: 'La estabilidad del nivel, el comportamiento del polvo de molde, la oscilación, la velocidad de colada y el sobrecalentamiento interactúan para formar la costra inicial y la superficie del planchón.' },
  { id: 'q-cooling', layer: 'quality', equipment: 'coolingSystem', position: [14, 4, 2.5], title: 'Enfriamiento secundario', text: 'La intensidad y uniformidad de la aspersión afectan la temperatura superficial, el recalentamiento y la sensibilidad a grietas; ningún parámetro por sí solo explica un defecto.' },
  { id: 'q-straight', layer: 'quality', equipment: 'segments', position: [19, 3.2, -2.5], title: 'Enderezado y alineación de rodillos', text: 'La temperatura superficial en el enderezado, la abertura y la alineación de rodillos actúan juntas sobre las grietas transversales, el abombamiento y las grietas internas.' },
  { id: 'q-centre', layer: 'quality', equipment: 'segments', position: [32, 2.6, 2], title: 'Solidificación final', text: 'La posición y las condiciones de la solidificación final influyen en la segregación central y la porosidad central.' },
  { id: 'q-slab', layer: 'quality', equipment: 'slab', position: [47, 2.6, -2], title: 'Inspección y trazabilidad', text: 'La identificación del planchón liga la calidad superficial e interna con la química de la colada y las condiciones de colado.' },

  // MANTENIMIENTO — componentes críticos (sin frecuencias)
  { id: 'm-electrodes', layer: 'maintenance', equipment: 'eaf', position: [-37, 16.5, 1.2], title: 'Electrodos y uniones', text: 'Integridad de las uniones, roturas y consumo; mordazas de columna e hidráulica de regulación.' },
  { id: 'm-panels', layer: 'maintenance', equipment: 'eaf', position: [-41.8, 8.6, 0], title: 'Paneles enfriados con agua', text: 'Fugas, grietas y acumulación de escoria; vigilancia de flujo y temperatura de cada circuito.' },
  { id: 'm-ebt', layer: 'maintenance', equipment: 'eaf', position: [-34.2, 6.8, 1.5], title: 'EBT y refractario de la solera', text: 'Desgaste de la piquera, comportamiento de la arena de llenado y estado del refractario de la solera.' },
  { id: 'm-ladle', layer: 'maintenance', equipment: 'ladle', position: [-18, 6.5, -3], title: 'Refractario de olla, válvula deslizante y tapón poroso', text: 'Desgaste del revestimiento, placas de la válvula deslizante y permeabilidad del tapón poroso.' },
  { id: 'm-crane', layer: 'maintenance', equipment: 'crane', position: [-10, 23.5, -3], title: 'Ganchos, cables y frenos de grúa', text: 'Componentes de izaje críticos para la seguridad, con criterios de rechazo definidos (fabricante / normas).' },
  { id: 'm-turret', layer: 'maintenance', equipment: 'turret', position: [5, 15.5, -2.5], title: 'Rodamiento de la torreta y celdas de carga', text: 'Rodamiento de giro, accionamiento, bloqueo y precisión de pesaje.' },
  { id: 'm-mold', layer: 'maintenance', equipment: 'mold', position: [8.2, 12.9, -1.5], title: 'Placas de cobre y conicidad', text: 'Desgaste de placas, estado del recubrimiento y conicidad; canales de agua y termopares.' },
  { id: 'm-rolls', layer: 'maintenance', equipment: 'segments', position: [15, 7.6, -2.2], title: 'Rodillos, rodamientos y abertura', text: 'Abertura de rodillos, alineación, estado de rodamientos y superficie de rodillos.' },
  { id: 'm-nozzles', layer: 'maintenance', equipment: 'coolingSystem', position: [12.5, 6.4, -2.5], title: 'Boquillas de aspersión', text: 'El taponamiento y la desviación del patrón cambian directamente el enfriamiento local.' },
  { id: 'm-emergency', layer: 'maintenance', equipment: 'coolingSystem', position: [2, 19.5, 9], title: 'Sistema de agua de emergencia', text: 'La conmutación automática, el nivel del tanque y las bombas de respaldo deben comprobarse con pruebas.' },
  { id: 'm-cutter', layer: 'maintenance', equipment: 'torchCutter', position: [37.5, 4.2, -1.5], title: 'Sopletes y tren de gas', text: 'Estado de las boquillas, integridad del tren de gas y sincronización del carro.' },
];
