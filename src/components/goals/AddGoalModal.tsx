"use client";

import React, { useState } from 'react';
import { useGoals } from '@/src/hooks/useGoals';
import { useAuthContext } from '@/src/context/AuthContext';

export default function AddGoalModal({ onClose }: { onClose?: () => void }) {
  const { addGoal } = useGoals();
  const auth = useAuthContext();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [savedAmount, setSavedAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState<string>('');
  const [category, setCategory] = useState('Savings');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!auth?.user?.uid) return;
    setLoading(true);
    try {
      await addGoal({ title, targetAmount: Number(targetAmount || 0), savedAmount: Number(savedAmount || 0), deadline: new Date(deadline || Date.now()), category });
      onClose?.();
    } catch (err) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#0B0D11', padding: 16, borderRadius: 16, color: '#fff' }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Create Goal</div>
      <input placeholder="Goal name" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="Target amount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="Current saved" type="number" value={savedAmount} onChange={(e) => setSavedAmount(Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <input placeholder="Target date" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, background: '#0f1418', border: '1px solid #1b2024', color: '#fff', marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #22262a', color: '#9aa2a9', padding: 10, borderRadius: 12 }}>Cancel</button>
        <button onClick={handleCreate} disabled={loading} style={{ flex: 1, background: '#7EE7C7', border: 'none', color: '#041018', padding: 10, borderRadius: 12 }}>Create</button>
      </div>
    </div>
  );
}
