'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppErrorProps {
  error: Error;
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-main px-4 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[28px] border border-border bg-card p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <AlertTriangle className="mx-auto mb-4 size-14 text-destructive" />
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">We hit an issue while loading the page. The team has been notified.</p>
        <div className="mt-6 space-y-3 sm:flex sm:justify-center sm:space-x-3 sm:space-y-0">
          <Button onClick={() => reset()} className="w-full sm:w-auto">
            Retry
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Home className="size-4 mr-2" /> Home
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              window.navigator.clipboard.writeText(`${error.name}: ${error.message}`);
            }}
            className="w-full sm:w-auto"
          >
            Copy error
          </Button>
        </div>
      </div>
    </div>
  );
}
