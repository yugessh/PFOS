'use client';

import React from 'react';
import AutomationDashboard from '@/src/components/automation/automation-dashboard';
import RemindersTimeline from '@/src/components/automation/reminders-timeline';
import { useReminders } from '@/src/hooks/useReminders';

export default function Page() {
  const { reminders } = useReminders();
  const timelineItems = reminders.slice(0, 12).map((reminder) => {
    const daysBefore = (reminder as any).reminderDaysBefore ?? 7;
    const priority = daysBefore <= 3 ? 'high' : daysBefore <= 7 ? 'medium' : 'low';
    return {
      id: reminder.id,
      title: reminder.title,
      date: reminder.dueDate || (reminder as any).dueDate || new Date(),
      priority: priority as 'high' | 'medium' | 'low',
      source: reminder.category || 'Reminder',
    };
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Automations</h1>
          <p className="text-sm text-gray-400">Create workflows, reminders and scheduled automations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AutomationDashboard />
        </div>
        <aside>
          <RemindersTimeline items={timelineItems} />
        </aside>
      </div>
    </div>
  );
}
