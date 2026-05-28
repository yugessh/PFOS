# PFOS Product + UX + Technical Audit

Status: analysis only. No code was modified to produce this report.

## Executive Summary

PFOS is a Next.js App Router finance application wrapped in a Capacitor mobile shell and backed by Firebase/Firestore. The app is already beyond a prototype: it has routing for transactions, accounts, goals, budgets, investments, documents, reminders, recurring transactions, notifications, policies, EMI, settlements, analytics, reports, security, and internal QA/diagnostic surfaces. The strongest area is the transaction/account core and the most complete newer surface is the document vault. The largest architectural risk is not missing plumbing but duplicate implementations and drift between old and new UI/data paths.

The codebase shows a product that has grown in layers. Several features are implemented twice, some routes are thin wrappers over separate feature modules, and multiple screens still expose placeholder or demo text. That means the redesign should not start from visual polish; it should start from source-of-truth consolidation, route cleanup, and feature prioritization.

## Phase 1. Project Structure Audit

### 1. Folder Structure

The repository is organized into a hybrid Next.js + component library + domain-services structure.

| Area | Path | Role |
|---|---|---|
| App routes | app/ | Next.js App Router pages, layouts, and route shells |
| Shared UI | components/ | Reusable visual primitives and app shell UI |
| Feature hooks | src/hooks/ | Domain-specific React hooks for Firestore-backed data |
| Firestore services | src/services/firestore/ | CRUD and aggregation services for each domain |
| Mobile shell | src/components/mobile/ | Capacitor/mobile navigation, header, feed, and FAB |
| Feature modules | src/components/* | Larger domain features, often page-sized components |
| Auth module | src/modules/auth/ | Newer auth module with its own components/services/types |
| Utility libraries | src/lib/ and lib/ | Formatting, finance calculations, security, navigation, dates |
| Static assets | public/ | PWA manifest, offline page, service worker |
| Android host | android/ | Capacitor Android project |

The structure is not fully normalized. There are parallel paths for the same domain under components/, src/components/, src/modules/, and src/services/firestore/, which creates ambiguity about the canonical implementation.

### 2. Routing Structure

The app uses a root layout in [app/layout.tsx](app/layout.tsx) and a protected dashboard subtree in [app/dashboard/layout.tsx](app/dashboard/layout.tsx). The root route redirects into the main transaction view.

#### Top-level routes

| Route | File | Notes |
|---|---|---|
| `/` | [app/page.tsx](app/page.tsx) | Redirects to `/dashboard/transactions` |
| `/welcome` | [app/welcome/page.tsx](app/welcome/page.tsx) | Marketing-style entry page |
| `/onboarding` | [app/onboarding/page.tsx](app/onboarding/page.tsx) | Onboarding wizard |
| `/auth/login` | [app/auth/login/page.tsx](app/auth/login/page.tsx) | Primary login screen |
| `/auth/register` | [app/auth/register/page.tsx](app/auth/register/page.tsx) | Registration screen |

#### Dashboard routes

| Route | File | Notes |
|---|---|---|
| `/dashboard` | [app/dashboard/page.tsx](app/dashboard/page.tsx) | Dashboard landing, redirects internally via widget-driven shell |
| `/dashboard/transactions` | [app/dashboard/transactions/page.tsx](app/dashboard/transactions/page.tsx) | Main active transaction experience |
| `/dashboard/accounts` | [app/dashboard/accounts/page.tsx](app/dashboard/accounts/page.tsx) | Accounts screen |
| `/dashboard/budgets` | [app/dashboard/budgets/page.tsx](app/dashboard/budgets/page.tsx) | Budget management |
| `/dashboard/goals` | [app/dashboard/goals/page.tsx](app/dashboard/goals/page.tsx) | Savings goals |
| `/dashboard/documents` | [app/dashboard/documents/page.tsx](app/dashboard/documents/page.tsx) | Document vault |
| `/dashboard/calendar` | [app/dashboard/calendar/page.tsx](app/dashboard/calendar/page.tsx) | Financial calendar |
| `/dashboard/timeline` | [app/dashboard/timeline/page.tsx](app/dashboard/timeline/page.tsx) | Financial timeline |
| `/dashboard/stats` | [app/dashboard/stats/page.tsx](app/dashboard/stats/page.tsx) | Monthly stats |
| `/dashboard/analytics` | [app/dashboard/analytics/page.tsx](app/dashboard/analytics/page.tsx) | Analytics summary |
| `/dashboard/reports` | [app/dashboard/reports/page.tsx](app/dashboard/reports/page.tsx) | Multi-domain reports |
| `/dashboard/net-worth` | [app/dashboard/net-worth/page.tsx](app/dashboard/net-worth/page.tsx) | Net worth dashboard |
| `/dashboard/investments` | [app/dashboard/investments/page.tsx](app/dashboard/investments/page.tsx) | Portfolio list |
| `/dashboard/investments/[assetId]` | [app/dashboard/investments/[assetId]/page.tsx](app/dashboard/investments/%5BassetId%5D/page.tsx) | Portfolio detail |
| `/dashboard/investments/history` | [app/dashboard/investments/history/page.tsx](app/dashboard/investments/history/page.tsx) | Investment activity |
| `/dashboard/recurring` | [app/dashboard/recurring/page.tsx](app/dashboard/recurring/page.tsx) | Recurring transactions |
| `/dashboard/reminders` | [app/dashboard/reminders/page.tsx](app/dashboard/reminders/page.tsx) | Reminders |
| `/dashboard/notifications` | [app/dashboard/notifications/page.tsx](app/dashboard/notifications/page.tsx) | Notification center |
| `/dashboard/policies` | [app/dashboard/policies/page.tsx](app/dashboard/policies/page.tsx) | Insurance policies |
| `/dashboard/emi` | [app/dashboard/emi/page.tsx](app/dashboard/emi/page.tsx) | EMI tracker |
| `/dashboard/settlements` | [app/dashboard/settlements/page.tsx](app/dashboard/settlements/page.tsx) | Settlements / lending-like ledger |
| `/dashboard/insights` | [app/dashboard/insights/page.tsx](app/dashboard/insights/page.tsx) | AI insights |
| `/dashboard/automations` | [app/dashboard/automations/page.tsx](app/dashboard/automations/page.tsx) | Automation rules |
| `/dashboard/security` | [app/dashboard/security/page.tsx](app/dashboard/security/page.tsx) | App lock, privacy, sessions |
| `/dashboard/settings` | [app/dashboard/settings/page.tsx](app/dashboard/settings/page.tsx) | Preferences and data tools |
| `/dashboard/diagnostics` | [app/dashboard/diagnostics/page.tsx](app/dashboard/diagnostics/page.tsx) | Internal diagnostics |
| `/dashboard/qa` | [app/dashboard/qa/page.tsx](app/dashboard/qa/page.tsx) | Internal QA checks |
| `/dashboard/release-checklist` | [app/dashboard/release-checklist/page.tsx](app/dashboard/release-checklist/page.tsx) | Internal release checklist |
| `/dashboard/protected-example` | [app/dashboard/protected-example/page.tsx](app/dashboard/protected-example/page.tsx) | Demo/protected example |

#### Utility and system routes

| Route / file | Purpose |
|---|---|
| [app/error.tsx](app/error.tsx) | App-level error state |
| [app/not-found.tsx](app/not-found.tsx) | 404 screen |
| [app/offline.tsx](app/offline.tsx) | Offline fallback |
| [app/auth/login/simple-page.tsx](app/auth/login/simple-page.tsx) | Non-routed legacy login-like screen |

### 3. App Architecture

The architecture is layered, but not fully single-sourced.

#### Runtime layers

1. Root app shell: [app/layout.tsx](app/layout.tsx) sets metadata, fonts, analytics, global error handling, and Capacitor bootstrap.
2. Provider layer: [src/components/Providers.tsx](src/components/Providers.tsx) wires auth, security, account, and transaction contexts and mounts the mobile app shell.
3. Dashboard shell: [app/dashboard/layout.tsx](app/dashboard/layout.tsx) enforces auth and renders sidebar, top navbar, and bottom nav.
4. Domain pages: each route page either renders a feature component or implements its own page logic.
5. Domain services: Firestore CRUD and aggregation services power the hooks.

#### Architectural style

The application mixes route-driven and component-driven composition. Some routes are thin wrappers over feature components, while others contain full page logic inline. That is workable, but it creates drift risk because behavior can change in one layer without a corresponding change in the other.

#### Canonical interaction flow

Most user actions follow the same path:

UI page or component -> React hook -> Firestore service -> Firestore collection/subcollection -> derived summary or cached state.

For internal and mobile surfaces, the same path is often wrapped with local persistence or platform checks.

### 4. Tech Stack

| Layer | Technologies |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Radix UI, Shadcn-style primitives |
| Motion | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form, Zod, @hookform/resolvers |
| Auth / backend | Firebase Auth, Firestore |
| Mobile | Capacitor Android |
| Analytics | Vercel Analytics |
| UI feedback | Sonner, Radix Toast |
| Misc | lucide-react icons, date-fns, next-themes, cmdk, vaul |

Relevant config anchors:

- [package.json](package.json) defines the stack and scripts.
- [next.config.mjs](next.config.mjs) keeps images unoptimized and configures dev origins.
- [tailwind.config.ts](tailwind.config.ts) and [app/globals.css](app/globals.css) define the design system.

### 5. State Management

State is split across several levels:

| State layer | Scope | Notes |
|---|---|---|
| Local component state | Most pages and modals | Used for forms, toggles, and open/close state |
| Context state | Auth, security, account, transaction | Global user/session and shared financial data |
| Hook state | Domain fetch/cache state | Each hook manages load/error/reload for one domain |
| Firestore state | Persistent app data | User profile and domain collections |
| Local storage | Security, search history, preferences | Used for PIN, privacy, recent searches, backup metadata |

The context stack is significant:

- [src/context/AuthContext.tsx](src/context/AuthContext.tsx) handles sign-in, sign-up, Google sign-in, sign-out, and Firebase initialization.
- [src/context/SecurityContext.tsx](src/context/SecurityContext.tsx) handles PIN lock, privacy masking, session timeout, and audit logging.
- [src/context/AccountContext.tsx](src/context/AccountContext.tsx) and [src/context/TransactionContext.tsx](src/context/TransactionContext.tsx) provide the financial core.

### 6. Firebase / Backend Integrations

The backend is Firestore-centric with a strong user-scoped pattern.

#### Data model pattern

The repo memory and service structure indicate a user-rooted hierarchy such as:

`users/{uid}/<subcollection>`

Common subcollections and collections include accounts, transactions, categories, budgets, goals, investments, EMI, documents, reminders, recurring transactions, settlements, policies, notifications, reports, security sessions, and audit logs.

#### Firebase integration points

| File | Role |
|---|---|
| [src/firebase/firebase.ts](src/firebase/firebase.ts) | Firebase initialization and helpers |
| [src/services/firestore/firebaseClient.ts](src/services/firestore/firebaseClient.ts) | Firestore client bootstrap |
| [src/services/firestore/config.ts](src/services/firestore/config.ts) | Collection and environment config |
| [src/services/firestore/safeFirestore.ts](src/services/firestore/safeFirestore.ts) | Permission-safe read/write wrapper |
| [src/lib/firestore-init.ts](src/lib/firestore-init.ts) | Ensures user profile/bootstrap documents |

#### Backend coverage

Firestore services exist for:

- transactions
- accounts
- categories
- budgets
- goals
- investments
- investment transactions
- EMI
- reminders
- recurring transactions
- settlements
- policies
- notifications
- events
- reports
- net worth
- automation
- AI insights
- documents
- users
- security
- dashboard summaries

#### Backend quality assessment

The backend layer is broad and functional, but it has duplicate budget abstractions and several service stubs/placeholder behaviors. The safest conclusion is that the data model is mature enough for product use, but not yet clean enough to support a redesign without consolidation work.

### 7. Hooks and Shared Logic

Primary hooks:

- [src/hooks/useTransactions.ts](src/hooks/useTransactions.ts)
- [src/hooks/useAccounts.ts](src/hooks/useAccounts.ts)
- [src/hooks/useBudget.ts](src/hooks/useBudget.ts)
- [src/hooks/useBudgets.ts](src/hooks/useBudgets.ts)
- [src/hooks/useGoals.ts](src/hooks/useGoals.ts)
- [src/hooks/useInvestments.ts](src/hooks/useInvestments.ts)
- [src/hooks/useEMI.ts](src/hooks/useEMI.ts)
- [src/hooks/useReminders.ts](src/hooks/useReminders.ts)
- [src/hooks/useRecurringTransactions.ts](src/hooks/useRecurringTransactions.ts)
- [src/hooks/useEvents.ts](src/hooks/useEvents.ts)
- [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts)
- [src/hooks/useSettlements.ts](src/hooks/useSettlements.ts)
- [src/hooks/usePolicies.ts](src/hooks/usePolicies.ts)
- [src/hooks/useAutomations.ts](src/hooks/useAutomations.ts)
- [src/hooks/useNetWorth.ts](src/hooks/useNetWorth.ts)
- [src/hooks/useTradingJournal.ts](src/hooks/useTradingJournal.ts)
- [src/hooks/useGlobalSearch.ts](src/hooks/useGlobalSearch.ts)
- [src/hooks/useBackupRestore.ts](src/hooks/useBackupRestore.ts)
- [src/hooks/useInsights.ts](src/hooks/useInsights.ts)
- [src/hooks/useDocumentReminders.ts](src/hooks/useDocumentReminders.ts)
- [src/hooks/use-connection.ts](src/hooks/use-connection.ts)

Shared logic libraries include:

- [src/lib/finance.ts](src/lib/finance.ts)
- [src/lib/currency.ts](src/lib/currency.ts)
- [src/lib/date.ts](src/lib/date.ts)
- [src/lib/goals.ts](src/lib/goals.ts)
- [src/lib/investments.ts](src/lib/investments.ts)
- [src/lib/policies.ts](src/lib/policies.ts)
- [src/lib/emi.ts](src/lib/emi.ts)
- [src/lib/security.ts](src/lib/security.ts)
- [src/lib/navigation.ts](src/lib/navigation.ts)
- [src/lib/utils.ts](src/lib/utils.ts)

### 8. APIs and Services

The service layer is organized as service classes or singleton service objects. Most feature hooks are thin wrappers around them.

Important service files:

- [src/services/firestore/base.service.ts](src/services/firestore/base.service.ts)
- [src/services/firestore/transactions.service.ts](src/services/firestore/transactions.service.ts)
- [src/services/firestore/accounts.service.ts](src/services/firestore/accounts.service.ts)
- [src/services/firestore/budgets.service.ts](src/services/firestore/budgets.service.ts)
- [src/services/firestore/budget.service.ts](src/services/firestore/budget.service.ts)
- [src/services/firestore/goals.service.ts](src/services/firestore/goals.service.ts)
- [src/services/firestore/investments.service.ts](src/services/firestore/investments.service.ts)
- [src/services/firestore/investmentTransactions.service.ts](src/services/firestore/investmentTransactions.service.ts)
- [src/services/firestore/emi.service.ts](src/services/firestore/emi.service.ts)
- [src/services/firestore/reminders.service.ts](src/services/firestore/reminders.service.ts)
- [src/services/firestore/recurring-transactions.service.ts](src/services/firestore/recurring-transactions.service.ts)
- [src/services/firestore/notifications.service.ts](src/services/firestore/notifications.service.ts)
- [src/services/firestore/events.service.ts](src/services/firestore/events.service.ts)
- [src/services/firestore/settlements.service.ts](src/services/firestore/settlements.service.ts)
- [src/services/firestore/policies.service.ts](src/services/firestore/policies.service.ts)
- [src/services/firestore/reports.service.ts](src/services/firestore/reports.service.ts)
- [src/services/firestore/networth.service.ts](src/services/firestore/networth.service.ts)
- [src/services/firestore/automation.service.ts](src/services/firestore/automation.service.ts)
- [src/services/firestore/aiInsights.service.ts](src/services/firestore/aiInsights.service.ts)
- [src/services/firestore/documents.service.ts](src/services/firestore/documents.service.ts)
- [src/services/firestore/categories.service.ts](src/services/firestore/categories.service.ts)
- [src/services/firestore/users.service.ts](src/services/firestore/users.service.ts)
- [src/services/firestore/security.service.ts](src/services/firestore/security.service.ts)
- [src/services/auth.service.ts](src/services/auth.service.ts)

The most important service-level issue is that the app has two budget service tracks: [src/services/firestore/budget.service.ts](src/services/firestore/budget.service.ts) and [src/services/firestore/budgets.service.ts](src/services/firestore/budgets.service.ts). That is not just naming noise; the hooks and alert engine use different ones.

### 9. Shared Utilities

Shared utility areas include:

- lib/
- src/lib/
- src/utils/

The utility layer is useful but uneven. Some domains are in lib/, some in src/lib/, and some duplicated in route code. That means utility ownership is not cleanly separated yet.

### 10. Component Architecture

The component system has three visible layers:

1. Primitive/design-system components in components/ui/.
2. Shared app-level components in components/.
3. Feature-scoped components in src/components/.

This is a good conceptual split, but the app currently duplicates a number of feature components across old and new paths.

Key shell and navigation components:

- [components/sidebar.tsx](components/sidebar.tsx)
- [components/top-navbar.tsx](components/top-navbar.tsx)
- [components/bottom-nav.tsx](components/bottom-nav.tsx)
- [src/components/mobile/AppShell.tsx](src/components/mobile/AppShell.tsx)
- [src/components/mobile/MobileBottomNavigation.tsx](src/components/mobile/MobileBottomNavigation.tsx)
- [src/components/mobile/MobileHeader.tsx](src/components/mobile/MobileHeader.tsx)
- [src/components/mobile/FloatingActionButton.tsx](src/components/mobile/FloatingActionButton.tsx)

Key modal/sheet families:

- [components/modals/AppModal.tsx](components/modals/AppModal.tsx)
- [components/global-search-dialog.tsx](components/global-search-dialog.tsx)
- [components/universal-actions-sheet.tsx](components/universal-actions-sheet.tsx)
- [components/add-actions-bottom-sheet.tsx](components/add-actions-bottom-sheet.tsx)

## Phase 2. Page + Screen Inventory

Legend for status: Complete, Partial, Placeholder, or Internal.

### Screen Inventory Table

| Screen | Route | Purpose | User goal | UI sections | Components used | Data dependencies | Actions | Strengths | UX problems |
|---|---|---|---|---|---|---|---|---|---|
| Root redirect | `/` | Entry redirect into core app | Reach the finance workspace quickly | None | Next redirect | None | None | Fast entry | No meaningful landing choice; all users forced to transactions |
| Welcome | `/welcome` | Intro / CTA entry screen | Start onboarding or import data | Brand block, CTA buttons, background glow | framer-motion, Link | None | Get started, import data | Polished branding | Uses invalid nested anchor/button pattern in code and is not the main app path |
| Onboarding | `/onboarding` | Guided setup | Initialize finance profile | Wizard shell | OnboardingWizard | Likely auth/profile bootstrap | Start flow | Dedicated onboarding surface | Implementation details not fully visible; likely isolated from dashboard logic |
| Login | `/auth/login` | Sign-in screen | Access the dashboard | Email/password form, Google sign-in, error banner | Button, Input, AuthContext | Firebase Auth | Sign in, Google auth | Clear auth entry | No password reset visible here; duplicate legacy login exists |
| Register | `/auth/register` | Account creation | Create account | Name/email/password form, Google auth | Button, Input, AuthContext | Firebase Auth, user profile bootstrap | Register, Google auth | Straightforward sign-up | No password policy feedback beyond minimum length |
| Dashboard home | `/dashboard` | Main landing shell | Reach actions, summary, and widgets | Dashboard manager, FAB, universal action sheet, modals, notifications | DashboardManager, FAB, UniversalActionsSheet, AddTransactionModal, AddAccountModal, NotificationCenter | Transactions, accounts, auth | Add tx, add income, add account, open notifications | Centralized entrypoint | Contains some commented/outdated logic and coexists with multiple shell systems |
| Transactions | `/dashboard/transactions` | Main ledger view | Review and filter transactions | Summary header, filters, transaction feed, filter sheet, empty/error/loading states | CompactSummaryHeader, CompactTransactionFeed, FilterBottomSheet, AddTransactionModal | Transactions, accounts, Firestore range query | Add transaction, filter, switch view/time range | Strong mobile-first information density | Very feature dense; multiple filters, modes, and states can overload new users |
| Add transaction | `/transactions/add` | Dedicated composer | Create a transaction from shortcut/navigation | Modal-only screen | AddTransactionModal | Transactions hook | Save transaction, back out | Quick direct route | Functionally a modal page, not a full screen |
| Accounts | `/dashboard/accounts` | Account management | Review balances and add/transfer accounts | Account list, add modal, transfer modal, summary | AccountsPage, AddAccountModal, TransferModal, EmptyAccountsState | Accounts, transactions, balances | Add account, transfer funds, edit/delete | Domain is clearly separated | Likely over-reliant on card/list patterns; limited high-level account analytics |
| Categories | `/categories` | Category browser and editor | Organize spending categories | Header, type counts, category grid, selector sheet, add modal, selected drawer | CategoryGrid, CategorySelectorSheet, AddCategoryModal | Local mock categories | Add/select/edit category | Useful taxonomy view | Uses mock categories and local state rather than Firestore, so it is not a real persistent module |
| Budgets | `/dashboard/budgets` | Budget management | Control spending limits | Summary, alerts, budget cards, create modal, stats | BudgetSummaryCard, BudgetProgressCard, BudgetAlertCard | Budgets hook/service | Create budget, dismiss alert, refresh | Strong financial dashboard framing | Uses a very different visual system from other pages and appears partially scaffolded |
| Goals | `/dashboard/goals` | Savings goals | Save toward targets and track progress | Sticky header, progress bar, goal list, contribution input, sheet | Sheet, Button, EmptyState, LoadingState, ErrorState | Goals hook/service | Add, edit, delete, contribute | Solid transaction-linked goal mechanics | Inline editing and contribution controls are dense on mobile |
| Documents | `/dashboard/documents` | Document vault | Track bills, policies, renewals, and attachments | Header, summary cards, search/filter bar, card list, add modal, filter sheet | DocumentCard, AddDocumentModal, DocumentFilterBar | Documents service, document types | Add document, filter, search | One of the most complete newer surfaces | Search/filter interactions are good, but delete flow and attachment flows need more explicit affordances |
| Calendar | `/dashboard/calendar` | Event calendar | See upcoming financial events | Month/week/agenda toggles, filters, event aggregation, modal | AddEventModal, FinancialEventCard | Events, reminders, EMI, goals, investments, trading, transactions | Add event, change views, filter | Excellent cross-domain synthesis | High complexity; many event types may be hard to parse quickly |
| Timeline | `/dashboard/timeline` | Chronological event feed | Review money movement history | Search, stat cards, event feed, modal | AddEventModal, FinancialEventCard | Events, reminders, EMI, goals, investments, trades, transactions | Add event, search, filter | Strong umbrella view | Similar content to calendar with different framing; overlap may confuse users |
| Stats | `/dashboard/stats` | Monthly expense stats | Understand category spend | Gradient header, pie chart, category indicators | Recharts PieChart, useTransactions | Transactions | None beyond view | Clear visual hierarchy | Only expense split is shown; no richer drilldown or trend comparison |
| Analytics | `/dashboard/analytics` | Finance analytics hub | See summary performance | Net worth chart, cashflow chart, trading stats, placeholder sections | AnalyticsCard, Recharts, Net Worth, TradingJournal hooks | Net worth, transactions, trading journal | None beyond passive viewing | Good multi-domain intent | Budget and goal analytics are explicitly “coming soon” |
| Reports | `/dashboard/reports` | Multi-domain reporting | Analyze monthly performance across modules | Filters, KPI cards, charts, scheduling UI | ChartCard, StatCard, FilterSelect, AppModal, Recharts | Accounts, transactions, budgets, goals, investments, EMI, reports service | Filter, schedule report | Strong reporting ambition | Highly dense; a lot of data in one screen, likely too much for first-time use |
| Net worth | `/dashboard/net-worth` | Net worth overview | Track growth over time | Current net worth card, trend chart, breakdown cards, filters | CurrentNetWorthCard, NetWorthCard, NetWorthTrendChart | Net worth hook | Change range, refresh, download | Visually polished and finance-native | Breakdown cards use fixed proportions, which weakens credibility |
| Investments | `/dashboard/investments` | Portfolio management | Add and monitor investments | Sticky summary, list, add/edit sheet | Sheet, Investment return helpers, EmptyState | Investments hook/service | Add, edit, delete | Clear portfolio loop | No detailed analytics or asset allocation summary on the main list page |
| Investment detail | `/dashboard/investments/[assetId]` | Asset detail | Inspect an individual asset | Delegated client component | PortfolioDetailsClient | Investment detail data | Asset-specific actions | Supports deep linking | Behavior depends on another component not shown in route file |
| Investment history | `/dashboard/investments/history` | Transaction history for investments | Review buys/sells | Inline list, empty state | investmentTransactionsService | Investment transaction data | View history | Helpful audit trail | Minimal styling, weak error/loading handling, not aligned to main design system |
| Recurring | `/dashboard/recurring` | Recurring transaction manager | Maintain repeat cashflows | Delegated page component | RecurringTransactionsPage | Recurring transactions | Add/edit recurring tx | Dedicated repeated-cashflow module | Route is a thin wrapper, so page capabilities are hidden elsewhere |
| Reminders | `/dashboard/reminders` | Reminder manager | Track due reminders | Delegated page component | RemindersPage | Reminders data | Add/edit reminders | Clear dedicated route | Thin wrapper, likely less discoverable than full-screen pages |
| Notifications | `/dashboard/notifications` | Notification center | Review app alerts and notices | Delegated page component | NotificationsPage | Notifications service | View notifications | Centralized alerts | Need clearer actionability for notification items |
| Policies | `/dashboard/policies` | Insurance policy tracker | Track premiums and renewals | Summary cards, list, add/edit sheet | Sheet, Buttons, policy helpers | Policies hook/service | Add, edit, delete | Good renewal framing | Styling diverges from the main neo theme |
| EMI | `/dashboard/emi` | EMI tracker | Track loans and installments | Summary cards, list, add/edit sheet | Sheet, Buttons, EMI helpers | EMI hook/service | Add, edit, mark paid, delete | Good repayment loop | No deeper loan timeline or amortization view |
| Settlements | `/dashboard/settlements` | Peer settlement ledger | Track who owes what | List, sheet form, summary | Likely settlements components + service | Settlements hook/service | Add, edit, delete | Adds debt/settlement domain coverage | Product fit is not fully explained in UI; may be confusing without onboarding |
| Settings | `/dashboard/settings` | Preferences and data tools | Configure app behavior | Account, preferences, notifications, security, danger zone, data management | Switch, Button, DataManagement | Auth, local storage, biometrics | Logout, toggle settings, export/backup | Good breadth of controls | Several toggles are local-only and do not clearly persist to backend; session management is marked coming soon |
| Security | `/dashboard/security` | App lock and privacy controls | Protect sensitive financial data | App lock, privacy, session timeout, sessions, audit log | Switch, Button, SecurityContext | Security context, security service | Set PIN, lock app, log out devices | Strong security posture for a finance app | Dense and technical; likely too much for casual users |
| Insights | `/dashboard/insights` | AI insights hub | View insights or assistant | Delegate/component-driven screen | AI insights components | AI insights service/hook | Likely view and query insights | Product signal for premium intelligence | The AI surface appears adjunct rather than fully integrated |
| Automations | `/dashboard/automations` | Rule automation hub | Automate financial workflows | Automation dashboard, timeline | Automation components | Automations service/hook | Create/enable rules | Important product direction | Service layer described as lightweight/stub-like |
| Diagnostics | `/dashboard/diagnostics` | Internal diagnostics | Verify app health | Diagnostic cards, refresh actions | Diagnostic components | Firestore/auth/offline/sync state | Refresh diagnostics | Helpful internal tooling | Not user-facing product value |
| QA | `/dashboard/qa` | Internal quality checks | Run sanity tests | QA test list and results | QA components | Browser/device/runtime checks | Run checks | Good engineering gate | Not a product screen |
| Release checklist | `/dashboard/release-checklist` | Internal checklist | Review release readiness | Check items, simulated pass/fail | Checklist components | Demo status generation | Review checklist | Useful during launches | Uses demo-like pass rate logic, not a real release system |
| Protected example | `/dashboard/protected-example` | Demo/placeholder route | Test protected routing | Minimal example content | ProtectedRoute-style wrappers | Auth context | None meaningful | Demonstrates auth guard pattern | Not a product surface |
| Login legacy | app/auth/login/simple-page.tsx | Legacy alternate login | Sign in using old form | Full sign-in form | Input/button form | Auth context | Sign in | Useful fallback/reference | Not routed, and it duplicates the real login screen |
| Error | app/error.tsx | Global error state | Recover from failures | Error shell | Error boundary UI | Runtime error handling | Retry | Necessary app support | Not a user journey screen |
| Not found | app/not-found.tsx | 404 screen | Return to app | Empty/error shell | Standard fallback | None | Go home | Necessary support | Not a product flow |
| Offline | app/offline.tsx | PWA offline fallback | Continue when offline | Offline message/shell | Offline UI | Service worker/PWA | Retry/return | Important mobile support | Likely minimal interaction depth |

### Hidden Flows, Dialogs, Sheets, and Modals

Important non-route screens include:

- [components/global-search-dialog.tsx](components/global-search-dialog.tsx)
- [components/universal-actions-sheet.tsx](components/universal-actions-sheet.tsx)
- [components/add-actions-bottom-sheet.tsx](components/add-actions-bottom-sheet.tsx)
- [components/modals/AddTransactionModal.tsx](components/modals/AddTransactionModal.tsx)
- [src/components/accounts/AddAccountModal.tsx](src/components/accounts/AddAccountModal.tsx)
- [src/components/accounts/TransferModal.tsx](src/components/accounts/TransferModal.tsx)
- [src/components/goals/AddGoalModal.tsx](src/components/goals/AddGoalModal.tsx)
- [src/components/goals/ContributionModal.tsx](src/components/goals/ContributionModal.tsx)
- [src/components/investments/AddInvestmentModal.tsx](src/components/investments/AddInvestmentModal.tsx)
- [src/components/investments/BuyAssetModal.tsx](src/components/investments/BuyAssetModal.tsx)
- [src/components/investments/SellAssetModal.tsx](src/components/investments/SellAssetModal.tsx)
- [src/components/emi/AddEMIModal.tsx](src/components/emi/AddEMIModal.tsx)
- [src/components/recurring/RecurringTransactionModal.tsx](src/components/recurring/RecurringTransactionModal.tsx)
- [src/components/reminders/AddReminderModal.tsx](src/components/reminders/AddReminderModal.tsx)
- [src/components/documents/AddDocumentModal.tsx](src/components/documents/AddDocumentModal.tsx)
- [src/components/events/AddEventModal.tsx](src/components/events/AddEventModal.tsx)
- [src/components/notifications/NotificationCenter.tsx](src/components/notifications/NotificationCenter.tsx)

## Phase 3. Module Audit

### 1. Transactions

Purpose: capture and analyze income, expense, and transfer activity.

Core functionality: create transactions, query by date range, filter by category/account, group by date, compute totals.

Implementation status: complete enough to be core product infrastructure, but still evolving.

Pages inside module:

- [app/dashboard/transactions/page.tsx](app/dashboard/transactions/page.tsx)
- [app/transactions/add/page.tsx](app/transactions/add/page.tsx)

Components used:

- [src/components/transactions/AddTransactionModal.tsx](src/components/transactions/AddTransactionModal.tsx)
- [src/components/transactions/TransactionsFilterBar.tsx](src/components/transactions/TransactionsFilterBar.tsx)
- [src/components/mobile/CompactTransactionFeed.tsx](src/components/mobile/CompactTransactionFeed.tsx)
- [src/components/mobile/CompactSummaryHeader.tsx](src/components/mobile/CompactSummaryHeader.tsx)

Hooks/services used:

- [src/hooks/useTransactions.ts](src/hooks/useTransactions.ts)
- [src/hooks/useAccounts.ts](src/hooks/useAccounts.ts)
- [src/services/firestore/transactions.service.ts](src/services/firestore/transactions.service.ts)

Navigation flow:

- dashboard landing -> transactions
- quick action sheet -> add transaction modal
- dedicated add route -> modal composer -> return to transactions

Data relationships:

- transactions are linked to accounts, categories, and the dashboard aggregates.
- transaction data feeds stats, reports, timeline, calendar, net worth, and search.

Reusable patterns:

- range filtering, grouped list rendering, compact mobile summary, modal composer

### 2. Accounts

Purpose: track cash accounts, balances, and transfer support.

Core functionality: list accounts, add accounts, transfer between accounts, balance summaries.

Implementation status: strong and core, but with UI duplication between account page families.

Pages inside module:

- [app/dashboard/accounts/page.tsx](app/dashboard/accounts/page.tsx)

Components used:

- [src/components/accounts/AccountsPage.tsx](src/components/accounts/AccountsPage.tsx)
- [src/components/accounts/AddAccountModal.tsx](src/components/accounts/AddAccountModal.tsx)
- [src/components/accounts/TransferModal.tsx](src/components/accounts/TransferModal.tsx)
- [src/components/accounts/EmptyAccountsState.tsx](src/components/accounts/EmptyAccountsState.tsx)

Hooks/services used:

- [src/hooks/useAccounts.ts](src/hooks/useAccounts.ts)
- [src/services/firestore/accounts.service.ts](src/services/firestore/accounts.service.ts)

Navigation flow:

- dashboard -> accounts -> add/transfer modal

Data relationships:

- account balances feed dashboard totals, transactions, and net worth.

Reusable patterns:

- account cards, transfer modal, summary banner

### 3. Budgets

Purpose: define and monitor spending limits.

Core functionality: budget cards, alerts, category spending, create modal, summary metrics.

Implementation status: partial to strong, but the architecture is split between two services and two page families.

Pages inside module:

- [app/dashboard/budgets/page.tsx](app/dashboard/budgets/page.tsx)
- [src/components/budgets/BudgetsPage.tsx](src/components/budgets/BudgetsPage.tsx)
- [src/components/budgets/BudgetsPageNew.tsx](src/components/budgets/BudgetsPageNew.tsx)

Components used:

- [components/budget-card.tsx](components/budget-card.tsx)

Hooks/services used:

- [src/hooks/useBudget.ts](src/hooks/useBudget.ts)
- [src/hooks/useBudgets.ts](src/hooks/useBudgets.ts)
- [src/services/firestore/budget.service.ts](src/services/firestore/budget.service.ts)
- [src/services/firestore/budgets.service.ts](src/services/firestore/budgets.service.ts)

Navigation flow:

- dashboard -> budgets -> refresh/create/dismiss alert

Data relationships:

- budgets depend on transaction categories and monthly spend state.

Reusable patterns:

- summary card, alert card, progress card, create bottom sheet

### 4. Goals

Purpose: savings target tracking and contribution progress.

Core functionality: create/edit/delete goals, add contributions, show overall progress.

Implementation status: solid and product-relevant.

Pages inside module:

- [app/dashboard/goals/page.tsx](app/dashboard/goals/page.tsx)

Components used:

- [src/components/goals/GoalCard.tsx](src/components/goals/GoalCard.tsx)
- [src/components/goals/AddGoalModal.tsx](src/components/goals/AddGoalModal.tsx)
- [src/components/goals/ContributionModal.tsx](src/components/goals/ContributionModal.tsx)
- [src/components/goals/ProgressRing.tsx](src/components/goals/ProgressRing.tsx)

Hooks/services used:

- [src/hooks/useGoals.ts](src/hooks/useGoals.ts)
- [src/services/firestore/goals.service.ts](src/services/firestore/goals.service.ts)

Navigation flow:

- dashboard -> goals -> open sheet -> add or contribute

Data relationships:

- goals feed analytics, timeline, and summary reporting.

Reusable patterns:

- progress ring, progress bar, inline contribution entry

### 5. Investments

Purpose: portfolio tracking and asset performance.

Core functionality: add/edit/delete investments, view performance, asset detail, transaction history.

Implementation status: fairly developed, but split across multiple screens and component families.

Pages inside module:

- [app/dashboard/investments/page.tsx](app/dashboard/investments/page.tsx)
- [app/dashboard/investments/[assetId]/page.tsx](app/dashboard/investments/%5BassetId%5D/page.tsx)
- [app/dashboard/investments/history/page.tsx](app/dashboard/investments/history/page.tsx)

Components used:

- [src/components/investments/portfolio-details-page.tsx](src/components/investments/portfolio-details-page.tsx)
- [src/components/investments/portfolio-hero.tsx](src/components/investments/portfolio-hero.tsx)
- [src/components/investments/performance-chart.tsx](src/components/investments/performance-chart.tsx)
- [src/components/investments/InvestmentCard.tsx](src/components/investments/InvestmentCard.tsx)
- [src/components/investments/AddInvestmentModal.tsx](src/components/investments/AddInvestmentModal.tsx)
- [src/components/investments/BuyAssetModal.tsx](src/components/investments/BuyAssetModal.tsx)
- [src/components/investments/SellAssetModal.tsx](src/components/investments/SellAssetModal.tsx)

Hooks/services used:

- [src/hooks/useInvestments.ts](src/hooks/useInvestments.ts)
- [src/services/firestore/investments.service.ts](src/services/firestore/investments.service.ts)
- [src/services/firestore/investmentTransactions.service.ts](src/services/firestore/investmentTransactions.service.ts)

Navigation flow:

- dashboard -> investments -> asset detail/history -> buy/sell modals

Data relationships:

- investments feed net worth, timeline, analytics, and reports.

Reusable patterns:

- asset cards, add/edit sheet, transaction history list

### 6. EMI

Purpose: loan and installment tracking.

Core functionality: manage EMIs, mark paid, compute remaining load.

Implementation status: useful and clear, but still a mostly standalone vertical.

Pages inside module:

- [app/dashboard/emi/page.tsx](app/dashboard/emi/page.tsx)

Components used:

- [src/components/emi/EMIPage.tsx](src/components/emi/EMIPage.tsx)
- [src/components/emi/EMITrackerCard.tsx](src/components/emi/EMITrackerCard.tsx)
- [src/components/emi/AddEMIModal.tsx](src/components/emi/AddEMIModal.tsx)

Hooks/services used:

- [src/hooks/useEMI.ts](src/hooks/useEMI.ts)
- [src/services/firestore/emi.service.ts](src/services/firestore/emi.service.ts)

Navigation flow:

- dashboard -> EMI -> add/edit/mark paid

Data relationships:

- EMI contributes to timeline, calendar, net worth liabilities, and reminders-like visibility.

Reusable patterns:

- installment progress bar, summary cards, sheet form

### 7. Policies

Purpose: insurance policy and renewal tracking.

Core functionality: add/edit/delete policies, show renewal status, annual premium summary.

Implementation status: solid but stylistically different from the main design system.

Pages inside module:

- [app/dashboard/policies/page.tsx](app/dashboard/policies/page.tsx)

Hooks/services used:

- [src/hooks/usePolicies.ts](src/hooks/usePolicies.ts)
- [src/services/firestore/policies.service.ts](src/services/firestore/policies.service.ts)

Navigation flow:

- dashboard -> policies -> add/edit/delete

Data relationships:

- policies feed documents, timeline, and reporting.

Reusable patterns:

- status badges, renewal countdown, bottom sheet editor

### 8. Reminders

Purpose: user-defined financial reminder scheduling.

Core functionality: create reminders with frequency, amount, due date, category, notes.

Implementation status: functional and relevant.

Pages inside module:

- [app/dashboard/reminders/page.tsx](app/dashboard/reminders/page.tsx)

Components used:

- [src/components/reminders/RemindersPage.tsx](src/components/reminders/RemindersPage.tsx)
- [src/components/reminders/AddReminderModal.tsx](src/components/reminders/AddReminderModal.tsx)

Hooks/services used:

- [src/hooks/useReminders.ts](src/hooks/useReminders.ts)
- [src/hooks/useDocumentReminders.ts](src/hooks/useDocumentReminders.ts)
- [src/services/firestore/reminders.service.ts](src/services/firestore/reminders.service.ts)

Navigation flow:

- dashboard -> reminders -> add/edit reminder

Data relationships:

- reminders feed timeline/calendar and the notification system.

Reusable patterns:

- modal-based create/edit flow, reminder category tagging

### 9. Recurring Transactions

Purpose: recurring income/expense automation.

Core functionality: manage recurring entries and schedule cadence.

Implementation status: available, but the route is a thin wrapper over a deeper component module.

Pages inside module:

- [app/dashboard/recurring/page.tsx](app/dashboard/recurring/page.tsx)

Components used:

- [src/components/recurring/RecurringTransactionsPage.tsx](src/components/recurring/RecurringTransactionsPage.tsx)
- [src/components/recurring/RecurringTransactionModal.tsx](src/components/recurring/RecurringTransactionModal.tsx)

Hooks/services used:

- [src/hooks/useRecurringTransactions.ts](src/hooks/useRecurringTransactions.ts)
- [src/services/firestore/recurring-transactions.service.ts](src/services/firestore/recurring-transactions.service.ts)

Navigation flow:

- dashboard -> recurring -> add/edit recurring entry

Data relationships:

- recurring entries influence transactions and automations.

Reusable patterns:

- schedule selector, recurring cadence editor

### 10. Notifications

Purpose: central alert inbox.

Core functionality: show notifications and status categories.

Implementation status: present, but likely not a fully action-oriented product inbox yet.

Pages inside module:

- [app/dashboard/notifications/page.tsx](app/dashboard/notifications/page.tsx)

Components used:

- [src/components/notifications/NotificationsPage.tsx](src/components/notifications/NotificationsPage.tsx)
- [src/components/notifications/NotificationCenter.tsx](src/components/notifications/NotificationCenter.tsx)
- [src/components/notifications/NotificationCard.tsx](src/components/notifications/NotificationCard.tsx)
- [src/components/notifications/NotificationBadge.tsx](src/components/notifications/NotificationBadge.tsx)

Hooks/services used:

- [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts)
- [src/services/firestore/notifications.service.ts](src/services/firestore/notifications.service.ts)

Navigation flow:

- dashboard -> notifications -> inspect alert list

Data relationships:

- receives events from security, budget alerts, reminders, and other modules.

Reusable patterns:

- notification center, badge, card

### 11. Documents

Purpose: vault for bills, insurance, tax files, subscriptions, warranties, and renewals.

Core functionality: add, search, filter, and summarize documents with due dates and attachments.

Implementation status: one of the most complete newer modules.

Pages inside module:

- [app/dashboard/documents/page.tsx](app/dashboard/documents/page.tsx)

Components used:

- [src/components/documents/DocumentVaultSummaryCard.tsx](src/components/documents/DocumentVaultSummaryCard.tsx)
- [src/components/documents/DocumentFilterBar.tsx](src/components/documents/DocumentFilterBar.tsx)
- [src/components/documents/DocumentCard.tsx](src/components/documents/DocumentCard.tsx)
- [src/components/documents/AddDocumentModal.tsx](src/components/documents/AddDocumentModal.tsx)

Hooks/services used:

- [src/hooks/useDocumentReminders.ts](src/hooks/useDocumentReminders.ts)
- [src/services/firestore/documents.service.ts](src/services/firestore/documents.service.ts)
- [src/types/document.ts](src/types/document.ts)

Navigation flow:

- dashboard -> documents -> search/filter/add

Data relationships:

- documents connect to reminders, policies, bills, and calendar/timeline events.

Reusable patterns:

- summary card, category tabs, status filter sheet, document card

### 12. Calendar and Timeline as Meta-Modules

Purpose: unify events across reminders, EMI, goals, investments, trading, and transactions.

Core functionality: aggregate events, filter by type/status, allow event creation.

Implementation status: strong strategic value, but conceptually overlapping.

Pages inside module:

- [app/dashboard/calendar/page.tsx](app/dashboard/calendar/page.tsx)
- [app/dashboard/timeline/page.tsx](app/dashboard/timeline/page.tsx)

Components used:

- [src/components/events/AddEventModal.tsx](src/components/events/AddEventModal.tsx)
- [src/components/events/FinancialEventCard.tsx](src/components/events/FinancialEventCard.tsx)

Hooks/services used:

- [src/hooks/useEvents.ts](src/hooks/useEvents.ts)
- [src/hooks/useReminders.ts](src/hooks/useReminders.ts)
- [src/hooks/useEMI.ts](src/hooks/useEMI.ts)
- [src/hooks/useGoals.ts](src/hooks/useGoals.ts)
- [src/hooks/useInvestments.ts](src/hooks/useInvestments.ts)
- [src/hooks/useTradingJournal.ts](src/hooks/useTradingJournal.ts)
- [src/hooks/useTransactions.ts](src/hooks/useTransactions.ts)

Navigation flow:

- dashboard -> calendar or timeline -> event detail/add

Data relationships:

- These screens synthesize nearly every active financial module.

Reusable patterns:

- event card, filter chips, add event modal

### 13. Analytics / Reports / Stats / Net Worth

Purpose: financial visibility and decision support.

Core functionality: charts, KPIs, trends, breakdowns, report scheduling.

Implementation status: useful but fragmented across several screens.

Pages inside module:

- [app/dashboard/analytics/page.tsx](app/dashboard/analytics/page.tsx)
- [app/dashboard/reports/page.tsx](app/dashboard/reports/page.tsx)
- [app/dashboard/stats/page.tsx](app/dashboard/stats/page.tsx)
- [app/dashboard/net-worth/page.tsx](app/dashboard/net-worth/page.tsx)

Components used:

- [components/analytics/AnalyticsCard.tsx](components/analytics/AnalyticsCard.tsx)
- [components/charts/ChartCard.tsx](components/charts/ChartCard.tsx)
- [components/stat-card/StatCard.tsx](components/stat-card/StatCard.tsx)
- [components/net-worth-card.tsx](components/net-worth-card.tsx)
- [components/net-worth-trend-chart.tsx](components/net-worth-trend-chart.tsx)

Hooks/services used:

- [src/hooks/useNetWorth.ts](src/hooks/useNetWorth.ts)
- [src/hooks/useTransactions.ts](src/hooks/useTransactions.ts)
- [src/hooks/useTradingJournal.ts](src/hooks/useTradingJournal.ts)
- [src/services/firestore/reports.service.ts](src/services/firestore/reports.service.ts)

Navigation flow:

- dashboard -> analytics or reports -> drill into related modules

Data relationships:

- these pages consume all major financial entities.

Reusable patterns:

- area chart, line chart, pie chart, stat card, report filter bar

### 14. Security and Settings

Purpose: control privacy, app lock, preferences, and data access.

Core functionality: PIN lock, privacy masking, session timeout, logout, backup/restore, basic preferences.

Implementation status: strong foundation, but several controls are still local-only or partial.

Pages inside module:

- [app/dashboard/security/page.tsx](app/dashboard/security/page.tsx)
- [app/dashboard/settings/page.tsx](app/dashboard/settings/page.tsx)

Components used:

- [src/components/security/LockScreen.tsx](src/components/security/LockScreen.tsx)
- [components/data-management.tsx](components/data-management.tsx)

Hooks/services used:

- [src/context/SecurityContext.tsx](src/context/SecurityContext.tsx)
- native biometrics helpers in src/native/
- [src/services/firestore/security.service.ts](src/services/firestore/security.service.ts)
- [src/services/firestore/notifications.service.ts](src/services/firestore/notifications.service.ts)
- [src/hooks/useBackupRestore.ts](src/hooks/useBackupRestore.ts)

Navigation flow:

- dashboard -> settings/security -> change local or persisted preferences

Data relationships:

- security state affects global masking, session access, and notification writes.

Reusable patterns:

- toggle rows, danger zone blocks, lock screen, audit log list

### 15. Settlements, Trading, Insights, Automations

Purpose: specialized or advanced finance surfaces.

Core functionality: settlement tracking, trading journal, AI insights, automation rules.

Implementation status: present, but more fragmented and less obviously integrated into the core UX.

Modules/pages:

- [app/dashboard/settlements/page.tsx](app/dashboard/settlements/page.tsx)
- [app/dashboard/trading-journal/page.tsx](app/dashboard/trading-journal/page.tsx)
- [app/dashboard/insights/page.tsx](app/dashboard/insights/page.tsx)
- [app/dashboard/automations/page.tsx](app/dashboard/automations/page.tsx)

Hooks/services:

- [src/hooks/useSettlements.ts](src/hooks/useSettlements.ts)
- [src/hooks/useTradingJournal.ts](src/hooks/useTradingJournal.ts)
- [src/hooks/useInsights.ts](src/hooks/useInsights.ts)
- [src/hooks/useAutomations.ts](src/hooks/useAutomations.ts)

Reusable patterns:

- table/list surfaces, analytics cards, rule dashboards

### 16. Internal / QA / Diagnostics

Purpose: internal verification and launch readiness.

Screens:

- [app/dashboard/diagnostics/page.tsx](app/dashboard/diagnostics/page.tsx)
- [app/dashboard/qa/page.tsx](app/dashboard/qa/page.tsx)
- [app/dashboard/release-checklist/page.tsx](app/dashboard/release-checklist/page.tsx)
- [app/dashboard/protected-example/page.tsx](app/dashboard/protected-example/page.tsx)

Status: Internal or placeholder.

## Phase 4. Feature Inventory

Legend: Existing, Partial, Missing, or Placeholder.

| Feature | Status | Module | Flow | Dependencies | Improvement opportunity |
|---|---|---|---|---|---|
| Add transaction | Existing | Transactions | Dashboard/shortcut -> modal -> save | Transactions hook, accounts | Add faster presets and stronger validation |
| Edit transaction | Existing/partial | Transactions | Open item -> edit | Transactions service | Make edit flows more discoverable |
| Delete transaction | Existing/partial | Transactions | Item action -> delete | Transactions service | Add undo and soft delete feedback |
| Filter transactions | Existing | Transactions | Range/category/account filters | finance helpers | Preserve filter state and expose chips |
| Search transactions | Existing | Transactions + global search | Search field/dialog | useGlobalSearch | Broaden search entity coverage |
| Add account | Existing | Accounts | Add modal | Accounts service | Improve onboarding from empty state |
| Transfer account funds | Existing | Accounts | Transfer modal | Accounts service | Surface transfer context in history |
| Budget creation | Existing | Budgets | Create budget modal | budget service(s) | Unify budget source of truth |
| Budget alerts | Existing | Budgets/notifications | Alert list -> dismiss | smart alert engine | Add alert explainability |
| Goal creation | Existing | Goals | Sheet -> save | Goals service | Better goal templates and milestones |
| Goal contribution | Existing | Goals | Inline input -> add | Goals service | Make savings actions more contextual |
| Recurring transactions | Existing | Recurring | Page -> modal -> save | Recurring service | Tie recurring rules to real transactions more clearly |
| Document vault | Existing | Documents | Add/search/filter | Documents service | Attachments and deletion need stronger UX |
| Reminder management | Existing | Reminders | Modal -> schedule | Reminders service | Add snooze and completion history |
| Notification center | Existing | Notifications | Center -> inspect | Notifications service | Add actions, grouping, and read state |
| Insurance policies | Existing | Policies | List -> sheet | Policies service | Clarify policy lifecycle and documents tie-in |
| EMI tracking | Existing | EMI | Add/edit/mark paid | EMI service | Add payment schedule and amortization view |
| Settlement tracking | Existing | Settlements | Add/edit sheet | Settlements service | Explain product meaning and workflow better |
| Portfolio tracking | Existing | Investments | Add/edit list | Investments service | Add allocation and performance analytics |
| Asset detail view | Existing | Investments | List -> detail | Detail component | Add richer charts and linked transactions |
| Investment history | Existing/partial | Investments | History list | investmentTransactions service | Align styling and error states |
| Financial calendar | Existing | Calendar | View toggle/filter | Events and synthesized entities | Clarify event semantics |
| Financial timeline | Existing | Timeline | Search/filter | Events and synthesized entities | Reduce overlap with calendar |
| Reports scheduling | Partial | Reports | Schedule modal | reports service | Make scheduled reports usable end-to-end |
| AI insights | Partial | Insights | View assistant surface | aiInsights service/hook | Integrate into core workflows |
| Automations | Partial | Automations | Dashboard rules | automation service | Replace stub-like behavior with real actions |
| Security lock | Existing | Security | Set PIN, unlock, session lock | Security context/service | Add clearer recovery and setup flow |
| Biometrics | Partial | Settings | Toggle biometric lock | native biometrics | Better explain capabilities on device |
| Backup/restore | Existing | Settings | DataManagement block | useBackupRestore | Expand coverage beyond the current subset |
| Global search | Existing/partial | Header/dialog | Cmd/Ctrl+K -> results | useGlobalSearch | Add more entity types and better ranking |
| Offline support | Existing | PWA | Offline fallback | service worker | Add more explicit sync recovery |
| Theme settings | Partial | Settings | Dark mode switch | local state | Persist and make it real across app |
| Currency settings | Partial | Settings | Select dropdown | local state | Persist per user and use globally |
| Language settings | Partial | Settings | Select dropdown | local state | Wire to actual i18n or remove |
| Session management | Missing | Settings/Security | Not fully implemented | Security context | Add active session inspection and revoke |
| Export all data | Partial | Backup | Export JSON/CSV subset | useBackupRestore | Expand to every major collection |
| Account delete | Missing | Settings | Button exists | auth/backend | Needs a real destructive flow |
| Search across modules | Missing/partial | Global | Cmd/Ctrl+K | useGlobalSearch | Include goals, investments, EMI, policies, settlements |

## Phase 5. UI System Audit

### 1. Design Consistency

The app has a recognizable neo-finance visual language: dark backgrounds, mint accent, rounded cards, soft shadows, and glowing gradients. That language is strongest in the root shell and newer dashboard surfaces. However, multiple pages deviate heavily into lighter grayscale or different card systems, which makes the product feel assembled from separate eras.

Issue: inconsistent visual language across modules.

Impact: users have to re-learn the interface when moving between dashboard areas.

Redesign opportunity: normalize the shell, cards, headers, empty states, and form patterns before changing aesthetics.

### 2. Typography System

The design is based on Inter via [app/layout.tsx](app/layout.tsx) and a CSS variable stack in [app/globals.css](app/globals.css). Typography is serviceable but not expressive. Headings, body text, and labels vary significantly between newer and older pages.

Issue: inconsistent text scale and weight hierarchy.

Impact: important actions and summary metrics do not always stand out.

Redesign opportunity: define explicit display, headline, section, body, and utility text roles.

### 3. Color System

The theme uses a dark canvas with mint accent and limited supporting colors. The CSS layer in [app/globals.css](app/globals.css) aggressively remaps many Tailwind classes to the neo palette.

Issue: color overrides are broad and sometimes mask intentional semantic colors from individual modules.

Impact: pages can look visually unified while actually losing semantic nuance, especially for success/warning/error states.

Redesign opportunity: keep the palette but reduce global remapping so semantic status colors remain meaningful.

### 4. Card Patterns

Cards are the dominant surface pattern across the app. Rounded corners, borders, shadows, and soft elevation appear everywhere.

Issue: too many card variants exist with slight differences in padding, radius, and elevation.

Impact: the interface feels dense and repetitive.

Redesign opportunity: define 3-4 canonical card types only.

### 5. Navigation Patterns

The product has three navigation systems:

- desktop sidebar + top navbar + bottom nav in [app/dashboard/layout.tsx](app/dashboard/layout.tsx)
- global mobile app shell in src/components/mobile/AppShell.tsx
- route-local actions such as FABs and sheets

Issue: shell duplication risk, especially around dashboard pages and global mobile nav.

Impact: users may encounter duplicated controls or conflicting navigation affordances.

Redesign opportunity: define a single canonical shell per breakpoint and explicitly suppress redundant controls on dashboard routes.

### 6. Button Styles

Buttons range from neo-pill mint buttons to default button primitives and many page-specific hardcoded variants.

Issue: inconsistent emphasis and states.

Impact: primary actions sometimes compete with secondary actions or disappear in dense screens.

Redesign opportunity: standardize primary, secondary, ghost, danger, and icon-button tokens.

### 7. Modal System

The app uses a mix of centered modals, bottom sheets, and inline forms.

Issue: modal patterns are not consistently matched to task complexity.

Impact: some create/edit flows feel too heavy, while others hide important configuration.

Redesign opportunity: use bottom sheets for quick mobile creation and full dialogs for complex multi-step forms.

### 8. Bottom Sheets

Bottom sheets are a strong pattern here, especially for quick entry on mobile.

Issue: many sheets are dense, with too many fields and minimal progressive disclosure.

Impact: one-handed mobile use becomes tiring on complex forms.

Redesign opportunity: split long forms into structured steps or sections.

### 9. Forms

Form styling is inconsistent. Some use components/ui primitives, others use direct HTML inputs with bespoke classes.

Issue: validation, field spacing, and helper text patterns are not standardized.

Impact: form completion confidence is lower, especially for financial entry tasks.

Redesign opportunity: create a shared finance-form field pattern with labels, help text, errors, and units.

### 10. Lists

List surfaces are plentiful and usually card-based.

Issue: list density varies dramatically between modules.

Impact: some screens feel empty while others feel cramped.

Redesign opportunity: create list density modes for summary, standard, and compact views.

### 11. Tables

Table-like surfaces exist in transaction and report contexts, but they are visually inconsistent and often shift into card lists on mobile.

Issue: table semantics are not consistently preserved.

Impact: comparison and sorting behavior is harder to read.

Redesign opportunity: reserve table views for dense desktop analysis, and use list cards on mobile.

### 12. Mobile Responsiveness

Mobile is clearly important, and many pages have mobile-first controls.

Issue: the app mixes mobile-first and desktop-first patterns in the same route family.

Impact: some screens are excellent on mobile while others feel desktop-shrunken.

Redesign opportunity: define mobile layouts first for finance entry and review flows, then scale up.

### 13. Android Usability

Because this is a Capacitor app, Android ergonomics matter.

Issue: some forms and lists are not optimized for thumb reach, safe areas, or keyboard overlap.

Impact: one-handed use is less comfortable than it should be.

Redesign opportunity: keep primary actions in the lower half of the screen and standardize bottom spacing around the Android nav area.

### 14. One-handed Usage

Issue: some primary actions live in top headers or overflow menus rather than the thumb zone.

Impact: high-frequency actions such as add transaction, add account, or open a quick action sheet require extra hand travel.

Redesign opportunity: keep the most common money-entry actions anchored near the bottom.

### 15. Information Hierarchy

The hierarchy is strongest in dashboard, transactions, and analytics, but weaker in settings, security, and internal tools.

Issue: several screens present too many options with equal visual weight.

Impact: users cannot quickly identify what matters.

Redesign opportunity: create a consistent priority ladder: headline, primary metric, secondary detail, control row.

## Phase 6. Reusable Component Inventory

### Shell and Navigation

| Component | Location | Purpose | Reuse frequency | Props/API quality | Design quality | Design-system migration fit |
|---|---|---|---|---|---|---|
| Sidebar | [components/sidebar.tsx](components/sidebar.tsx) | Desktop navigation | High | Good | Good, but shell-specific | High |
| TopNavbar | [components/top-navbar.tsx](components/top-navbar.tsx) | Top action bar/search | High | Good | Good | High |
| BottomNav | [components/bottom-nav.tsx](components/bottom-nav.tsx) | Mobile/dashboard nav | High | Good | Good | High |
| AppShell | [src/components/mobile/AppShell.tsx](src/components/mobile/AppShell.tsx) | Global mobile wrapper | High | Good | Moderate duplication risk | High |
| MobileBottomNavigation | [src/components/mobile/MobileBottomNavigation.tsx](src/components/mobile/MobileBottomNavigation.tsx) | Mobile tab bar | Medium | Good | Good | High |
| FloatingActionButton | [components/floating-action-button.tsx](components/floating-action-button.tsx) | Add action shortcut | High | Simple | Good | High |
| UniversalActionsSheet | [components/universal-actions-sheet.tsx](components/universal-actions-sheet.tsx) | Quick actions menu | High | Good | Good | High |

### Page and State Components

| Component | Location | Purpose | Reuse frequency | Props/API quality | Design quality | Fit |
|---|---|---|---|---|---|---|
| EmptyState | [components/states/EmptyState.tsx](components/states/EmptyState.tsx) | Generic empty state | High | Good | Good | High |
| LoadingState | [components/states/LoadingState.tsx](components/states/LoadingState.tsx) | Loading skeleton | High | Good | Good | High |
| ErrorState | [components/states/ErrorState.tsx](components/states/ErrorState.tsx) | Error fallback | High | Good | Good | High |
| OfflineState | [components/states/OfflineState.tsx](components/states/OfflineState.tsx) | Offline fallback | Medium | Good | Good | High |
| SyncBadge | [components/connection-status/SyncBadge.tsx](components/connection-status/SyncBadge.tsx) | Sync status indicator | Medium | Good | Good | High |
| ConnectionStatusBar | [components/connection-status/ConnectionStatusBar.tsx](components/connection-status/ConnectionStatusBar.tsx) | Connectivity status | Medium | Good | Good | High |

### Financial Cards

| Component | Location | Purpose | Reuse frequency | Quality | Fit |
|---|---|---|---|---|---|
| AccountCard | [components/account-card.tsx](components/account-card.tsx) and [src/components/accounts/AccountCard.tsx](src/components/accounts/AccountCard.tsx) | Account summary | High | Duplicated | High, if consolidated |
| BudgetCard | [components/budget-card.tsx](components/budget-card.tsx) and [src/components/budgets/BudgetCard.tsx](src/components/budgets/BudgetCard.tsx) | Budget summary | Medium | Duplicated | High |
| GoalCard | [components/goal-card.tsx](components/goal-card.tsx) and [src/components/goals/GoalCard.tsx](src/components/goals/GoalCard.tsx) | Goal summary | High | Duplicated | High |
| InvestmentCard | [components/investment-card.tsx](components/investment-card.tsx) and [src/components/investments/InvestmentCard.tsx](src/components/investments/InvestmentCard.tsx) | Investment summary | High | Duplicated | High |
| EMIProgressCard | [components/emi-progress-card.tsx](components/emi-progress-card.tsx) | EMI summary | Medium | Good | Good | High |
| ReminderCard | [components/reminder-card.tsx](components/reminder-card.tsx) | Reminder summary | Medium | Good | Good | High |
| StatCard | [components/stat-card/StatCard.tsx](components/stat-card/StatCard.tsx) | KPI card | High | Good | Good | High |

### Lists, Charts, and Tables

| Component | Location | Purpose |
|---|---|---|
| RecentTransactionsTable | [components/recent-transactions-table.tsx](components/recent-transactions-table.tsx) | Transaction overview table |
| TransactionsTable | [components/tables/TransactionsTable.tsx](components/tables/TransactionsTable.tsx) | Detailed transaction table |
| ChartCard | [components/charts/ChartCard.tsx](components/charts/ChartCard.tsx) | Chart container |
| ExpensePieChart | [components/expense-pie-chart.tsx](components/expense-pie-chart.tsx) | Spending distribution |
| IncomeExpenseChart | [components/income-expense-chart.tsx](components/income-expense-chart.tsx) | Cashflow comparison |
| SpendingLineChart | [components/spending-line-chart.tsx](components/spending-line-chart.tsx) | Trend chart |
| NetWorthTrendChart | [components/net-worth-trend-chart.tsx](components/net-worth-trend-chart.tsx) | Net worth trend |
| InvestmentAllocationChart | [components/investment-allocation-chart.tsx](components/investment-allocation-chart.tsx) | Asset allocation |

### Forms and Modals

| Component | Location | Purpose |
|---|---|---|
| AppModal | [components/modals/AppModal.tsx](components/modals/AppModal.tsx) | Generic modal shell |
| AddTransactionModal | [components/modals/AddTransactionModal.tsx](components/modals/AddTransactionModal.tsx) and [src/components/transactions/AddTransactionModal.tsx](src/components/transactions/AddTransactionModal.tsx) | Transaction composer |
| AddAccountModal | [src/components/accounts/AddAccountModal.tsx](src/components/accounts/AddAccountModal.tsx) | Account creation |
| TransferModal | [src/components/accounts/TransferModal.tsx](src/components/accounts/TransferModal.tsx) | Transfer form |
| AddGoalModal | [src/components/goals/AddGoalModal.tsx](src/components/goals/AddGoalModal.tsx) | Goal creation |
| AddInvestmentModal | [src/components/investments/AddInvestmentModal.tsx](src/components/investments/AddInvestmentModal.tsx) | Investment creation |
| AddEMIModal | [src/components/emi/AddEMIModal.tsx](src/components/emi/AddEMIModal.tsx) | EMI creation |
| AddReminderModal | [src/components/reminders/AddReminderModal.tsx](src/components/reminders/AddReminderModal.tsx) | Reminder creation |
| AddDocumentModal | [src/components/documents/AddDocumentModal.tsx](src/components/documents/AddDocumentModal.tsx) | Document creation |

### Reusable System Map

The most reusable system should be normalized around:

1. Shell navigation and action placement.
2. Summary cards and KPI cards.
3. Empty/loading/error states.
4. Add/edit sheets and modal forms.
5. Financial chart cards.

The current system already has the ingredients. It just needs canonical choices per category.

## Phase 7. Visualization + Analytics Audit

### Existing Visualizations

| Module | Current charts/widgets |
|---|---|
| Dashboard | Compact summary widgets, transaction feed, notification center, document summary |
| Transactions | Summary header, totals, grouped date feed, calendar mode, month/day/week range logic |
| Analytics | Area chart, line chart, trading KPI panel |
| Stats | Pie chart, category progress bars |
| Net worth | Trend chart, current worth card, asset/liability cards |
| Reports | Area chart, line chart, bar chart, pie chart, KPIs, heatmap-like patterns |
| Investments | Performance/return cards, detail page charting |
| Goals | Progress bars, optional ring component |
| EMI | Progress bars and payment status blocks |
| Budgets | Progress cards and alert cards |
| Documents | Summary cards by type/status |
| Calendar/Timeline | Event synthesis and filtered lists; not chart-heavy |

### Missing or Weak Visualization Areas

| Module | Missing / weak visualization |
|---|---|
| Dashboard | No stable net worth trend, cashflow trend, or health score in the current compact dashboard surface |
| Transactions | Category trend over time, monthly spend comparison, cashflow waterfall, recurrence visibility |
| Accounts | Balance history per account, liquidity split, risk/idle cash visualization |
| Investments | Allocation donut, realized vs unrealized gains, diversification chart |
| Goals | Dedicated progress ring and milestone timeline |
| EMI | Payoff timeline, interest burden chart, upcoming payment calendar |
| Policies | Coverage overview, renewal calendar, premium burden chart |
| Documents | Renewal urgency heatmap, bill cadence view |
| Reports | More drilldowns and saved report presets |
| Analytics | Budget and goal sections are explicitly unfinished |
| Net worth | Historical growth bands, asset/liability trend split |
| Settlements | Outstanding balance timeline and person-level exposure chart |
| Trading journal | Win/loss distribution, drawdown curve, monthly P&L chart |

### Premium Fintech Visualization Opportunities

1. Net worth waterfall by asset class and liability class.
2. Expense composition with trend comparison to previous month.
3. Budget burn-down over the month.
4. Goal progress rings with milestones and projected completion dates.
5. EMI payoff timeline with remaining principal and next due dates.
6. Investment allocation donut plus gain/loss overlay.
7. Document renewal urgency map.
8. One-screen financial health score driven by multiple modules.

## Phase 8. UX Gap Analysis

### Missing Modules

- A truly integrated lending module with borrower/lender status.
- A proper portfolio analytics module for investments.
- A dedicated recurring-income/expense automation console.
- A first-class backup/restore history and restore confirmation flow.
- A coherent settings system that persists all preferences, not just local toggles.

### Missing Flows

- No clean onboarding path that clearly bridges welcome -> onboarding -> auth -> dashboard for returning users.
- No full password reset journey is visible in the main auth screens.
- No clear empty-state path from documents/policies/reminders into setup guidance.
- No explicit device/session management workflow beyond a single action button.
- No guided transfer/account reconciliation flow.

### Missing Features

- Global search across all major modules, not just transactions and accounts.
- Saved filters, saved reports, and report sharing.
- Document attachment preview and richer document lifecycle actions.
- Better export granularity across all collections.
- Full dark/light theme persistence and multi-language support.
- Real implementation of the account deletion and session management paths.

### UX Bottlenecks

- Dense transaction and analytics screens can overwhelm new users.
- Some create/edit sheets are too long for mobile entry.
- Several screens repeat the same information in different layouts without adding new decisions.
- Internal screens are visually similar enough to product screens that they can be mistaken for user features.

### Navigation Friction

- Too many module routes for similar concepts: calendar vs timeline, analytics vs reports vs stats, settings vs security.
- Duplicate shell systems can create confusion on mobile.
- A legacy login screen exists alongside the real one.

### Weak Financial Visibility

- Dashboard no longer reads as a true executive overview; it is more of a compact transaction-first surface.
- Expense, budget, investment, and goal visibility are split across multiple modules.
- There is no single financial health overview that ties together income, spend, assets, liabilities, automation, and risk.

### Missing Automation Opportunities

- Auto-suggest transactions from recurring entries and reminders.
- Auto-generate budget alerts from spend velocity.
- Auto-surface due documents based on upcoming renewals.
- Auto-link EMI, policies, and documents into an obligations timeline.

### Missing Android UX Patterns

- More thumb-zone placement for primary actions.
- Better safe-area aware bottom spacing.
- Better keyboard avoidance for long forms.
- More explicit offline/sync recovery state in product screens.

## Phase 9. Stitch Redesign Preparation Map

This is a redesign preparation map only. No redesign is proposed here.

### Recommended Generation Order

#### Batch 1. Shell and Navigation

- Dashboard shell
- Sidebar
- Top navbar
- Bottom navigation
- FAB / universal quick actions
- Empty / loading / error states

#### Batch 2. Core Money Movement

- Transactions
- Add transaction
- Accounts
- Categories

#### Batch 3. Planning and Obligations

- Budgets
- Goals
- EMI
- Reminders
- Policies

#### Batch 4. Storage and History

- Documents
- Settlements
- Notifications
- Recurring transactions

#### Batch 5. Wealth and Growth

- Investments
- Investment detail
- Investment history
- Net worth

#### Batch 6. Analysis and Intelligence

- Analytics
- Stats
- Reports
- Timeline
- Calendar
- Insights
- Automations

#### Batch 7. Trust and Control

- Security
- Settings
- Backup/restore

#### Batch 8. Internal Surfaces

- Diagnostics
- QA
- Release checklist
- Protected example

### Page-to-Stitch Mapping

| PFOS page | Future Stitch page direction |
|---|---|
| Dashboard | Finance OS home / executive overview |
| Transactions | Ledger / transaction timeline |
| Accounts | Accounts and liquidity |
| Budgets | Budget control center |
| Goals | Savings goal tracker |
| Documents | Document vault |
| Calendar | Financial calendar |
| Timeline | Financial timeline / activity stream |
| Stats | Spend analytics |
| Analytics | Analytics hub |
| Reports | Reporting workspace |
| Net worth | Net worth dashboard |
| Investments | Portfolio workspace |
| EMI | EMI / loans workspace |
| Policies | Insurance obligations |
| Reminders | Reminder center |
| Recurring | Recurring rules manager |
| Notifications | Alerts inbox |
| Settlements | Settlement ledger |
| Security | Security and privacy |
| Settings | Preferences and backup |
| Insights | AI insights desk |
| Automations | Automation rules desk |

## Priority Risks

1. Duplicate systems for budgets, quick actions, feeds, and auth protection will cause redesign drift unless one canonical path is chosen first.
2. Several route pages are visually or functionally inconsistent enough that a UI redesign layered on top would hide, not solve, the underlying architecture problem.
3. Internal/demo pages are mixed in with real product routes, increasing the chance of accidental exposure or misclassification.
4. The current analytics story is fragmented across too many routes to serve as a coherent product narrative without consolidation.

## Recommended Pre-Redesign Cleanup Order

1. Choose one canonical implementation for budgets, auth guards, quick actions, and transaction feeds.
2. Separate internal/demo routes from product routes in the navigation model.
3. Normalize shell behavior across dashboard and mobile app modes.
4. Decide the canonical hierarchy for analytics, reports, stats, timeline, and calendar.
5. Expand global search and backup coverage to all major financial entities.

## Evidence Anchors

- App shell and layout: [app/layout.tsx](app/layout.tsx), [app/dashboard/layout.tsx](app/dashboard/layout.tsx)
- Core landing redirect: [app/page.tsx](app/page.tsx)
- Auth: [app/auth/login/page.tsx](app/auth/login/page.tsx), [app/auth/register/page.tsx](app/auth/register/page.tsx)
- Main transaction surface: [app/dashboard/transactions/page.tsx](app/dashboard/transactions/page.tsx)
- Dashboard home: [app/dashboard/page.tsx](app/dashboard/page.tsx)
- Settings/security: [app/dashboard/settings/page.tsx](app/dashboard/settings/page.tsx), [app/dashboard/security/page.tsx](app/dashboard/security/page.tsx)
- Documents: [app/dashboard/documents/page.tsx](app/dashboard/documents/page.tsx)
- Analytics/reporting: [app/dashboard/analytics/page.tsx](app/dashboard/analytics/page.tsx), [app/dashboard/reports/page.tsx](app/dashboard/reports/page.tsx), [app/dashboard/stats/page.tsx](app/dashboard/stats/page.tsx), [app/dashboard/net-worth/page.tsx](app/dashboard/net-worth/page.tsx)
- Core services: src/services/firestore/
- Core hooks: src/hooks/
- Theme system: [app/globals.css](app/globals.css), [tailwind.config.ts](tailwind.config.ts)

## Bottom Line

PFOS is already a broad finance OS with real domain depth. The most important next step is not visual redesign; it is architectural and product cleanup so there is one source of truth for each major capability, one coherent navigation model, and one clearer story for how the user moves from transaction tracking to financial planning and insight.