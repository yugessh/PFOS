'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AppHeaderProps {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
}

export function AppHeader({
  start,
  center,
  end,
  children,
  className,
  contentClassName,
  bodyClassName,
}: AppHeaderProps) {
  return (
    <header className={cn('w-full', className)}>
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 py-3 lg:px-6',
          contentClassName
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">{start}</div>

        {center ? (
          <div className="flex min-w-0 flex-1 justify-center">{center}</div>
        ) : null}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">{end}</div>
      </div>

      {children ? <div className={bodyClassName}>{children}</div> : null}
    </header>
  );
}