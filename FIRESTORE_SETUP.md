# PFOS Firestore Setup Guide

## Quick Start

This guide will help you deploy the Firestore rules and verify the complete setup.

## Prerequisites

- Firebase project already created (smart-money-tracker-3e34c)
- Firebase CLI installed (`npm install -g firebase-tools`)
- `.env.local` with Firebase config populated
- Node.js 18+ and pnpm

## Step 1: Deploy Firestore Security Rules

### Option A: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `smart-money-tracker-3e34c`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the content from `firestore.rules` in your project
5. Paste into the rules editor
6. Click **Publish**

### Option B: Firebase CLI

```bash
# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Verify deployment
firebase rules:test src/firestore.rules
```

## Step 2: Verify Firestore Initialization

### Collections Expected

After first user signup, you should see these collections in Firebase Console:

```
Firestore Database
  └─ users
      └─ {userId}
          ├─ accounts/
          ├─ transactions/
          ├─ categories/
          ├─ investments/
          ├─ goals/
          ├─ emi/
          ├─ reminders/
          ├─ settlements/
          └─ policies/
```

## Step 3: Local Testing

### Start Development Server

```bash
cd e:\project\PFOS
pnpm dev
```

App should be available at `http://localhost:3000`

### Test Registration Flow

1. **Visit** `http://localhost:3000/auth/register`
2. **Enter** test email: `test@example.com`
3. **Enter** password: `Test123!`
4. **Click** "Create Account"
5. **Expected:**
   - Redirects to `/dashboard`
   - Shows empty finance state
   - No errors in console

### Verify User Document Created

1. **Open** [Firebase Console](https://console.firebase.google.com/)
2. **Navigate** to Firestore Database
3. **Look for** `users` collection
4. **Click** on user document (should match login email)
5. **Verify** fields:
   - `uid`: Matches Firebase Auth UID
   - `email`: `test@example.com`
   - `onboardingCompleted`: `false`
   - `preferences`: { currency: 'INR', ... }

### Verify Default Collections Created

1. **Expand** user document in Firestore Console
2. **Check** these subcollections exist:
   - `accounts/` - Should have 1 default account
   - `categories/` - Should have ~10 default categories
   - `transactions/` - Should be empty
   - Other subcollections - Should be empty

### Test Transaction Creation

1. **On Dashboard**, click **"Add First Transaction"**
2. **Fill Form:**
   - Category: "Salary" (income)
   - Amount: ₹50000
   - Notes: "Monthly salary"
   - Click **Save**
3. **Expected:**
   - Transaction appears immediately
   - Balance updates to ₹50,000
   - Dashboard shows transaction in list

### Verify Transaction in Firestore

1. **Open** Firebase Console
2. **Navigate** to `users/{userId}/transactions/`
3. **Verify** transaction document exists with:
   - `amount`: 50000
   - `type`: "income"
   - `description`: "Salary"
   - `createdAt`: Recent timestamp

### Test Persistence

1. **Refresh** browser (`F5`)
2. **Expected:**
   - Dashboard reloads with transaction still visible
   - Balance remains ₹50,000
   - No loading errors

### Test Google Sign-In

1. **Logout** (click sign out button)
2. **Navigate** to `/auth/login`
3. **Click** "Sign in with Google"
4. **Login** with your Google account
5. **Expected:**
   - Redirects to `/dashboard`
   - New user document created in Firestore
   - Dashboard shows empty state or previous data if same account

## Step 4: Deployment Checklist

### Before Production Deployment

- [ ] Firestore rules deployed
- [ ] Test account created and working
- [ ] Transaction save working
- [ ] Persistence working after page refresh
- [ ] Multiple users can register independently
- [ ] Each user sees only their own data
- [ ] Error handling works (try duplicate email, invalid password)
- [ ] Google sign-in working

### Deployment Steps

```bash
# Build for production
pnpm build

# Verify no errors
pnpm lint

# Deploy to Firebase Hosting
firebase deploy

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## Troubleshooting

### Issue: "Permission denied" error

**Cause:** Firestore rules not deployed or not matching

**Solution:**
```bash
# Check current rules
firebase rules:list firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Issue: User document not created

**Cause:** `ensureUserProfile` not called or Firestore error

**Solution:**
1. Check browser console for errors
2. Check Firebase Console for error logs
3. Verify `.env.local` has all Firebase config
4. Try signup again

### Issue: Transaction not saving

**Cause:** Firestore write failed, network issue, or missing userId

**Solution:**
1. Check browser console for specific error
2. Verify user is authenticated (check auth state)
3. Check Firestore rules allow write
4. Try refreshing and signing in again

### Issue: Transaction appears but then disappears

**Cause:** Firestore write failed after optimistic update

**Solution:**
1. Check browser console for error
2. Verify Firestore permissions
3. Check network tab for failed requests
4. Try again after fixing error

### Issue: Can't deploy rules

**Cause:** Firebase CLI not logged in or wrong project

**Solution:**
```bash
# Verify logged in
firebase auth:list

# Set correct project
firebase use smart-money-tracker-3e34c

# Try deploy again
firebase deploy --only firestore:rules
```

## Collection Paths Reference

### User Document
```
users/{userId}
```

### User Subcollections
```
users/{userId}/accounts/{accountId}
users/{userId}/transactions/{transactionId}
users/{userId}/categories/{categoryId}
users/{userId}/investments/{investmentId}
users/{userId}/goals/{goalId}
users/{userId}/emi/{emiId}
users/{userId}/reminders/{reminderId}
users/{userId}/settlements/{settlementId}
users/{userId}/policies/{policyId}
```

## Next Steps

1. **Offline Persistence** (Optional)
   - Enable Firestore offline cache
   - Works on mobile even without internet

2. **Advanced Queries**
   - Filter transactions by date range
   - Aggregate income/expenses by category
   - Implement reporting

3. **Backup & Recovery**
   - Setup scheduled Firestore exports
   - Test restore procedures

4. **Performance Monitoring**
   - Monitor Firestore read/write costs
   - Optimize queries if needed
   - Implement caching strategies

## Support

For issues or questions:
1. Check Firestore documentation: https://firebase.google.com/docs/firestore
2. Check Firebase CLI docs: https://firebase.google.com/docs/cli
3. Review console errors carefully
4. Check Firestore rules syntax

## References

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
