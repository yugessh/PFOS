'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Archive, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/src/hooks/useNotifications';
import { NotificationCard } from './NotificationCard';

export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    saving,
    markAsRead,
    markAsArchived,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'high' | 'medium' | 'low'>('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'urgent':
      case 'high':
      case 'medium':
      case 'low':
        return notification.priority === filter;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-4 pt-6 pb-7 rounded-b-3xl shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-blue-100 text-xs mb-1">Notification Center</p>
            <h1 className="text-2xl font-bold">Stay Informed</h1>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="size-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-100">{unreadCount} unread</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-blue-100">Total</p>
            <p className="text-sm font-semibold">{notifications.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-blue-100">Unread</p>
            <p className="text-sm font-semibold">{unreadCount}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] text-blue-100">This Week</p>
            <p className="text-sm font-semibold">
              {notifications.filter(n =>
                n.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3">
        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter</span>
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                disabled={saving}
                className="gap-2"
              >
                <CheckCheck className="size-4" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'urgent', label: 'Urgent', count: notifications.filter(n => n.priority === 'urgent').length },
              { key: 'high', label: 'High', count: notifications.filter(n => n.priority === 'high').length },
              { key: 'medium', label: 'Medium', count: notifications.filter(n => n.priority === 'medium').length },
              { key: 'low', label: 'Low', count: notifications.filter(n => n.priority === 'low').length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="size-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Bell className="size-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filter === 'unread'
                ? 'You\'re all caught up!'
                : `No ${filter} priority notifications`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onArchive={markAsArchived}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}