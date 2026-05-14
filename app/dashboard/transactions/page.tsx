'use client';

import { useMemo, useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import type { TransactionFormData } from '@/src/components/transactions/types';
import { groupTransactionsByDate } from '@/src/lib/finance';
import { getMonthKey } from '@/src/lib/budgets';

const CATEGORY_ICON_MAP: Record<string, string> = {
  food: '🍽️',
  groceries: '🛒',
  transportation: '🛵',
  transport: '🛵',
  shopping: '🛍️',
  entertainment: '🎬',
  bills: '💡',
  utilities: '💡',
  health: '🏥',
  healthcare: '🏥',
  salary: '💰',
  freelance: '💼',
  investments: '📈',
  transfer: '↔️',
};

function categoryIcon(category: string) {
  const key = `${category || ''}`.toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] || '📦';
}

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
  const monthlyKey = getMonthKey();

  const dailySummaries = useMemo(() => {
    return sortedDates.reduce<Record<string, { income: number; expenses: number }>>((acc, dateKey) => {
      const total = grouped[dateKey].reduce(
        (sum, tx) => {
          if (tx.type === 'income') sum.income += tx.amount || 0;
          if (tx.type === 'expense') sum.expenses += tx.amount || 0;
          return sum;
        },
        { income: 0, expenses: 0 }
      );
      acc[dateKey] = total;
      return acc;
    }, {});
  }, [grouped, sortedDates]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-blue-100 text-xs mb-1">Transaction Feed</p>
            <h1 className="text-2xl font-bold">{monthlyKey}</h1>
          </div>
          <p className="text-xs text-blue-100 rounded-full bg-white/10 px-2 py-1">{transactions.length} entries</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-[11px]">Income</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(income)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-[11px]">Expense</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(expenses)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-[11px]">Net</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(income - expenses)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
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
          sortedDates.map((dateKey) => {
            const summary = dailySummaries[dateKey] || { income: 0, expenses: 0 };
            return (
              <section key={dateKey} className="space-y-2">
                <header className="sticky top-16 z-10 flex items-center justify-between rounded-xl bg-gray-100/95 px-3 py-2 backdrop-blur dark:bg-gray-800/95">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {new Date(dateKey).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-green-600 dark:text-green-400">+{formatCurrencyCompact(summary.income)}</span>
                    <span className="text-red-600 dark:text-red-400">-{formatCurrencyCompact(summary.expenses)}</span>
                  </div>
                </header>

                <div className="space-y-2">
                  {grouped[dateKey].map((tx) => {
                    const accountName = accountNameById.get(tx.account) || 'Unknown account';
                    const amountClass =
                      tx.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : tx.type === 'transfer'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400';
                    const prefix = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-';

                    return (
                      <article
                        key={tx.id}
                        className="rounded-2xl border border-gray-100 bg-white px-3 py-3 shadow-sm transition-transform duration-150 active:scale-[0.99] dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex items-center gap-2">
                            <div className="size-9 shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-base">
                              {tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '↔️' : categoryIcon(tx.category)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {tx.description || tx.category || 'Transaction'}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {tx.category || tx.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${amountClass} whitespace-nowrap`}>
                              {prefix}{formatCurrency(tx.amount)}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{tx.type}</p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                            {accountName}
                          </span>
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="size-3 text-green-500" />
                          ) : tx.type === 'transfer' ? (
                            <ArrowLeftRight className="size-3 text-amber-500" />
                          ) : (
                            <ArrowUpRight className="size-3 text-red-500" />
                          )}
                          {tx.description && tx.description !== tx.category ? (
                            <span className="truncate">{tx.description}</span>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })
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

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Add transaction"
        className="lg:hidden fixed bottom-20 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="size-6" />
      </button>
    </div>
  );
}
