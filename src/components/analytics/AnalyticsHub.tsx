'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import { ChartCard } from '@/components/chart-card';
import { CurrentNetWorthCard, NetWorthCard } from '@/components/net-worth-card';
import { NetWorthTrendChart } from '@/components/net-worth-trend-chart';
import { IncomeExpenseChart } from '@/components/income-expense-chart';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import InsightsDashboard from '@/src/components/ai-insights/insights-dashboard';
import AssistantPanel from '@/src/components/ai-insights/assistant-panel';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useNetWorth } from '@/src/hooks/useNetWorth';
import { useTradingJournal } from '@/src/hooks/useTradingJournal';
import { useInvestments } from '@/src/hooks/useInvestments';
import { useGoals } from '@/src/hooks/useGoals';
import { useBudgets } from '@/src/hooks/useBudgets';
import { useInsights } from '@/src/hooks/useInsights';
import { useAccounts } from '@/src/hooks/useAccounts';
import { buildCashflowSeries, buildExpenseBreakdown, buildInvestmentAllocation, buildMonthlySpendingSeries, buildTradePerformance } from '@/src/lib/analytics';
import { formatCurrency } from '@/src/lib/currency';

type AnalyticsTab = 'overview' | 'reports' | 'stats' | 'insights';

const TABS: Array<{ value: AnalyticsTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'reports', label: 'Reports' },
  { value: 'stats', label: 'Stats' },
  { value: 'insights', label: 'Insights' },
];

function resolveTab(value: string | null): AnalyticsTab {
  if (value === 'reports' || value === 'stats' || value === 'insights') return value;
  return 'overview';
}

