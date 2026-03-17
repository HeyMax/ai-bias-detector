import { defineConfig } from 'vite';
import { resolve } from 'path';

const entries = [
  { name: 'content', input: 'src/content/content.ts', out: 'content/content.js' },
  { name: 'service-worker', input: 'src/background/service-worker.ts', out: 'background/service-worker.js' },
  { name: 'popup', input: 'src/popup/popup.ts', out: 'popup/popup.js' },
];

const target = process.env.BUILD_ENTRY ?? 'content';
const entry = entries.find(e => e.name === target) ?? entries[0];

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, entry.input),
      output: {
        entryFileNames: entry.out,
        format: 'iife',
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
