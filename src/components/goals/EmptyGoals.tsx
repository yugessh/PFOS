"use client";

import React from 'react';

export default function EmptyGoals({ onCreate }: { onCreate?: () => void }) {
  return (
    <div style={{ background: '#151A20', borderRadius: 28, padding: 24, color: '#fff', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No goals created yet</div>
      <div style={{ color: '#9aa2a9', marginBottom: 16 }}>Plan your savings and track progress here.</div>
      <button onClick={onCreate} style={{ background: '#7EE7C7', border: 'none', color: '#041018', padding: '10px 16px', borderRadius: 16 }}>+ Create Goal</button>
    </div>
  );
}
