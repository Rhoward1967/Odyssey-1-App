import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    strictPort: false, // Allow fallback ports
    hmr: {
      overlay: true, // Show errors in browser
      port: 8082,
      clientPort: 8082
    },
    watch: {
      usePolling: true, // Better file watching
      interval: 100,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    cors: true,
    open: false, // Don't auto-open browser (VS Code will handle)
    fs: {
      strict: false, // Allow serving files outside root
      allow: ['..']
    },
    middlewareMode: false,
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx']
    }
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true, // Essential for debugging
    minify: mode === 'production',
    rollupOptions: {
      onwarn: (warning, warn) => {
        // Suppress common warnings that don't affect functionality
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    },
    chunkSizeWarningLimit: 1200,
    target: 'esnext'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'clsx',
      'class-variance-authority'
    ],
    force: true, // Force re-optimization on restart
    esbuildOptions: {
      target: 'esnext'
    }
  },
  define: {
    global: 'globalThis',
    __DEV__: mode === 'development'
  },
  esbuild: {
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
      'direct-eval': 'silent'
    },
    target: 'esnext',
    keepNames: true // Better debugging
  },
  clearScreen: false, // Keep terminal history
  logLevel: 'info'
}));
