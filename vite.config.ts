import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [
    react(),
    wasm(),              // .wasm ESM integration
  ],
  server: {
    hmr: { overlay: false }   // disable red overlay in dev
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true,     // Add source maps for better debugging
  }
});