import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages deployment (https://ppltok.github.io/Nesty/)
  base: '/Nesty/',
  plugins: [react()],
  build: {
    // Include content hash in filenames for cache busting
    rollupOptions: {
      output: {
        // Use content hash for all assets
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generate source maps for debugging
    sourcemap: true,
  },
})
