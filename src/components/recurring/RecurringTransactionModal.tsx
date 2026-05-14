'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccounts } from '@/src/hooks/useAccounts';
import type { RecurringFrequency, RecurringTransactionModel, RecurringTransactionType } from '@/src/lib/recurring';

interface RecurringTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    payload: Omit<RecurringTransactionModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>
  ) => Promise<void>;
  saving?: boolean;
}

const FREQUENCIES: RecurringFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];
const TYPES: RecurringTransactionType[] = ['income', 'expense', 'transfer'];

export function RecurringTransactionModal({
  open,
  onOpenChange,
  onSave,
  saving = false,
}: RecurringTransactionModalProps) {
  const { accounts } = useAccounts();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<RecurringTransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [interval, setInterval] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open && accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
      const fallbackTransfer = accounts.find((acc) => acc.id !== accounts[0].id);
      if (type === 'transfer' && fallbackTransfer) {
        setToAccountId(fallbackTransfer.id);
      }
    }
  }, [open, accounts, accountId, type]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderDaysBefore, setReminderDaysBefore] = useState('2');
  const [error, setError] = useState<string | null>(null);

  const destinationAccounts = useMemo(
    () => accounts.filter((acc) => acc.id !== accountId),
    [accounts, accountId]
  );

  async function handleSave() {
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!accountId) {
      setError('Select source account');
      return;
    }

    if (type === 'transfer' && !toAccountId) {
      setError('Select destination account');
      return;
    }

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    if (type !== 'transfer' && !category.trim()) {
      setError('Category is required');
      return;
    }

    const intervalNumber = Math.max(1, Math.trunc(Number(interval) || 1));
    const start = new Date(startDate || Date.now());

    await onSave({
      title: title.trim(),
      type,
      amount: parsedAmount,
      category: type === 'transfer' ? 'transfer' : category.trim(),
      accountId,
      ...(type === 'transfer' ? { toAccountId } : {}),
      frequency,
      interval: intervalNumber,
      startDate: start,
      nextRunDate: start,
      lastRunDate: null,
      endDate: endDate ? new Date(endDate) : null,
      notes: notes.trim(),
      currency: 'INR',
      reminderDaysBefore: Math.max(0, Math.trunc(Number(reminderDaysBefore) || 0)),
      isActive: true,
    });

    setTitle('');
    setType('expense');
    setAmount('');
    setCategory('');
    setAccountId('');
    setToAccountId('');
    setFrequency('monthly');
    setInterval('1');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setNotes('');
    setReminderDaysBefore('2');
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Recurring Transaction</h2>
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template Name</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Salary, Rent, EMI" className="mt-2" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  value === type
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-400'
                    : 'bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
              <Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="10000" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <Input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder={type === 'income' ? 'Salary' : type === 'expense' ? 'Utilities' : 'transfer'}
                className="mt-2"
                disabled={type === 'transfer'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source Account</label>
              <select
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="">Select</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
              <select
                value={toAccountId}
                onChange={(event) => setToAccountId(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600"
                disabled={type !== 'transfer'}
              >
                <option value="">{type === 'transfer' ? 'Select' : 'Not required'}</option>
                {destinationAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as RecurringFrequency)}
                className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:bg-gray-800 dark:border-gray-600"
              >
                {FREQUENCIES.map((value) => (
                  <option key={value} value={value} className="capitalize">{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Every</label>
              <Input value={interval} onChange={(event) => setInterval(event.target.value)} inputMode="numeric" className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminder (days before)</label>
              <Input value={reminderDaysBefore} onChange={(event) => setReminderDaysBefore(event.target.value)} inputMode="numeric" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional" className="mt-2" />
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Recurring'}
          </Button>
        </div>
      </div>
    </div>
  );
}
