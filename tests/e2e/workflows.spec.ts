import { test, expect } from '@playwright/test';
import { screenshotEvidence, ensureDevAuditSignedIn } from './helpers';

test.describe('Workflow validations', () => {
  test('transaction workflow passes', async ({ page }, testInfo) => {
    await ensureDevAuditSignedIn(page);
    await page.waitForSelector('text=Run Transaction Workflow');
    await screenshotEvidence(page, 'tx-before');
    await page.click('text=Run Transaction Workflow');
    // wait for status update to finish
    const isMobile = testInfo.project.name.toLowerCase().includes('pixel') || testInfo.project.name.toLowerCase().includes('iphone');
    const timeout = isMobile ? 150000 : 60000;
    await page.waitForFunction(() => {
      const el = document.querySelector('div.font-mono');
      return el && (el.textContent.includes('success') || el.textContent.includes('error') || el.textContent.includes('fail'));
    }, undefined, { timeout });
    const status = await page.locator('div.font-mono').innerText();
    expect(status).toContain('success');
    await screenshotEvidence(page, 'tx-after');
  });

  test('goal workflow passes', async ({ page }, testInfo) => {
    await ensureDevAuditSignedIn(page);
    await page.waitForSelector('text=Run Goal Workflow');
    await page.click('text=Run Goal Workflow');
    // wait for status update to finish
    const isMobile = testInfo.project.name.toLowerCase().includes('pixel') || testInfo.project.name.toLowerCase().includes('iphone');
    const timeout = isMobile ? 150000 : 60000;
    await page.waitForFunction(() => {
      const el = document.querySelector('div.font-mono');
      return el && (el.textContent.includes('success') || el.textContent.includes('error') || el.textContent.includes('fail'));
    }, undefined, { timeout });
    const status = await page.locator('div.font-mono').innerText();
    expect(status).toContain('success');
  });
});

