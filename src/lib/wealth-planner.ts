/**
 * Wealth planner core calculations and types
 * Pure functions to compute retirement, FIRE, projections and health scores
 */

export type Currency = 'INR' | 'USD' | string;

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  monthlyExpenses: number; // in currency units
  currentSavings: number;
  currentInvestments: number;
  expectedAnnualReturn: number; // e.g., 0.07 for 7%
  expectedInflation: number; // e.g., 0.05 for 5%
  withdrawalRate?: number; // e.g., 0.04
  yearsInRetirement?: number; // optional override
}

export interface RetirementResult {
  corpusNeeded: number;
  projectedWealthAtRetirement: number;
  retirementReadinessPercent: number;
  shortfall: number;
  yearsToRetirement: number;
}

export interface FIREInput {
  currentSavings: number;
  currentInvestments: number;
  monthlySavings: number;
  monthlyExpenses: number;
  annualReturn: number;
  withdrawalRate?: number;
  annualIncome?: number;
}

export interface FIREResult {
  fiNumber: number;
  yearsToFIRE: number | null;
  savingsRatePercent: number | null;
  projectedWealth: number;
  probabilityScore: number; // 0-100 heuristic
}

export interface ProjectionPoint {
  year: number;
  balance: number;
}

export interface ProjectionResult {
  series: ProjectionPoint[];
  projectedValue: number;
}

export interface ScenarioChange {
  monthlySavingsDelta?: number;
  incomeMultiplier?: number; // e.g., 1.2 for +20%
  expenseMultiplier?: number; // e.g., 0.85 for -15%
  returnDelta?: number; // absolute change to annual return
}

export interface HealthScores {
  wealthScore: number;
  savingsScore: number;
  investmentScore: number;
  debtScore: number;
  retirementScore: number;
  overall: number;
}

export interface AIRecommendation {
  id?: string;
  message: string;
  impactEstimate?: string;
}

export const DEFAULT_WITHDRAWAL = 0.04;

export function calculateRetirement(input: RetirementInput): RetirementResult {
  const withdrawal = input.withdrawalRate ?? DEFAULT_WITHDRAWAL;
  const annualExpensesAtRetirement = input.monthlyExpenses * 12 * Math.pow(1 + (input.expectedInflation || 0), Math.max(0, input.retirementAge - input.currentAge));
  const corpusNeeded = annualExpensesAtRetirement / withdrawal;
  const yearsToRetirement = Math.max(0, input.retirementAge - input.currentAge);

  // Project current savings + investments with compound growth
  const present = input.currentSavings + input.currentInvestments;
  const r = input.expectedAnnualReturn || 0;
  const projectedWealthAtRetirement = present * Math.pow(1 + r, yearsToRetirement);

  const retirementReadinessPercent = corpusNeeded <= 0 ? 0 : Math.min(100, (projectedWealthAtRetirement / corpusNeeded) * 100);
  const shortfall = Math.max(0, corpusNeeded - projectedWealthAtRetirement);

  return {
    corpusNeeded,
    projectedWealthAtRetirement,
    retirementReadinessPercent,
    shortfall,
    yearsToRetirement,
  };
}

export function calculateFIRE(input: FIREInput, maxYears = 80): FIREResult {
  const withdrawalRate = input.withdrawalRate ?? DEFAULT_WITHDRAWAL;
  const fiNumber = (input.monthlyExpenses * 12) / withdrawalRate;

  // simulate year by year with monthly savings treated annually
  const annualSavings = input.monthlySavings * 12;
  let balance = input.currentSavings + input.currentInvestments;
  let years = 0;
  const r = input.annualReturn || 0;
  while (years < maxYears && balance < fiNumber) {
    balance = balance * (1 + r) + annualSavings;
    years += 1;
  }

  const yearsToFIRE = balance >= fiNumber ? years : null;

  const savingsRatePercent = input.annualIncome ? Math.min(100, (annualSavings / (input.annualIncome || 1)) * 100) : null;

  // crude probability score: closer and faster yields higher score
  const progress = Math.min(1, (input.currentSavings + input.currentInvestments) / Math.max(1, fiNumber));
  const speedFactor = yearsToFIRE ? 1 / Math.max(1, yearsToFIRE) : 0;
  const probabilityScore = Math.round(Math.min(100, (progress * 0.6 + speedFactor * 0.4) * 100));

  return {
    fiNumber,
    yearsToFIRE,
    savingsRatePercent,
    projectedWealth: balance,
    probabilityScore,
  };
}

