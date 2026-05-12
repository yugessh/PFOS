'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface FormActionsProps {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  /** Associate the submit control with a `<form id="...">` rendered elsewhere (e.g. modal body + footer). */
  form?: string;
}

export function FormActions({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  loading = false,
  disabled = false,
  className,
  form,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2',
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="sm:min-w-24"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        form={form}
        size="sm"
        className="sm:min-w-28"
        disabled={disabled || loading}
      >
        {loading ? <Spinner className="size-4" /> : null}
        {submitLabel}
      </Button>
    </div>
  );
}
