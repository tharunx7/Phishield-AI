import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Important for loading assets correctly in Chrome extension
  build: {
    outDir: '../extension/dashboard_dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
