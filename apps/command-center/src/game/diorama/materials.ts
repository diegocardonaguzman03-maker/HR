// Shared materials — the diorama's palette. Matte, architectural-model finishes:
// off-white, concrete, graphite, steel, glass, timber, stone and vegetation.
// Accents are restrained (industrial red, technology cyan, warm amber light).
import * as THREE from 'three';

const std = (color: number, roughness = 0.85, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

export const MAT = {
  // structure
  offwhite: std(0xeeebe4, 0.82),
  white: std(0xf6f5f2, 0.7),
  concrete: std(0xc9c5bc, 0.95),
  concreteDark: std(0xa29d93, 0.95),
  graphite: std(0x3b3e43, 0.6, 0.15),
  black: std(0x1e1f22, 0.55, 0.2),
  steel: std(0x9ea4aa, 0.38, 0.75),
  steelDark: std(0x60666d, 0.45, 0.7),
  red: std(0xb8372b, 0.6),
  amber: std(0xd99a3e, 0.55),
  cyan: std(0x58b7c6, 0.4, 0.1),
  wood: std(0xa98260, 0.8),
  woodDark: std(0x6f5340, 0.8),
  stone: std(0xb5ab9b, 0.95),
  stoneDark: std(0x8a8173, 0.95),
  green: std(0x31503f, 0.85),
  sand: std(0xd8ccb2, 0.95),
  // interiors
  floor: std(0xd3cec4, 0.9),
  floorTech: std(0xe2e5e6, 0.6),
  floorWood: std(0xc4a27e, 0.75),
  floorDark: std(0x55585c, 0.8),
  fabric: std(0x5c6168, 0.95),
  fabricWarm: std(0x9a7b62, 0.95),
  paper: std(0xf4f1ea, 0.9),
  // landscape
  ground: std(0xbdb7aa, 1),
  path: std(0xd9d3c6, 0.95),
  asphalt: std(0x6c6c6a, 0.95),
  grass: std(0x9aa77c, 1),
  grassDeep: std(0x6f8a5c, 1),
  jungle: std(0x5d7a52, 1),
  water: std(0x6f97a0, 0.12, 0.1, { transparent: true, opacity: 0.86 }),
  plinthSide: std(0x2e2f31, 0.7),
  // people
  skin: std(0xd8b49a, 0.8),
  extra: std(0xd7d4cd, 0.85),
  extraDark: std(0x6d7076, 0.85),
  // glass
  // Glass uses the standard shader (cheaper than physical) with env reflections.
  glass: new THREE.MeshStandardMaterial({
    color: 0xd6e6ea,
    roughness: 0.06,
    metalness: 0.1,
    transparent: true,
    opacity: 0.22,
    envMapIntensity: 1.4,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  glassTint: new THREE.MeshStandardMaterial({
    color: 0x9fb8bf,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.38,
    envMapIntensity: 1.2,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  holo: new THREE.MeshBasicMaterial({ color: 0x4fb3c6, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }),
  // light
  lampOff: std(0xb9b6ae, 0.6),
  lampOn: std(0xfff1d6, 0.5, 0, { emissive: 0xffd9a0, emissiveIntensity: 1.6 }),
  lampCool: std(0xeaf7fa, 0.5, 0, { emissive: 0xbfeef6, emissiveIntensity: 1.3 }),
  screenOff: std(0x17191c, 0.35, 0.2),
  glowAmber: new THREE.MeshBasicMaterial({ color: 0xffb547, transparent: true, opacity: 0.95 }),
  glowRed: new THREE.MeshBasicMaterial({ color: 0xff5a45 }),
  glowCyan: new THREE.MeshBasicMaterial({ color: 0x8fe6f2 }),
  molten: new THREE.MeshBasicMaterial({ color: 0xffa040 }),
} satisfies Record<string, THREE.Material>;

export type MatKey = keyof typeof MAT;

/** Status colours (small, desaturated — never neon). */
export const STATE_HEX = {
  working: 0x5fbf7f,
  researching: 0x6fa3e0,
  collaborating: 0x9c8ee0,
  waiting: 0xf0b33c,
  reviewing: 0xe08a4c,
  blocked: 0xd9483b,
  idle: 0xbfbcb5,
  completed: 0x4fb26a,
  paused: 0x8d9096,
} as const;

let blob: THREE.Texture | null = null;
/** Soft radial texture used for contact shadows / ambient occlusion pads. */
export function blobTexture(): THREE.Texture {
  if (blob) return blob;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.55, 'rgba(0,0,0,0.22)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  blob = new THREE.CanvasTexture(c);
  blob.colorSpace = THREE.SRGBColorSpace;
  return blob;
}

let squareBlob: THREE.Texture | null = null;
/** Rounded-rectangle AO pad for building bases. */
export function padTexture(): THREE.Texture {
  if (squareBlob) return squareBlob;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.filter = 'blur(14px)';
  g.fillStyle = 'rgba(0,0,0,0.42)';
  g.fillRect(26, 26, 76, 76);
  squareBlob = new THREE.CanvasTexture(c);
  squareBlob.colorSpace = THREE.SRGBColorSpace;
  return squareBlob;
}
