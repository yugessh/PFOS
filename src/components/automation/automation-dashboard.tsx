"use client";

import React from 'react';
import { useAutomations } from '@/src/hooks/useAutomations';
import { motion } from 'framer-motion';

export default function AutomationDashboard() {
  const { automations, loading, reload, toggle } = useAutomations();

  if (loading) return <div className="animate-pulse h-40 bg-[#151A20] rounded-[28px] p-4" />;

  if (!automations || automations.length === 0) {
    return (
      <div className="bg-[#151A20] rounded-[28px] p-6 text-center">
        <div className="text-gray-400">No active automations</div>
        <div className="mt-3">
          <button className="bg-emerald-500 text-black px-4 py-2 rounded-md">+ Create Automation</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {automations.map((a) => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151A20] rounded-[28px] p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{a.automationName}</div>
            <div className="text-sm text-gray-400">{a.automationType} • {a.linkedModule ?? 'General'}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">{a.frequency && (typeof a.frequency === 'string' ? a.frequency : a.frequency.type)}</div>
            <label className="inline-flex items-center">
              <input type="checkbox" checked={!!a.enabled} onChange={() => void toggle(a.id!, !a.enabled)} className="mr-2" />
              <span className="text-sm">Enabled</span>
            </label>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
