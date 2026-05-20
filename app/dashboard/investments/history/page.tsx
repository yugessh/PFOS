"use client";

import React, { useEffect, useState } from 'react';
import { investmentTransactionsService } from '@/src/services/firestore/investmentTransactions.service';
import { useAuthContext } from '@/src/context/AuthContext';

export default function InvestmentHistoryPage() {
  const auth = useAuthContext();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!auth?.user?.uid) return;
      const res = await investmentTransactionsService.getUserTransactions(auth.user.uid);
      const items = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setTransactions(items as any[]);
    }

    void load();
  }, [auth?.user?.uid]);

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#080A0F', color: '#fff' }}>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Investment Activity</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {transactions.length === 0 ? (
          <div style={{ background: '#151A20', borderRadius: 28, padding: 24, textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>No investment history yet</div>
            <div style={{ color: '#9aa2a9', marginTop: 8 }}>Your buys and sells will appear here.</div>
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} style={{ background: '#151A20', borderRadius: 18, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{t.transactionType} {t.assetName}</div>
                <div style={{ color: '#9aa2a9' }}>{new Date(t.transactionDate?.toDate?.() || t.transactionDate || t.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>₹{Number(t.amount || 0).toLocaleString()}</div>
                <div style={{ color: t.transactionType === 'BUY' ? '#FF6B6B' : '#7EE7C7' }}>{t.transactionType === 'BUY' ? '-' : '+'}{Number(t.amount || 0).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
