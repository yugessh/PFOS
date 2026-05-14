'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetProgressBarProps {
  spent: number;
  limit: number;
  progressPercent: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export function BudgetProgressBar({
  spent,
  limit,
  progressPercent,
  isOverBudget,
  isNearLimit,
}: BudgetProgressBarProps) {
  const barClassName = isOverBudget
    ? '[&_[data-slot=progress-indicator]]:bg-red-500 bg-red-100 dark:bg-red-900/30'
    : isNearLimit
      ? '[&_[data-slot=progress-indicator]]:bg-amber-500 bg-amber-100 dark:bg-amber-900/30'
      : '[&_[data-slot=progress-indicator]]:bg-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';

  return (
    <div className="space-y-2">
      <Progress value={Math.min(progressPercent, 100)} className={cn('h-2.5 rounded-full', barClassName)} />
      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span>{progressPercent.toFixed(1)}% used</span>
        <span>
          {spent.toLocaleString('en-IN')} / {limit.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
