'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/src/lib/currency';
import type { BudgetWithProgress } from '@/src/lib/budgets';
import { BudgetProgressBar } from './BudgetProgressBar';

interface BudgetCardProps {
  budget: BudgetWithProgress;
  onDelete: (id: string) => Promise<void>;
}

export function BudgetCard({ budget, onDelete }: BudgetCardProps) {
  const warningTone = budget.isOverBudget
    ? 'text-red-600 dark:text-red-400'
    : budget.isNearLimit
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400';

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{budget.categoryIcon || '📦'} {budget.categoryName}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(budget.monthlyLimit, budget.currency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {budget.isOverBudget ? (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" />
              Over
            </Badge>
          ) : budget.isNearLimit ? (
            <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300">
              Near Limit
            </Badge>
          ) : (
            <Badge variant="secondary">On Track</Badge>
          )}
          <Button variant="ghost" size="icon" className="size-8" onClick={() => onDelete(budget.id)}>
            <Trash2 className="size-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <BudgetProgressBar
          spent={budget.spent}
          limit={budget.monthlyLimit}
          progressPercent={budget.progressPercent}
          isOverBudget={budget.isOverBudget}
          isNearLimit={budget.isNearLimit}
        />

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            Spent: <span className="font-semibold">{formatCurrency(budget.spent, budget.currency)}</span>
          </p>
          <p className={warningTone}>
            {budget.remaining >= 0
              ? `Remaining: ${formatCurrency(budget.remaining, budget.currency)}`
              : `Over by ${formatCurrency(Math.abs(budget.remaining), budget.currency)}`}
          </p>
        </div>
      </div>
    </article>
  );
}
