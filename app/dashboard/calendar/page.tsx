'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  Sparkles,
  Clock4,
  Bell,
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

const viewOptions = [
  { key: 'month', label: 'Month', icon: CalendarDays },
  { key: 'week', label: 'Week', icon: Clock4 },
  { key: 'agenda', label: 'Agenda', icon: List },
];

const filters = [
  { key: 'all', label: 'All' },
  { key: 'emi_due', label: 'EMI' },
  { key: 'goal_contribution', label: 'Goals' },
  { key: 'bill_payment', label: 'Bills' },
  { key: 'investment', label: 'Investments' },
  { key: 'trade_entry', label: 'Trading' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'high_priority', label: 'High Priority' },
];

const eventTypeName: Record<string, string> = {
  emi_due: 'EMI',
  subscription_renewal: 'Subscription',
  bill_payment: 'Bill',
  goal_contribution: 'Goal',
  investment_buy: 'Investment',
  investment_sell: 'Investment',
  trade_entry: 'Trading',
  lending_due: 'Lending',
  borrowing_due: 'Borrowing',
  reminder: 'Reminder',
  custom: 'Custom',
};

function getMonthDays(year: number, month: number) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1));
}

function getWeekDays(reference: Date) {
  const first = new Date(reference);
  first.setDate(reference.getDate() - reference.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(first);
    next.setDate(first.getDate() + index);
    return next;
  });
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function normalizeEventDate(value: unknown) {
  return new Date(value as any);
}

