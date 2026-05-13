# PFOS Account Management Documentation

## Overview

PFOS now includes a complete account creation and management system. Users must create their own bank accounts before they can track transactions. This provides a cleaner, more intentional onboarding experience.

## User Flows

### 1. New User Registration

```
User Registration
    ↓
User Profile Created + Default Categories Initialized
    ↓
Dashboard Shows EmptyAccountsState
    ↓
User Clicks "Add Your First Account"
    ↓
AddAccountModal Opens
    ↓
User Fills Account Details
    ↓
Account Saved to Firestore
    ↓
Dashboard Refreshes with Account
```

### 2. Adding First Account

1. **Click** "Add Your First Account" button in `EmptyAccountsState`
2. **Fill** form:
   - Account Name (e.g., "My Bank Account")
   - Account Type (Checking, Savings, Credit Card, Investment, Loan)
   - Starting Balance (₹)
   - Currency (default: INR)
3. **Click** "Create Account"
4. **Account saved** to `users/{userId}/accounts/{accountId}`
5. **Dashboard** updates to show account and transaction flow

### 3. Adding Transactions (After Account Exists)

1. **Dashboard** shows "Your Accounts" section with created account
2. **Click** "Add Transaction" button
3. **AddTransactionModal** opens with:
   - Account selector (pre-populated with available accounts)
   - Transaction type (income/expense/transfer)
   - Amount
   - Category
   - Date
   - Notes
4. **Click** "Save Transaction"
5. **Transaction** saved to Firestore with account reference
6. **Account balance** updates dynamically

## Architecture

### Components

**AddAccountModal** (`src/components/accounts/AddAccountModal.tsx`)
- Modal for creating new accounts
- Form with account name, type, balance, currency
- Error handling and validation
- Optimistic UI updates

**EmptyAccountsState** (`src/components/accounts/EmptyAccountsState.tsx`)
- Empty state shown when user has no accounts
- Hero section with wallet icon
- Getting started steps (1-3)
- CTA button to create first account

### Context & Hooks

**AccountContext** (`src/context/AccountContext.tsx`)
- Global account state management
- Methods: `addAccount()`, `updateAccount()`, `removeAccount()`, `getTotalBalance()`
- Fetches accounts on user authentication
- Optimistic updates with Firestore persistence

**useAccounts()** (`src/hooks/useAccounts.ts`)
- Simple hook to access AccountContext
- Usage: `const { accounts, addAccount, loading } = useAccounts()`

### Services

**AccountsService** (`src/services/firestore/accounts.service.ts`)
- Extends `BaseFirestoreService<Account>`
- Methods:
  - `createAccount(userId, accountData)` - Create new account
  - `getUserAccounts(userId)` - Get all accounts for user
  - `getActiveAccounts(userId)` - Get active accounts only
  - `updateBalance(accountId, newBalance)` - Update account balance
  - `getAccountById(userId, accountId)` - Secure account fetch

### Data Model

```typescript
interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
}
```

### Firestore Collections

**Root Level:**
```
accounts/{accountId}
  - userId: string (user who owns account)
  - name: string
  - type: string
  - balance: number
  - currency: string
  - isActive: boolean
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

**Alternative: User Subcollections** (Recommended for scalability)
```
users/{userId}/accounts/{accountId}
  - (same fields as above, minus userId)
