import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import nodePolyfills from 'rollup-plugin-node-polyfills';

/**
 * Plugin configuration manager
 */
class PluginsConfig {
  getPlugins() {
    return [
      react(),
      wasm(),
      this.getNodePolyfillsPlugin()
    ];
  }
  
  private getNodePolyfillsPlugin() {
    return {
      ...nodePolyfills({
        include: [
          'buffer', 
          'process', 
          'stream', 
          'events', 
          'util', 
          'path'
        ]
      }),
      enforce: 'pre' // Execute before other plugins
    };
  }
}

/**
 * Server configuration manager
 */
class ServerConfig {
  getConfig() {
    return {
      hmr: { overlay: false }
    };
  }
}

/**
 * Dependencies optimization configuration manager
 */
class OptimizeDepsConfig {
  getConfig() {
    return {
      exclude: ['lucide-react'],
    };
  }
}

/**
 * Global definitions configuration manager
 */
class DefineConfig {
  getConfig() {
    return {
      // Define global before it's used in any module
      global: 'window',
      'process.env': process.env
    };
  }
}

/**
 * Build configuration manager
 */
class BuildConfig {
  getConfig() {
    return {
      sourcemap: true
    };
  }
}

/**
 * Main Vite configuration manager
 */
class ViteConfigManager {
  private pluginsConfig: PluginsConfig;
  private serverConfig: ServerConfig;
  private optimizeDepsConfig: OptimizeDepsConfig;
  private defineConfig: DefineConfig;
  private buildConfig: BuildConfig;
  
  constructor() {
    this.pluginsConfig = new PluginsConfig();
    this.serverConfig = new ServerConfig();
    this.optimizeDepsConfig = new OptimizeDepsConfig();
    this.defineConfig = new DefineConfig();
    this.buildConfig = new BuildConfig();
  }
  
  generateConfig() {
    return defineConfig({
      plugins: this.pluginsConfig.getPlugins(),
      server: this.serverConfig.getConfig(),
      optimizeDeps: this.optimizeDepsConfig.getConfig(),
      define: this.defineConfig.getConfig(),
      build: this.buildConfig.getConfig()
    });
  }
}

// Create configuration manager and export the generated configuration
const configManager = new ViteConfigManager();
export default configManager.generateConfig();