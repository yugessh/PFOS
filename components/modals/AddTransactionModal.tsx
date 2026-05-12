'use client';

import { FormActions } from '@/components/forms/FormActions';
import { FormField } from '@/components/forms/FormField';
import { FormSection } from '@/components/forms/FormSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useId, useState } from 'react';
import { AppModal } from './AppModal';

const ADD_TX_FORM_ID = 'add-transaction-form';

export interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionModal({ open, onOpenChange }: AddTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const typeFieldId = useId();

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add transaction"
      description="Placeholder layout — connect validation, APIs, and persistence when ready."
      size="lg"
      footer={
        <FormActions
          form={ADD_TX_FORM_ID}
          cancelLabel="Cancel"
          submitLabel="Save transaction"
          loading={loading}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <form
        id={ADD_TX_FORM_ID}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          window.setTimeout(() => setLoading(false), 450);
        }}
      >
        <FormSection
          title="Transaction details"
          description="Core fields only; extend with tags, attachments, or splits later."
        >
          <FormField label="Description" required helperText="Shown on statements and search.">
            <Input name="description" placeholder="e.g. Grocery run" autoComplete="off" />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Amount" required helperText="Use your ledger currency.">
              <Input name="amount" inputMode="decimal" placeholder="0.00" autoComplete="off" />
            </FormField>
            <FormField label="Date" required>
              <Input name="date" type="date" className="font-mono text-sm" />
            </FormField>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor={typeFieldId}
              className="text-sm font-medium leading-none text-foreground"
            >
              Type
              <span className="ml-0.5 text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <Select defaultValue="expense">
              <SelectTrigger id={typeFieldId} className="h-9 w-full">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormSection>
        <FormSection title="Classification" description="Optional grouping for reports.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Category">
              <Input name="category" placeholder="e.g. Food" autoComplete="off" />
            </FormField>
            <FormField label="Account">
              <Input name="account" placeholder="e.g. Checking" autoComplete="off" />
            </FormField>
          </div>
        </FormSection>
      </form>
    </AppModal>
  );
}
