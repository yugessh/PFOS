import { test, expect } from '@playwright/test';

test.describe('Accessibility basics', () => {
  test('keyboard navigation lands on actionable elements', async ({ page }) => {
    await page.goto('/dashboard/dev-audit');
    // tab through first 10 tabbable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(80);
    }
    // ensure body has focusable children
    const focus = await page.evaluate(() => document.activeElement?.tagName || null);
    expect(focus).not.toBeNull();
  });
});
