'use client';

import { useMemo, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCheck,
  Pin,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { NotificationCard } from './NotificationCard';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useNotificationSettings } from '@/src/hooks/useNotificationSettings';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useGoals } from '@/src/hooks/useGoals';
import { useInvestments } from '@/src/hooks/useInvestments';
import { useTradingJournal } from '@/src/hooks/useTradingJournal';
import { useEvents } from '@/src/hooks/useEvents';
import { useReminders } from '@/src/hooks/useReminders';
import { getActivityFeedTone, getNotificationGroupKey, getNotificationGroupLabel, getNotificationModuleLabel, normalizeNotificationPriority, type ActivityFeedItem, type NotificationGroup, type NotificationModel, type NotificationPriority } from '@/src/lib/notifications';
import { cn } from '@/lib/utils';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'critical', label: 'Critical' },
  { id: 'finance', label: 'Finance' },
  { id: 'security', label: 'Security' },
  { id: 'trading', label: 'Trading' },
  { id: 'goals', label: 'Goals' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'automation', label: 'Automation' },
  { id: 'pinned', label: 'Pinned' },
];

function isMatchingFilter(notification: NotificationModel, filter: string) {
  const module = notification.module || notification.metadata?.category || '';
  const normalizedPriority = normalizeNotificationPriority(notification.priority);

  switch (filter) {
    case 'unread':
      return !notification.isRead;
    case 'critical':
      return normalizedPriority === 'critical';
    case 'finance':
      return ['transactions', 'budgets', 'goals', 'investments', 'emi', 'bills', 'subscriptions', 'lending', 'reports', 'dashboard'].includes(module);
    case 'security':
      return module === 'security' || notification.type.includes('security');
    case 'trading':
      return module === 'trading' || notification.type.includes('trading');
    case 'goals':
      return module === 'goals' || notification.type.includes('goal');
    case 'calendar':
      return module === 'calendar' || notification.type === 'calendar_event';
    case 'automation':
      return module === 'automation' || notification.type === 'automation_update';
    case 'pinned':
      return Boolean(notification.isPinned);
    default:
      return true;
  }
}

