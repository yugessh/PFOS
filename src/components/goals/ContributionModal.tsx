"use client";

import React, { useState } from 'react';
import { goalsService } from '@/src/services/firestore/goals.service';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { accountsService } from '@/src/services/firestore/accounts.service';
import { useAuthContext } from '@/src/context/AuthContext';

export default function ContributionModal({ goalId, initialAmount = 0, onClose, onDone }: { goalId: string; initialAmount?: number; onClose?: () => void; onDone?: () => void }) {
  const auth = useAuthContext();
  const [amount, setAmount] = useState<number>(initialAmount);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContribute() {
    if (!auth?.user?.uid) return;
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      // 1. Create a transaction (expense) deducting from selected account
      const tx = {
        userId: auth.user.uid,
        accountId: accountId || undefined,
        amount,
        type: 'expense',
        category: 'goal_contribution',
        description: `Contribution to goal ${goalId}`,
        date: new Date(),
      } as any;

      const tRes = await transactionsService.createTransaction(auth.user.uid, tx);

      // 2. Update account balance rollups
      if (tRes.success && accountId) {
        await accountsService.recordAccountMovement(auth.user.uid, accountId, { amount, direction: 'outflow', description: `Goal contribution`, date: new Date() });
      }

      // 3. Update goal saved amount
      const goalResp = await goalsService.getUserGoals(auth.user.uid);
      const goals = Array.isArray(goalResp.data) ? goalResp.data : Array.isArray(goalResp.data?.data) ? goalResp.data.data : [];
      const goal = goals.find((g: any) => g.id === goalId);
      if (goal) {
        const newSaved = Number(goal.savedAmount || 0) + Number(amount || 0);
        await goalsService.updateSavedAmount(goalId, newSaved);
      }

      onDone?.();
      onClose?.();
    } catch (err) {
      // noop
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#0B0D11', padding: 16, borderRadius: 16, color: '#fff' }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Add Contribution</div>
      <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="From account id (optional)" value={accountId ?? ''} onChange={(e) => setAccountId(e.target.value || null)} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #22262a', color: '#9aa2a9', padding: 10, borderRadius: 12 }}>Cancel</button>
        <button onClick={handleContribute} disabled={loading} style={{ flex: 1, background: '#7EE7C7', border: 'none', color: '#041018', padding: 10, borderRadius: 12 }}>Contribute</button>
      </div>
    </div>
  );
}
