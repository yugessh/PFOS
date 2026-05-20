import { CloudOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from './EmptyState'

interface OfflineStateProps {
  onRetry?: () => void
}

export function OfflineState({ onRetry }: OfflineStateProps) {
  return (
    <EmptyState
      title="Offline detected"
      description="Your device is not connected to the internet. Check your connection and try again."
      icon={<CloudOff className="size-6 text-accent-mint" />}
      action={
        onRetry ? (
          <Button onClick={onRetry} size="sm" className="rounded-full px-4 py-2">
            Retry
          </Button>
        ) : null
      }
      className="max-w-xl mx-auto"
    />
  )
}
