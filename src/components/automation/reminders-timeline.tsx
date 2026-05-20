"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ReminderItem {
  id?: string;
  title: string;
  date: string | Date;
  priority?: 'high' | 'medium' | 'low';
  source?: string;
}

export default function RemindersTimeline({ items }: { items: ReminderItem[] }) {
  if (!items || items.length === 0) {
    return <div className="bg-[#151A20] rounded-[28px] p-6 text-center text-gray-400">No reminders</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <motion.div key={it.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-[#151A20] rounded-lg p-3 flex items-start justify-between">
          <div>
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-gray-400">{new Date(it.date).toLocaleString()} • {it.source}</div>
          </div>
          <div className="text-sm text-gray-300">{it.priority}</div>
        </motion.div>
      ))}
    </div>
  );
}
