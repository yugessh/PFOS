# PFOS Firestore Architecture Documentation

## Overview

PFOS uses Firestore as the backend database with a user-centric architecture. All data is organized by user ID to ensure security and isolation.

## Collection Structure

### Primary Collections (Root Level)

```
users/
  {userId}/
    - uid: string (Firebase Auth UID)
    - email: string
    - displayName?: string
    - createdAt: Timestamp
    - updatedAt: Timestamp
    - onboardingCompleted: boolean
    - preferences: {
        currency: string (default: 'INR')
        language: string (default: 'en')
        theme: 'light' | 'dark'
        notifications: boolean
      }
```

### Subcollections (User-Scoped)

All financial data is stored in user subcollections:

```
users/{userId}/
  accounts/
    {accountId}/
      - name: string
      - type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan'
      - balance: number
      - currency: string
      - isActive: boolean
      - createdAt: Timestamp
      - updatedAt: Timestamp

  transactions/
    {transactionId}/
      - description: string
      - amount: number
      - type: 'income' | 'expense' | 'transfer'
      - category?: string
      - accountId?: string
      - date: Timestamp
      - notes?: string
      - createdAt: Timestamp
      - updatedAt: Timestamp

  categories/
    {categoryId}/
      - name: string
      - type: 'income' | 'expense' | 'transfer'
      - color: string
      - icon: string
      - isActive: boolean
      - createdAt: Timestamp
      - updatedAt: Timestamp

  investments/
    {investmentId}/
      - name: string
      - type: string
      - amount: number
      - currentValue: number
      - returns: number
      - date: Timestamp
      - createdAt: Timestamp
      - updatedAt: Timestamp

  goals/
    {goalId}/
      - title: string
      - targetAmount: number
      - currentAmount: number
      - dueDate: Timestamp
      - category: string
      - createdAt: Timestamp
      - updatedAt: Timestamp

  emi/
    {emiId}/
      - loanName: string
      - principalAmount: number
      - emiAmount: number
      - monthlyEmi: number
      - rateOfInterest: number
      - startDate: Timestamp
      - endDate: Timestamp
      - nextDueDate: Timestamp
      - createdAt: Timestamp
      - updatedAt: Timestamp

  reminders/
    {reminderId}/
      - title: string
      - description: string
      - reminderDate: Timestamp
      - type: 'payment' | 'bill' | 'investment' | 'goal'
      - isCompleted: boolean
      - createdAt: Timestamp
      - updatedAt: Timestamp

  settlements/
    {settlementId}/
      - description: string
      - amount: number
      - date: Timestamp
      - status: 'pending' | 'completed'
      - createdAt: Timestamp
      - updatedAt: Timestamp

  policies/
    {policyId}/
      - policyName: string
      - policyNumber: string
      - amount: number
      - premium: number
      - expiryDate: Timestamp
      - createdAt: Timestamp
      - updatedAt: Timestamp
```

## Firestore Security Rules

### Key Security Principles

1. **Authentication Required**: All operations require Firebase Auth
2. **User Isolation**: Users can only access their own documents
3. **Subcollection Access**: Users can only access their own subcollections

### Rule Structure

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated user must exist
    function isAuthenticated() {
      return request.auth != null;
    }

    // User must be accessing their own documents
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // User document and all subcollections
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      match /accounts/{accountId} {
        allow read, write: if isOwner(userId);
      }
      // ... similar for other subcollections
    }
  }
}
```

## Services Architecture

### Base Service

All Firestore services extend `BaseFirestoreService<T>` which provides:

- `create(data)` - Add new document with auto-generated ID
- `createWithId(id, data)` - Add document with specific ID
- `getById(id)` - Fetch single document
- `update(id, data)` - Update existing document
- `softDelete(id)` - Mark document as deleted
- `list(options)` - Query documents with filtering
- `getByUserId(userId)` - Query by user ID

### Service Examples

```typescript
import { usersService } from '@/src/services/firestore/users.service';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { accountsService } from '@/src/services/firestore/accounts.service';

