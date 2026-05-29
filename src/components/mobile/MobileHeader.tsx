"use client";

import React from 'react';
import { ChevronLeft, Bell } from 'lucide-react';
import { AppHeader } from '@/src/components/layout/AppHeader';

interface Props {
  title?: string;
  onBack?: () => void;
}

export default function MobileHeader({ title = 'Home', onBack }: Props) {
  return (
    <AppHeader
      className="sticky top-0 z-30 border-b border-border bg-bg-main sm:hidden"
      contentClassName="px-4 py-3"
      start={
        <>
          {onBack ? (
            <button onClick={onBack} className="rounded-full border border-border bg-card p-2">
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          <h1 className="text-sm font-semibold uppercase tracking-[0.28em]">{title}</h1>
        </>
      }
      end={
        <button className="rounded-full border border-border bg-card p-2">
          <Bell className="h-4 w-4" />
        </button>
      }
    />
  );
}
