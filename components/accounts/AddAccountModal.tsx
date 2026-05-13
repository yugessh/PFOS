'use client';

import { useState } from 'react';
import { AppModal } from '@/components/modals/AppModal';
import { FormField } from '@/components/forms/FormField';
import { FormSection } from '@/components/forms/FormSection';
import { FormActions } from '@/components/forms/FormActions';
import { Input } from '@/components/ui/input';
import { AccountTypeSelector } from './AccountTypeSelector';
import type { AccountModel } from '@/data/mock-accounts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (a: AccountModel) => void;
}

export function AddAccountModal({ open, onOpenChange, onSave }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountModel['type']>('Bank Account');
  const [balance, setBalance] = useState('0');
  const [color, setColor] = useState('#4A90E2');
  const [icon, setIcon] = useState('🏦');

  function handleSave() {
    const parsed = Math.round(Number(balance || '0') * 100);
    const acc: AccountModel = {
      id: `a_${Date.now()}`,
      name: name || 'New Account',
      type,
      balance: parsed,
      color,
      icon,
    };
    onSave(acc);
    // reset
    setName('');
    setBalance('0');
    setColor('#4A90E2');
    setIcon('🏦');
    onOpenChange(false);
  }

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title="Add Account" description="Create a new wallet or account" size="sm">
      <form id="add-account-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="space-y-4">
          <FormSection>
            <FormField label="Account name" required>
              <Input placeholder="e.g. HDFC Savings" value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>

            <FormField label="Account type" required>
              <AccountTypeSelector value={type} onChange={(t) => setType(t)} />
            </FormField>

            <FormField label="Initial balance" helperText="Enter amount in main currency (e.g., 12500)">
              <Input value={balance} onChange={(e) => setBalance(e.target.value)} inputMode="numeric" />
            </FormField>

            <div className="grid grid-cols-2 gap-2">
              <FormField label="Color">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full rounded-md border" />
              </FormField>
              <FormField label="Icon">
                <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
              </FormField>
            </div>
          </FormSection>
        </div>
      </form>
      <div>
        <FormActions onCancel={() => onOpenChange(false)} submitLabel="Create" form="add-account-form" />
      </div>
    </AppModal>
  );
}
