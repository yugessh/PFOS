'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/src/hooks/useNotifications';

interface NotificationBadgeProps {
  className?: string;
}

export function NotificationBadge({ className = '' }: NotificationBadgeProps) {
  const { unreadCount, getUnreadCount } = useNotifications();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const currentCount = await getUnreadCount();
      setCount(currentCount);
    };

    updateCount();

    // Update count every 30 seconds
    const interval = setInterval(updateCount, 30000);
    return () => clearInterval(interval);
  }, [getUnreadCount]);

  if (count === 0) {
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
          {count > 99 ? '99+' : count}
        </span>
      </div>
    </div>
  );
}