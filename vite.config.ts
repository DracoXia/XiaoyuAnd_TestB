
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    // Polyfill process.env to prevent "process is not defined" runtime error
    'process.env': {}
  }
});