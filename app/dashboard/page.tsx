'use client';

import { useState, useMemo } from 'react';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { AddAccountModal } from '@/src/components/accounts/AddAccountModal';
import { TransactionFormData } from '@/src/components/transactions/types';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAccounts } from '@/src/hooks/useAccounts';
import { UpcomingPaymentsWidget } from '@/src/components/dashboard/UpcomingPaymentsWidget';
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
    <div className="min-h-screen bg-main pb-24 animate-in fade-in duration-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        <CompactHeader
          month={monthName}
          year={currentDate.getFullYear()}
          balance={totalBalance}
          income={totalIncome}
          expenses={totalExpenses}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-5">
            <div className="rounded-[32px] border border-border bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Month overview</p>
                  <h2 className="mt-3 text-2xl font-semibold text-foreground">{monthName} activity</h2>
                </div>
                <div className="flex gap-3">
                  <button onClick={handlePreviousMonth} className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated">
                    Previous
                  </button>
                  <button onClick={handleNextMonth} className="rounded-[22px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_16px_36px_rgba(126,231,199,0.24)] transition hover:brightness-95">
                    Next
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              {transactionsLoading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-accent-mint border-t-transparent" />
                </div>
              ) : currentMonthTransactions.length > 0 ? (
                <CompactTransactionFeed transactions={currentMonthTransactions} />
              ) : (
                <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-border bg-card-elevated p-8 text-center">
                  <p className="text-sm text-secondary">No transactions for {monthName} yet.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-[32px] border border-border bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Balance summary</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">${totalBalance.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <UpcomingPaymentsWidget compact />

            <div className="rounded-[32px] border border-border bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <p className="text-sm uppercase tracking-[0.32em] text-secondary">Quick actions</p>
              <div className="mt-4 grid gap-3">
                <button onClick={() => setAddActionsOpen(true)} className="rounded-[22px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95">
                  Add transaction
                </button>
                <button onClick={() => setAddAccountOpen(true)} className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated">
                  Add account
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <FloatingActionButton onClick={() => setAddActionsOpen(true)} />

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
