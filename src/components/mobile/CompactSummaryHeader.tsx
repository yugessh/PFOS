'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';
import { AppHeader } from '@/src/components/layout/AppHeader';

interface CompactSummaryHeaderProps {
  month: Date;
  balance: number;
  income: number;
  expenses: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function CompactSummaryHeader({
  month,
  balance,
  income,
  expenses,
  onPreviousMonth,
  onNextMonth,
}: CompactSummaryHeaderProps) {
  const monthLabel = `${monthNames[month.getMonth()]} ${month.getFullYear()}`;
  const net = income - expenses;

  return (
    <AppHeader
      className="bg-gradient-to-br from-blue-600 to-blue-700 text-white dark:from-blue-800 dark:to-blue-900"
      contentClassName="px-4 pt-3 pb-3"
      start={
        <button
          onClick={onPreviousMonth}
          className="rounded-md p-1 transition-colors hover:bg-white/10"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
      }
      center={<span className="text-sm font-semibold">{monthLabel}</span>}
      end={
        <button
          onClick={onNextMonth}
          className="rounded-md p-1 transition-colors hover:bg-white/10"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      }
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex-1">
          <p className="text-xs text-blue-100">Balance</p>
          <p className="text-base font-bold">{formatCurrency(balance)}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-green-200">Income</p>
          <p className="text-sm font-semibold">{formatCurrency(income)}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-red-200">Expense</p>
          <p className="text-sm font-semibold">{formatCurrency(expenses)}</p>
        </div>
        <div className="flex-1">
          <p className={`text-xs ${net >= 0 ? 'text-green-200' : 'text-red-200'}`}>Net</p>
          <p className="text-sm font-semibold">{formatCurrency(net)}</p>
        </div>
      </div>
    </AppHeader>
  );
}
