import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    // Generate output in a 'dist' folder that we will load into Chrome
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'background.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
});
