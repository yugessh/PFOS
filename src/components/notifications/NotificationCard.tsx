'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Archive, CheckCheck, Pin, PinOff, Trash2, Clock3, ArrowRight, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  getNotificationIcon,
  getNotificationModuleLabel,
  getNotificationPriorityLabel,
  getPriorityClasses,
  normalizeNotificationPriority,
  type NotificationModel,
} from '@/src/lib/notifications';

interface NotificationCardProps {
  notification: NotificationModel;
  onMarkAsRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onPin?: (id: string, isPinned?: boolean) => void;
  onRestore?: (id: string) => void;
  compact?: boolean;
}

function formatRelativeTime(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onArchive,
  onDismiss,
  onPin,
  onRestore,
  compact = false,
}: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const priorityTone = normalizeNotificationPriority(notification.priority);
  const priorityStyles = getPriorityClasses(notification.priority);
  const icon = getNotificationIcon(notification.type);
  const moduleLabel = getNotificationModuleLabel(notification.module || notification.metadata?.category);
  const priorityLabel = getNotificationPriorityLabel(notification.priority);

  const actionHref = notification.actionUrl || notification.action?.url;

  const handlePrimaryAction = async () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (actionHref) {
      window.location.href = actionHref;
    }
  };

  const handleSwipeEnd = async (offsetX: number) => {
    if (isActioning) return;

    if (offsetX > 96 && onPin) {
      setIsActioning(true);
      await Promise.resolve(onPin(notification.id, !notification.isPinned));
      setIsActioning(false);
    } else if (offsetX < -96) {
      setIsActioning(true);
      if (notification.isPinned && onPin) {
        await Promise.resolve(onPin(notification.id, false));
      } else if (notification.isArchived && onRestore) {
        await Promise.resolve(onRestore(notification.id));
      } else if (onDismiss) {
        await Promise.resolve(onDismiss(notification.id));
      } else if (onArchive) {
        await Promise.resolve(onArchive(notification.id));
      }
      setIsActioning(false);
    }
  };

  const baseClasses = compact
    ? 'rounded-[24px] border border-border bg-[rgba(21,26,32,0.92)] shadow-[0_18px_45px_rgba(0,0,0,0.30)]'
    : 'rounded-[28px] border border-border bg-[rgba(21,26,32,0.92)] shadow-[0_24px_60px_rgba(0,0,0,0.34)]';

  const toneAccent = priorityTone === 'critical'
    ? 'from-red-500/20 via-transparent to-transparent'
    : priorityTone === 'high'
      ? 'from-orange-500/20 via-transparent to-transparent'
      : priorityTone === 'medium'
        ? 'from-[rgba(126,231,199,0.20)] via-transparent to-transparent'
        : 'from-white/10 via-transparent to-transparent';

  const content = (
    <motion.div
      layout
      whileHover={{ y: compact ? -1 : -2 }}
      className={`${baseClasses} relative overflow-hidden ${notification.isPinned ? 'ring-1 ring-[rgba(126,231,199,0.22)]' : ''} ${notification.isRead ? 'opacity-95' : ''}`}
    >
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${toneAccent}`} />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[18px] border border-border bg-[#0C1117] text-lg shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
            <span aria-hidden>{icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.26em] text-secondary">
                    {moduleLabel}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${priorityStyles.badge}`}>
                    {priorityTone === 'critical' ? <AlertTriangle className="size-3" /> : null}
                    {priorityLabel}
                  </span>
                  {notification.isPinned ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(126,231,199,0.22)] bg-[rgba(126,231,199,0.10)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--accent-mint)]">
                      Pinned
                    </span>
                  ) : null}
                </div>
                <p className={`mt-3 text-sm font-semibold ${notification.isRead ? 'text-secondary' : 'text-foreground'}`}>
                  {notification.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  {isExpanded || notification.message.length <= 140
                    ? notification.message
                    : `${notification.message.slice(0, 140)}...`
                  }
                </p>
              </div>

              {!notification.isRead ? (
                <div className="mt-0.5 size-2.5 rounded-full bg-[var(--accent-mint)] shadow-[0_0_0_4px_rgba(126,231,199,0.14)]" />
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-secondary">
                <Clock3 className="size-3.5" />
                <span>{formatRelativeTime(notification.createdAt)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {notification.action ? (
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-[rgba(126,231,199,0.18)] bg-[rgba(126,231,199,0.12)] px-3 py-2 text-xs font-semibold text-[var(--accent-mint)] transition hover:bg-[rgba(126,231,199,0.18)]"
                  >
                    {notification.action.label}
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : actionHref ? (
                  <Link
                    href={actionHref}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-[rgba(126,231,199,0.18)] bg-[rgba(126,231,199,0.12)] px-3 py-2 text-xs font-semibold text-[var(--accent-mint)] transition hover:bg-[rgba(126,231,199,0.18)]"
                  >
                    Open
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : null}

                {!notification.isRead && onMarkAsRead ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-white/5 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-white/8"
                  >
                    <CheckCheck className="size-3.5" />
                    Read
                  </button>
                ) : null}

                {onPin ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onPin(notification.id, !notification.isPinned);
                    }}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-white/5 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-white/8"
                  >
                    {notification.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                    {notification.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                ) : null}

                {notification.isArchived && onRestore ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRestore(notification.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-white/5 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-white/8"
                  >
                    Restore
                  </button>
                ) : null}

                {onDismiss ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDismiss(notification.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-white/5 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-white/8"
                  >
                    <Trash2 className="size-3.5" />
                    Dismiss
                  </button>
                ) : onArchive ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onArchive(notification.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-white/5 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-white/8"
                  >
                    <Archive className="size-3.5" />
                    Archive
                  </button>
                ) : null}
              </div>
            </div>

            {!compact && notification.message.length > 140 ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsExpanded((current) => !current);
                }}
                className="mt-3 text-xs font-medium text-[var(--accent-mint)] transition hover:underline"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (compact) {
    return (
      <motion.div
        layout
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          void handleSwipeEnd(info.offset.x);
        }}
        whileTap={{ scale: 0.995 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
*** End Patch