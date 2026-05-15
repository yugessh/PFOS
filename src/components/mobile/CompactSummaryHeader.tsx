'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';

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
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-3 pb-3 space-y-2">
      {/* Month Switcher */}
      <div className="flex items-center justify-between h-8">
        <button
          onClick={onPreviousMonth}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold flex-1 text-center">{monthLabel}</span>
        <button
          onClick={onNextMonth}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Balance Row */}
      <div className="flex items-center justify-between text-sm gap-2">
        <div className="flex-1">
          <p className="text-blue-100 text-xs">Balance</p>
          <p className="font-bold text-base">{formatCurrency(balance)}</p>
        </div>
        <div className="flex-1">
          <p className="text-green-200 text-xs">Income</p>
          <p className="font-semibold text-sm">{formatCurrency(income)}</p>
        </div>
        <div className="flex-1">
          <p className="text-red-200 text-xs">Expense</p>
          <p className="font-semibold text-sm">{formatCurrency(expenses)}</p>
        </div>
        <div className="flex-1">
          <p className={`text-xs ${net >= 0 ? 'text-green-200' : 'text-red-200'}`}>Net</p>
          <p className="font-semibold text-sm">{formatCurrency(net)}</p>
        </div>
      </div>
    </div>
  );
}
