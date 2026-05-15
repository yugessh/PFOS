'use client';

import { useState, useMemo } from 'react';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/src/hooks/useNotifications';

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    urgent: 'left-red-500',
    high: 'left-orange-500',
    medium: 'left-yellow-500',
    low: 'left-blue-500',
  };
  return colors[priority] || 'left-blue-500';
}

function getPriorityBgColor(priority: string) {
  const colors: Record<string, string> = {
    urgent: 'bg-red-50 dark:bg-red-900/10',
    high: 'bg-orange-50 dark:bg-orange-900/10',
    medium: 'bg-yellow-50 dark:bg-yellow-900/10',
    low: 'bg-blue-50 dark:bg-blue-900/10',
  };
  return colors[priority] || 'bg-blue-50 dark:bg-blue-900/10';
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

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof notifications> = {};

    notifications.forEach(notification => {
      const group = getDateGroup(notification.createdAt as any);
      if (!groups[group]) groups[group] = [];
      groups[group].push(notification);
    });

    // Sort each group by date descending
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => 
        new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime()
      );
    });

    return groups;
  }, [notifications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const groupOrder = ['Today', 'Yesterday', 'Earlier'];
  const orderedGroups = groupOrder.filter(g => groups[g]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{notifications.length} total</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No notifications</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Stay tuned for updates</p>
        </div>
      ) : (
        /* Notifications Feed */
        <div className="space-y-4 px-4 py-4">
          {orderedGroups.map(group => (
            <div key={group} className="space-y-1.5">
              {/* Date Group Header */}
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {group}
                </p>
              </div>

              {/* Notifications in group */}
              {(groups[group] || []).map(notification => (
                <div
                  key={notification.id}
                  className={`
                    flex gap-3 p-3 rounded-lg transition-colors cursor-pointer
                    ${notification.isRead 
                      ? 'bg-gray-50 dark:bg-gray-900/50' 
                      : `${getPriorityBgColor(notification.priority)}`
                    }
                    ${expandedId === notification.id ? 'ring-2 ring-blue-500' : ''}
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
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-1">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
                          {formatTime(notification.createdAt as any)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                        </div>
                      )}
                    </div>

                    {/* Expanded Actions */}
                    {expandedId === notification.id && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
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
                          className="flex-1 h-8 text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
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
