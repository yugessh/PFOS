'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Landmark,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { AddTransactionModal } from '@/src/components/transactions/AddTransactionModal';
import { AddAccountModal } from '@/src/components/accounts/AddAccountModal';
import AddGoalModal from '@/src/components/goals/AddGoalModal';
import AddInvestmentModal from '@/src/components/investments/AddInvestmentModal';
import { AddReminderModal } from '@/src/components/reminders/AddReminderModal';
import { TransactionFormData, type TransactionType } from '@/src/components/transactions/types';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useNetWorth } from '@/src/hooks/useNetWorth';
import { useGoals } from '@/src/hooks/useGoals';
import { useInvestments } from '@/src/hooks/useInvestments';
import { useEMI } from '@/src/hooks/useEMI';
import { useReminders } from '@/src/hooks/useReminders';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useRecurringTransactions } from '@/src/hooks/useRecurringTransactions';
import { useBudgets } from '@/src/hooks/useBudgets';
import { formatCurrencyCompact, formatDifference } from '@/src/lib/currency';
import { calculateGoalProgress } from '@/src/lib/goals';
import { calculateInvestmentReturn, getInvestmentTypeLabel } from '@/src/lib/investments';
import { StatCard } from '@/components/stat-card/StatCard';
import { ChartCard } from '@/components/charts/ChartCard';
import { CompactTransactionFeed } from '@/components/compact-transaction-feed';
import { ReminderCard } from '@/components/reminder-card';
import { NotificationCard } from '@/src/components/notifications/NotificationCard';
import { LoadingState } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyAccountsState } from '@/src/components/accounts/EmptyAccountsState';
import { EmptyFinanceState } from '@/src/components/EmptyFinanceState';
import { UniversalActionsSheet } from '@/components/universal-actions-sheet';
import { FloatingActionButton } from '@/components/floating-action-button';
import type { Account } from '@/src/services/firestore/accounts.service';
import type { Transaction } from '@/src/types/transaction';
import type { Reminder } from '@/types';
import { cn } from '@/lib/utils';

const CHART_COLORS = ['#00F5C4', '#38BDF8', '#60A5FA', '#A78BFA', '#F472B6', '#F59E0B', '#34D399'];

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function buildSparkline(series: number[]) {
  return series.map((value, index) => ({ index, value }));
}

function getIntensityClass(level: number) {
  if (level <= 0) return 'bg-white/5';
  if (level < 0.25) return 'bg-[#00F5C4]/10';
  if (level < 0.5) return 'bg-[#00F5C4]/20';
  if (level < 0.75) return 'bg-[#38BDF8]/30';
  return 'bg-[#38BDF8]/45';
}

function getHeatLabel(amount: number) {
  if (amount <= 0) return 'No spend';
  if (amount < 1000) return 'Light';
  if (amount < 5000) return 'Moderate';
  if (amount < 15000) return 'Active';
  return 'Heavy';
}

