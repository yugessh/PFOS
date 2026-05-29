'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, CheckCheck, Archive, Pin, Search, X, Sparkles, Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/src/hooks/useNotifications';
import { NotificationCard } from './NotificationCard';
import { cn } from '@/lib/utils';
import { normalizeNotificationPriority } from '@/src/lib/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'critical', label: 'Critical' },
];

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    saving,
    markAsRead,
    markAsArchived,
    markAsPinned,
    dismissNotification,
    restoreNotification,
    markAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'pinned' | 'critical'>('all');
  const [query, setQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return notifications.filter((notification) => {
      const matchesTab = (() => {
        if (activeTab === 'unread') return !notification.isRead;
        if (activeTab === 'pinned') return Boolean(notification.isPinned);
        if (activeTab === 'critical') return normalizeNotificationPriority(notification.priority) === 'critical';
        return true;
      })();

      const matchesQuery = normalized === '' || [notification.title, notification.message, notification.type, notification.module, notification.priority]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));

      return matchesTab && matchesQuery;
    });
  }, [activeTab, notifications, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

      <motion.aside
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="relative ml-auto flex h-full w-full max-w-[460px] flex-col border-l border-border bg-[rgba(8,10,15,0.96)] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
      >
        <div className="border-b border-border bg-[rgba(21,26,32,0.96)] px-4 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-[18px] border border-[rgba(126,231,199,0.18)] bg-[rgba(126,231,199,0.10)] text-[var(--accent-mint)]">
                <Bell className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Notification Center</h2>
                <p className="text-xs text-secondary">{unreadCount} unread · realtime feed</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-2xl border border-border bg-white/5 text-secondary transition hover:bg-white/8">
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-[24px] border border-border bg-[#0A1116] px-4 py-3">
            <Search className="size-4 text-secondary" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alerts"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-secondary"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-4 py-2 text-sm transition',
                  activeTab === tab.id
                    ? 'border-[rgba(126,231,199,0.28)] bg-[rgba(126,231,199,0.10)] text-[var(--accent-mint)]'
                    : 'border-border bg-white/5 text-secondary hover:bg-white/8',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => void markAllAsRead()} disabled={saving || unreadCount === 0} className="justify-start gap-2 rounded-[18px] border-border bg-white/5 text-secondary hover:bg-white/8">
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
            <Button size="sm" variant="outline" asChild className="justify-start gap-2 rounded-[18px] border-border bg-white/5 text-secondary hover:bg-white/8">
              <Link href="/dashboard/notifications">
                <Activity className="size-4" />
                Open center
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-secondary">
              <div className="size-8 animate-spin rounded-full border-2 border-[var(--accent-mint)] border-t-transparent" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-[#0B1116] px-6 py-10 text-center">
              <div className="mb-4 grid size-14 place-items-center rounded-full border border-border bg-card text-[var(--accent-mint)]">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {query ? 'No matching notifications' : 'No notifications yet'}
              </p>
              <p className="mt-1 text-xs text-secondary">
                {query ? 'Try a different search term or filter.' : 'You are financially up to date.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredNotifications.map((notification) => (
                  <motion.div key={notification.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }} className="group relative">
                    <NotificationCard
                      notification={notification}
                      compact
                      onMarkAsRead={markAsRead}
                      onArchive={markAsArchived}
                      onDismiss={dismissNotification}
                      onPin={markAsPinned}
                      onRestore={restoreNotification}
                    />
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                      <button type="button" onClick={() => markAsPinned(notification.id, !notification.isPinned)} className="grid size-8 place-items-center rounded-full border border-border bg-[#0A1116] text-secondary transition hover:bg-white/8" title={notification.isPinned ? 'Unpin' : 'Pin'}>
                        <Pin className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => markAsArchived(notification.id)} className="grid size-8 place-items-center rounded-full border border-border bg-[#0A1116] text-secondary transition hover:bg-white/8" title="Archive">
                        <Archive className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
