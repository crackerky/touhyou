import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: './',
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
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps to reduce memory usage
    minify: 'esbuild', // Use esbuild for minification (faster and less memory intensive)
    target: 'es2022',
    reportCompressedSize: false, // Disable gzip size reporting to save memory
    chunkSizeWarningLimit: 2000, // Increase chunk size warning limit
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      // Reduce memory use by external dependencies
      external: [
        // External dependencies that are causing issues
      ],
      // Reduce memory usage by limiting chunk size and manual chunking
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-mesh': [
            '@meshsdk/core',
            '@meshsdk/react'
          ],
          'vendor-cardano': [
            '@emurgo/cardano-serialization-lib-browser'
          ],
          'vendor-ui': [
            'lucide-react',
            'react-hot-toast',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ]
        },
        // Avoid too large chunks by limiting size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});