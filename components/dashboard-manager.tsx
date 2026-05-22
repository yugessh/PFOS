"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ResponsiveGrid from '@/components/dashboard-grid/ResponsiveGrid';
import { DashboardWidget } from '@/components/dashboard-grid/DashboardWidget';
import { useAuthContext } from '@/src/context/AuthContext';
import dashboardService, { DashboardWidgetRecord, WidgetSize } from '@/src/services/firestore/dashboard.service';
import { QuickActionsWidget } from '@/components/widgets/quick-actions-widget';
import { CurrentNetWorthCard, NetWorthCard } from '@/components/net-worth-card';
import { BudgetSummaryCard as BudgetCard } from '@/components/budget-card';
import { GoalCard } from '@/components/goal-card';
import { InvestmentCard } from '@/components/investment-card';
import { CompactTransactionFeed } from '@/components/compact-transaction-feed';
import { WidgetSettings } from '@/components/widget-settings';
import { useNetWorth } from '@/src/hooks/useNetWorth';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useBudgets } from '@/src/hooks/useBudgets';
import { useGoals } from '@/src/hooks/useGoals';
import { useInvestments } from '@/src/hooks/useInvestments';

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

export function DashboardManager() {
  const { user } = useAuthContext();
  const uid = user?.uid;
  const { netWorthData } = useNetWorth();
  const { transactions } = useTransactions();
  const { budgetSummary } = useBudgets(transactions || []);
  const { goals } = useGoals();
  const { investments } = useInvestments();
  const [widgets, setWidgets] = useState<DashboardWidgetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [query, setQuery] = useState('');
  const [settingsWidgetId, setSettingsWidgetId] = useState<string | null>(null);

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

  // grid layout mapping (for react-grid-layout)
  const layout = widgets.map((w, i) => {
    const size = (w.size || 'medium') as WidgetSize;
    const span = SIZE_TO_SPAN(size);
    return {
      i: w.id || String(i),
      x: (w.settings?.grid?.x) ?? 0,
      y: (w.settings?.grid?.y) ?? i,
      w: span.col,
      h: span.row,
    };
  });

  const onLayoutChange = async (nextLayout: any[]) => {
    const updates = nextLayout.map((it) => {
      const id = String(it.i);
      const widget = widgets.find((w) => w.id === id);
      if (!widget) return null;
      return { id, updates: { settings: { ...widget.settings, grid: { x: it.x, y: it.y, w: it.w, h: it.h } }, position: (it.y || 0) * 1000 + (it.x || 0) } };
    }).filter(Boolean) as { id: string; updates: Partial<DashboardWidgetRecord> }[];

    setWidgets((prev) => prev.map((w) => {
      const u = updates.find((x) => x.id === w.id);
      return u ? { ...w, ...u.updates } : w;
    }));

    await Promise.all(updates.map((u) => dashboardService.updateWidget(uid!, u.id, u.updates)));
  };

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

  const renderWidgetBody = (w: DashboardWidgetRecord) => {
    switch (w.widgetType) {
      case 'networth':
        return (
          <CurrentNetWorthCard
            netWorth={netWorthData?.netWorth || 0}
            monthlyChange={netWorthData?.monthlyChange}
            monthlyChangePercent={netWorthData?.monthlyChangePercent}
          />
        );
      case 'transactions':
        return <CompactTransactionFeed transactions={transactions || []} />;
      case 'budgets':
        return (
          <BudgetCard
            totalBudget={budgetSummary?.totalBudget || 0}
            totalSpent={budgetSummary?.totalSpent || 0}
            healthScore={
              budgetSummary && budgetSummary.totalBudget > 0
                ? Math.max(0, Math.round((1 - budgetSummary.totalSpent / budgetSummary.totalBudget) * 100))
                : 100
            }
          />
        );
      case 'goals':
        return (
          <GoalCard
            goal={
              (goals && goals.length > 0 && (goals[0] as any)) || {
                category: 'General',
                name: 'No goals set',
                currentAmount: 0,
                targetAmount: 1,
                deadline: new Date(),
              }
            }
          />
        );
      case 'investments':
        return (
          <InvestmentCard
            investment={
              (investments && investments.length > 0 && (investments[0] as any)) || {
                id: '0',
                name: 'No investments',
                type: 'other',
                currentValue: 0,
                investedAmount: 0,
                returns: 0,
                returnPercentage: 0,
              }
            }
          />
        );
      case 'quick':
        return <QuickActionsWidget />;
      case 'trading':
      case 'bills':
      case 'emi':
      case 'calendar':
      case 'ai':
      case 'cashflow':
      case 'lending':
      case 'notifications':
        return (
          <div className="rounded-[26px] border border-border bg-background p-5 text-sm text-secondary">
            <div className="font-semibold text-foreground capitalize">{w.widgetType.replace(/-/g, ' ')}</div>
            <p className="mt-2">This widget is available in the dashboard library. Add your financial data to view live insights here.</p>
          </div>
        );
      default:
        return (
          <div className="rounded-[26px] border border-border bg-background p-5 text-sm text-secondary">
            <div className="font-semibold text-foreground">Unsupported widget</div>
            <p className="mt-2">This widget type is not yet supported. Please remove it from the dashboard library or choose a different card.</p>
          </div>
        );
    }
  };

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
          <ResponsiveGrid layout={layout} onLayoutChange={onLayoutChange}>
            {widgets.map((w, idx) => {
              const size = (w.size || 'medium') as WidgetSize;
              const span = SIZE_TO_SPAN(size);
              return (
                <motion.div key={w.id || String(idx)} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <DashboardWidget title={w.widgetType} className="drag-handle" colSpan={span.col as any} rowSpan={span.row as any}>
                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        {renderWidgetBody(w)}
                      </div>
                        <div className="ml-3 flex flex-col items-end gap-2">
                        <select value={w.size} onChange={(e) => updateWidget(w.id!, { size: e.target.value as WidgetSize })} className="rounded-md bg-card px-2 py-1 text-sm">
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                          <option value="full">Full</option>
                        </select>
                        <div className="flex gap-2">
                          <button title="Settings" onClick={() => setSettingsWidgetId(w.id ?? null)} className="rounded-md bg-card px-2 py-1 text-xs">Settings</button>
                          <button title="Collapse" onClick={() => updateWidget(w.id!, { collapsed: !w.collapsed })} className="rounded-md bg-card px-2 py-1 text-xs">{w.collapsed ? 'Expand' : 'Collapse'}</button>
                          <button title="Hide" onClick={() => updateWidget(w.id!, { visible: false })} className="rounded-md bg-card px-2 py-1 text-xs">Hide</button>
                          <button title="Remove" onClick={() => removeWidget(w.id!)} className="rounded-md bg-red-600 px-2 py-1 text-xs text-white">Remove</button>
                        </div>
                      </div>
                    </div>
                  </DashboardWidget>
                </motion.div>
              );
            })}
          </ResponsiveGrid>
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
      {/* Widget settings modal */}
      {settingsWidgetId != null && (
        // dynamically import to avoid SSR issues
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <React.Suspense fallback={null}>
          {/* @ts-ignore */}
          <WidgetSettings widget={widgets.find((w) => w.id === settingsWidgetId) ?? null} open={true} onClose={() => setSettingsWidgetId(null)} onSave={(updates) => { if (settingsWidgetId) void updateWidget(settingsWidgetId, updates); }} />
        </React.Suspense>
      )}
    </div>
  );
}
