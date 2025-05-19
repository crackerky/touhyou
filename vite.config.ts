import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [
    react(),
    wasm(),              // .wasm ESM integration
    topLevelAwait(),     // allow top-level await used by wasm
  ],
  server: {
    hmr: { overlay: false }   // disable red overlay in dev
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});