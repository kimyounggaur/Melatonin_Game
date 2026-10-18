import { defineConfig } from 'vitest/config';
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
  server: { watch: { ignored: ['**/reports/**','**/output/**','**/test-results/**','**/docs/**'] } },
  test: { include: ['tests/**/*.test.ts'], exclude: ['tests/e2e/**'] }
});
