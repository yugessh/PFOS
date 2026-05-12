import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:py-12',
        className
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full bg-muted/80 text-muted-foreground',
          'ring-1 ring-border/60 dark:bg-muted/40 dark:ring-border/50'
        )}
        aria-hidden
      >
        {icon ?? <Inbox className="size-6 opacity-80" strokeWidth={1.75} />}
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {description != null && description !== '' ? (
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action != null ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
