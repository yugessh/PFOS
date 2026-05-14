'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccounts } from '@/src/hooks/useAccounts';
import { AddAccountModal } from '@/src/components/accounts/AddAccountModal';
import { EmptyAccountsState } from '@/src/components/accounts/EmptyAccountsState';
import { formatCurrency } from '@/src/lib/currency';
import { getAccountTypeLabel, getAccountTypeIcon } from '@/src/lib/account-types';
import type { Account } from '@/src/services/firestore/accounts.service';

export default function AccountsPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { accounts, loading, error, addAccount } = useAccounts();

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

  if (!loading && accounts.length === 0) {
    return (
      <div>
        <EmptyAccountsState onAddAccount={() => setAddOpen(true)} />
        <AddAccountModal
          open={addOpen}
          onOpenChange={setAddOpen}
          onSave={async (accountData: Partial<Account>) => {
            await addAccount(accountData);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Account Balance</p>
            <h1 className="text-3xl font-bold">{formatCurrency(totalBalance)}</h1>
          </div>
          <Button
            type="button"
            size="sm"
            className="bg-white text-blue-600 hover:bg-blue-50 gap-2 shadow-md"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading accounts...</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{account.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getAccountTypeIcon(account.type)} {getAccountTypeLabel(account.type)} • {account.currency || 'INR'}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          ))
        )}

        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <AddAccountModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={async (accountData: Partial<Account>) => {
          await addAccount(accountData);
        }}
      />
    </div>
  );
}
