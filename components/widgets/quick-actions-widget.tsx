"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function QuickActionsWidget() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-2">
      <button onClick={() => router.push('/transactions/new')} className="rounded-[20px] bg-[#151A20] px-3 py-2 text-sm text-accent-mint">+ Add Expense</button>
      <button onClick={() => router.push('/transactions/new?type=income')} className="rounded-[20px] border border-border px-3 py-2 text-sm text-secondary">+ Add Income</button>
      <button onClick={() => router.push('/goals/new')} className="rounded-[20px] border border-border px-3 py-2 text-sm text-secondary">+ Add Goal</button>
      <button onClick={() => router.push('/investments/new')} className="rounded-[20px] border border-border px-3 py-2 text-sm text-secondary">+ Add Investment</button>
    </div>
  );
}
