import type { GoalModel } from '@/src/lib/goals';
import type { InvestmentModel } from '@/src/lib/investments';
import type { NotificationPriority } from '@/src/lib/notifications';
import type { TradeRecord } from '@/src/services/firestore/tradingJournal.service';

type CoachSeverity = 'low' | 'medium' | 'high';
type CoachRiskLevel = 'stable' | 'watch' | 'elevated' | 'critical';
type CoachActionHorizon = '30-day' | '90-day' | '1-year';
type CoachTimelineStatus = 'new' | 'completed' | 'ignored';
type CoachQueryIntent = 'spending' | 'affordability' | 'emergency-goal' | 'portfolio' | 'tax' | 'generic';

export interface CoachAccountLike {
  id?: string;
  name?: string;
  balance?: number;
  currentBalance?: number;
  accountType?: string;
  type?: string;
}

export interface CoachTransactionLike {
  id?: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | string;
  category?: string;
  description?: string;
  date: Date | string;
}

export interface CoachBudgetLike {
  id?: string;
  categoryName: string;
  monthlyLimit: number;
  spent?: number;
  progress?: number;
}

export interface CoachNetWorthHistoryLike {
  month: string;
  netWorth: number;
  gainLoss?: number;
  gainLossPercent?: number;
}

export interface CoachEventLike {
  id?: string;
  title: string;
  date: Date | string;
  status?: string;
  priority?: string;
  linkedModule?: string;
}

export interface CoachDocumentLike {
  id?: string;
  title: string;
  dueDate?: Date | string | null;
  renewalDate?: Date | string | null;
  category?: string;
}

export interface CoachRetirementPlanLike {
  id?: string;
  name?: string;
  type?: string;
  input?: Record<string, any>;
  result?: Record<string, any>;
}

export interface CoachTaxProfileLike {
  id?: string;
  regime?: string;
  estimatedTax?: number;
  totalIncome?: number;
  taxableIncome?: number;
  deductions?: number;
}

export interface CoachAssetLike {
  id?: string;
  name?: string;
  currentValue?: number;
  value?: number;
  category?: string;
}

export interface CoachLiabilityLike {
  id?: string;
  name?: string;
  outstandingAmount?: number;
  amount?: number;
  monthlyPayment?: number;
}

export interface CoachFamilyGroupLike {
  id?: string;
  name?: string;
  members?: Array<{ id?: string; displayName?: string }>;
}

export interface CoachAutomationLike {
  id?: string;
  enabled?: boolean;
}

export interface CoachReportLike {
  id?: string;
  name?: string;
  cadence?: string;
  type?: string;
}

export interface FinancialCoachInput {
  currency?: string;
  accounts: CoachAccountLike[];
  transactions: CoachTransactionLike[];
  budgets: CoachBudgetLike[];
  netWorth: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    history: CoachNetWorthHistoryLike[];
  };
  goals: GoalModel[];
  investments: InvestmentModel[];
  trades: TradeRecord[];
  taxProfiles: CoachTaxProfileLike[];
  retirementPlans: CoachRetirementPlanLike[];
  assets: CoachAssetLike[];
  liabilities: CoachLiabilityLike[];
  events: CoachEventLike[];
  documents: CoachDocumentLike[];
  familyGroups: CoachFamilyGroupLike[];
  automations: CoachAutomationLike[];
  reports: CoachReportLike[];
}

export interface HealthBreakdownItem {
  key: 'savings' | 'investment' | 'budget' | 'debt' | 'tax' | 'goal';
  label: string;
  score: number;
  detail: string;
}

export interface CoachRecommendation {
  id: string;
  title: string;
  detail: string;
  impact: string;
  amount?: number;
  severity: CoachSeverity;
  priority: NotificationPriority;
  category: 'savings' | 'investments' | 'budget' | 'debt' | 'goals' | 'tax' | 'family' | 'reports';
  actionLabel: string;
  actionHref?: string;
}

export interface CoachRisk {
  id: string;
  title: string;
  level: CoachRiskLevel;
  impact: string;
  recommendation: string;
  category: 'savings' | 'debt' | 'budgets' | 'investments' | 'goals' | 'retirement';
}