export default function AnalyticsHub({ initialTab = 'overview' }: { initialTab?: AnalyticsTab }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<AnalyticsTab>(resolveTab(searchParams.get('tab')) || initialTab);

  const { transactions, loading: transactionsLoading } = useTransactions();
  const { netWorthData, history: netWorthHistory, loading: netWorthLoading } = useNetWorth();
  const { trades, stats: tradingStats, loading: tradingLoading } = useTradingJournal();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { getGoalStats, loading: goalsLoading } = useGoals();
  const { budgetSummary, loading: budgetsLoading } = useBudgets(transactions);
  const { insights, loading: insightsLoading } = useInsights();
  const { accounts } = useAccounts();

  const monthlySeries = useMemo(() => buildMonthlySpendingSeries(transactions), [transactions]);
  const expenseBreakdown = useMemo(() => buildExpenseBreakdown(transactions), [transactions]);
  const cashflowSeries = useMemo(() => buildCashflowSeries(transactions), [transactions]);
  const tradePerformance = useMemo(() => buildTradePerformance(trades), [trades]);
  const investmentAllocation = useMemo(() => buildInvestmentAllocation(investments), [investments]);
  const goalStats = useMemo(() => getGoalStats(), [getGoalStats]);
  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + (account.balance || 0), 0), [accounts]);

  const loading = transactionsLoading || netWorthLoading || tradingLoading || investmentsLoading || goalsLoading || budgetsLoading;

  const updateTab = (nextTab: AnalyticsTab) => {
    setTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextTab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const totals = useMemo(() => ({
    income: monthlySeries.reduce((sum, row) => sum + row.income, 0),
    spending: monthlySeries.reduce((sum, row) => sum + row.spending, 0),
    cashflow: cashflowSeries.reduce((sum, row) => sum + row.value, 0),
    investments: investmentAllocation.reduce((sum, item) => sum + item.value, 0),
  }), [cashflowSeries, investmentAllocation, monthlySeries]);

  const tradeChartData = useMemo(
    () => tradePerformance.pnlSeries.map((row) => ({ date: row.date, value: row.pnl })),
    [tradePerformance.pnlSeries]
  );

  return (
    <div className="min-h-screen bg-main pb-24 animate-in fade-in duration-300">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
              <p className="mt-2 text-sm text-secondary">Unified financial analysis across reports, stats, and insights</p>
            </div>
            <div className="text-sm text-secondary">
              {loading ? 'Loading analytics…' : `${transactions.length} transactions • ${insights.length} insights`}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 rounded-[28px] border border-border bg-card/90 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
          <Tabs value={tab} onValueChange={(value) => updateTab(resolveTab(value))} className="gap-4">
            <TabsList className="grid w-full grid-cols-4 bg-muted/40">
              {TABS.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-0 space-y-5">
              <section className="grid gap-5 lg:grid-cols-3">
                <AnalyticsCard title={`Net worth: ${formatCurrency(netWorthData.netWorth || 0)}`} subtitle="Net Worth Analytics">
                  <CurrentNetWorthCard
                    netWorth={netWorthData.netWorth || 0}
                    monthlyChange={netWorthHistory[0]?.gainLoss || 0}
                    monthlyChangePercent={netWorthHistory[0]?.gainLossPercent || 0}
                  />
                </AnalyticsCard>

                <AnalyticsCard title="Trading performance" subtitle="Trading Analytics">
                  <div className="grid grid-cols-2 gap-3 text-sm text-secondary">
                    <div>Total trades: {tradePerformance.total}</div>
                    <div>Win rate: {tradePerformance.winRate.toFixed(1)}%</div>
                    <div>Total P&L: {formatCurrency(tradePerformance.totalPnl)}</div>
                    <div>Avg RR: {tradePerformance.averageRR.toFixed(2)}</div>
                  </div>
                </AnalyticsCard>

                <AnalyticsCard title="Goals & budgets" subtitle="Planning Analytics">
                  <div className="grid grid-cols-2 gap-3 text-sm text-secondary">
                    <div>Goals: {goalStats.total}</div>
                    <div>Completed: {goalStats.completed}</div>
                    <div>Saved: {formatCurrency(goalStats.totalSaved)}</div>
                    <div>Budget usage: {formatCurrency(budgetSummary.totalSpent || 0)}</div>
                  </div>
                </AnalyticsCard>
              </section>

              <section className="grid gap-5 lg:grid-cols-3">
                <NetWorthCard title="Total Assets" value={netWorthData.totalAssets || 0} trend="up" change={netWorthData.totalAssets || 0} changePercent={0} />
                <NetWorthCard title="Total Liabilities" value={netWorthData.totalLiabilities || 0} trend={netWorthData.totalLiabilities > 0 ? 'down' : 'neutral'} change={netWorthData.totalLiabilities || 0} changePercent={0} />
                <NetWorthCard title="Monthly Change" value={Math.abs(netWorthHistory[0]?.gainLoss || 0)} trend={(netWorthHistory[0]?.gainLoss || 0) > 0 ? 'up' : (netWorthHistory[0]?.gainLoss || 0) < 0 ? 'down' : 'neutral'} change={netWorthHistory[0]?.gainLoss || 0} changePercent={netWorthHistory[0]?.gainLossPercent || 0} />
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <NetWorthTrendChart data={netWorthHistory} loading={netWorthLoading} />
                <ChartCard title="Cashflow trend" description="Last 30 days of transaction flow">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cashflowSeries}>
                        <XAxis dataKey="date" tick={{ fill: '#9AA0A6' }} />
                        <YAxis tick={{ fill: '#9AA0A6' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#7EE7C7" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </section>
            </TabsContent>

            <TabsContent value="reports" className="mt-0 space-y-5">
              <section className="grid gap-5 lg:grid-cols-2">
                <IncomeExpenseChart data={monthlySeries} />
                <ExpensePieChart data={expenseBreakdown} />
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <AnalyticsCard title="Reports snapshot" subtitle="Summary metrics">
                  <div className="grid grid-cols-2 gap-3 text-sm text-secondary">
                    <div>Income: {formatCurrency(totals.income)}</div>
                    <div>Spending: {formatCurrency(totals.spending)}</div>
                    <div>Cashflow: {formatCurrency(totals.cashflow)}</div>
                    <div>Investments: {formatCurrency(totals.investments)}</div>
                  </div>
                </AnalyticsCard>
                <AnalyticsCard title="Report automation" subtitle="Scheduling">
                  <div className="space-y-3 text-sm text-secondary">
                    <p>Schedule monthly summaries and reuse the existing report service when needed.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">Schedule monthly report</Button>
                      <Button size="sm" variant="outline">Export summary</Button>
                    </div>
                  </div>
                </AnalyticsCard>
              </section>
            </TabsContent>

            <TabsContent value="stats" className="mt-0 space-y-5">
              <section className="grid gap-5 lg:grid-cols-2">
                <ExpensePieChart data={expenseBreakdown} />
                <AnalyticsCard title="Category indicators" subtitle="Stats snapshot">
                  <div className="space-y-3">
                    {expenseBreakdown.slice(0, 5).map((item) => (
                      <div key={item.category} className="flex items-center justify-between text-sm text-secondary">
                        <span>{item.category}</span>
                        <span>{item.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                    {expenseBreakdown.length === 0 ? <p className="text-sm text-secondary">No expense data available.</p> : null}
                  </div>
                </AnalyticsCard>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <ChartCard title="Trading curve" description="PnL over time">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tradeChartData}>
                        <XAxis dataKey="date" tick={{ fill: '#9AA0A6' }} />
                        <YAxis tick={{ fill: '#9AA0A6' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#7EE7C7" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </section>
            </TabsContent>

            <TabsContent value="insights" className="mt-0 space-y-5">
              <section className="grid gap-5 lg:grid-cols-2">
                <InsightsDashboard />
                <AnalyticsCard title="AI context" subtitle="Insights summary">
                  <div className="space-y-2 text-sm text-secondary">
                    <p>{insightsLoading ? 'Loading insights…' : `${insights.length} active insights loaded`}</p>
                    <p>Insights remain sourced from the existing AI service and can be reviewed without changing backend logic.</p>
                  </div>
                </AnalyticsCard>
              </section>
              <AssistantPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
