/**
 * Contrato de nombres del GLB (RT-SW-05). Cada nodo `eaf__<sistema>[_<componente>]` lleva UNA malla
 * llamada `mesh_<nodo>`, con una primitiva por material. GLTFLoader (three r169) la carga así:
 * - una primitiva → la propia Mesh toma el nombre del nodo (`eaf__x`);
 * - varias primitivas → un Group `eaf__x` con hijos Mesh `mesh_eaf__x`, `mesh_eaf__x_1`… (sin nombre de contrato).
 * Por eso EafModel (`nodeOf`) resuelve el componente subiendo por los padres hasta el primer nombre
 * `eaf__*`/`env__*`; ningún hijo de primitiva debe empezar con `eaf__`. Si se importa un GLB de CAD,
 * renombra las mallas igual (prefijo `mesh_`) o `nodeOf` debe ignorar sufijos `_\d+`.
 *
 * Posición de cada hotspot (coordenadas de escena: plataforma del horno en y = 0).
 * La define ADX-09; si falta, se usa el centro de la caja del nodo.
 */
export const ANCHORS: Record<string, [number, number, number]> = {
  eaf__shell: [2.3, 0.9, 2.3],
  eaf__roof: [1.8, 4.2, 1.8],
  eaf__electrodes: [0.4, 6.3, 0.69],
  eaf__arms: [-3, 8.9, 0.69],
  eaf__transformer: [-12.2, 3.9, 1.7],
  eaf__secondary: [-7.3, 6.0, 1.0],
  eaf__oxygen: [1.0, 2.6, 5.6],
  eaf__slagdoor: [0, 2.3, 3.8],
  eaf__ebt: [0.9, 1.5, -4.3], // OPS-01: EBT en −z, opuesto a la puerta de escoria (+z)
  eaf__hydraulics: [-7.5, 1.8, -7.2],
  eaf__refractory: [-2.2, 0.7, -2.4],
  eaf__cooling: [-2.5, 2.5, 2.5],
  eaf__fume: [3.1, 6.1, -1.8],
  eaf__drifeed: [-1.5, 7.0, 3.5],
  eaf__control: [-3.5, 4.0, 8.0],
};

/** Dirección de despiece por sistema (m a explode = 1). */
export const EXPLODE: Record<string, [number, number, number]> = {
  eaf__roof: [0, 2.4, 0],
  eaf__electrodes: [0, 3.6, 0],
  eaf__arms: [0, 3.6, 0],
  eaf__transformer: [-3, 0, 0],
  eaf__secondary: [-1.5, 1.5, 0],
  eaf__oxygen: [0, 0, 2.2],
  eaf__slagdoor: [0, 0, 2.6],
  eaf__ebt: [0, 0, -2.2],
  eaf__hydraulics: [0, 0, -2.4],
  eaf__refractory: [0, -0.2, 0],
  eaf__cooling: [0, 1.2, 0],
  eaf__fume: [2, 1.6, 0],
  eaf__drifeed: [0, 2, 2],
  eaf__control: [0, 0, 3],
};

/** Sistemas que reciben el plano de corte (vista de sección). */
export const SECTIONED = ['eaf__shell', 'eaf__cooling', 'eaf__roof', 'eaf__refractory', 'eaf__slagdoor', 'eaf__ebt', 'eaf__oxygen'];

/** Partes que suben/bajan en la animación demostrativa de regulación de electrodos. */
export const REGULATION = ['eaf__electrodes', 'eaf__arms_clamp', 'eaf__arms_busstube', 'eaf__arms_mast'];

export const Y0 = 3;
