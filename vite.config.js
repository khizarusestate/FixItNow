import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env variables
  const env = loadEnv(mode, process.cwd(), '')

  if (mode === 'production' && !env.VITE_API_BASE_URL) {
    console.warn(
      '[FixItNow] VITE_API_BASE_URL is unset — build will use localhost:5000. Set it in CI before npm run build.',
    )
  }

  return {
    plugins: [react(), tailwindcss()],

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('leaflet')) return 'leaflet'
              if (id.includes('socket.io-client')) return 'socket'
              if (
                id.includes('react-phone-number-input') ||
                id.includes('country-flag-icons')
              ) {
                return 'phone'
              }
              if (id.includes('lucide-react')) return 'icons'
              if (id.includes('react-dom') || id.includes('react/'))
                return 'vendor'
            }
          },
        },
      },
    },

    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL || 'http://localhost:5000',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
