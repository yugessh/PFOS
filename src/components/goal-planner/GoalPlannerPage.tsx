'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gauge,
  ListChecks,
  Rocket,
  Save,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuthContext } from '@/src/context/AuthContext';
import { useGoals } from '@/src/hooks/useGoals';
import { useInvestments } from '@/src/hooks/useInvestments';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useBudgets } from '@/src/hooks/useBudgets';
import { useNetWorth } from '@/src/hooks/useNetWorth';
import { useEMI } from '@/src/hooks/useEMI';
import { formatCurrency, formatCurrencyCompact } from '@/src/lib/currency';
import {
  compareGoalCompletion,
  simulateGoalPlanner,
  type GoalPlannerInput,
  type GoalPlannerScenarioRecord,
  type GoalPlannerHistoryRecord,
} from '@/src/lib/goal-planner';
import { goalPlannerService } from '@/src/services/firestore/goal-planner.service';
import { cn } from '@/lib/utils';

function formatDateInput(value: Date | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value: Date | null | undefined) {
  if (!value) return 'Not yet projected';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function StatCard({ title, value, subtitle, icon, tone = 'mint' }: { title: string; value: string; subtitle: string; icon: React.ReactNode; tone?: 'mint' | 'blue' | 'amber' | 'violet'; }) {
  const toneClass = {
    mint: 'from-[rgba(0,245,196,0.16)] to-[rgba(0,245,196,0.03)] border-[rgba(0,245,196,0.18)]',
    blue: 'from-[rgba(56,189,248,0.16)] to-[rgba(56,189,248,0.03)] border-[rgba(56,189,248,0.18)]',
    amber: 'from-[rgba(245,158,11,0.16)] to-[rgba(245,158,11,0.03)] border-[rgba(245,158,11,0.18)]',
    violet: 'from-[rgba(167,139,250,0.16)] to-[rgba(167,139,250,0.03)] border-[rgba(167,139,250,0.18)]',
  }[tone];

  return (
    <div className={cn('rounded-[28px] border bg-gradient-to-br p-4 shadow-[0_16px_38px_rgba(0,0,0,0.25)]', toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-secondary">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-2 text-xs text-secondary">{subtitle}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-2xl border border-border bg-card text-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PlannerControls({
  goalOptions,
  selectedGoalId,
  onGoalChange,
  scenarioName,
  onScenarioNameChange,
  targetAmount,
  onTargetAmountChange,
  currentAmount,
  onCurrentAmountChange,
  targetDate,
  onTargetDateChange,
  monthlyContribution,
  onMonthlyContributionChange,
  annualReturnRate,
  onAnnualReturnRateChange,
  inflationRate,
  onInflationRateChange,
  expenseReductionPercent,
  onExpenseReductionPercentChange,
  goalCurrency,
  onGoalCurrencyChange,
  onRunPreset,
  onSaveScenario,
  savingScenario,
  scenarioId,
}: {
  goalOptions: Array<{ id: string; label: string }>;
  selectedGoalId: string;
  onGoalChange: (goalId: string) => void;
  scenarioName: string;
  onScenarioNameChange: (value: string) => void;
  targetAmount: number;
  onTargetAmountChange: (value: number) => void;
  currentAmount: number;
  onCurrentAmountChange: (value: number) => void;
  targetDate: string;
  onTargetDateChange: (value: string) => void;
  monthlyContribution: number;
  onMonthlyContributionChange: (value: number) => void;
  annualReturnRate: number;
  onAnnualReturnRateChange: (value: number) => void;
  inflationRate: number;
  onInflationRateChange: (value: number) => void;
  expenseReductionPercent: number;
  onExpenseReductionPercentChange: (value: number) => void;
  goalCurrency: GoalPlannerInput['currency'];
  onGoalCurrencyChange: (value: GoalPlannerInput['currency']) => void;
  onRunPreset: (patch: Partial<Pick<GoalPlannerInput, 'monthlyContribution' | 'annualReturnRate' | 'expenseReductionPercent'>>) => void;
  onSaveScenario: () => void;
  savingScenario: boolean;
  scenarioId: string | null;
}) {
  return (
    <div className="space-y-4 rounded-[30px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary">Planner</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Scenario Controls</h2>
      </div>

      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Goal</label>
        <select value={selectedGoalId} onChange={(event) => onGoalChange(event.target.value)} className="w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none">
          {goalOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Scenario name</label>
          <input value={scenarioName} onChange={(event) => onScenarioNameChange(event.target.value)} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" placeholder="Emergency Fund Simulator" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Target</label>
            <input type="number" value={targetAmount} onChange={(event) => onTargetAmountChange(Number(event.target.value || 0))} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Saved now</label>
            <input type="number" value={currentAmount} onChange={(event) => onCurrentAmountChange(Number(event.target.value || 0))} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Target date</label>
          <input type="date" value={targetDate} onChange={(event) => onTargetDateChange(event.target.value)} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Monthly save</label>
            <input type="number" value={monthlyContribution} onChange={(event) => onMonthlyContributionChange(Number(event.target.value || 0))} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Growth %</label>
            <input type="number" value={annualReturnRate} onChange={(event) => onAnnualReturnRateChange(Number(event.target.value || 0))} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Inflation %</label>
            <input type="number" value={inflationRate} onChange={(event) => onInflationRateChange(Number(event.target.value || 0))} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Expense cut %</label>
            <input type="number" value={expenseReductionPercent} onChange={(event) => onExpenseReductionPercentChange(Number(event.target.value || 0))} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.24em] text-secondary">Currency</label>
          <select value={goalCurrency} onChange={(event) => onGoalCurrencyChange(event.target.value as GoalPlannerInput['currency'])} className="mt-2 w-full rounded-[18px] border border-border bg-background px-3 py-3 text-sm text-foreground outline-none">
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" className="h-auto rounded-[18px] border-border bg-background py-3 text-left text-sm text-secondary" onClick={() => onRunPreset({ monthlyContribution: 5000 })}>
          If I save ₹5,000
        </Button>
        <Button type="button" variant="outline" className="h-auto rounded-[18px] border-border bg-background py-3 text-left text-sm text-secondary" onClick={() => onRunPreset({ monthlyContribution: 10000 })}>
          If I save ₹10,000
        </Button>
        <Button type="button" variant="outline" className="h-auto rounded-[18px] border-border bg-background py-3 text-left text-sm text-secondary" onClick={() => onRunPreset({ annualReturnRate: 12 })}>
          If growth is 12%
        </Button>
        <Button type="button" variant="outline" className="h-auto rounded-[18px] border-border bg-background py-3 text-left text-sm text-secondary" onClick={() => onRunPreset({ expenseReductionPercent: 15 })}>
          If expenses drop 15%
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={onSaveScenario} disabled={savingScenario || !targetAmount} className="h-11 flex-1 rounded-[18px] bg-[linear-gradient(135deg,#00F5C4_0%,#38BDF8_100%)] text-[#041017] shadow-[0_16px_40px_rgba(0,245,196,0.18)] hover:brightness-95">
          <Save className="mr-2 size-4" />
          {scenarioId ? 'Update Scenario' : 'Save Scenario'}
        </Button>
      </div>
    </div>
  );
}

export function GoalPlannerPage() {
  const { user } = useAuthContext();
  const { goals } = useGoals();
  const { investments, getTotalStats } = useInvestments();
  const { transactions, getTotals } = useTransactions();
  const { budgetSummary } = useBudgets(transactions || []);
  const { netWorthData } = useNetWorth();
  const { emiProgress } = useEMI();

  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [scenarioName, setScenarioName] = useState('Goal Planner');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [annualReturnRate, setAnnualReturnRate] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [expenseReductionPercent, setExpenseReductionPercent] = useState(0);
  const [goalCurrency, setGoalCurrency] = useState<GoalPlannerInput['currency']>('INR');
  const [savedScenarios, setSavedScenarios] = useState<GoalPlannerScenarioRecord[]>([]);
  const [history, setHistory] = useState<GoalPlannerHistoryRecord[]>([]);
  const [savingScenario, setSavingScenario] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const monthlyEmiImpact = useMemo(() => emiProgress.reduce((sum, entry) => sum + (entry.isActive ? entry.monthlyInstallment : 0), 0), [emiProgress]);
  const monthlyInvestmentValue = getTotalStats().totalValue;
  const monthlyTotals = getTotals();

  useEffect(() => {
    if (!selectedGoalId && goals.length > 0) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  const selectedGoal = useMemo(() => goals.find((goal) => goal.id === selectedGoalId) || goals[0] || null, [goals, selectedGoalId]);

  useEffect(() => {
    if (!selectedGoal) return;
    setScenarioName(selectedGoal.title);
    setTargetAmount(selectedGoal.targetAmount || 0);
    setCurrentAmount(selectedGoal.savedAmount || 0);
    setTargetDate(formatDateInput(selectedGoal.deadline));
  }, [selectedGoal?.id]);

  const plannerInput: GoalPlannerInput = useMemo(() => ({
    goalId: selectedGoal?.id || null,
    goalTitle: scenarioName || selectedGoal?.title || 'Financial Goal',
    targetAmount,
    currentAmount,
    targetDate: targetDate ? new Date(targetDate) : selectedGoal?.deadline || null,
    monthlyContribution,
    annualReturnRate,
    annualInflationRate: inflationRate,
    expenseReductionPercent,
    monthlyBudgetRemaining: budgetSummary.totalRemaining,
    monthlyEmiImpact,
    monthlyIncome: monthlyTotals.income || 0,
    monthlyExpenses: monthlyTotals.expenses || 0,
    totalNetWorth: netWorthData.netWorth || 0,
    totalInvestments: monthlyInvestmentValue || 0,
    currency: goalCurrency,
    scenarioType: 'custom',
  }), [annualReturnRate, budgetSummary.totalRemaining, currentAmount, expenseReductionPercent, goalCurrency, inflationRate, monthlyContribution, monthlyEmiImpact, monthlyInvestmentValue, monthlyTotals.expenses, monthlyTotals.income, netWorthData.netWorth, scenarioName, selectedGoal?.deadline, selectedGoal?.id, selectedGoal?.title, targetAmount, targetDate]);

  const currentResult = useMemo(() => simulateGoalPlanner(plannerInput, 120), [plannerInput]);
  const boostedResult = useMemo(() => simulateGoalPlanner({ ...plannerInput, monthlyContribution: plannerInput.monthlyContribution + 1500 }, 120), [plannerInput]);
  const acceleration = useMemo(() => compareGoalCompletion(currentResult, boostedResult), [currentResult, boostedResult]);

  const aiInsight = useMemo(() => {
    if (acceleration.monthsEarlier > 0) {
      return `You can reach this goal ${acceleration.monthsEarlier} months earlier by increasing savings ₹1,500/month.`;
    }

    return currentResult.aiInsight;
  }, [acceleration.monthsEarlier, currentResult.aiInsight]);

  useEffect(() => {
    let mounted = true;

    async function loadSavedData() {
      if (!user?.uid) {
        setSavedScenarios([]);
        setHistory([]);
        return;
      }

      try {
        const [scenarios, recentHistory] = await Promise.all([
          goalPlannerService.getSavedScenarios(user.uid),
          goalPlannerService.getSimulationHistory(user.uid),
        ]);

        if (!mounted) return;
        setSavedScenarios(scenarios);
        setHistory(recentHistory);
      } catch (error) {
        console.error('Failed to load goal planner data', error);
      }
    }

    void loadSavedData();
    return () => {
      mounted = false;
    };
  }, [user?.uid]);

  async function handleSaveScenario() {
    if (!user?.uid) return;

    setSavingScenario(true);
    try {
      const savedScenario = await goalPlannerService.saveScenarioSnapshot(user.uid, null, {
        ...plannerInput,
        scenarioName,
        projectedCompletionDate: currentResult.projectedCompletionDate,
        monthsToCompletion: currentResult.monthsToCompletion,
        requiredMonthlyContribution: currentResult.requiredMonthlyContribution,
        goalHealthScore: currentResult.goalHealthScore,
        probabilityOfSuccess: currentResult.probabilityOfSuccess,
        projectedBalance: currentResult.projectedBalance,
        shortfall: currentResult.shortfall,
        effectiveMonthlyContribution: currentResult.effectiveMonthlyContribution,
        projectionSeries: currentResult.projectionSeries,
        milestones: currentResult.milestones,
        aiInsight,
      });

      const historyEntry = await goalPlannerService.saveSimulationHistory(user.uid, savedScenario.id, plannerInput, { ...currentResult, aiInsight });

      setSavedScenarios((prev) => [savedScenario, ...prev.filter((item) => item.id !== savedScenario.id)]);
      setHistory((prev) => [historyEntry, ...prev]);
    } catch (error) {
      console.error('Failed to save scenario', error);
    } finally {
      setSavingScenario(false);
    }
  }

  function applyPreset(patch: Partial<Pick<GoalPlannerInput, 'monthlyContribution' | 'annualReturnRate' | 'expenseReductionPercent'>>) {
    if (patch.monthlyContribution != null) setMonthlyContribution(patch.monthlyContribution);
    if (patch.annualReturnRate != null) setAnnualReturnRate(patch.annualReturnRate);
    if (patch.expenseReductionPercent != null) setExpenseReductionPercent(patch.expenseReductionPercent);
  }

  const goalOptions = useMemo(() => {
    const options = goals.map((goal) => ({ id: goal.id, label: goal.title }));
    if (options.length === 0) {
      return [{ id: 'custom', label: 'Custom goal' }];
    }
    return options;
  }, [goals]);

  const chartSeries = currentResult.projectionSeries.map((point) => ({
    name: `M${point.monthIndex}`,
    month: point.date.toLocaleDateString('en-IN', { month: 'short' }),
    balance: point.balance,
    target: point.targetAdjusted,
    progress: point.progressPercent,
  }));

  return (
    <div className="min-h-screen bg-main px-4 py-4 text-foreground lg:px-6 lg:py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-border bg-gradient-to-br from-[#091017] via-[#0d151d] to-[#081018] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.4)] lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.34em] text-secondary">Goal planner</p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">Financial Scenario Simulator</h1>
              <p className="max-w-2xl text-sm text-secondary">Model savings goals, investment growth, inflation, EMI drag, and budget headroom to see when you can actually hit your target.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setSheetOpen(true)} className="h-11 rounded-[18px] border-border bg-card px-4 text-sm text-secondary lg:hidden">
              Open simulator
            </Button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Goal Health Score" value={`${currentResult.goalHealthScore}`} subtitle="Weighted forecast of progress, debt drag, and savings power." icon={<Gauge className="size-5 text-[var(--accent-mint)]" />} tone="mint" />
            <StatCard title="Probability of Success" value={`${currentResult.probabilityOfSuccess}%`} subtitle="Estimated chance of hitting the plan inside your timeline." icon={<Sparkles className="size-5 text-[#38BDF8]" />} tone="blue" />
            <StatCard title="Projected Completion" value={formatDisplayDate(currentResult.projectedCompletionDate)} subtitle={currentResult.monthsToCompletion != null ? `${currentResult.monthsToCompletion} months projected` : 'Projection horizon not reached'} icon={<CalendarDays className="size-5 text-[#F59E0B]" />} tone="amber" />
            <StatCard title="Required Monthly Contribution" value={formatCurrencyCompact(currentResult.requiredMonthlyContribution)} subtitle="Contribution needed to stay on plan by the target date." icon={<Wallet className="size-5 text-[#A78BFA]" />} tone="violet" />
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-secondary">Projection graph</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">Balance vs target trajectory</h2>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1 text-xs text-secondary">{formatCurrencyCompact(currentResult.effectiveMonthlyContribution)} effective / month</div>
              </div>

              <div className="mt-5 h-[320px] overflow-hidden rounded-[28px] border border-border bg-background/60 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartSeries}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrencyCompact(Number(value))} />
                    <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'balance' ? 'Projected balance' : 'Inflation-adjusted target']} contentStyle={{ background: '#0C1218', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', color: '#fff' }} />
                    <Line type="monotone" dataKey="balance" stroke="#00F5C4" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="target" stroke="#38BDF8" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <div className="flex items-center gap-2">
                  <ListChecks className="size-5 text-[var(--accent-mint)]" />
                  <h3 className="text-base font-semibold text-foreground">Milestone tracker</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {currentResult.milestones.map((milestone) => (
                    <div key={milestone.label} className="rounded-[22px] border border-border bg-background/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{milestone.label}</p>
                          <p className="mt-1 text-xs text-secondary">{formatDisplayDate(milestone.date)}</p>
                        </div>
                        {milestone.achieved ? <CheckCircle2 className="size-5 text-[var(--accent-mint)]" /> : <Clock3 className="size-5 text-secondary" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="size-5 text-[#38BDF8]" />
                  <h3 className="text-base font-semibold text-foreground">AI insight</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-secondary">{aiInsight}</p>

                <div className="mt-5 rounded-[24px] border border-border bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-secondary">Quick comparison</p>
                  <p className="mt-2 text-sm text-foreground">Adding ₹1,500/month can move the goal <span className="font-semibold text-[var(--accent-mint)]">{acceleration.monthsEarlier > 0 ? `${acceleration.monthsEarlier} months` : 'closer'}</span>.</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <p className="text-xs uppercase tracking-[0.28em] text-secondary">Savings simulator</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(currentAmount)} saved now</p>
                <p className="mt-2 text-sm text-secondary">If you keep saving {formatCurrency(monthlyContribution)} each month, the target balance trends to {formatCurrency(currentResult.projectedBalance)}.</p>
              </div>
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <p className="text-xs uppercase tracking-[0.28em] text-secondary">Budget health</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(budgetSummary.totalRemaining)}</p>
                <p className="mt-2 text-sm text-secondary">Monthly budget slack can be redirected into this goal.</p>
              </div>
              <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <p className="text-xs uppercase tracking-[0.28em] text-secondary">EMI impact</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(monthlyEmiImpact)}</p>
                <p className="mt-2 text-sm text-secondary">Debt drag reduces your goal contribution runway.</p>
              </div>
            </section>

            <section className="rounded-[32px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-secondary">Timeline</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">Projection timeline</h3>
                </div>
                <div className="text-right text-sm text-secondary">
                  <p>Target: {formatDisplayDate(plannerInput.targetDate)}</p>
                  <p>Current probability: {currentResult.probabilityOfSuccess}%</p>
                </div>
              </div>

              <div className="mt-5 h-[240px] rounded-[28px] border border-border bg-background/60 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartSeries}>
                    <defs>
                      <linearGradient id="goal-planner-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00F5C4" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00F5C4" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrencyCompact(Number(value))} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: '#0C1218', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px', color: '#fff' }} />
                    <Area type="monotone" dataKey="balance" stroke="#00F5C4" fill="url(#goal-planner-fill)" strokeWidth={3} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="hidden lg:block">
              <PlannerControls
                goalOptions={goalOptions}
                selectedGoalId={selectedGoalId}
                onGoalChange={setSelectedGoalId}
                scenarioName={scenarioName}
                onScenarioNameChange={setScenarioName}
                targetAmount={targetAmount}
                onTargetAmountChange={setTargetAmount}
                currentAmount={currentAmount}
                onCurrentAmountChange={setCurrentAmount}
                targetDate={targetDate}
                onTargetDateChange={setTargetDate}
                monthlyContribution={monthlyContribution}
                onMonthlyContributionChange={setMonthlyContribution}
                annualReturnRate={annualReturnRate}
                onAnnualReturnRateChange={setAnnualReturnRate}
                inflationRate={inflationRate}
                onInflationRateChange={setInflationRate}
                expenseReductionPercent={expenseReductionPercent}
                onExpenseReductionPercentChange={setExpenseReductionPercent}
                goalCurrency={goalCurrency}
                onGoalCurrencyChange={setGoalCurrency}
                onRunPreset={applyPreset}
                onSaveScenario={handleSaveScenario}
                savingScenario={savingScenario}
                scenarioId={savedScenarios[0]?.id || null}
              />
            </div>

            <div className="rounded-[30px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="flex items-center gap-2">
                <Rocket className="size-5 text-[var(--accent-mint)]" />
                <h3 className="text-base font-semibold text-foreground">What-if scenarios</h3>
              </div>
              <div className="mt-4 space-y-3">
                {savedScenarios.slice(0, 4).map((scenario) => (
                  <button key={scenario.id} type="button" onClick={() => {
                    setSelectedGoalId(scenario.goalId || '');
                    setScenarioName(scenario.scenarioName);
                    setTargetAmount(scenario.targetAmount);
                    setCurrentAmount(scenario.currentAmount);
                    setTargetDate(formatDateInput(scenario.targetDate));
                    setMonthlyContribution(scenario.monthlyContribution);
                    setAnnualReturnRate(scenario.annualReturnRate);
                    setInflationRate(scenario.annualInflationRate);
                    setExpenseReductionPercent(scenario.expenseReductionPercent);
                    setGoalCurrency(scenario.currency);
                  }} className="w-full rounded-[24px] border border-border bg-background/70 p-4 text-left transition hover:border-[rgba(0,245,196,0.22)] hover:bg-background">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{scenario.scenarioName}</p>
                        <p className="mt-1 text-xs text-secondary">{formatDisplayDate(scenario.projectedCompletionDate)} • {scenario.probabilityOfSuccess}% success</p>
                      </div>
                      <ArrowRight className="size-4 text-secondary" />
                    </div>
                  </button>
                ))}

                {savedScenarios.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-border bg-background/60 p-4 text-sm text-secondary">Save your first scenario to start a comparison history.</div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="flex items-center gap-2">
                <Clock3 className="size-5 text-[#38BDF8]" />
                <h3 className="text-base font-semibold text-foreground">Simulation history</h3>
              </div>
              <div className="mt-4 space-y-3">
                {history.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="rounded-[22px] border border-border bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{entry.scenarioName}</p>
                        <p className="mt-1 text-xs text-secondary">{formatDisplayDate(entry.projectedCompletionDate)}</p>
                      </div>
                      <span className="rounded-full bg-[rgba(0,245,196,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent-mint)]">{entry.probabilityOfSuccess}%</span>
                    </div>
                  </div>
                ))}

                {history.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-border bg-background/60 p-4 text-sm text-secondary">Run a simulation to capture progress history.</div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
              <div className="flex items-center gap-2">
                <Target className="size-5 text-[#F59E0B]" />
                <h3 className="text-base font-semibold text-foreground">Snapshot</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-background/70 px-4 py-3">
                  <span className="text-secondary">Net worth</span>
                  <span className="font-semibold text-foreground">{formatCurrency(netWorthData.netWorth)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-background/70 px-4 py-3">
                  <span className="text-secondary">Investments</span>
                  <span className="font-semibold text-foreground">{formatCurrency(monthlyInvestmentValue)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-background/70 px-4 py-3">
                  <span className="text-secondary">Budget runway</span>
                  <span className="font-semibold text-foreground">{formatCurrency(budgetSummary.totalRemaining)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-background/70 px-4 py-3">
                  <span className="text-secondary">EMI drag</span>
                  <span className="font-semibold text-foreground">{formatCurrency(monthlyEmiImpact)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-[32px] border-border bg-card p-0">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle>Simulator</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <PlannerControls
                goalOptions={goalOptions}
                selectedGoalId={selectedGoalId}
                onGoalChange={setSelectedGoalId}
                scenarioName={scenarioName}
                onScenarioNameChange={setScenarioName}
                targetAmount={targetAmount}
                onTargetAmountChange={setTargetAmount}
                currentAmount={currentAmount}
                onCurrentAmountChange={setCurrentAmount}
                targetDate={targetDate}
                onTargetDateChange={setTargetDate}
                monthlyContribution={monthlyContribution}
                onMonthlyContributionChange={setMonthlyContribution}
                annualReturnRate={annualReturnRate}
                onAnnualReturnRateChange={setAnnualReturnRate}
                inflationRate={inflationRate}
                onInflationRateChange={setInflationRate}
                expenseReductionPercent={expenseReductionPercent}
                onExpenseReductionPercentChange={setExpenseReductionPercent}
                goalCurrency={goalCurrency}
                onGoalCurrencyChange={setGoalCurrency}
                onRunPreset={applyPreset}
                onSaveScenario={handleSaveScenario}
                savingScenario={savingScenario}
                scenarioId={savedScenarios[0]?.id || null}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
