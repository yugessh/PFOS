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
  try {
    await page.goto('/dashboard/dev-audit');
  } catch (e) {}

  // Wait for either the seed button to become visible (authenticated) or redirect to login (unauthenticated)
  try {
    await Promise.race([
      page.waitForSelector('text=Generate Test User & Seed Data', { state: 'visible', timeout: 45000 }).then(() => 'signed_in'),
      page.waitForURL('**/auth/login', { timeout: 45000 }).then(() => 'not_signed_in')
    ]);
  } catch (e) {}

  // Check if we are signed in
  const btn = page.locator('text=Generate Test User & Seed Data');
  if (await btn.isVisible()) {
    return;
  }

  // Go to register
  await page.goto('/auth/register');
  await page.waitForSelector('#name', { state: 'visible', timeout: 45000 });

  const email = 'playwright.test@example.com';
  const password = 'Test1234!';

  // fill register form
  await page.fill('#name', 'Playwright Test');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.click('button[type="submit"]');

  // Wait to see if we redirect to dashboard OR if we see the email-already-in-use error
  const outcome = await Promise.race([
    page.waitForURL('**/dashboard/**', { timeout: 60000 }).then(() => 'dashboard'),
    page.waitForSelector('text=email-already-in-use', { state: 'visible', timeout: 45000 }).then(() => 'already_exists'),
    page.waitForSelector('text=already in use', { state: 'visible', timeout: 45000 }).then(() => 'already_exists')
  ]).catch(() => 'timeout');

  if (outcome === 'dashboard') {
    await page.goto('/dashboard/dev-audit');
    await page.waitForSelector('text=Generate Test User & Seed Data', { state: 'visible', timeout: 45000 });
    return;
  }

  // If already exists or timed out, let's login
  await page.goto('/auth/login');
  await page.waitForSelector('#email', { state: 'visible', timeout: 45000 });
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard/**', { timeout: 60000 });
  await page.goto('/dashboard/dev-audit');
  await page.waitForSelector('text=Generate Test User & Seed Data', { state: 'visible', timeout: 60000 });
}
