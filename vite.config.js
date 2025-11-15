import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.js",
  },
  // Dev server proxy: forward API calls to Django backend so cookies are same-origin
  server: {
    proxy: {
      // Proxy any requests starting with /photo or /api to the Django dev server
      '/photo': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          oauth: ['@react-oauth/google'],
          icons: ['react-icons'],
        },
      },
    },
  },
})
