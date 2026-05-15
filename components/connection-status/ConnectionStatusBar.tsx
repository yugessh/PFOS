'use client'

import * as React from 'react';
import { useConnectionStatus } from '@/src/hooks/use-connection';

export default function ConnectionStatusBar() {
  const { state, pending } = useConnectionStatus();

  const color = state === 'online' ? 'bg-emerald-500/20 text-emerald-300' : state === 'syncing' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-700/20 text-gray-400';

  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-medium ${color}`} aria-hidden>
      <span className="w-2 h-2 rounded-full" style={{ background: state === 'online' ? 'var(--accent-mint)' : state === 'syncing' ? '#F6A600' : '#6B7280' }} />
      <span>{state === 'online' ? 'Online' : state === 'syncing' ? `Syncing (${pending})` : 'Offline'}</span>
    </div>
  );
}
