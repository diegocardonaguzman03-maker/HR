import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build --mode share` produces one self-contained index.html (used for the shareable link).
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'share' ? [viteSingleFile()] : [])],
  base: './',
  build: {
    chunkSizeWarningLimit: 1500,
    outDir: mode === 'share' ? 'dist-share' : 'dist',
    rollupOptions:
      mode === 'share'
        ? {}
        : { output: { manualChunks: { three: ['three'], r3f: ['@react-three/fiber', '@react-three/drei'] } } },
  },
}));
