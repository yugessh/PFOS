'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type AppModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AppModalSize;
  className?: string;
  showCloseButton?: boolean;
}

const sizeClass: Record<AppModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
};

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  showCloseButton = true,
}: AppModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          'flex max-h-[min(90dvh,44rem)] flex-col gap-0 border-border/80 p-0 shadow-lg dark:border-border/60',
          sizeClass[size],
          className
        )}
      >
        <DialogHeader className="shrink-0 space-y-2 border-b border-border/60 px-5 py-4 text-left dark:border-border/50 sm:px-6 sm:py-5">
          <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-sm leading-relaxed">{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>
        {footer ? (
          <DialogFooter className="shrink-0 gap-2 border-t border-border/60 px-5 py-4 sm:px-6 sm:py-4 dark:border-border/50">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
