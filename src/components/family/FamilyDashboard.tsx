"use client";

import React, { useState } from 'react';
import { familyService } from '@/src/services/firestore/family.service';
import type { FamilyGroup } from '@/src/lib/family-finance';

export default function FamilyDashboard() {
  const [name, setName] = useState('My Family');
  const [creating, setCreating] = useState(false);

  async function createGroup() {
    setCreating(true);
    try {
      // placeholder ownerId — real integration should use auth currentUser.uid
      const group: FamilyGroup = { name, ownerId: 'me', members: [{ id: 'me', displayName: 'Me', role: 'owner' }], createdAt: new Date() };
      await familyService.createGroup('me', group);
      // no-op: UI refresh would fetch groups
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
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
            <button disabled={creating} onClick={createGroup} className="px-4 py-2 bg-[#7EE7C7] text-black rounded">
              {creating ? 'Creating…' : 'Create Family'}
            </button>
          </div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Members</h2>
          <p className="mt-2">Invite family members and manage roles.</p>
        </section>
      </div>
    </div>
  );
}