export interface CoachActionPlanItem {
  id: string;
  horizon: CoachActionHorizon;
  title: string;
  detail: string;
  metric: string;
}

export interface CoachAlert {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  actionHref?: string;
}

export interface CoachTimelineItem {
  id: string;
  title: string;
  detail: string;
  createdAt: Date;
  status: CoachTimelineStatus;
}

export interface CoachGeneratedReport {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface CoachGoalAcceleration {
  targetGoal?: GoalModel;
  recommendedMonthlyContribution: number;
  improvedTargetDate?: Date | null;
  probabilityOfSuccess: number;
  summary: string;
}

export interface CoachQueryAnswer {
  intent: CoachQueryIntent;
  title: string;
  answer: string;
  supporting: string[];
}

export interface FinancialCoachSnapshot {
  overallScore: number;
  financialHealthScore: number;
  healthBreakdown: HealthBreakdownItem[];
  topRecommendations: CoachRecommendation[];
  risks: CoachRisk[];
  opportunities: CoachRecommendation[];
  upcomingActions: CoachActionPlanItem[];
  actionPlans: Record<CoachActionHorizon, CoachActionPlanItem[]>;
  alerts: CoachAlert[];
  timeline: CoachTimelineItem[];
  reports: CoachGeneratedReport[];
  goalAcceleration: CoachGoalAcceleration;
  familyInsights: string[];
  explanationCards: Array<{ id: string; title: string; explanation: string }>;
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number;
    emergencyFundMonths: number;
    debtToAssetRatio: number;
    portfolioReturnPct: number;
    netWorthMomentum: number;
    taxEstimate: number;
  };
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const average = (values: number[]) => (values.length ? sum(values) / values.length : 0);
const normalizeAmount = (value: number | null | undefined) => Number(value || 0);
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, count: number) => new Date(date.getFullYear(), date.getMonth() + count, 1);
const diffInMonths = (from: Date, to: Date) => Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()));

const toDate = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function parseCurrencyInput(input: string): number | null {
  const normalized = input.replace(/[, ]/g, '').toLowerCase();
  const match = normalized.match(/(?:₹|rs\.?|inr)?(\d+(?:\.\d+)?)(l|lac|lakh|lakhs|k|m|cr|crore|crores)?/i);
  if (!match) return null;
  const base = Number(match[1]);
  const suffix = match[2]?.toLowerCase();
  if (!suffix) return base;
  if (suffix === 'k') return base * 1000;
  if (suffix === 'm') return base * 1000000;
  if (suffix === 'l' || suffix === 'lac' || suffix === 'lakh' || suffix === 'lakhs') return base * 100000;
  if (suffix === 'cr' || suffix === 'crore' || suffix === 'crores') return base * 10000000;
  return base;
}

function getMonthlyTransactions(transactions: CoachTransactionLike[], monthOffset = 0) {
  const now = new Date();
  const start = addMonths(startOfMonth(now), monthOffset);
  const end = addMonths(start, 1);
  return transactions.filter((transaction) => {
    const date = toDate(transaction.date);
    return date && date >= start && date < end;
  });
}

function getMonthlyIncome(transactions: CoachTransactionLike[], monthOffset = 0) {
  return sum(getMonthlyTransactions(transactions, monthOffset).filter((item) => item.type === 'income').map((item) => normalizeAmount(item.amount)));
}

function getMonthlyExpenses(transactions: CoachTransactionLike[], monthOffset = 0) {
  return sum(getMonthlyTransactions(transactions, monthOffset).filter((item) => item.type === 'expense').map((item) => normalizeAmount(item.amount)));
}

function getCategorySpend(transactions: CoachTransactionLike[], category: string, monthOffset = 0) {
  const needle = category.trim().toLowerCase();
  return sum(
    getMonthlyTransactions(transactions, monthOffset)
      .filter((item) => item.type === 'expense')
      .filter((item) => `${item.category || ''} ${item.description || ''}`.toLowerCase().includes(needle))
      .map((item) => normalizeAmount(item.amount))
  );
}

