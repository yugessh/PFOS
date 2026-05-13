"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { transactions as MOCK_TRANSACTIONS } from '@/src/data/mock-transactions';
import type { Transaction } from '@/src/types/transaction';
import type { TransactionFormData, TransactionType } from '@/src/components/transactions/types';
import { accounts as BASE_ACCOUNTS } from '@/src/data/mock-dashboard';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { useAuthContext } from '@/src/context/AuthContext';

interface TransactionContextValue {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (tx: TransactionFormData) => Transaction;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  refresh: () => Promise<void>;
  getTotals: () => { income: number; expenses: number };
  computeAccountBalances: (baseAccounts?: typeof BASE_ACCOUNTS) => typeof BASE_ACCOUNTS;
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined);

function mapFormToTransaction(form: TransactionFormData): Transaction {
  return {
    id: `tx_${Date.now()}`,
    description: form.notes || form.category || (form.type === 'income' ? 'Income' : 'Expense'),
    amount: form.amount,
    type: form.type as TransactionType,
    category: form.category,
    date: form.date,
    account: form.account,
    toAccount: form.toAccount,
  } as Transaction;
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext();
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS.slice());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Map Firestore transaction shape to local Transaction where possible
  function mapFirestoreToLocal(fx: any): Transaction {
    return {
      id: fx.id,
      description: fx.description || fx.desc || '',
      amount: fx.amount || 0,
      type: (fx.type === 'income' ? 'income' : 'expense') as TransactionType,
      category: fx.category || 'uncategorized',
      date: fx.date ? new Date(fx.date) : new Date(),
      account: fx.accountId || fx.account || '',
    };
  }

  async function fetchTransactionsForUser(userId?: string) {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await transactionsService.getUserTransactions(userId, { orderBy: { field: 'date', direction: 'desc' }, limit: 200 });
      if (res.success && res.data) {
        const docs = res.data.data.map((d: any) => mapFirestoreToLocal(d));
        setTransactions(docs);
      } else {
        setError(res.error || 'Failed to load transactions');
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load transactions when auth changes; if no user, fall back to local mocks
    if (auth?.user?.uid) {
      void fetchTransactionsForUser(auth.user.uid);
    } else {
      setTransactions(MOCK_TRANSACTIONS.slice());
    }
  }, [auth?.user?.uid]);

  const refresh = useCallback(async () => {
    if (auth?.user?.uid) await fetchTransactionsForUser(auth.user.uid);
  }, [auth?.user?.uid]);

  const addTransaction = useCallback((form: TransactionFormData) => {
    const tempId = `temp_${Date.now()}`;
    const optimistic: Transaction = {
      id: tempId,
      description: form.notes || form.category || (form.type === 'income' ? 'Income' : 'Expense'),
      amount: form.amount,
      type: form.type as TransactionType,
      category: form.category,
      date: form.date,
      account: form.account,
    };

    // Optimistic UI update
    setTransactions((s) => [optimistic, ...s]);

    // Persist in background
    (async () => {
      if (!auth?.user?.uid) return; // skip persistence for unauthenticated
      try {
        const payload = {
          userId: auth.user.uid,
          accountId: form.account,
          amount: form.amount,
          type: form.type,
          category: form.category,
          description: form.notes || form.category,
          date: form.date,
        } as any;

        const res = await transactionsService.createTransaction(auth.user.uid, payload);
        if (res.success && res.data) {
          const created = mapFirestoreToLocal(res.data);
          // Replace temp with created
          setTransactions((s) => s.map((t) => (t.id === tempId ? created : t)));
        } else {
          // rollback optimistic update
          setTransactions((s) => s.filter((t) => t.id !== tempId));
          setError(res.error || 'Failed to create transaction');
        }
      } catch (err: any) {
        setTransactions((s) => s.filter((t) => t.id !== tempId));
        setError(err?.message || String(err));
      }
    })();

    return optimistic;
  }, [auth?.user?.uid]);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    // Optimistic update
    setTransactions((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    // Persist in background
    (async () => {
      if (!auth?.user?.uid) return;
      try {
        await transactionsService.update(id, {
          ...patch,
          accountId: (patch as any).account ?? undefined,
          date: (patch as any).date ?? undefined,
        } as any);
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
    setTransactions((s) => s.filter((t) => t.id !== id));

    (async () => {
      if (!auth?.user?.uid) return;
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
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses };
  }, [transactions]);

  const computeAccountBalances = useCallback((baseAccounts = BASE_ACCOUNTS) => {
    const balances: Record<string, number> = {};
    baseAccounts.forEach((a) => (balances[a.id] = a.balance));

    transactions.forEach((t) => {
      if (t.type === 'income') {
        balances[t.account] = (balances[t.account] ?? 0) + t.amount;
      } else if (t.type === 'expense') {
        balances[t.account] = (balances[t.account] ?? 0) - t.amount;
      }
    });

    return baseAccounts.map((a) => ({ ...a, balance: balances[a.id] ?? a.balance }));
  }, [transactions]);

  const value = useMemo(() => ({ transactions, loading, error, addTransaction, updateTransaction, removeTransaction, refresh, getTotals, computeAccountBalances }), [transactions, loading, error, addTransaction, updateTransaction, removeTransaction, refresh, getTotals, computeAccountBalances]);

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactionContext() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactionContext must be used within TransactionProvider');
  return ctx;
}
