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
    // Custom plugin to fix imports
    {
      name: 'fix-imports',
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
        if (id.includes('@cardano-sdk/util/dist/esm/primitives.js')) {
          console.log('🔧 Intercepting primitives.js to fix bech32 import');
          return `import * as bech32Module from 'bech32';
import { InvalidStringError } from './errors.js';
const bech32 = bech32Module.bech32 || bech32Module;
const MAX_BECH32_LENGTH_LIMIT = 1023;
export const typedBech32 = (humanReadablePart, length) => ({
    decode(value) {
        if (value.substring(0, humanReadablePart.length) !== humanReadablePart) {
            throw new InvalidStringError(\`expected bech32 string to start with '\${humanReadablePart}', but got '\${value}'\`);
        }
        const { words } = bech32.decode(value, MAX_BECH32_LENGTH_LIMIT);
        const data = Uint8Array.from(bech32.fromWords(words));
        if (length !== undefined && data.length !== length) {
            throw new InvalidStringError(\`expected bech32 string '\${value}' to decode to \${length} bytes, but got \${data.length}\`);
        }
        return data;
    },
    encode(value) {
        return bech32.encode(humanReadablePart, bech32.toWords(value), MAX_BECH32_LENGTH_LIMIT);
    }
});`;
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
        format: 'es',
        inlineDynamicImports: true
      },
      external: [],
      plugins: []
    },
    commonjsOptions: {
      include: [/lodash/, /node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: 'auto',
      requireReturnsDefault: 'auto'
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
      'lodash/isEqual',
      'bech32'
    ],
    exclude: [
      '@meshsdk/core',
      '@meshsdk/react'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  define: { 
    global: 'globalThis',
    'process.env': {},
    'process.browser': true,
    'exports': '{}'
  }
});