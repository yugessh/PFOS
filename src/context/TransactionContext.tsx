"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
// When unauthenticated we no longer seed demo transactions — show realistic empty state
import type { Transaction } from '@/src/types/transaction';
import type { TransactionFormData, TransactionType } from '@/src/components/transactions/types';
import { computeAccountBalances as computeBalancesHelper, getMonthlyTotals } from '@/src/lib/finance';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { useAuthContext } from '@/src/context/AuthContext';
import { useAccountContext } from '@/src/context/AccountContext';
import { accountsService } from '@/src/services/firestore/accounts.service';
import { queueAdd, queueUpdate } from '@/src/services/offline/api';
import { COLLECTIONS, SUBCOLLECTIONS } from '@/src/constants/collections';
import { runRecurringAutomationForUser } from '@/src/services/recurring/automation';

interface TransactionContextValue {
  transactions: Transaction[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  addTransaction: (tx: TransactionFormData) => Promise<Transaction>;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  refresh: () => Promise<void>;
  getTotals: () => { income: number; expenses: number };
  computeAccountBalances: (baseAccounts?: any[]) => any[];
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext();
  const { refresh: refreshAccounts, accounts: accountList } = useAccountContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recurringAutomationRunForUid = useRef<string | null>(null);

  const transactionCacheKey = (userId: string) => `pfos_transactions_cache_${userId}`;

  const loadCachedTransactions = (userId: string) => {
    try {
      const raw = localStorage.getItem(transactionCacheKey(userId));
      if (!raw) return null;
      return JSON.parse(raw) as Transaction[];
    } catch {
      return null;
    }
  };

  const saveCachedTransactions = (userId: string, items: Transaction[]) => {
    try {
      localStorage.setItem(transactionCacheKey(userId), JSON.stringify(items));
    } catch {
      // ignore cache failures
    }
  };

  // Map Firestore transaction shape to local Transaction where possible
  function mapFirestoreToLocal(fx: any): Transaction {
    return {
      id: fx.id,
      description: fx.description || fx.desc || '',
      amount: fx.amount || 0,
      type: (fx.type === 'transfer' ? 'transfer' : (fx.type === 'income' ? 'income' : 'expense')) as TransactionType,
      category: fx.category || 'uncategorized',
      date: fx.date?.toDate?.() ? fx.date.toDate() : (fx.date ? new Date(fx.date) : new Date()),
      account: fx.accountId || fx.account || '',
      ...(fx.toAccount ? { toAccount: fx.toAccount } : {}),
    };
  }

  async function fetchTransactionsForUser(userId?: string) {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const offlineCached = typeof window !== 'undefined' && !navigator.onLine ? loadCachedTransactions(userId) : null;
    if (offlineCached) {
      setTransactions(offlineCached);
      setLoading(false);
      return;
    }

    try {
      const res = await transactionsService.getUserTransactions(userId, { orderBy: { field: 'date', direction: 'desc' }, limit: 200 });
      if (res.success && res.data) {
        const docs = res.data.data.map((d: any) => mapFirestoreToLocal(d));
        setTransactions(docs);
        saveCachedTransactions(userId, docs);
      } else {
        setError(res.error || 'Failed to load transactions');
        if (res.error) {
          const cached = loadCachedTransactions(userId);
          if (cached) {
            setTransactions(cached);
          }
        }
      }
    } catch (err: any) {
      const cached = loadCachedTransactions(userId);
      if (cached) {
        setTransactions(cached);
      }
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load transactions when auth changes; if no user, show empty state
    if (auth?.user?.uid) {
      void fetchTransactionsForUser(auth.user.uid);
    } else {
      setTransactions([]);
    }
  }, [auth?.user?.uid]);

  const refresh = useCallback(async () => {
    if (auth?.user?.uid) await fetchTransactionsForUser(auth.user.uid);
  }, [auth?.user?.uid]);

  useEffect(() => {
    const uid = auth?.user?.uid;
    if (!uid) {
      recurringAutomationRunForUid.current = null;
      return;
    }

    if (recurringAutomationRunForUid.current === uid) return;
    recurringAutomationRunForUid.current = uid;

    (async () => {
      try {
        const result = await runRecurringAutomationForUser(uid);
        if (result.generatedCount > 0) {
          await refresh();
          await refreshAccounts();
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Recurring automation failed:', err);
      }
    })();
  }, [auth?.user?.uid, refresh, refreshAccounts]);

  useEffect(() => {
    const uid = auth?.user?.uid;
    if (!uid) return;

    const handleRecurringUpdated = async () => {
      try {
        const result = await runRecurringAutomationForUser(uid);
        if (result.generatedCount > 0) {
          await refresh();
          await refreshAccounts();
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Recurring update automation failed:', err);
      }
    };

    window.addEventListener('pfos:recurring-updated', handleRecurringUpdated);
    return () => {
      window.removeEventListener('pfos:recurring-updated', handleRecurringUpdated);
    };
  }, [auth?.user?.uid, refresh, refreshAccounts]);

  const addTransaction = useCallback(async (form: TransactionFormData) => {
    if (!auth?.user?.uid) throw new Error('Please sign in to create transactions');
    if (!form.amount || form.amount <= 0) throw new Error('Enter a valid amount');
    if (!form.account) throw new Error('Select an account');
    if (form.type !== 'transfer' && !form.category) throw new Error('Select a category');
    if (form.type === 'transfer') {
      if (!form.toAccount) throw new Error('Select destination account for transfer');
      if (form.toAccount === form.account) throw new Error('Transfer accounts must be different');
    }

    const tempId = `temp_${Date.now()}`;
    const optimistic: Transaction = {
      id: tempId,
      description: form.notes || form.category || (form.type === 'income' ? 'Income' : 'Expense'),
      amount: form.amount,
      type: form.type as TransactionType,
      category: form.type === 'transfer' ? 'transfer' : form.category,
      date: form.date,
      account: form.account,
      ...(form.toAccount ? { toAccount: form.toAccount } : {}),
    };

    // Optimistic UI update
    setTransactions((s) => [optimistic, ...s]);
    setCreating(true);
    setError(null);

    try {
      const payload = {
        userId: auth.user.uid,
        accountId: form.account,
        ...(form.toAccount && { toAccount: form.toAccount }),
        amount: form.amount,
        type: form.type,
        category: form.type === 'transfer' ? 'transfer' : form.category,
        description: form.notes || form.category || (form.type === 'transfer' ? 'Transfer' : 'Transaction'),
        date: form.date,
      } as any;

      if (typeof window !== 'undefined' && !navigator.onLine) {
        const sourceAccount = accountList.find((acc) => acc.id === form.account);
        const destinationAccount = form.toAccount ? accountList.find((acc) => acc.id === form.toAccount) : undefined;

        queueAdd(COLLECTIONS.TRANSACTIONS, { ...payload, userId: auth.user.uid }, tempId);
        saveCachedTransactions(auth.user.uid, [optimistic, ...transactions]);

        if (form.type === 'income' || form.type === 'expense') {
          const currentBalance = sourceAccount?.currentBalance ?? sourceAccount?.balance ?? 0;
          const nextBalance = form.type === 'income'
            ? currentBalance + form.amount
            : currentBalance - form.amount;

          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(auth.user.uid), form.account, {
            currentBalance: nextBalance,
            balance: nextBalance,
            monthlyInflow: form.type === 'income' ? (sourceAccount?.monthlyInflow ?? 0) + form.amount : sourceAccount?.monthlyInflow,
            monthlyOutflow: form.type === 'expense' ? (sourceAccount?.monthlyOutflow ?? 0) + form.amount : sourceAccount?.monthlyOutflow,
            lastTransaction: form.notes || form.category || (form.type === 'income' ? 'Income' : 'Expense'),
            updatedAt: new Date().toISOString(),
          });
        } else if (form.type === 'transfer' && form.toAccount) {
          const sourceBalance = sourceAccount?.currentBalance ?? sourceAccount?.balance ?? 0;
          const destinationBalance = destinationAccount?.currentBalance ?? destinationAccount?.balance ?? 0;

          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(auth.user.uid), form.account, {
            currentBalance: sourceBalance - form.amount,
            balance: sourceBalance - form.amount,
            monthlyOutflow: (sourceAccount?.monthlyOutflow ?? 0) + form.amount,
            lastTransaction: form.notes || 'Transfer',
            updatedAt: new Date().toISOString(),
          });
          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(auth.user.uid), form.toAccount, {
            currentBalance: destinationBalance + form.amount,
            balance: destinationBalance + form.amount,
            monthlyInflow: (destinationAccount?.monthlyInflow ?? 0) + form.amount,
            lastTransaction: `Transfer from ${sourceAccount?.name || form.account}`,
            updatedAt: new Date().toISOString(),
          });
        }

        await refreshAccounts();
        return optimistic;
      }

      const res = await transactionsService.createTransaction(auth.user.uid, payload);
      if (res.success && res.data) {
        const created = mapFirestoreToLocal(res.data);
        // Replace temp with created
        setTransactions((s) => s.map((t) => (t.id === tempId ? created : t)));

        // Update account balances and monthly rollups in Firestore so the account dashboard stays in sync.
        if (form.type === 'income' || form.type === 'expense') {
          await accountsService.recordAccountMovement(auth.user.uid, form.account, {
            amount: form.amount,
            direction: form.type === 'income' ? 'inflow' : 'outflow',
            description: form.notes || form.category || (form.type === 'income' ? 'Income' : 'Expense'),
            date: form.date,
          });
        } else if (form.type === 'transfer' && form.toAccount) {
          await accountsService.transferBetweenAccounts(
            auth.user.uid,
            form.account,
            form.toAccount,
            form.amount,
            form.notes || 'Transfer',
            form.date
          );
        }

        await refreshAccounts();
        return created;
      }

      // rollback optimistic update
      setTransactions((s) => s.filter((t) => t.id !== tempId));
      throw new Error(res.error || 'Failed to create transaction');
    } catch (err: any) {
      const offlinePayload = {
        userId: auth.user.uid,
        accountId: form.account,
        ...(form.toAccount && { toAccount: form.toAccount }),
        amount: form.amount,
        type: form.type,
        category: form.type === 'transfer' ? 'transfer' : form.category,
        description: form.notes || form.category || (form.type === 'transfer' ? 'Transfer' : 'Transaction'),
        date: form.date,
      } as any;

      if (typeof window !== 'undefined' && !navigator.onLine) {
        queueAdd(COLLECTIONS.TRANSACTIONS, offlinePayload, tempId);
        saveCachedTransactions(auth.user.uid, [optimistic, ...transactions]);

        const sourceAccount = accountList.find((acc) => acc.id === form.account);
        const destinationAccount = form.toAccount ? accountList.find((acc) => acc.id === form.toAccount) : undefined;

        if (form.type === 'income' || form.type === 'expense') {
          const currentBalance = sourceAccount?.currentBalance ?? sourceAccount?.balance ?? 0;
          const nextBalance = form.type === 'income'
            ? currentBalance + form.amount
            : currentBalance - form.amount;

          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(auth.user.uid), form.account, {
            currentBalance: nextBalance,
            balance: nextBalance,
            monthlyInflow: form.type === 'income' ? (sourceAccount?.monthlyInflow ?? 0) + form.amount : sourceAccount?.monthlyInflow,
            monthlyOutflow: form.type === 'expense' ? (sourceAccount?.monthlyOutflow ?? 0) + form.amount : sourceAccount?.monthlyOutflow,
            lastTransaction: form.notes || form.category || (form.type === 'income' ? 'Income' : 'Expense'),
            updatedAt: new Date().toISOString(),
          });
        } else if (form.type === 'transfer' && form.toAccount) {
          const sourceBalance = sourceAccount?.currentBalance ?? sourceAccount?.balance ?? 0;
          const destinationBalance = destinationAccount?.currentBalance ?? destinationAccount?.balance ?? 0;

          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(auth.user.uid), form.account, {
            currentBalance: sourceBalance - form.amount,
            balance: sourceBalance - form.amount,
            monthlyOutflow: (sourceAccount?.monthlyOutflow ?? 0) + form.amount,
            lastTransaction: form.notes || 'Transfer',
            updatedAt: new Date().toISOString(),
          });
          queueUpdate(SUBCOLLECTIONS.USER_ACCOUNTS(auth.user.uid), form.toAccount, {
            currentBalance: destinationBalance + form.amount,
            balance: destinationBalance + form.amount,
            monthlyInflow: (destinationAccount?.monthlyInflow ?? 0) + form.amount,
            lastTransaction: `Transfer from ${sourceAccount?.name || form.account}`,
            updatedAt: new Date().toISOString(),
          });
        }
        await refreshAccounts();
        const created = optimistic;
        return created;
      }
      setTransactions((s) => s.filter((t) => t.id !== tempId));
      const message = err?.message || String(err);
      setError(message);
      throw new Error(message);
    } finally {
      setCreating(false);
    }
  }, [auth?.user?.uid, refreshAccounts]);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    // Optimistic update
    setTransactions((s) => {
      const next = s.map((t) => (t.id === id ? { ...t, ...patch } : t));
      if (typeof window !== 'undefined' && !navigator.onLine && auth?.user?.uid) {
        saveCachedTransactions(auth.user.uid, next);
      }
      return next;
    });

    // Persist in background or queue while offline
    (async () => {
      if (!auth?.user?.uid) return;
      const payload = {
        ...patch,
        accountId: (patch as any).account ?? undefined,
        date: (patch as any).date ?? undefined,
      } as any;

      if (typeof window !== 'undefined' && !navigator.onLine) {
        queueUpdate(COLLECTIONS.TRANSACTIONS, id, payload);
        return;
      }

      try {
        await transactionsService.update(id, payload);
      } catch (err: any) {
        setError(err?.message || String(err));
        // on failure, refresh from server to reconcile
        await refresh();
      }
    })();
  }, [auth?.user?.uid, refresh]);

  const removeTransaction = useCallback((id: string) => {
    // Optimistic remove
    const previous = transactions;
    setTransactions((s) => {
      const next = s.filter((t) => t.id !== id);
      if (typeof window !== 'undefined' && !navigator.onLine && auth?.user?.uid) {
        saveCachedTransactions(auth.user.uid, next);
      }
      return next;
    });

    (async () => {
      if (!auth?.user?.uid) return;

      if (typeof window !== 'undefined' && !navigator.onLine) {
        queueUpdate(COLLECTIONS.TRANSACTIONS, id, {
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return;
      }

      try {
        await transactionsService.softDelete(id);
      } catch (err: any) {
        setError(err?.message || String(err));
        // rollback
        setTransactions(previous);
      }
    })();
  }, [auth?.user?.uid, transactions]);

  const getTotals = useCallback(() => {
    const { income, expenses } = getMonthlyTotals(transactions);
    return { income, expenses };
  }, [transactions]);

  const computeAccountBalances = useCallback((baseAccounts: any[] = []) => {
    return computeBalancesHelper(baseAccounts as any, transactions as any) as any;
  }, [transactions]);

  const value = useMemo(() => ({ transactions, loading, creating, error, addTransaction, updateTransaction, removeTransaction, refresh, getTotals, computeAccountBalances }), [transactions, loading, creating, error, addTransaction, updateTransaction, removeTransaction, refresh, getTotals, computeAccountBalances]);

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactionContext() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactionContext must be used within TransactionProvider');
  return ctx;
}
