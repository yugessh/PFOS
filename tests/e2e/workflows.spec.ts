import { test, expect } from '@playwright/test';
import { screenshotEvidence, ensureDevAuditSignedIn } from './helpers';

test.describe('Workflow validations', () => {
  test('transaction workflow passes', async ({ page }) => {
    await ensureDevAuditSignedIn(page);
    await page.waitForSelector('text=Run Transaction Workflow');
    await screenshotEvidence(page, 'tx-before');
    await page.click('text=Run Transaction Workflow');
    // wait for status update
    await page.waitForTimeout(2000);
    const status = await page.locator('div.font-mono').innerText();
    expect(status).toContain('success');
    await screenshotEvidence(page, 'tx-after');
  });

  test('goal workflow passes', async ({ page }) => {
    await page.goto('/dashboard/dev-audit');
    await page.waitForSelector('text=Run Goal Workflow');
    await page.click('text=Run Goal Workflow');
    await page.waitForTimeout(1500);
    const status = await page.locator('div.font-mono').innerText();
    expect(status).toContain('success');
  });
});
