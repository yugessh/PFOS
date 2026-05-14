'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccounts } from '@/src/hooks/useAccounts';
import type { ReminderModel, ReminderType } from '@/src/lib/reminders';

interface AddReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    payload: Omit<ReminderModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>
  ) => Promise<void>;
  saving?: boolean;
}

const TYPES: ReminderType[] = ['bill', 'subscription', 'insurance', 'rent', 'utility', 'other'];
const FREQUENCIES = ['once', 'monthly', 'quarterly', 'yearly'] as const;

export function AddReminderModal({
  open,
  onOpenChange,
  onSave,
  saving = false,
}: AddReminderModalProps) {
  const { accounts } = useAccounts();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('bill');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<'once' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderDaysBefore, setReminderDaysBefore] = useState('3');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [open, accounts, accountId]);

  async function handleSave() {
    setError(null);

    if (!title.trim()) {
      setError('Reminder title is required');
      return;
    }

    const parsedAmount = amount ? Number(amount) : null;
    if (amount && (!parsedAmount || parsedAmount <= 0)) {
      setError('Enter a valid amount');
      return;
    }

    if (!category.trim()) {
      setError('Category is required');
      return;
    }

    await onSave({
      title: title.trim(),
      type,
      amount: parsedAmount,
      dueDate: new Date(dueDate),
      frequency,
      accountId: accountId || null,
      category: category.trim(),
      notes: notes.trim(),
      currency: 'INR',
      reminderDaysBefore: Math.max(0, Math.trunc(Number(reminderDaysBefore) || 0)),
      isActive: true,
      isPaid: false,
      paidDate: null,
      transactionId: null,
    });

    setTitle('');
    setType('bill');
    setAmount('');
    setDueDate(new Date().toISOString().slice(0, 10));
    setFrequency('monthly');
    setAccountId('');
    setCategory('');
    setNotes('');
    setReminderDaysBefore('3');
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Reminder</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminder Title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Electricity Bill, Netflix Subscription" className="mt-2" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  value === type
                    ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-400'
                    : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (Optional)</label>
              <Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="5000" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Utilities, Entertainment" className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
              <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as 'once' | 'monthly' | 'quarterly' | 'yearly')}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600"
              >
                {FREQUENCIES.map((value) => (
                  <option key={value} value={value} className="capitalize">{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account (Optional)</label>
              <select
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="">No account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminder (days before)</label>
              <Input value={reminderDaysBefore} onChange={(event) => setReminderDaysBefore(event.target.value)} inputMode="numeric" className="mt-2" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional notes" className="mt-2" />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Add Reminder'}
          </Button>
        </div>
      </div>
    </div>
  );
}