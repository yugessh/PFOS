import React from 'react';
import AutomationDashboard from '@/src/components/automation/automation-dashboard';
import RemindersTimeline from '@/src/components/automation/reminders-timeline';

export default function Page() {
  const sampleReminders: any[] = [];
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
          <RemindersTimeline items={sampleReminders} />
        </aside>
      </div>
    </div>
  );
}
