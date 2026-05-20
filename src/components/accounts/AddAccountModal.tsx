'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { getAccountTypeMeta, ACCOUNT_TYPE_OPTIONS } from '@/src/lib/account-types';
import { formatCurrency } from '@/src/lib/currency';
import type { Account } from '@/src/services/firestore/accounts.service';

type Mode = 'add' | 'edit';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (accountData: Partial<Account>) => Promise<void> | void;
  account?: Partial<Account> | null;
  mode?: Mode;
}

const currencyOptions = ['INR', 'USD', 'EUR', 'GBP'];

const defaultColorByType: Record<string, string> = {
  bank_account: '#7EE7C7',
  cash: '#B9F5D8',
  upi_wallet: '#5DE2C5',
  credit_card: '#7EA8FF',
  savings_account: '#82E6A0',
  investment_account: '#9AE6B4',
  crypto_wallet: '#62DDBA',
  custom_account: '#A3F7D8',
};

function formatAmountInput(value: number | undefined) {
  if (value == null || Number.isNaN(value)) return '0';
  return `${Math.round(value * 100) / 100}`;
}

export function AddAccountModal({ open, onOpenChange, onSave, account, mode = account?.id ? 'edit' : 'add' }: Props) {
  const isMobile = useIsMobile();

  const initialType = useMemo(() => account?.accountType || account?.type || 'bank_account', [account?.accountType, account?.type]);
  const initialMeta = useMemo(() => getAccountTypeMeta(initialType), [initialType]);

  const [name, setName] = useState(account?.name || account?.accountName || '');
  const [accountType, setAccountType] = useState(initialType);
  const [currentBalance, setCurrentBalance] = useState(formatAmountInput(account?.currentBalance ?? account?.balance ?? 0));
  const [currency, setCurrency] = useState(account?.currency || 'INR');
  const [color, setColor] = useState(account?.color || defaultColorByType[initialType] || '#7EE7C7');
  const [icon, setIcon] = useState(account?.icon || initialMeta.icon);
  const [monthlyInflow, setMonthlyInflow] = useState(formatAmountInput(account?.monthlyInflow ?? 0));
  const [monthlyOutflow, setMonthlyOutflow] = useState(formatAmountInput(account?.monthlyOutflow ?? 0));
  const [lastTransaction, setLastTransaction] = useState(account?.lastTransaction || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const nextType = account?.accountType || account?.type || 'bank_account';
    const nextMeta = getAccountTypeMeta(nextType);
    setName(account?.name || account?.accountName || '');
    setAccountType(nextType);
    setCurrentBalance(formatAmountInput(account?.currentBalance ?? account?.balance ?? 0));
    setCurrency(account?.currency || 'INR');
    setColor(account?.color || defaultColorByType[nextType] || '#7EE7C7');
    setIcon(account?.icon || nextMeta.icon);
    setMonthlyInflow(formatAmountInput(account?.monthlyInflow ?? 0));
    setMonthlyOutflow(formatAmountInput(account?.monthlyOutflow ?? 0));
    setLastTransaction(account?.lastTransaction || '');
  }, [account, open]);

  async function handleSubmit() {
    setSaving(true);
    try {
      setError(null);
      await onSave({
        id: account?.id,
        name: name.trim() || getAccountTypeMeta(accountType).label,
        accountName: name.trim() || getAccountTypeMeta(accountType).label,
        accountType,
        type: accountType,
        currentBalance: Number(currentBalance || 0),
        balance: Number(currentBalance || 0),
        currency,
        color,
        icon,
        monthlyInflow: Number(monthlyInflow || 0),
        monthlyOutflow: Number(monthlyOutflow || 0),
        lastTransaction: lastTransaction.trim() || null,
        isActive: account?.isActive ?? true,
        isDefault: account?.isDefault ?? false,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  }

  const content = (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Account name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SBI Bank" />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Account type</span>
          <select
            value={accountType}
            onChange={(e) => {
              const nextType = e.target.value as typeof accountType;
              setAccountType(nextType);
              setColor((current) => current || defaultColorByType[nextType] || '#7EE7C7');
              setIcon(getAccountTypeMeta(nextType).icon);
            }}
            className="input-surface h-11 w-full"
          >
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Current balance</span>
          <Input value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} inputMode="decimal" placeholder="52400" />
          <p className="text-[11px] text-muted-foreground">Preview: {formatCurrency(currentBalance || 0, currency as any)}</p>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Currency</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-surface h-11 w-full">
            {currencyOptions.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Monthly inflow</span>
          <Input value={monthlyInflow} onChange={(e) => setMonthlyInflow(e.target.value)} inputMode="decimal" placeholder="10000" />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Monthly outflow</span>
          <Input value={monthlyOutflow} onChange={(e) => setMonthlyOutflow(e.target.value)} inputMode="decimal" placeholder="2300" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_120px_1fr]">
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Last transaction</span>
          <Input value={lastTransaction} onChange={(e) => setLastTransaction(e.target.value)} placeholder="Transfer from Cash" />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Icon</span>
          <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🏦" />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Accent color</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-11 w-full cursor-pointer rounded-[20px] border border-border/60 bg-card-elevated p-1"
          />
        </label>
      </div>

      {error ? <p className="rounded-[20px] border border-[#FF6B6B]/25 bg-[#FF6B6B]/10 px-4 py-3 text-sm text-[#FFB1B1]">{error}</p> : null}
    </div>
  );

  if (!open) return null;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="border-border/60 px-5 pb-6 pt-4 sm:max-w-none">
          <SheetHeader className="px-0 pt-2 text-left">
            <SheetTitle>{mode === 'edit' ? 'Edit Account' : 'Add Account'}</SheetTitle>
            <SheetDescription>
              Keep your money sources organized across cash, bank, wallets, and investments.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">{content}</div>
          <SheetFooter className="px-0 pb-0 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" onClick={() => void handleSubmit()} disabled={saving}>
                {mode === 'edit' ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-border/60 px-0 py-0">
        <DialogHeader className="border-b border-border/60 px-6 py-5 text-left">
          <DialogTitle>{mode === 'edit' ? 'Edit Account' : 'Add Account'}</DialogTitle>
          <DialogDescription>
            Keep your money sources organized across cash, bank, wallets, and investments.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{content}</div>
        <DialogFooter className="border-t border-border/60 px-6 py-5">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={saving}>
              {mode === 'edit' ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}