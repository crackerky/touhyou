import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    nodePolyfills({
      // Explicitly specify which polyfills to include
      include: [
        'buffer', 
        'process', 
        'util', 
        'stream', 
        'events',
        'path',
        'crypto'
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
    }),
  ],
  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch'
    }
  },
  define: { 
    global: 'window',
    'process.env': process.env
  },
  server: {
    hmr: { overlay: false }
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@emurgo/cardano-serialization-lib-browser'],
    esbuildOptions: {
      target: 'esnext',
      supported: {
        bigint: true
      }
    }
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});