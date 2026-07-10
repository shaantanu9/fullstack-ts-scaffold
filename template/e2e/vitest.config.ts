import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['e2e/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/', '.next/'],
    globalSetup: ['./e2e/globalSetup.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    teardownTimeout: 30000,
    fileParallelism: false,
    maxConcurrency: 1,
  },
});
