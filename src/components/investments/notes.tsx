"use client";

import React, { useState } from 'react';
import type { InvestmentModel } from '@/src/lib/investments';
import { investmentsService } from '@/src/services/firestore/investments.service';

interface Props {
  investment: InvestmentModel | null;
}

export default function Notes({ investment }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(investment?.notes || '');

  if (!investment) return null;

  async function save() {
    if (!investment) return;
    await investmentsService.updateInvestment(investment.id, { notes: text });
    setEditing(false);
  }

  return (
    <div className="bg-[#151A20] rounded-[28px] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-400">Notes</div>
        <button className="text-sm text-emerald-400" onClick={() => setEditing((s) => !s)}>{editing ? 'Cancel' : 'Edit'}</button>
      </div>
      {editing ? (
        <div>
          <textarea className="w-full bg-transparent border border-[#0f1114] p-2 rounded-md" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-2 flex justify-end">
            <button className="bg-emerald-500 text-black px-4 py-1 rounded-md" onClick={save}>Save</button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-300">{investment.notes || 'No notes yet. Add strategy or thoughts.'}</div>
      )}
    </div>
  );
}
