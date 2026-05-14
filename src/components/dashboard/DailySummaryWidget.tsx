'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';
import { useTransactions } from '@/src/hooks/useTransactions';

interface DailySummaryWidgetProps {
  compact?: boolean;
}

export function DailySummaryWidget({ compact = false }: DailySummaryWidgetProps) {
  const { transactions } = useTransactions();

  const todayStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= today && txDate < tomorrow;
    });

    const income = todayTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = todayTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const transactionCount = todayTransactions.length;

    return { income, expenses, transactionCount, net: income - expenses };
  }, [transactions]);

  if (compact) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Calendar className="size-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Today</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Daily Summary</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(todayStats.net)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {todayStats.transactionCount} transactions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2 text-center">
            <p className="text-[11px] text-green-700 dark:text-green-300">Income</p>
            <p className="text-xs font-semibold text-green-800 dark:text-green-200">
              {formatCurrency(todayStats.income)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-2 text-center">
            <p className="text-[11px] text-red-700 dark:text-red-300">Spent</p>
            <p className="text-xs font-semibold text-red-800 dark:text-red-200">
              {formatCurrency(todayStats.expenses)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Calendar className="size-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Today's Summary</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Daily financial activity</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(todayStats.net)}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Net flow</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-[11px] text-green-700 dark:text-green-300 mb-1">Income</p>
          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
            {formatCurrency(todayStats.income)}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-[11px] text-red-700 dark:text-red-300 mb-1">Expenses</p>
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            {formatCurrency(todayStats.expenses)}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 mb-1">Transactions</p>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            {todayStats.transactionCount}
          </p>
        </div>
      </div>

      {todayStats.transactionCount === 0 && (
        <div className="text-center py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">No transactions today</p>
        </div>
      )}
    </div>
  );
}