function KpiWidget({
  title,
  value,
  delta,
  deltaTrend,
  series,
  icon,
  accent,
}: {
  title: string;
  value: string;
  delta: string;
  deltaTrend: 'positive' | 'negative' | 'neutral';
  series: number[];
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-border bg-card/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-border/80 hover:bg-card-elevated">
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle at top right, ${accent}22, transparent 42%)` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.32em] text-secondary">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className={cn('mt-2 text-xs font-medium', deltaTrend === 'positive' ? 'text-[#00F5C4]' : deltaTrend === 'negative' ? 'text-[#F87171]' : 'text-secondary')}>
            {delta}
          </p>
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-border bg-white/5 text-foreground" style={{ boxShadow: `0 0 0 1px ${accent}22 inset, 0 12px 30px rgba(0,0,0,0.28)` }}>
          {icon}
        </div>
      </div>
      <div className="relative mt-4 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={buildSparkline(series)}>
            <defs>
              <linearGradient id={`spark-${title.replace(/\s+/g, '-').toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.45} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={accent} strokeWidth={2} fill={`url(#spark-${title.replace(/\s+/g, '-').toLowerCase()})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GoalProgressCard({
  title,
  amount,
  target,
  progress,
  deadline,
}: {
  title: string;
  amount: number;
  target: number;
  progress: number;
  deadline: Date;
}) {
  const remaining = Math.max(target - amount, 0);
  const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-[24px] border border-border bg-card-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-secondary">{daysRemaining >= 0 ? `${daysRemaining} days left` : 'Overdue'}</p>
        </div>
        <span className="rounded-full bg-[rgba(0,245,196,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[#00F5C4]">
          {Math.min(progress, 100).toFixed(0)}%
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(progress, 100)}%`, background: 'linear-gradient(90deg, #00F5C4 0%, #38BDF8 100%)' }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-secondary">Saved</p>
          <p className="mt-1 font-semibold text-foreground">{formatCurrencyCompact(amount)}</p>
        </div>
        <div>
          <p className="text-secondary">Remaining</p>
          <p className="mt-1 font-semibold text-foreground">{formatCurrencyCompact(remaining)}</p>
        </div>
      </div>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  sublabel,
  accent = '#00F5C4',
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-border bg-card-elevated px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel ? <p className="mt-0.5 text-xs text-secondary">{sublabel}</p> : null}
      </div>
      <p className="shrink-0 text-sm font-semibold" style={{ color: accent }}>{value}</p>
    </div>
  );
}

