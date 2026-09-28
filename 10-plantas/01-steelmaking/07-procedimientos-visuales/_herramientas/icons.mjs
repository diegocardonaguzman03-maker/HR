// Vocabulario de pictogramas de los POV (id en español → icono Tabler, licencia MIT).
// Los JSON de procesos solo pueden usar estos ids; render.mjs falla si aparece uno desconocido.
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const DIR = path.join(here, 'node_modules/@tabler/icons/icons/outline');

export const ICONS = {
  // acciones generales
  inspeccionar: 'eye',
  verificar: 'clipboard-check',
  checklist: 'list-check',
  medir: 'ruler-measure',
  temperatura: 'thermometer',
  muestra: 'flask',
  pesar: 'scale',
  nivel: 'droplet-half-2',
  presion: 'gauge',
  hmi: 'device-desktop',
  camara: 'camera',
  boton: 'hand-finger',
  manual: 'hand-grab',
  ajustar: 'settings',
  herramienta: 'tool',
  reparar: 'hammer',
  conectar: 'plug',
  cambiar: 'arrows-exchange',
  arrancar: 'player-play',
  detener: 'player-stop',
  terminar: 'flag',
  marcar: 'tag',
  esperar: 'hourglass',
  tiempo: 'clock',
  registrar: 'file-text',
  avisar: 'speakerphone',
  radio: 'radio',
  telefono: 'phone',
  personas: 'users',
  autorizar: 'user-check',
  calidad: 'zoom-check',
  buscar: 'search',
  objetivo: 'target',
  tendencia: 'chart-line',
  ok: 'circle-check',
  rechazar: 'circle-x',
  // equipos y materiales
  olla: 'bucket',
  vaciar: 'arrow-big-down-lines',
  flujo: 'arrow-down-circle',
  subir_bajar: 'arrows-vertical',
  girar: 'rotate',
  grua: 'crane',
  carro: 'truck',
  montacargas: 'forklift',
  material: 'box',
  peso: 'weight',
  iman: 'magnet',
  refractario: 'wall',
  gas: 'wind',
  oxigeno: 'cylinder',
  agua: 'droplet',
  agitar: 'ripple',
  electrico: 'bolt',
  cortar: 'scissors',
  rociar: 'spray',
  ruta: 'route',
  ubicacion: 'map-pin',
  planta: 'building-factory-2',
  // seguridad
  peligro: 'alert-triangle',
  alto: 'hand-stop',
  fuego: 'flame',
  calor: 'temperature',
  bloqueo: 'lock',
  barrera: 'barrier-block',
  cono: 'traffic-cone',
  salida: 'door-exit',
  extintor: 'fire-extinguisher',
  primeros_auxilios: 'first-aid-kit',
  seguro: 'shield-check',
  alarma: 'alarm',
  capacitacion: 'school',
  certificado: 'certificate',
};

// Equipo de protección personal (EPP) permitido en `epp[]`.
export const EPP = {
  casco: ['helmet', 'Casco con barbiquejo'],
  careta_dorada: ['sunglasses', 'Careta con visor dorado'],
  lentes: ['eyeglass', 'Lentes de seguridad'],
  aluminizado: ['shirt', 'Chaqueta, capucha y polainas aluminizadas'],
  ropa_fr: ['shirt', 'Ropa ignífuga (FR)'],
  guantes: ['hand-grab', 'Guantes (aluminizados o de carnaza según tarea)'],
  botas: ['shoe', 'Botas metatarsales'],
  auditiva: ['headphones', 'Protección auditiva'],
  respirador: ['mask', 'Respirador'],
  detector_gas: ['device-watch', 'Detector personal multigás'],
  arnes: ['link', 'Arnés y línea de vida'],
  dosimetro: ['device-watch', 'Dosímetro personal'],
};

const cache = new Map();
/** Devuelve el <svg> del icono, con color y tamaño dados. */
export function icon(id, { size = 22, color = 'currentColor', stroke = 1.8 } = {}) {
  const name = ICONS[id] ?? (EPP[id] ? EPP[id][0] : id);
  if (!cache.has(name)) {
    const file = path.join(DIR, `${name}.svg`);
    if (!fs.existsSync(file)) throw new Error(`Icono desconocido: ${id}`);
    const raw = fs.readFileSync(file, 'utf8');
    const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    cache.set(name, inner);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${cache.get(name)}</svg>`;
}

export const isIcon = (id) => id in ICONS;
export const isEpp = (id) => id in EPP;