function makeRecommendation(
  id: string,
  title: string,
  detail: string,
  impact: string,
  category: CoachRecommendation['category'],
  priority: NotificationPriority,
  severity: CoachSeverity,
  actionLabel: string,
  actionHref?: string,
  amount?: number,
): CoachRecommendation {
  return { id, title, detail, impact, category, priority, severity, actionLabel, actionHref, amount };
}

function makeRisk(
  id: string,
  title: string,
  level: CoachRiskLevel,
  impact: string,
  recommendation: string,
  category: CoachRisk['category'],
): CoachRisk {
  return { id, title, level, impact, recommendation, category };
}

function taxProfileLabel(profile?: CoachTaxProfileLike) {
  if (!profile) return 'No saved tax profile was found, so a fallback estimate was used.';
  const taxable = normalizeAmount(profile.taxableIncome || profile.totalIncome);
  const deductions = normalizeAmount(profile.deductions);
  return `Saved tax profile shows taxable income near ₹${Math.round(taxable).toLocaleString()} with deductions of about ₹${Math.round(deductions).toLocaleString()}.`;
}

export function buildFinancialCoachSnapshot(input: FinancialCoachInput): FinancialCoachSnapshot {
  const monthlyIncome = getMonthlyIncome(input.transactions, 0);
  const monthlyExpenses = getMonthlyExpenses(input.transactions, 0);
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const liquidBalance = sum(input.accounts.map((account) => normalizeAmount(account.balance ?? account.currentBalance)));
  const emergencyFundMonths = monthlyExpenses > 0 ? liquidBalance / monthlyExpenses : 0;
  const totalDebt = sum(input.liabilities.map((liability) => normalizeAmount(liability.outstandingAmount ?? liability.amount)));
  const totalAssets = Math.max(input.netWorth.totalAssets, sum(input.assets.map((asset) => normalizeAmount(asset.currentValue ?? asset.value))));
  const debtToAssetRatio = totalAssets > 0 ? totalDebt / totalAssets : 0;
  const investmentCost = sum(input.investments.map((investment) => normalizeAmount(investment.amountInvested)));
  const investmentValue = sum(input.investments.map((investment) => normalizeAmount(investment.currentValue)));
  const portfolioReturnPct = investmentCost > 0 ? ((investmentValue - investmentCost) / investmentCost) * 100 : 0;
  const netWorthMomentum = input.netWorth.history[0]?.gainLossPercent || 0;
  const totalGoalGap = sum(input.goals.map((goal) => Math.max(0, normalizeAmount(goal.targetAmount) - normalizeAmount(goal.savedAmount))));
  const activeGoal = [...input.goals]
    .filter((goal) => normalizeAmount(goal.savedAmount) < normalizeAmount(goal.targetAmount))
    .sort((left, right) => (toDate(left.deadline)?.getTime() || 0) - (toDate(right.deadline)?.getTime() || 0))[0];

  const taxProfile = input.taxProfiles[0];
  const taxEstimate = normalizeAmount(taxProfile?.estimatedTax) || Math.max(0, (monthlyIncome * 12 - 700000) * 0.08);

  const savingsScore = clamp(savingsRate * 2.5);
  const investmentScore = clamp(55 + portfolioReturnPct * 2 + Math.min(input.investments.length * 4, 18));
  const budgetPressure = average(input.budgets.map((budget) => normalizeAmount(budget.spent) / Math.max(1, normalizeAmount(budget.monthlyLimit))));
  const budgetScore = clamp(100 - Math.max(0, budgetPressure - 0.75) * 140);
  const debtScore = clamp(100 - debtToAssetRatio * 120 - (emergencyFundMonths < 3 ? 15 : 0));
  const taxScore = clamp(70 + Math.min((normalizeAmount(taxProfile?.deductions) / Math.max(1, monthlyIncome * 12)) * 100, 20) - (taxEstimate > monthlyIncome * 3 ? 12 : 0));
  const goalProgressRatio = input.goals.length ? average(input.goals.map((goal) => normalizeAmount(goal.savedAmount) / Math.max(1, normalizeAmount(goal.targetAmount)))) : 0.7;
  const goalScore = clamp(goalProgressRatio * 100);

  const healthBreakdown: HealthBreakdownItem[] = [
    { key: 'savings', label: 'Savings Score', score: Math.round(savingsScore), detail: `${savingsRate.toFixed(1)}% savings rate against current income.` },
    { key: 'investment', label: 'Investment Score', score: Math.round(investmentScore), detail: `${portfolioReturnPct.toFixed(1)}% portfolio return with ${input.investments.length} holdings.` },
    { key: 'budget', label: 'Budget Score', score: Math.round(budgetScore), detail: `${input.budgets.length} tracked budgets with average usage of ${((budgetPressure || 0) * 100).toFixed(0)}%.` },
    { key: 'debt', label: 'Debt Score', score: Math.round(debtScore), detail: `${(debtToAssetRatio * 100).toFixed(1)}% debt-to-asset ratio and ${emergencyFundMonths.toFixed(1)} emergency-fund months.` },
    { key: 'tax', label: 'Tax Score', score: Math.round(taxScore), detail: `Estimated tax outflow is ₹${Math.round(taxEstimate).toLocaleString()} for the current year.` },
    { key: 'goal', label: 'Goal Score', score: Math.round(goalScore), detail: `${input.goals.length} active goals with ${(goalProgressRatio * 100).toFixed(0)}% average progress.` },
  ];

  const overallScore = Math.round(average(healthBreakdown.map((item) => item.score)));
  const recommendations: CoachRecommendation[] = [];
  const risks: CoachRisk[] = [];

  if (savingsRate < 20) {
    const suggestedCut = Math.max(2500, Math.round(monthlyExpenses * 0.04 / 100) * 100);
    recommendations.push(makeRecommendation('save-more', 'Lift your monthly savings buffer', `You can save about ₹${suggestedCut.toLocaleString()}/month by trimming the most variable expense categories first.`, 'Improves emergency fund coverage and goal funding capacity.', 'savings', 'high', 'high', 'Review spending', '/dashboard/transactions', suggestedCut));
    risks.push(makeRisk('low-savings-rate', 'Savings rate is below target', savingsRate < 10 ? 'critical' : 'elevated', `Current savings rate is ${savingsRate.toFixed(1)}%, which limits resilience and slows long-term goals.`, 'Reduce discretionary expenses or redirect new income into a dedicated savings rule.', 'savings'));
  }

  const overspentBudgets = input.budgets.filter((budget) => normalizeAmount(budget.spent) > normalizeAmount(budget.monthlyLimit));
  overspentBudgets.slice(0, 2).forEach((budget) => {
    const overspend = normalizeAmount(budget.spent) - normalizeAmount(budget.monthlyLimit);
    recommendations.push(makeRecommendation(`budget-${budget.id || budget.categoryName}`, `Reset ${budget.categoryName} budget drift`, `${budget.categoryName} is over budget by ₹${Math.round(overspend).toLocaleString()} this month.`, 'Stops the current month from eroding your planned savings.', 'budget', 'high', 'medium', 'Adjust budget', '/dashboard/budgets', overspend));
    risks.push(makeRisk(`overspend-${budget.id || budget.categoryName}`, `${budget.categoryName} overspending detected`, overspend > monthlyExpenses * 0.08 ? 'critical' : 'watch', `Budget overrun is ₹${Math.round(overspend).toLocaleString()} and likely to continue without intervention.`, 'Tighten the category limit or cap spending for the rest of the month.', 'budgets'));
  });

  if (emergencyFundMonths < 3) {
    risks.push(makeRisk('emergency-fund-gap', 'Emergency fund below target', emergencyFundMonths < 1 ? 'critical' : 'elevated', `You currently hold ${emergencyFundMonths.toFixed(1)} months of expenses in liquid funds.`, 'Build toward at least 3 to 6 months of expenses in a separate reserve account.', 'savings'));
  }

  if (input.investments.length <= 2 && investmentValue > 0) {
    risks.push(makeRisk('portfolio-concentration', 'Investment allocation is concentrated', 'watch', 'Too few holdings means a single asset can distort overall portfolio risk.', 'Diversify across funds, asset classes, or strategies before adding more risk capital.', 'investments'));
  }

  if (debtToAssetRatio > 0.45) {
    recommendations.push(makeRecommendation('debt-plan', 'Accelerate debt paydown', 'Redirect part of monthly surplus into the highest-cost liability first.', 'Improves debt score, cash flow, and future borrowing flexibility.', 'debt', 'high', 'high', 'Review liabilities', '/dashboard/wealth-inventory'));
    risks.push(makeRisk('high-debt', 'Debt load is elevated', debtToAssetRatio > 0.7 ? 'critical' : 'elevated', `Debt-to-asset ratio is ${(debtToAssetRatio * 100).toFixed(0)}%.`, 'Prioritize high-interest liabilities before increasing lifestyle spending.', 'debt'));
  }

  if (activeGoal && monthlySavings > 0) {
    const requiredMonthly = Math.ceil((Math.max(0, activeGoal.targetAmount - activeGoal.savedAmount)) / diffInMonths(new Date(), toDate(activeGoal.deadline) || new Date()));
    if (requiredMonthly > monthlySavings) {
      recommendations.push(makeRecommendation('goal-boost', `Increase funding for ${activeGoal.title}`, `A monthly contribution of ₹${requiredMonthly.toLocaleString()} is needed to hit the current target date.`, 'Raises the probability of hitting your next goal on schedule.', 'goals', 'medium', 'medium', 'Open goals', '/dashboard/goals', requiredMonthly));
      risks.push(makeRisk('goal-slippage', `${activeGoal.title} is behind schedule`, 'watch', 'Current contribution pace is below what the target date requires.', 'Increase monthly goal funding or move the target date to a realistic range.', 'goals'));
    }
  }

  if (investmentValue > 0 && monthlySavings > 0) {
    const suggestedSip = Math.max(1000, Math.round(monthlySavings * 0.2 / 500) * 500);
    recommendations.push(makeRecommendation('sip-increase', 'Increase long-term investing cadence', `Increasing SIP by ₹${suggestedSip.toLocaleString()} can materially improve long-horizon wealth compounding.`, 'Supports FIRE, retirement, and long-term net-worth growth.', 'investments', 'medium', 'low', 'Open investments', '/dashboard/investments', suggestedSip));
  }

  if (taxEstimate > 0) {
    recommendations.push(makeRecommendation('tax-optimize', 'Review tax-saving capacity', 'Check available deductions and investment-linked exemptions before year-end.', 'Can reduce tax outflow and free more capital for goals.', 'tax', 'medium', 'low', 'Open tax center', '/dashboard/tax-center'));
  }

  const opportunities = recommendations.filter((item) => item.category === 'investments' || item.category === 'goals' || item.category === 'tax').slice(0, 4);
  const actionPlans: Record<CoachActionHorizon, CoachActionPlanItem[]> = {
    '30-day': [
      { id: '30-track', horizon: '30-day', title: 'Cap variable spending', detail: 'Focus on the top 2 overspending categories and set a weekly cap.', metric: `Target a ₹${Math.max(1500, Math.round(monthlyExpenses * 0.03)).toLocaleString()} expense reduction.` },
      { id: '30-alerts', horizon: '30-day', title: 'Turn insights into alerts', detail: 'Review proactive recommendations and pin the highest-impact items.', metric: `${Math.max(1, risks.length)} active risk flags to address.` },
    ],
    '90-day': [
      { id: '90-emergency', horizon: '90-day', title: 'Strengthen emergency reserve', detail: 'Route a fixed monthly amount to a reserve account until you reach 3 months of expenses.', metric: `Current reserve coverage is ${emergencyFundMonths.toFixed(1)} months.` },
      { id: '90-debt', horizon: '90-day', title: 'Reduce high-cost liabilities', detail: 'Use surplus and windfalls to reduce balances that constrain future savings.', metric: `Current debt load is ₹${Math.round(totalDebt).toLocaleString()}.` },
    ],
    '1-year': [
      { id: '1y-retirement', horizon: '1-year', title: 'Advance retirement readiness', detail: 'Increase automated investing and revisit your retirement assumptions quarterly.', metric: `Portfolio return is ${portfolioReturnPct.toFixed(1)}% and net-worth momentum is ${netWorthMomentum.toFixed(1)}%.` },
      { id: '1y-goals', horizon: '1-year', title: 'Finish one major goal', detail: 'Concentrate on the goal with the shortest path to completion to create momentum.', metric: `Outstanding goal gap is ₹${Math.round(totalGoalGap).toLocaleString()}.` },
    ],
  };

  const upcomingActions: CoachActionPlanItem[] = [
    ...actionPlans['30-day'],
    ...input.events.slice(0, 3).map((event) => ({ id: `event-${event.id || event.title}`, horizon: '30-day' as const, title: event.title, detail: `Upcoming ${event.linkedModule || 'financial'} event on ${toDate(event.date)?.toLocaleDateString() || 'scheduled date'}.`, metric: event.priority ? `Priority: ${event.priority}` : 'Upcoming action' })),
    ...input.documents.slice(0, 2).map((document) => ({ id: `doc-${document.id || document.title}`, horizon: '30-day' as const, title: document.title, detail: `Document action due by ${toDate(document.dueDate || document.renewalDate)?.toLocaleDateString() || 'scheduled date'}.`, metric: document.category || 'Document' })),
  ].slice(0, 6);

  const alerts: CoachAlert[] = [
    ...(emergencyFundMonths < 3 ? [{ id: 'alert-emergency', title: 'Emergency fund below target', message: `Coverage is ${emergencyFundMonths.toFixed(1)} months.`, priority: 'high' as NotificationPriority, actionHref: '/dashboard/accounts' }] : []),
    ...overspentBudgets.slice(0, 1).map((budget) => ({ id: `alert-budget-${budget.id || budget.categoryName}`, title: `${budget.categoryName} budget likely to exceed limit`, message: `Spent ₹${Math.round(normalizeAmount(budget.spent)).toLocaleString()} vs budget ₹${Math.round(normalizeAmount(budget.monthlyLimit)).toLocaleString()}.`, priority: 'high' as NotificationPriority, actionHref: '/dashboard/budgets' })),
    ...(input.investments.length <= 2 && investmentValue > 0 ? [{ id: 'alert-portfolio', title: 'Investment allocation is concentrated', message: 'Diversification is limited relative to overall exposure.', priority: 'medium' as NotificationPriority, actionHref: '/dashboard/investments' }] : []),
    ...(input.retirementPlans.length === 0 ? [{ id: 'alert-retirement', title: 'Retirement plan missing', message: 'Create or refresh your retirement scenario to measure long-term readiness.', priority: 'medium' as NotificationPriority, actionHref: '/dashboard/wealth-planner' }] : []),
  ];

  const timeline: CoachTimelineItem[] = recommendations.slice(0, 5).map((item, index) => ({ id: `timeline-${item.id}`, title: item.title, detail: item.detail, createdAt: new Date(Date.now() - index * 86400000), status: 'new' }));
  const recommendedMonthlyContribution = activeGoal ? Math.max(0, Math.ceil((activeGoal.targetAmount - activeGoal.savedAmount) / diffInMonths(new Date(), toDate(activeGoal.deadline) || new Date()))) : Math.max(0, Math.round(monthlySavings * 0.4));
  const improvedTargetDate = activeGoal && monthlySavings > 0 ? addMonths(new Date(), Math.ceil((activeGoal.targetAmount - activeGoal.savedAmount) / Math.max(1, monthlySavings))) : null;
  const probabilityOfSuccess = clamp(activeGoal ? (monthlySavings / Math.max(1, recommendedMonthlyContribution)) * 100 : overallScore);

  const reports: CoachGeneratedReport[] = [
    { id: 'coaching-report', title: 'Financial Coaching Report', summary: `Overall health score is ${overallScore}/100 with ${risks.length} active risk signals.`, bullets: recommendations.slice(0, 3).map((item) => item.detail) },
    { id: 'wealth-plan', title: 'Wealth Improvement Plan', summary: `Monthly savings of ₹${Math.round(monthlySavings).toLocaleString()} can be split between goals, emergency reserve, and long-term investing.`, bullets: actionPlans['90-day'].map((item) => item.detail) },
    { id: 'risk-report', title: 'Risk Assessment Report', summary: `Key pressure points are ${risks.slice(0, 2).map((item) => item.title.toLowerCase()).join(' and ') || 'currently limited'}.`, bullets: risks.slice(0, 3).map((item) => item.recommendation) },
    { id: 'retirement-report', title: 'Retirement Readiness Report', summary: input.retirementPlans.length ? 'Existing retirement scenarios are available for review and optimization.' : 'No retirement plan found yet; readiness cannot be measured confidently.', bullets: [`Portfolio return: ${portfolioReturnPct.toFixed(1)}%.`, `Emergency reserve: ${emergencyFundMonths.toFixed(1)} months.`, `Suggested SIP increase: ₹${Math.max(1000, Math.round(monthlySavings * 0.2 / 500) * 500).toLocaleString()}.`] },
  ];

  return {
    overallScore,
    financialHealthScore: overallScore,
    healthBreakdown,
    topRecommendations: recommendations.slice(0, 6),
    risks: risks.slice(0, 6),
    opportunities,
    upcomingActions,
    actionPlans,
    alerts,
    timeline,
    reports,
    goalAcceleration: {
      targetGoal: activeGoal,
      recommendedMonthlyContribution,
      improvedTargetDate,
      probabilityOfSuccess,
      summary: activeGoal ? `Contributing ₹${recommendedMonthlyContribution.toLocaleString()}/month to ${activeGoal.title} lifts the success probability to ${Math.round(probabilityOfSuccess)}%.` : 'Add an active goal to receive a contribution target and probability forecast.',
    },
    familyInsights: input.familyGroups.length ? [`${input.familyGroups.length} family workspace${input.familyGroups.length > 1 ? 's are' : ' is'} active for shared planning.`, 'Use shared budgets and common savings rules to protect household goals from category drift.'] : ['No family workspace is active yet. Creating one unlocks household-level insights and shared goal coaching.'],
    explanationCards: [
      { id: 'explain-net-worth', title: 'Net worth change explained', explanation: netWorthMomentum >= 0 ? `Net worth is moving up by ${netWorthMomentum.toFixed(1)}% based on recent asset growth and savings behavior.` : `Net worth is under pressure by ${Math.abs(netWorthMomentum).toFixed(1)}%, likely from higher liabilities or weaker recent cash flow.` },
      { id: 'explain-budget', title: 'Budget trend explained', explanation: overspentBudgets.length ? `${overspentBudgets[0].categoryName} is the main driver of budget pressure this month.` : 'Budget usage is broadly within plan with no major category breakouts.' },
      { id: 'explain-portfolio', title: 'Portfolio performance explained', explanation: investmentValue > 0 ? `Your portfolio is ${portfolioReturnPct >= 0 ? 'up' : 'down'} ${Math.abs(portfolioReturnPct).toFixed(1)}% versus invested capital.` : 'No active investment value is available to explain yet.' },
      { id: 'explain-trading', title: 'Trading results explained', explanation: input.trades.length ? `${input.trades.length} trades are logged. Use win rate and realized P&L to separate discipline from outcome noise.` : 'No trading records are available yet.' },
    ],
    metrics: { monthlyIncome, monthlyExpenses, monthlySavings, savingsRate, emergencyFundMonths, debtToAssetRatio, portfolioReturnPct, netWorthMomentum, taxEstimate },
  };
}

