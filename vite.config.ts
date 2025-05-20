import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills(),
    react(),
    wasm()
  ],
  define: { 
    global: 'globalThis' 
  },
  server: {
    hmr: { overlay: false }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    sourcemap: true
  }
});