import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.js',
    // Disable worker threads to avoid intermittent OOM in constrained environments
    threads: false,
    // Limit concurrency to further reduce memory pressure
    maxThreads: 1,
    maxConcurrency: 1,
    // Avoid transforming CSS files during tests to prevent heavy PostCSS/autoprefixer
    // work (loads caniuse-lite, baseline mappings). Only transform JS/TS files.
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
  },
});
