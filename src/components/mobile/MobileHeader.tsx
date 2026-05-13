"use client";

import React from 'react';
import { ChevronLeft, Bell } from 'lucide-react';

interface Props {
  title?: string;
  onBack?: () => void;
}

export default function MobileHeader({ title = 'Home', onBack }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button onClick={onBack} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : null}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div>
          <button className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
