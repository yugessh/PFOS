# Deployment Checklist

## 1. Environment Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY` – Firebase API key (public).
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_SERVICE_ACCOUNT` – Base64‑encoded service‑account JSON for CI/CD (used only for Firebase CLI deployments, **never commit**.
- `NEXT_PUBLIC_BASE_URL` – Base URL of the deployed site (e.g., `https://app.example.com`).
- `NEXT_PUBLIC_SENTRY_DSN` (optional) – Sentry integration.
- Any custom feature flags your environment requires (e.g., `NEXT_PUBLIC_ENABLE_BETA`).

## 2. Firebase Deployment
1. **Authenticate** with the service account:
   ```bash
   echo $FIREBASE_SERVICE_ACCOUNT | base64 --decode > /tmp/serviceAccount.json
   firebase login --no-localhost --token "$(cat /tmp/serviceAccount.json | jq -r '.private_key_id')"
   ```
2. **Deploy Firestore rules and indexes** (must be in sync with code):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
3. **Deploy Hosting / Functions** (if applicable):
   ```bash
   firebase deploy --only hosting
   # or for Cloud Functions
   firebase deploy --only functions
   ```
4. **Verify** the deployment succeeded (`firebase hosting:channel:list` or UI console).

## 3. Validation Steps (Post‑Deploy)
- **Smoke Test Authentication**
  - Sign‑up, sign‑in, password reset, Google sign‑in.
  - Verify error messages for known auth error codes (MFA, disabled account, etc.).
- **Security Rules Validation**
  - Attempt to read/write a user’s `auditLogs`/`securitySessions` with an unauthorized user (should be denied).
  - Use the Firestore Rules Playground or `firebase emulators:exec` with a script that tests rule enforcement.
- **Data Integrity**
  - Create a few test transactions, then confirm:
    - `computeAccountBalances` reflects correct totals.
    - `groupTransactionsByDate` and feed UI display correct grouping, income/expense summaries.
  - Verify month/week/day range helpers return expected UTC boundaries.
- **Performance**
  - Run a quick end‑to‑end test (e.g., `npm run test:e2e`) against the live URL.
- **Monitoring**
  - Check Firebase console for any security rule violations or auth errors.
  - Confirm Sentry (if configured) receives no new errors within 5‑10 min.

## 4. Rollback Procedure
1. **Revert code** to the previous Git tag/commit:
   ```bash
   git checkout <previous‑tag-or‑commit>
   ```
2. **Redeploy** the earlier version:
   ```bash
   firebase deploy --only hosting,firestore:rules,firestore:indexes
   ```
   (If you use Cloud Functions, also `firebase deploy --only functions`.)
3. **Invalidate caches** (if using a CDN) to ensure users receive the rolled‑back version.
4. **Notify** stakeholders (product, support) that a rollback has occurred and monitor for any lingering issues.
5. **Post‑Rollback Check** – run the validation steps again to confirm the system is back to a stable state.

---
*Prepared by OpenCode on 2026‑06‑19*