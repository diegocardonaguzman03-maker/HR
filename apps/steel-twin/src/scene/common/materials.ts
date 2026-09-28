import * as THREE from 'three';

/** Shared, realistic-leaning industrial materials (no cartoon colours). */
export const MAT = {
  steel: new THREE.MeshStandardMaterial({ color: '#8b929a', metalness: 0.75, roughness: 0.42 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: '#4b5159', metalness: 0.7, roughness: 0.5 }),
  structure: new THREE.MeshStandardMaterial({ color: '#5f6873', metalness: 0.45, roughness: 0.62 }),
  paintYellow: new THREE.MeshStandardMaterial({ color: '#b08d2c', metalness: 0.3, roughness: 0.6 }),
  concrete: new THREE.MeshStandardMaterial({ color: '#3a3d42', metalness: 0.05, roughness: 0.92 }),
  refractory: new THREE.MeshStandardMaterial({ color: '#8d6e63', metalness: 0.05, roughness: 0.95 }),
  copper: new THREE.MeshStandardMaterial({ color: '#b87333', metalness: 0.85, roughness: 0.32 }),
  graphite: new THREE.MeshStandardMaterial({ color: '#2d2f33', metalness: 0.2, roughness: 0.75 }),
  scrap: new THREE.MeshStandardMaterial({ color: '#6b5a4e', metalness: 0.6, roughness: 0.7 }),
  dri: new THREE.MeshStandardMaterial({ color: '#3d3a38', metalness: 0.3, roughness: 0.9 }),
  molten: new THREE.MeshStandardMaterial({ color: '#ff7a1a', emissive: '#ff5500', emissiveIntensity: 2.2, roughness: 0.35, toneMapped: false }),
  moltenCore: new THREE.MeshStandardMaterial({ color: '#ffb347', emissive: '#ff7b00', emissiveIntensity: 2.6, roughness: 0.3, toneMapped: false, transparent: true, opacity: 0.95 }),
  slag: new THREE.MeshStandardMaterial({ color: '#5a463a', emissive: '#3a1a08', emissiveIntensity: 0.5, roughness: 0.95 }),
  moldPowder: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 1 }),
  water: new THREE.MeshStandardMaterial({ color: '#4d8fe0', transparent: true, opacity: 0.35, roughness: 0.2, depthWrite: false }),
  pipeWater: new THREE.MeshStandardMaterial({ color: '#3f7fd0', emissive: '#10306a', emissiveIntensity: 0.6, roughness: 0.4 }),
  electrical: new THREE.MeshStandardMaterial({ color: '#d9b33a', emissive: '#6b5200', emissiveIntensity: 0.9, roughness: 0.5 }),
  gas: new THREE.MeshStandardMaterial({ color: '#56b36a', emissive: '#1d5a2a', emissiveIntensity: 0.9, roughness: 0.5 }),
  oxygenJet: new THREE.MeshStandardMaterial({ color: '#dff6ff', emissive: '#9fdcff', emissiveIntensity: 1.5, transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false }),
  flame: new THREE.MeshStandardMaterial({ color: '#9fd4ff', emissive: '#5ab0ff', emissiveIntensity: 3, transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false }),
  arc: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#cfe8ff', emissiveIntensity: 6, toneMapped: false }),
  rubber: new THREE.MeshStandardMaterial({ color: '#1f2226', roughness: 0.9 }),
};

/** Temperature → colour for the TEMPERATURE layer (false colour, °C). */
export function falseColor(t: number, out = new THREE.Color()): THREE.Color {
  const x = Math.min(1, Math.max(0, (t - 700) / 850)); // 700…1550 °C
  // blue → cyan → yellow → red → white
  const stops: [number, string][] = [[0, '#2c4bd6'], [0.3, '#22b8c9'], [0.55, '#e6d33a'], [0.8, '#e2461f'], [1, '#fff3e0']];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i];
    const [b, cb] = stops[i + 1];
    if (x <= b) return out.set(ca).lerp(new THREE.Color(cb), (x - a) / (b - a));
  }
  return out.set('#fff3e0');
}

/** Physically-inspired incandescence colour (black-body-ish) for hot steel surfaces. */
export function glowColor(t: number, out = new THREE.Color()): THREE.Color {
  const x = Math.min(1, Math.max(0, (t - 550) / 900));
  const stops: [number, string][] = [[0, '#3b3f45'], [0.25, '#5a1f12'], [0.5, '#a3280d'], [0.75, '#e0550f'], [1, '#ffc46b']];
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i];
    const [b, cb] = stops[i + 1];
    if (x <= b) return out.set(ca).lerp(new THREE.Color(cb), (x - a) / (b - a));
  }
  return out.set('#ffc46b');
}
