"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { transactions as MOCK_TRANSACTIONS } from '@/src/data/mock-transactions';
import type { Transaction } from '@/src/types/transaction';
import type { TransactionFormData, TransactionType } from '@/src/components/transactions/types';
import { accounts as BASE_ACCOUNTS } from '@/src/data/mock-dashboard';

interface TransactionContextValue {
  transactions: Transaction[];
  addTransaction: (tx: TransactionFormData) => Transaction;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
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
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS.slice());

  const addTransaction = useCallback((form: TransactionFormData) => {
    const tx = mapFormToTransaction(form);
    setTransactions((s) => [tx, ...s]);
    return tx;
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setTransactions((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions((s) => s.filter((t) => t.id !== id));
  }, []);

  const getTotals = useCallback(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expenses };
  }, [transactions]);

  const computeAccountBalances = useCallback((baseAccounts = BASE_ACCOUNTS) => {
    // Return a new accounts array with balances adjusted by transactions
    const balances: Record<string, number> = {};
    baseAccounts.forEach((a) => (balances[a.id] = a.balance));

    transactions.forEach((t) => {
      if (t.type === 'income') {
        balances[t.account] = (balances[t.account] ?? 0) + t.amount;
      } else if (t.type === 'expense') {
        balances[t.account] = (balances[t.account] ?? 0) - t.amount;
      } else if (t.type === 'transfer') {
        if (t.account) balances[t.account] = (balances[t.account] ?? 0) - t.amount;
        if ((t as any).toAccount) balances[(t as any).toAccount] = (balances[(t as any).toAccount] ?? 0) + t.amount;
      }
    });

    return baseAccounts.map((a) => ({ ...a, balance: balances[a.id] ?? a.balance }));
  }, [transactions]);

  const value = useMemo(() => ({ transactions, addTransaction, updateTransaction, removeTransaction, getTotals, computeAccountBalances }), [transactions, addTransaction, updateTransaction, removeTransaction, getTotals, computeAccountBalances]);

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactionContext() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactionContext must be used within TransactionProvider');
  return ctx;
}
