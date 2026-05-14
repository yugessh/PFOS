'use client';

import { useState } from 'react';
import { Plus, AlertTriangle, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddBudgetModal } from './AddBudgetModal';
import { BudgetCard } from './BudgetCard';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useBudgets } from '@/src/hooks/useBudgets';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';

export function BudgetsPage() {
  const [addOpen, setAddOpen] = useState(false);
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

  const hasOverspending = budgetSummary.overBudgetCount > 0;
  const hasWarnings = budgetSummary.nearLimitCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Monthly Budgets</p>
            <h1 className="text-3xl font-bold">{monthKey}</h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-2 shadow-md"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-xs">Budgeted</p>
            <p className="text-lg font-semibold">{formatCurrencyCompact(budgetSummary.totalBudget)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-xs">Spent</p>
            <p className="text-lg font-semibold">{formatCurrencyCompact(budgetSummary.totalSpent)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="size-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Budget Health</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Remaining this month: <span className="font-semibold">{formatCurrency(budgetSummary.totalRemaining)}</span>
          </p>
          {(hasOverspending || hasWarnings) && (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4" />
                Attention Needed
              </div>
              <p className="mt-1 text-xs">
                {hasOverspending
                  ? `${budgetSummary.overBudgetCount} categories are over budget.`
                  : `${budgetSummary.nearLimitCount} categories are close to limit.`}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading budgets...</p>
          </div>
        ) : budgetItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">No budgets set for this month</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Start with Food ₹10,000, Transport ₹5,000, Shopping ₹8,000.
            </p>
            <Button className="mt-4" onClick={() => setAddOpen(true)}>
              Set Your First Budget
            </Button>
          </div>
        ) : (
          budgetItems
            .sort((a, b) => b.progressPercent - a.progressPercent)
            .map((item) => <BudgetCard key={item.id} budget={item} onDelete={removeBudget} />)
        )}

        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        ) : null}
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
