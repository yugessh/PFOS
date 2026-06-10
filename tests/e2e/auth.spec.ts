import { test, expect } from '@playwright/test';
import { screenshotEvidence, ensureDevAuditSignedIn } from './helpers';

test.describe('Authentication', () => {
  test('create test user via Dev Audit and ensure signed-in', async ({ page }) => {
    await ensureDevAuditSignedIn(page);
    await screenshotEvidence(page, 'auth-before');
    await page.click('text=Generate Test User & Seed Data');
    // wait for status to show done
    await page.waitForFunction(() => !!document.querySelector('div[role=main]') || true);
    // poll for status text
    await page.waitForSelector('text=Done. Created seed for user', { timeout: 30000 });
    await screenshotEvidence(page, 'auth-after');
    const status = await page.locator('div.font-mono').innerText();
    expect(status).toContain('Done. Created seed for user');
  });
});
