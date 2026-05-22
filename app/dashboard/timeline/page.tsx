'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Sparkles,
  Layers,
  CalendarDays,
  Clock4,
  Bell,
  Plus,
} from 'lucide-react';
import { useEvents } from '@/src/hooks/useEvents';
import { useReminders } from '@/src/hooks/useReminders';
import { useEMI } from '@/src/hooks/useEMI';
import { useGoals } from '@/src/hooks/useGoals';
import { useInvestments } from '@/src/hooks/useInvestments';
import { useTradingJournal } from '@/src/hooks/useTradingJournal';
import { useTransactions } from '@/src/hooks/useTransactions';
import { AddEventModal } from '@/src/components/events/AddEventModal';
import { FinancialEventCard } from '@/src/components/events/FinancialEventCard';
import type { FinancialEvent } from '@/src/types/firestore';
import { formatDate } from '@/lib/date';

function normalizeEventDate(value: unknown) {
  return new Date(value as any);
}

export default function FinancialTimelinePage() {
  const [query, setQuery] = useState('');
  const [activeStat, setActiveStat] = useState('all');
  const [openModal, setOpenModal] = useState(false);

  const { events, saveEvent } = useEvents();
  const { reminders } = useReminders();
  const { emis } = useEMI();
  const { goals } = useGoals();
  const { investments } = useInvestments();
  const { trades } = useTradingJournal();
  const { transactions } = useTransactions();

  const today = new Date();

  const syntheticEvents = useMemo(() => {
    const collection: FinancialEvent[] = [];

    reminders.forEach((reminder) => {
      collection.push({
        id: `rem_${reminder.id}`,
        userId: reminder.userId,
        title: reminder.title,
        eventType: 'reminder',
        amount: reminder.amount ?? 0,
        date: new Date(reminder.dueDate),
        status: reminder.isPaid ? 'completed' : new Date(reminder.dueDate) < today ? 'missed' : 'upcoming',
        linkedModule: 'reminders',
        linkedId: reminder.id,
        priority: 'medium',
        notes: reminder.notes ?? '',
        metadata: { category: reminder.category, frequency: reminder.frequency, type: reminder.type },
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
        deletedAt: reminder.deletedAt ?? null,
      });
    });

    emis.forEach((emi) => {
      const due = new Date(emi.startDate);
      if (emi.dueDate) {
        due.setDate(emi.dueDate);
      }
      collection.push({
        id: `emi_${emi.id}`,
        userId: emi.userId,
        title: emi.title,
        eventType: 'emi_due',
        amount: emi.monthlyInstallment,
        date: due,
        status: 'upcoming',
        linkedModule: 'emi',
        linkedId: emi.id,
        priority: 'high',
        notes: emi.notes ?? '',
        metadata: { loanAmount: emi.loanAmount, frequency: emi.dueDate },
        createdAt: emi.createdAt,
        updatedAt: emi.updatedAt,
        deletedAt: emi.deletedAt ?? null,
      });
    });

    goals.forEach((goal) => {
      collection.push({
        id: `goal_${goal.id}`,
        userId: goal.userId,
        title: `Goal target: ${goal.title}`,
        eventType: 'goal_contribution',
        amount: goal.targetAmount - goal.savedAmount,
        date: goal.deadline,
        status: goal.savedAmount >= goal.targetAmount ? 'completed' : goal.deadline < today ? 'missed' : 'upcoming',
        linkedModule: 'goals',
        linkedId: goal.id,
        priority: goal.savedAmount >= goal.targetAmount ? 'high' : 'medium',
        notes: goal.description ?? '',
        metadata: { deadline: goal.deadline },
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        deletedAt: goal.deletedAt ?? null,
      });
    });

    investments.forEach((investment) => {
      collection.push({
        id: `inv_${investment.id}`,
        userId: investment.userId,
        title: `Investment: ${investment.name}`,
        eventType: 'investment_buy',
        amount: investment.amountInvested,
        date: investment.createdAt,
        status: 'completed',
        linkedModule: 'investments',
        linkedId: investment.id,
        priority: 'medium',
        notes: investment.notes ?? '',
        metadata: { type: investment.type, currentValue: investment.currentValue },
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt,
        deletedAt: investment.deletedAt ?? null,
      });
    });

    trades.forEach((trade) => {
      collection.push({
        id: `trade_${trade.id ?? Math.random().toString(36).slice(2)}`,
        userId: trade.userId,
        title: `Trade entry: ${trade.pair}`,
        eventType: 'trade_entry',
        amount: trade.pnl ?? 0,
        date: new Date(trade.date),
        status: trade.pnl && trade.pnl > 0 ? 'completed' : 'pending',
        linkedModule: 'trading-journal',
        linkedId: trade.id ?? '',
        priority: 'medium',
        notes: trade.notes ?? '',
        metadata: { direction: trade.direction, entryPrice: trade.entryPrice, exitPrice: trade.exitPrice },
        createdAt: trade.createdAt ?? new Date(),
        updatedAt: trade.updatedAt ?? new Date(),
        deletedAt: trade.deletedAt ?? null,
      });
    });

    transactions.forEach((tx) => {
      collection.push({
        id: `txn_${tx.id}`,
        userId: tx.account || 'local',
        title: tx.description || tx.category || `Transaction ${tx.type}`,
        eventType: tx.type === 'income' ? 'custom' : 'bill_payment',
        amount: tx.amount,
        date: new Date(tx.date),
        status: 'completed',
        linkedModule: 'transactions',
        linkedId: tx.id,
        priority: tx.amount > 50000 ? 'high' : 'medium',
        notes: tx.description || tx.category,
        metadata: { category: tx.category, account: tx.account },
        createdAt: new Date(tx.date),
        updatedAt: new Date(tx.date),
        deletedAt: null,
      });
    });

    return collection;
  }, [reminders, emis, goals, investments, trades, transactions, today]);

  const allEvents = useMemo(() => {
    const combined = [...events, ...syntheticEvents];
    const unique = new Map<string, FinancialEvent>();
    combined.forEach((event) => {
      unique.set(event.id, event);
    });
    return Array.from(unique.values()).sort((a, b) => normalizeEventDate(b.date).getTime() - normalizeEventDate(a.date).getTime());
  }, [events, syntheticEvents]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allEvents.filter((event) => {
      const matchesQuery = normalizedQuery === '' || [event.title, event.eventType, event.notes, event.linkedModule]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      if (!matchesQuery) {
        return false;
      }

      if (activeStat === 'upcoming') {
        return event.status === 'upcoming';
      }
      if (activeStat === 'completed') {
        return event.status === 'completed';
      }
      if (activeStat === 'high_priority') {
        return event.priority === 'high' || event.priority === 'urgent';
      }
      return true;
    });
  }, [activeStat, allEvents, query]);

  const recentEvents = filteredEvents.slice(0, 10);
  const upcomingCount = allEvents.filter((event) => event.status === 'upcoming').length;
  const highPriorityCount = allEvents.filter((event) => event.priority === 'high' || event.priority === 'urgent').length;
  const completedCount = allEvents.filter((event) => event.status === 'completed').length;

  return (
    <div className="min-h-screen bg-main pb-24 text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-5 rounded-[32px] border border-border bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-secondary">Financial Timeline</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">View all past and upcoming money movements</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/calendar" className="inline-flex items-center gap-2 rounded-[24px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated">
              <CalendarDays size={16} /> Calendar
            </Link>
            <button onClick={() => setOpenModal(true)} className="inline-flex items-center gap-2 rounded-[24px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95">
              <Plus size={16} /> Add Event
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Search timeline</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Find the event you need</h2>
                </div>
                <div className="flex items-center gap-2 rounded-[24px] border border-border bg-[#0A1116] px-4 py-3 text-sm text-secondary">
                  <Search size={16} />
                  <span>{filteredEvents.length} events</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-[28px] border border-border bg-[#0A1116] px-4 py-3">
                <Search size={18} className="text-secondary" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, module, or note"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-secondary"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-secondary">Highlights</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">What needs your attention</p>
                  </div>
                  <button onClick={() => setActiveStat('all')} className="text-sm text-accent-mint transition hover:underline">Show all</button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button type="button" onClick={() => setActiveStat('upcoming')} className={`rounded-[24px] border px-4 py-4 text-left transition ${activeStat === 'upcoming' ? 'border-accent-mint bg-accent-mint/10' : 'border-border bg-card hover:bg-white/5'}`}>
                    <div className="flex items-center gap-2 text-secondary"><Clock4 size={18} /> Upcoming</div>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{upcomingCount}</p>
                  </button>
                  <button type="button" onClick={() => setActiveStat('high_priority')} className={`rounded-[24px] border px-4 py-4 text-left transition ${activeStat === 'high_priority' ? 'border-accent-mint bg-accent-mint/10' : 'border-border bg-card hover:bg-white/5'}`}>
                    <div className="flex items-center gap-2 text-secondary"><Sparkles size={18} /> High priority</div>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{highPriorityCount}</p>
                  </button>
                  <button type="button" onClick={() => setActiveStat('completed')} className={`rounded-[24px] border px-4 py-4 text-left transition ${activeStat === 'completed' ? 'border-accent-mint bg-accent-mint/10' : 'border-border bg-card hover:bg-white/5'}`}>
                    <div className="flex items-center gap-2 text-secondary"><Bell size={18} /> Completed</div>
                    <p className="mt-3 text-2xl font-semibold text-foreground">{completedCount}</p>
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.32em] text-secondary">Recent feed</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">Latest timeline activities</p>
                  </div>
                  <ArrowRight size={18} className="text-secondary" />
                </div>
                <div className="mt-5 space-y-3">
                  {recentEvents.length === 0 ? (
                    <p className="text-sm text-secondary">No recent items found. Add a financial event to populate your timeline.</p>
                  ) : recentEvents.map((event) => (
                    <div key={event.id} className="rounded-[28px] border border-border bg-[#0D141B] p-4">
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-secondary">{formatDate(normalizeEventDate(event.date))}</p>
                      <p className="mt-2 text-sm text-secondary">{event.eventType.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Full timeline</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">All matching events</p>
                </div>
                <span className="rounded-full border border-border bg-white/5 px-3 py-2 text-xs text-secondary">{filteredEvents.length} found</span>
              </div>
              <div className="mt-5 space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-border bg-[#0B1116] p-8 text-center text-secondary">
                    No timeline events matched your filters and search.
                  </div>
                ) : filteredEvents.map((event) => <FinancialEventCard key={event.id} event={event} />)}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Event creation</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">Add more schedule items</p>
                </div>
                <button onClick={() => setOpenModal(true)} className="inline-flex items-center gap-2 rounded-[24px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95">
                  <Plus size={16} /> Create
                </button>
              </div>

              <div className="mt-5 space-y-4 text-sm text-secondary">
                <p>Use the timeline to track money movements, due dates, investment entries, reminders, and goal milestones in one place.</p>
                <p>Search, filter, and review past event history without leaving the dashboard.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Timeline heatmap</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">Event density</p>
                </div>
                <Layers size={18} className="text-secondary" />
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }, (_, index) => {
                  const date = new Date(today);
                  date.setDate(today.getDate() - (27 - index));
                  const count = allEvents.filter((event) => formatDate(normalizeEventDate(event.date)) === formatDate(date)).length;
                  const level = Math.min(4, count);
                  const styles = ['bg-white/5', 'bg-accent-mint/15', 'bg-accent-mint/25', 'bg-accent-mint/40', 'bg-accent-mint/55'];
                  return <div key={index} className={`h-10 rounded-2xl border border-border ${styles[level]}`} title={`${count} events on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`} />;
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AddEventModal open={openModal} onOpenChange={setOpenModal} onSave={async (payload) => {
        await saveEvent(payload);
        return undefined;
      }} />
    </div>
  );
}
