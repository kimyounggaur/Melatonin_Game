import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  outputDir: 'output/playwright/test-results',
  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/browser-results.json' }],
    ['html', { outputFolder: 'reports/browser-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.NIGHT_THREAD_BASE_URL ?? 'http://127.0.0.1:5286',
    headless: true,
    viewport: { width: 1366, height: 768 },
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', testIgnore: /webkit-static\.spec\.ts/, use: { browserName: 'chromium', channel: 'chrome', launchOptions: { args: ['--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] } } },
    { name: 'firefox', use: { browserName: 'firefox' }, testIgnore: [/all-levels\.spec\.ts/,/webkit-static\.spec\.ts/,/calibration\.spec\.ts/], grepInvert: /E05: real browser screen orientation/ },
    // Windows Playwright WebKit has no Web Audio API. Its real capability/error
    // and rendering tests are selected explicitly; no fake AudioContext is used.
    { name: 'webkit', use: { browserName: 'webkit' }, testMatch: /webkit-static\.spec\.ts/ },
  ],
});