function ModalShell({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-secondary">Quick create</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card-elevated px-3 py-2 text-sm font-medium text-secondary transition hover:bg-white/5"
          >
            Close
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export function DashboardExecutive() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addInvestmentOpen, setAddInvestmentOpen] = useState(false);
  const [addReminderOpen, setAddReminderOpen] = useState(false);
  const [addActionsOpen, setAddActionsOpen] = useState(false);

  const { accounts, loading: accountsLoading, addAccount, error: accountsError, refresh: refreshAccounts } = useAccounts();
  const {
    transactions,
    addTransaction,
    getTotals,
    loading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useTransactions();
  const { netWorthData, history: netWorthHistory, loading: netWorthLoading } = useNetWorth();
  const { goals, loading: goalsLoading, getGoalStats } = useGoals();
  const { investments, loading: investmentsLoading, getTotalStats } = useInvestments();
  const { emiProgress, emiAlerts, loading: emiLoading } = useEMI();
  const { upcomingReminders, reminderAlerts, loading: remindersLoading } = useReminders();
  const { notifications, unreadCount, notificationsByPriority, loading: notificationsLoading } = useNotifications();
  const { recurringAlerts } = useRecurringTransactions();
  const { budgetSummary } = useBudgets(transactions || []);

  const { income: totalIncome, expenses: totalExpenses } = getTotals();
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || account.currentBalance || 0), 0);

  const currentMonthKey = monthKey(currentDate);
  const currentMonthTransactions = useMemo(() => {
    const targetYear = currentDate.getFullYear();
    const targetMonth = currentDate.getMonth();

    return (transactions || []).filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === targetYear && transactionDate.getMonth() === targetMonth;
    });
  }, [transactions, currentDate]);

  const recentTransactions = useMemo(() => {
    return [...(transactions || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [transactions]);

  const currentMonthIncome = useMemo(
    () => currentMonthTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0),
    [currentMonthTransactions]
  );

  const currentMonthExpenses = useMemo(
    () => currentMonthTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0),
    [currentMonthTransactions]
  );

  const savingsRate = currentMonthIncome > 0 ? Math.max(0, ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100) : 0;
  const cashflow = currentMonthIncome - currentMonthExpenses;

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
      return {
        key: monthKey(date),
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        income: 0,
        expense: 0,
      };
    });

    const bucketMap = new Map(months.map((entry) => [entry.key, entry]));

    (transactions || []).forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const key = monthKey(transactionDate);
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      if (transaction.type === 'income') bucket.income += transaction.amount;
      if (transaction.type === 'expense') bucket.expense += transaction.amount;
    });

    return months;
  }, [transactions, currentDate]);

  const spendingBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    currentMonthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const key = (transaction.category || 'other').toString();
        totals.set(key, (totals.get(key) || 0) + transaction.amount);
      });

    return Array.from(totals.entries())
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [currentMonthTransactions]);

  const balanceDistribution = useMemo(() => {
    return accounts
      .filter((account) => (account.balance || account.currentBalance || 0) > 0)
      .map((account, index) => ({
        name: account.name,
        value: account.balance || account.currentBalance || 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [accounts]);

  const weekHeatmap = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; amount: number; label: string; level: number }> = [];
    const amounts: number[] = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const amount = (transactions || [])
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transaction.type === 'expense'
            && transactionDate.getFullYear() === year
            && transactionDate.getMonth() === month
            && transactionDate.getDate() === day;
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      amounts.push(amount);
      cells.push({
        date,
        amount,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        level: 0,
      });
    }

    const maxAmount = Math.max(...amounts, 1);
    return cells.map((cell) => ({
      ...cell,
      level: cell.amount / maxAmount,
    }));
  }, [transactions, currentDate]);

  const topGoals = useMemo(() => {
    return [...goals]
      .sort((a, b) => calculateGoalProgress(b).progress - calculateGoalProgress(a).progress)
      .slice(0, 3);
  }, [goals]);

  const goalStats = getGoalStats();
  const investmentStats = getTotalStats();
  const healthMomentum = useMemo(() => {
    if (!netWorthHistory || netWorthHistory.length < 2) return 0;
    const latest = netWorthHistory[netWorthHistory.length - 1];
    const previous = netWorthHistory[netWorthHistory.length - 2];
    if (!previous?.netWorth) return 0;
    return ((latest.netWorth - previous.netWorth) / Math.max(Math.abs(previous.netWorth), 1)) * 100;
  }, [netWorthHistory]);

  const budgetHealth = budgetSummary?.totalBudget > 0
    ? Math.max(0, 100 - (budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)
    : 72;
  const goalHealth = goalStats.total > 0 ? goalStats.overallProgress : 55;
  const alertPressure = Math.max(0, 100 - (unreadCount * 5 + (emiAlerts.filter((alert) => alert.isOverdue).length * 16)));
  const netWorthHealth = netWorthData.netWorth >= 0 ? Math.min(100, 55 + Math.max(-20, Math.min(healthMomentum, 35))) : 28;
  const financialHealthScore = Math.round((budgetHealth + goalHealth + alertPressure + netWorthHealth) / 4);

  const emiTotalMonthly = emiProgress.reduce((sum, emi) => sum + (emi.monthlyInstallment || 0), 0);
  const overdueAlerts = [
    ...emiAlerts.filter((alert) => alert.isOverdue),
    ...reminderAlerts.filter((alert) => alert.isOverdue),
    ...recurringAlerts.filter((alert) => alert.isOverdue),
  ];
  const upcomingAlerts = [
    ...emiAlerts.filter((alert) => !alert.isOverdue),
    ...reminderAlerts.filter((alert) => !alert.isOverdue),
    ...recurringAlerts.filter((alert) => !alert.isOverdue),
  ].slice(0, 4);

  const reminderCards = upcomingReminders.slice(0, 3).map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    description: reminder.notes || reminder.category || reminder.type,
    dueDate: reminder.dueDate,
    completed: reminder.isPaid,
    category: reminder.category,
  })) satisfies Reminder[];

  const monthlySparkline = monthlyTrend.map((item) => item.income - item.expense);
  const healthSparkline = netWorthHistory.length
    ? netWorthHistory.map((item) => item.netWorth)
    : [0, 1, 1, 2, 2, 3];
  const goalSparkline = goals.length
    ? goals.map((goal) => calculateGoalProgress(goal).progress)
    : [0, 12, 20, 32, 48, 55];
  const alertSparkline = buildSparkline([0, unreadCount, overdueAlerts.length, unreadCount + overdueAlerts.length, unreadCount, overdueAlerts.length]).map((item) => item.value);

  const currencyKpi = formatMoney(currentMonthIncome - currentMonthExpenses);

  if (accountsLoading || transactionsLoading || netWorthLoading || goalsLoading || investmentsLoading || emiLoading || remindersLoading || notificationsLoading) {
    return (
      <div className="min-h-[60vh] rounded-[32px] border border-border bg-card/80 p-4 sm:p-6">
        <LoadingState type="dashboard" className="mx-auto max-w-6xl" />
      </div>
    );
  }

  if (accountsError || transactionsError) {
    return (
      <ErrorState
        title="Unable to load your dashboard"
        description={accountsError || transactionsError || 'We could not load your financial overview right now.'}
        retryAction={
          <button
            type="button"
            onClick={() => {
              refreshAccounts?.();
              refreshTransactions?.();
            }}
            className="rounded-full bg-[#00F5C4] px-5 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_14px_36px_rgba(0,245,196,0.24)] transition hover:brightness-95"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (accounts.length === 0 && !accountsLoading) {
    return (
      <div className="space-y-4">
        <EmptyAccountsState onAddAccount={() => setAddAccountOpen(true)} />
        <AddAccountModal
          open={addAccountOpen}
          onOpenChange={setAddAccountOpen}
          onSave={async (accountData: Partial<Account>) => {
            await addAccount(accountData);
          }}
        />
      </div>
    );
  }

  if (transactions.length === 0 && !transactionsLoading) {
    return (
      <div className="space-y-4">
        <EmptyFinanceState onAddTransaction={() => setAddActionsOpen(true)} />
        <UniversalActionsSheet
          open={addActionsOpen}
          onOpenChange={setAddActionsOpen}
          onAddExpense={() => {
            setTransactionType('expense');
            setAddTransactionOpen(true);
          }}
          onAddIncome={() => {
            setTransactionType('income');
            setAddTransactionOpen(true);
          }}
          onTransfer={() => {
            setTransactionType('transfer');
            setAddTransactionOpen(true);
          }}
          onAddAccount={() => setAddAccountOpen(true)}
          onAddGoal={() => setAddGoalOpen(true)}
          onAddInvestment={() => setAddInvestmentOpen(true)}
          onAddReminder={() => setAddReminderOpen(true)}
        />
        <AddTransactionModal
          open={addTransactionOpen}
          onOpenChange={setAddTransactionOpen}
          defaultType={transactionType}
          onSave={(transaction: TransactionFormData) => addTransaction(transaction)}
        />
        <AddAccountModal
          open={addAccountOpen}
          onOpenChange={setAddAccountOpen}
          onSave={async (accountData: Partial<Account>) => {
            await addAccount(accountData);
          }}
        />
        <ModalShell open={addGoalOpen} title="Goal" onClose={() => setAddGoalOpen(false)}>
          <AddGoalModal onClose={() => setAddGoalOpen(false)} />
        </ModalShell>
        <ModalShell open={addInvestmentOpen} title="Investment" onClose={() => setAddInvestmentOpen(false)}>
          <AddInvestmentModal onClose={() => setAddInvestmentOpen(false)} onDone={() => setAddInvestmentOpen(false)} />
        </ModalShell>
        <AddReminderModal
          open={addReminderOpen}
          onOpenChange={setAddReminderOpen}
          onSave={async () => {
            setAddReminderOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-28 text-foreground animate-in fade-in duration-300">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,245,196,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_30%),linear-gradient(180deg,#0B1120_0%,#0B1120_35%,#080A0F_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle,rgba(0,245,196,0.10),transparent_60%)] blur-3xl" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
          <section className="overflow-hidden rounded-[32px] border border-border bg-[linear-gradient(135deg,rgba(17,24,39,0.94),rgba(26,35,50,0.96))] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.34em] text-secondary">Financial health score</p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{financialHealthScore}</h1>
                <p className="max-w-xl text-sm leading-relaxed text-secondary">
                  Executive view of cashflow, goal momentum, investments, and alerts for {monthLabel(currentDate)}.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-secondary transition hover:bg-card-elevated"
                  >
                    <ChevronLeft size={16} />
                    Prev month
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date())}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-secondary transition hover:bg-card-elevated"
                  >
                    <RefreshCw size={16} />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-secondary transition hover:bg-card-elevated"
                  >
                    Next month
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div
                  className="grid size-28 place-items-center rounded-full border border-border bg-[#111827]"
                  style={{ background: `conic-gradient(#00F5C4 ${financialHealthScore}%, rgba(255,255,255,0.06) 0)` }}
                >
                  <div className="grid size-20 place-items-center rounded-full bg-[#0B1120] text-center shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-secondary">Score</p>
                      <p className="text-2xl font-semibold text-foreground">{financialHealthScore}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2 text-xs text-secondary">
                  <span className="rounded-full border border-border bg-white/5 px-3 py-1">Budget {budgetHealth.toFixed(0)}%</span>
                  <span className="rounded-full border border-border bg-white/5 px-3 py-1">Goals {goalHealth.toFixed(0)}%</span>
                  <span className="rounded-full border border-border bg-white/5 px-3 py-1">Alerts {alertPressure.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[32px] border border-border bg-[linear-gradient(135deg,rgba(26,35,50,0.95),rgba(17,24,39,0.98))] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-secondary">Net worth hero</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{formatCurrencyCompact(netWorthData.netWorth)}</h2>
                <p className={cn('mt-2 text-sm font-medium', healthMomentum >= 0 ? 'text-[#00F5C4]' : 'text-[#F87171]')}>
                  {formatDifference(netWorthData.netWorth - (netWorthHistory.at(-2)?.netWorth || netWorthData.netWorth))} this month
                </p>
              </div>
              <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[#00F5C4] shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[22px] border border-border bg-card-elevated px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-secondary">Assets</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrencyCompact(netWorthData.totalAssets)}</p>
              </div>
              <div className="rounded-[22px] border border-border bg-card-elevated px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-secondary">Liabilities</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrencyCompact(netWorthData.totalLiabilities)}</p>
              </div>
              <div className="rounded-[22px] border border-border bg-card-elevated px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-secondary">Cash balance</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrencyCompact(totalBalance)}</p>
              </div>
              <div className="rounded-[22px] border border-border bg-card-elevated px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-secondary">Monthly flow</p>
                <p className={cn('mt-2 text-lg font-semibold', cashflow >= 0 ? 'text-[#00F5C4]' : 'text-[#F87171]')}>{currencyKpi}</p>
              </div>
            </div>
            <div className="mt-5 h-20 overflow-hidden rounded-[24px] border border-border bg-black/10 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthHistory.slice(-12)}>
                  <defs>
                    <linearGradient id="networthGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F5C4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#00F5C4" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="netWorth" stroke="#00F5C4" strokeWidth={2.5} fill="url(#networthGlow)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiWidget
            title="Monthly cashflow"
            value={formatMoney(cashflow)}
            delta={`${formatMoney(currentMonthIncome)} income / ${formatMoney(currentMonthExpenses)} expense`}
            deltaTrend={cashflow >= 0 ? 'positive' : 'negative'}
            series={monthlySparkline}
            icon={<TrendingUp size={18} />}
            accent="#00F5C4"
          />
          <KpiWidget
            title="Savings rate"
            value={`${savingsRate.toFixed(0)}%`}
            delta={savingsRate >= 50 ? 'Strong discipline' : 'Needs more room'}
            deltaTrend={savingsRate >= 50 ? 'positive' : savingsRate >= 30 ? 'neutral' : 'negative'}
            series={monthlyTrend.map((item) => (item.income > 0 ? ((item.income - item.expense) / item.income) * 100 : 0))}
            icon={<BadgeCheck size={18} />}
            accent="#38BDF8"
          />
          <KpiWidget
            title="Goal completion"
            value={`${goalStats.overallProgress.toFixed(0)}%`}
            delta={`${goalStats.completed} of ${goalStats.total} goals completed`}
            deltaTrend={goalStats.overallProgress >= 50 ? 'positive' : 'neutral'}
            series={goalSparkline}
            icon={<Target size={18} />}
            accent="#A78BFA"
          />
          <KpiWidget
            title="Alert pressure"
            value={`${overdueAlerts.length + unreadCount}`}
            delta={`${overdueAlerts.length} overdue, ${unreadCount} unread`}
            deltaTrend={overdueAlerts.length > 0 ? 'negative' : 'neutral'}
            series={alertSparkline}
            icon={<Bell size={18} />}
            accent="#F59E0B"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]">
          <div className="space-y-4">
            <ChartCard
              title="Monthly income vs expense"
              description={`Trend line for the last 6 months ending ${monthLabel(currentDate)}`}
              className="border-border/80 bg-card/90"
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 16, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F5C4" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#00F5C4" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrencyCompact(value as number)} />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatMoney(value), name === 'income' ? 'Income' : 'Expense']}
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 18,
                      color: '#F8FAFC',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#00F5C4" strokeWidth={3} fill="url(#incomeGradient)" dot={false} />
                  <Area type="monotone" dataKey="expense" stroke="#38BDF8" strokeWidth={3} fill="url(#expenseGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <ChartCard
                title="Spending breakdown"
                description="Expense allocation for the selected month"
                className="border-border/80 bg-card/90"
              >
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={spendingBreakdown.length > 0 ? spendingBreakdown : [{ category: 'No expenses', value: 1 }]}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={112}
                      paddingAngle={4}
                    >
                      {(spendingBreakdown.length > 0 ? spendingBreakdown : [{ category: 'No expenses', value: 1 }]).map((entry, index) => (
                        <Cell key={`${entry.category}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMoney(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(spendingBreakdown.length > 0 ? spendingBreakdown : [{ category: 'No expenses', value: 0 }]).map((entry, index) => (
                    <span key={`${entry.category}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-secondary">
                      <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      {entry.category}
                    </span>
                  ))}
                </div>
              </ChartCard>

              <ChartCard
                title="Weekly spending heatmap"
                description="Daily expense density for the selected month"
                className="border-border/80 bg-card/90"
              >
                <div className="grid grid-cols-7 gap-2 text-[10px] uppercase tracking-[0.28em] text-secondary">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="text-center">{day}</div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {weekHeatmap.map((cell) => (
                    <div
                      key={cell.date.toISOString()}
                      title={`${cell.date.toDateString()} • ${formatMoney(cell.amount)} • ${getHeatLabel(cell.amount)}`}
                      className={cn(
                        'flex aspect-square flex-col justify-between rounded-[16px] border border-border p-2 text-left transition hover:-translate-y-0.5',
                        getIntensityClass(cell.level),
                        cell.amount === 0 ? 'text-secondary' : 'text-foreground'
                      )}
                    >
                      <span className="text-[10px] font-semibold">{cell.date.getDate()}</span>
                      <span className="text-[9px] leading-tight text-secondary">{formatCurrencyCompact(cell.amount)}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>

          <div className="space-y-4">
            <ChartCard title="Recent transactions" description="Latest activity across your accounts" className="border-border/80 bg-card/90">
              <CompactTransactionFeed transactions={recentTransactions as Transaction[]} />
            </ChartCard>

            <section className="rounded-[32px] border border-border bg-card/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-secondary">Goals progress</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{goalStats.completed} completed</h3>
                  <p className="mt-1 text-sm text-secondary">{goalStats.total} goals active with {formatCurrencyCompact(goalStats.totalSaved)} saved</p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[#00F5C4]">
                  <Target size={18} />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {topGoals.length > 0 ? (
                  topGoals.map((goal) => {
                    const progress = calculateGoalProgress(goal);
                    return (
                      <GoalProgressCard
                        key={goal.id}
                        title={goal.title}
                        amount={goal.savedAmount}
                        target={goal.targetAmount}
                        progress={progress.progress}
                        deadline={goal.deadline}
                      />
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-border bg-card-elevated p-4 text-sm text-secondary">No goals yet. Add one to track your next milestone.</div>
                )}
              </div>
            </section>

            <section className="rounded-[32px] border border-border bg-card/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-secondary">Investment snapshot</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{formatCurrencyCompact(investmentStats.totalValue)}</h3>
                  <p className={cn('mt-1 text-sm font-medium', investmentStats.totalReturn >= 0 ? 'text-[#00F5C4]' : 'text-[#F87171]')}>
                    {formatDifference(investmentStats.totalReturn)} return
                  </p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[#38BDF8]">
                  <Landmark size={18} />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <SnapshotRow label="Invested" value={formatCurrencyCompact(investmentStats.totalInvested)} sublabel="Capital deployed" />
                <SnapshotRow label="Current value" value={formatCurrencyCompact(investmentStats.totalValue)} sublabel="Marked to market" accent="#38BDF8" />
                <SnapshotRow label="Top holding" value={investments[0]?.name || 'No holdings'} sublabel={investments[0] ? getInvestmentTypeLabel(investments[0].type) : 'Add an investment to begin'} accent="#00F5C4" />
                {investments.slice(0, 3).map((investment) => {
                  const performance = calculateInvestmentReturn(investment);
                  return (
                    <div key={investment.id} className="rounded-[24px] border border-border bg-card-elevated p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{investment.name}</p>
                          <p className="mt-1 text-xs text-secondary">{getInvestmentTypeLabel(investment.type)}</p>
                        </div>
                        <span className={cn('text-xs font-semibold', performance.gain >= 0 ? 'text-[#00F5C4]' : 'text-[#F87171]')}>
                          {formatDifference(performance.gain)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[32px] border border-border bg-card/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-secondary">EMI snapshot</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{formatCurrencyCompact(emiTotalMonthly)}</h3>
                  <p className="mt-1 text-sm text-secondary">{emiAlerts.length} due soon, {emiAlerts.filter((alert) => alert.isOverdue).length} overdue</p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[#F59E0B]">
                  <CalendarClock size={18} />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {emiProgress.slice(0, 3).map((emi) => (
                  <div key={emi.id} className="rounded-[24px] border border-border bg-card-elevated p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{emi.title}</p>
                        <p className="mt-1 text-xs text-secondary">{emi.remaining} installments left</p>
                      </div>
                      <span className="text-sm font-semibold text-[#38BDF8]">{emi.progress.toFixed(0)}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#00F5C4,#38BDF8)]" style={{ width: `${Math.min(emi.progress, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-border bg-card/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-secondary">Upcoming bills and reminders</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{upcomingAlerts.length} scheduled</h3>
                  <p className="mt-1 text-sm text-secondary">{upcomingReminders.length} reminders, plus EMI and recurring alerts</p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[#00F5C4]">
                  <Bell size={18} />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {reminderCards.length > 0 ? (
                  reminderCards.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-border bg-card-elevated p-4 text-sm text-secondary">No upcoming reminders for the next few days.</div>
                )}
              </div>
              {overdueAlerts.length > 0 ? (
                <div className="mt-4 rounded-[24px] border border-[#F87171]/30 bg-[#F87171]/10 p-4 text-sm text-[#FCA5A5]">
                  {overdueAlerts.length} item{overdueAlerts.length === 1 ? '' : 's'} require attention.
                </div>
              ) : null}
            </section>

            <section className="rounded-[32px] border border-border bg-card/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-secondary">Notifications summary</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{unreadCount} unread</h3>
                  <p className="mt-1 text-sm text-secondary">{notifications.length} total notifications across priorities</p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[#38BDF8]">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SnapshotRow label="Urgent" value={String(notificationsByPriority.urgent.length)} accent="#F87171" />
                <SnapshotRow label="High" value={String(notificationsByPriority.high.length)} accent="#F59E0B" />
                <SnapshotRow label="Medium" value={String(notificationsByPriority.medium.length)} accent="#38BDF8" />
                <SnapshotRow label="Low" value={String(notificationsByPriority.low.length)} accent="#00F5C4" />
              </div>
              <div className="mt-4 space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} compact onMarkAsRead={undefined} onArchive={undefined} />
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-border bg-card/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-secondary">Quick actions</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">Thumb-zone actions</h3>
                  <p className="mt-1 text-sm text-secondary">Open the sheet or jump straight into common create flows.</p>
                </div>
                <div className="grid size-12 place-items-center rounded-2xl border border-border bg-white/5 text-[#00F5C4]">
                  <Plus size={18} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('expense');
                    setAddTransactionOpen(true);
                  }}
                  className="rounded-[24px] border border-border bg-card-elevated px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#00F5C4]/40"
                >
                  <ArrowUpRight className="size-5 text-[#00F5C4]" />
                  <p className="mt-4 text-sm font-semibold text-foreground">Add expense</p>
                  <p className="mt-1 text-xs text-secondary">Capture a spend</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('income');
                    setAddTransactionOpen(true);
                  }}
                  className="rounded-[24px] border border-border bg-card-elevated px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#38BDF8]/40"
                >
                  <TrendingUp className="size-5 text-[#38BDF8]" />
                  <p className="mt-4 text-sm font-semibold text-foreground">Add income</p>
                  <p className="mt-1 text-xs text-secondary">Log a deposit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAddAccountOpen(true)}
                  className="rounded-[24px] border border-border bg-card-elevated px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-white/20"
                >
                  <Wallet className="size-5 text-foreground" />
                  <p className="mt-4 text-sm font-semibold text-foreground">Add account</p>
                  <p className="mt-1 text-xs text-secondary">Register a wallet</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransactionType('transfer');
                    setAddActionsOpen(true);
                  }}
                  className="rounded-[24px] border border-border bg-[linear-gradient(135deg,rgba(0,245,196,0.16),rgba(56,189,248,0.10))] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#00F5C4]/50"
                >
                  <ArrowLeftRight className="size-5 text-[#00F5C4]" />
                  <p className="mt-4 text-sm font-semibold text-foreground">More actions</p>
                  <p className="mt-1 text-xs text-secondary">Open quick sheet</p>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={() => setAddActionsOpen(true)} />

      <UniversalActionsSheet
        open={addActionsOpen}
        onOpenChange={setAddActionsOpen}
        onAddExpense={() => setAddTransactionOpen(true)}
        onAddIncome={() => setAddTransactionOpen(true)}
        onTransfer={() => setAddTransactionOpen(true)}
        onAddAccount={() => setAddAccountOpen(true)}
        onAddGoal={() => setAddGoalOpen(true)}
        onAddInvestment={() => setAddInvestmentOpen(true)}
        onAddReminder={() => setAddReminderOpen(true)}
      />

      <AddTransactionModal
        open={addTransactionOpen}
        onOpenChange={setAddTransactionOpen}
        onSave={async (transaction: TransactionFormData) => {
          await addTransaction(transaction);
        }}
      />

      <AddAccountModal
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        onSave={async (accountData: Partial<Account>) => {
          await addAccount(accountData);
        }}
      />

      <ModalShell open={addGoalOpen} title="Goal" onClose={() => setAddGoalOpen(false)}>
        <AddGoalModal onClose={() => setAddGoalOpen(false)} />
      </ModalShell>

      <ModalShell open={addInvestmentOpen} title="Investment" onClose={() => setAddInvestmentOpen(false)}>
        <AddInvestmentModal onClose={() => setAddInvestmentOpen(false)} onDone={() => setAddInvestmentOpen(false)} />
      </ModalShell>

      <AddReminderModal
        open={addReminderOpen}
        onOpenChange={setAddReminderOpen}
        onSave={async () => {
          setAddReminderOpen(false);
        }}
      />
    </div>
  );
}