function matchesQuery(notification: NotificationModel, query: string) {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return [
    notification.title,
    notification.message,
    notification.type,
    notification.priority,
    notification.module,
    notification.metadata?.category,
    notification.groupLabel,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
}

function groupNotifications(notifications: NotificationModel[]): NotificationGroup[] {
  const groupMap = new Map<string, NotificationModel[]>();

  notifications.forEach((notification) => {
    const key = getNotificationGroupKey(notification);
    const items = groupMap.get(key) || [];
    items.push(notification);
    groupMap.set(key, items);
  });

  return Array.from(groupMap.entries())
    .map(([key, items]) => {
      const sorted = [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
      return {
        key,
        count: sorted.length,
        label: getNotificationGroupLabel(sorted[0], sorted.length),
        notifications: sorted,
      };
    })
    .sort((left, right) => new Date(right.notifications[0]?.createdAt || 0).getTime() - new Date(left.notifications[0]?.createdAt || 0).getTime());
}

function buildActivityFeed(
  notifications: NotificationModel[],
  transactions: any[],
  goals: any[],
  investments: any[],
  trades: any[],
  events: any[],
  reminders: any[],
) {
  const feed: ActivityFeedItem[] = [
    ...notifications.map((notification) => ({
      id: `notif-${notification.id}`,
      title: notification.title,
      subtitle: notification.message,
      module: notification.module || notification.metadata?.category || 'dashboard',
      priority: notification.priority,
      createdAt: notification.createdAt,
      url: notification.actionUrl,
      tone: getActivityFeedTone(notification.priority) as ActivityFeedItem['tone'],
      metadata: notification.metadata,
    })),
    ...transactions.slice(0, 8).map((transaction) => ({
      id: `tx-${transaction.id}`,
      title: transaction.type === 'income' ? 'Income received' : 'Expense logged',
      subtitle: transaction.description || transaction.category || 'Transaction update',
      module: 'transactions',
      priority: (transaction.amount && Math.abs(transaction.amount) > 50000 ? 'high' : 'medium') as NotificationPriority,
      createdAt: new Date(transaction.date || transaction.createdAt || Date.now()),
      url: '/dashboard/transactions',
      tone: (transaction.type === 'income' ? 'medium' : 'high') as ActivityFeedItem['tone'],
      metadata: transaction,
    })),
    ...goals.slice(0, 6).map((goal) => ({
      id: `goal-${goal.id}`,
      title: `Goal progress: ${goal.title}`,
      subtitle: `${goal.savedAmount || goal.currentAmount || 0} saved toward ${goal.targetAmount || goal.goalAmount || 0}`,
      module: 'goals',
      priority: (goal.savedAmount >= goal.targetAmount ? 'medium' : 'low') as NotificationPriority,
      createdAt: new Date(goal.updatedAt || goal.createdAt || Date.now()),
      url: '/dashboard/goals',
      tone: (goal.savedAmount >= goal.targetAmount ? 'medium' : 'low') as ActivityFeedItem['tone'],
      metadata: goal,
    })),
    ...investments.slice(0, 6).map((investment) => ({
      id: `inv-${investment.id}`,
      title: `Investment update: ${investment.name}`,
      subtitle: `Current value ${investment.currentValue ?? investment.value ?? 0}`,
      module: 'investments',
      priority: 'medium' as NotificationPriority,
      createdAt: new Date(investment.updatedAt || investment.createdAt || Date.now()),
      url: '/dashboard/investments',
      tone: 'medium' as ActivityFeedItem['tone'],
      metadata: investment,
    })),
    ...trades.slice(0, 6).map((trade) => ({
      id: `trade-${trade.id}`,
      title: trade.pnl && trade.pnl >= 0 ? 'Trade closed in profit' : 'Trade activity recorded',
      subtitle: trade.pair || trade.notes || 'Trading journal entry',
      module: 'trading',
      priority: (trade.pnl && trade.pnl < 0 ? 'high' : 'medium') as NotificationPriority,
      createdAt: new Date(trade.date || trade.createdAt || Date.now()),
      url: '/dashboard/trading-journal',
      tone: (trade.pnl && trade.pnl < 0 ? 'high' : 'medium') as ActivityFeedItem['tone'],
      metadata: trade,
    })),
    ...events.slice(0, 6).map((event) => ({
      id: `event-${event.id}`,
      title: event.title || 'Automation event',
      subtitle: event.eventType || event.notes || 'System activity',
      module: event.linkedModule || 'automation',
      priority: (event.priority || 'low') as NotificationPriority,
      createdAt: new Date(event.date || event.createdAt || Date.now()),
      url: event.linkedModule ? `/dashboard/${event.linkedModule}` : undefined,
      tone: normalizeNotificationPriority(event.priority || 'low') as ActivityFeedItem['tone'],
      metadata: event,
    })),
    ...reminders.slice(0, 6).map((reminder) => ({
      id: `rem-${reminder.id}`,
      title: reminder.title || 'Reminder',
      subtitle: reminder.description || reminder.notes || 'Upcoming task',
      module: 'calendar',
      priority: (reminder.priority || 'medium') as NotificationPriority,
      createdAt: new Date(reminder.reminderDate || reminder.dueDate || reminder.createdAt || Date.now()),
      url: '/dashboard/calendar',
      tone: normalizeNotificationPriority(reminder.priority || 'medium') as ActivityFeedItem['tone'],
      metadata: reminder,
    })),
  ];

  return feed
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 24);
}

function ModuleToggleCard({
  module,
  label,
  enabled,
  sound,
  push,
  priorityOverride,
  onToggle,
  onSound,
  onPush,
  onPriority,
}: {
  module: string;
  label: string;
  enabled: boolean;
  sound: boolean;
  push: boolean;
  priorityOverride?: string;
  onToggle: (enabled: boolean) => void;
  onSound: (enabled: boolean) => void;
  onPush: (enabled: boolean) => void;
  onPriority: (priority: string | null) => void;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-[#0E141A] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-1 text-xs text-secondary">{module}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" className="flex items-center justify-between rounded-[18px] border border-border bg-white/5 px-3 py-3 text-sm text-secondary" onClick={() => onSound(!sound)}>
          Sound
          <span className={cn('size-3 rounded-full', sound ? 'bg-[var(--accent-mint)]' : 'bg-white/20')} />
        </button>
        <button type="button" className="flex items-center justify-between rounded-[18px] border border-border bg-white/5 px-3 py-3 text-sm text-secondary" onClick={() => onPush(!push)}>
          Push
          <span className={cn('size-3 rounded-full', push ? 'bg-[var(--accent-mint)]' : 'bg-white/20')} />
        </button>
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-secondary">Priority override</label>
        <select
          className="w-full rounded-[18px] border border-border bg-[#0A1116] px-3 py-3 text-sm text-foreground outline-none"
          value={priorityOverride || ''}
          onChange={(event) => onPriority(event.target.value || null)}
        >
          <option value="">Auto</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const {
    notifications,
    allNotifications,
    unreadCount,
    notificationsByPriority,
    notificationGroups,
    notificationActivity,
    pinnedNotifications,
    loading,
    saving,
    markAsRead,
    markAsArchived,
    markAsPinned,
    dismissNotification,
    restoreNotification,
    markAllAsRead,
    loadNotifications,
  } = useNotifications();
  const { settings, moduleSettings, saveSettings, toggleModule, updateModulePreference, setPriorityOverride } = useNotificationSettings();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { investments } = useInvestments();
  const { trades } = useTradingJournal();
  const { events } = useEvents();
  const { reminders } = useReminders();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeView, setActiveView] = useState<'notifications' | 'activity'>('notifications');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const filteredGroups = useMemo(() => {
    const base = groupNotifications(notifications.filter((notification) => matchesQuery(notification, query) && isMatchingFilter(notification, activeFilter)));
    return base;
  }, [activeFilter, notifications, query]);

  const filteredNotifications = useMemo(() => filteredGroups.flatMap((group) => group.notifications), [filteredGroups]);

  const activityFeed = useMemo(() => buildActivityFeed(
    allNotifications,
    transactions,
    goals,
    investments,
    trades,
    events,
    reminders,
  ), [allNotifications, events, goals, investments, reminders, trades, transactions]);

  const filteredActivityFeed = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activityFeed.filter((item) => {
      if (!normalized) return true;
      return [item.title, item.subtitle, item.module, item.priority]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [activityFeed, query]);

  const metrics = useMemo(() => ({
    unread: unreadCount,
    critical: notificationsByPriority.critical.length,
    pinned: pinnedNotifications.length,
    activity: filteredActivityFeed.length,
  }), [filteredActivityFeed.length, notificationsByPriority.critical.length, pinnedNotifications.length, unreadCount]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartY(event.touches[0]?.clientY ?? null);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    setTouchEndY(event.touches[0]?.clientY ?? null);
  };

  const handleTouchEnd = () => {
    if (touchStartY !== null && touchEndY !== null && typeof window !== 'undefined' && window.scrollY <= 0 && touchEndY - touchStartY > 100) {
      setIsRefreshing(true);
      void loadNotifications().finally(() => setIsRefreshing(false));
    }
    setTouchStartY(null);
    setTouchEndY(null);
  };

  const topModules = Object.entries(moduleSettings).slice(0, 8);

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-main pb-28 text-foreground"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 lg:px-6">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,231,199,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(126,231,199,0.08),transparent_24%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.38em] text-secondary">Smart Notification Center</p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Real-time financial intelligence, grouped and prioritized.</h1>
              <p className="mt-3 text-sm text-secondary sm:text-base">PFOS now centralizes alerts, activity, and priority routing across budgets, goals, investments, trading, EMI, bills, security, automation, and reports.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadNotifications()}
                className="inline-flex items-center gap-2 rounded-[22px] border border-border bg-[#10161D] px-4 py-3 text-sm font-medium text-secondary transition hover:border-[rgba(126,231,199,0.30)] hover:text-foreground"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="inline-flex items-center gap-2 rounded-[22px] bg-[var(--accent-mint)] px-4 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            </div>
          </div>
        </div>

        {isRefreshing ? (
          <div className="mt-4 flex items-center gap-3 rounded-[24px] border border-border bg-card px-4 py-3 text-sm text-secondary">
            <RefreshCw className="size-4 animate-spin text-[var(--accent-mint)]" />
            Pull to refresh in progress.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Unread" value={metrics.unread} icon={<Bell className="size-4" />} accent="text-[var(--accent-mint)]" />
          <SummaryCard label="Critical" value={metrics.critical} icon={<Sparkles className="size-4" />} accent="text-red-300" />
          <SummaryCard label="Pinned" value={metrics.pinned} icon={<Pin className="size-4" />} accent="text-orange-300" />
          <SummaryCard label="Activity" value={metrics.activity} icon={<Activity className="size-4" />} accent="text-[#7DD3FC]" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-secondary">Search and filters</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Find what matters fastest</h2>
                </div>
                <div className="flex items-center gap-2 rounded-[22px] border border-border bg-[#0A1116] px-4 py-3 text-sm text-secondary">
                  <Search size={16} />
                  <span>{filteredNotifications.length} notifications</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-[28px] border border-border bg-[#0A1116] px-4 py-3">
                <Search size={18} className="text-secondary" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, module, priority, or message"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-secondary"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm transition',
                      activeFilter === filter.id
                        ? 'border-[rgba(126,231,199,0.28)] bg-[rgba(126,231,199,0.10)] text-[var(--accent-mint)]'
                        : 'border-border bg-white/5 text-secondary hover:bg-white/8',
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-secondary">Smart grouped notifications</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Notification stacks</h2>
                </div>
                <span className="rounded-full border border-border bg-white/5 px-3 py-2 text-xs text-secondary">Realtime</span>
              </div>

              <div className="mt-5 space-y-4">
                {loading ? (
                  <div className="rounded-[28px] border border-dashed border-border bg-[#0B1116] px-5 py-10 text-center text-secondary">
                    Loading live notifications...
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-border bg-[#0B1116] px-5 py-10 text-center">
                    <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full border border-border bg-card text-[var(--accent-mint)]">
                      <Bell className="size-6" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">No notifications</p>
                    <p className="mt-2 text-sm text-secondary">You&apos;re financially up to date.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false} mode="popLayout">
                    {filteredGroups.map((group) => (
                      <motion.section
                        key={group.key}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.22 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3 rounded-[24px] border border-border bg-[#0E141A] px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{group.label}</p>
                            <p className="text-xs text-secondary">{group.count} item{group.count === 1 ? '' : 's'}</p>
                          </div>
                          <button type="button" className="rounded-full border border-border bg-white/5 px-3 py-2 text-xs text-secondary transition hover:bg-white/8" onClick={() => setActiveView('activity')}>
                            View activity
                          </button>
                        </div>

                        <div className="space-y-3">
                          {group.notifications.map((notification) => (
                            <NotificationCard
                              key={notification.id}
                              notification={notification}
                              compact
                              onMarkAsRead={markAsRead}
                              onArchive={markAsArchived}
                              onDismiss={dismissNotification}
                              onPin={markAsPinned}
                              onRestore={restoreNotification}
                            />
                          ))}
                        </div>
                      </motion.section>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-secondary">Live activity feed</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Newest financial events</h2>
                </div>
                <button type="button" onClick={() => setActiveView('activity')} className="inline-flex items-center gap-2 rounded-[20px] border border-border bg-white/5 px-4 py-2 text-sm text-secondary transition hover:bg-white/8">
                  <Activity size={16} />
                  Timeline
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {filteredActivityFeed.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-border bg-[#0B1116] px-5 py-10 text-center text-secondary">
                    No activity yet.
                  </div>
                ) : filteredActivityFeed.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-[24px] border border-border bg-[#0E141A] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-border bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-secondary">
                            {getNotificationModuleLabel(entry.module)}
                          </span>
                          <span className={cn(
                            'rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.24em]',
                            entry.tone === 'critical' ? 'bg-red-500/15 text-red-300' : entry.tone === 'high' ? 'bg-orange-500/15 text-orange-300' : entry.tone === 'medium' ? 'bg-[rgba(126,231,199,0.12)] text-[var(--accent-mint)]' : 'bg-white/5 text-secondary',
                          )}>
                            {normalizeNotificationPriority(entry.priority)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-foreground">{entry.title}</p>
                        <p className="mt-1 text-sm text-secondary">{entry.subtitle}</p>
                      </div>
                      {entry.url ? (
                        <Link href={entry.url} className="grid size-10 place-items-center rounded-2xl border border-border bg-white/5 text-secondary transition hover:bg-white/8">
                          <ArrowRight className="size-4" />
                        </Link>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-secondary">Priority engine</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Critical routing</h2>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[var(--accent-mint)]">
                  <Sparkles className="size-5" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <PriorityRow label="Critical" value={notificationsByPriority.critical.length} accent="bg-red-500" />
                <PriorityRow label="High" value={notificationsByPriority.high.length} accent="bg-orange-500" />
                <PriorityRow label="Medium" value={notificationsByPriority.medium.length} accent="bg-[var(--accent-mint)]" />
                <PriorityRow label="Low" value={notificationsByPriority.low.length} accent="bg-white/20" />
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-secondary">Actions</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Fast controls</h2>
                </div>
                <SlidersHorizontal className="size-5 text-secondary" />
              </div>

              <div className="mt-5 space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2 rounded-[22px] border-border bg-[#0E141A] text-secondary hover:bg-white/5" onClick={() => void markAllAsRead()}>
                  <CheckCheck className="size-4" />
                  Mark everything read
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 rounded-[22px] border-border bg-[#0E141A] text-secondary hover:bg-white/5" onClick={() => void loadNotifications()}>
                  <RefreshCw className="size-4" />
                  Sync feed
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 rounded-[22px] border-border bg-[#0E141A] text-secondary hover:bg-white/5" onClick={() => setActiveFilter('critical')}>
                  <Sparkles className="size-4" />
                  Show critical
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 rounded-[22px] border-border bg-[#0E141A] text-secondary hover:bg-white/5" onClick={() => setActiveView(activeView === 'notifications' ? 'activity' : 'notifications')}>
                  <Activity className="size-4" />
                  Toggle view
                </Button>
              </div>
            </div>

            <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-secondary">Notification settings</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Module preferences</h2>
                </div>
                <ShieldCheck className="size-5 text-[var(--accent-mint)]" />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[24px] border border-border bg-[#0E141A] px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Sound</p>
                  <p className="text-xs text-secondary">Play sound for enabled modules</p>
                </div>
                <Switch checked={Boolean(settings?.soundEnabled ?? true)} onCheckedChange={(enabled) => void saveSettings({ soundEnabled: enabled })} />
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[24px] border border-border bg-[#0E141A] px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Push-ready</p>
                  <p className="text-xs text-secondary">Keep the channel ready for native push delivery</p>
                </div>
                <Switch checked={Boolean(settings?.pushEnabled ?? true)} onCheckedChange={(enabled) => void saveSettings({ pushEnabled: enabled })} />
              </div>

              <div className="mt-4 space-y-3">
                {topModules.map(([module, preference]) => (
                  <ModuleToggleCard
                    key={module}
                    module={module}
                    label={getNotificationModuleLabel(module)}
                    enabled={Boolean(preference.enabled)}
                    sound={Boolean(preference.sound)}
                    push={Boolean(preference.push)}
                    priorityOverride={settings?.priorityOverride?.[module as keyof typeof settings.priorityOverride]}
                    onToggle={(enabled) => void toggleModule(module as any, enabled)}
                    onSound={(enabled) => void updateModulePreference(module as any, { sound: enabled })}
                    onPush={(enabled) => void updateModulePreference(module as any, { push: enabled })}
                    onPriority={(priority) => void setPriorityOverride(module as any, priority as any)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.30)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-secondary">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
        </div>
        <div className={cn('grid size-11 place-items-center rounded-2xl border border-border bg-white/5', accent)}>{icon}</div>
      </div>
    </div>
  );
}

function PriorityRow({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex items-center justify-between rounded-[24px] border border-border bg-[#0E141A] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={cn('size-2.5 rounded-full', accent)} />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-secondary">{value}</span>
    </div>
  );
}
