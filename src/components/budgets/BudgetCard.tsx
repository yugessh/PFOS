'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';
import type { BudgetWithProgress } from '@/src/lib/budgets';

interface BudgetCardProps {
  budget: BudgetWithProgress;
  onDelete: (id: string) => Promise<void>;
}

export function BudgetCard({ budget, onDelete }: BudgetCardProps) {
  const warningText = budget.isOverBudget
    ? 'text-red-700 dark:text-red-300'
    : budget.isNearLimit
      ? 'text-amber-700 dark:text-amber-300'
      : 'text-emerald-700 dark:text-emerald-300';

  const barColor = budget.isOverBudget
    ? 'bg-red-500'
    : budget.isNearLimit
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0">{budget.categoryIcon || '📦'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium truncate">{budget.categoryName}</p>
              <p className="text-sm font-semibold text-foreground">{formatCurrency(budget.monthlyLimit)}</p>
            </div>
          </div>
        </div>
        <button
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
          onClick={() => onDelete(budget.id)}
        >
          <Trash2 className="size-4 text-gray-500" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all`}
            style={{ width: `${Math.min(budget.progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Spent</p>
          <p className="font-semibold text-foreground">{formatCurrency(budget.spent)}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">{budget.progressPercent.toFixed(0)}%</p>
          <p className={`font-semibold ${warningText}`}>
            {budget.isOverBudget && '⚠ Over'}
            {budget.isNearLimit && !budget.isOverBudget && '⚠ Alert'}
            {!budget.isOverBudget && !budget.isNearLimit && '✓ Good'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Remain</p>
          <p className={`font-semibold ${warningText}`}>
            {budget.remaining >= 0
              ? formatCurrency(budget.remaining)
              : `-${formatCurrency(Math.abs(budget.remaining))}`}
          </p>
        </div>
      </div>
    </article>
  );
}
