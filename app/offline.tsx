import Link from 'next/link';
import { CloudOff, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-main px-4 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[28px] border border-border bg-card p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <CloudOff className="mx-auto mb-4 size-14 text-accent-mint" />
        <h1 className="text-4xl font-bold">You’re offline</h1>
        <p className="mt-3 text-sm text-muted-foreground">PFOS needs an internet connection to sync your finance data. Reconnect to continue using the platform.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Link href="/" className="text-center">
            <Button variant="secondary" className="w-full">
              <Home className="size-4 mr-2" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
