'use client';

import { Account } from './types';
import { formatCurrency } from '@/src/lib/currency';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: string | null;
  onSelect: (accountId: string) => void;
  label?: string;
}

export function AccountSelector({ accounts, selectedAccount, onSelect, label = 'Account' }: AccountSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
      <div className="space-y-2">
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            onClick={() => onSelect(account.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
              selectedAccount === account.id
                ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-3xl">{account.icon}</span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 dark:text-white">{account.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{account.type}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${account.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(account.balance)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
