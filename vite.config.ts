import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
// Conditionally import topLevelAwait to handle potential errors
let topLevelAwait;
try {
  topLevelAwait = (await import('vite-plugin-top-level-await')).default;
} catch (error) {
  console.warn('Warning: vite-plugin-top-level-await could not be loaded:', error);
  // Provide a fallback that does nothing
  topLevelAwait = () => ({
    name: 'vite-plugin-top-level-await-fallback',
    transform: (code) => code
  });
}

export default defineConfig({
  plugins: [
    react(),
    wasm(),              // .wasm ESM integration
    topLevelAwait(),     // allow top-level await used by wasm
  ],
  server: {
    hmr: { overlay: false }   // disable red overlay in dev
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});