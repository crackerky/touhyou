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
      target: 'es2022',
      supported: {
        bigint: true
      }
    }
  },
  build: {
    sourcemap: true,
    target: 'es2022',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        // Wrap the WebAssembly import in a function to avoid top-level await
        format: 'es',
        inlineDynamicImports: true,
        // Reduce memory usage by limiting chunk size
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Create a separate chunk for each major library/framework
            if (id.includes('@meshsdk')) {
              return 'vendor-meshsdk';
            }
            if (id.includes('@emurgo')) {
              return 'vendor-emurgo';
            }
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            // Group remaining dependencies
            return 'vendor';
          }
        }
      }
    }
  }
});