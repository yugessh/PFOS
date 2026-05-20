"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInsights } from '@/src/hooks/useInsights';

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const { insights, generateInsight } = useInsights();

  async function ask() {
    // Minimal local assistant: map a few queries to existing insights
    if (query.toLowerCase().includes('spend') || query.toLowerCase().includes('where')) {
      const s = insights.find(i => i.insightType === 'Spending Pattern');
      setAnswer(s ? s.description : 'No spending insight available');
      return;
    }
    if (query.toLowerCase().includes('emi')) {
      const s = insights.find(i => i.insightType === 'EMI Reminder');
      setAnswer(s ? s.description : 'No EMI reminders found');
      return;
    }
    setAnswer('I could not find a direct answer — try "Generate Insights"');
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {open && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-80 bg-[#151A20] rounded-[18px] p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask assistant..." className="flex-1 bg-transparent border rounded-md p-2 text-sm" />
            <button className="bg-emerald-500 text-black px-3 py-1 rounded-md" onClick={ask}>Ask</button>
          </div>
          <div className="text-sm text-gray-300 min-h-[40px]">{answer ?? 'Try: "Where did I spend most this month?"'}</div>
        </motion.div>
      )}

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOpen((s) => !s)} className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-lg">
        AI
      </motion.button>
    </div>
  );
}
