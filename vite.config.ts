import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasmPack from 'vite-plugin-wasm-pack';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    wasmPack(['./node_modules/@emurgo/cardano-serialization-lib-browser']),
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
      target: 'esnext',
      supported: {
        bigint: true,
        'top-level-await': true
      }
    }
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'cardano-lib': ['@emurgo/cardano-serialization-lib-browser']
        }
      }
    }
  }
});