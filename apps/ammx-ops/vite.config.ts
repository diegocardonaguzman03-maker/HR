import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build --mode web` produces one self-contained index.html in web/ (shareable link).
export default defineConfig(({ mode }) =>
  mode === 'web'
    ? {
        plugins: [react(), tailwindcss(), viteSingleFile()],
        base: './',
        build: { outDir: 'web', emptyOutDir: true, copyPublicDir: false, chunkSizeWarningLimit: 3000 },
      }
    : {
        plugins: [react(), tailwindcss()],
        base: './',
        build: {
          chunkSizeWarningLimit: 1500,
          rollupOptions: {
            output: { manualChunks: { three: ['three'], r3f: ['@react-three/fiber', '@react-three/drei'] } },
          },
        },
      },
);