export function projectWealth(currentBalance: number, monthlyContribution: number, annualReturn: number, years: number): ProjectionResult {
  const series: ProjectionPoint[] = [];
  let balance = currentBalance;
  for (let y = 1; y <= years; y++) {
    // compound annually with monthly contributions approximated as annual sum
    balance = balance * (1 + annualReturn) + monthlyContribution * 12;
    series.push({ year: y, balance });
  }

  return { series, projectedValue: balance };
}

export function simulateScenario(baseInput: FIREInput | RetirementInput, change: ScenarioChange) {
  // Support both FIREInput and RetirementInput shapes loosely by mapping values
  const monthlySavings = 'monthlySavings' in baseInput ? (baseInput as FIREInput).monthlySavings : 0;
  const monthlyExpenses = 'monthlyExpenses' in baseInput ? (baseInput as any).monthlyExpenses : 0;
  const annualReturn = ('annualReturn' in baseInput ? (baseInput as FIREInput).annualReturn : (baseInput as RetirementInput).expectedAnnualReturn) || 0;

  const newMonthlySavings = monthlySavings + (change.monthlySavingsDelta || 0);
  const newMonthlyExpenses = monthlyExpenses * (change.expenseMultiplier ?? 1);
  const newAnnualReturn = annualReturn + (change.returnDelta || 0);

  const fireInput: FIREInput = {
    currentSavings: 'currentSavings' in baseInput ? (baseInput as any).currentSavings : 0,
    currentInvestments: 'currentInvestments' in baseInput ? (baseInput as any).currentInvestments : 0,
    monthlySavings: newMonthlySavings,
    monthlyExpenses: newMonthlyExpenses,
    annualReturn: newAnnualReturn,
    annualIncome: ('annualIncome' in baseInput ? (baseInput as any).annualIncome : undefined),
  };

  const fire = calculateFIRE(fireInput);
  const projection = projectWealth(fireInput.currentSavings + fireInput.currentInvestments, fireInput.monthlySavings, fireInput.annualReturn, 30);

  return { fire, projection };
}

export function computeHealthScores(params: { netWorth: number; monthlySavings: number; monthlyExpenses: number; debt: number; retirementReadinessPercent: number; }): HealthScores {
  const { netWorth, monthlySavings, monthlyExpenses, debt, retirementReadinessPercent } = params;
  const savingsRatio = monthlySavings / Math.max(1, monthlyExpenses);
  const wealthScore = Math.min(100, Math.log10(Math.max(1, netWorth)) * 10);
  const savingsScore = Math.min(100, Math.max(0, savingsRatio * 50));
  const investmentScore = Math.min(100, Math.max(0, (wealthScore + savingsScore) / 2));
  const debtScore = Math.max(0, 100 - Math.min(100, (debt / Math.max(1, netWorth)) * 100));
  const retirementScore = Math.min(100, retirementReadinessPercent);
  const overall = Math.round((wealthScore * 0.25 + savingsScore * 0.2 + investmentScore * 0.2 + debtScore * 0.15 + retirementScore * 0.2));

  return {
    wealthScore: Math.round(wealthScore),
    savingsScore: Math.round(savingsScore),
    investmentScore: Math.round(investmentScore),
    debtScore: Math.round(debtScore),
    retirementScore: Math.round(retirementScore),
    overall,
  };
}

export function generateAIRecommendations(scores: HealthScores, fire: FIREResult): AIRecommendation[] {
  const recs: AIRecommendation[] = [];
  if (scores.savingsScore < 30) {
    recs.push({ message: 'Increase monthly savings — try adding ₹3,000 to your SIPs.' });
  }
  if (fire.yearsToFIRE !== null && fire.yearsToFIRE > 10) {
    recs.push({ message: `You can reduce FIRE time by increasing monthly savings. Estimated years: ${fire.yearsToFIRE}.` });
  }
  if (scores.retirementScore < 50) {
    recs.push({ message: 'Retirement readiness is low — consider boosting equity allocation or delaying retirement age.' });
  }

  return recs;
}
