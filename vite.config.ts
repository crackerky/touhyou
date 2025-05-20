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
    exclude: ['lucide-react', 'stream'],
  },
  define: {
    global: 'globalThis',
    'process.env': process.env
  },
  resolve: {
    alias: {
      // Use explicit paths for polyfills
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      path: 'rollup-plugin-node-polyfills/polyfills/path',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6'
    }
  },
  build: {
    sourcemap: true
  }
});