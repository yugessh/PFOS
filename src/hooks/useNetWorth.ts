'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { useAccounts } from '@/src/hooks/useAccounts';
import { useInvestments } from '@/src/hooks/useInvestments';
import { netWorthService } from '@/src/services/firestore/networth.service';

interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyChange?: number;
  monthlyChangePercent?: number;
}

interface NetWorthHistory {
  month: string;
  netWorth: number;
  assets: number;
  liabilities: number;
  gainLoss: number;
  gainLossPercent: number;
}

/**
 * Hook for Net Worth Engine
 * Automatically calculates net worth from accounts, investments, and liabilities
 */
export function useNetWorth() {
  const { user } = useAuthContext();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { investments, loading: investmentsLoading } = useInvestments();

  const [netWorthData, setNetWorthData] = useState<NetWorthData>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
  });

  const [history, setHistory] = useState<NetWorthHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateNetWorth = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get accounts
      const accountList = accounts || [];

      // Get investments
      const investmentList = investments || [];

      // Calculate from accounts and investments
      const result = await netWorthService.calculateNetWorth(
        user.uid,
        accountList,
        investmentList,
        [], // EMIs would come from a separate hook
        []  // Credit cards would come from accounts with negative balance
      );

      setNetWorthData({
        totalAssets: result.assets,
        totalLiabilities: result.liabilities,
        netWorth: result.netWorth,
      });

      // Get historical data
      const historyResult = await netWorthService.getMonthlyTrend(user.uid, 12);
      if (historyResult.success && historyResult.data) {
        setHistory(historyResult.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate net worth');
      console.error('Error calculating net worth:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, accounts, investments]);

  useEffect(() => {
    calculateNetWorth();
  }, [calculateNetWorth, user?.uid, accounts, investments]);

  const refresh = useCallback(() => {
    calculateNetWorth();
  }, [calculateNetWorth]);

  return {
    netWorthData,
    history,
    loading: loading || accountsLoading || investmentsLoading,
    error,
    refresh,
  };
}
