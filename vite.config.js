import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Render-friendly Vite config
export default defineConfig({
  base: '/', // Ensure correct asset paths in production
  plugins: [react()],
  server: {
    port: 5173,
    mimeTypes: {
      webmanifest: 'application/manifest+json',
    }
    // fs: { strict: false } // Only uncomment if importing outside root
  },
  build: {
    outDir: 'dist',          // Where Render will serve from
    assetsDir: 'assets',     // Folder for static assets
    sourcemap: true,         // Debugging production errors
    minify: 'esbuild',       // Fast and small builds
    rollupOptions: {
      output: {
        manualChunks: undefined // Avoid splitting into excessive chunks
      }
    }
  }
})
