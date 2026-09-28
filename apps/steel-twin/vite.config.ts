import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `vite build --mode share` bundles the app as one classic script (dist-share/app.js) + app.css
// for the shareable link; scripts/make-share-page.mjs writes the small page that loads them.
export default defineConfig(({ mode }) =>
  mode === 'share'
    ? {
        plugins: [react(), tailwindcss()],
        define: { 'process.env.NODE_ENV': JSON.stringify('production') },
        build: {
          outDir: 'dist-share',
          lib: { entry: 'src/main.tsx', formats: ['iife'], name: 'SteelTwin', fileName: () => 'app.js' },
          rollupOptions: { output: { assetFileNames: 'app[extname]' } },
        },
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
