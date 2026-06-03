"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { assetService } from '@/src/services/firestore/asset.service';
import type { AssetRecord, LiabilityRecord } from '@/src/lib/asset-register';
import { aggregateNetWorth, allocationBreakdown } from '@/src/lib/asset-register';

export default function WealthInventory() {
  const { user } = useAuthContext();
  const uid = user?.uid;

  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [liabilities, setLiabilities] = useState<LiabilityRecord[]>([]);

  const [newAssetName, setNewAssetName] = useState('Savings Account');
  const [newAssetValue, setNewAssetValue] = useState(100000);

  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    (async () => {
      const a = await assetService.getAssets(uid);
      const l = await assetService.getLiabilities(uid);
      if (mounted) {
        setAssets(a as any);
        setLiabilities(l as any);
      }
    })();
    return () => { mounted = false; };
  }, [uid]);

  async function addAsset() {
    if (!uid) return;
    const res = await assetService.saveAsset(uid, null, { name: newAssetName, category: 'bank', currentValue: newAssetValue });
    const a = await assetService.getAssets(uid);
    setAssets(a as any);
  }

  const net = useMemo(() => aggregateNetWorth(assets, liabilities), [assets, liabilities]);
  const allocation = useMemo(() => allocationBreakdown(assets), [assets]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Wealth Inventory</h1>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Total Assets<br />₹{Math.round(net.totalAssets).toLocaleString()}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Total Liabilities<br />₹{Math.round(net.totalLiabilities).toLocaleString()}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Net Worth<br />₹{Math.round(net.netWorth).toLocaleString()}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Asset Categories<br />{allocation.breakdown.length}</div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Add Asset</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            <input value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} className="p-2 rounded" />
            <input value={newAssetValue} onChange={(e) => setNewAssetValue(Number(e.target.value))} className="p-2 rounded" />
            <button onClick={addAsset} className="px-4 py-2 bg-[#7EE7C7] text-black rounded">Add</button>
          </div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Assets</h2>
          <ul className="mt-3">
            {assets.map((a) => (
              <li key={a.id} className="mb-2 p-2 bg-[#080A0F] rounded">{a.name} — ₹{Math.round(a.currentValue).toLocaleString()}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Liabilities</h2>
          <ul className="mt-3">
            {liabilities.map((l) => (
              <li key={l.id} className="mb-2 p-2 bg-[#080A0F] rounded">{l.name} — ₹{Math.round(l.outstandingAmount).toLocaleString()}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
