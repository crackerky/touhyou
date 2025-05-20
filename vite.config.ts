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
      // Node polyfills must come first
      this.getNodePolyfillsPlugin(),
      react(),
      wasm()
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
      enforce: 'pre', // Execute before other plugins
      apply: 'build' // Apply during build
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
      'process.env': process.env,
      global: 'globalThis'
    };
  }
}

/**
 * Build configuration manager
 */
class BuildConfig {
  getConfig() {
    return {
      sourcemap: true,
      commonjsOptions: {
        transformMixedEsModules: true
      }
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
      build: this.buildConfig.getConfig(),
      resolve: {
        alias: {
          // Add explicit aliases for problematic modules
          global: require.resolve('rollup-plugin-node-polyfills/polyfills/global')
        }
      }
    });
  }
}

// Create configuration manager and export the generated configuration
const configManager = new ViteConfigManager();
export default configManager.generateConfig();