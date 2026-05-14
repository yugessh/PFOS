'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { AddAccountModal } from '@/src/components/accounts/AddAccountModal';
import { TransactionFormData } from '@/src/components/transactions/types';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useBudgets } from '@/src/hooks/useBudgets';
import { EmptyFinanceState } from '@/src/components/EmptyFinanceState';
import { EmptyAccountsState } from '@/src/components/accounts/EmptyAccountsState';
import { Plus, TrendingUp, CreditCard, PiggyBank, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact, calculatePercentage } from '@/src/lib/currency';
import { getAccountTypeLabel, getAccountTypeIcon } from '@/src/lib/account-types';
import type { Account } from '@/src/services/firestore/accounts.service';

export default function Dashboard() {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);

  const { accounts, loading: accountsLoading, addAccount } = useAccounts();
  const {
    transactions,
    addTransaction,
    getTotals,
    loading: transactionsLoading,
    error: transactionsError,
    creating: transactionCreating,
  } = useTransactions();
  const { budgetSummary } = useBudgets(transactions);
  const { income: totalIncome, expenses: totalExpenses } = getTotals();
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  if (accounts.length === 0 && !accountsLoading) {
    return (
      <div>
        <EmptyAccountsState onAddAccount={() => setAddAccountOpen(true)} />
        <AddAccountModal
          open={addAccountOpen}
          onOpenChange={setAddAccountOpen}
          onSave={async (accountData: Partial<Account>) => {
            await addAccount(accountData);
          }}
        />
      </div>
    );
  }

  if (transactions.length === 0 && !transactionsLoading) {
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
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Balance</p>
            <h1 className="text-3xl font-bold">{formatCurrency(totalBalance)}</h1>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-green-300" />
              <p className="text-blue-100 text-xs">Income</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrencyCompact(totalIncome)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="size-4 text-red-300" />
              <p className="text-blue-100 text-xs">Expenses</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrencyCompact(totalExpenses)}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="size-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Budget Snapshot</h2>
            </div>
            {budgetSummary.overBudgetCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <AlertTriangle className="size-3" />
                {budgetSummary.overBudgetCount} Over
              </span>
            ) : null}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Monthly Budget</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(budgetSummary.totalRemaining)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Spent / Budget</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrencyCompact(budgetSummary.totalSpent)} / {formatCurrencyCompact(budgetSummary.totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="size-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Savings Rate</h2>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatePercentage(totalIncome - totalExpenses, totalIncome, 0)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">of income saved</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">saved this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Your Accounts</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400"
              onClick={() => setAddAccountOpen(true)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {getAccountTypeIcon(account.type)} {getAccountTypeLabel(account.type)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
              See All
            </Button>
          </div>
          {transactionsLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          ) : transactionCreating ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm">Saving transaction...</p>
            </div>
          ) : transactionsError ? (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm">{transactionsError}</p>
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

      <AddTransactionModal
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        onSave={async (tx: TransactionFormData) => {
          await addTransaction(tx);
        }}
      />

      <AddAccountModal
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        onSave={async (accountData: Partial<Account>) => {
          await addAccount(accountData);
        }}
      />
    </div>
  );
}
