"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/src/context/AuthContext';
import { investmentsService } from '@/src/services/firestore/investments.service';
import { investmentTransactionsService } from '@/src/services/firestore/investmentTransactions.service';
import type { InvestmentModel, InvestmentTransaction } from '@/src/lib/investments';
import PortfolioHero from './portfolio-hero';
import PerformanceChart from './performance-chart';
import Timeline from './timeline';
import Analytics from './analytics';
import Notes from './notes';

interface Props {
  assetId: string;
}

export default function PortfolioDetailsPage({ assetId }: Props) {
  const auth = useAuthContext();
  const userId = auth?.user?.uid;
  const [investment, setInvestment] = useState<InvestmentModel | null>(null);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!userId) return;
      setLoading(true);
      try {
        const invRes = await investmentsService.getById(assetId);
        if (invRes.success && invRes.data) {
          if (mounted) setInvestment(invRes.data as InvestmentModel);
        }

        const txRes = await investmentTransactionsService.getTransactionsForInvestment(userId, assetId);
        const txs = Array.isArray(txRes.data) ? txRes.data : Array.isArray(txRes.data?.data) ? txRes.data.data : [];
        if (mounted) setTransactions(txs as InvestmentTransaction[]);
      } catch (err) {
        console.error('Error loading portfolio details', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [userId, assetId]);

  const stats = useMemo(() => {
    if (!investment) return null;
    const avgPrice = investment.quantity && investment.quantity > 0 ? (investment.amountInvested / investment.quantity) : investment.purchasePrice || 0;
    const gain = (investment.currentValue || 0) - (investment.amountInvested || 0);
    const gainPct = investment.amountInvested ? (gain / investment.amountInvested) * 100 : 0;
    return { avgPrice, gain, gainPct };
  }, [investment]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-6 space-y-6"
    >
      <div>
        <PortfolioHero investment={investment} loading={loading} stats={stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart transactions={transactions} investment={investment} />
          <Analytics investment={investment} transactions={transactions} />
        </div>

        <aside className="space-y-6">
          <Timeline transactions={transactions} />
          <Notes investment={investment} />
        </aside>
      </div>
    </motion.div>
  );
}