export default function FinancialCalendarPage() {
  const [activeView, setActiveView] = useState<'month' | 'week' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const { events, loading: eventsLoading, saveEvent } = useEvents();
  const { reminders } = useReminders();
  const { emis } = useEMI();
  const { goals } = useGoals();
  const { investments } = useInvestments();
  const { trades } = useTradingJournal();
  const { transactions } = useTransactions();

  const today = new Date();

  const syntheticEvents = useMemo(() => {
    const signature = [] as FinancialEvent[];

    reminders.forEach((reminder) => {
      signature.push({
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
      const date = new Date(emi.startDate);
      if (emi.dueDate) {
        date.setDate(emi.dueDate);
      }
      signature.push({
        id: `emi_${emi.id}`,
        userId: emi.userId,
        title: emi.title,
        eventType: 'emi_due',
        amount: emi.monthlyInstallment,
        date: date < today ? new Date(date.setMonth(date.getMonth() + 1)) : date,
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
      signature.push({
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
      signature.push({
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
      signature.push({
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
      signature.push({
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

    return signature;
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
    if (activeFilters.includes('all')) return allEvents;
    return allEvents.filter((event) => {
      if (activeFilters.includes('high_priority') && (event.priority === 'high' || event.priority === 'urgent')) return true;
      if (activeFilters.includes('upcoming') && event.status === 'upcoming') return true;
      if (activeFilters.includes('completed') && event.status === 'completed') return true;
      if (activeFilters.includes('emi_due') && event.eventType === 'emi_due') return true;
      if (activeFilters.includes('goal_contribution') && event.eventType === 'goal_contribution') return true;
      if (activeFilters.includes('bill_payment') && event.eventType === 'bill_payment') return true;
      if (activeFilters.includes('investment') && (event.eventType === 'investment_buy' || event.eventType === 'investment_sell')) return true;
      if (activeFilters.includes('trade_entry') && event.eventType === 'trade_entry') return true;
      return false;
    });
  }, [activeFilters, allEvents]);

  const monthDays = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);
  const firstDayOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce<Record<string, FinancialEvent[]>>((acc, event) => {
      const key = formatDate(normalizeEventDate(event.date));
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const selectedDayEvents = eventsByDate[formatDate(selectedDate)] ?? [];
  const selectedCashflow = selectedDayEvents.reduce((sum, ev) => sum + (ev.amount ?? 0), 0);

  const heatmapDays = useMemo(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - 27);
    return Array.from({ length: 28 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const count = eventsByDate[formatDate(date)]?.length ?? 0;
      return { date, count };
    });
  }, [eventsByDate, today]);

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-main px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-border bg-card p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-accent-mint border-t-transparent" />
          <p className="text-sm text-secondary">Loading your financial calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main pb-24 text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 shadow-[0_28px_80px_rgba(0,0,0,0.30)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-secondary">Financial Calendar</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Unified timeline for every payment and plan</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/timeline" className="inline-flex items-center gap-2 rounded-[24px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated">
              <CalendarDays size={16} /> Timeline
            </Link>
            <button onClick={() => setEventModalOpen(true)} className="inline-flex items-center gap-2 rounded-[24px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95">
              <Sparkles size={16} /> Add Event
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Active view</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">{getMonthLabel(currentDate)}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setActiveView(option.key as 'month' | 'week' | 'agenda')}
                      className={`inline-flex items-center gap-2 rounded-[24px] px-4 py-3 text-sm font-medium transition ${activeView === option.key ? 'bg-accent-mint text-[#071a0d]' : 'border border-border bg-card text-secondary hover:bg-card-elevated'}`}
                    >
                      <Icon size={16} /> {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeView === 'month' && (
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
                <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.28em] text-secondary">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
                  {Array.from({ length: firstDayOffset }).map((_, index) => (
                    <div key={`blank-${index}`} className="h-24 rounded-[28px] bg-white/5" />
                  ))}
                  {monthDays.map((day) => {
                    const dateKey = formatDate(day);
                    const dayEvents = eventsByDate[dateKey] ?? [];
                    const isSelected = formatDate(day) === formatDate(selectedDate);
                    const isToday = formatDate(day) === formatDate(today);
                    return (
                      <button
                        type="button"
                        key={dateKey}
                        onClick={() => setSelectedDate(day)}
                        className={`flex h-24 flex-col justify-between rounded-[28px] border p-3 text-left transition ${isSelected ? 'border-accent-mint bg-accent-mint/10' : 'border-border bg-white/5 hover:border-accent-mint hover:bg-white/10'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold ${isToday ? 'text-accent-mint' : 'text-foreground'}`}>{day.getDate()}</span>
                          {isToday ? <span className="text-[10px] uppercase tracking-[0.35em] text-accent-mint">Today</span> : null}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <span key={event.id} className="inline-flex h-2.5 w-full items-center overflow-hidden rounded-full bg-accent-mint/20 text-[10px] text-accent-mint">
                              <span className="h-2.5 w-full rounded-full bg-accent-mint" />
                            </span>
                          ))}
                          {dayEvents.length > 3 ? <span className="text-[10px] text-secondary">+{dayEvents.length - 3} more</span> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeView === 'week' && (
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const dateKey = formatDate(day);
                    const dayEvents = eventsByDate[dateKey] ?? [];
                    return (
                      <div key={dateKey} className="rounded-[28px] border border-border bg-white/5 p-4">
                        <p className="text-xs text-secondary">{getDayLabel(day)}</p>
                        <h3 className="mt-2 text-lg font-semibold text-foreground">{day.getDate()}</h3>
                        <div className="mt-4 space-y-3">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div key={event.id} className="rounded-[20px] border border-white/10 bg-[#0D131A] p-3">
                              <p className="text-sm font-medium text-foreground">{event.title}</p>
                              <p className="mt-1 text-xs text-secondary">{eventTypeName[event.eventType]}</p>
                            </div>
                          ))}
                          {dayEvents.length === 0 ? <p className="text-sm text-secondary">No events</p> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeView === 'agenda' && (
              <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                  <div className="rounded-[32px] border border-border bg-card p-8 text-center text-secondary">
                    No financial events are scheduled. Add an event to start building your calendar.
                  </div>
                ) : (
                  filteredEvents.slice(0, 12).map((event) => (
                    <FinancialEventCard key={event.id} event={event} />
                  ))
                )}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Selected day</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/5 px-3 py-2 text-xs text-secondary">{selectedDayEvents.length} events</div>
              </div>

              <div className="mt-4 rounded-[28px] border border-border bg-[#0C1319] p-4">
                <p className="text-sm text-secondary">Daily cashflow</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">₹{selectedCashflow.toLocaleString('en-IN')}</p>
              </div>

              <div className="mt-5 space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-secondary">No events on this date yet. Use Add Event to schedule reminders, payments, and plans.</p>
                ) : selectedDayEvents.map((event) => (
                  <div key={event.id} className="rounded-[28px] border border-border bg-[#0D141B] p-4">
                    <p className="text-sm font-semibold text-foreground">{event.title}</p>
                    <p className="mt-1 text-sm text-secondary">{eventTypeName[event.eventType]} • {new Date(event.date).toLocaleDateString('en-US')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Filter events</p>
                  <p className="mt-1 text-sm text-foreground">Refine your calendar view by event type.</p>
                </div>
                <button onClick={() => setActiveFilters(['all'])} className="text-sm text-accent-mint transition hover:underline">Reset</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.map((filter) => {
                  const active = activeFilters.includes(filter.key);
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => {
                        if (filter.key === 'all') {
                          setActiveFilters(['all']);
                          return;
                        }
                        setActiveFilters((prev) => {
                          if (prev.includes('all')) {
                            return [filter.key];
                          }
                          if (prev.includes(filter.key)) {
                            return prev.filter((item) => item !== filter.key);
                          }
                          return [...prev, filter.key];
                        });
                      }}
                      className={`rounded-[24px] px-4 py-2 text-sm transition ${active ? 'bg-accent-mint text-[#071a0d]' : 'border border-border bg-card text-secondary hover:bg-white/5'}`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_28px_80px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-secondary">Activity heatmap</p>
                  <p className="mt-1 text-sm text-foreground">Monthly event density across the last 28 days.</p>
                </div>
                <Bell size={18} className="text-secondary" />
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {heatmapDays.map((cell) => {
                  const level = Math.min(4, cell.count);
                  const styles = ['bg-white/5', 'bg-accent-mint/15', 'bg-accent-mint/25', 'bg-accent-mint/40', 'bg-accent-mint/55'];
                  return (
                    <div key={formatDate(cell.date)} className={`h-10 rounded-2xl border border-border ${styles[level]}`} title={`${cell.count} event${cell.count === 1 ? '' : 's'} on ${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`} />
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-secondary">
                <span>Less activity</span>
                <span>More events</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AddEventModal open={eventModalOpen} onOpenChange={setEventModalOpen} onSave={async (payload) => {
        await saveEvent(payload);
        return undefined;
      }} />
    </div>
  );
}
