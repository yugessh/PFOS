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
import { UnifiedTransactionFeed } from '@/src/components/transactions/UnifiedTransactionFeed';
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

const CHART_COLORS = ['#7EE7C7', '#38BDF8', '#60A5FA', '#A78BFA', '#F472B6', '#F59E0B', '#34D399'];

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
  if (level < 0.25) return 'bg-[#7EE7C7]/10';
  if (level < 0.5) return 'bg-[#7EE7C7]/20';
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
          <p className={cn('mt-2 text-xs font-medium', deltaTrend === 'positive' ? 'text-[#7EE7C7]' : deltaTrend === 'negative' ? 'text-[#F87171]' : 'text-secondary')}>
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

  return (
    <div className="relative min-h-screen overflow-hidden pb-28 text-foreground bg-[#080A0F] animate-in fade-in duration-300">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(126,231,199,0.06),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.06),transparent_30%)]" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6">
        
        {/* Top Header Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          
          {/* Health Score Banner */}
          <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-secondary">Health Score</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#7EE7C7]">{financialHealthScore}</h1>
              </div>
              <div
                className="grid size-16 place-items-center rounded-full border border-white/5 bg-[#080A0F]"
                style={{ background: `conic-gradient(#7EE7C7 ${financialHealthScore}%, rgba(255,255,255,0.06) 0)` }}
              >
                <div className="grid size-12 place-items-center rounded-full bg-[#151A20] text-xs font-semibold text-foreground">
                  {financialHealthScore}%
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-secondary">
              <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-0.5">Budget {budgetHealth.toFixed(0)}%</span>
              <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-0.5">Goals {goalHealth.toFixed(0)}%</span>
              <span className="rounded-full border border-white/5 bg-white/5 px-2.5 py-0.5">Alerts {alertPressure.toFixed(0)}%</span>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="inline-flex items-center justify-center rounded-full border border-white/5 bg-[#080A0F] px-3 py-1.5 text-xs text-secondary transition hover:bg-white/5"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="flex-1 text-center rounded-full border border-white/5 bg-[#080A0F] py-1.5 text-xs text-secondary font-medium transition hover:bg-white/5"
              >
                {monthLabel(currentDate)}
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="inline-flex items-center justify-center rounded-full border border-white/5 bg-[#080A0F] px-3 py-1.5 text-xs text-secondary transition hover:bg-white/5"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </section>

          {/* Net Worth Hero Banner */}
          <section className="md:col-span-2 overflow-hidden rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-secondary">Net Worth</p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{formatCurrencyCompact(netWorthData.netWorth)}</h2>
                <p className={cn('mt-1 text-xs font-semibold', healthMomentum >= 0 ? 'text-[#7EE7C7]' : 'text-red-400')}>
                  {formatDifference(netWorthData.netWorth - (netWorthHistory.at(-2)?.netWorth || netWorthData.netWorth))} this month
                </p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl border border-white/5 bg-white/5 text-[#7EE7C7]">
                <Sparkles size={18} />
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-[#080A0F]/50 px-3 py-1.5">
                <p className="text-[9px] uppercase tracking-wider text-secondary">Assets</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{formatCurrencyCompact(netWorthData.totalAssets)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#080A0F]/50 px-3 py-1.5">
                <p className="text-[9px] uppercase tracking-wider text-secondary">Liabilities</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{formatCurrencyCompact(netWorthData.totalLiabilities)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#080A0F]/50 px-3 py-1.5">
                <p className="text-[9px] uppercase tracking-wider text-secondary">Cash Balance</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{formatCurrencyCompact(totalBalance)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#080A0F]/50 px-3 py-1.5">
                <p className="text-[9px] uppercase tracking-wider text-secondary">Net Flow</p>
                <p className={cn('mt-0.5 text-sm font-semibold', cashflow >= 0 ? 'text-[#7EE7C7]' : 'text-red-400')}>{currencyKpi}</p>
              </div>
            </div>
          </section>

        </div>

        {/* Main Responsive Dashboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          
          {/* Net Worth Sparkline Chart (2 columns on all viewports) */}
          <div className="col-span-2 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">Net Worth Trend</p>
            <div className="h-28 mt-2 overflow-hidden rounded-xl bg-black/10 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthHistory.slice(-12)}>
                  <defs>
                    <linearGradient id="networthGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7EE7C7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7EE7C7" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="netWorth" stroke="#7EE7C7" strokeWidth={2} fill="url(#networthGlow)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cash Flow Comparison Chart (2 columns on all viewports) */}
          <div className="col-span-2 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">Monthly Cash Flow</p>
            <div className="h-28 mt-2 overflow-hidden rounded-xl bg-black/10 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7EE7C7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7EE7C7" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="income" stroke="#7EE7C7" strokeWidth={2} fill="url(#incomeGradient)" dot={false} />
                  <Area type="monotone" dataKey="expense" stroke="#38BDF8" strokeWidth={2} fill="url(#expenseGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Health Card (1 column) */}
          <div className="col-span-1 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">Budget Status</p>
              <div className="mt-3">
                <p className="text-xl font-bold text-foreground">{budgetSummary?.totalBudget > 0 ? `${Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)}%` : '72%'}</p>
                <p className="text-[10px] text-secondary mt-0.5">spent of {formatCurrencyCompact(budgetSummary?.totalBudget || 5000)}</p>
              </div>
            </div>
            <div className="w-full">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#7EE7C7] to-[#38BDF8]" 
                  style={{ width: `${Math.min(budgetSummary?.totalBudget > 0 ? (budgetSummary.totalSpent / budgetSummary.totalBudget) * 100 : 72, 100)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* AI Insights Card (1 column) */}
          <div className="col-span-1 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#7EE7C7]" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">AI Insight</p>
              </div>
              <p className="text-xs text-foreground font-medium mt-3 leading-relaxed line-clamp-4">
                {savingsRate >= 50 
                  ? "Exceptional discipline! Your 50%+ savings rate puts you in the top 5% of savers." 
                  : "Your savings rate is looking stable, but trimming dining expenses could boost it by 6%."
                }
              </p>
            </div>
            <p className="text-[9px] text-[#7EE7C7] font-semibold cursor-pointer hover:underline">Ask AI Coach →</p>
          </div>

          {/* Goals Card (1 column) */}
          <div className="col-span-1 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">Goals</p>
              <div className="mt-3">
                <p className="text-xl font-bold text-foreground">{goalStats.overallProgress.toFixed(0)}%</p>
                <p className="text-[10px] text-secondary mt-0.5">{goalStats.completed} of {goalStats.total} completed</p>
              </div>
            </div>
            <div className="space-y-1">
              {topGoals.slice(0, 2).map((goal) => {
                const progress = calculateGoalProgress(goal).progress;
                return (
                  <div key={goal.id} className="flex items-center justify-between text-[10px]">
                    <span className="truncate text-secondary max-w-[70px]">{goal.title}</span>
                    <span className="font-semibold text-foreground">{progress.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Investments Card (1 column) */}
          <div className="col-span-1 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">Investments</p>
              <div className="mt-3">
                <p className="text-xl font-bold text-foreground">{formatCurrencyCompact(investmentStats.totalValue)}</p>
                <p className={cn('text-[10px] font-medium mt-0.5', investmentStats.totalReturn >= 0 ? 'text-[#7EE7C7]' : 'text-red-400')}>
                  {investmentStats.totalReturn >= 0 ? '+' : ''}{((investmentStats.totalReturn / Math.max(investmentStats.totalInvested, 1)) * 100).toFixed(1)}% return
                </p>
              </div>
            </div>
            <p className="text-[9px] text-secondary truncate">Top: {investments[0]?.name || 'None'}</p>
          </div>

          {/* Upcoming Bills & Obligations (1 column) */}
          <div className="col-span-1 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">Bills & EMI</p>
              <div className="mt-3">
                <p className="text-xl font-bold text-foreground">{formatCurrencyCompact(emiTotalMonthly)}</p>
                <p className="text-[10px] text-secondary mt-0.5">{upcomingAlerts.length} bills due soon</p>
              </div>
            </div>
            {overdueAlerts.length > 0 ? (
              <span className="text-[9px] text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30 w-max">
                {overdueAlerts.length} Overdue
              </span>
            ) : (
              <span className="text-[9px] text-[#7EE7C7] font-semibold">All bills on track</span>
            )}
          </div>

          {/* Alerts & Notifications (1 column) */}
          <div className="col-span-1 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[180px]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-secondary">Alert Pressure</p>
              <div className="mt-3">
                <p className="text-xl font-bold text-foreground">{unreadCount}</p>
                <p className="text-[10px] text-secondary mt-0.5">unread messages</p>
              </div>
            </div>
            <div className="flex gap-1">
              <span className="text-[8px] font-bold px-1 py-0.5 bg-red-950/40 text-red-400 border border-red-900/30 rounded">{notificationsByPriority.critical.length}C</span>
              <span className="text-[8px] font-bold px-1 py-0.5 bg-amber-950/40 text-amber-400 border border-amber-900/30 rounded">{notificationsByPriority.high.length}H</span>
              <span className="text-[8px] font-bold px-1 py-0.5 bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded">{notificationsByPriority.medium.length}M</span>
            </div>
          </div>

          {/* Recent Activity / Transactions (2 columns) */}
          <div className="col-span-2 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[280px]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-secondary mb-2">Recent Transactions</p>
            <div className="flex-1 overflow-y-auto pr-1">
              <UnifiedTransactionFeed transactions={recentTransactions.slice(0, 4) as Transaction[]} />
            </div>
          </div>

          {/* Spending Breakdown Pie Card (2 columns) */}
          <div className="col-span-2 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[280px]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-secondary mb-2">Expense Allocation</p>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingBreakdown.length > 0 ? spendingBreakdown : [{ category: 'No expenses', value: 1 }]}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {(spendingBreakdown.length > 0 ? spendingBreakdown : [{ category: 'No expenses', value: 1 }]).map((entry, index) => (
                        <Cell key={`${entry.category}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMoney(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center max-h-[60px] overflow-y-auto">
              {spendingBreakdown.slice(0, 4).map((entry, index) => (
                <span key={`${entry.category}-${index}`} className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] text-secondary">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  {entry.category}
                </span>
              ))}
            </div>
          </div>

          {/* Weekly Heatmap Card (2 columns) */}
          <div className="col-span-2 rounded-[28px] border border-white/8 bg-[#151A20]/90 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between h-[280px]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-secondary mb-2">Spending Heatmap</p>
            <div className="grid grid-cols-7 gap-1.5 text-[9px] uppercase tracking-wider text-secondary text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 mt-2 overflow-y-auto max-h-[200px] p-0.5">
              {weekHeatmap.map((cell) => (
                <div
                  key={cell.date.toISOString()}
                  title={`${cell.date.toDateString()} • ${formatMoney(cell.amount)}`}
                  className={cn(
                    'flex aspect-square flex-col justify-between rounded-lg border border-white/5 p-1 text-left transition hover:border-[#7EE7C7]/30',
                    getIntensityClass(cell.level),
                    cell.amount === 0 ? 'text-secondary' : 'text-foreground'
                  )}
                >
                  <span className="text-[8px] font-bold">{cell.date.getDate()}</span>
                  <span className="text-[7px] leading-none text-secondary truncate">{cell.amount > 0 ? formatCurrencyCompact(cell.amount) : ''}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <FloatingActionButton onClick={() => setAddActionsOpen(true)} />

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
