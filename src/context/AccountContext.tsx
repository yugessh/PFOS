"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Account } from '@/src/services/firestore/accounts.service';
import { accountsService } from '@/src/services/firestore/accounts.service';
import { usersService } from '@/src/services/firestore/users.service';
import { useAuthContext } from '@/src/context/AuthContext';
import { queueAdd, queueUpdate } from '@/src/services/offline/api';
import { SUBCOLLECTIONS } from '@/src/constants/collections';

interface AccountContextValue {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  addAccount: (accountData: Partial<Account>) => Promise<Account>;
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  getTotalBalance: () => number;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountCacheKey = (userId: string) => `pfos_accounts_cache_${userId}`;

  const loadCachedAccounts = (userId: string) => {
    try {
      const raw = localStorage.getItem(accountCacheKey(userId));
      if (!raw) return null;
      return JSON.parse(raw) as Account[];
    } catch {
      return null;
    }
  };

  const saveCachedAccounts = (userId: string, items: Account[]) => {
    try {
      localStorage.setItem(accountCacheKey(userId), JSON.stringify(items));
    } catch {
      // ignore cache persistence failures
    }
  };

  // Fetch accounts from Firestore for current user
  const fetchAccountsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    const offlineCached = typeof window !== 'undefined' && !navigator.onLine ? loadCachedAccounts(userId) : null;
    if (offlineCached) {
      setAccounts(offlineCached.filter((acc) => !acc.deletedAt));
      setLoading(false);
      return;
    }

