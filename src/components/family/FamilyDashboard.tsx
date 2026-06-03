"use client";

import React, { useEffect, useState } from 'react';
import { familyService } from '@/src/services/firestore/family.service';
import type { FamilyGroup } from '@/src/lib/family-finance';
import { useAuthContext } from '@/src/context/AuthContext';

export default function FamilyDashboard() {
  const { user } = useAuthContext();
  const uid = user?.uid;

  const [name, setName] = useState('My Family');
  const [creating, setCreating] = useState(false);
  const [groups, setGroups] = useState<FamilyGroup[]>([] as any);

  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    (async () => {
      try {
        const g = await familyService.getUserGroups(uid);
        if (mounted) setGroups(g as any);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, [uid]);

  async function createGroup() {
    if (!uid) return;
    setCreating(true);
    try {
      const group: FamilyGroup = { name, ownerId: uid, members: [{ id: uid, displayName: 'Me', role: 'owner' }], createdAt: new Date() };
      await familyService.createGroup(uid, group);
      const g = await familyService.getUserGroups(uid);
      setGroups(g as any);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  // Shared account form
  const [accountName, setAccountName] = useState('Joint Savings');
  const [accountBalance, setAccountBalance] = useState(100000);
  const [owners, setOwners] = useState<{ memberId: string; percent: number }[]>([]);

  async function addSharedAccount(groupId: string) {
    if (!uid) return;
    try {
      await familyService.addSharedAccount(groupId, { name: accountName, balance: accountBalance, owners: owners.length ? owners : [{ memberId: uid, percent: 100 }] });
      // refresh groups
      const g = await familyService.getUserGroups(uid);
      setGroups(g as any);
    } catch (e) {
      console.error(e);
    }
  }

  // Expense splitting: simple equal split and record settlement
  const [splitAmount, setSplitAmount] = useState(1000);
  const [splitGroupId, setSplitGroupId] = useState<string | null>(null);

  async function splitExpenseEqualNow(group: any) {
    if (!uid || !group) return;
    try {
      const members = group.members || [];
      const per = Math.round((splitAmount / Math.max(1, members.length)) * 100) / 100;
      const settlement = { type: 'expense_split', amount: splitAmount, perMember: per, members: members.map((m: any) => ({ id: m.id, share: per })), createdBy: uid };
      await familyService.recordActivity(group.id, settlement);
      // refresh
      const g = await familyService.getUserGroups(uid);
      setGroups(g as any);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Family Workspace</h1>
        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <label className="block mb-2">Family Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded" />
          <div className="mt-3">
            <button disabled={creating || !uid} onClick={createGroup} className="px-4 py-2 bg-[#7EE7C7] text-black rounded">
              {creating ? 'Creating…' : 'Create Family'}
            </button>
          </div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Your Families</h2>
          <div className="mt-3">
            {groups.length === 0 && <div>No families yet</div>}
            {groups.map((g: any) => (
              <div key={g.id} className="mb-3 p-3 bg-[#080A0F] rounded">
                <div className="font-semibold">{g.name}</div>
                <div className="text-sm">Members: {(g.members || []).map((m: any) => m.displayName).join(', ')}</div>
                <div className="mt-2">
                  <label className="block">Add Shared Account</label>
                  <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account name" className="mt-1 p-1 rounded w-full" />
                  <input value={accountBalance} onChange={(e) => setAccountBalance(Number(e.target.value))} placeholder="Balance" className="mt-1 p-1 rounded w-full" />
                  <button onClick={() => addSharedAccount(g.id)} className="mt-2 px-3 py-1 bg-[#7EE7C7] text-black rounded">Add Account</button>
                </div>

                <div className="mt-3">
                  <label className="block">Split Expense</label>
                  <input value={splitAmount} onChange={(e) => setSplitAmount(Number(e.target.value))} className="mt-1 p-1 rounded w-full" />
                  <button onClick={() => splitExpenseEqualNow(g)} className="mt-2 px-3 py-1 bg-[#7EE7C7] text-black rounded">Split Equally</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
