import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    wasm(),              // .wasm ESM integration
    {
      ...nodePolyfills(),
      enforce: 'post'
    }
  ],
  server: {
    hmr: { overlay: false }   // disable red overlay in dev
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
    // Add other Node.js global objects that might be used
    'process.env': process.env
  },
  build: {
    sourcemap: true,     // Add source maps for better debugging
    rollupOptions: {
      plugins: [nodePolyfills()]
    }
  },
  resolve: {
    alias: {
      // Polyfill Node.js core modules in the browser
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      sys: 'util',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      path: 'rollup-plugin-node-polyfills/polyfills/path',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6'
    }
  }
});