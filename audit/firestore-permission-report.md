# Firestore Permission Report

This report captures the failing Firestore operation(s) observed during `DevAuditService.seedForUser()` and maps them to rules, failure reasons, and recommended fixes.

> NOTE: Instrumentation has been added to `src/services/firestore/safeFirestore.ts` and `src/services/dev-audit.service.ts` to log detailed write attempts and a step-by-step seed trace. Reproduce the failure by running the targeted seed (see steps below) and paste the relevant log entries into the "Findings" table.

---

## How to reproduce (targeted)

1. Start the app in dev mode and sign in as the test user that the Playwright run uses (ensure auth is established).
2. Trigger `DevAuditService.seedForUser(<uid>)` from the dev-audit UI or by invoking the service directly.
3. Watch server/browser console for lines that begin with `[Firestore][Write]` and `[DevAudit][STEP]`.
4. Copy the failing operation log(s) including the `operation`, `docPath` / `collection`, `uid`, `payload`, `code`, and `message` fields.

Example log line (success or error):

[Firestore][Write][Error] { operation: 'setDoc', docPath: 'accounts/<id>', uid: 'abc', payload: {...}, code: 'permission-denied', message: 'Missing or insufficient permissions.' }

---

## Findings

- Collection: 
- Operation: 
- Document/Path: 
- UID: 
- Payload: 
- Error code: 
- Error message: 

## Rule(s) referenced

Paste or reference matching rules from `firestore.rules` below for the collection/path above.

File: [firestore.rules](../firestore.rules)

Relevant rule excerpt:

```
# paste matching rule block here
```

## Failure Reason (analysis)

- Ownership check failed? (yes/no)
- Required fields missing or type mismatch? (yes/no)
- Path mismatch (attempted write to admin-only path)? (yes/no)
- Authenticated state required but missing? (yes/no)

Explain why the rule denies the operation, referencing the rule conditions and the payload.

## Recommended Fix

- If the rule is incorrect: propose a concrete rule change with diff and rationale.
- If the payload is incorrect: propose code change to the service (file and line range) and show the corrected payload shape.
- If auth state is missing: propose ensuring `getAuth()` is called and user is signed in before seeding; or modify the dev-seed path to use elevated privileges in a controlled manner.

---

## Notes

- `safeFirestore.ts` now logs each write start and error with payload and uid.
- `dev-audit.service.ts` now adds `_seedTrace` to returned results for quick correlation of steps to Firestore writes.

---

Prepared by: automated instrumentation
Date: 

