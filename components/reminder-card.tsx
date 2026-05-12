'use client';

import { Reminder } from '@/lib/types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ReminderCardProps {
  reminder: Reminder;
}

export function ReminderCard({ reminder }: ReminderCardProps) {
  const daysUntilDue = Math.ceil((reminder.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDue <= 3 && daysUntilDue > 0;
  const isOverdue = daysUntilDue < 0;

  return (
    <div className="bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {reminder.completed ? (
            <CheckCircle size={18} className="text-green-600" />
          ) : isOverdue ? (
            <AlertCircle size={18} className="text-red-600" />
          ) : isUrgent ? (
            <AlertCircle size={18} className="text-amber-600" />
          ) : (
            <Clock size={18} className="text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-card-foreground text-sm">{reminder.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{reminder.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
              {reminder.category}
            </span>
            <span
              className={`text-xs font-medium ${
                isOverdue
                  ? 'text-red-600'
                  : isUrgent
                  ? 'text-amber-600'
                  : 'text-muted-foreground'
              }`}
            >
              {isOverdue
                ? `${Math.abs(daysUntilDue)} days overdue`
                : daysUntilDue === 0
                ? 'Due today'
                : `${daysUntilDue} days left`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
