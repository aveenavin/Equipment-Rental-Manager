import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Never expose source maps in production — protects your source code
    sourcemap: false,

    // Warn when a chunk exceeds 800 KB
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Split vendor libraries into separate chunks for better browser caching.
        // Function form is required for Vite 8+ (Rolldown bundler).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
            if (id.includes('react-router-dom') || id.includes('react-router/')) return 'vendor-router';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms';
            if (id.includes('framer-motion') || id.includes('@headlessui') || id.includes('lucide-react')) return 'vendor-ui';
            if (id.includes('axios')) return 'vendor-axios';
          }
        },
      },
    },
  },
});
