'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useReminders } from '@/src/hooks/useReminders';
import { AddReminderModal } from './AddReminderModal';

const TYPE_ICONS: Record<string, string> = {
  bill: '💡',
  subscription: '📺',
  insurance: '🛡️',
  rent: '🏠',
  utility: '⚡',
  other: '📄',
};

const TYPE_LABELS: Record<string, string> = {
  bill: 'Bill',
  subscription: 'Subscription',
  insurance: 'Insurance',
  rent: 'Rent',
  utility: 'Utility',
  other: 'Other',
};

export function RemindersPage() {
  const [open, setOpen] = useState(false);
  const { accounts } = useAccounts();
  const {
    reminders,
    reminderAlerts,
    upcomingReminders,
    loading,
    saving,
    error,
    saveReminder,
    removeReminder,
    markReminderPaid,
  } = useReminders();

  const accountMap = useMemo(() => new Map(accounts.map((item) => [item.id, item.name])), [accounts]);

  const stats = useMemo(() => {
    const active = reminders.filter((r) => r.isActive && !r.isPaid);
    const overdue = reminderAlerts.filter((a) => a.isOverdue);
    const dueThisWeek = reminderAlerts.filter((a) => !a.isOverdue && a.daysUntilDue <= 7);
    const totalAmount = active.reduce((sum, r) => sum + (r.amount || 0), 0);

    return { active: active.length, overdue: overdue.length, dueThisWeek: dueThisWeek.length, totalAmount };
  }, [reminders, reminderAlerts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-amber-600 to-orange-700 dark:from-amber-800 dark:to-orange-900 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-amber-100 text-xs mb-1">Bill Reminders</p>
            <h1 className="text-2xl font-bold">Payment Tracker</h1>
          </div>
          <Button size="sm" className="bg-white text-amber-700 hover:bg-amber-50" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-amber-100">Active</p>
            <p className="text-sm font-semibold">{stats.active}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-amber-100">Due This Week</p>
            <p className="text-sm font-semibold">{stats.dueThisWeek}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-amber-100">Total Amount</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(stats.totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Overdue Payments</h2>
          </div>
          {reminderAlerts.filter((a) => a.isOverdue).length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No overdue payments.</p>
          ) : (
            <div className="space-y-2">
              {reminderAlerts.filter((a) => a.isOverdue).slice(0, 3).map((alert) => (
                <div key={`${alert.reminderId}-${alert.dueDate.toISOString()}`} className="rounded-lg bg-red-50 dark:bg-red-900/30 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-red-900 dark:text-red-100 truncate">{alert.title}</p>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">{alert.amount ? formatCurrency(alert.amount) : 'N/A'}</p>
                  </div>
                  <p className="text-[11px] mt-1 text-red-600 dark:text-red-400">
                    {Math.abs(alert.daysUntilDue)} days overdue
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="size-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Payments</h2>
          </div>
          {reminderAlerts.filter((a) => !a.isOverdue).length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">No upcoming payments in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {reminderAlerts.filter((a) => !a.isOverdue).slice(0, 4).map((alert) => (
                <div key={`${alert.reminderId}-${alert.dueDate.toISOString()}`} className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 truncate">{alert.title}</p>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">{alert.amount ? formatCurrency(alert.amount) : 'N/A'}</p>
                  </div>
                  <p className="text-[11px] mt-1 text-amber-600 dark:text-amber-400">
                    {alert.daysUntilDue === 0 ? 'Due today' : `Due in ${alert.daysUntilDue} days`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Loading reminders...
          </div>
        ) : reminders.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">No reminders yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set up reminders for bills, subscriptions, and payments.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>Add Reminder</Button>
          </div>
        ) : (
          reminders.map((reminder) => {
            const accountName = reminder.accountId ? accountMap.get(reminder.accountId) : null;
            const isOverdue = new Date(reminder.dueDate) < new Date() && !reminder.isPaid;
            const isPaid = reminder.isPaid;

            return (
              <article key={reminder.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg">
                      {TYPE_ICONS[reminder.type] || '📄'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{reminder.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                        {TYPE_LABELS[reminder.type]} • {reminder.category}
                      </p>
                      {accountName && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {accountName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {reminder.amount && (
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(reminder.amount)}</p>
                    )}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {new Date(reminder.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                      isPaid
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : isOverdue
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      <Calendar className="size-3" />
                      {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-600 dark:bg-gray-700 dark:text-gray-300 capitalize">
                      {reminder.frequency}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!isPaid && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markReminderPaid(reminder.id)}
                        disabled={saving}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeReminder(reminder.id)}
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

      <AddReminderModal
        open={open}
        onOpenChange={setOpen}
        saving={saving}
        onSave={async (payload) => {
          await saveReminder(payload);
        }}
      />
    </div>
  );
}