"use client";

import { useState, useMemo } from 'react';
import { Users, Info, Plus, Share2, Trash2 } from 'lucide-react';
import { type SubscriptionModel } from '@/src/services/firestore/subscriptions.service';
import { formatCurrency } from '@/src/lib/currency';

interface FamilySubscriptionsProps {
  subscriptions: SubscriptionModel[];
  onUpdateSplit?: (subId: string, splitData: any) => void;
}

export function FamilySubscriptions({ subscriptions, onUpdateSplit }: FamilySubscriptionsProps) {
  // Let's create mock family members since we want a realistic operational state.
  // We can fetch this from the user's family settings in production.
  const defaultFamilyMembers = ['Self', 'Sarah (Wife)', 'Alex (Son)', 'Emily (Sister)'];
  const [members, setMembers] = useState<string[]>(defaultFamilyMembers);
  const [newMember, setNewMember] = useState('');

  // Active subscriptions
  const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions]);

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const removeMember = (name: string) => {
    setMembers(members.filter(m => m !== name));
  };

  // Calculate the splits for each subscription
  const splitDetails = useMemo(() => {
    return activeSubs.map(sub => {
      const isShared = sub.sharedWith && sub.sharedWith.length > 0;
      
      // Default to equal split among owner + shared members if shared
      const totalParties = 1 + (sub.sharedWith?.length || 0);
      const splitAmount = isShared ? sub.amount / totalParties : sub.amount;

      // Make up a structured share detail
      const shares: Record<string, number> = {};
      shares['Self'] = splitAmount;
      if (sub.sharedWith) {
        sub.sharedWith.forEach(member => {
          shares[member] = splitAmount;
        });
      }

      return {
        id: sub.id,
        name: sub.name,
        totalAmount: sub.amount,
        frequency: sub.frequency,
        isShared,
        owner: 'Self',
        sharedMembers: sub.sharedWith || [],
        shares
      };
    });
  }, [activeSubs]);

  // Aggregate total dues owed by each family member to 'Self'
  const duesSummary = useMemo(() => {
    const owes: Record<string, number> = {};
    
    // Initialize
    members.forEach(m => {
      if (m !== 'Self') owes[m] = 0;
    });

    splitDetails.forEach(detail => {
      if (detail.isShared) {
        detail.sharedMembers.forEach(member => {
          if (owes[member] !== undefined) {
            let monthlyAmt = detail.shares[member] || 0;
            if (detail.frequency === 'yearly') monthlyAmt = monthlyAmt / 12;
            else if (detail.frequency === 'weekly') monthlyAmt = monthlyAmt * 4.33;
            owes[member] += monthlyAmt;
          }
        });
      }
    });

    return Object.entries(owes).map(([name, amount]) => ({
      name,
      amount: Math.round(amount)
    }));
  }, [members, splitDetails]);

  const totalOwedToSelf = useMemo(() => {
    return duesSummary.reduce((sum, item) => sum + item.amount, 0);
  }, [duesSummary]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Manage Family Members */}
        <section className="card-surface p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-accent-mint" />
            <h3 className="text-lg font-semibold text-white">Family Members</h3>
          </div>
          
          <div className="space-y-2">
            {members.map(member => (
              <div key={member} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-[20px] px-3.5 py-2.5">
                <span className="text-sm font-medium text-white">{member}</span>
                {member !== 'Self' && (
                  <button onClick={() => removeMember(member)} className="text-secondary hover:text-red-300 transition">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 pt-2 border-t border-white/5">
            <input
              type="text"
              placeholder="Add member name..."
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
              className="flex-1 input-surface text-xs"
            />
            <button onClick={addMember} className="button-primary text-xs shrink-0 py-2.5 px-4 font-semibold rounded-2xl">
              <Plus className="size-4" />
            </button>
          </div>
        </section>

        {/* Center column: Split Summary and Dues */}
        <section className="card-surface p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Cost Split Summary</h3>
            <span className="rounded-full bg-accent-mint/10 border border-accent-mint/20 px-3 py-1 text-xs text-accent-mint font-semibold">
              Owed to you: {formatCurrency(totalOwedToSelf)}/mo
            </span>
          </div>

          {totalOwedToSelf === 0 ? (
            <div className="py-12 text-center text-sm text-secondary">
              No active shared subscriptions configured.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {duesSummary.map(dues => (
                <div key={dues.name} className="rounded-[24px] bg-[#0C1319] border border-white/5 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-secondary">Member Contribution</p>
                    <p className="text-lg font-bold text-white mt-1">{dues.name}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-xs text-secondary">Owes you monthly:</span>
                    <span className="text-sm font-bold text-accent-mint">{formatCurrency(dues.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Shared Subscriptions Grid */}
      <section className="card-surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Shared Subscriptions</h3>
          <p className="text-xs text-secondary">Configure split properties inside your subscription editor.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeSubs.map(sub => {
            const isShared = sub.sharedWith && sub.sharedWith.length > 0;
            const parties = 1 + (sub.sharedWith?.length || 0);

            return (
              <div key={sub.id} className={`rounded-[28px] border p-4 transition ${isShared ? 'border-accent-mint/20 bg-accent-mint/5' : 'border-white/5 bg-white/5'}`}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{sub.name}</h4>
                    <p className="text-xs text-secondary">{sub.category}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${isShared ? 'bg-accent-mint/20 text-accent-mint border-accent-mint/20' : 'bg-white/5 text-secondary border-white/5'}`}>
                    {isShared ? `Shared (${parties} ways)` : 'Personal'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs border-t border-white/5 pt-2 text-secondary">
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="text-white font-medium">{formatCurrency(sub.amount)} / {sub.frequency}</span>
                  </div>
                  {isShared && (
                    <>
                      <div className="flex justify-between">
                        <span>Your Share:</span>
                        <span className="text-accent-mint font-semibold">
                          {formatCurrency(sub.amount / parties)} / {sub.frequency}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="bg-white/5 border border-white/5 rounded-full px-2 py-0.5 text-[10px] text-white">Owner: Self</span>
                        {sub.sharedWith.map(m => (
                          <span key={m} className="bg-white/5 border border-white/5 rounded-full px-2 py-0.5 text-[10px] text-white">{m}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
