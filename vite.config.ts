/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1200, // Increased limit for Phase 4 optimizations
    // Fix preload warnings by disabling modulePreload for unused chunks
    modulePreload: {
      polyfill: false,
      resolveDependencies: () => []
    },
    // Fix hydration errors by ensuring consistent builds
    target: 'esnext',
    minify: mode === 'production' ? 'esbuild' : false,
  },
  // Add SSR configuration to prevent hydration mismatches
  ssr: {
    noExternal: ['react', 'react-dom']
  },
}));
