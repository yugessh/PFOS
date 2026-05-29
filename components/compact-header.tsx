'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrencyCompact } from '@/src/lib/currency';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/src/components/layout/AppHeader';
import { cn } from '@/lib/utils';

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
    <AppHeader
      className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      contentClassName="px-4 py-2"
      start={
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPreviousMonth}>
          <ChevronLeft className="size-4" />
        </Button>
      }
      center={<span className="text-sm font-semibold text-gray-900 dark:text-white">{month} {year}</span>}
      end={
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onNextMonth}>
          <ChevronRight className="size-4" />
        </Button>
      }
    >
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Balance</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrencyCompact(balance)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Income</p>
            <p className="font-bold text-green-600 dark:text-green-400">{formatCurrencyCompact(income)}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Expense</p>
            <p className="font-bold text-red-600 dark:text-red-400">{formatCurrencyCompact(expenses)}</p>
          </div>
          <div
            className={`rounded-lg p-2 ${
              net >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
            }`}
          >
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Net</p>
            <p className={`font-bold ${net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {formatCurrencyCompact(net)}
            </p>
          </div>
        </div>
      </div>
    </AppHeader>
  );
}
