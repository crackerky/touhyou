// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import wasm from "file:///home/project/node_modules/vite-plugin-wasm/exports/import.mjs";
import { nodePolyfills } from "file:///home/project/node_modules/vite-plugin-node-polyfills/dist/index.js";
import topLevelAwait from "file:///home/project/node_modules/vite-plugin-top-level-await/exports/import.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i) => `__tla_${i}`
    }),
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
      // Avoid alias that might cause circular references
      "@emurgo/cardano-serialization-lib-browser": "@emurgo/cardano-serialization-lib-browser"
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
    exclude: ["lucide-react"],
    include: ["@supabase/supabase-js"],
    esbuildOptions: {
      target: "esnext",
      supported: {
        bigint: true
      }
    }
  },
  build: {
    sourcemap: true,
    target: "esnext",
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgd2FzbSBmcm9tICd2aXRlLXBsdWdpbi13YXNtJztcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tICd2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB3YXNtKCksXG4gICAgdG9wTGV2ZWxBd2FpdCh7XG4gICAgICAvLyBUaGUgZXhwb3J0IG5hbWUgb2YgdG9wLWxldmVsIGF3YWl0IHByb21pc2UgZm9yIGVhY2ggY2h1bmsgbW9kdWxlXG4gICAgICBwcm9taXNlRXhwb3J0TmFtZTogXCJfX3RsYVwiLFxuICAgICAgLy8gVGhlIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGltcG9ydCBuYW1lcyBvZiB0b3AtbGV2ZWwgYXdhaXQgcHJvbWlzZSBpbiBlYWNoIGNodW5rIG1vZHVsZVxuICAgICAgcHJvbWlzZUltcG9ydE5hbWU6IGkgPT4gYF9fdGxhXyR7aX1gXG4gICAgfSksXG4gICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICAvLyBFeHBsaWNpdGx5IHNwZWNpZnkgd2hpY2ggcG9seWZpbGxzIHRvIGluY2x1ZGVcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ2J1ZmZlcicsIFxuICAgICAgICAncHJvY2VzcycsIFxuICAgICAgICAndXRpbCcsIFxuICAgICAgICAnc3RyZWFtJywgXG4gICAgICAgICdldmVudHMnLFxuICAgICAgICAncGF0aCcsXG4gICAgICAgICdjcnlwdG8nXG4gICAgICBdLFxuICAgICAgZ2xvYmFsczoge1xuICAgICAgICBCdWZmZXI6IHRydWUsXG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgICAgcHJvY2VzczogdHJ1ZVxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAvLyBBdm9pZCBhbGlhcyB0aGF0IG1pZ2h0IGNhdXNlIGNpcmN1bGFyIHJlZmVyZW5jZXNcbiAgICAgICdAZW11cmdvL2NhcmRhbm8tc2VyaWFsaXphdGlvbi1saWItYnJvd3Nlcic6ICdAZW11cmdvL2NhcmRhbm8tc2VyaWFsaXphdGlvbi1saWItYnJvd3NlcidcbiAgICB9XG4gIH0sXG4gIGRlZmluZTogeyBcbiAgICBnbG9iYWw6ICd3aW5kb3cnLFxuICAgICdwcm9jZXNzLmVudic6IHByb2Nlc3MuZW52XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhtcjogeyBvdmVybGF5OiBmYWxzZSB9XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgaW5jbHVkZTogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICAgIHN1cHBvcnRlZDoge1xuICAgICAgICBiaWdpbnQ6IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICBpbmNsdWRlOiBbL25vZGVfbW9kdWxlcy9dXG4gICAgfVxuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxtQkFBbUI7QUFFMUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLElBQ0wsY0FBYztBQUFBO0FBQUEsTUFFWixtQkFBbUI7QUFBQTtBQUFBLE1BRW5CLG1CQUFtQixPQUFLLFNBQVMsQ0FBQztBQUFBLElBQ3BDLENBQUM7QUFBQSxJQUNELGNBQWM7QUFBQTtBQUFBLE1BRVosU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBLE1BRUwsNkNBQTZDO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlLFFBQVE7QUFBQSxFQUN6QjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sS0FBSyxFQUFFLFNBQVMsTUFBTTtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQ3hCLFNBQVMsQ0FBQyx1QkFBdUI7QUFBQSxJQUNqQyxnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxRQUNULFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLGlCQUFpQjtBQUFBLE1BQ2YsU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
