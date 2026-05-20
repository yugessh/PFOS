"use client";

import React from 'react';
import { ChevronLeft, Bell } from 'lucide-react';

interface Props {
  title?: string;
  onBack?: () => void;
}

export default function MobileHeader({ title = 'Home', onBack }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-bg-main border-b border-border px-4 py-3 sm:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={onBack} className="p-2 rounded-full bg-card border border-border">
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : null}
          <h1 className="text-sm font-semibold uppercase tracking-[0.28em]">{title}</h1>
        </div>
        <div>
          <button className="p-2 rounded-full bg-card border border-border">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
