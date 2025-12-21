const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST;

const plugins = {};
if (!isTest) {
  // Only enable Tailwind/PostCSS autoprefixer in non-test environments.
  // This avoids loading heavy caniuse/autoprefixer data during unit tests
  // which can cause high memory usage in constrained test runners.
  plugins.tailwindcss = {};
  plugins.autoprefixer = {};
}

export default { plugins };