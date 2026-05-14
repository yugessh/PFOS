'use client';

import { useState } from 'react';
import { Archive, Check, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getNotificationIcon, getNotificationColor, type NotificationModel } from '@/src/lib/notifications';

interface NotificationCardProps {
  notification: NotificationModel;
  onMarkAsRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  compact?: boolean;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onArchive,
  compact = false
}: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = getNotificationColor(notification.type);
  const icon = getNotificationIcon(notification.type);

  const handleCardClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  if (compact) {
    return (
      <div
        className={`rounded-lg border p-3 transition-all cursor-pointer ${
          notification.isRead
            ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
            : `bg-${color}-50 border-${color}-200 dark:bg-${color}-900/20 dark:border-${color}-800`
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          <div className={`size-8 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center flex-shrink-0`}>
            <span className="text-sm">{icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {notification.title}
              </p>
              {!notification.isRead && (
                <div className="size-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border transition-all cursor-pointer ${
        notification.isRead
          ? 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          : `bg-${color}-50 border-${color}-200 dark:bg-${color}-900/20 dark:border-${color}-800`
      }`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`size-10 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center flex-shrink-0`}>
            <span className="text-base">{icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {notification.title}
              </p>
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <div className="size-2 bg-blue-500 rounded-full" />
                )}
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
                  notification.priority === 'urgent'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : notification.priority === 'high'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      : notification.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {notification.priority === 'urgent' && <AlertTriangle className="size-3" />}
                  {notification.priority}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {isExpanded || notification.message.length <= 120
                ? notification.message
                : `${notification.message.substring(0, 120)}...`
              }
            </p>

            {notification.message.length > 120 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:underline"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="size-3" />
                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
              </p>

              <div className="flex gap-1">
                {!notification.isRead && onMarkAsRead && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="size-4 text-gray-500" />
                  </button>
                )}
                {onArchive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(notification.id);
                    }}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Archive"
                  >
                    <Archive className="size-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}