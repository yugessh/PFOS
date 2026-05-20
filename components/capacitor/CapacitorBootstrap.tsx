'use client'

import { useEffect } from 'react'
import { getBridge, initNativeBridge } from '../../src/native'

export default function CapacitorBootstrap() {
  useEffect(() => {
    let removeBackButton: (() => void) | undefined

    async function bootstrap() {
      await initNativeBridge()
      const bridge = getBridge()

      await bridge.init?.()
      await bridge.setStatusBarColor?.('#080A0F', 'LIGHT')
      removeBackButton = bridge.addBackButtonListener?.(() => {
        if (window.history.length > 1) {
          window.history.back()
        }
      })
    }

    bootstrap().catch(() => {})

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration is optional for web/PWA installs
      })
    }

    return () => {
      removeBackButton?.()
    }
  }, [])

  return null
}
