# Playwright Failures — Automatic Analysis

Generated: 2026-06-10

Summary
- Total failing tests (this run): 12
- Root cause (primary): Firebase client configuration is missing in the running app instance; authentication flows cannot initialize. This causes redirection to the Sign-in/Register pages and a cascade of timeouts for Dev Audit interactions that require an authenticated user.

Affected tests (representative)

1. tests/e2e/auth.spec.ts :: Authentication :: create test user via Dev Audit and ensure signed-in
   - Failure: Timeout waiting for Dev Audit UI; test landed on Sign-in/Create account page.
   - Root cause: Firebase Auth not initialized in app (missing NEXT_PUBLIC_FIREBASE_*). Registration cannot complete.
   - Fix strategy: Provide valid Firebase client env variables or run with Firebase emulator; alternatively mock AuthProvider in test environment to simulate an authenticated user.
   - Status: Blocked (requires env or app-level test shim).

2. tests/e2e/notifications.spec.ts :: Notifications UI validation :: simulate notification and capture UI evidence
   - Failure: Timeout waiting for Dev Audit UI; same redirect to Sign-in.
   - Root cause: Downstream of auth failure — notification workflows require an authenticated user and initialized Firebase.
   - Fix strategy: Same as (1). Once auth is available, stabilize selectors (we added `data-testid` for notification elements) and re-run.
   - Status: Blocked by auth.

3. tests/e2e/workflows.spec.ts :: Workflow validations :: transaction workflow passes
   - Failure: Timeout waiting for workflow button; Dev Audit unavailable.
   - Root cause: Unauthenticated redirect; workflow requires seeded user and Firestore access.
   - Fix strategy: Provide Firebase config or mock auth+Firestore (emulator or mocking layer). Convert fixed sleeps to locator-based waits (already planned).
   - Status: Blocked by auth/Firestore.

Cascade analysis
- Because the app detects missing Firebase config and skips initializeApp (console warning in app bundle), the `AuthProvider` ends up with no `auth` instance. Calls to `signUp` / `signIn` throw or never complete; UI remains on registration/login routes. All Dev Audit tests that assume an authenticated session therefore time out while waiting for Dev Audit controls.
- Playwright traces/screenshots show the Register page with fields pre-filled (Playwright did fill them), but there is no successful redirect to `/dashboard/**` after `Create account` because the underlying Firebase SDK is not initialized.

Immediate remediation options (pick one)
1. Provide Firebase client env variables to the dev server used by Playwright (preferred if you have project credentials): set `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, etc., then restart the dev server and re-run tests.
2. Run Firebase Emulator and set env to point at the emulator (requires emulator setup and adjusting `src/firebase/*` to support emulator). Then run `npm run test:e2e`.
3. Add a test-only AuthProvider shim that reads a local dev token or `PLAYWRIGHT_BYPASS_AUTH` flag and sets `user` state to a test user (fastest for CI but touches app code). This keeps production code paths unchanged if gated behind an env var.
4. Modify tests to stub/mount a fake auth object via Playwright's `page.addInitScript` to inject a global that the client-side code reads to set a user — lower-risk than code changes but requires knowing how AuthProvider reads global state.

Next recommended action
- Decide which remediation option is acceptable. If you want me to proceed, I can:
  - Option A: Add Playwright test helper that injects a fake authenticated user via `page.addInitScript` (non-invasive to server, low-risk) and re-run tests.
  - Option B: Add instructions and a `.env.test.local` template for wiring Firebase credentials and re-run tests against real Firebase or emulator.

If you prefer Option A, I will implement the `page.addInitScript` shim in the Playwright test setup and iterate until the suite passes, replacing fragile sleeps with robust locator waits as required.
