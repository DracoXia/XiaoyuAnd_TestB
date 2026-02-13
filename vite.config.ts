
/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载当前环境的环境变量（包括 Netlify 注入的变量）
  // Use (process as any).cwd() to avoid TypeScript error about missing property on Process interface
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    define: {
      // 关键修复：将构建环境中的 API_KEY 字符串化后注入到前端代码中
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // 防止其他 process.env 访问导致 crash
      'process.env': {}
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setup.ts'],
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'test/',
          'dist/',
        ],
      },
    },
  };
});
