'use client';

import { Bell } from 'lucide-react';
import { useNotifications } from '@/src/hooks/useNotifications';

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className = '' }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) {
    return (
      <div className={`relative ${className}`}>
        <Bell className="size-5" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="size-5" />
      <div className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-[10px] font-bold text-white leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      </div>
    </div>
  );
}