/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build` → dist/ (sitio estático con /models, /documents, /videos).
// `vite build --mode web` → web/index.html autocontenido (el GLB se incrusta; PDFs y video se copian a web/).
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'web' ? [viteSingleFile()] : [])],
  base: './',
  build:
    mode === 'web'
      ? { outDir: 'web', emptyOutDir: true, copyPublicDir: true, assetsInlineLimit: 8_000_000, chunkSizeWarningLimit: 4000 }
      : {
          chunkSizeWarningLimit: 1500,
          // RT-PERF-03: React va en su propio chunk; así `index` ya no importa estáticamente `r3f`/`three`
          // y la interfaz (aviso, lista de equipos) se pinta antes de descargar el 3D (que entra con lazy()).
          rollupOptions: {
            output: {
              manualChunks(id: string) {
                // el helper de precarga de Vite lo usa el lazy() de index: si cae en r3f, index vuelve a depender del 3D
                if (id.includes('vite/preload-helper') || id.includes('vite/modulepreload-polyfill')) return 'react';
                if (/node_modules[\\/](react|react-dom|scheduler|zustand|use-sync-external-store|@babel[\\/]runtime)[\\/]/.test(id)) return 'react'; // + vendor que usa la UI
                if (/node_modules[\\/]three[\\/]/.test(id)) return 'three';
                if (/node_modules[\\/](@react-three|postprocessing|camera-controls|three-stdlib|maath|n8ao|troika-[^\\/]+|three-mesh-bvh|@monogrid|stats-gl|suspend-react|its-fine|react-reconciler)[\\/]/.test(id)) return 'r3f';
                return undefined;
              },
            },
          },
        },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
}));
