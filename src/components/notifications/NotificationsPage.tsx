'use client';

import { useState, useMemo } from 'react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/src/hooks/useNotifications';

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-[var(--warning)]',
    medium: 'bg-[var(--accent-mint)]',
    low: 'bg-blue-500',
  };
  return colors[priority] || 'bg-blue-500';
}

function getPriorityBgColor(priority: string) {
  const colors: Record<string, string> = {
    urgent: 'bg-red-500/10 border border-red-500/15',
    high: 'bg-[rgba(255,204,102,0.10)] border border-[rgba(255,204,102,0.16)]',
    medium: 'bg-[rgba(126,231,199,0.08)] border border-[rgba(126,231,199,0.14)]',
    low: 'bg-blue-500/10 border border-blue-500/15',
  };
  return colors[priority] || 'bg-blue-500/10 border border-blue-500/15';
}

function formatTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Date(date).toLocaleDateString();
}

function getDateGroup(date: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const notifDate = new Date(date);
  const notifDateOnly = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

  if (notifDateOnly.getTime() === today.getTime()) return 'Today';
  if (notifDateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
  return 'Earlier';
}

export function NotificationsPage() {
  const { notifications, loading, saving, markAsRead, markAsArchived } = useNotifications();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof safeNotifications> = {};

    safeNotifications.forEach((notification) => {
      const group = getDateGroup(notification.createdAt as any);
      if (!groups[group]) groups[group] = [];
      groups[group].push(notification);
    });

    Object.keys(groups).forEach((group) => {
      groups[group].sort(
        (a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime()
      );
    });

    return groups;
  }, [safeNotifications]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-main">
        <div className="rounded-[32px] border border-border bg-card p-6 text-center shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
          <div className="inline-block w-8 h-8 border-2 border-accent-mint border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-secondary">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];
  const orderedGroups = groupOrder.filter((g) => groupedNotifications[g]?.length);

  return (
    <div className="min-h-screen bg-main pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg-main/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Notifications</h1>
            <p className="text-xs text-secondary">{notifications.length} total</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="mb-4 rounded-full border border-border bg-card p-4 text-3xl">🔔</div>
          <p className="text-secondary font-medium">No notifications</p>
          <p className="text-xs text-muted-foreground mt-1">Stay tuned for updates</p>
        </div>
      ) : (
        /* Notifications Feed */
        <div className="space-y-4 px-4 py-4">
          {orderedGroups.map(group => (
            <div key={group} className="space-y-1.5">
              {/* Date Group Header */}
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide">
                  {group}
                </p>
              </div>

              {/* Notifications in group */}
              {(groupedNotifications[group] || []).map(notification => (
                <div
                  key={notification.id}
                  className={`
                    flex gap-3 p-3 rounded-[24px] transition-colors cursor-pointer border shadow-[0_12px_24px_rgba(0,0,0,0.25)]
                    ${notification.isRead 
                      ? 'bg-card'
                      : `${getPriorityBgColor(notification.priority)}`
                    }
                    ${expandedId === notification.id ? 'ring-2 ring-accent-mint/30' : ''}
                  `}
                  onClick={() => setExpandedId(expandedId === notification.id ? null : notification.id)}
                >
                  {/* Left Indicator */}
                  <div className={`w-1 rounded-full flex-shrink-0 ${getPriorityColor(notification.priority)}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium line-clamp-1 ${
                          notification.isRead
                            ? 'text-secondary'
                            : 'text-white'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-secondary mt-0.5 line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {formatTime(notification.createdAt as any)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-[var(--accent-mint)] rounded-full mt-1" />
                        </div>
                      )}
                    </div>

                    {/* Expanded Actions */}
                    {expandedId === notification.id && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={saving}
                          >
                            <CheckCircle2 className="size-3 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs text-red-300 border-red-500/20 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsArchived(notification.id);
                          }}
                          disabled={saving}
                        >
                          <Trash2 className="size-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
