'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactions } from '@/src/hooks/useTransactions';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import { getMonthKey } from '@/src/lib/budgets';

const CHART_COLORS = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, (month || 1) - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export default function StatsPage() {
  const { transactions, loading, getTotals } = useTransactions();
  const monthKey = getMonthKey();
  const { income, expenses } = getTotals();

  const breakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const key = `${tx.category || 'Other'}`;
      map.set(key, (map.get(key) || 0) + Number(tx.amount || 0));
    });

    const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0);
    return Array.from(map.entries())
      .map(([category, amount], index) => ({
        category,
        amount,
        color: CHART_COLORS[index % CHART_COLORS.length],
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 7);
  }, [transactions]);

  const topCategory = breakdown[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <p className="text-slate-300 text-xs mb-1">Monthly Stats</p>
        <h1 className="text-2xl font-bold">{monthLabel(monthKey)}</h1>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-slate-300">Income</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(income)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-slate-300">Expense</p>
            <p className="text-sm font-semibold">{formatCurrencyCompact(expenses)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Expense Split</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Category spending breakdown</p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading stats...</div>
          ) : breakdown.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No expense data for this month.</div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={88} paddingAngle={3}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Category Indicators</h2>
            {topCategory ? (
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Top: {topCategory.category}</p>
            ) : null}
          </div>

          <div className="mt-3 space-y-2">
            {breakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <p className="font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{item.category}</p>
                  <p className="text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</p>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{formatCurrency(item.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
