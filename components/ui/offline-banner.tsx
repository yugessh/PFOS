import { CloudOff, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface OfflineBannerProps {
  isOffline: boolean
}

export function OfflineBanner({ isOffline }: OfflineBannerProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 top-16 z-[100] mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-[28px] border border-border/80 bg-[#12151B]/95 px-4 py-3 text-sm text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl',
        isOffline ? 'border-destructive/50 bg-[#120B11]' : 'border-accent-mint/40 bg-[#0A120D]'
      )}
    >
      <div className="flex items-center gap-3">
        {isOffline ? (
          <CloudOff className="size-5 text-destructive" />
        ) : (
          <Wifi className="size-5 text-accent-mint" />
        )}
        <div className="space-y-0.5 text-left">
          <p className="font-semibold text-white">
            {isOffline ? 'Offline mode active' : 'Connection restored'}
          </p>
          <p className="text-xs text-muted-foreground max-w-xl">
            {isOffline
              ? 'Some features are unavailable without network. Your activity will resume when the connection returns.'
              : 'You are back online. Loading may continue automatically.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!isOffline) {
            toast({
              title: 'Online',
              description: 'Internet access has been restored.',
              variant: 'default',
            })
          }
        }}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
      >
        {isOffline ? 'Waiting' : 'Great'}
      </button>
    </div>
  )
}