// Create user profile after signup
await usersService.initializeUserProfile(userId, {
  email: 'user@example.com',
  displayName: 'John Doe'
});

// Add transaction
const response = await transactionsService.createTransaction(userId, {
  description: 'Grocery shopping',
  amount: 5000,
  type: 'expense',
  category: 'Groceries',
  date: new Date(),
});

// Get user's transactions
const txns = await transactionsService.getUserTransactions(userId);

// Update transaction
await transactionsService.update(transactionId, {
  description: 'Updated description'
});
```

## User Onboarding Flow

### 1. Authentication
- User signs up or logs in via Firebase Auth
- Email/password or Google OAuth

### 2. User Document Creation
- `ensureUserProfile()` creates user document
- Initializes default categories
- Creates default bank account

### 3. First-Time User Experience
- Dashboard shows empty state
- User is guided to add first transaction
- After first transaction, real finance dashboard appears

## Transaction Persistence

### Save Flow
1. User fills transaction form in AddTransactionModal
2. Form data validated
3. `addTransaction()` called from useTransactions hook
4. Optimistic UI update (shows transaction immediately)
5. `transactionsService.createTransaction(userId, data)` calls Firestore
6. Success: Transaction saved to Firestore
7. Failure: UI rolls back, error shown to user

### Real-Time Updates
- Dashboard uses TransactionContext
- TransactionContext fetches on mount (if authenticated)
- Optimistic updates for better UX
- Error handling with retry

## Development Workflow

### Testing Locally

```bash
# Start dev server
pnpm dev

# Firebase emulator (optional)
firebase emulators:start
```

### Test Scenarios

1. **New User Registration**
   - Register new account
   - Verify user document created
   - Verify default categories created
   - Verify default account created

2. **Transaction Persistence**
   - Add transaction
   - Verify appears in Firebase Console
   - Refresh page
   - Verify transaction still visible

3. **Multi-Device Sync**
   - Login on device A
   - Add transaction
   - Login on device B
   - Verify transaction visible

4. **Offline Support** (Future)
   - Enable offline persistence
   - Add transaction offline
   - Go online
   - Verify sync

## Collection Strategies

### Strategy 1: Root-Level Collections with userId Filter
**Used for:** Top-level data that's queried frequently
**Example:** transactions, accounts
**Pro:** Easy to query across collections
**Con:** Requires userId filter on every query

### Strategy 2: User Subcollections
**Used for:** User-specific data
**Example:** accounts, transactions under users/{userId}
**Pro:** Better security, automatic isolation
**Con:** Nested queries more complex

## Performance Considerations

1. **Indexing**: Create composite indexes for filtered queries
   - users/{userId}/transactions (userId, type, date)
   - users/{userId}/accounts (userId, isActive)

2. **Pagination**: Implement cursor-based pagination for large datasets
   - Limit: 25-50 documents per page
   - Use `startAfter()` for next page

3. **Caching**: React Context provides local caching
   - TransactionContext caches all user transactions
   - Reduces repeated Firestore reads

## Cost Optimization

- Use soft deletes instead of hard deletes
- Batch writes when possible
- Implement read caching
- Use real-time listeners only when necessary

## Future Enhancements

1. **Offline Persistence**
   - Enable offline cache
   - Sync on reconnect

2. **Real-Time Collaboration**
   - Shared wallet features
   - Multi-user transactions

3. **Advanced Analytics**
   - Aggregated collections for reporting
   - Time-series data

4. **Archival**
   - Move old transactions to archive
   - Improve read performance

## Troubleshooting

### Issue: Permission Denied
**Cause:** User not authenticated or missing user document
**Solution:** Ensure user logged in, check Firestore rules

### Issue: Document Not Found
**Cause:** userId doesn't match authenticated user
**Solution:** Verify userId in request matches auth.uid

### Issue: Slow Queries
**Cause:** Missing indexes, large dataset
**Solution:** Create composite indexes, implement pagination

### Issue: Transactions Not Saving
**Cause:** Firestore errors, network issues
**Solution:** Check console errors, verify Firestore permissions
