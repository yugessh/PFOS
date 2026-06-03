'use client';

import { Search } from 'lucide-react';
import { openGlobalSearch } from '@/src/lib/global-search-events';

export function DashboardSearchHero() {
  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      className="mb-5 flex w-full items-center justify-between rounded-[28px] border border-border bg-card px-5 py-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.30)] transition hover:border-[#7EE7C7]/25 hover:bg-card-elevated"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-[20px] border border-border bg-[#0D141B] text-[#7EE7C7]">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Search PFOS</p>
          <p className="mt-1 text-sm text-secondary">Find accounts, transactions, budgets, reports, documents, AI coach insights, and commands.</p>
        </div>
      </div>
      <div className="hidden rounded-full border border-border bg-[#0D141B] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-secondary sm:block">
        Cmd/Ctrl K
      </div>
    </button>
  );
}
