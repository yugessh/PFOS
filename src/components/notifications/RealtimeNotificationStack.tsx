'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { NotificationModel, NotificationPriority } from '@/src/lib/notifications';

interface StackItem {
  id: string;
  notification: NotificationModel;
  insertedAt: number;
}

const MAX_STACK_ITEMS = 4;

function getAutoDismissMs(priority: NotificationPriority): number {
  if (priority === 'critical' || priority === 'urgent') return 9000;
  if (priority === 'high') return 7000;
  if (priority === 'medium') return 5500;
  return 4500;
}

function buildTargetUrl(notification: NotificationModel): string {
  if (notification.actionUrl) return notification.actionUrl;
  if (notification.action?.url) return notification.action.url;
  if (notification.module) return `/dashboard/${notification.module}`;
  return '/dashboard/notifications';
}

export function RealtimeNotificationStack() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const initializedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [stack, setStack] = useState<StackItem[]>([]);

  const { notifications, markAsRead, dismissNotification } = useNotifications();

  useEffect(() => {
    if (!initializedRef.current) {
      seenIdsRef.current = new Set(notifications.map((notification) => notification.id));
      initializedRef.current = true;
      return;
    }

    const unseen = notifications
      .filter((notification) => !seenIdsRef.current.has(notification.id))
      .filter((notification) => !notification.isArchived && !notification.isDismissed);

    if (unseen.length === 0) {
      notifications.forEach((notification) => seenIdsRef.current.add(notification.id));
      return;
    }

    setStack((previous) => {
      const currentIds = new Set(previous.map((item) => item.id));
      const nextItems = unseen
        .filter((notification) => !currentIds.has(notification.id))
        .map((notification) => ({
          id: notification.id,
          notification,
          insertedAt: Date.now(),
        }));

      const merged = [...previous, ...nextItems];
      return merged.slice(-MAX_STACK_ITEMS);
    });

    notifications.forEach((notification) => seenIdsRef.current.add(notification.id));
  }, [notifications]);

  useEffect(() => {
    if (stack.length === 0) return;

    const timeoutHandles = stack.map((item) => {
      const timeoutMs = getAutoDismissMs(item.notification.priority);
      return window.setTimeout(() => {
        setStack((previous) => previous.filter((entry) => entry.id !== item.id));
      }, timeoutMs);
    });

    return () => {
      timeoutHandles.forEach((handle) => window.clearTimeout(handle));
    };
  }, [stack]);

  const sortedStack = useMemo(() => {
    return [...stack].sort((left, right) => left.insertedAt - right.insertedAt);
  }, [stack]);

  const close = (id: string) => {
    setStack((previous) => previous.filter((item) => item.id !== id));
  };

  const openNotification = async (notification: NotificationModel) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    close(notification.id);
    router.push(buildTargetUrl(notification));
  };

  const dismiss = async (notification: NotificationModel) => {
    await dismissNotification(notification.id);
    close(notification.id);
  };

  if (sortedStack.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[80] flex w-full flex-col gap-3 p-3',
        isMobile ? 'left-0 top-0 items-stretch' : 'right-0 top-0 max-w-md items-end'
      )}
    >
      <AnimatePresence>
        {sortedStack.map((item) => {
          const notification = item.notification;

          return (
            <motion.div
              key={item.id}
              initial={isMobile ? { opacity: 0, y: -36 } : { opacity: 0, x: 36 }}
              animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
              exit={isMobile ? { opacity: 0, y: -24 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full rounded-[20px] border border-[rgba(126,231,199,0.24)] bg-[rgba(12,18,24,0.96)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid size-8 place-items-center rounded-xl border border-[rgba(126,231,199,0.24)] bg-[rgba(126,231,199,0.10)] text-[var(--accent-mint)]">
                  <Bell className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{notification.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-secondary">{notification.message}</p>
                </div>

                <button
                  type="button"
                  className="rounded-lg border border-border bg-white/5 p-1.5 text-secondary transition hover:bg-white/10"
                  onClick={() => close(notification.id)}
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-[rgba(126,231,199,0.24)] bg-[rgba(126,231,199,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-mint)]"
                  onClick={() => void openNotification(notification)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs text-secondary"
                  onClick={() => void markAsRead(notification.id)}
                >
                  <Check className="size-3" />
                  Mark read
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border bg-white/5 px-3 py-1.5 text-xs text-secondary"
                  onClick={() => void dismiss(notification)}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
