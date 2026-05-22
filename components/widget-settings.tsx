"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardWidgetRecord } from '@/src/services/firestore/dashboard.service';

export default function WidgetSettings({ widget, open, onClose, onSave }: { widget: DashboardWidgetRecord | null; open: boolean; onClose: () => void; onSave: (updates: Partial<DashboardWidgetRecord>) => void; }) {
  const [refresh, setRefresh] = useState(60);
  const [timeRange, setTimeRange] = useState('1M');
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!widget) return;
    setRefresh(widget.settings?.refresh || 60);
    setTimeRange(widget.settings?.timeRange || '1M');
    setCompact(!!widget.settings?.compact);
  }, [widget]);

  if (!open || !widget) return null;

  const save = () => {
    onSave({ settings: { ...widget.settings, refresh, timeRange, compact } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="relative z-10 w-full max-w-2xl rounded-t-[28px] bg-card p-4 shadow-lg md:rounded-[28px] md:mt-12">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{widget.widgetType} settings</h3>
          <button onClick={onClose} className="text-sm text-secondary">Close</button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-secondary">Refresh (sec)</span>
            <input type="number" value={refresh} onChange={(e) => setRefresh(Number(e.target.value))} className="w-24 rounded-md bg-card px-2 py-1 text-sm text-right" />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-secondary">Time range</span>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="w-32 rounded-md bg-card px-2 py-1 text-sm">
              <option value="1M">1M</option>
              <option value="6M">6M</option>
              <option value="1Y">1Y</option>
            </select>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-secondary">Compact mode</span>
            <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={save} className="rounded-[20px] bg-accent-mint px-4 py-2 text-sm font-semibold text-[#071a0d]">Save</button>
        </div>
      </motion.div>
    </div>
  );
}
