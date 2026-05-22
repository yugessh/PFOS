"use client";

import React from 'react';

export default function AnalyticsCard({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-secondary">{subtitle}</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
