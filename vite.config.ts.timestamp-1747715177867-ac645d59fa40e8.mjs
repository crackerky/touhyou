// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import wasm from "file:///home/project/node_modules/vite-plugin-wasm/exports/import.mjs";
var topLevelAwait;
try {
  topLevelAwait = (await import("file:///home/project/node_modules/vite-plugin-top-level-await/exports/import.mjs")).default;
} catch (error) {
  console.warn("Warning: vite-plugin-top-level-await could not be loaded:", error);
  topLevelAwait = () => ({
    name: "vite-plugin-top-level-await-fallback",
    transform: (code) => code
  });
}
var vite_config_default = defineConfig({
  plugins: [
    react(),
    wasm(),
    // .wasm ESM integration
    topLevelAwait()
    // allow top-level await used by wasm
  ],
  server: {
    hmr: { overlay: false }
    // disable red overlay in dev
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgd2FzbSBmcm9tICd2aXRlLXBsdWdpbi13YXNtJztcbi8vIENvbmRpdGlvbmFsbHkgaW1wb3J0IHRvcExldmVsQXdhaXQgdG8gaGFuZGxlIHBvdGVudGlhbCBlcnJvcnNcbmxldCB0b3BMZXZlbEF3YWl0O1xudHJ5IHtcbiAgdG9wTGV2ZWxBd2FpdCA9IChhd2FpdCBpbXBvcnQoJ3ZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdCcpKS5kZWZhdWx0O1xufSBjYXRjaCAoZXJyb3IpIHtcbiAgY29uc29sZS53YXJuKCdXYXJuaW5nOiB2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQgY291bGQgbm90IGJlIGxvYWRlZDonLCBlcnJvcik7XG4gIC8vIFByb3ZpZGUgYSBmYWxsYmFjayB0aGF0IGRvZXMgbm90aGluZ1xuICB0b3BMZXZlbEF3YWl0ID0gKCkgPT4gKHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tdG9wLWxldmVsLWF3YWl0LWZhbGxiYWNrJyxcbiAgICB0cmFuc2Zvcm06IChjb2RlKSA9PiBjb2RlXG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB3YXNtKCksICAgICAgICAgICAgICAvLyAud2FzbSBFU00gaW50ZWdyYXRpb25cbiAgICB0b3BMZXZlbEF3YWl0KCksICAgICAvLyBhbGxvdyB0b3AtbGV2ZWwgYXdhaXQgdXNlZCBieSB3YXNtXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIGhtcjogeyBvdmVybGF5OiBmYWxzZSB9ICAgLy8gZGlzYWJsZSByZWQgb3ZlcmxheSBpbiBkZXZcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUVqQixJQUFJO0FBQ0osSUFBSTtBQUNGLG1CQUFpQixNQUFNLE9BQU8sa0ZBQTZCLEdBQUc7QUFDaEUsU0FBUyxPQUFPO0FBQ2QsVUFBUSxLQUFLLDZEQUE2RCxLQUFLO0FBRS9FLGtCQUFnQixPQUFPO0FBQUEsSUFDckIsTUFBTTtBQUFBLElBQ04sV0FBVyxDQUFDLFNBQVM7QUFBQSxFQUN2QjtBQUNGO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBO0FBQUEsSUFDTCxjQUFjO0FBQUE7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sS0FBSyxFQUFFLFNBQVMsTUFBTTtBQUFBO0FBQUEsRUFDeEI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
