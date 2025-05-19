import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasmPack from 'vite-plugin-wasm-pack';

export default defineConfig({
  plugins: [
    react(),
    wasm(),              // .wasm ESM integration
    topLevelAwait(),     // allow top-level await used by wasm
    wasmPack(['.'])      // future Rust crates, keep placeholder
  ],
  server: {
    hmr: { overlay: false }   // disable red overlay in dev
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});