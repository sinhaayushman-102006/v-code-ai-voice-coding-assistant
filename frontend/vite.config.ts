import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
    proxy: {
      // Backend runs on 5000; frontend calls /api/* which gets proxied there
      // in dev so no CORS setup is needed for local development.
      '/api': 'http://localhost:5000',
    },
  },
})
