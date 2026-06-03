'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useBudgets } from '@/src/hooks/useBudgets';
import { useNetWorth } from '@/src/hooks/useNetWorth';
import { useGoals } from '@/src/hooks/useGoals';
import { useInvestments } from '@/src/hooks/useInvestments';
import { useTradingJournal } from '@/src/hooks/useTradingJournal';
import { useEvents } from '@/src/hooks/useEvents';
import { useAutomations } from '@/src/hooks/useAutomations';
import { useInsights } from '@/src/hooks/useInsights';
import { taxPlannerService } from '@/src/services/firestore/tax-planner.service';
import { wealthPlannerService } from '@/src/services/firestore/wealth-planner.service';
import { assetService } from '@/src/services/firestore/asset.service';
import { documentsService } from '@/src/services/firestore/documents.service';
import reportsService from '@/src/services/firestore/reports.service';
import { familyService } from '@/src/services/firestore/family.service';
import { notificationsService } from '@/src/services/firestore/notifications.service';
import { financialCoachService } from '@/src/services/firestore/financialCoach.service';
import { aiInsightsService } from '@/src/services/firestore/aiInsights.service';
import { answerFinancialCoachQuery, buildFinancialCoachSnapshot, type CoachDocumentLike, type CoachFamilyGroupLike, type CoachQueryAnswer, type FinancialCoachInput } from '@/src/lib/financial-coach';

export function useFinancialCoach() {
  const { user } = useAuthContext();
  const userId = user?.uid ?? null;
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { budgetItems } = useBudgets(transactions as any);
  const { netWorthData, history } = useNetWorth();
  const { goals } = useGoals();
  const { investments } = useInvestments();
  const { trades } = useTradingJournal();
  const { events } = useEvents();
  const { automations } = useAutomations();
  const { reload: reloadInsights } = useInsights();

  const [taxProfiles, setTaxProfiles] = useState<any[]>([]);
  const [retirementPlans, setRetirementPlans] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [liabilities, setLiabilities] = useState<any[]>([]);
  const [documents, setDocuments] = useState<CoachDocumentLike[]>([]);
  const [familyGroups, setFamilyGroups] = useState<CoachFamilyGroupLike[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [queryAnswer, setQueryAnswer] = useState<CoachQueryAnswer | null>(null);
  const didAutoSync = useRef(false);

  const loadSupplementalData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tax, retirement, userAssets, userLiabilities, dueDocs, groups, scheduledReports, coachHistory] = await Promise.all([
        taxPlannerService.getTaxProfiles(userId),
        wealthPlannerService.getPlans(userId),
        assetService.getAssets(userId),
        assetService.getLiabilities(userId),
        documentsService.getDueThisWeek(userId),
        familyService.getUserGroups(userId),
        reportsService.getScheduledReports(userId),
        financialCoachService.getHistory(userId),
      ]);
      setTaxProfiles(Array.isArray(tax) ? tax : []);
      setRetirementPlans(Array.isArray(retirement) ? retirement : []);
      setAssets(Array.isArray(userAssets) ? userAssets : []);
      setLiabilities(Array.isArray(userLiabilities) ? userLiabilities : []);
      setDocuments(Array.isArray(dueDocs) ? dueDocs : []);
      setFamilyGroups(Array.isArray(groups) ? groups : []);
      setReports(Array.isArray(scheduledReports) ? scheduledReports : []);
      setHistoryItems(Array.isArray(coachHistory) ? coachHistory : []);
    } catch (error) {
      console.error('useFinancialCoach.loadSupplementalData', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSupplementalData();
    });
  }, [loadSupplementalData]);

  const input = useMemo<FinancialCoachInput>(() => ({
    currency: 'INR',
    accounts: accounts || [],
    transactions: (transactions || []) as any,
    budgets: (budgetItems || []).map((item: any) => ({ id: item.id, categoryName: item.categoryName, monthlyLimit: item.monthlyLimit, spent: item.spent, progress: item.progress })),
    netWorth: { netWorth: netWorthData.netWorth || 0, totalAssets: netWorthData.totalAssets || 0, totalLiabilities: netWorthData.totalLiabilities || 0, history: history || [] },
    goals: goals || [],
    investments: investments || [],
    trades: trades || [],
    taxProfiles,
    retirementPlans,
    assets,
    liabilities,
    events: events || [],
    documents,
    familyGroups,
    automations: automations || [],
    reports,
  }), [accounts, assets, automations, budgetItems, documents, events, familyGroups, goals, history, investments, liabilities, netWorthData, reports, retirementPlans, taxProfiles, trades, transactions]);

  const snapshot = useMemo(() => buildFinancialCoachSnapshot(input), [input]);

  const syncCoachState = useCallback(async () => {
    if (!userId) return;
    setSyncing(true);
    try {
      await Promise.all([
        financialCoachService.saveHealthScore(userId, snapshot),
        financialCoachService.saveRecommendations(userId, snapshot.topRecommendations),
        financialCoachService.saveRiskAssessments(userId, snapshot.risks),
        financialCoachService.appendHistory(userId, snapshot.timeline),
      ]);
      await Promise.all(snapshot.alerts.slice(0, 3).map((alert) => notificationsService.createNotification(userId, 'ai_recommendation', alert.title, alert.message, alert.priority, { coachAlert: true }, alert.actionHref, undefined, { module: 'ai', sourceModule: 'financial-coach' })));
      if (snapshot.topRecommendations[0]) {
        await aiInsightsService.createInsight(userId, {
          title: snapshot.topRecommendations[0].title,
          description: snapshot.topRecommendations[0].detail,
          insightType: 'Financial Coach',
          priority: snapshot.topRecommendations[0].priority === 'critical' || snapshot.topRecommendations[0].priority === 'high' ? 'high' : 'medium',
          sourceModule: 'financial-coach',
          status: 'active',
        } as any);
        await reloadInsights();
      }
      const nextHistory = await financialCoachService.getHistory(userId);
      setHistoryItems(nextHistory);
    } catch (error) {
      console.error('useFinancialCoach.syncCoachState', error);
    } finally {
      setSyncing(false);
    }
  }, [reloadInsights, snapshot, userId]);

  useEffect(() => {
    if (!userId || loading || didAutoSync.current) return;
    didAutoSync.current = true;
    void syncCoachState();
  }, [loading, syncCoachState, userId]);

  const ask = useCallback((query: string) => {
    const answer = answerFinancialCoachQuery(query, snapshot, input);
    setQueryAnswer(answer);
    return answer;
  }, [input, snapshot]);

  return {
    snapshot,
    input,
    loading,
    syncing,
    queryAnswer,
    historyItems: historyItems.length ? historyItems : snapshot.timeline,
    ask,
    refresh: loadSupplementalData,
    syncCoachState,
  };
}
