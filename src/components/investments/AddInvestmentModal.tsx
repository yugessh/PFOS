"use client";

import React, { useState } from 'react';
import { investmentsService } from '@/src/services/firestore/investments.service';
import { useAuthContext } from '@/src/context/AuthContext';

export default function AddInvestmentModal({ onClose, onDone }: { onClose?: () => void; onDone?: () => void }) {
  const auth = useAuthContext();
  const [name, setName] = useState('');
  const [type, setType] = useState<'stocks'|'mutual_funds'|'crypto'|'gold'|'fd'|'bonds'|'real_estate'|'custom'>('stocks');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [currentPrice, setCurrentPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!auth?.user?.uid) return;
    setLoading(true);
    try {
      const qty = Number(quantity || 0);
      const purchase = Number(purchasePrice || 0);
      const current = Number(currentPrice || purchase || 0);
      const invested = qty * purchase;
      const currentValue = qty * current;

      await investmentsService.createInvestment(auth.user.uid, {
        name,
        type: type as any,
        amountInvested: invested,
        currentValue,
        quantity: qty || undefined,
        purchasePrice: purchase || undefined,
        currentPrice: current || undefined,
        notes,
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
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Add Investment</div>
      <input placeholder="Asset name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }}>
        <option value="stocks">Stocks</option>
        <option value="mutual_funds">Mutual Funds</option>
        <option value="crypto">Crypto</option>
        <option value="gold">Gold</option>
        <option value="fd">Fixed Deposit</option>
        <option value="bonds">Bonds</option>
        <option value="real_estate">Real Estate</option>
        <option value="custom">Custom</option>
      </select>
      <input placeholder="Quantity" type="number" value={quantity as any} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="Purchase price" type="number" value={purchasePrice as any} onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="Current price" type="number" value={currentPrice as any} onChange={(e) => setCurrentPrice(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #22262a', color: '#9aa2a9', padding: 10, borderRadius: 12 }}>Cancel</button>
        <button onClick={handleAdd} disabled={loading} style={{ flex: 1, background: '#7EE7C7', border: 'none', color: '#041018', padding: 10, borderRadius: 12 }}>Add</button>
      </div>
    </div>
  );
}
