import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // use current directory (where index.html is)
  build: {
    outDir: 'dist'
  },
  server: {
    open: true
  }
});


