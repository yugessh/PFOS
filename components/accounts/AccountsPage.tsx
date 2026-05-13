'use client';

import { useMemo, useState } from 'react';
import { AccountBalanceCard } from './AccountBalanceCard';
import { AccountCard } from './AccountCard';
import { AddAccountModal } from './AddAccountModal';
import { MOCK_ACCOUNTS } from '@/data/mock-accounts';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccountsPage() {
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [open, setOpen] = useState(false);

  const total = useMemo(() => accounts.length, [accounts]);

  function handleSave(a: typeof MOCK_ACCOUNTS[number]) {
    setAccounts((s) => [a, ...s]);
  }

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="max-w-xl mx-auto">
        <div className="space-y-4">
          <AccountBalanceCard accounts={accounts} />

          {accounts.length === 0 ? (
            <div className="space-y-3 rounded-lg border border-dashed border-border/60 p-6 text-center">
              <p className="text-sm text-muted-foreground">No accounts yet</p>
              <h3 className="text-lg font-semibold">Add your first wallet</h3>
              <p className="text-sm text-muted-foreground">Quickly add cash, bank accounts, or wallets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {accounts.map((a) => (
                <AccountCard key={a.id} account={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        aria-label="Add account"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 shadow-lg text-white sm:bottom-8 sm:right-8"
      >
        <Plus className="h-4 w-4" />
        Add
      </button>

      <AddAccountModal open={open} onOpenChange={setOpen} onSave={handleSave} />
    </main>
  );
}
