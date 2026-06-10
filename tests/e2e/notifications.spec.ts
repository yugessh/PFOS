import { test, expect } from '@playwright/test';
import { screenshotEvidence } from './helpers';

test.describe('Notifications UI validation', () => {
  test('simulate notification and capture UI evidence', async ({ page }) => {
    await page.goto('/dashboard/dev-audit');
    await page.waitForSelector('text=Generate Test User & Seed Data');
    // assume already signed-in from prior test; if not, create
    const status = await page.locator('div.font-mono').innerText().catch(() => '');
    if (!status.includes('Created seed for user')) {
      await page.click('text=Generate Test User & Seed Data');
      await page.waitForSelector('text=Done. Created seed for user', { timeout: 30000 });
    }

    await screenshotEvidence(page, 'notif-before');
    // trigger a notification via simulator button
    await page.click('text=Transaction');

    // wait for top-navbar badge to show an unread count
    const badge = page.locator('[data-testid="notif-badge"]');
    await expect(badge).toBeVisible({ timeout: 5000 });
    const badgeText = await badge.innerText();
    expect(badgeText.length).toBeGreaterThan(0);

    // open notification center and assert newest notification present
    await page.click('[data-testid="notif-button"]');
    const list = page.locator('[data-testid="notif-list"]');
    await expect(list).toBeVisible({ timeout: 5000 });
    const card = page.locator('[data-testid^="notification-card-"]');
    await expect(card.first()).toBeVisible({ timeout: 5000 });

    const after = await screenshotEvidence(page, 'notif-after');
    test.info().annotations.push({ type: 'screenshot', description: after });
  });
});
