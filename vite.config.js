import { defineConfig } from 'vite'
export default defineConfig({
  experimental: { bundledDev: true },
  // TanStack Start sets this (code-split CSS must exist before a browser requests chunks).
  build: { rolldownOptions: { experimental: { devMode: { lazy: false } } } },
})
