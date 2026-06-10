# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.ts >> Notifications UI validation >> simulate notification and capture UI evidence
- Location: tests\e2e\notifications.spec.ts:5:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Generate Test User & Seed Data') to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - paragraph [ref=e8]: PFOS
        - heading "Sign in" [level=1] [ref=e9]
        - paragraph [ref=e10]: Access your finance dashboard.
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: Email address
          - textbox "Email address" [ref=e14]:
            - /placeholder: you@example.com
        - generic [ref=e15]:
          - generic [ref=e16]: Password
          - textbox "Password" [ref=e17]:
            - /placeholder: Enter your password
        - button "Sign in" [ref=e18]
        - button "Continue with Google" [ref=e19]
      - generic [ref=e20]:
        - text: New user?
        - link "Create account" [ref=e21] [cursor=pointer]:
          - /url: /auth/register
  - region "Notifications (F8)":
    - list
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { screenshotEvidence } from './helpers';
  3  | 
  4  | test.describe('Notifications UI validation', () => {
  5  |   test('simulate notification and capture UI evidence', async ({ page }) => {
  6  |     await page.goto('/dashboard/dev-audit');
> 7  |     await page.waitForSelector('text=Generate Test User & Seed Data');
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  8  |     // assume already signed-in from prior test; if not, create
  9  |     const status = await page.locator('div.font-mono').innerText().catch(() => '');
  10 |     if (!status.includes('Created seed for user')) {
  11 |       await page.click('text=Generate Test User & Seed Data');
  12 |       await page.waitForSelector('text=Done. Created seed for user', { timeout: 30000 });
  13 |     }
  14 | 
  15 |     await screenshotEvidence(page, 'notif-before');
  16 |     // trigger a notification via simulator button
  17 |     await page.click('text=Transaction');
  18 | 
  19 |     // wait for top-navbar badge to show an unread count
  20 |     const badge = page.locator('[data-testid="notif-badge"]');
  21 |     await expect(badge).toBeVisible({ timeout: 5000 });
  22 |     const badgeText = await badge.innerText();
  23 |     expect(badgeText.length).toBeGreaterThan(0);
  24 | 
  25 |     // open notification center and assert newest notification present
  26 |     await page.click('[data-testid="notif-button"]');
  27 |     const list = page.locator('[data-testid="notif-list"]');
  28 |     await expect(list).toBeVisible({ timeout: 5000 });
  29 |     const card = page.locator('[data-testid^="notification-card-"]');
  30 |     await expect(card.first()).toBeVisible({ timeout: 5000 });
  31 | 
  32 |     const after = await screenshotEvidence(page, 'notif-after');
  33 |     test.info().annotations.push({ type: 'screenshot', description: after });
  34 |   });
  35 | });
  36 | 
```