'use client';

import { useMemo, useState } from 'react';
import { StatCard } from '@/components/stat-card';
import { NetWorthCard } from '@/components/net-worth-card';
import { IncomeExpenseChart } from '@/components/income-expense-chart';
import { InvestmentAllocationChart } from '@/components/investment-allocation-chart';
import { ChartCard } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { ReminderCard } from '@/components/reminder-card';
import { RecentTransactionsTable } from '@/components/recent-transactions-table';
import { TransactionsTable } from '@/components/tables';
import { QuickActionsPanel } from '@/components/quick-actions-panel';
import { EMIProgressCard } from '@/components/emi-progress-card';
import { GoalCard } from '@/components/goal-card';
import { ExpensePieChart } from '@/components/expense-pie-chart';
import { DashboardGrid, DashboardSection, DashboardWidget } from '@/components/dashboard-grid';
import {
  createDefaultFinanceFilters,
  FilterBar,
  FINANCE_FILTER_ALL,
} from '@/components/filters';
import {
  accounts,
  transactions,
  transactionTableRows,
  savingsGoals,
  investments,
  reminders,
  emis,
  monthlySpending,
  expenseBreakdown,
} from '@/lib/demo-data';
import { Wallet, TrendingUp, CreditCard, Landmark, Target, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const [ledgerFilters, setLedgerFilters] = useState(createDefaultFinanceFilters);

  const ledgerCategoryOptions = useMemo(() => {
    const uniq = [...new Set(transactionTableRows.map((t) => t.category))].sort();
    return [
      { value: FINANCE_FILTER_ALL, label: 'All categories' },
      ...uniq.map((c) => ({ value: c, label: c })),
    ];
  }, []);

  const ledgerAccountOptions = useMemo(
    () => [
      { value: FINANCE_FILTER_ALL, label: 'All accounts' },
      ...accounts.map((a) => ({ value: a.name, label: a.name })),
    ],
    []
  );

  // Calculate summary metrics
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netWorth =
    accounts.reduce((sum, acc) => sum + acc.balance, 0) +
    investments.reduce((sum, inv) => sum + inv.currentValue, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Your personal finance overview</p>
        </div>
      </div>

      {/* Net Worth Card */}
      <NetWorthCard accounts={accounts} investments={investments} />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={`₹${(totalBalance / 100000).toFixed(2)}L`}
          icon={<Wallet size={20} />}
          trend="positive"
          change="+8.0% vs last month"
          description="Cash across all accounts"
        />
        <StatCard
          title="Monthly Income"
          value={`₹${(totalIncome / 1000).toFixed(1)}K`}
          icon={<TrendingUp size={20} />}
          trend="positive"
          change="+5.2% vs last month"
          description="Salary, interest, and credits"
        />
        <StatCard
          title="Monthly Expenses"
          value={`₹${(totalExpenses / 1000).toFixed(1)}K`}
          icon={<CreditCard size={20} />}
          trend="negative"
          change="+4.2% vs last month"
          description="Higher spend than prior period"
        />
        <StatCard
          title="Net Worth"
          value={`₹${(netWorth / 100000).toFixed(2)}L`}
          icon={<Landmark size={20} />}
          trend="neutral"
          change="Flat vs last month"
          description="Assets including investments"
        />
      </div>

      {/* Charts Section — composed with DashboardGrid */}
      <DashboardGrid>
        <DashboardWidget colSpan={6}>
          <IncomeExpenseChart data={monthlySpending} />
        </DashboardWidget>
        <DashboardWidget colSpan={6}>
          <ExpensePieChart data={expenseBreakdown} />
        </DashboardWidget>
      </DashboardGrid>

      <DashboardGrid>
        <DashboardWidget colSpan={6}>
          <InvestmentAllocationChart investments={investments} />
        </DashboardWidget>
        <DashboardWidget colSpan={6}>
          <ChartCard title="Savings Progress" description="Monthly savings trend">
            <div className="space-y-4">
              {monthlySpending.map((month) => {
                const savings = month.income - month.spending;
                const savingsRate = (savings / month.income) * 100;
                return (
                  <div key={month.month}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">{month.month}</span>
                      <span className="text-sm font-bold text-primary">
                        ₹{(savings / 1000).toFixed(1)}K ({savingsRate.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${savingsRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </DashboardWidget>
      </DashboardGrid>

      <DashboardGrid>
        <DashboardWidget>
          <ChartCard
            title="Cash runway"
            description="Illustrative placeholder — swap in any chart or analytics view"
            action={
              <Button type="button" variant="outline" size="sm" className="shrink-0">
                <BarChart3 className="size-4" aria-hidden />
                Open
              </Button>
            }
            footer={
              <p className="text-xs text-muted-foreground">
                Prototype shell only · no live series wired
              </p>
            }
          >
            <div
              className="flex h-[220px] w-full items-end justify-between gap-1.5 sm:gap-2"
              role="img"
              aria-label="Placeholder bar chart"
            >
              {[42, 68, 55, 80, 63, 90, 74, 58].map((pct, i) => (
                <div
                  key={i}
                  className="min-h-[12%] flex-1 rounded-t-md bg-primary/20 transition-colors hover:bg-primary/30 dark:bg-primary/25 dark:hover:bg-primary/35"
                  style={{ height: `${pct}%` }}
                />
              ))}
            </div>
          </ChartCard>
        </DashboardWidget>
      </DashboardGrid>

      {/* Main Content Grid */}
      <DashboardGrid>
        <DashboardWidget colSpan={8}>
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Transactions</h2>
            <RecentTransactionsTable transactions={transactions} limit={6} />
          </div>
        </DashboardWidget>
        <DashboardWidget colSpan={4}>
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
          <QuickActionsPanel />
        </DashboardWidget>
      </DashboardGrid>

      <DashboardSection
        title="Transaction ledger"
        description="Filter bar is UI-only — state is local; connect to queries when ready."
      >
        <div className="space-y-4">
          <FilterBar
            filters={ledgerFilters}
            onChange={setLedgerFilters}
            onReset={() => setLedgerFilters(createDefaultFinanceFilters())}
            categoryOptions={ledgerCategoryOptions}
            accountOptions={ledgerAccountOptions}
          />
          <TransactionsTable
            transactions={transactionTableRows}
            limit={8}
            emptyMessage="No ledger entries yet."
          />
        </div>
      </DashboardSection>

      {/* Savings Goals Section */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Target size={24} />
          Savings Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {savingsGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      <DashboardSection title="Upcoming Reminders">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      </DashboardSection>

      {/* EMI Progress Section */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">EMI Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emis.map((emi) => (
            <EMIProgressCard key={emi.id} emi={emi} />
          ))}
        </div>
      </div>
    </div>
  );
}
