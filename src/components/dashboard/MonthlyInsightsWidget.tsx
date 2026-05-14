'use client';

import { useMemo } from 'react';
import { BarChart3, Target, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useBudgets } from '@/src/hooks/useBudgets';

interface MonthlyInsightsWidgetProps {
  compact?: boolean;
}

export function MonthlyInsightsWidget({ compact = false }: MonthlyInsightsWidgetProps) {
  const { transactions, getTotals } = useTransactions();
  const { budgetSummary } = useBudgets(transactions);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysRemaining = Math.max(0, daysInMonth - daysPassed);

    const monthlyIncome = monthlyTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Estimate remaining balance based on daily spending rate
    const dailySpendingRate = monthlyExpenses / daysPassed;
    const estimatedRemainingSpend = dailySpendingRate * daysRemaining;
    const estimatedEndBalance = budgetSummary.totalRemaining - estimatedRemainingSpend;

    // Budget status
    const budgetUtilization = budgetSummary.totalBudget > 0
      ? (monthlyExpenses / budgetSummary.totalBudget) * 100
      : 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      daysPassed,
      daysRemaining,
      estimatedEndBalance,
      budgetUtilization,
      dailySpendingRate,
    };
  }, [transactions, budgetSummary]);

  if (compact) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="size-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Monthly</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Insights</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(monthlyStats.estimatedEndBalance)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Est. end balance
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Budget Used</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {monthlyStats.budgetUtilization.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                monthlyStats.budgetUtilization > 90
                  ? 'bg-red-500'
                  : monthlyStats.budgetUtilization > 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, monthlyStats.budgetUtilization)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {monthlyStats.daysRemaining} days remaining
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <BarChart3 className="size-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Insights</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Budget and spending analysis</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(monthlyStats.estimatedEndBalance)}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Projected end balance</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Budget Utilization</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {monthlyStats.budgetUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                monthlyStats.budgetUtilization > 90
                  ? 'bg-red-500'
                  : monthlyStats.budgetUtilization > 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, monthlyStats.budgetUtilization)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-blue-700 dark:text-blue-300">Days Left</span>
            </div>
            <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              {monthlyStats.daysRemaining}
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-orange-700 dark:text-orange-300">Daily Avg</span>
            </div>
            <p className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              {formatCurrency(monthlyStats.dailySpendingRate)}
            </p>
          </div>
        </div>

        {monthlyStats.budgetUtilization > 90 && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="size-4 text-red-600 dark:text-red-400" />
              <span className="text-xs text-red-700 dark:text-red-300">Budget Alert</span>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200">
              You're close to exceeding your monthly budget
            </p>
          </div>
        )}
      </div>
    </div>
  );
}