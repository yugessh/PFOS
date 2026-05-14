'use client';

import { useState } from 'react';
import { X, CheckCheck, Archive, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/src/hooks/useNotifications';
import { NotificationCard } from './NotificationCard';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    loading,
    saving,
    markAsRead,
    markAsArchived,
    markAllAsRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bell className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="size-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'unread'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllAsRead}
              disabled={saving}
              className="w-full justify-start gap-2 text-blue-600 dark:text-blue-400"
            >
              <CheckCheck className="size-4" />
              Mark all as read
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="size-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Bell className="size-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeTab === 'unread'
                  ? 'You\'re all caught up!'
                  : 'Notifications about your finances will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="relative">
                  <NotificationCard
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onArchive={markAsArchived}
                    compact
                  />
                  {/* Archive button overlay */}
                  <button
                    type="button"
                    onClick={() => markAsArchived(notification.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Archive"
                  >
                    <Archive className="size-3 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}