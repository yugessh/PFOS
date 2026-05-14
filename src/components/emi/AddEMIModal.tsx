'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccounts } from '@/src/hooks/useAccounts';
import type { EMIModel } from '@/src/lib/emi';

interface AddEMIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    payload: Omit<EMIModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>
  ) => Promise<void>;
  saving?: boolean;
}

export function AddEMIModal({
  open,
  onOpenChange,
  onSave,
  saving = false,
}: AddEMIModalProps) {
  const { accounts } = useAccounts();

  const [title, setTitle] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [dueDate, setDueDate] = useState('1');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
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
      setError('EMI title is required');
      return;
    }

    if (!accountId) {
      setError('Select account');
      return;
    }

    const parsedLoanAmount = Number(loanAmount);
    if (!parsedLoanAmount || parsedLoanAmount <= 0) {
      setError('Enter a valid loan amount');
      return;
    }

    const parsedMonthlyInstallment = Number(monthlyInstallment);
    if (!parsedMonthlyInstallment || parsedMonthlyInstallment <= 0) {
      setError('Enter a valid monthly installment');
      return;
    }

    const parsedTotalInstallments = Number(totalInstallments);
    if (!parsedTotalInstallments || parsedTotalInstallments <= 0) {
      setError('Enter a valid total installments');
      return;
    }

    const parsedDueDate = Number(dueDate);
    if (!parsedDueDate || parsedDueDate < 1 || parsedDueDate > 31) {
      setError('Enter a valid due date (1-31)');
      return;
    }

    if (!category.trim()) {
      setError('Category is required');
      return;
    }

    await onSave({
      title: title.trim(),
      loanAmount: parsedLoanAmount,
      monthlyInstallment: parsedMonthlyInstallment,
      totalInstallments: parsedTotalInstallments,
      paidInstallments: 0,
      dueDate: parsedDueDate,
      accountId,
      category: category.trim(),
      startDate: new Date(startDate),
      endDate: null,
      notes: notes.trim(),
      currency: 'INR',
      reminderDaysBefore: Math.max(0, Math.trunc(Number(reminderDaysBefore) || 0)),
      isActive: true,
    });

    setTitle('');
    setLoanAmount('');
    setMonthlyInstallment('');
    setTotalInstallments('');
    setDueDate('1');
    setAccountId('');
    setCategory('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setReminderDaysBefore('3');
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add EMI</h2>
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">EMI Title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Home Loan, Car Loan, Credit Card" className="mt-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount</label>
              <Input value={loanAmount} onChange={(event) => setLoanAmount(event.target.value)} inputMode="decimal" placeholder="500000" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Installment</label>
              <Input value={monthlyInstallment} onChange={(event) => setMonthlyInstallment(event.target.value)} inputMode="decimal" placeholder="15000" className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Installments</label>
              <Input value={totalInstallments} onChange={(event) => setTotalInstallments(event.target.value)} inputMode="numeric" placeholder="36" className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date (1-31)</label>
              <Input value={dueDate} onChange={(event) => setDueDate(event.target.value)} inputMode="numeric" placeholder="1" className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Loan, Credit Card" className="mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2" />
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
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Add EMI'}
          </Button>
        </div>
      </div>
    </div>
  );
}