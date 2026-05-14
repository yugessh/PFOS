'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, BellRing, Clock3, Plus, Repeat2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useRecurringTransactions } from '@/src/hooks/useRecurringTransactions';
import { RecurringTransactionModal } from './RecurringTransactionModal';

const FREQUENCY_LABEL: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export function RecurringTransactionsPage() {
  const [open, setOpen] = useState(false);
  const { accounts } = useAccounts();
  const {
    recurringTransactions,
    recurringAlerts,
    loading,
    saving,
    error,
    saveRecurring,
    removeRecurring,
  } = useRecurringTransactions();

  const accountMap = useMemo(() => new Map(accounts.map((item) => [item.id, item.name])), [accounts]);

  const totals = useMemo(() => {
    return recurringTransactions.reduce(
      (sum, item) => {
        if (!item.isActive) return sum;
        if (item.type === 'income') sum.income += item.amount;
        else if (item.type === 'expense') sum.expenses += item.amount;
        return sum;
      },
      { income: 0, expenses: 0 }
    );
  }, [recurringTransactions]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-indigo-100 text-xs mb-1">Recurring Finance</p>
            <h1 className="text-2xl font-bold">Automation</h1>
          </div>
          <Button size="sm" className="bg-white text-indigo-700 hover:bg-indigo-50" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-indigo-100">Templates</p>
            <p className="text-sm font-semibold">{recurringTransactions.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-indigo-100">Income</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(totals.income)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-indigo-100">Expense</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(totals.expenses)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="size-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Alerts</h2>
          </div>
          {recurringAlerts.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No payments due in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {recurringAlerts.slice(0, 4).map((alert) => (
                <div key={`${alert.recurringId}-${alert.dueDate.toISOString()}`} className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{alert.title}</p>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(alert.amount)}</p>
                  </div>
                  <p className={`text-[11px] mt-1 ${alert.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {alert.isOverdue ? `${Math.abs(alert.daysUntilDue)} days overdue` : alert.daysUntilDue === 0 ? 'Due today' : `Due in ${alert.daysUntilDue} days`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Loading recurring templates...
          </div>
        ) : recurringTransactions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">No recurring templates yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set salary, rent, subscriptions, utilities, and EMI once.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>Create Recurring</Button>
          </div>
        ) : (
          recurringTransactions.map((item) => {
            const isOverdue = new Date(item.nextRunDate) < new Date();

            return (
              <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                      {item.type} • {item.category} • {FREQUENCY_LABEL[item.frequency]}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                      From {accountMap.get(item.accountId) || 'Account'}{item.type === 'transfer' ? ` → ${accountMap.get(item.toAccountId ?? '') || 'Destination'}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRecurring(item.id)}
                    className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="size-4 text-gray-500" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                    <p className="text-gray-500 dark:text-gray-400">Next</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(item.nextRunDate).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                    <p className="text-gray-500 dark:text-gray-400">Interval</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Every {item.interval}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    <Repeat2 className="size-3" />
                    {FREQUENCY_LABEL[item.frequency]}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    <Clock3 className="size-3" />
                    Reminder {item.reminderDaysBefore}d
                  </span>
                  {isOverdue ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      <AlertTriangle className="size-3" />
                      Overdue
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })
        )}

        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <RecurringTransactionModal
        open={open}
        onOpenChange={setOpen}
        saving={saving}
        onSave={async (payload) => {
          await saveRecurring(payload);
        }}
      />
    </div>
  );
}
