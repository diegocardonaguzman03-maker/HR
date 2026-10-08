import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build --mode web` produces one self-contained index.html in web/ (public link).
// `vite build --mode share` bundles the app as one classic script (dist-share/app.js) + app.css for the
// claude.ai page; scripts/make-share-page.mjs writes the small page that loads them.
export default defineConfig(({ mode }) =>
  mode === 'share'
    ? {
        plugins: [react(), tailwindcss()],
        define: { 'process.env.NODE_ENV': JSON.stringify('production') },
        build: {
          outDir: 'dist-share',
          chunkSizeWarningLimit: 3000,
          lib: { entry: 'src/main.tsx', formats: ['iife'], name: 'AmmxOps', fileName: () => 'app.js' },
          rollupOptions: { output: { assetFileNames: 'app[extname]' } },
        },
      }
    : mode === 'web'
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
