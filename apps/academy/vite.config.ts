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
          rollupOptions: { output: { manualChunks: { three: ['three'], r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'] } } },
        },
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
}));
