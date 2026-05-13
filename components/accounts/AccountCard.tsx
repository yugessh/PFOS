'use client';

import type { AccountModel } from '@/data/mock-accounts';
import { CreditCard, Wallet, DollarSign, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  account: AccountModel;
  onClick?: () => void;
}

function getIcon(type: string) {
  switch (type) {
    case 'Bank Account':
      return <Wallet className="w-5 h-5" />;
    case 'Credit Card':
      return <CreditCard className="w-5 h-5" />;
    case 'Trading Account':
      return <Activity className="w-5 h-5" />;
    case 'Crypto Wallet':
      return <DollarSign className="w-5 h-5" />;
    default:
      return <Wallet className="w-5 h-5" />;
  }
}

function formatShort(value: number) {
  const v = value / 100; // convert cents
  if (Math.abs(v) >= 1_000_000) return `₹${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `₹${(v / 1_000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
}

export function AccountCard({ account, onClick }: Props) {
  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative flex h-28 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border bg-gradient-to-br p-4 text-left shadow-sm transition-transform hover:scale-[1.01] sm:h-32',
        account.color ? '' : 'from-white to-muted/5'
      )}
      style={account.color ? { background: `linear-gradient(135deg, ${account.color}22, ${account.color}11)` } : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{account.name}</p>
          <h3 className="mt-1 text-lg font-semibold">{formatShort(account.balance)}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-white/20 p-2 text-white/95">{getIcon(account.type)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-3 w-3 rounded-full" style={{ background: account.color ?? '#CBD5E1' }} />
          {account.type}
        </span>
        <span className="text-xs text-muted-foreground">Quick access</span>
      </div>
    </article>
  );
}
