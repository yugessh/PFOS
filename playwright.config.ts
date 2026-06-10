import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Pixel_5', use: { ...devices['Pixel 5'] } },
    { name: 'iPhone_12', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'node ./scripts/dev-with-clean.mjs',
    port: 3000,
    reuseExistingServer: false,
  },
});
