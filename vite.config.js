import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // Root path for assets
  plugins: [react()],
  server: {
    port: 5173,
    mimeTypes: {
      webmanifest: 'application/manifest+json',
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