```

## Dashboard Integration

### Updated Dashboard Flow

```tsx
export default function Dashboard() {
  const { accounts, loading: accountsLoading, addAccount } = useAccounts();
  const { transactions, loading: transactionsLoading } = useTransactions();

  // Check 1: If no accounts, show empty accounts state
  if (accounts.length === 0 && !accountsLoading) {
    return <EmptyAccountsState onAddAccount={...} />;
  }

  // Check 2: If no transactions, show empty finance state
  if (transactions.length === 0 && !transactionsLoading) {
    return <EmptyFinanceState onAddTransaction={...} />;
  }

  // Check 3: Show full dashboard with data
  return (
    <Dashboard>
      <AccountsWidget accounts={accounts} />
      <SavingsRateWidget />
      <RecentTransactionsWidget transactions={transactions} />
    </Dashboard>
  );
}
```

### Dashboard Widgets

**Your Accounts Widget**
- Lists all user accounts
- Shows account name, type, balance
- "Add Account" button to create more accounts
- Clicking account could show detailed view (future)

**Savings Rate Widget**
- Shows percentage of income saved
- Shows total savings amount
- Based on real transaction data

**Recent Transactions Widget**
- Shows last 5 transactions
- Grouped by account (future enhancement)
- Edit/delete transaction options (future)

## Firestore Rules

### Account Collection Rules

```firestore
match /accounts/{accountId} {
  allow read, write: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
}
```

Ensures:
- Only authenticated users can access accounts
- Users can only read/write their own accounts
- Any attempt to access another user's account is blocked

## Testing Account Creation

### Manual Test Flow

1. **Register new account**
   ```
   URL: http://localhost:3000/auth/register
   Email: test@example.com
   Password: Test123!
   ```

2. **Verify empty state**
   ```
   Dashboard shows EmptyAccountsState
   "No Accounts Yet" title visible
   "Add Your First Account" button visible
   ```

3. **Create account**
   ```
   Click "Add Your First Account"
   Fill form:
     - Name: "My Bank"
     - Type: "Checking"
     - Balance: 50000
     - Currency: "INR"
   Click "Create Account"
   ```

4. **Verify Firestore**
   ```
   Firebase Console → Firestore
   Collection: accounts (or users/{userId}/accounts)
   Document: {accountId}
   Fields: name, type, balance, currency, userId, etc.
   ```

5. **Verify Dashboard**
   ```
   Dashboard reloads
   "Your Accounts" widget shows account
   Shows: "My Bank" + "₹50.0K" balance
   ```

6. **Create transaction**
   ```
   Click "Add Transaction"
   Fill form:
     - Type: "Income"
     - Amount: 10000
     - Category: "Salary"
     - Date: Today
   Click "Save"
   ```

7. **Verify transaction**
   ```
   Transaction appears in "Recent Transactions"
   Dashboard balance updates
   Account balance shows updated value
   Firestore shows transaction with accountId reference
   ```

## Error Handling

### Validation

**AddAccountModal validates:**
- Account name is required and non-empty
- Account type is required
- Balance is a valid number (default: 0)
- Currency is a valid code

### Firestore Errors

**If Firestore write fails:**
- Optimistic UI update is rolled back
- Error message displayed to user
- User can retry without data duplication

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| User signs out mid-account-creation | Modal closes, no account saved |
| Network fails during save | Optimistic update rolled back, error shown |
| User creates duplicate account | Both accounts created (unique by timestamp) |
| User tries to create 1000 accounts | No limit enforced (consider adding later) |
| Currency field empty | Defaults to "INR" |

## Performance Considerations

### Optimizations

1. **Optimistic Updates**
   - Account appears immediately after user clicks save
   - Firestore write happens in background
   - If Firestore fails, UI rolls back

2. **Caching**
   - AccountContext caches all user accounts
   - Only refetches on user change or manual refresh
   - Reduces Firestore reads

3. **Batch Operations**
   - Adding account doesn't refetch all transactions
   - Adding transaction doesn't refetch all accounts
   - Separate contexts for separate concerns

4. **Lazy Loading**
   - Accounts fetched only when user authenticated
   - Transactions fetched independently
   - Dashboard renders progressively

### Firestore Query Patterns

```typescript
// Get all accounts for user
query(accounts, where('userId', '==', userId))

// Get active accounts only
query(accounts, 
  where('userId', '==', userId),
  where('isActive', '==', true)
)

// Get accounts by type
query(accounts,
  where('userId', '==', userId),
  where('type', '==', 'checking')
)
```

## Future Enhancements

### Phase 2: Advanced Account Features
- [ ] Edit account details (name, balance)
- [ ] Delete/archive accounts
- [ ] Account types with special handling (credit card limit, loan amount)
- [ ] Account balance history tracking
- [ ] Account reconciliation

### Phase 3: Multi-Account Features
- [ ] Transfer between accounts
- [ ] Linked accounts (parent/sub)
- [ ] Account groups (by bank, type)
- [ ] Budget per account

### Phase 4: Integration Features
- [ ] Bank import/sync (Plaid integration)
- [ ] CSV import
- [ ] Recurring transactions per account
- [ ] Account statements/exports

## Troubleshooting

### Issue: Account not appearing after creation

**Cause:** Firestore write failed, not reflected in AccountContext

**Solution:**
1. Check browser console for errors
2. Verify Firestore rules deployed
3. Check network tab for failed requests
4. Try creating account again

### Issue: Multiple duplicate accounts created

**Cause:** User clicked save multiple times before modal closed

**Solution:**
- Add debouncing to save button (disable after first click)
- Show loading state during save
- Show success confirmation before closing modal

### Issue: Account balance not updating after transaction

**Cause:** Transaction created but account balance not updated

**Solution:**
1. Manual balance update needed
2. Or automatic update when transaction is saved
3. Currently accounts don't auto-sync with transactions

### Issue: Firestore rules permission denied

**Cause:** Rules not deployed or not matching

**Solution:**
```bash
# Deploy rules
firebase deploy --only firestore:rules

# Verify user authenticated
# Check Firestore rule syntax in firestore.rules
```

## References

- [Account Data Model](../FIRESTORE_ARCHITECTURE.md#collection-structure)
- [Firestore Security Rules](../firestore.rules)
- [AddAccountModal Component](../src/components/accounts/AddAccountModal.tsx)
- [AccountContext Implementation](../src/context/AccountContext.tsx)
