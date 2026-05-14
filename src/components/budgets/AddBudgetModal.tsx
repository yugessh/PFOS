'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BudgetCategorySelector } from './BudgetCategorySelector';
import type { BudgetCategoryOption } from '@/src/hooks/useBudgets';

interface AddBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryOptions: BudgetCategoryOption[];
  loading?: boolean;
  onSave: (payload: {
    categoryId: string;
    categoryName: string;
    categoryIcon?: string;
    monthlyLimit: number;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  }) => Promise<void>;
}

export function AddBudgetModal({
  open,
  onOpenChange,
  categoryOptions,
  loading = false,
  onSave,
}: AddBudgetModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR');
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categoryOptions.find((option) => option.id === selectedCategoryId),
    [categoryOptions, selectedCategoryId]
  );

  async function handleSave() {
    setError(null);
    const limit = Number(budgetAmount);

    if (!selectedCategory) {
      setError('Please choose a category');
      return;
    }

    if (!limit || limit <= 0) {
      setError('Please enter a valid monthly budget amount');
      return;
    }

    await onSave({
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      monthlyLimit: limit,
      currency,
    });

    setSelectedCategoryId('');
    setBudgetAmount('');
    setCurrency('INR');
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set Monthly Budget</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="size-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <BudgetCategorySelector value={selectedCategoryId} options={categoryOptions} onChange={setSelectedCategoryId} />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Budget Amount
            </label>
            <Input
              inputMode="decimal"
              value={budgetAmount}
              onChange={(event) => setBudgetAmount(event.target.value)}
              placeholder="e.g. 10000"
              className="h-11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
              className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Budget'}
          </Button>
        </div>
      </div>
    </div>
  );
}
