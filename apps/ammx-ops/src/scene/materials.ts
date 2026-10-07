import * as THREE from 'three';

// Shared materials keep draw state small and the look consistent.
export const M = {
  concrete: new THREE.MeshStandardMaterial({ color: '#4a5059', roughness: 0.55, metalness: 0.08 }),
  steel: new THREE.MeshStandardMaterial({ color: '#3a424d', roughness: 0.42, metalness: 0.75 }),
  steelLight: new THREE.MeshStandardMaterial({ color: '#7b8592', roughness: 0.35, metalness: 0.8 }),
  orange: new THREE.MeshStandardMaterial({ color: '#F58220', roughness: 0.45, metalness: 0.35 }),
  navy: new THREE.MeshStandardMaterial({ color: '#0d2a4f', roughness: 0.5, metalness: 0.3 }),
  glass: new THREE.MeshStandardMaterial({ color: '#a9c4dc', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.16, depthWrite: false }),
  glassGreen: new THREE.MeshStandardMaterial({ color: '#7fe0b8', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.2, depthWrite: false }),
  frame: new THREE.MeshStandardMaterial({ color: '#20262e', roughness: 0.4, metalness: 0.7 }),
  deskTop: new THREE.MeshStandardMaterial({ color: '#e9e5dd', roughness: 0.35, metalness: 0.02 }),
  darkTop: new THREE.MeshStandardMaterial({ color: '#2b3139', roughness: 0.4, metalness: 0.2 }),
  bezel: new THREE.MeshStandardMaterial({ color: '#0d1014', roughness: 0.3, metalness: 0.5 }),
  white: new THREE.MeshStandardMaterial({ color: '#f1f1ee', roughness: 0.5 }),
  rubber: new THREE.MeshStandardMaterial({ color: '#16181b', roughness: 0.9 }),
  yellow: new THREE.MeshStandardMaterial({ color: '#f2c230', roughness: 0.5, metalness: 0.2 }),
  chair: new THREE.MeshStandardMaterial({ color: '#30363f', roughness: 0.6 }),
  wood: new THREE.MeshStandardMaterial({ color: '#b08a62', roughness: 0.6 }),
  trainee: new THREE.MeshStandardMaterial({ color: '#8b95a3', roughness: 0.7 }),
  hiVis: new THREE.MeshStandardMaterial({ color: '#ff9a2e', roughness: 0.6, emissive: '#3a1a00' }),
  helmet: new THREE.MeshStandardMaterial({ color: '#f5f5f0', roughness: 0.35 }),
};

export const emissive = (color: string, intensity = 2) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4, toneMapped: false });

const cache = new Map<string, THREE.MeshStandardMaterial>();
export const mat = (color: string, rough = 0.6, metal = 0.1) => {
  const k = `${color}|${rough}|${metal}`;
  if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
  return cache.get(k)!;
};

/** Concrete floor texture: subtle slabs, saw cuts and polish variation, drawn locally. */
export function concreteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d')!;
  x.fillStyle = '#5a6069';
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 1400; i++) {
    const v = 80 + Math.random() * 30;
    x.fillStyle = `rgba(${v},${v + 4},${v + 10},0.08)`;
    const r = Math.random() * 40;
    x.beginPath();
    x.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2);
    x.fill();
  }
  x.strokeStyle = 'rgba(20,24,30,0.45)';
  x.lineWidth = 2;
  x.strokeRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
