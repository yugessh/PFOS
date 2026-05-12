'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Here are some helpful links to get you back on track:
          </p>
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <Home size={18} />
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            Error Code: <span className="font-mono font-bold">404</span>
          </p>
        </div>
      </div>
    </div>
  );
}
