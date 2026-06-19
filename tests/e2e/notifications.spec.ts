import { test, expect } from '@playwright/test';
import { screenshotEvidence, ensureDevAuditSignedIn } from './helpers';

test.describe('Notifications UI validation', () => {
  test('simulate notification and capture UI evidence', async ({ page }) => {
    await ensureDevAuditSignedIn(page);
    await screenshotEvidence(page, 'notif-before');
    // trigger a notification via simulator button
    await page.click('button:has-text("Transaction")');

    // check if current viewport is mobile
    const isMobile = page.viewportSize() ? page.viewportSize()!.width < 1024 : false;

    // wait for top-navbar badge to show an unread count
    const badge = page.locator(isMobile ? '[data-testid="notif-badge-mobile"]' : '[data-testid="notif-badge"]');
    await expect(badge).toBeVisible({ timeout: 10000 });
    const badgeText = await badge.innerText();
    expect(badgeText.length).toBeGreaterThan(0);

    // open notification center and assert newest notification present
    await page.click(isMobile ? '[data-testid="notif-button-mobile"]' : '[data-testid="notif-button"]');
    const list = page.locator('[data-testid="notif-list"]');
    await expect(list).toBeVisible({ timeout: 10000 });
    const card = page.locator('[data-testid^="notification-card-"]');
    await expect(card.first()).toBeVisible({ timeout: 10000 });

    const after = await screenshotEvidence(page, 'notif-after');
    test.info().annotations.push({ type: 'screenshot', description: after });
  });
});
