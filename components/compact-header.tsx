'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrencyCompact } from '@/src/lib/currency';
import { Button } from '@/components/ui/button';

interface CompactHeaderProps {
  month: string;
  year: number;
  balance: number;
  income: number;
  expenses: number;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  onAddTransaction?: () => void;
}

export function CompactHeader({
  month,
  year,
  balance,
  income,
  expenses,
  onPreviousMonth,
  onNextMonth,
  onAddTransaction,
}: CompactHeaderProps) {
  const net = income - expenses;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      {/* Month Switcher */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onPreviousMonth}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {month} {year}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onNextMonth}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Summary Row */}
      <div className="px-4 py-3 space-y-2">
        {/* Balance */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Balance</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrencyCompact(balance)}
          </span>
        </div>

        {/* Income, Expense, Net Row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
            <p className="text-gray-600 dark:text-gray-400 text-[11px]">Income</p>
            <p className="font-bold text-green-600 dark:text-green-400">
              {formatCurrencyCompact(income)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
            <p className="text-gray-600 dark:text-gray-400 text-[11px]">Expense</p>
            <p className="font-bold text-red-600 dark:text-red-400">
              {formatCurrencyCompact(expenses)}
            </p>
          </div>
          <div className={`rounded-lg p-2 ${
            net >= 0
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-orange-50 dark:bg-orange-900/20'
          }`}>
            <p className="text-gray-600 dark:text-gray-400 text-[11px]">Net</p>
            <p className={`font-bold ${
              net >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
            }`}>
              {formatCurrencyCompact(net)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
