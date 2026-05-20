"use client";

import React, { useState } from 'react';
import type { InvestmentModel } from '@/src/lib/investments';
import { investmentTransactionsService } from '@/src/services/firestore/investmentTransactions.service';
import { investmentsService } from '@/src/services/firestore/investments.service';
import { transactionsService } from '@/src/services/firestore/transactions.service';
import { accountsService } from '@/src/services/firestore/accounts.service';
import { useAuthContext } from '@/src/context/AuthContext';

export default function BuyAssetModal({ investment, onClose, onDone }: { investment: InvestmentModel; onClose?: () => void; onDone?: () => void }) {
  const auth = useAuthContext();
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(investment.purchasePrice || 0);
  const [fees, setFees] = useState<number>(0);
  const [linkedAccount, setLinkedAccount] = useState<string | undefined>(investment.linkedAccount || undefined);
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    if (!auth?.user?.uid) return;
    if (!investment?.id) return;
    if (quantity <= 0) return;

    setLoading(true);
    try {
      const amount = quantity * price;
      const total = amount + (fees || 0);

      // 1. Create financial transaction (expense)
      await transactionsService.createTransaction(auth.user.uid, {
        userId: auth.user.uid,
        accountId: linkedAccount,
        amount: total,
        type: 'expense',
        category: 'investment_buy',
        description: `Buy ${investment.name}`,
        date: new Date(),
      } as any);

      // 2. Update account rollups
      if (linkedAccount) {
        await accountsService.recordAccountMovement(auth.user.uid, linkedAccount, { amount: total, direction: 'outflow', description: `Buy ${investment.name}`, date: new Date() });
      }

      // 3. Update investment record: quantity, amountInvested, average price, currentValue
      const existingQty = investment.quantity || 0;
      const existingInvested = investment.amountInvested || 0;
      const newQty = existingQty + quantity;
      const newInvested = existingInvested + total;
      const avgPrice = newQty > 0 ? newInvested / newQty : 0;
      const newCurrentValue = (investment.currentPrice || price) * newQty;

      await investmentsService.updateInvestment(investment.id, {
        quantity: newQty,
        amountInvested: newInvested,
        purchasePrice: avgPrice,
        currentValue: newCurrentValue,
      } as any);

      // 4. Persist investment transaction history
      await investmentTransactionsService.createTransaction(auth.user.uid, {
        investmentId: investment.id,
        transactionType: 'BUY',
        assetName: investment.name,
        assetType: investment.type,
        quantity,
        price,
        amount: total,
        linkedAccount,
        fees,
        notes: `Buy ${investment.name}`,
        transactionDate: new Date(),
      } as any);

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
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Buy {investment.name}</div>
      <input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="Fees" type="number" value={fees} onChange={(e) => setFees(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
+      <input placeholder="Linked account id (optional)" value={linkedAccount || ''} onChange={(e) => setLinkedAccount(e.target.value || undefined)} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #22262a', color: '#9aa2a9', padding: 10, borderRadius: 12 }}>Cancel</button>
        <button onClick={handleBuy} disabled={loading} style={{ flex: 1, background: '#7EE7C7', border: 'none', color: '#041018', padding: 10, borderRadius: 12 }}>Buy</button>
      </div>
    </div>
  );
}
