'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { FinancialEvent, FinancialEventType, EventStatus, EventPriority } from '@/src/types/firestore';

const eventTypes: { value: FinancialEventType; label: string }[] = [
  { value: 'emi_due', label: 'EMI Due' },
  { value: 'subscription_renewal', label: 'Subscription Renewal' },
  { value: 'bill_payment', label: 'Bill Payment' },
  { value: 'goal_contribution', label: 'Goal Contribution' },
  { value: 'investment_buy', label: 'Investment Buy' },
  { value: 'investment_sell', label: 'Investment Sell' },
  { value: 'trade_entry', label: 'Trade Entry' },
  { value: 'lending_due', label: 'Lending Due' },
  { value: 'borrowing_due', label: 'Borrowing Due' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'custom', label: 'Custom Event' },
];

const statusOptions: { value: EventStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
];

const priorityOptions: { value: EventPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: Omit<FinancialEvent, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) => Promise<FinancialEvent | undefined>;
}

export function AddEventModal({ open, onOpenChange, onSave }: AddEventModalProps) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<FinancialEventType>('reminder');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<EventStatus>('pending');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [linkedModule, setLinkedModule] = useState('manual');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setEventType('reminder');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setStatus('pending');
      setPriority('medium');
      setLinkedModule('manual');
      setNotes('');
      setError(null);
    }
  }, [open]);

  const canSave = useMemo(() => title.trim().length > 0 && date.trim().length > 0, [title, date]);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        eventType,
        amount: amount ? Number(amount) : undefined,
        date: new Date(date),
        status,
        linkedModule,
        priority,
        notes: notes.trim(),
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Unable to save event');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_32px_100px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add financial event</h2>
            <p className="text-sm text-secondary">Create a new calendar event aligned with your financial flow.</p>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full p-2 text-secondary transition hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-secondary">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
                placeholder="Pay EMI, Netflix renewal, trade entry"
              />
            </label>
            <label className="space-y-2 text-sm text-secondary">
              Date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-secondary">
              Event type
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value as FinancialEventType)}
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
              >
                {eventTypes.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-secondary">
              Priority
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as EventPriority)}
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-secondary">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as EventStatus)}
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-secondary">
              Amount
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
                placeholder="₹0"
              />
            </label>
            <label className="space-y-2 text-sm text-secondary">
              Linked module
              <input
                value={linkedModule}
                onChange={(event) => setLinkedModule(event.target.value)}
                className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
                placeholder="emi, goals, trading, custom"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-secondary">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-[24px] border border-border bg-background px-4 py-3 text-white outline-none focus:border-accent-mint"
              placeholder="Optional notes for the event"
            />
          </label>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-[24px] border border-border bg-card px-5 py-3 text-sm text-secondary transition hover:bg-card-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSave || saving}
              onClick={handleSave}
              className="rounded-[24px] bg-accent-mint px-5 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Add event'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
