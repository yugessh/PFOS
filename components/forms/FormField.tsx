'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
  /** When set, used for the label `htmlFor` and control `id` instead of auto-generated ids */
  controlId?: string;
}

type ControlProps = {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
};

function mergeControl(
  child: ReactElement<ControlProps>,
  controlId: string,
  error: boolean,
  required: boolean,
  describedBy?: string
) {
  const existing = (child.props['aria-describedby'] ?? '')
    .split(/\s+/)
    .filter(Boolean);
  const mergedDesc = [...existing, describedBy].filter(Boolean).join(' ') || undefined;

  return cloneElement(child, {
    id: child.props.id ?? controlId,
    'aria-invalid': error || child.props['aria-invalid'],
    'aria-describedby': mergedDesc,
    'aria-required': required || child.props['aria-required'],
  });
}

export function FormField({
  label,
  required = false,
  error,
  helperText,
  children,
  className,
  controlId: controlIdProp,
}: FormFieldProps) {
  const autoId = useId();
  const controlId = controlIdProp ?? autoId;
  const helperId = `${controlId}-helper`;
  const errorId = `${controlId}-error`;

  const describedBy =
    error != null && error !== ''
      ? errorId
      : helperText != null && helperText !== ''
        ? helperId
        : undefined;

  const enhancedChild = isValidElement(children)
    ? mergeControl(children as ReactElement<ControlProps>, controlId, !!error, required, describedBy)
    : children;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label
        htmlFor={controlId}
        className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {enhancedChild}
      {helperText != null && helperText !== '' && !error ? (
        <p id={helperId} className="text-xs leading-relaxed text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {error != null && error !== '' ? (
        <p id={errorId} className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
