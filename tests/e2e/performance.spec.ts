import { test, expect } from '@playwright/test';

test.describe('Performance measurements', () => {
  test('dashboard load time measurement', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const load = Date.now() - start;
    test.info().annotations.push({ type: 'metric', description: `dashboard_load_ms:${load}` });
    expect(load).toBeGreaterThan(0);
  });
});
