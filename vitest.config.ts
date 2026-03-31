import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export type VitestConfig = ReturnType<typeof defineConfig>;

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/domain': resolve(__dirname, './src/domain'),
      '@/application': resolve(__dirname, './src/application'),
      '@/infrastructure': resolve(__dirname, './src/infrastructure'),
      '@/presentation': resolve(__dirname, './src/presentation'),
      '@/shared': resolve(__dirname, './src/shared'),
      '@/tests': resolve(__dirname, './tests')
    }
  }
});