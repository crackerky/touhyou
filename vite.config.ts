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
      // Avoid alias that might cause circular references
      '@emurgo/cardano-serialization-lib-browser': '@emurgo/cardano-serialization-lib-browser'
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
    exclude: ['lucide-react'],
    include: ['@supabase/supabase-js'],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        bigint: true
      }
    }
  },
  build: {
    sourcemap: true,
    target: 'es2020',
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});