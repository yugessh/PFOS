'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useTransactions } from '@/src/hooks/useTransactions';
import { formatCurrency } from '@/src/lib/currency';
import type { Account } from '@/src/services/firestore/accounts.service';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFromAccountId?: string;
  onSuccess?: () => void | Promise<void>;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function TransferModal({ open, onOpenChange, defaultFromAccountId, onSuccess }: Props) {
  const isMobile = useIsMobile();
  const { accounts } = useAccounts();
  const { addTransaction, creating } = useTransactions();

  const activeAccounts = useMemo(() => accounts.filter((account) => account.isActive !== false), [accounts]);

  const [fromAccountId, setFromAccountId] = useState(defaultFromAccountId || activeAccounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(activeAccounts[1]?.id || '');
  const [amount, setAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFromAccountId(defaultFromAccountId || activeAccounts[0]?.id || '');
    setToAccountId(activeAccounts.find((account) => account.id !== (defaultFromAccountId || activeAccounts[0]?.id || ''))?.id || '');
    setAmount('0');
    setNotes('');
    setDate(formatDateInput(new Date()));
    setError(null);
  }, [activeAccounts, defaultFromAccountId, open]);

  const fromAccount = activeAccounts.find((account) => account.id === fromAccountId);
  const toAccount = activeAccounts.find((account) => account.id === toAccountId);

  async function handleSubmit() {
    const numericAmount = Number(amount || 0);
    if (!fromAccountId || !toAccountId) {
      setError('Select both accounts');
      return;
    }
    if (fromAccountId === toAccountId) {
      setError('Cannot transfer to the same account');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid transfer amount');
      return;
    }
    if ((fromAccount?.currentBalance ?? fromAccount?.balance ?? 0) < numericAmount) {
      setError('Cannot transfer more than the available balance');
      return;
    }

    setError(null);
    try {
      await addTransaction({
        type: 'transfer',
        amount: numericAmount,
        category: 'transfer',
        account: fromAccountId,
        toAccount: toAccountId,
        notes: notes.trim() || `Transfer to ${toAccount?.name || 'account'}`,
        date: new Date(date),
      });

      onOpenChange(false);
      await onSuccess?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to transfer funds');
    }
  }

  const content = (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">From account</span>
          <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} className="input-surface h-11 w-full">
            <option value="">Select source</option>
            {activeAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({formatCurrency(account.currentBalance ?? account.balance ?? 0, account.currency as any)})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">To account</span>
          <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="input-surface h-11 w-full">
            <option value="">Select destination</option>
            {activeAccounts
              .filter((account) => account.id !== fromAccountId)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.currentBalance ?? account.balance ?? 0, account.currency as any)})
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Amount</span>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="500" />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Date</span>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label className="space-y-2 block">
        <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Notes</span>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cash to UPI balance" />
      </label>

      {error ? <p className="rounded-[20px] border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FFB1B1]">{error}</p> : null}

      {fromAccount && toAccount ? (
        <div className="rounded-[24px] border border-border/60 bg-card-elevated/80 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Preview</p>
          <p className="mt-1">
            {fromAccount.name} → {toAccount.name} {formatCurrency(Number(amount || 0), fromAccount.currency as any)}
          </p>
        </div>
      ) : null}
    </div>
  );

  if (!open) return null;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="border-border/60 px-5 pb-6 pt-4 sm:max-w-none">
          <SheetHeader className="px-0 pt-2 text-left">
            <SheetTitle>Transfer Money</SheetTitle>
            <SheetDescription>
              Move money between your accounts and automatically sync the transaction history.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">{content}</div>
          <SheetFooter className="px-0 pb-0 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={creating}>
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={() => void handleSubmit()} disabled={creating}>
                {creating ? 'Transferring...' : 'Transfer'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-border/60 px-0 py-0">
        <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
          <DialogTitle>Transfer Money</DialogTitle>
          <DialogDescription>
            Move money between your accounts and automatically sync the transaction history.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{content}</div>
        <DialogFooter className="border-t border-border/60 px-6 py-5">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={creating}>
              {creating ? 'Transferring...' : 'Transfer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}