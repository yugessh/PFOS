'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { TransactionFormData } from '@/src/components/transactions/types';
import { useTransactions } from '@/src/hooks/useTransactions';
import { EmptyFinanceState } from '@/src/components/EmptyFinanceState';
import { Wallet, TrendingUp, CreditCard, Plus, PiggyBank } from 'lucide-react';

export default function Dashboard() {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const { transactions, addTransaction, getTotals, loading, error } = useTransactions();

  // Calculate summary metrics from real transactions
  const { income: totalIncome, expenses: totalExpenses } = getTotals();
  const totalBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // If no transactions, show onboarding empty state
  if (transactions.length === 0) {
    return (
      <div>
        <EmptyFinanceState onAddTransaction={() => setAddTransactionOpen(true)} />
        <AddTransactionModal
          open={addTransactionOpen}
          onOpenChange={setAddTransactionOpen}
          onSave={(tx: TransactionFormData) => {
            addTransaction(tx);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Mobile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Balance</p>
            <h1 className="text-3xl font-bold">₹{(totalBalance / 100000).toFixed(2)}L</h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-2 shadow-md"
            onClick={() => setAddTransactionOpen(true)}
          >
            <Plus className="size-5" />
            Add
          </Button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-green-300" />
              <p className="text-blue-100 text-xs">Income</p>
            </div>
            <p className="text-lg font-semibold">₹{(totalIncome / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="size-4 text-red-300" />
              <p className="text-blue-100 text-xs">Expenses</p>
            </div>
            <p className="text-lg font-semibold">₹{(totalExpenses / 1000).toFixed(1)}K</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Savings Insight Widget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="size-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Savings Rate</h2>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{savingsRate.toFixed(0)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">of income saved</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ₹{((totalIncome - totalExpenses) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">saved this month</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
              See All
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <RecentTransactionsTable transactions={transactions} limit={5} />
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        onSave={(tx: TransactionFormData) => {
          addTransaction(tx);
        }}
      />
    </div>
  );
}
