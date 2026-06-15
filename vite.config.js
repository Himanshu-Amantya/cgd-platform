import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the production build also works when opened from a static host / subpath
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
    proxy: { '/api': 'http://localhost:4000' },   // dev: forward API calls to the Express server
  },
})
