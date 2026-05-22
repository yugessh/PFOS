'use client';

import { useState, useMemo } from 'react';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { AddAccountModal } from '@/src/components/accounts/AddAccountModal';
import { TransactionFormData } from '@/src/components/transactions/types';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';
import { UpcomingPaymentsWidget } from '@/src/components/dashboard/UpcomingPaymentsWidget';
import { DocumentVaultSummaryCard } from '@/src/components/documents/DocumentVaultSummaryCard';
import { EmptyFinanceState } from '@/src/components/EmptyFinanceState';
import { EmptyAccountsState } from '@/src/components/accounts/EmptyAccountsState';
import { CompactHeader } from '@/components/compact-header';
import { CompactTransactionFeed } from '@/components/compact-transaction-feed';
import { FloatingActionButton } from '@/components/floating-action-button';
import { UniversalActionsSheet } from '@/components/universal-actions-sheet';
import { DashboardManager } from '@/components/dashboard-manager';
import { NotificationCenter } from '@/src/components/notifications/NotificationCenter';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingState } from '@/components/states/LoadingState';
import type { Account } from '@/src/services/firestore/accounts.service';

export default function Dashboard() {
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addActionsOpen, setAddActionsOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { accounts, loading: accountsLoading, addAccount, error: accountsError, refresh: refreshAccounts } = useAccounts();
  const {
    transactions,
    addTransaction,
    getTotals,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransactions();

  const { income: totalIncome, expenses: totalExpenses } = getTotals();
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const currentMonthTransactions = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === year && txDate.getMonth() === month;
    });
  }, [transactions, currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });

  if (accountsLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
        <LoadingState type="dashboard" className="mx-auto max-w-6xl" />
      </div>
    );
  }

  if (accountsError || transactionsError) {
    return (
      <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
        <ErrorState
          title="Unable to load your dashboard"
          description={
            accountsError || transactionsError ||
            'We could not load your accounts or transactions. Please try again.'
          }
          retryAction={
            <button
              type="button"
              onClick={() => {
                refreshAccounts?.();
              }}
              className="rounded-full bg-accent-mint px-5 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_14px_36px_rgba(126,231,199,0.24)] transition hover:brightness-95"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (accounts.length === 0 && !accountsLoading) {
    return (
      <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
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
      <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
        <EmptyFinanceState onAddTransaction={() => setAddActionsOpen(true)} />
        <UniversalActionsSheet
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
    <div className="min-h-screen bg-main pb-24 animate-in fade-in duration-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        {/* New customizable dashboard manager (widgets, library, persistence) */}
        {/* Do not remove existing modals/controls below — only replace the main dashboard grid with the manager. */}
        {/* eslint-disable-next-line @next/next/no-server-import-in-page */}
        {/* Render DashboardManager client component */}
        {/* Imported dynamically from components */}
        <div id="pfos-dashboard-manager-root">
          {/* DashboardManager loads client-side and manages widgets */}
          {/* eslint-disable-next-line react/jsx-no-undef */}
          {/* @ts-ignore */}
          <DashboardManager />
        </div>
      </div>

      <FloatingActionButton onClick={() => setAddActionsOpen(true)} />

      <UniversalActionsSheet
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
