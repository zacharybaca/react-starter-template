import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    fs: { strict: false },
    mimeTypes: {
      webmanifest: 'application/manifest+json',
    },
    historyApiFallback: {
      disableDotRule: true, // Ensures non-HTML files aren't caught in SPA routing
    },
  build: {
    outDir: 'dist', // ✅ Ensures dist exists after build
    assetsDir: 'assets', // ✅ Used for bundled assets
  }
})
