'use client';

import { Button } from '@/components/ui/button';
import { Plus, Wallet } from 'lucide-react';

interface EmptyAccountsStateProps {
  onAddAccount: () => void;
}

export function EmptyAccountsState({ onAddAccount }: EmptyAccountsStateProps) {
  return (
    <div className="rounded-[32px] border border-border/60 bg-[linear-gradient(160deg,rgba(21,26,32,0.96),rgba(11,14,19,0.98))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-8">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <div className="flex size-24 items-center justify-center rounded-[30px] border border-[#7EE7C7]/20 bg-[#7EE7C7]/10 shadow-[0_18px_42px_rgba(126,231,199,0.12)]">
          <Wallet className="size-12 text-[#7EE7C7]" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-white">No accounts added yet</h2>
          <p className="max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">
            Create your first bank, wallet, or investment account to start tracking balances, transfers, and financial flow in one place.
          </p>
        </div>

        <div className="grid w-full gap-3 rounded-[28px] border border-border/60 bg-card-elevated/70 p-5 text-left sm:grid-cols-3">
          {[
            { title: 'Add account', copy: 'Set up every money source you use.' },
            { title: 'Move money', copy: 'Transfer between accounts with one tap.' },
            { title: 'Track flow', copy: 'See inflow, outflow, and latest activity.' },
          ].map((item, index) => (
            <div key={item.title} className="space-y-2 rounded-[24px] border border-border/50 bg-black/10 p-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#7EE7C7]/10 text-xs font-semibold text-[#B9F5D8]">
                {index + 1}
              </div>
              <p className="font-medium text-white">{item.title}</p>
              <p className="text-xs leading-relaxed text-white/50">{item.copy}</p>
            </div>
          ))}
        </div>

        <Button onClick={onAddAccount} className="h-12 w-full rounded-full bg-[#7EE7C7] px-6 font-semibold text-[#04140F] hover:bg-[#90ead1] sm:w-auto">
          <Plus className="size-4" />
          + Add Account
        </Button>
      </div>
    </div>
  );
}