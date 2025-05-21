// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import wasm from "file:///home/project/node_modules/vite-plugin-wasm/exports/import.mjs";
import { nodePolyfills } from "file:///home/project/node_modules/vite-plugin-node-polyfills/dist/index.js";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [
    react(),
    wasm(),
    nodePolyfills({
      // Explicitly specify which polyfills to include
      include: [
        "buffer",
        "process",
        "util",
        "stream",
        "events",
        "path",
        "crypto"
      ],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  resolve: {
    alias: {
      "node-fetch": "isomorphic-fetch"
    }
  },
  define: {
    global: "window",
    "process.env": process.env
  },
  server: {
    hmr: { overlay: false }
  },
  optimizeDeps: {
    exclude: ["lucide-react", "@emurgo/cardano-serialization-lib-browser"],
    esbuildOptions: {
      target: "es2022",
      supported: {
        bigint: true
      }
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    // Disable sourcemaps to reduce memory usage
    minify: "esbuild",
    // Use esbuild for minification (faster and less memory intensive)
    target: "es2022",
    reportCompressedSize: false,
    // Disable gzip size reporting to save memory
    chunkSizeWarningLimit: 2e3,
    // Increase chunk size warning limit
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
          "vendor-react": ["react", "react-dom"],
          "vendor-framer": ["framer-motion"],
          "vendor-mesh": [
            "@meshsdk/core",
            "@meshsdk/react"
          ],
          "vendor-cardano": [
            "@emurgo/cardano-serialization-lib-browser"
          ],
          "vendor-ui": [
            "lucide-react",
            "react-hot-toast",
            "class-variance-authority",
            "clsx",
            "tailwind-merge"
          ]
        },
        // Avoid too large chunks by limiting size
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgd2FzbSBmcm9tICd2aXRlLXBsdWdpbi13YXNtJztcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcuLycsXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHdhc20oKSxcbiAgICBub2RlUG9seWZpbGxzKHtcbiAgICAgIC8vIEV4cGxpY2l0bHkgc3BlY2lmeSB3aGljaCBwb2x5ZmlsbHMgdG8gaW5jbHVkZVxuICAgICAgaW5jbHVkZTogW1xuICAgICAgICAnYnVmZmVyJywgXG4gICAgICAgICdwcm9jZXNzJywgXG4gICAgICAgICd1dGlsJywgXG4gICAgICAgICdzdHJlYW0nLCBcbiAgICAgICAgJ2V2ZW50cycsXG4gICAgICAgICdwYXRoJyxcbiAgICAgICAgJ2NyeXB0bydcbiAgICAgIF0sXG4gICAgICBnbG9iYWxzOiB7XG4gICAgICAgIEJ1ZmZlcjogdHJ1ZSxcbiAgICAgICAgZ2xvYmFsOiB0cnVlLFxuICAgICAgICBwcm9jZXNzOiB0cnVlXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdub2RlLWZldGNoJzogJ2lzb21vcnBoaWMtZmV0Y2gnXG4gICAgfVxuICB9LFxuICBkZWZpbmU6IHsgXG4gICAgZ2xvYmFsOiAnd2luZG93JyxcbiAgICAncHJvY2Vzcy5lbnYnOiBwcm9jZXNzLmVudlxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBobXI6IHsgb3ZlcmxheTogZmFsc2UgfVxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCcsICdAZW11cmdvL2NhcmRhbm8tc2VyaWFsaXphdGlvbi1saWItYnJvd3NlciddLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICB0YXJnZXQ6ICdlczIwMjInLFxuICAgICAgc3VwcG9ydGVkOiB7XG4gICAgICAgIGJpZ2ludDogdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsIC8vIERpc2FibGUgc291cmNlbWFwcyB0byByZWR1Y2UgbWVtb3J5IHVzYWdlXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsIC8vIFVzZSBlc2J1aWxkIGZvciBtaW5pZmljYXRpb24gKGZhc3RlciBhbmQgbGVzcyBtZW1vcnkgaW50ZW5zaXZlKVxuICAgIHRhcmdldDogJ2VzMjAyMicsXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlLCAvLyBEaXNhYmxlIGd6aXAgc2l6ZSByZXBvcnRpbmcgdG8gc2F2ZSBtZW1vcnlcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsIC8vIEluY3JlYXNlIGNodW5rIHNpemUgd2FybmluZyBsaW1pdFxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAgICAgaW5jbHVkZTogWy9ub2RlX21vZHVsZXMvXSxcbiAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAvLyBSZWR1Y2UgbWVtb3J5IHVzZSBieSBleHRlcm5hbCBkZXBlbmRlbmNpZXNcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgIC8vIEV4dGVybmFsIGRlcGVuZGVuY2llcyB0aGF0IGFyZSBjYXVzaW5nIGlzc3Vlc1xuICAgICAgXSxcbiAgICAgIC8vIFJlZHVjZSBtZW1vcnkgdXNhZ2UgYnkgbGltaXRpbmcgY2h1bmsgc2l6ZSBhbmQgbWFudWFsIGNodW5raW5nXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgJ3ZlbmRvci1mcmFtZXInOiBbJ2ZyYW1lci1tb3Rpb24nXSxcbiAgICAgICAgICAndmVuZG9yLW1lc2gnOiBbXG4gICAgICAgICAgICAnQG1lc2hzZGsvY29yZScsXG4gICAgICAgICAgICAnQG1lc2hzZGsvcmVhY3QnXG4gICAgICAgICAgXSxcbiAgICAgICAgICAndmVuZG9yLWNhcmRhbm8nOiBbXG4gICAgICAgICAgICAnQGVtdXJnby9jYXJkYW5vLXNlcmlhbGl6YXRpb24tbGliLWJyb3dzZXInXG4gICAgICAgICAgXSxcbiAgICAgICAgICAndmVuZG9yLXVpJzogW1xuICAgICAgICAgICAgJ2x1Y2lkZS1yZWFjdCcsXG4gICAgICAgICAgICAncmVhY3QtaG90LXRvYXN0JyxcbiAgICAgICAgICAgICdjbGFzcy12YXJpYW5jZS1hdXRob3JpdHknLFxuICAgICAgICAgICAgJ2Nsc3gnLFxuICAgICAgICAgICAgJ3RhaWx3aW5kLW1lcmdlJ1xuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gQXZvaWQgdG9vIGxhcmdlIGNodW5rcyBieSBsaW1pdGluZyBzaXplXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XSdcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUU5QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsSUFDTCxjQUFjO0FBQUE7QUFBQSxNQUVaLFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxjQUFjO0FBQUEsSUFDaEI7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlLFFBQVE7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sS0FBSyxFQUFFLFNBQVMsTUFBTTtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsZ0JBQWdCLDJDQUEyQztBQUFBLElBQ3JFLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLFFBQ1QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBO0FBQUEsSUFDWCxRQUFRO0FBQUE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLHNCQUFzQjtBQUFBO0FBQUEsSUFDdEIsdUJBQXVCO0FBQUE7QUFBQSxJQUN2QixpQkFBaUI7QUFBQSxNQUNmLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIseUJBQXlCO0FBQUEsSUFDM0I7QUFBQSxJQUNBLGVBQWU7QUFBQTtBQUFBLE1BRWIsVUFBVTtBQUFBO0FBQUEsTUFFVjtBQUFBO0FBQUEsTUFFQSxRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUNyQyxpQkFBaUIsQ0FBQyxlQUFlO0FBQUEsVUFDakMsZUFBZTtBQUFBLFlBQ2I7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFVBQ0Esa0JBQWtCO0FBQUEsWUFDaEI7QUFBQSxVQUNGO0FBQUEsVUFDQSxhQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBO0FBQUEsUUFFQSxnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
