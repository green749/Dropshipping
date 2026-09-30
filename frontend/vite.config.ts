import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode: _mode }) => ({
  plugins: [
    react({
      compiler: true,
    }),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        ws: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
      },
    },
  },
  build: {
    minify: true,
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const match = id.toString().match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
            if (match) {
              const pkg = match[1];
              if (pkg.includes('recharts') || pkg.includes('d3')) return 'vendor-charts';
              if (pkg.includes('lucide-react')) return 'vendor-icons';
              if (pkg.includes('react') || pkg.includes('redux') || pkg.includes('scheduler')) return 'vendor-framework';
              return `vendor-${pkg.replace(/[@/]/g, '_')}`;
            }
          }
        },
      },
    },
  },
}))

