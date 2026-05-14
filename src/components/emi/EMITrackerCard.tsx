'use client';

import { AlertTriangle, CreditCard, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';
import type { EMIModel } from '@/src/lib/emi';
import { calculateEMIProgress } from '@/src/lib/emi';

interface EMITrackerCardProps {
  emi: EMIModel;
  accountName?: string;
  onMarkPaid?: (emiId: string, installmentNumber: number) => void;
  compact?: boolean;
}

export function EMITrackerCard({ emi, accountName, onMarkPaid, compact = false }: EMITrackerCardProps) {
  const progress = calculateEMIProgress(emi);
  const isOverdue = new Date() > new Date(emi.startDate.getFullYear(), emi.startDate.getMonth() + progress.paid, emi.dueDate);

  if (compact) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{emi.title}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{accountName || 'Account'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(emi.monthlyInstallment)}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{progress.paid}/{progress.total}</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, progress.progress)}%` }}
          />
        </div>

        {isOverdue && (
          <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
            <AlertTriangle className="size-3" />
            Overdue
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{emi.title}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{accountName || 'Account'} • {emi.category}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(emi.monthlyInstallment)}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Monthly</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>Progress ({progress.paid} of {progress.total} installments)</span>
          <span>{Math.round(progress.progress)}% complete</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, progress.progress)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loan</p>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(emi.loanAmount)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2 text-center">
            <p className="text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatCurrency(progress.remaining * emi.monthlyInstallment)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/60 p-2 text-center">
            <p className="text-gray-500 dark:text-gray-400">Due</p>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{emi.dueDate}th</p>
          </div>
        </div>

        {isOverdue && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/30 p-2">
            <AlertTriangle className="size-4 text-red-500" />
            <p className="text-xs text-red-700 dark:text-red-300">Payment overdue</p>
          </div>
        )}

        {onMarkPaid && !progress.isCompleted && (
          <button
            type="button"
            onClick={() => onMarkPaid(emi.id, progress.paid + 1)}
            className="w-full rounded-lg bg-emerald-600 text-white py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Mark This Month Paid
          </button>
        )}

        {progress.isCompleted && (
          <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-2 text-center">
            <p className="text-xs text-green-700 dark:text-green-300">EMI Completed! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}