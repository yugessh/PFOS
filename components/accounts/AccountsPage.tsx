'use client';

import { useMemo, useState } from 'react';
import { AccountBalanceCard } from './AccountBalanceCard';
import { AccountCard } from './AccountCard';
import { AddAccountModal } from './AddAccountModal';
import { Plus } from 'lucide-react';
import { useAccounts } from '@/src/hooks/useAccounts';

export function AccountsPage() {
  const { accounts, loading, error, addAccount } = useAccounts();
  const [open, setOpen] = useState(false);

  const total = useMemo(() => accounts.length, [accounts]);

  async function handleSave(a: any) {
    try {
      await addAccount(a);
    } catch (err) {
      // error already handled in hook; could show a toast here
      console.error('Failed to create account', err);
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="max-w-xl mx-auto">
        <div className="space-y-4">
          <AccountBalanceCard accounts={accounts} />

          {loading ? (
            <div className="space-y-3 rounded-lg border border-dashed border-border/60 p-6 text-center">Loading accounts…</div>
          ) : accounts.length === 0 ? (
            <div className="space-y-3 rounded-lg border border-dashed border-border/60 p-6 text-center">
              <p className="text-sm text-muted-foreground">No accounts yet</p>
              <h3 className="text-lg font-semibold">Add your first wallet</h3>
              <p className="text-sm text-muted-foreground">Quickly add cash, bank accounts, or wallets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {accounts.map((a: any) => (
                <AccountCard key={a.id} account={a} />
              ))}
            </div>
          )}

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
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
