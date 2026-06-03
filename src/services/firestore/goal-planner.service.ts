import { collection, doc, orderBy, query, limit, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, getDocsSafe, setDocSafe } from './safeFirestore';
import type {
  GoalPlannerHistoryRecord,
  GoalPlannerInput,
  GoalPlannerScenarioRecord,
  GoalPlannerScenarioType,
  GoalPlannerCurrency,
  GoalPlannerProjectionPoint,
  GoalPlannerMilestone,
  GoalPlannerResult,
} from '@/src/lib/goal-planner';

type GoalPlannerScenarioInput = GoalPlannerInput & {
  scenarioName: string;
  scenarioType?: GoalPlannerScenarioType;
  assumptions?: GoalPlannerResult['assumptions'];
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
};

function toFirestoreDate(value: Date | null | undefined): Timestamp | null {
  if (!value) {
    return null;
  }

  return value instanceof Timestamp ? value : Timestamp.fromDate(value);
}

function toDateValue(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function normalizeProjectionSeries(series: any[] | undefined): GoalPlannerProjectionPoint[] {
  if (!Array.isArray(series)) {
    return [];
  }

  return series.map((entry) => ({
    monthIndex: Number(entry?.monthIndex || 0),
    date: toDateValue(entry?.date) || new Date(),
    balance: Number(entry?.balance || 0),
    target: Number(entry?.target || 0),
    targetAdjusted: Number(entry?.targetAdjusted || 0),
    contribution: Number(entry?.contribution || 0),
    growth: Number(entry?.growth || 0),
    inflationImpact: Number(entry?.inflationImpact || 0),
    gap: Number(entry?.gap || 0),
    progressPercent: Number(entry?.progressPercent || 0),
  }));
}

function normalizeMilestones(milestones: any[] | undefined): GoalPlannerMilestone[] {
  if (!Array.isArray(milestones)) {
    return [];
  }

  return milestones.map((entry) => ({
    label: String(entry?.label || ''),
    progressPercent: Number(entry?.progressPercent || 0),
    date: toDateValue(entry?.date),
    balance: Number(entry?.balance || 0),
    achieved: Boolean(entry?.achieved),
  }));
}

function normalizeScenario(docSnap: any): GoalPlannerScenarioRecord {
  const data = docSnap.data() || {};

  return {
    id: docSnap.id,
    userId: String(data.userId || ''),
    goalId: data.goalId || null,
    goalTitle: String(data.goalTitle || ''),
    scenarioName: String(data.scenarioName || 'Goal scenario'),
    scenarioType: (data.scenarioType || 'custom') as GoalPlannerScenarioType,
    targetAmount: Number(data.targetAmount || 0),
    currentAmount: Number(data.currentAmount || 0),
    targetDate: toDateValue(data.targetDate),
    monthlyContribution: Number(data.monthlyContribution || 0),
    annualReturnRate: Number(data.annualReturnRate || 0),
    annualInflationRate: Number(data.annualInflationRate || 0),
    expenseReductionPercent: Number(data.expenseReductionPercent || 0),
    monthlyBudgetRemaining: Number(data.monthlyBudgetRemaining || 0),
    monthlyEmiImpact: Number(data.monthlyEmiImpact || 0),
    monthlyIncome: Number(data.monthlyIncome || 0),
    monthlyExpenses: Number(data.monthlyExpenses || 0),
    totalNetWorth: Number(data.totalNetWorth || 0),
    totalInvestments: Number(data.totalInvestments || 0),
    currency: (data.currency || 'INR') as GoalPlannerCurrency,
    projectedCompletionDate: toDateValue(data.projectedCompletionDate),
    monthsToCompletion: data.monthsToCompletion == null ? null : Number(data.monthsToCompletion),
    requiredMonthlyContribution: Number(data.requiredMonthlyContribution || 0),
    goalHealthScore: Number(data.goalHealthScore || 0),
    probabilityOfSuccess: Number(data.probabilityOfSuccess || 0),
    projectedBalance: Number(data.projectedBalance || 0),
    shortfall: Number(data.shortfall || 0),
    effectiveMonthlyContribution: Number(data.effectiveMonthlyContribution || 0),
    projectionSeries: normalizeProjectionSeries(data.projectionSeries),
    milestones: normalizeMilestones(data.milestones),
    aiInsight: String(data.aiInsight || ''),
    assumptions: {
      annualReturnRate: Number(data.assumptions?.annualReturnRate || data.annualReturnRate || 0),
      annualInflationRate: Number(data.assumptions?.annualInflationRate || data.annualInflationRate || 0),
      expenseReductionPercent: Number(data.assumptions?.expenseReductionPercent || data.expenseReductionPercent || 0),
      monthlyBudgetRemaining: Number(data.assumptions?.monthlyBudgetRemaining || data.monthlyBudgetRemaining || 0),
      monthlyEmiImpact: Number(data.assumptions?.monthlyEmiImpact || data.monthlyEmiImpact || 0),
    },
    createdAt: toDateValue(data.createdAt) || new Date(),
    updatedAt: toDateValue(data.updatedAt) || new Date(),
    deletedAt: toDateValue(data.deletedAt),
  };
}

function normalizeHistory(docSnap: any): GoalPlannerHistoryRecord {
  const data = docSnap.data() || {};

  return {
    id: docSnap.id,
    userId: String(data.userId || ''),
    scenarioId: String(data.scenarioId || ''),
    goalId: data.goalId || null,
    goalTitle: String(data.goalTitle || ''),
    scenarioName: String(data.scenarioName || 'Goal scenario'),
    targetAmount: Number(data.targetAmount || 0),
    currentAmount: Number(data.currentAmount || 0),
    monthlyContribution: Number(data.monthlyContribution || 0),
    projectedCompletionDate: toDateValue(data.projectedCompletionDate),
    monthsToCompletion: data.monthsToCompletion == null ? null : Number(data.monthsToCompletion),
    goalHealthScore: Number(data.goalHealthScore || 0),
    probabilityOfSuccess: Number(data.probabilityOfSuccess || 0),
    projectedBalance: Number(data.projectedBalance || 0),
    shortfall: Number(data.shortfall || 0),
    aiInsight: String(data.aiInsight || ''),
    projectionSeries: normalizeProjectionSeries(data.projectionSeries),
    createdAt: toDateValue(data.createdAt) || new Date(),
    updatedAt: toDateValue(data.updatedAt) || new Date(),
    deletedAt: toDateValue(data.deletedAt),
  };
}

function getScenarioCollectionRef() {
  const db = getFirestoreClient();
  if (!db) {
    throw new Error('Firestore client not available');
  }

  return collection(db, COLLECTIONS.GOAL_PLANNER_SCENARIOS);
}

function getHistoryCollectionRef() {
  const db = getFirestoreClient();
  if (!db) {
    throw new Error('Firestore client not available');
  }

  return collection(db, COLLECTIONS.GOAL_PLANNER_HISTORY);
}

function buildScenarioPayload(userId: string, scenario: GoalPlannerScenarioInput): Record<string, unknown> {
  const now = new Date();
  return {
    userId,
    goalId: scenario.goalId || null,
    goalTitle: scenario.goalTitle,
    scenarioName: scenario.scenarioName,
    scenarioType: scenario.scenarioType || 'custom',
    targetAmount: scenario.targetAmount,
    currentAmount: scenario.currentAmount,
    targetDate: toFirestoreDate(scenario.targetDate),
    monthlyContribution: scenario.monthlyContribution,
    annualReturnRate: scenario.annualReturnRate,
    annualInflationRate: scenario.annualInflationRate,
    expenseReductionPercent: scenario.expenseReductionPercent,
    monthlyBudgetRemaining: scenario.monthlyBudgetRemaining,
    monthlyEmiImpact: scenario.monthlyEmiImpact,
    monthlyIncome: scenario.monthlyIncome,
    monthlyExpenses: scenario.monthlyExpenses,
    totalNetWorth: scenario.totalNetWorth,
    totalInvestments: scenario.totalInvestments,
    currency: scenario.currency,
    projectedCompletionDate: toFirestoreDate(scenario.projectedCompletionDate),
    monthsToCompletion: scenario.monthsToCompletion,
    requiredMonthlyContribution: scenario.requiredMonthlyContribution,
    goalHealthScore: scenario.goalHealthScore,
    probabilityOfSuccess: scenario.probabilityOfSuccess,
    projectedBalance: scenario.projectedBalance,
    shortfall: scenario.shortfall,
    effectiveMonthlyContribution: scenario.effectiveMonthlyContribution,
    projectionSeries: scenario.projectionSeries.map((point) => ({
      ...point,
      date: toFirestoreDate(point.date),
    })),
    milestones: scenario.milestones.map((milestone) => ({
      ...milestone,
      date: toFirestoreDate(milestone.date),
    })),
    aiInsight: scenario.aiInsight,
    assumptions: scenario.assumptions || {
      annualReturnRate: scenario.annualReturnRate,
      annualInflationRate: scenario.annualInflationRate,
      expenseReductionPercent: scenario.expenseReductionPercent,
      monthlyBudgetRemaining: scenario.monthlyBudgetRemaining,
      monthlyEmiImpact: scenario.monthlyEmiImpact,
    },
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    deletedAt: null,
  };
}

function buildHistoryPayload(userId: string, scenarioId: string, scenario: GoalPlannerInput, result: GoalPlannerResult, scenarioName: string): Record<string, unknown> {
  const now = new Date();
  return {
    userId,
    scenarioId,
    goalId: scenario.goalId || null,
    goalTitle: scenario.goalTitle,
    scenarioName,
    targetAmount: scenario.targetAmount,
    currentAmount: scenario.currentAmount,
    monthlyContribution: scenario.monthlyContribution,
    projectedCompletionDate: toFirestoreDate(result.projectedCompletionDate),
    monthsToCompletion: result.monthsToCompletion,
    goalHealthScore: result.goalHealthScore,
    probabilityOfSuccess: result.probabilityOfSuccess,
    projectedBalance: result.projectedBalance,
    shortfall: result.shortfall,
    aiInsight: result.aiInsight,
    projectionSeries: result.projectionSeries.map((point) => ({
      ...point,
      date: toFirestoreDate(point.date),
    })),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    deletedAt: null,
  };
}

export class GoalPlannerService {
  async getSavedScenarios(userId: string): Promise<GoalPlannerScenarioRecord[]> {
    try {
      const ref = getScenarioCollectionRef();
      const snap = await getDocsSafe(query(ref, where('userId', '==', userId), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(20)));
      return snap.docs.map((docSnap) => normalizeScenario(docSnap));
    } catch (error) {
      console.error('Error loading goal planner scenarios:', error);
      return [];
    }
  }

  async getSimulationHistory(userId: string, scenarioId?: string): Promise<GoalPlannerHistoryRecord[]> {
    try {
      const ref = getHistoryCollectionRef();
      const constraints = [where('userId', '==', userId), where('deletedAt', '==', null), orderBy('createdAt', 'desc'), limit(30)];
      const finalConstraints = scenarioId ? [where('scenarioId', '==', scenarioId), ...constraints] : constraints;
      const snap = await getDocsSafe(query(ref, ...finalConstraints));
      return snap.docs.map((docSnap) => normalizeHistory(docSnap));
    } catch (error) {
      console.error('Error loading goal planner history:', error);
      return [];
    }
  }

  async saveScenarioSnapshot(userId: string, scenarioId: string | null, scenario: GoalPlannerScenarioInput): Promise<GoalPlannerScenarioRecord> {
    const payload = buildScenarioPayload(userId, scenario);
    const ref = getScenarioCollectionRef();

    if (scenarioId) {
      const docRef = doc(ref, scenarioId);
      await setDocSafe(docRef, payload as any, { merge: false });
      return {
        id: scenarioId,
        userId,
        goalId: scenario.goalId || null,
        goalTitle: scenario.goalTitle,
        scenarioName: scenario.scenarioName,
        scenarioType: scenario.scenarioType || 'custom',
        targetAmount: scenario.targetAmount,
        currentAmount: scenario.currentAmount,
        targetDate: scenario.targetDate || null,
        monthlyContribution: scenario.monthlyContribution,
        annualReturnRate: scenario.annualReturnRate,
        annualInflationRate: scenario.annualInflationRate,
        expenseReductionPercent: scenario.expenseReductionPercent,
        monthlyBudgetRemaining: scenario.monthlyBudgetRemaining,
        monthlyEmiImpact: scenario.monthlyEmiImpact,
        monthlyIncome: scenario.monthlyIncome,
        monthlyExpenses: scenario.monthlyExpenses,
        totalNetWorth: scenario.totalNetWorth,
        totalInvestments: scenario.totalInvestments,
        currency: scenario.currency,
        projectedCompletionDate: scenario.projectedCompletionDate || null,
        monthsToCompletion: scenario.monthsToCompletion,
        requiredMonthlyContribution: scenario.requiredMonthlyContribution,
        goalHealthScore: scenario.goalHealthScore,
        probabilityOfSuccess: scenario.probabilityOfSuccess,
        projectedBalance: scenario.projectedBalance,
        shortfall: scenario.shortfall,
        effectiveMonthlyContribution: scenario.effectiveMonthlyContribution,
        projectionSeries: scenario.projectionSeries,
        milestones: scenario.milestones,
        aiInsight: scenario.aiInsight,
        assumptions: scenario.assumptions || {
          annualReturnRate: scenario.annualReturnRate,
          annualInflationRate: scenario.annualInflationRate,
          expenseReductionPercent: scenario.expenseReductionPercent,
          monthlyBudgetRemaining: scenario.monthlyBudgetRemaining,
          monthlyEmiImpact: scenario.monthlyEmiImpact,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
    }

    const docRef = await addDocSafe(ref as any, payload as any);
    const newScenarioId = docRef?.id || '';
    return {
      id: newScenarioId,
      userId,
      goalId: scenario.goalId || null,
      goalTitle: scenario.goalTitle,
      scenarioName: scenario.scenarioName,
      scenarioType: scenario.scenarioType || 'custom',
      targetAmount: scenario.targetAmount,
      currentAmount: scenario.currentAmount,
      targetDate: scenario.targetDate || null,
      monthlyContribution: scenario.monthlyContribution,
      annualReturnRate: scenario.annualReturnRate,
      annualInflationRate: scenario.annualInflationRate,
      expenseReductionPercent: scenario.expenseReductionPercent,
      monthlyBudgetRemaining: scenario.monthlyBudgetRemaining,
      monthlyEmiImpact: scenario.monthlyEmiImpact,
      monthlyIncome: scenario.monthlyIncome,
      monthlyExpenses: scenario.monthlyExpenses,
      totalNetWorth: scenario.totalNetWorth,
      totalInvestments: scenario.totalInvestments,
      currency: scenario.currency,
      projectedCompletionDate: scenario.projectedCompletionDate || null,
      monthsToCompletion: scenario.monthsToCompletion,
      requiredMonthlyContribution: scenario.requiredMonthlyContribution,
      goalHealthScore: scenario.goalHealthScore,
      probabilityOfSuccess: scenario.probabilityOfSuccess,
      projectedBalance: scenario.projectedBalance,
      shortfall: scenario.shortfall,
      effectiveMonthlyContribution: scenario.effectiveMonthlyContribution,
      projectionSeries: scenario.projectionSeries,
      milestones: scenario.milestones,
      aiInsight: scenario.aiInsight,
        assumptions: scenario.assumptions || {
          annualReturnRate: scenario.annualReturnRate,
          annualInflationRate: scenario.annualInflationRate,
          expenseReductionPercent: scenario.expenseReductionPercent,
          monthlyBudgetRemaining: scenario.monthlyBudgetRemaining,
          monthlyEmiImpact: scenario.monthlyEmiImpact,
        },
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }

  async saveSimulationHistory(userId: string, scenarioId: string, scenario: GoalPlannerInput, result: GoalPlannerResult): Promise<GoalPlannerHistoryRecord> {
    const ref = getHistoryCollectionRef();
    const payload = buildHistoryPayload(userId, scenarioId, scenario, result, scenario.scenarioName || scenario.goalTitle || 'Goal scenario');
    const docRef = await addDocSafe(ref as any, payload as any);

    return {
      id: docRef?.id || '',
      userId,
      scenarioId,
      goalId: scenario.goalId || null,
      goalTitle: scenario.goalTitle,
      scenarioName: scenario.scenarioName || scenario.goalTitle || 'Goal scenario',
      targetAmount: scenario.targetAmount,
      currentAmount: scenario.currentAmount,
      monthlyContribution: scenario.monthlyContribution,
      projectedCompletionDate: result.projectedCompletionDate,
      monthsToCompletion: result.monthsToCompletion,
      goalHealthScore: result.goalHealthScore,
      probabilityOfSuccess: result.probabilityOfSuccess,
      projectedBalance: result.projectedBalance,
      shortfall: result.shortfall,
      aiInsight: result.aiInsight,
      projectionSeries: result.projectionSeries,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }
}

export const goalPlannerService = new GoalPlannerService();
