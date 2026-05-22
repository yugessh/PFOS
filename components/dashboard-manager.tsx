"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardGrid } from '@/components/dashboard-grid/DashboardGrid';
import { DashboardWidget } from '@/components/dashboard-grid/DashboardWidget';
import { useAuthContext } from '@/src/context/AuthContext';
import dashboardService, { DashboardWidgetRecord, WidgetSize } from '@/src/services/firestore/dashboard.service';
import QuickActionsWidget from '@/components/widgets/quick-actions-widget';
import NetWorthCard from '@/components/net-worth-card';
import BudgetCard from '@/components/budget-card';
import GoalCard from '@/components/goal-card';
import InvestmentCard from '@/components/investment-card';
import CompactTransactionFeed from '@/components/compact-transaction-feed';

const SIZE_TO_SPAN = (size: WidgetSize) => {
  switch (size) {
    case 'small':
      return { col: 3, row: 1 };
    case 'medium':
      return { col: 6, row: 2 };
    case 'large':
      return { col: 9, row: 3 };
    case 'full':
      return { col: 12, row: 3 };
    default:
      return { col: 6, row: 2 };
  }
};

export default function DashboardManager() {
  const { user } = useAuthContext();
  const uid = user?.uid;
  const [widgets, setWidgets] = useState<DashboardWidgetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    setLoading(true);
    void (async () => {
      try {
        const w = await dashboardService.getWidgets(uid);
        if (!mounted) return;
        // sort by position ascending
        w.sort((a, b) => (a.position || 0) - (b.position || 0));
        setWidgets(w as DashboardWidgetRecord[]);
      } catch (e) {
        console.error('Failed to load dashboard widgets', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [uid]);

  const addWidget = async (type: string) => {
    if (!uid) return;
    const pos = Date.now();
    const res = await dashboardService.addWidget(uid, { widgetType: type, position: pos, size: 'medium', visible: true });
    // refetch
    const w = await dashboardService.getWidgets(uid);
    w.sort((a, b) => (a.position || 0) - (b.position || 0));
    setWidgets(w as DashboardWidgetRecord[]);
    setShowLibrary(false);
  };

  const updateWidget = async (id: string, updates: Partial<DashboardWidgetRecord>) => {
    if (!uid) return;
    await dashboardService.updateWidget(uid, id, updates);
    // optimistic update
    setWidgets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removeWidget = async (id: string) => {
    if (!uid) return;
    await dashboardService.deleteWidget(uid, id);
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  // simple HTML5 drag reorder
  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = async (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from)) return;
    if (from === toIdx) return;
    const next = [...widgets];
    const [moved] = next.splice(from, 1);
    next.splice(toIdx, 0, moved);
    // reassign positions
    const now = Date.now();
    const updated = next.map((w, i) => ({ ...w, position: now + i }));
    setWidgets(updated as DashboardWidgetRecord[]);
    // batch save
    await Promise.all(updated.map((w) => w.id ? dashboardService.updateWidget(uid!, w.id!, { position: w.position }) : Promise.resolve(null)));
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const filteredLibrary = useMemo(() => {
    const all = [
      { id: 'networth', name: 'Net Worth' },
      { id: 'transactions', name: 'Recent Transactions' },
      { id: 'budgets', name: 'Budget Summary' },
      { id: 'goals', name: 'Goal Progress' },
      { id: 'investments', name: 'Investment Portfolio' },
      { id: 'trading', name: 'Trading Performance' },
      { id: 'bills', name: 'Upcoming Bills' },
      { id: 'emi', name: 'EMI Due' },
      { id: 'calendar', name: 'Calendar Events' },
      { id: 'ai', name: 'AI Insights' },
      { id: 'cashflow', name: 'Cashflow' },
      { id: 'lending', name: 'Lending/Borrowing' },
      { id: 'notifications', name: 'Notifications' },
      { id: 'quick', name: 'Quick Actions' },
    ];
    if (!query) return all;
    return all.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  if (!uid) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Your Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowLibrary(true)} className="rounded-[28px] bg-accent-mint px-4 py-2 text-sm font-semibold text-[#071a0d] shadow-[0_8px_20px_rgba(126,231,199,0.18)]">
            + Add Widget
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">Loading widgets…</div>
        ) : widgets.length === 0 ? (
          <div className="rounded-[28px] border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground">Customize your financial workspace</h2>
            <p className="text-sm text-secondary mt-2">Add widgets to create your personal financial operating system.</p>
            <div className="mt-4">
              <button onClick={() => setShowLibrary(true)} className="rounded-[28px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_14px_36px_rgba(126,231,199,0.24)]">+ Add Widget</button>
            </div>
          </div>
        ) : (
          <DashboardGrid>
            {widgets.map((w, idx) => {
              const size = (w.size || 'medium') as WidgetSize;
              const span = SIZE_TO_SPAN(size);
              return (
                <div key={w.id || idx} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, idx)}>
                  <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                    <DashboardWidget title={w.widgetType} colSpan={span.col as any} rowSpan={span.row as any}>
                      <div className="flex items-start justify-between">
                        <div className="w-full">
                          {/* Map widget content */}
                          {w.widgetType === 'networth' && <NetWorthCard />}
                          {w.widgetType === 'transactions' && <CompactTransactionFeed transactions={[]} />}
                          {w.widgetType === 'budgets' && <BudgetCard />}
                          {w.widgetType === 'goals' && <GoalCard />}
                          {w.widgetType === 'investments' && <InvestmentCard />}
                          {w.widgetType === 'quick' && <QuickActionsWidget />}
                          {/* Fallback */}
                          {['trading','bills','emi','calendar','ai','cashflow','lending','notifications'].includes(w.widgetType) && (
                            <div className="text-sm text-secondary">{w.widgetType} widget — coming soon</div>
                          )}
                        </div>
                        <div className="ml-3 flex flex-col items-end gap-2">
                          <select value={w.size} onChange={(e) => updateWidget(w.id!, { size: e.target.value as WidgetSize })} className="rounded-md bg-card px-2 py-1 text-sm">
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="full">Full</option>
                          </select>
                          <div className="flex gap-2">
                            <button title="Collapse" onClick={() => updateWidget(w.id!, { collapsed: !w.collapsed })} className="rounded-md bg-card px-2 py-1 text-xs">{w.collapsed ? 'Expand' : 'Collapse'}</button>
                            <button title="Hide" onClick={() => updateWidget(w.id!, { visible: false })} className="rounded-md bg-card px-2 py-1 text-xs">Hide</button>
                            <button title="Remove" onClick={() => removeWidget(w.id!)} className="rounded-md bg-red-600 px-2 py-1 text-xs text-white">Remove</button>
                          </div>
                        </div>
                      </div>
                    </DashboardWidget>
                  </motion.div>
                </div>
              );
            })}
          </DashboardGrid>
        )}
      </div>

      <AnimatePresence>
        {showLibrary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowLibrary(false)} />
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} className="relative z-10 w-[min(880px,92%)] rounded-[28px] bg-card p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Add Widget</h3>
                <button onClick={() => setShowLibrary(false)} className="text-sm text-secondary">Close</button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search widgets" className="w-full rounded-md bg-card px-3 py-2 text-sm" />
                <div className="text-sm text-secondary">Type to filter</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {filteredLibrary.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-card px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{l.name}</div>
                      <div className="text-xs text-secondary">{l.id} widget</div>
                    </div>
                    <div>
                      <button onClick={() => addWidget(l.id)} className="rounded-[20px] bg-accent-mint px-3 py-2 text-sm font-semibold text-[#071a0d]">Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
