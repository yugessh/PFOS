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

  // Ensure we're on the register page
  await page.goto('/auth/register');

  const email = `playwright+${Date.now()}@example.com`;
  const password = 'Test1234!';

  // fill register form
  await page.fill('#name', 'Playwright Test');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  // click the submit button explicitly (avoid heading/link collisions)
  await page.click('button:has-text("Create account")');

  // wait for successful redirect/back to dashboard
  await page.waitForURL('**/dashboard/**', { timeout: 20000 });
  await page.goto('/dashboard/dev-audit');
  await page.waitForSelector('text=Generate Test User & Seed Data', { timeout: 10000 });
}
