'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Account } from '@/src/services/firestore/accounts.service';

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (account: Partial<Account>) => Promise<void> | void;
}

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account', icon: '🏦' },
  { value: 'savings', label: 'Savings Account', icon: '🏪' },
  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'loan', label: 'Loan', icon: '💰' },
] as const;

export function AddAccountModal({ open, onOpenChange, onSave }: AddAccountModalProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    type: 'checking',
    balance: 0,
    currency: 'INR',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    // Validate form
    if (!formData.name?.trim()) {
      setError('Account name is required');
      return;
    }

    if (!formData.type) {
      setError('Account type is required');
      return;
    }

    setSaving(true);
    try {
      // Debug: log form data before save
      try {
        // eslint-disable-next-line no-console
        console.debug('AddAccountModal.handleSave formData=', formData);
      } catch (_) {}
      if (typeof onSave === 'function') {
        await onSave(formData);
      } else {
        console.warn('AddAccountModal: onSave handler not provided');
      }
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        type: 'checking',
        balance: 0,
        currency: 'INR',
        isActive: true,
      });
    } catch (err: any) {
      const message = err?.message || String(err);
      if (message.includes('Permission denied') || message.includes('permission')) {
        setError('Permission denied. Try signing out and signing back in, then try again.');
      } else {
        setError(message || 'Failed to create account');
      }
      console.error('Failed to create account:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Account</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="size-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., My Bank Account"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: type.value as any }))
                  }
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Starting Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Starting Balance (₹)
            </label>
            <input
              type="number"
              value={formData.balance || 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  balance: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={formData.currency || 'INR'}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">₹ Indian Rupee</option>
              <option value="USD">$ US Dollar</option>
              <option value="EUR">€ Euro</option>
              <option value="GBP">£ British Pound</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </div>
    </div>
  );
}
