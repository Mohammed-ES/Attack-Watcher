import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration de Vite avec proxy vers le backend FastAPI
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

