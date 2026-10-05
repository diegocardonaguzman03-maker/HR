import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom no tiene WebGL: la escena 3D se sustituye por un marcador en pruebas de componentes.
vi.mock('../src/components/3d/Scene', () => ({ Scene: () => null }));
if (!window.matchMedia) {
  window.matchMedia = ((q: string) => ({ matches: false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as unknown as typeof window.matchMedia;
}
Element.prototype.scrollIntoView ??= function () {};
