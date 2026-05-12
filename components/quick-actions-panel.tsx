'use client';

import { Plus, Send, Download, Settings } from 'lucide-react';

export function QuickActionsPanel() {
  const actions = [
    { icon: Plus, label: 'Add Transaction', color: 'text-blue-600' },
    { icon: Send, label: 'Transfer Money', color: 'text-green-600' },
    { icon: Download, label: 'Download Report', color: 'text-purple-600' },
    { icon: Settings, label: 'Settings', color: 'text-gray-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            className="flex items-center gap-2 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all hover:bg-muted"
          >
            <Icon size={18} className={action.color} />
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
