'use client';

import { TransactionType } from './types';

interface TransactionTypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 gap-1">
      <button
        type="button"
        onClick={() => onChange('expense')}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
          value === 'expense'
            ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Expense
      </button>
      <button
        type="button"
        onClick={() => onChange('income')}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
          value === 'income'
            ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Income
      </button>
      <button
        type="button"
        onClick={() => onChange('transfer')}
        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
          value === 'transfer'
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Transfer
      </button>
    </div>
  );
}
