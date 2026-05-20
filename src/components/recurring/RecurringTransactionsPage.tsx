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

  const activeTemplates = useMemo(
    () => recurringTransactions.filter((item) => item.isActive).length,
    [recurringTransactions]
  );

  const nextDueDate = useMemo(
    () => recurringAlerts[0]?.dueDate ?? null,
    [recurringAlerts]
  );

  const overdueCount = useMemo(
    () => recurringAlerts.filter((alert) => alert.isOverdue).length,
    [recurringAlerts]
  );

  return (
    <div className="min-h-screen bg-main pb-24 animate-in fade-in duration-300">
      <div className="bg-[linear-gradient(180deg,rgba(21,26,32,0.98),rgba(8,10,15,0.96))] text-white px-4 pt-6 pb-7 rounded-b-[34px] border-b border-border shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-secondary text-xs mb-1">Recurring Finance</p>
            <h1 className="text-2xl font-bold">Automation</h1>
          </div>
          <Button size="sm" className="button-primary" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-[24px] border border-white/6 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-secondary">Templates</p>
            <p className="text-sm font-semibold">{recurringTransactions.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/6 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-secondary">Active</p>
            <p className="text-sm font-semibold">{activeTemplates}</p>
          </div>
          <div className="rounded-[24px] border border-white/6 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-secondary">Next payment</p>
            <p className="text-sm font-semibold">{nextDueDate ? nextDueDate.toLocaleDateString() : 'None'}</p>
          </div>
          <div className="rounded-[24px] border border-white/6 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-secondary">Overdue</p>
            <p className="text-sm font-semibold">{overdueCount}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        <section className="card-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="size-4 text-accent-mint" />
            <h2 className="text-sm font-semibold text-white">Upcoming Alerts</h2>
          </div>
          {recurringAlerts.length === 0 ? (
            <p className="text-xs text-secondary">No upcoming recurring payments right now.</p>
          ) : (
            <div className="space-y-2">
              {recurringAlerts.slice(0, 4).map((alert) => (
                <div key={`${alert.recurringId}-${alert.dueDate.toISOString()}`} className="rounded-[20px] bg-white/5 p-2.5 border border-border/70">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-white truncate">{alert.title}</p>
                    <p className="text-xs font-semibold text-secondary">{formatCurrency(alert.amount)}</p>
                  </div>
                  <p className={`text-[11px] mt-1 ${alert.isOverdue ? 'text-red-300' : 'text-accent-mint'}`}>
                    {alert.isOverdue ? `${Math.abs(alert.daysUntilDue)} days overdue` : alert.daysUntilDue === 0 ? 'Due today' : `Due in ${alert.daysUntilDue} days`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <div className="card-surface p-6 text-center text-sm text-secondary">
            Loading recurring templates...
          </div>
        ) : recurringTransactions.length === 0 ? (
          <div className="card-surface p-6 text-center">
            <p className="text-sm font-medium text-white">No recurring templates yet</p>
            <p className="text-xs text-secondary mt-1">Set salary, rent, subscriptions, utilities, and EMI once.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>Create Recurring</Button>
          </div>
        ) : (
          recurringTransactions.map((item) => {
            const isOverdue = new Date(item.nextRunDate) < new Date();

            return (
              <article key={item.id} className="card-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-secondary mt-0.5 capitalize">
                      {item.type} • {item.category} • {FREQUENCY_LABEL[item.frequency]}
                    </p>
                    <p className="text-[11px] text-secondary mt-1 truncate">
                      From {accountMap.get(item.accountId) || 'Account'}{item.type === 'transfer' ? ` → ${accountMap.get(item.toAccountId ?? '') || 'Destination'}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRecurring(item.id)}
                    className="rounded-full p-1.5 hover:bg-white/5"
                  >
                    <Trash2 className="size-4 text-secondary" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="rounded-[20px] bg-white/5 p-2 border border-border/70">
                    <p className="text-secondary">Amount</p>
                    <p className="text-xs font-semibold text-white">{formatCurrency(item.amount)}</p>
                  </div>
                  <div className="rounded-[20px] bg-white/5 p-2 border border-border/70">
                    <p className="text-secondary">Next</p>
                    <p className="text-xs font-semibold text-white">{new Date(item.nextRunDate).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-[20px] bg-white/5 p-2 border border-border/70">
                    <p className="text-secondary">Interval</p>
                    <p className="text-xs font-semibold text-white">Every {item.interval}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-secondary">
                    <Repeat2 className="size-3" />
                    {FREQUENCY_LABEL[item.frequency]}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-secondary">
                    <Clock3 className="size-3" />
                    Reminder {item.reminderDaysBefore}d
                  </span>
                  {isOverdue ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-red-300">
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
          <div className="rounded-[20px] border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
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
