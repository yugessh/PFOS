'use client';

import { getTotalBalance } from '@/data/mock-accounts';
import type { AccountModel } from '@/data/mock-accounts';
import { CurrencyDollar, Wallet } from 'lucide-react';

interface Props {
  accounts: AccountModel[];
  className?: string;
}

function formatMoney(value: number) {
  // value assumed smallest unit (e.g., cents); display in main currency
  const v = value / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

export function AccountBalanceCard({ accounts, className }: Props) {
  const total = getTotalBalance(accounts);

  return (
    <div className={`rounded-lg border border-border/60 bg-gradient-to-br from-white/60 to-muted/10 p-4 shadow-sm ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Total Balance</p>
          <h2 className="text-2xl font-semibold">{formatMoney(total)}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-accent/10 p-2">
            <Wallet className="w-6 h-6 text-foreground/90" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{accounts.length} accounts • Quick glance</p>
    </div>
  );
}
