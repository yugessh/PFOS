'use client'

import React, { useEffect } from 'react'
import { initNativeBridge } from '@/src/native'

export default function CapacitorBootstrap() {
  useEffect(() => {
    // initialize the native bridge if running inside Capacitor
    initNativeBridge().catch(() => {});

    // back button handling (Android) can be added here later
  }, [])

  return null
}
