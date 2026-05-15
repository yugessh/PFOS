'use client'

import * as React from 'react'
import { useConnectionStatus } from '@/src/hooks/use-connection'

export function SyncBadge() {
  const { pending } = useConnectionStatus()
  if (pending === 0) return null
  return (
    <div className="inline-flex items-center justify-center rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
      {pending} pending
    </div>
  )
}

export default SyncBadge
