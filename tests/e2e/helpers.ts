import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function ensureEvidenceDir() {
  const dir = path.join(process.cwd(), 'audit', 'evidence');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function screenshotEvidence(page: Page, name: string) {
  const dir = await ensureEvidenceDir();
  const file = path.join(dir, `${Date.now()}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

export async function ensureDevAuditSignedIn(page: Page) {
  await page.goto('/dashboard/dev-audit');
  try {
    await page.waitForSelector('text=Generate Test User & Seed Data', { timeout: 3000 });
    return;
  } catch (e) {
    // possibly redirected to sign-in; try registration flow
  }

  // If on sign-in page, navigate to register
  if ((await page.locator('text=Create account').count()) > 0) {
    await page.click('text=Create account');
  } else {
    await page.goto('/auth/register');
  }

  const email = `playwright+${Date.now()}@example.com`;
  const password = 'Test1234!';

  // fill register form
  await page.fill('#name', 'Playwright Test');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.click('text=Create account');

  // wait for successful redirect/back to dashboard
  await page.waitForURL('**/dashboard/**', { timeout: 20000 });
  await page.goto('/dashboard/dev-audit');
  await page.waitForSelector('text=Generate Test User & Seed Data', { timeout: 10000 });
}
