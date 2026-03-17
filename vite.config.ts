import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/content.ts'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        popup: resolve(__dirname, 'src/popup/popup.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'content') return 'content/content.js';
          if (chunk.name === 'service-worker') return 'background/service-worker.js';
          if (chunk.name === 'popup') return 'popup/popup.js';
          return '[name].js';
        },
        format: 'es',
      },
    },
    target: 'esnext',
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
