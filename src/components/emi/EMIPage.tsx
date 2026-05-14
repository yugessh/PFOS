'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CreditCard, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useEMI } from '@/src/hooks/useEMI';
import { AddEMIModal } from './AddEMIModal';

export function EMIPage() {
  const [open, setOpen] = useState(false);
  const { accounts } = useAccounts();
  const {
    emiProgress,
    emiAlerts,
    loading,
    saving,
    error,
    saveEMI,
    removeEMI,
    markEMIPaid,
  } = useEMI();

  const accountMap = useMemo(() => new Map(accounts.map((item) => [item.id, item.name])), [accounts]);

  const totals = useMemo(() => {
    return emiProgress.reduce(
      (sum, item) => {
        if (!item.isActive) return sum;
        sum.totalAmount += item.loanAmount;
        sum.monthlyTotal += item.monthlyInstallment;
        sum.remainingTotal += item.progress.remaining * item.monthlyInstallment;
        return sum;
      },
      { totalAmount: 0, monthlyTotal: 0, remainingTotal: 0 }
    );
  }, [emiProgress]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-emerald-100 text-xs mb-1">EMI Management</p>
            <h1 className="text-2xl font-bold">Loan Tracker</h1>
          </div>
          <Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-emerald-100">Total Loans</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(totals.totalAmount)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-emerald-100">Monthly EMI</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(totals.monthlyTotal)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-emerald-100">Remaining</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(totals.remainingTotal)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming EMI</h2>
          </div>
          {emiAlerts.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No EMI due in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {emiAlerts.slice(0, 4).map((alert) => (
                <div key={`${alert.emiId}-${alert.dueDate.toISOString()}`} className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{alert.title}</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(alert.amount)}</p>
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
            Loading EMI details...
          </div>
        ) : emiProgress.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">No EMIs yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track your loans, credit cards, and installment payments.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>Add EMI</Button>
          </div>
        ) : (
          emiProgress.map((item) => {
            const accountName = accountMap.get(item.accountId) || 'Account';
            const isOverdue = new Date() > new Date(item.startDate.getFullYear(), item.startDate.getMonth() + item.progress.paid, item.dueDate);

            return (
              <article key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {accountName} • {item.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.monthlyInstallment)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{item.progress.paid} / {item.progress.total} installments</span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, item.progress.progress)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                      <p className="text-gray-500 dark:text-gray-400">Loan Amount</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(item.loanAmount)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                      <p className="text-gray-500 dark:text-gray-400">Remaining</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(item.progress.remaining * item.monthlyInstallment)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2">
                      <p className="text-gray-500 dark:text-gray-400">Due Date</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{item.dueDate}th</p>
                    </div>
                  </div>

                  {isOverdue && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/30 p-2">
                      <AlertTriangle className="size-4 text-red-500" />
                      <p className="text-xs text-red-700 dark:text-red-300">Payment overdue</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => markEMIPaid(item.id, item.progress.paid + 1)}
                      disabled={saving || item.progress.isCompleted}
                    >
                      {item.progress.isCompleted ? 'Completed' : 'Mark Paid'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEMI(item.id)}
                      disabled={saving}
                    >
                      Remove
                    </Button>
                  </div>
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

      <AddEMIModal
        open={open}
        onOpenChange={setOpen}
        saving={saving}
        onSave={async (payload) => {
          await saveEMI(payload);
        }}
      />
    </div>
  );
}