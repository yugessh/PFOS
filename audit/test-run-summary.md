# PFOS E2E Test Run Failure Analysis Report

This document provides a comprehensive root cause analysis of the E2E test failures encountered during the test run.

---

## 1. Test Run Execution Summary

*   **Total Tests**: 21
*   **Passed**: 16
*   **Failed**: 5
*   **Skipped**: 0

---

## 2. Failure Analysis by Group

### 1. Firebase

#### Failure 1: transaction workflow passes (iPhone 12)
*   **Test Name**: `[iPhone_12] › tests\e2e\workflows.spec.ts:5:7 › Workflow validations › transaction workflow passes`
*   **Root Cause**: Playwright's `page.waitForFunction` timed out after 30,000ms. Under throttled iPhone 12 emulation, Next.js page compilation and sequential Firestore database writes took longer than the timeout limit, preventing the status text `success` from appearing in the DOM in a timely manner.
*   **File**: [workflows.spec.ts](file:///e:/project/PFOS/tests/e2e/workflows.spec.ts)
*   **Component**: Workflow status monitor
*   **Service**: `DevTestsService.runTransactionWorkflow`

#### Failure 2: goal workflow passes (iPhone 12)
*   **Test Name**: `[iPhone_12] › tests\e2e\workflows.spec.ts:20:7 › Workflow validations › goal workflow passes`
*   **Root Cause**: The status update check in the UI timed out after 30,000ms because Next.js compilation and Firestore database operations under throttled iPhone 12 emulation exceeded the timeout limit.
*   **File**: [workflows.spec.ts](file:///e:/project/PFOS/tests/e2e/workflows.spec.ts)
*   **Component**: Workflow status monitor
*   **Service**: `DevTestsService.runGoalWorkflow`

---

### 2. UI

*   *No functional UI failures detected in E2E tests (pointer interception issues are classified under Layout/Notifications).*

---

### 3. Layout

*   *No direct layout rendering failures detected. Viewport pointer interceptions are grouped under Notifications/Responsive.*

---

### 4. Responsive

*   *No responsive layout crashes or text truncations detected. All viewport sizing and mobile emulation navigation checks passed (aside from notifications click interception).*

---

### 5. Notifications

#### Failure 1: simulate notification and capture UI evidence (Pixel 5)
*   **Test Name**: `[Pixel_5] › tests\e2e\notifications.spec.ts:5:7 › Notifications UI validation › simulate notification and capture UI evidence`
*   **Root Cause**: Playwright tried to click the notification bell icon button (`[data-testid="notif-button"]`). On mobile viewports, the desktop `TopNavbar` is covered by the fixed mobile header (`components/sidebar.tsx` with `z-40` overlay) and toast notifications (`sonner` subtree with `z-[80]`). This caused Playwright's click events to be intercepted.
*   **File**: [notifications.spec.ts](file:///e:/project/PFOS/tests/e2e/notifications.spec.ts)
*   **Component**: TopNavbar / Mobile Header
*   **Service**: Notifications UI / Layout Layout

#### Failure 2: simulate notification and capture UI evidence (iPhone 12)
*   **Test Name**: `[iPhone_12] › tests\e2e\notifications.spec.ts:5:7 › Notifications UI validation › simulate notification and capture UI evidence`
*   **Root Cause**: Same as Pixel 5. The click on `[data-testid="notif-button"]` was intercepted by the fixed mobile top header (`z-40`) and the toast notification overlay on the small emulated viewport.
*   **File**: [notifications.spec.ts](file:///e:/project/PFOS/tests/e2e/notifications.spec.ts)
*   **Component**: TopNavbar / Mobile Header
*   **Service**: Notifications UI / Layout Layout

---

### 6. Charts

*   *All chart rendering tests passed. No functional failures were detected in E2E tests.*

---

### 7. Tables

*   *All table rendering tests passed. No failures were found in E2E tests.*

---

### 8. Authentication

#### Failure 1: create test user via Dev Audit and ensure signed-in (iPhone 12)
*   **Test Name**: `[iPhone_12] › tests\e2e\auth.spec.ts:5:7 › Authentication › create test user via Dev Audit and ensure signed-in`
*   **Root Cause**: Timeout waiting for selector `text=Done. Created seed for user` with a 60,000ms timeout limit. Under iPhone 12 mobile emulation, Next.js page loading, authentication state reconciliation, and the database seeding process (which performs 20+ sequential network writes to Firestore) exceeded the timeout limit.
*   **File**: [auth.spec.ts](file:///e:/project/PFOS/tests/e2e/auth.spec.ts)
*   **Component**: Developer Audit Panel / Authentication helper
*   **Service**: Firebase Authentication / Dev Seeding Service

---

### 9. Accessibility

*   *All accessibility tab indexing tests passed (100% success rate across all emulated projects).*
