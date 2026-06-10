# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> create test user via Dev Audit and ensure signed-in
- Location: tests\e2e\auth.spec.ts:5:7

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
  - alert [ref=e31]: Sign in
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { screenshotEvidence } from './helpers';
  3  | 
  4  | test.describe('Authentication', () => {
  5  |   test('create test user via Dev Audit and ensure signed-in', async ({ page }) => {
  6  |     await page.goto('/dashboard/dev-audit');
> 7  |     await page.waitForSelector('text=Generate Test User & Seed Data');
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  8  |     await screenshotEvidence(page, 'auth-before');
  9  |     await page.click('text=Generate Test User & Seed Data');
  10 |     // wait for status to show done
  11 |     await page.waitForFunction(() => !!document.querySelector('div[role=main]') || true);
  12 |     // poll for status text
  13 |     await page.waitForSelector('text=Done. Created seed for user', { timeout: 30000 });
  14 |     await screenshotEvidence(page, 'auth-after');
  15 |     const status = await page.locator('div.font-mono').innerText();
  16 |     expect(status).toContain('Done. Created seed for user');
  17 |   });
  18 | });
  19 | 
```