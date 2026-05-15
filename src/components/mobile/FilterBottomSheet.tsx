'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  onApply: () => void;
  children: React.ReactNode;
}

export function FilterBottomSheet({ open, onOpenChange, onReset, onApply, children }: FilterBottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-lg max-h-[80vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">Filters</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">{children}</div>

        {/* Actions */}
        <div className="sticky bottom-0 flex gap-2 px-4 py-3 border-t bg-background">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onApply();
              onOpenChange(false);
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
