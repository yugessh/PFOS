'use client';

import { cn } from '@/lib/utils';
import type { BudgetCategoryOption } from '@/src/hooks/useBudgets';

interface BudgetCategorySelectorProps {
  value: string;
  options: BudgetCategoryOption[];
  onChange: (value: string) => void;
}

export function BudgetCategorySelector({ value, options, onChange }: BudgetCategorySelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={cn(
                'rounded-xl border px-3 py-3 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-900/30'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'
              )}
            >
              <p className="text-lg leading-none">{option.icon}</p>
              <p className="mt-1 text-xs font-semibold text-gray-900 dark:text-white truncate">{option.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