    try {
      const response = await accountsService.getUserAccounts(userId);
      // If permission error occurs, attempt to create a minimal user profile and retry once
      if (!response.success && response.error && response.error.toLowerCase().includes('permission')) {
        try {
          await usersService.initializeUserProfile(userId, { email: '' });
          // retry
          const retry = await accountsService.getUserAccounts(userId);
          const retryFetchedAccounts = Array.isArray(retry.data)
            ? retry.data
            : Array.isArray(retry.data?.data)
            ? retry.data.data
            : [];
          if (retry.success) {
            const activeAccounts = (retryFetchedAccounts as Account[]).filter((acc) => !acc.deletedAt);
            setAccounts(activeAccounts);
            saveCachedAccounts(userId, activeAccounts);
            return;
          }
        } catch (initErr) {
          // ignore and fallthrough to error handling below
          // eslint-disable-next-line no-console
          console.warn('Failed to initialize user before fetching accounts:', initErr);
        }
      }
      if (response.success) {
        const fetchedAccounts = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const activeAccounts = (fetchedAccounts as Account[]).filter(
          (acc) => !acc.deletedAt
        );
        setAccounts(activeAccounts);
        saveCachedAccounts(userId, activeAccounts);
      } else {
        setAccounts([]);
        if (response.error) {
          setError(response.error);
          const cached = loadCachedAccounts(userId);
          if (cached) {
            setAccounts(cached.filter((acc) => !acc.deletedAt));
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
      const cached = loadCachedAccounts(userId);
      if (cached) {
        setAccounts(cached.filter((acc) => !acc.deletedAt));
      }
      setError(err.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch accounts when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchAccountsForUser(user.uid);
    } else {
      setAccounts([]);
      setError(null);
    }
  }, [user?.uid, fetchAccountsForUser]);

  // Add new account
  const addAccount = useCallback(
    async (accountData: Partial<Account>): Promise<Account> => {
      if (!user?.uid) throw new Error('User not authenticated');

      setLoading(true);
      setError(null);
      const tempId = `temp_${Date.now()}`;
      const optimisticAccount: Account = {
        id: tempId,
        userId: user.uid,
        name: accountData.name || accountData.accountName || 'New Account',
        accountType: accountData.accountType as any || accountData.type as any || 'checking',
        currentBalance: Number(accountData.currentBalance ?? accountData.balance ?? 0),
        currency: accountData.currency || 'INR',
        color: accountData.color || '#7EE7C7',
        icon: accountData.icon || 'bank',
        monthlyInflow: Number(accountData.monthlyInflow ?? 0),
        monthlyOutflow: Number(accountData.monthlyOutflow ?? 0),
        lastTransaction: accountData.lastTransaction || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Account;

      if (typeof window !== 'undefined' && !navigator.onLine) {
        queueAdd(SUBCOLLECTIONS.USER_ACCOUNTS(user.uid), { ...accountData, userId: user.uid, isActive: true }, tempId);
        setAccounts((prev) => {
          const next = [...prev, optimisticAccount];
          saveCachedAccounts(user.uid, next);
          return next;
        });
        setLoading(false);
        return optimisticAccount;
      }

      try {
        // Debug: log current user id when creating account
        try {
          // eslint-disable-next-line no-console
          console.debug('AccountContext.addAccount user.uid=', user?.uid);
        } catch (_) {}
        const response = await accountsService.createAccount(user.uid, {
          ...accountData,
          isActive: true,
        });

        if (response.success && response.data) {
          // Optimistic update
          setAccounts((prev) => [...prev, response.data]);
          return response.data;
        } else {
          const friendly = response.error || 'Failed to create account';
          setError(friendly);
          throw new Error(friendly);
        }
      } catch (err: any) {
        // Map permission errors to friendlier message if missing
        const message = err?.message || String(err);
        if (message.includes('Permission denied') || message.includes('permission')) {
          setError('You do not have permission to create accounts. Please try signing out and back in.');
          throw new Error('Permission denied');
        }
        setError(message);
        console.error('Failed to add account:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid]
  );

  // Update account
  const updateAccount = useCallback(
    async (id: string, patch: Partial<Account>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        // Optimistic update
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === id ? { ...acc, ...patch } : acc))
        );

        if (typeof window !== 'undefined' && !navigator.onLine) {
          setAccounts((prev) => {
            const next = prev.map((acc) => (acc.id === id ? { ...acc, ...patch } : acc));
            saveCachedAccounts(user.uid, next);
            return next;
          });
          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(user.uid), id, patch);
          return;
        }

        const response = await accountsService.updateAccount(user.uid, id, patch);
        if (!response.success) {
          // Rollback on error
          await fetchAccountsForUser(user.uid);
          throw new Error(response.error || 'Failed to update account');
        }
      } catch (err: any) {
        console.error('Failed to update account:', err);
        // Rollback
        await fetchAccountsForUser(user.uid);
        throw err;
      }
    },
    [user?.uid, fetchAccountsForUser]
  );

  // Remove account (soft delete)
  const removeAccount = useCallback(
    async (id: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        // Optimistic update
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));

        if (typeof window !== 'undefined' && !navigator.onLine) {
          setAccounts((prev) => {
            const next = prev.filter((acc) => acc.id !== id);
            saveCachedAccounts(user.uid, next);
            return next;
          });
          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(user.uid), id, {
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return;
        }

        const response = await accountsService.softDeleteAccount(user.uid, id);
        if (!response.success) {
          // Rollback on error
          await fetchAccountsForUser(user.uid);
          throw new Error(response.error || 'Failed to delete account');
        }
      } catch (err: any) {
        console.error('Failed to remove account:', err);
        // Rollback
        await fetchAccountsForUser(user.uid);
        throw err;
      }
    },
    [user?.uid, fetchAccountsForUser]
  );

  // Refresh accounts from Firestore
  const refresh = useCallback(async () => {
    if (user?.uid) {
      await fetchAccountsForUser(user.uid);
    }
  }, [user?.uid, fetchAccountsForUser]);

  // Calculate total balance across all accounts
  const getTotalBalance = useCallback(() => {
    return accounts.reduce((sum, acc) => sum + Number(acc.currentBalance ?? acc.balance ?? 0), 0);
  }, [accounts]);

  const value = useMemo(
    () => ({
      accounts,
      loading,
      error,
      addAccount,
      updateAccount,
      removeAccount,
      refresh,
      getTotalBalance,
    }),
    [accounts, loading, error, addAccount, updateAccount, removeAccount, refresh, getTotalBalance]
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccountContext() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccountContext must be used within AccountProvider');
  return ctx;
}
