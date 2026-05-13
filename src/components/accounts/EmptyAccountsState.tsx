'use client';

import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';

interface EmptyAccountsStateProps {
  onAddAccount: () => void;
}

export function EmptyAccountsState({ onAddAccount }: EmptyAccountsStateProps) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 py-12">
      {/* Hero Section */}
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-3xl flex items-center justify-center">
            <Wallet className="size-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            No Accounts Yet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your first bank account to start tracking transactions and managing your finances
          </p>
        </div>

        {/* Getting Started Steps */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4 text-left">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Getting Started
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Add your first account
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Bank account, credit card, or savings
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Create transactions
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Log income and expenses
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Watch your balance grow
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Real-time balance updates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onAddAccount}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold gap-2"
        >
          <Plus className="size-5" />
          Add Your First Account
        </Button>
      </div>
    </div>
  );
}
