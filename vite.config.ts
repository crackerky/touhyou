import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    // Node polyfills - specify as a plugin with proper options
    {
      ...nodePolyfills({
        // Explicitly include all required polyfills
        include: [
          'buffer', 
          'process', 
          'stream', 
          'events', 
          'util', 
          'path'
        ]
      }),
      enforce: 'pre' // Execute before other plugins
    }
  ],
  server: {
    hmr: { overlay: false }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': process.env,
    global: 'globalThis'
  },
  build: {
    sourcemap: true
  }
});