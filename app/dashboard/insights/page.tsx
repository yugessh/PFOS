import React from 'react';
import InsightsDashboard from '@/src/components/ai-insights/insights-dashboard';
import AssistantPanel from '@/src/components/ai-insights/assistant-panel';

export default function Page() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Insights</h1>
          <p className="text-sm text-gray-400">Intelligent alerts and suggestions based on your activity.</p>
        </div>
      </div>

      <InsightsDashboard />
      <AssistantPanel />
    </div>
  );
}
