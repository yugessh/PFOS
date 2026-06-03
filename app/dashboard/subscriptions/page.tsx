"use client";

import { SubscriptionDashboard } from '@/src/components/subscriptions/SubscriptionDashboard';

export default function SubscriptionsDashboardPage() {
  return (
    <div className="min-h-screen bg-main pb-24 animate-in fade-in duration-300">
      <div className="bg-[linear-gradient(180deg,rgba(21,26,32,0.98),rgba(8,10,15,0.96))] text-white px-4 pt-6 pb-7 rounded-b-[34px] border-b border-border shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
        <div>
          <p className="text-secondary text-xs mb-1 uppercase tracking-[0.25em]">Recurring Intelligence</p>
          <h1 className="text-2xl font-bold text-white">Subscription Center</h1>
        </div>
      </div>

      <div className="px-4 -mt-3">
        <SubscriptionDashboard />
      </div>
    </div>
  );
}
