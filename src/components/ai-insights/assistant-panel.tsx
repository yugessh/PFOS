"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinancialCoach } from '@/src/hooks/useFinancialCoach';

export default function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { ask, queryAnswer } = useFinancialCoach();

  function handleAsk() {
    ask(query || 'How much did I spend on food last month?');
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {open && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-[min(24rem,calc(100vw-2rem))] rounded-[28px] border border-border bg-[#151A20] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
        >
          <div className="mb-3">
            <div className="text-sm font-semibold text-white">Financial Copilot</div>
            <div className="text-xs text-gray-400">Ask spending, affordability, goal, portfolio, or tax questions.</div>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask assistant..."
              className="flex-1 rounded-[18px] border border-border bg-[#080A0F] p-3 text-sm text-white outline-none"
            />
            <button className="rounded-[18px] bg-[#7EE7C7] px-4 py-3 text-sm font-semibold text-[#071a0d]" onClick={handleAsk}>
              Ask
            </button>
          </div>
          <div className="min-h-[72px] rounded-[20px] border border-border bg-[#0D141B] p-3 text-sm text-gray-300">
            <div>{queryAnswer?.answer ?? 'Try: "How much did I spend on food last month?"'}</div>
            {(queryAnswer?.supporting?.length || 0) > 0 ? (
              <div className="mt-3 space-y-1 text-xs text-gray-400">
                {queryAnswer?.supporting.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((s) => !s)}
        className="flex h-14 items-center gap-2 rounded-full bg-[#7EE7C7] px-5 text-sm font-semibold text-[#071a0d] shadow-lg"
      >
        AI Coach
      </motion.button>
    </div>
  );
}
