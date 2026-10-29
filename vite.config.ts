import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site lives under /<repo>/; the deploy workflow sets
  // VITE_BASE=/moilanenari-demo/. Local dev and other hosts use the root.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  // Own port so it doesn't collide with other local Vite projects on 5173
  server: {
    port: 5180,
    // Bind to IPv4 loopback: on Windows "localhost" resolves to ::1 only,
    // which external browsers using 127.0.0.1 can't reach
    host: '127.0.0.1',
    // Transform the app entry before the first browser request arrives
    warmup: { clientFiles: ['./src/main.tsx'] },
  },
  // Pre-bundle every runtime dependency up front, so Vite never has to
  // re-optimise (and force-reload the page) in the middle of a first load.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react-router', 'motion/react', 'lucide-react'],
  },
  preview: { port: 4180 },
  build: {
    rolldownOptions: {
      output: {
        // Framework code and the catalogue dataset change at different
        // rates than the app, so they get their own cacheable chunks.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'catalog-data', test: /products\.generated/ },
          ],
        },
      },
    },
  },
})
