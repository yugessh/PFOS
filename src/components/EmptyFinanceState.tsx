'use client';

import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyFinanceStateProps {
  onAddTransaction?: () => void;
}

export function EmptyFinanceState({ onAddTransaction }: EmptyFinanceStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Balance</p>
            <h1 className="text-3xl font-bold">₹0</h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-2 shadow-md"
            onClick={onAddTransaction}
          >
            <Plus className="size-5" />
            Add
          </Button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-xs mb-1">Income</p>
            <p className="text-lg font-semibold">₹0</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-blue-100 text-xs mb-1">Expenses</p>
            <p className="text-lg font-semibold">₹0</p>
          </div>
        </div>
      </div>

      {/* Empty State Content */}
      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to PFOS
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your finances by adding your first transaction.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Getting started:</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs mr-2 flex-shrink-0 mt-0.5">
                  1
                </span>
                Add your first income or expense
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs mr-2 flex-shrink-0 mt-0.5">
                  2
                </span>
                Categorize your spending
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs mr-2 flex-shrink-0 mt-0.5">
                  3
                </span>
                Watch your balance update in real-time
              </li>
            </ul>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={onAddTransaction}
          >
            <Plus className="size-5" />
            Add First Transaction
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Tip</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Keep track of all your income, expenses, and transfers in one place. Your balance automatically updates based on your transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
