"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInsights } from '@/src/hooks/useInsights';
import type { InsightModel } from '@/src/lib/insights';

function PriorityBadge({ p }: { p: InsightModel['priority'] }) {
  const map: Record<string, string> = {
    critical: 'bg-rose-600 text-white',
    high: 'bg-orange-500 text-black',
    medium: 'bg-yellow-600 text-black',
    low: 'bg-gray-600 text-white',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full ${map[p] || 'bg-gray-600'}`}>{p}</span>;
}

export default function InsightsDashboard() {
  const { insights, loading, dismiss } = useInsights();

  if (loading) return <div className="animate-pulse h-40 bg-[#151A20] rounded-[28px] p-4" />;

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-[#151A20] rounded-[28px] p-6 text-center">
        <div className="text-gray-400">No AI insights yet</div>
        <div className="mt-3">
          <button className="bg-emerald-500 text-black px-4 py-2 rounded-md">Generate Insights</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((ins) => (
        <motion.div key={ins.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151A20] rounded-[28px] p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0f1720] flex items-center justify-center text-emerald-400">AI</div>
              <div>
                <div className="font-semibold">{ins.title}</div>
                <div className="text-sm text-gray-400">{ins.description}</div>
                <div className="text-xs text-gray-500 mt-1">Source: {ins.sourceModule ?? 'system'} • {ins.createdAt ? new Date(ins.createdAt).toLocaleString() : ''}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <PriorityBadge p={ins.priority} />
            <div className="flex gap-2">
              <button className="text-sm text-gray-400" onClick={() => void dismiss(ins.id!)}>Dismiss</button>
              <button className="text-sm text-emerald-400">Save</button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
