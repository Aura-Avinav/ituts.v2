import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Faster transpilation target
    target: 'es2020',
    // Disable sourcemaps in production (saves build time + bundle size)
    sourcemap: false,
    // Raise chunk size warning threshold (framer-motion + recharts are large by design)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, pulled from node_modules
          'react-vendor': ['react', 'react-dom', 'react-dom/client'],
          // Animation + icons + charts — large but stable, cached well
          'ui-vendor': ['framer-motion', 'lucide-react', 'recharts'],
          // Data layer — Supabase SDK + date utilities
          'data-vendor': ['@supabase/supabase-js', 'date-fns'],
        }
      }
    }
  }
})

