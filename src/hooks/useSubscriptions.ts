"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { useTransactions } from '@/src/hooks/useTransactions';
import {
  subscriptionsService,
  type SubscriptionModel,
  type SubscriptionOptimizationModel,
} from '@/src/services/firestore/subscriptions.service';

export function useSubscriptions() {
  const { user } = useAuthContext();
  const { transactions } = useTransactions();
  const [subscriptions, setSubscriptions] = useState<SubscriptionModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!user?.uid) {
      setSubscriptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await subscriptionsService.getUserSubscriptions(user.uid);
      if (res.success && res.data?.data) {
        setSubscriptions(res.data.data);
      } else {
        setError(res.error || 'Failed to fetch subscriptions');
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching subscriptions');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Save subscription
  const saveSubscription = useCallback(async (
    payload: Omit<SubscriptionModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>,
    subId?: string
  ) => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    setSaving(true);
    try {
      const res = await subscriptionsService.upsertSubscription(user.uid, payload, subId);
      if (res.success) {
        await fetchSubscriptions();
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [user?.uid, fetchSubscriptions]);

  // Delete subscription
  const deleteSubscription = useCallback(async (subId: string) => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' };
    try {
      const res = await subscriptionsService.removeSubscription(user.uid, subId);
      if (res.success) {
        setSubscriptions(prev => prev.filter(s => s.id !== subId));
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [user?.uid]);

  // 1. AUTO-DETECTION ENGINE (PART B)
  const detectedSubscriptions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const candidates: Array<Omit<SubscriptionModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>> = [];
    const groupedDesc: Record<string, typeof transactions> = {};

    // Group transactions by normalized description
    transactions.forEach(tx => {
      if (tx.type !== 'expense') return;
      const key = tx.description.toLowerCase().trim();
      if (!groupedDesc[key]) groupedDesc[key] = [];
      groupedDesc[key].push(tx);
    });

    // Check for matching keywords or recurring frequency patterns
    Object.entries(groupedDesc).forEach(([desc, txs]) => {
      // 1. Keyword detection
      const keywords = [
        { name: 'Netflix', category: 'Entertainment', match: ['netflix'] },
        { name: 'Spotify', category: 'Entertainment', match: ['spotify'] },
        { name: 'YouTube Premium', category: 'Entertainment', match: ['youtube premium', 'youtube.com/premium', 'youtube prem'] },
        { name: 'Amazon Prime', category: 'Entertainment', match: ['amazon prime', 'prime video', 'prime membership'] },
        { name: 'AWS Cloud', category: 'Cloud Services', match: ['aws', 'amazon web service'] },
        { name: 'Google One', category: 'Cloud Services', match: ['google storage', 'google cloud', 'google drive', 'google gsuite', 'google one'] },
        { name: 'Microsoft 365', category: 'Cloud Services', match: ['office 365', 'microsoft 365', 'onedrive'] },
        { name: 'Gym Membership', category: 'Health & Fitness', match: ['gym', 'fitness', 'gold gym', 'anytime fitness', 'cult fit'] },
        { name: 'Internet Bill', category: 'Utilities', match: ['act fibernet', 'jio fiber', 'airtel broadband', 'broadband', 'internet bill'] },
        { name: 'Mobile Recharge', category: 'Utilities', match: ['airtel recharge', 'jio recharge', 'mobile recharge', 'vodafone idea'] },
        { name: 'Insurance Premium', category: 'Insurance', match: ['lic', 'insurance', 'hdfc life', 'max life', 'icici pru'] },
        { name: 'Home EMI', category: 'EMI', match: ['housing loan emi', 'home loan emi', 'emi payment', 'loan emi'] }
      ];

      const foundKeyword = keywords.find(k => 
        k.match.some(m => desc.includes(m))
      );

      if (foundKeyword) {
        // Take the latest transaction details
        const latestTx = txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const alreadyExists = subscriptions.some(s => s.name.toLowerCase().includes(foundKeyword.name.toLowerCase()));
        
        if (!alreadyExists) {
          // Calculate historical price trend
          const history = txs.map(t => ({
            date: new Date(t.date).toISOString().split('T')[0],
            amount: t.amount
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          candidates.push({
            name: foundKeyword.name,
            category: foundKeyword.category,
            amount: latestTx.amount,
            frequency: 'monthly',
            billingCycleStart: new Date(latestTx.date).toISOString().split('T')[0],
            nextRenewalDate: new Date(new Date(latestTx.date).setMonth(new Date(latestTx.date).getMonth() + 1)).toISOString().split('T')[0],
            status: 'active',
            paymentMethod: 'Auto-Debit',
            usageFrequency: 'high',
            sharedWith: [],
            priceHistory: history,
            autoRenew: true,
            isDetected: true
          });
        }
        return;
      }

      // 2. Frequency-based detection for custom items
      if (txs.length >= 2) {
        const sortedTxs = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const intervals: number[] = [];
        
        for (let i = 1; i < sortedTxs.length; i++) {
          const diffTime = Math.abs(new Date(sortedTxs[i].date).getTime() - new Date(sortedTxs[i-1].date).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          intervals.push(diffDays);
        }

        // Check if interval is roughly 28-32 days (monthly) or 6-8 days (weekly)
        const isMonthly = intervals.every(days => days >= 25 && days <= 35);
        const isWeekly = intervals.every(days => days >= 5 && days <= 9);
        const isYearly = intervals.every(days => days >= 350 && days <= 380);

        if (isMonthly || isWeekly || isYearly) {
          const latestTx = sortedTxs[sortedTxs.length - 1];
          const descCapitalized = latestTx.description.charAt(0).toUpperCase() + latestTx.description.slice(1);
          
          const alreadyExists = subscriptions.some(s => s.name.toLowerCase() === desc.toLowerCase());
          if (!alreadyExists) {
            const freq = isWeekly ? 'weekly' : isYearly ? 'yearly' : 'monthly';
            const renewalDays = isWeekly ? 7 : isYearly ? 365 : 30;

            const history = sortedTxs.map(t => ({
              date: new Date(t.date).toISOString().split('T')[0],
              amount: t.amount
            }));

            candidates.push({
              name: descCapitalized,
              category: 'Custom Recurring',
              amount: latestTx.amount,
              frequency: freq as any,
              billingCycleStart: new Date(latestTx.date).toISOString().split('T')[0],
              nextRenewalDate: new Date(new Date(latestTx.date).getTime() + renewalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'active',
              paymentMethod: 'Bank Transfer',
              usageFrequency: 'high',
              sharedWith: [],
              priceHistory: history,
              autoRenew: true,
              isDetected: true
            });
          }
        }
      }
    });

    return candidates;
  }, [transactions, subscriptions]);

  // Active monthly cost helper
  const totalMonthlyCost = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        let monthlyAmt = s.amount;
        if (s.frequency === 'yearly') monthlyAmt = s.amount / 12;
        else if (s.frequency === 'weekly') monthlyAmt = s.amount * 4.33;
        return sum + monthlyAmt;
      }, 0);
  }, [subscriptions]);

  const totalAnnualCost = useMemo(() => totalMonthlyCost * 12, [totalMonthlyCost]);

  // Unused count
  const unusedCount = useMemo(() => {
    return subscriptions.filter(s => s.status === 'active' && s.usageFrequency === 'unused').length;
  }, [subscriptions]);

  // 2. SUBSCRIPTION HEALTH SCORE (PART C)
  const healthScores = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    if (active.length === 0) {
      return {
        efficiencyScore: 100,
        utilizationScore: 100,
        recurringExpenseScore: 100,
        monthlyBurdenScore: 100,
        overall: 100
      };
    }

    // A. Efficiency Score (Min 0, Max 100)
    // Deduct 15 points for duplicate functionalities, 20 points for unused subscriptions
    let duplicateCount = 0;
    const categoriesMap: Record<string, number> = {};
    active.forEach(s => {
      const cat = s.category.toLowerCase();
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });
    Object.values(categoriesMap).forEach(count => {
      if (count > 1) duplicateCount += (count - 1);
    });

    const efficiencyScore = Math.max(0, 100 - (duplicateCount * 15) - (unusedCount * 20));

    // B. Cost Utilization Score
    // Average of usage rating: High=100, Medium=75, Low=35, Unused=0
    const usageValues: number[] = active.map(s => {
      if (s.usageFrequency === 'high') return 100;
      if (s.usageFrequency === 'medium') return 75;
      if (s.usageFrequency === 'low') return 35;
      return 0;
    });
    const utilizationScore = usageValues.reduce((sum, v) => sum + v, 0) / active.length;

    // C. Recurring Expense Score
    // Based on ratio of subscriptions to total monthly expenses
    const last30DaysExpenses = transactions
      .filter(tx => tx.type === 'expense' && new Date(tx.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const ratio = last30DaysExpenses > 0 ? (totalMonthlyCost / last30DaysExpenses) : 0;
    const recurringExpenseScore = Math.max(0, Math.min(100, 100 - (ratio * 150)));

    // D. Monthly Burden Score
    // Relative to monthly income (estimate from transaction income)
    const monthlyIncome = transactions
      .filter(tx => tx.type === 'income' && new Date(tx.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, tx) => sum + tx.amount, 0);

    let monthlyBurdenScore = 100;
    if (monthlyIncome > 0) {
      const burdenRatio = totalMonthlyCost / monthlyIncome;
      monthlyBurdenScore = Math.max(0, Math.min(100, 100 - (burdenRatio * 200)));
    }

    const overall = Math.round((efficiencyScore + utilizationScore + recurringExpenseScore + monthlyBurdenScore) / 4);

    return {
      efficiencyScore: Math.round(efficiencyScore),
      utilizationScore: Math.round(utilizationScore),
      recurringExpenseScore: Math.round(recurringExpenseScore),
      monthlyBurdenScore: Math.round(monthlyBurdenScore),
      overall
    };
  }, [subscriptions, transactions, totalMonthlyCost, unusedCount]);

  // 3. OPTIMIZATION RECOMMENDATIONS (PART D, E, F)
  const optimizationRecommendations = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'duplicate' | 'unused' | 'price_increase' | 'high_cost';
      subscriptionName: string;
      category: string;
      description: string;
      potentialSavings: number;
      metadata?: any;
    }> = [];

    const active = subscriptions.filter(s => s.status === 'active');

    // Duplicate detection
    const catMap: Record<string, SubscriptionModel[]> = {};
    active.forEach(s => {
      const cat = s.category;
      if (!catMap[cat]) catMap[cat] = [];
      catMap[cat].push(s);
    });

    Object.entries(catMap).forEach(([cat, subs]) => {
      // Overlapping membership in streaming, storage etc.
      if (subs.length > 1 && ['entertainment', 'streaming', 'cloud services', 'music', 'productivity'].includes(cat.toLowerCase())) {
        const sorted = [...subs].sort((a, b) => b.amount - a.amount);
        const duplicateNames = sorted.map(s => s.name).join(', ');
        
        list.push({
          id: `dup-${cat}`,
          type: 'duplicate',
          subscriptionName: sorted[0].name,
          category: cat,
          description: `You have ${subs.length} overlapping service(s) in "${cat}" (${duplicateNames}). Consider keeping only the most utilized one.`,
          potentialSavings: sorted.slice(1).reduce((sum, s) => sum + s.amount, 0)
        });
      }
    });

    // Unused services
    active.forEach(s => {
      if (s.usageFrequency === 'unused') {
        list.push({
          id: `unused-${s.id}`,
          type: 'unused',
          subscriptionName: s.name,
          category: s.category,
          description: `You haven't used "${s.name}" recently. Cancel to stop the monthly leak.`,
          potentialSavings: s.amount
        });
      } else if (s.usageFrequency === 'low') {
        list.push({
          id: `low-${s.id}`,
          type: 'high_cost',
          subscriptionName: s.name,
          category: s.category,
          description: `"${s.name}" is rarely used and costs ${s.amount}/${s.frequency}. Consider downgrading or pausing.`,
          potentialSavings: s.amount * 0.5 // assume 50% downgrade savings
        });
      }

      // Price Increase Alerts (Part F)
      if (s.priceHistory && s.priceHistory.length >= 2) {
        const sortedHistory = [...s.priceHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const latest = sortedHistory[sortedHistory.length - 1];
        const previous = sortedHistory[sortedHistory.length - 2];

        if (latest.amount > previous.amount) {
          const increasePct = Math.round(((latest.amount - previous.amount) / previous.amount) * 100);
          list.push({
            id: `price-${s.id}`,
            type: 'price_increase',
            subscriptionName: s.name,
            category: s.category,
            description: `"${s.name}" cost increased from ₹${previous.amount} to ₹${latest.amount} (+${increasePct}%).`,
            potentialSavings: latest.amount - previous.amount,
            metadata: { oldCost: previous.amount, newCost: latest.amount, changePct: increasePct }
          });
        }
      }
    });

    return list;
  }, [subscriptions]);

  const potentialOptimizationSavings = useMemo(() => {
    return optimizationRecommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0);
  }, [optimizationRecommendations]);

  return {
    subscriptions,
    loading,
    saving,
    error,
    refresh: fetchSubscriptions,
    saveSubscription,
    deleteSubscription,
    detectedSubscriptions,
    totalMonthlyCost,
    totalAnnualCost,
    unusedCount,
    healthScores,
    optimizationRecommendations,
    potentialOptimizationSavings,
  };
}
