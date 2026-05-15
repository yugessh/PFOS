'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useAuthContext } from '@/src/context/AuthContext';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { groupTransactionsByDate, getMonthRange, getMonthLabel, computeTotals } from '@/src/lib/finance';
import { formatCurrency } from '@/src/lib/currency';
import { formatDate } from '@/lib/date';
import { CompactSummaryHeader } from '@/src/components/mobile/CompactSummaryHeader';
import { CompactTransactionFeed } from '@/src/components/mobile/CompactTransactionFeed';
import { FilterBottomSheet } from '@/src/components/mobile/FilterBottomSheet';
import { CompactFAB } from '@/src/components/mobile/CompactFAB';
import type { TransactionFormData } from '@/src/components/transactions/types';
import type { Transaction } from '@/src/types/transaction';

function parseTransaction(raw: any): Transaction {
  return {
    id: raw.id,
    description: raw.description || raw.notes || raw.category || 'Transaction',
    amount: Number(raw.amount || 0),
    type: raw.type === 'income' ? 'income' : raw.type === 'transfer' ? 'transfer' : 'expense',
    category: raw.category || 'Other',
    date: raw.date?.toDate?.() || new Date(raw.date || Date.now()),
    account: raw.accountId || raw.account || '',
    ...(raw.toAccount ? { toAccount: raw.toAccount } : {}),
  };
}

export default function MobileTransactionsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() => new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const auth = useAuthContext();
  const { addTransaction } = useTransactions();
  const { accounts, addAccount } = useAccounts();
  const [addAccountOpen, setAddAccountOpen] = useState(false);

  const activeRange = useMemo(() => {
    return getMonthRange(displayMonth.getFullYear(), displayMonth.getMonth() + 1);
  }, [displayMonth]);

  const loadTransactions = useCallback(async () => {
    const userId = auth?.user?.uid;
    if (!userId) {
      setTransactions([]);
      return;
    }

    setFilterLoading(true);
    setFilterError(null);

    try {
      const response = await transactionsService.getUserTransactionsByRange(
        userId,
        activeRange.start,
        activeRange.end,
        {
          accountId: accountFilter === 'all' ? undefined : accountFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
        },
        { orderBy: { field: 'date', direction: 'desc' }, limit: 500 }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load transactions');
      }

      setTransactions(response.data.data.map(parseTransaction));
    } catch (error: any) {
      setFilterError(error?.message || String(error));
      setTransactions([]);
    } finally {
      setFilterLoading(false);
    }
  }, [auth?.user?.uid, activeRange, accountFilter, categoryFilter]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const monthLabel = useMemo(() => getMonthLabel(displayMonth), [displayMonth]);
  const grouped = useMemo(() => groupTransactionsByDate(transactions), [transactions]);
  const sortedDates = useMemo(() => Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1)), [grouped]);
  const { income, expenses } = useMemo(() => computeTotals(transactions), [transactions]);

  const categories = useMemo(
    () => Array.from(new Set(transactions.map((tx) => tx.category))).sort(),
    [transactions]
  );

  const totalBalance = useMemo(
    () => accounts.reduce((s, a) => s + (a.balance || 0), 0),
    [accounts]
  );

  const onSaveTransaction = useCallback(
    async (tx: TransactionFormData) => {
      await addTransaction(tx);
      await loadTransactions();
    },
    [addTransaction, loadTransactions]
  );

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Compact Summary Header */}
      <CompactSummaryHeader
        month={displayMonth}
        balance={totalBalance}
        income={income}
        expenses={expenses}
        onPreviousMonth={() => setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
        onNextMonth={() => setDisplayMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
      />

      {/* Filters Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-background border-b border-border flex items-center justify-between px-4 py-2 h-12">
        <span className="text-xs font-medium text-muted-foreground">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setFilterOpen(true)}
          className="p-1.5 hover:bg-muted rounded-md transition-colors"
          aria-label="Open filters"
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Transaction Feed */}
      <div className="lg:max-w-2xl">
        {filterLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Loading transactions...
          </div>
        ) : filterError ? (
          <div className="text-center py-8 text-sm text-destructive">
            {filterError}
          </div>
        ) : (
          <CompactTransactionFeed
            transactions={transactions}
            grouped={grouped}
            sortedDates={sortedDates}
          />
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onReset={() => {
          setCategoryFilter('all');
          setAccountFilter('all');
        }}
        onApply={() => {
          // Filters are applied automatically via useEffect
        }}
      >
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="text-sm font-medium block mb-2">Account</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            >
              <option value="all">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterBottomSheet>

      {/* Modals */}
      <AddTransactionModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={onSaveTransaction}
      />

      {/* FAB */}
      <CompactFAB
        onAddExpense={() => setAddOpen(true)}
        onAddIncome={() => setAddOpen(true)}
        onTransfer={() => setAddOpen(true)}
        onManageAccounts={() => setAddAccountOpen(true)}
      />
    </div>
  );
}
