# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflows.spec.ts >> Workflow validations >> transaction workflow passes
- Location: tests\e2e\workflows.spec.ts:5:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('text=Run Transaction Workflow') to be visible

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
        - link "Create account" [ref=e21]:
          - /url: /auth/register
  - region "Notifications (F8)":
    - list
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e33]
  - iframe [ref=e34]:
    
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { screenshotEvidence } from './helpers';
  3  | 
  4  | test.describe('Workflow validations', () => {
  5  |   test('transaction workflow passes', async ({ page }) => {
  6  |     await page.goto('/dashboard/dev-audit');
> 7  |     await page.waitForSelector('text=Run Transaction Workflow');
     |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  8  |     await screenshotEvidence(page, 'tx-before');
  9  |     await page.click('text=Run Transaction Workflow');
  10 |     // wait for status update
  11 |     await page.waitForTimeout(2000);
  12 |     const status = await page.locator('div.font-mono').innerText();
  13 |     expect(status).toContain('success');
  14 |     await screenshotEvidence(page, 'tx-after');
  15 |   });
  16 | 
  17 |   test('goal workflow passes', async ({ page }) => {
  18 |     await page.goto('/dashboard/dev-audit');
  19 |     await page.waitForSelector('text=Run Goal Workflow');
  20 |     await page.click('text=Run Goal Workflow');
  21 |     await page.waitForTimeout(1500);
  22 |     const status = await page.locator('div.font-mono').innerText();
  23 |     expect(status).toContain('success');
  24 |   });
  25 | });
  26 | 
```