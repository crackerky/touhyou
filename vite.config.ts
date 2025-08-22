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
      }
    }),
    // Custom plugin to fix lodash imports
    {
      name: 'fix-lodash-imports',
      load(id) {
        if (id.includes('@cardano-sdk/util/dist/esm/equals.js')) {
          console.log('🔧 Intercepting equals.js to fix lodash import');
          return `import isEqual from "lodash/isEqual";
export const deepEquals = (a, b) => isEqual(a, b);
export const strictEquals = (a, b) => a === b;
export const sameArrayItems = (arrayA, arrayB, itemEquals) => arrayA.length === arrayB.length && arrayA.every((a) => arrayB.some((b) => itemEquals(a, b)));
export const areNumbersEqualInConstantTime = (a, b) => (a ^ b) === 0;
export const areStringsEqualInConstantTime = (a, b) => {
    const maxLength = Math.max(a.length, b.length);
    const results = Array.from({ length: maxLength }, (_, i) => (a.charCodeAt(i) === b.charCodeAt(i) ? 1 : 0));
    const areAllCharactersEqual = results.reduce((accumulator, currentValue) => (accumulator & currentValue), 1);
    return areAllCharactersEqual === 1;
};`;
        }
      }
    }
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
        format: 'es'
      },
      external: [],
      plugins: []
    },
    commonjsOptions: {
      include: [/lodash/, /node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: 'auto'
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
      'util',
      'lodash/isEqual'
    ],
    exclude: [
      '@meshsdk/core',
      '@meshsdk/react'
    ]
  },
  define: { 
    global: 'globalThis',
    'process.env': process.env,
    'process.browser': true
  }
});