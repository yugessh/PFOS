import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section
      className={cn(
        'space-y-4 rounded-lg border border-border/70 bg-muted/10 p-4 dark:border-border/50 dark:bg-muted/15 sm:p-5',
        className
      )}
    >
      {(title != null || description != null) && (
        <header className="space-y-1">
          {title != null ? (
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          ) : null}
          {description != null ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
