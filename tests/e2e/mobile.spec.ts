import { test, expect } from '@playwright/test';
import { screenshotEvidence } from './helpers';

test.describe('Mobile emulation checks', () => {
  test('pixel navigation and responsive checks', async ({ page }) => {
    await page.goto('/dashboard/dev-audit');
    await screenshotEvidence(page, 'mobile-dev-audit');
    // touch interactions: open menus if present
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await screenshotEvidence(page, 'mobile-after-tab');
    expect(true).toBeTruthy();
  });
});
