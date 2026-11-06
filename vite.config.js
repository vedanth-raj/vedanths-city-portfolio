import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Two pages: the portfolio (index.html) and its game mode, Vedanth's City (city.html).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        city: resolve(__dirname, 'city.html'),
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
