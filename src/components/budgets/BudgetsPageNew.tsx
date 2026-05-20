'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, AlertTriangle, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useBudgets } from '@/src/hooks/useBudgets';
import { useTransactions } from '@/src/hooks/useTransactions';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import { AddBudgetModal } from './AddBudgetModal';
import { BudgetCard } from './BudgetCard';
import { Button } from '@/components/ui/button';

const BUDGET_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

export function BudgetsPageNew() {
  const { transactions } = useTransactions();
  const {
    budgetItems,
    budgetSummary,
    categoryOptions,
    monthKey,
    loading,
    saving,
    error,
    saveBudget,
    removeBudget,
  } = useBudgets(transactions);

  const [addOpen, setAddOpen] = useState(false);

  const hasOverspending = budgetSummary.overBudgetCount > 0;
  const hasWarnings = budgetSummary.nearLimitCount > 0;
  const monthYear = useMemo(() => {
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [monthKey]);

  // Chart data: Budget usage donut
  const budgetUsageData = useMemo(() => {
    const used = budgetSummary.totalSpent;
    const remaining = Math.max(0, budgetSummary.totalRemaining);
    return [
      { name: 'Used', value: used, fill: '#ef4444' },
      { name: 'Remaining', value: remaining, fill: '#10b981' },
    ];
  }, [budgetSummary]);

  // Chart data: Category spending bar chart
  const categorySpendingData = useMemo(() => {
    return budgetItems
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
      .map((item, idx) => ({
        name: item.categoryName.slice(0, 8),
        spent: item.spent,
        limit: item.monthlyLimit,
        fill: BUDGET_COLORS[idx % BUDGET_COLORS.length],
      }));
  }, [budgetItems]);

  // Alerts for budgets
  const alerts = useMemo(() => {
    const result: Array<{ type: string; item: any; percent: number }> = [];
    budgetItems.forEach((item) => {
      const percent = (item.spent / item.monthlyLimit) * 100;
      if (percent >= 100) {
        result.push({ type: 'over', item, percent });
      } else if (percent >= 90) {
        result.push({ type: '90', item, percent });
      } else if (percent >= 80) {
        result.push({ type: '80', item, percent });
      }
    });
    return result.sort((a, b) => b.percent - a.percent).slice(0, 3);
  }, [budgetItems]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-4 pb-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Monthly Budgets</p>
            <h1 className="text-2xl font-bold mt-1">{monthYear}</h1>
          </div>
          <Button
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-1 shadow-md"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={16} />
            Add
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-[10px] font-medium">Total Budget</p>
            <p className="text-lg font-semibold mt-1">{formatCurrencyCompact(budgetSummary.totalBudget)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-[10px] font-medium">Spent</p>
            <p className="text-lg font-semibold mt-1">{formatCurrencyCompact(budgetSummary.totalSpent)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-[10px] font-medium">Remaining</p>
            <p className={`text-lg font-semibold mt-1 ${budgetSummary.totalRemaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatCurrencyCompact(Math.abs(budgetSummary.totalRemaining))}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Alerts */}
        {(hasOverspending || hasWarnings) && (
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-lg border px-3 py-2 text-sm flex items-start gap-2 ${
                  alert.type === 'over'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                }`}
              >
                <AlertTriangle
                  size={14}
                  className={`mt-0.5 flex-shrink-0 ${alert.type === 'over' ? 'text-red-600' : 'text-amber-600'}`}
                />
                <div>
                  <p className={`font-semibold text-xs ${alert.type === 'over' ? 'text-red-900 dark:text-red-200' : 'text-amber-900 dark:text-amber-200'}`}>
                    {alert.item.categoryIcon} {alert.item.categoryName}
                  </p>
                  <p className={`text-xs mt-0.5 ${alert.type === 'over' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {alert.type === 'over'
                      ? `Over by ${formatCurrency(alert.item.spent - alert.item.monthlyLimit)}`
                      : `${alert.percent.toFixed(0)}% of budget used`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        {!loading && budgetItems.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {/* Budget Usage Donut */}
            {budgetSummary.totalBudget > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Budget Usage</h3>
                <div className="flex items-center justify-center h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {budgetUsageData.map((item, idx) => (
                          <Cell key={idx} fill={item.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around text-xs mt-3">
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-muted-foreground">Used</span>
                    </div>
                    <p className="font-semibold">{((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-muted-foreground">Remain</span>
                    </div>
                    <p className="font-semibold">{((budgetSummary.totalRemaining / budgetSummary.totalBudget) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Category Spending Bar Chart */}
            {categorySpendingData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Top Categories</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categorySpendingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                        {categorySpendingData.map((item, idx) => (
                          <Cell key={idx} fill={item.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Items List */}
        <div className="space-y-2">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center text-sm text-muted-foreground">
              Loading budgets...
            </div>
          ) : budgetItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">No budgets set for this month</p>
              <Button className="mt-4" onClick={() => setAddOpen(true)}>
                Set Your First Budget
              </Button>
            </div>
          ) : (
            budgetItems
              .sort((a, b) => b.progressPercent - a.progressPercent)
              .map((item) => <BudgetCard key={item.id} budget={item} onDelete={removeBudget} />)
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      <AddBudgetModal
        open={addOpen}
        onOpenChange={setAddOpen}
        categoryOptions={categoryOptions}
        loading={saving}
        onSave={saveBudget}
      />
    </div>
  );
}
