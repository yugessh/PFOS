'use client';

import { useState, useMemo } from 'react';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { AddAccountModal } from '@/src/components/accounts/AddAccountModal';
import { TransactionFormData } from '@/src/components/transactions/types';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';
import { EmptyFinanceState } from '@/src/components/EmptyFinanceState';
import { EmptyAccountsState } from '@/src/components/accounts/EmptyAccountsState';
import { CompactHeader } from '@/components/compact-header';
import { CompactTransactionFeed } from '@/components/compact-transaction-feed';
import { FloatingActionButton } from '@/components/floating-action-button';
import { AddActionsBottomSheet } from '@/components/add-actions-bottom-sheet';
import { NotificationCenter } from '@/src/components/notifications/NotificationCenter';
import type { Account } from '@/src/services/firestore/accounts.service';

export default function Dashboard() {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addActionsOpen, setAddActionsOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { accounts, loading: accountsLoading, addAccount } = useAccounts();
  const {
    transactions,
    addTransaction,
    getTotals,
    loading: transactionsLoading,
  } = useTransactions();

  const { income: totalIncome, expenses: totalExpenses } = getTotals();
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  // Filter transactions for current month
  const currentMonthTransactions = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === year && txDate.getMonth() === month;
    });
  }, [transactions, currentDate]);
  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });

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
        <EmptyFinanceState onAddTransaction={() => setAddActionsOpen(true)} />
        <AddActionsBottomSheet
          open={addActionsOpen}
          onOpenChange={setAddActionsOpen}
          onAddExpense={() => setAddTransactionOpen(true)}
          onAddIncome={() => setAddTransactionOpen(true)}
          onAddAccount={() => setAddAccountOpen(true)}
        />
        <AddTransactionModal
          open={addTransactionOpen}
          onOpenChange={setAddTransactionOpen}
          onSave={(tx: TransactionFormData) => {
            addTransaction(tx);
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24 animate-in fade-in duration-300">
      {/* Compact Header */}
      <CompactHeader
        month={monthName}
        year={currentDate.getFullYear()}
        balance={totalBalance}
        income={totalIncome}
        expenses={totalExpenses}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Transaction Feed */}
      <div className="space-y-4 py-4">
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : currentMonthTransactions.length > 0 ? (
          <CompactTransactionFeed transactions={currentMonthTransactions} />
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center px-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No transactions for {monthName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setAddActionsOpen(true)} />

      {/* Modals and Sheets */}
      <AddActionsBottomSheet
        open={addActionsOpen}
        onOpenChange={setAddActionsOpen}
        onAddExpense={() => setAddTransactionOpen(true)}
        onAddIncome={() => setAddTransactionOpen(true)}
        onAddAccount={() => setAddAccountOpen(true)}
      />

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

      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
      />
    </div>
  );
}
