"use client";

import React from 'react';
import { motion } from 'framer-motion';
import type { InvestmentTransaction } from '@/src/lib/investments';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Props {
  transactions: InvestmentTransaction[];
}

export default function Timeline({ transactions }: Props) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-[#151A20] rounded-[28px] p-6">
        <div className="text-gray-400">No portfolio history available</div>
      </div>
    );
  }

  return (
    <motion.div className="bg-[#151A20] rounded-[28px] p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {transactions.map((tx) => (
        <motion.div key={tx.id} className="flex items-center justify-between p-3 bg-[#0b0f13] rounded-lg" layout>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0f1720]">
              {tx.transactionType === 'BUY' ? <ArrowUpRight size={18} className="text-emerald-400" /> : <ArrowDownLeft size={18} className="text-rose-400" />}
            </div>
            <div>
              <div className="text-sm font-semibold">{tx.transactionType} {tx.assetName}</div>
              <div className="text-xs text-gray-400">{tx.transactionDate.toISOString().slice(0,10)} • Qty {tx.quantity}</div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-semibold">₹{tx.amount.toFixed(2)}</div>
            {tx.transactionType === 'SELL' && <div className="text-xs text-rose-400">Realized</div>}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
