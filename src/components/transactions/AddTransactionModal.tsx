'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { TransactionType, TransactionFormData } from './types';
import { TransactionTypeToggle } from './TransactionTypeToggle';
import { AmountInput } from './AmountInput';
import { CategorySelector } from './CategorySelector';
import { AccountSelector } from './AccountSelector';
import { NotesInput } from './NotesInput';
import { DatePicker } from './DatePicker';
import { getCategoriesByType } from './mock-data';
import { useAccounts } from '@/src/hooks/useAccounts';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onSave is optional to avoid crashes when parent doesn't provide a handler.
  // When provided it will be called with TransactionFormData.
  onSave?: (transaction: TransactionFormData) => Promise<void> | void;
}

export function AddTransactionModal({ open, onOpenChange, onSave }: AddTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    amount: 0,
    category: '',
    account: '',
    notes: '',
    date: new Date(),
  });

  const [toAccount, setToAccount] = useState<string>('');
  const { accounts } = useAccounts();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = getCategoriesByType(formData.type);

  const selectorAccounts = (accounts || []).map((acc: any) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balance: acc.balance || 0,
    icon: acc.icon || '🏦',
    color: acc.color || '#3B82F6',
  }));

  const handleSave = async () => {
    setError(null);
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!formData.account) {
      setError('Please select an account');
      return;
    }
    if (formData.type !== 'transfer' && !formData.category) {
      setError('Please select a category');
      return;
    }
    if (formData.type === 'transfer' && !toAccount) {
      setError('Please select a destination account');
      return;
    }

    const transactionData: TransactionFormData = {
      ...formData,
      toAccount: formData.type === 'transfer' ? toAccount : undefined,
    };

    setSaving(true);
    if (typeof onSave === 'function') {
      try {
        await onSave(transactionData);
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message || 'Failed to save transaction');
        // eslint-disable-next-line no-console
        console.error('onSave handler threw an error', err);
        setSaving(false);
        return;
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn('AddTransactionModal: onSave handler not provided, transaction not persisted', transactionData);
    }
    setSaving(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      account: '',
      notes: '',
      date: new Date(),
    });
    setToAccount('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="size-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Type Toggle */}
          <TransactionTypeToggle
            value={formData.type}
            onChange={(type) => setFormData({ ...formData, type, category: '' })}
          />

          {/* Amount Input */}
          <AmountInput
            value={formData.amount}
            onChange={(amount) => setFormData({ ...formData, amount })}
          />

          {/* Category Selector */}
          {formData.type !== 'transfer' && (
            <CategorySelector
              categories={categories}
              selectedCategory={formData.category}
              onSelect={(categoryId) => setFormData({ ...formData, category: categoryId })}
            />
          )}

          {/* Account Selector */}
          {formData.type === 'transfer' ? (
            <>
              <AccountSelector
                accounts={selectorAccounts as any}
                selectedAccount={formData.account}
                onSelect={(accountId) => setFormData({ ...formData, account: accountId })}
                label="From Account"
              />
              <AccountSelector
                accounts={selectorAccounts.filter((acc: any) => acc.id !== formData.account) as any}
                selectedAccount={toAccount}
                onSelect={(accountId) => setToAccount(accountId)}
                label="To Account"
              />
            </>
          ) : (
            <AccountSelector
              accounts={selectorAccounts as any}
              selectedAccount={formData.account}
              onSelect={(accountId) => setFormData({ ...formData, account: accountId })}
            />
          )}

          {/* Date Picker */}
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
          />

          {/* Notes Input */}
          <NotesInput
            value={formData.notes}
            onChange={(notes) => setFormData({ ...formData, notes })}
          />

          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
