"use client";

import React from 'react';
import ProgressRing from './ProgressRing';
import { calculateGoalProgress } from '@/src/lib/goals';
import type { GoalModel } from '@/src/lib/goals';

export default function GoalCard({ goal, onOpen, onContribute }: { goal: GoalModel; onOpen?: () => void; onContribute?: () => void }) {
  const { progress, remaining, daysRemaining } = calculateGoalProgress(goal as any);

  return (
    <div style={{ background: '#151A20', borderRadius: 28, padding: 16, color: '#fff', width: 360, boxShadow: '0 6px 18px rgba(0,0,0,0.6)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing size={80} stroke={8} progress={Math.round(progress)} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{goal.title}</div>
              <div style={{ color: '#9aa2a9', fontSize: 12 }}>{goal.category || 'Savings'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>₹{goal.targetAmount.toLocaleString()}</div>
              <div style={{ color: '#9aa2a9', fontSize: 12 }}>Target</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>₹{goal.savedAmount.toLocaleString()}</div>
              <div style={{ color: '#9aa2a9', fontSize: 12 }}>Saved</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>₹{Math.max(0, remaining).toLocaleString()}</div>
              <div style={{ color: '#9aa2a9', fontSize: 12 }}>Remaining • {Math.max(0, Math.ceil(daysRemaining))}d</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={onContribute} style={{ background: 'transparent', border: '1px solid rgba(126,231,199,0.18)', color: '#7EE7C7', padding: '8px 12px', borderRadius: 12 }}>+ Contribute</button>
            <button onClick={onOpen} style={{ background: '#22262a', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 12 }}>Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
