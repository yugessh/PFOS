'use client';

import { useMemo } from 'react';
import { AlertTriangle, Bell, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';
import { useEMI } from '@/src/hooks/useEMI';
import { useReminders } from '@/src/hooks/useReminders';
import { useRecurringTransactions } from '@/src/hooks/useRecurringTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';

interface UpcomingPaymentsWidgetProps {
  compact?: boolean;
}

export function UpcomingPaymentsWidget({ compact = false }: UpcomingPaymentsWidgetProps) {
  const { emiAlerts } = useEMI();
  const { reminderAlerts } = useReminders();
  const { recurringAlerts } = useRecurringTransactions();
  const { accounts } = useAccounts();

  const accountMap = useMemo(() => new Map(accounts.map((item) => [item.id, item.name])), [accounts]);

  const badgeStyles = {
    emi: {
      wrapper: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    reminder: {
      wrapper: 'bg-amber-100 dark:bg-amber-900/30',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    recurring: {
      wrapper: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
    },
  } as const;

  const allAlerts = useMemo(() => {
    const alerts = [
      ...emiAlerts.map((alert) => ({
        ...alert,
        type: 'emi' as const,
        icon: CreditCard,
      })),
      ...reminderAlerts.map((alert) => ({
        ...alert,
        type: 'reminder' as const,
        icon: Bell,
      })),
      ...recurringAlerts.map((alert) => ({
        ...alert,
        type: 'recurring' as const,
        icon: Calendar,
      })),
    ];

    return alerts
      .filter((alert) => !alert.isOverdue)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, compact ? 3 : 5);
  }, [emiAlerts, reminderAlerts, recurringAlerts, compact]);

  const overdueCount = useMemo(() => {
    return [
      ...emiAlerts.filter((a) => a.isOverdue),
      ...reminderAlerts.filter((a) => a.isOverdue),
      ...recurringAlerts.filter((a) => a.isOverdue),
    ].length;
  }, [emiAlerts, reminderAlerts, recurringAlerts]);

  if (compact) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Smart alerts</p>
            </div>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
              <AlertTriangle className="size-3" />
              {overdueCount}
            </div>
          )}
        </div>

        {allAlerts.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">No upcoming payments</p>
        ) : (
          <div className="space-y-2">
            {allAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={`${alert.type}-${alert.title}-${alert.dueDate.toISOString()}`} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`${badgeStyles[alert.type].wrapper} size-6 rounded-full flex items-center justify-center`}>
                      <Icon className={`${badgeStyles[alert.type].icon} size-3`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{alert.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {alert.daysUntilDue === 0 ? 'Today' : `${alert.daysUntilDue}d`}
                      </p>
                    </div>
                  </div>
                  {alert.amount && (
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(alert.amount)}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Payments</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Next 7 days</p>
          </div>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[11px] text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <AlertTriangle className="size-3" />
            {overdueCount} overdue
          </div>
        )}
      </div>

      {allAlerts.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white">All caught up!</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No upcoming payments in your reminder window.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allAlerts.map((alert) => {
            const Icon = alert.icon;
            const accountId = 'accountId' in alert ? String(alert.accountId) : undefined;
            const accountName = accountId ? accountMap.get(accountId) : null;

            return (
              <div key={`${alert.type}-${alert.title}-${alert.dueDate.toISOString()}`} className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`${badgeStyles[alert.type].wrapper} size-7 rounded-full flex items-center justify-center`}>
                      <Icon className={`${badgeStyles[alert.type].icon} size-3.5`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{alert.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">
                        {alert.type} • {accountName || 'No account'}
                      </p>
                    </div>
                  </div>
                  {alert.amount && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(alert.amount)}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <span>
                    {alert.daysUntilDue === 0 ? 'Due today' : `Due in ${alert.daysUntilDue} days`}
                  </span>
                  <span>{alert.dueDate.toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}