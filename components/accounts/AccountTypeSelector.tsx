'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { AccountType } from '@/src/data/mock-accounts';

export interface AccountTypeSelectorProps {
  value: AccountType;
  onChange: (t: AccountType) => void;
  className?: string;
}

const TYPES: AccountType[] = [
  'Bank Account',
  'Cash',
  'Wallet',
  'Credit Card',
  'Trading Account',
  'Crypto Wallet',
];

export function AccountTypeSelector({ value, onChange, className }: AccountTypeSelectorProps) {
  const id = useId();

  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-6', className)}>
      {TYPES.map((t) => {
        const checked = t === value;
        return (
          <label
            key={t}
            className={cn(
              'cursor-pointer select-none rounded-md border px-2 py-2 text-center text-xs font-medium',
              checked
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-background text-foreground/90 hover:bg-accent'
            )}
          >
            <input
              id={`${id}-${t}`}
              name="account-type"
              type="radio"
              className="sr-only"
              checked={checked}
              onChange={() => onChange(t)}
            />
            {t}
          </label>
        );
      })}
    </div>
  );
}
