'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import type { TransactionFormData } from '@/src/components/transactions/types';
import { groupTransactionsByDate } from '@/src/lib/finance';

export default function TransactionsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { transactions, getTotals, loading, creating, error, addTransaction } = useTransactions();
  const { accounts } = useAccounts();

  const accountNameById = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((account) => map.set(account.id, account.name));
    return map;
  }, [accounts]);

  const grouped = useMemo(() => groupTransactionsByDate(transactions), [transactions]);
  const sortedDates = useMemo(() => Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1)), [grouped]);
  const { income, expenses } = getTotals();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Transactions</p>
            <h1 className="text-3xl font-bold">This Month</h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-2 shadow-md"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-xs">Income</p>
            <p className="text-lg font-semibold">{formatCurrencyCompact(income)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-xs">Expenses</p>
            <p className="text-lg font-semibold">{formatCurrencyCompact(expenses)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {loading || creating ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">{creating ? 'Saving transaction...' : 'Loading transactions...'}</p>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">No transactions yet</p>
            <Button className="mt-3" onClick={() => setAddOpen(true)}>Add your first transaction</Button>
          </div>
        ) : (
          sortedDates.map((dateKey) => (
            <div key={dateKey} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
                {new Date(dateKey).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="space-y-2">
                {grouped[dateKey].map((tx) => {
                  const accountName = accountNameById.get(tx.account) || 'Unknown account';
                  const amountClass = tx.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : tx.type === 'transfer'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400';
                  const prefix = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-';

                  return (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tx.description || tx.category}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {tx.type} • {tx.category} • {accountName}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold ${amountClass} whitespace-nowrap`}>
                        {prefix}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <AddTransactionModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={async (tx: TransactionFormData) => {
          await addTransaction(tx);
        }}
      />
    </div>
  );
}