export function answerFinancialCoachQuery(query: string, snapshot: FinancialCoachSnapshot, input: FinancialCoachInput): CoachQueryAnswer {
  const lower = query.toLowerCase();
  if (lower.includes('food') && lower.includes('last month')) {
    const spend = getCategorySpend(input.transactions, 'food', -1) + getCategorySpend(input.transactions, 'grocer', -1);
    return { intent: 'spending', title: 'Food spending last month', answer: `You spent about ₹${Math.round(spend).toLocaleString()} on food-related purchases last month.`, supporting: ['This uses transactions tagged with food or grocery-related text.', `Last-month expense baseline was ₹${Math.round(getMonthlyExpenses(input.transactions, -1)).toLocaleString()}.`] };
  }
  if (lower.includes('afford') && (lower.includes('laptop') || lower.includes('can i'))) {
    const purchase = parseCurrencyInput(query) || 100000;
    const reserveMonthsAfterPurchase = snapshot.metrics.monthlyExpenses > 0 ? (sum(input.accounts.map((account) => normalizeAmount(account.balance ?? account.currentBalance))) - purchase) / snapshot.metrics.monthlyExpenses : 0;
    const canAfford = purchase <= snapshot.metrics.monthlySavings * 3 || reserveMonthsAfterPurchase >= 3;
    return { intent: 'affordability', title: 'Purchase affordability check', answer: canAfford ? `A ₹${Math.round(purchase).toLocaleString()} laptop looks manageable if you keep at least 3 months of expenses in reserve.` : `A ₹${Math.round(purchase).toLocaleString()} laptop would strain your current buffer and reduce flexibility.`, supporting: [`Monthly savings are about ₹${Math.round(snapshot.metrics.monthlySavings).toLocaleString()}.`, `Emergency reserve after purchase would be about ${Math.max(0, reserveMonthsAfterPurchase).toFixed(1)} months.`] };
  }
  if (lower.includes('emergency fund')) {
    const targetMonths = 6;
    const needed = Math.max(0, snapshot.metrics.monthlyExpenses * targetMonths - sum(input.accounts.map((account) => normalizeAmount(account.balance ?? account.currentBalance))));
    const monthsToGoal = snapshot.metrics.monthlySavings > 0 ? Math.ceil(needed / snapshot.metrics.monthlySavings) : 0;
    return { intent: 'emergency-goal', title: 'Emergency fund goal', answer: monthsToGoal > 0 ? `At the current savings pace, you could reach a ${targetMonths}-month emergency fund in about ${monthsToGoal} months.` : 'Your current reserve already covers the emergency-fund target or savings data is insufficient.', supporting: [`Current reserve coverage is ${snapshot.metrics.emergencyFundMonths.toFixed(1)} months.`, `Monthly savings available for reserve building are about ₹${Math.round(snapshot.metrics.monthlySavings).toLocaleString()}.`] };
  }
  if (lower.includes('portfolio')) {
    return { intent: 'portfolio', title: 'Portfolio performance', answer: `Your portfolio is ${snapshot.metrics.portfolioReturnPct >= 0 ? 'up' : 'down'} ${Math.abs(snapshot.metrics.portfolioReturnPct).toFixed(1)}% against invested capital.`, supporting: [`Current portfolio value is ₹${Math.round(sum(input.investments.map((investment) => normalizeAmount(investment.currentValue)))).toLocaleString()}.`, `Invested capital is ₹${Math.round(sum(input.investments.map((investment) => normalizeAmount(investment.amountInvested)))).toLocaleString()}.`] };
  }
  if (lower.includes('tax')) {
    return { intent: 'tax', title: 'Estimated tax', answer: `Your current rough tax estimate is ₹${Math.round(snapshot.metrics.taxEstimate).toLocaleString()}.`, supporting: [taxProfileLabel(input.taxProfiles[0]), 'This is a planning estimate and should be validated against your final deductions and filing regime.'] };
  }
  return { intent: 'generic', title: 'Coach answer', answer: snapshot.topRecommendations[0]?.detail || 'I need more transaction and planning data to answer that precisely.', supporting: [`Overall health score is ${snapshot.overallScore}/100.`, snapshot.risks[0]?.impact || 'No active risk highlight is available.'] };
}
