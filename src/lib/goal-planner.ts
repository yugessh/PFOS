import type { BaseDocument } from '@/src/types/firestore';

export type GoalPlannerCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type GoalPlannerScenarioType = 'baseline' | 'savings' | 'investment_growth' | 'expense_reduction' | 'custom';

export interface GoalPlannerProjectionPoint {
  monthIndex: number;
  date: Date;
  balance: number;
  target: number;
  targetAdjusted: number;
  contribution: number;
  growth: number;
  inflationImpact: number;
  gap: number;
  progressPercent: number;
}

export interface GoalPlannerMilestone {
  label: string;
  progressPercent: number;
  date: Date | null;
  balance: number;
  achieved: boolean;
}

export interface GoalPlannerInput {
  goalId?: string | null;
  goalTitle: string;
  scenarioName?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date | null;
  monthlyContribution: number;
  annualReturnRate: number;
  annualInflationRate: number;
  expenseReductionPercent: number;
  monthlyBudgetRemaining: number;
  monthlyEmiImpact: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalNetWorth: number;
  totalInvestments: number;
  currency: GoalPlannerCurrency;
  scenarioType?: GoalPlannerScenarioType;
  assumptions?: GoalPlannerSimulationResult['assumptions'];
}

export interface GoalPlannerSimulationResult {
  projectedCompletionDate: Date | null;
  monthsToCompletion: number | null;
  requiredMonthlyContribution: number;
  goalHealthScore: number;
  probabilityOfSuccess: number;
  projectedBalance: number;
  shortfall: number;
  effectiveMonthlyContribution: number;
  projectionSeries: GoalPlannerProjectionPoint[];
  milestones: GoalPlannerMilestone[];
  aiInsight: string;
  assumptions: {
    annualReturnRate: number;
    annualInflationRate: number;
    expenseReductionPercent: number;
    monthlyBudgetRemaining: number;
    monthlyEmiImpact: number;
  };
}

export type GoalPlannerResult = GoalPlannerSimulationResult;

export interface GoalPlannerScenarioRecord extends BaseDocument {
  userId: string;
  goalId?: string | null;
  goalTitle: string;
  scenarioName: string;
  scenarioType?: GoalPlannerScenarioType;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  monthlyContribution: number;
  annualReturnRate: number;
  annualInflationRate: number;
  expenseReductionPercent: number;
  monthlyBudgetRemaining: number;
  monthlyEmiImpact: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalNetWorth: number;
  totalInvestments: number;
  currency: GoalPlannerCurrency;
  projectedCompletionDate: Date | null;
  monthsToCompletion: number | null;
  requiredMonthlyContribution: number;
  goalHealthScore: number;
  probabilityOfSuccess: number;
  projectedBalance: number;
  shortfall: number;
  effectiveMonthlyContribution: number;
  projectionSeries: GoalPlannerProjectionPoint[];
  milestones: GoalPlannerMilestone[];
  aiInsight: string;
  assumptions: GoalPlannerSimulationResult['assumptions'];
  input?: GoalPlannerInput;
  result?: GoalPlannerResult;
}

