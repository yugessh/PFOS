'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Account } from '@/src/services/firestore/accounts.service';
import {
  ACCOUNT_TYPE_OPTIONS,
  getAccountTypeIcon,
  getAccountTypeMeta,
  toCanonicalAccountType,
} from '@/src/lib/account-types';

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (account: Partial<Account>) => Promise<void> | void;
}

export function AddAccountModal({ open, onOpenChange, onSave }: AddAccountModalProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    type: 'checking',
    balance: 0,
    currency: 'INR',
    icon: getAccountTypeIcon('checking'),
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
        icon: getAccountTypeIcon('checking'),
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
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {ACCOUNT_TYPE_OPTIONS.map((typeOption) => {
                const selectedType = toCanonicalAccountType(formData.type);
                const isSelected = selectedType === typeOption.value;

                return (
                <button
                  key={typeOption.value}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      type: typeOption.value,
                      icon: typeOption.icon,
                    }));
                  }}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-900/30'
                      : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
                  }`}
                >
                  <div className="text-2xl mb-1">{typeOption.icon}</div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    {typeOption.label}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                    {typeOption.description}
                  </div>
                </button>
                );
              })}
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

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Selected Type</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {getAccountTypeMeta(formData.type).icon} {getAccountTypeMeta(formData.type).label}
            </p>
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
