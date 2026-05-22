'use client';

import { motion } from 'framer-motion';
import { Activity, Bell, BookOpen, CalendarDays, CheckCircle2, CreditCard, DollarSign, FileText, Flag, Sparkles, Target, TrendingUp, Wallet, Zap } from 'lucide-react';
import type { FinancialEvent, FinancialEventType, EventStatus } from '@/src/types/firestore';
import { cn } from '@/lib/utils';

const eventMeta: Record<FinancialEventType, { label: string; icon: typeof CalendarDays; badge: string; accent: string }> = {
  emi_due: { label: 'EMI Due', icon: DollarSign, badge: 'bg-orange-500/10 text-orange-300', accent: 'bg-orange-500/10' },
  subscription_renewal: { label: 'Subscription', icon: Bell, badge: 'bg-cyan-500/10 text-cyan-300', accent: 'bg-cyan-500/10' },
  bill_payment: { label: 'Bill', icon: CreditCard, badge: 'bg-red-500/10 text-red-300', accent: 'bg-red-500/10' },
  goal_contribution: { label: 'Goal', icon: Target, badge: 'bg-emerald-500/10 text-emerald-300', accent: 'bg-emerald-500/10' },
  investment_buy: { label: 'Investment', icon: TrendingUp, badge: 'bg-blue-500/10 text-blue-300', accent: 'bg-blue-500/10' },
  investment_sell: { label: 'Investment', icon: TrendingUp, badge: 'bg-blue-500/10 text-blue-300', accent: 'bg-blue-500/10' },
  trade_entry: { label: 'Trading', icon: BookOpen, badge: 'bg-violet-500/10 text-violet-300', accent: 'bg-violet-500/10' },
  lending_due: { label: 'Lending', icon: Wallet, badge: 'bg-amber-500/10 text-amber-300', accent: 'bg-amber-500/10' },
  borrowing_due: { label: 'Borrowing', icon: Wallet, badge: 'bg-amber-500/10 text-amber-300', accent: 'bg-amber-500/10' },
  reminder: { label: 'Reminder', icon: Flag, badge: 'bg-slate-500/10 text-slate-300', accent: 'bg-slate-500/10' },
  custom: { label: 'Custom', icon: Sparkles, badge: 'bg-indigo-500/10 text-indigo-300', accent: 'bg-indigo-500/10' },
};

const statusClass = (status: EventStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-200';
    case 'missed':
      return 'bg-destructive/10 text-destructive';
    case 'upcoming':
      return 'bg-accent-mint/10 text-accent-mint';
    default:
      return 'bg-white/5 text-secondary';
  }
};

function formatCurrency(amount?: number) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function FinancialEventCard({ event }: { event: FinancialEvent }) {
  const meta = eventMeta[event.eventType] || eventMeta.custom;
  const EventIcon = meta.icon;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn('grid h-12 w-12 place-items-center rounded-3xl', meta.accent)}>
            <EventIcon size={20} />
          </div>
          <div>
            <p className="text-sm text-secondary">{meta.label}</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{event.title}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-secondary">{formatCurrency(event.amount)}</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusClass(event.status))}>{event.status}</span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-secondary">{event.priority}</span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-secondary">{event.linkedModule}</span>
      </div>

      {event.notes ? (
        <p className="mt-4 text-sm leading-6 text-secondary">{event.notes}</p>
      ) : null}
    </motion.article>
  );
}
