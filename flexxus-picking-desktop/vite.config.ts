import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    // WebSocket proxy for local development
    // Routes ws://localhost:3000/ws → ws://localhost:6001
    proxy: {
      '/ws': {
        target: 'ws://localhost:6001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