export interface GoalPlannerHistoryRecord extends BaseDocument {
  userId: string;
  scenarioId: string;
  goalId?: string | null;
  goalTitle: string;
  scenarioName: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  projectedCompletionDate: Date | null;
  monthsToCompletion: number | null;
  goalHealthScore: number;
  probabilityOfSuccess: number;
  projectedBalance: number;
  shortfall: number;
  aiInsight: string;
  projectionSeries: GoalPlannerProjectionPoint[];
  trigger?: 'manual' | 'preset' | 'auto';
  input?: GoalPlannerInput;
  result?: GoalPlannerResult;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function monthDifference(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

function buildMilestones(series: GoalPlannerProjectionPoint[]): GoalPlannerMilestone[] {
  const thresholds = [25, 50, 75, 100];

  return thresholds.map((threshold) => {
    const point = series.find((entry) => entry.progressPercent >= threshold);
    return {
      label: `${threshold}%`,
      progressPercent: threshold,
      date: point?.date || null,
      balance: point?.balance || 0,
      achieved: Boolean(point),
    };
  });
}

function simulateEndingBalance(input: GoalPlannerInput, monthlyContribution: number, months: number): number {
  const monthlyReturnRate = input.annualReturnRate / 100 / 12;
  const monthlyInflationRate = input.annualInflationRate / 100 / 12;
  const monthlyExpenseSavings = Math.max(0, input.monthlyExpenses) * (input.expenseReductionPercent / 100);
  const monthlyBudgetSupport = Math.max(0, input.monthlyBudgetRemaining) * 0.4;
  const monthlyEmiDrag = Math.max(0, input.monthlyEmiImpact);
  const effectiveMonthlyContribution = Math.max(0, monthlyContribution + monthlyExpenseSavings + monthlyBudgetSupport - monthlyEmiDrag);

  let balance = Math.max(0, input.currentAmount);

  for (let index = 1; index <= months; index += 1) {
    balance = balance * (1 + monthlyReturnRate) + effectiveMonthlyContribution;
    const inflationFactor = Math.pow(1 + monthlyInflationRate, index / 12);
    const targetAdjusted = input.targetAmount * inflationFactor;

    if (balance >= targetAdjusted) {
      return balance;
    }
  }

  return balance;
}

function solveRequiredMonthlyContribution(input: GoalPlannerInput, months: number): number {
  if (input.targetAmount <= 0 || months <= 0) {
    return 0;
  }

  const targetWithInflation = input.targetAmount * Math.pow(1 + input.annualInflationRate / 100 / 12, months / 12);
  let lower = 0;
  let upper = Math.max(input.targetAmount, input.targetAmount * 2, input.currentAmount + input.targetAmount);

  for (let iteration = 0; iteration < 24; iteration += 1) {
    const mid = (lower + upper) / 2;
    const endingBalance = simulateEndingBalance(input, mid, months);

    if (endingBalance >= targetWithInflation) {
      upper = mid;
    } else {
      lower = mid;
    }
  }

  return roundToTwo(upper);
}

export function simulateGoalPlanner(input: GoalPlannerInput, horizonMonths = 120): GoalPlannerSimulationResult {
  if (input.targetAmount <= 0) {
    return {
      projectedCompletionDate: null,
      monthsToCompletion: null,
      requiredMonthlyContribution: 0,
      goalHealthScore: 0,
      probabilityOfSuccess: 0,
      projectedBalance: 0,
      shortfall: 0,
      effectiveMonthlyContribution: 0,
      projectionSeries: [],
      milestones: [],
      aiInsight: 'Set a target amount to generate a financial projection.',
      assumptions: {
        annualReturnRate: input.annualReturnRate,
        annualInflationRate: input.annualInflationRate,
        expenseReductionPercent: input.expenseReductionPercent,
        monthlyBudgetRemaining: input.monthlyBudgetRemaining,
        monthlyEmiImpact: input.monthlyEmiImpact,
      },
    };
  }

  const today = new Date();
  const targetDate = input.targetDate ? new Date(input.targetDate) : null;
  const monthsToTarget = targetDate ? Math.max(1, monthDifference(today, targetDate)) : Math.max(12, Math.min(horizonMonths, 36));
  const monthlyReturnRate = input.annualReturnRate / 100 / 12;
  const monthlyInflationRate = input.annualInflationRate / 100 / 12;
  const monthlyExpenseSavings = Math.max(0, input.monthlyExpenses) * (input.expenseReductionPercent / 100);
  const monthlyBudgetSupport = Math.max(0, input.monthlyBudgetRemaining) * 0.4;
  const monthlyEmiDrag = Math.max(0, input.monthlyEmiImpact);
  const effectiveMonthlyContribution = Math.max(0, input.monthlyContribution + monthlyExpenseSavings + monthlyBudgetSupport - monthlyEmiDrag);

  const requiredMonthlyContribution = solveRequiredMonthlyContribution(input, monthsToTarget);
  const projectionSeries: GoalPlannerProjectionPoint[] = [];

  let balance = Math.max(0, input.currentAmount);
  let projectedCompletionDate: Date | null = null;
  let monthsToCompletion: number | null = null;

  for (let monthIndex = 1; monthIndex <= horizonMonths; monthIndex += 1) {
    const date = addMonths(today, monthIndex);
    const growth = balance * monthlyReturnRate;
    const inflationImpact = input.targetAmount * (Math.pow(1 + monthlyInflationRate, monthIndex / 12) - 1);

    balance = balance + growth + effectiveMonthlyContribution;

    const targetAdjusted = input.targetAmount * Math.pow(1 + monthlyInflationRate, monthIndex / 12);
    const gap = Math.max(0, targetAdjusted - balance);
    const progressPercent = targetAdjusted > 0 ? clamp((balance / targetAdjusted) * 100, 0, 100) : 100;

    projectionSeries.push({
      monthIndex,
      date,
      balance: roundToTwo(balance),
      target: input.targetAmount,
      targetAdjusted: roundToTwo(targetAdjusted),
      contribution: roundToTwo(effectiveMonthlyContribution),
      growth: roundToTwo(growth),
      inflationImpact: roundToTwo(inflationImpact),
      gap: roundToTwo(gap),
      progressPercent: roundToTwo(progressPercent),
    });

    if (!projectedCompletionDate && balance >= targetAdjusted) {
      projectedCompletionDate = date;
      monthsToCompletion = monthIndex;
    }
  }

  const projectedBalance = projectionSeries.length > 0 ? projectionSeries[projectionSeries.length - 1].balance : input.currentAmount;
  const shortfall = Math.max(0, input.targetAmount - projectedBalance);
  const progressScore = clamp((input.currentAmount / input.targetAmount) * 100, 0, 100);
  const contributionConfidence = clamp((effectiveMonthlyContribution / Math.max(requiredMonthlyContribution, 1)) * 100, 0, 100);
  const liquidityScore = clamp(((input.currentAmount + Math.max(0, input.totalNetWorth * 0.05)) / input.targetAmount) * 100, 0, 100);
  const budgetScore = clamp(50 + (input.monthlyBudgetRemaining / Math.max(input.monthlyIncome || 1, 1)) * 100, 0, 100);
  const debtPenalty = clamp((monthlyEmiDrag / Math.max(input.monthlyIncome || 1, 1)) * 100, 0, 100);
  const goalHealthScore = Math.round(clamp((0.3 * progressScore) + (0.3 * contributionConfidence) + (0.2 * liquidityScore) + (0.2 * budgetScore) - (0.15 * debtPenalty), 0, 100));
  const probabilityOfSuccess = Math.round(clamp((0.4 * contributionConfidence) + (0.25 * liquidityScore) + (0.2 * budgetScore) + (0.15 * progressScore) - (0.1 * debtPenalty), 5, 99));

  const milestones = buildMilestones(projectionSeries);

  let aiInsight = 'Your plan is balanced. Keep contributing consistently and review budget leaks monthly.';
  if (projectedCompletionDate && targetDate) {
    const deltaMonths = monthDifference(projectedCompletionDate, targetDate);
    if (deltaMonths > 0) {
      aiInsight = `You are on track to reach this goal about ${deltaMonths} months earlier than planned.`;
    } else if (deltaMonths < 0) {
      aiInsight = `At the current pace, this goal slips by about ${Math.abs(deltaMonths)} months. Increase savings or reduce expenses.`;
    } else {
      aiInsight = 'Your current contribution matches the target timeline closely.';
    }
  } else if (requiredMonthlyContribution > effectiveMonthlyContribution) {
    aiInsight = `Increase savings by about ₹${Math.round(requiredMonthlyContribution - effectiveMonthlyContribution).toLocaleString('en-IN')} per month to stay on track.`;
  } else if (input.expenseReductionPercent > 0) {
    aiInsight = `Reducing expenses by ${input.expenseReductionPercent}% improves this plan and frees up more monthly contribution.`;
  }

  return {
    projectedCompletionDate,
    monthsToCompletion,
    requiredMonthlyContribution,
    goalHealthScore,
    probabilityOfSuccess,
    projectedBalance,
    shortfall,
    effectiveMonthlyContribution,
    projectionSeries,
    milestones,
    aiInsight,
    assumptions: {
      annualReturnRate: input.annualReturnRate,
      annualInflationRate: input.annualInflationRate,
      expenseReductionPercent: input.expenseReductionPercent,
      monthlyBudgetRemaining: input.monthlyBudgetRemaining,
      monthlyEmiImpact: input.monthlyEmiImpact,
    },
  };
}

export function compareGoalCompletion(base: GoalPlannerSimulationResult, boosted: GoalPlannerSimulationResult) {
  if (!base.projectedCompletionDate || !boosted.projectedCompletionDate) {
    return { monthsEarlier: 0, daysEarlier: 0 };
  }

  const daysEarlier = Math.max(0, Math.round((base.projectedCompletionDate.getTime() - boosted.projectedCompletionDate.getTime()) / (1000 * 60 * 60 * 24)));
  const monthsEarlier = Math.max(0, monthDifference(boosted.projectedCompletionDate, base.projectedCompletionDate));

  return { monthsEarlier, daysEarlier };
}
