import { cn } from '@/lib/utils';
import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ErrorStateProps {
  title: string;
  description?: string;
  retryAction?: ReactNode;
  className?: string;
}

export function ErrorState({ title, description, retryAction, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:py-12',
        className
      )}
      role="alert"
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          'bg-destructive/10 text-destructive ring-1 ring-destructive/20',
          'dark:bg-destructive/15 dark:ring-destructive/25'
        )}
        aria-hidden
      >
        <CircleAlert className="size-6" strokeWidth={1.75} />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {description != null && description !== '' ? (
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
        ) : null}
      </div>
      {retryAction != null ? <div className="pt-1">{retryAction}</div> : null}
    </div>
  );
}
