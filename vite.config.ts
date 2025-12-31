/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ['..']
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/**/__tests__/**',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60
      }
    }
  },
  optimizeDeps: {
    exclude: ['discord.js', 'zlib-sync', 'bufferutil', 'utf-8-validate']
  },
  build: {
    rollupOptions: {
      external: ['discord.js'],
      output: {
        manualChunks: (id) => {
          // Aggressive code splitting for optimal caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('@radix-ui') || id.includes('shadcn')) {
              return 'ui-components';
            }
            return 'vendor';
          }
          // Split pages for route-based lazy loading
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName.toLowerCase()}`;
          }
        },
        // Optimize asset file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 500, // Stricter chunk size enforcement
    modulePreload: {
      polyfill: false,
      resolveDependencies: () => []
    },
    target: 'esnext',
    minify: mode === 'production' ? 'esbuild' : false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    // Source map only for errors
    sourcemap: mode === 'production' ? false : true,
  },
  // Add SSR configuration to prevent hydration mismatches
  ssr: {
    noExternal: ['react', 'react-dom']
  },
  base: '/',
}));

 /* 
  ENV VARS NOTE:
  - Client-safe keys only may be exposed via VITE_* (e.g. VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY).
  - DO NOT expose secrets as VITE_* (e.g. Stripe secret key, Supabase service_role). Store those in Vercel as STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE, etc., and use them only in serverless functions.
  - For Stripe: set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Vercel, use a server function to create/payment intents and verify webhooks.
  - After adding env vars in Vercel, redeploy the project.
*/
