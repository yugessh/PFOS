import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 1,
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
    { 
      name: 'Pixel_5', 
      use: { 
        ...devices['Pixel 5'], 
        actionTimeout: 90000 
      },
      timeout: 180000
    },
    { 
      name: 'iPhone_12', 
      use: { 
        ...devices['iPhone 12'], 
        actionTimeout: 90000 
      },
      timeout: 180000
    },
  ],
  webServer: {
    command: 'node ./scripts/dev-with-clean.mjs',
    port: 3000,
    reuseExistingServer: true,
  },
});
