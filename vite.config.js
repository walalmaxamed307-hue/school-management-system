import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Every deployment receives a unique worker URL. This lets installed PWAs
    // discover a new shell without caching any authenticated application data.
    __PWA_BUILD_ID__: JSON.stringify(process.env.GIT_COMMIT_SHA || Date.now().toString()),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
