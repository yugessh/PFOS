'use client';

import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyFinanceStateProps {
  onAddTransaction?: () => void;
}

export function EmptyFinanceState({ onAddTransaction }: EmptyFinanceStateProps) {
  return (
    <div className="min-h-screen bg-main pb-24">
      {/* Mobile Header */}
      <div className="bg-[linear-gradient(180deg,rgba(21,26,32,0.98),rgba(8,10,15,0.96))] text-white px-4 pt-6 pb-8 rounded-b-[34px] border-b border-border shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-secondary text-sm mb-1">Total Balance</p>
            <h1 className="text-3xl font-bold">₹0</h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="button-primary gap-2"
            onClick={onAddTransaction}
          >
            <Plus className="size-5" />
            Add
          </Button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-white/6 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-secondary text-xs mb-1">Income</p>
            <p className="text-lg font-semibold">₹0</p>
          </div>
          <div className="rounded-[24px] border border-white/6 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-secondary text-xs mb-1">Expenses</p>
            <p className="text-lg font-semibold">₹0</p>
          </div>
        </div>
      </div>

      {/* Empty State Content */}
      <div className="px-4 -mt-4 space-y-4">
        <div className="card-surface text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full border border-[rgba(126,231,199,0.18)] bg-[rgba(126,231,199,0.08)] p-4">
              <Wallet className="w-8 h-8 text-accent-mint" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to PFOS
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your finances by adding your first transaction.
          </p>

          <div className="rounded-[24px] border border-white/6 bg-white/5 p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Getting started:</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent-mint text-[#071a0d] text-xs mr-2 flex-shrink-0 mt-0.5">
                  1
                </span>
                Add your first income or expense
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent-mint text-[#071a0d] text-xs mr-2 flex-shrink-0 mt-0.5">
                  2
                </span>
                Categorize your spending
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent-mint text-[#071a0d] text-xs mr-2 flex-shrink-0 mt-0.5">
                  3
                </span>
                Watch your balance update in real-time
              </li>
            </ul>
          </div>

          <Button
            type="button"
            size="lg"
            className="button-primary w-full gap-2"
            onClick={onAddTransaction}
          >
            <Plus className="size-5" />
            Add First Transaction
          </Button>
        </div>

        <div className="card-surface">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Tip</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Keep track of all your income, expenses, and transfers in one place. Your balance automatically updates based on your transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
