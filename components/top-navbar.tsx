'use client';

import { Bell, Settings, User } from 'lucide-react';

export function TopNavbar() {
  return (
    <div className="hidden lg:flex h-16 bg-background border-b border-border items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Welcome back! Here&apos;s your financial overview.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <Bell size={20} className="text-muted-foreground" />
        </div>
        <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <Settings size={20} className="text-muted-foreground" />
        </div>
        <div className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
          <User size={20} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
