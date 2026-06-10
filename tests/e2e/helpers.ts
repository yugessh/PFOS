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
