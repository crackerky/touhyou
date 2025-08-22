import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    nodePolyfills({
      include: ['buffer', 'stream', 'process', 'util', 'crypto', 'fs', 'path'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    }),
  ],
  server: {
    port: 5173,
    hmr: {
      overlay: true
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
        inlineDynamicImports: true,
        manualChunks: undefined
      },
      external: [],
      plugins: []
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: 'auto',
      requireReturnsDefault: 'auto',
      esmExternals: true
    }
  },
  resolve: {
    alias: {
      // Node.jsモジュールのブラウザ互換エイリアス
      util: 'util',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer'
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'buffer',
      'process',
      'util'
    ],
    exclude: [],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  define: { 
    global: 'globalThis',
    'process.env': {},
    'process.browser': true
  }
});