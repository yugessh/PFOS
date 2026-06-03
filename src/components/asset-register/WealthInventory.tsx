"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { assetService } from '@/src/services/firestore/asset.service';
import type { AssetRecord, LiabilityRecord } from '@/src/lib/asset-register';
import { aggregateNetWorth, allocationBreakdown } from '@/src/lib/asset-register';
import AssetAllocationChart from './AssetAllocationChart';
import WealthReports from './WealthReports';
import { objectsToCSV } from '@/src/lib/export';

export default function WealthInventory() {
  const { user } = useAuthContext();
  const uid = user?.uid;

  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [liabilities, setLiabilities] = useState<LiabilityRecord[]>([]);
  const [selectedAssetValuations, setSelectedAssetValuations] = useState<any[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState('');

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
    await assetService.snapshotAllocation(uid, allocationBreakdown(a as any));
  }

  async function showValuationHistory(assetId: string) {
    const v = await assetService.getValuationHistory(assetId);
    setSelectedAssetValuations(v || []);
  }

  async function addAttachment(assetId: string) {
    if (!attachmentUrl) return;
    await assetService.addAttachmentToAsset(assetId, attachmentUrl);
    setAttachmentUrl('');
    const a = await assetService.getAssets(uid!);
    setAssets(a as any);
  }

  async function takeSnapshot() {
    if (!uid) return;
    const alloc = allocationBreakdown(assets);
    await assetService.snapshotAllocation(uid, alloc);
    alert('Snapshot recorded');
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
          <div className="md:flex md:gap-4">
            <div className="md:flex-1">
              <ul className="mt-3">
                {assets.map((a) => (
                  <li key={a.id} className="mb-2 p-2 bg-[#080A0F] rounded flex justify-between items-center">
                    <div>{a.name} — ₹{Math.round(a.currentValue).toLocaleString()}</div>
                    <div className="space-x-2">
                      <button onClick={() => showValuationHistory(a.id || '')} className="px-2 py-1 bg-[#7EE7C7] text-black rounded">Valuations</button>
                      <input placeholder="Attachment URL" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} className="p-1 rounded" />
                      <button onClick={() => addAttachment(a.id || '')} className="px-2 py-1 bg-[#7EE7C7] text-black rounded">Add Attachment</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3">
              <AssetAllocationChart data={allocation.breakdown as any} />
            </div>
          </div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Valuation History</h2>
          <ul className="mt-3">
            {selectedAssetValuations.map((v) => (
              <li key={v.id} className="mb-2 p-2 bg-[#080A0F] rounded">{new Date(v.date?.toDate ? v.date.toDate() : v.date).toLocaleDateString()} — ₹{Math.round(v.value).toLocaleString()}</li>
            ))}
          </ul>
        </section>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={takeSnapshot} className="p-4 rounded-[28px] bg-[#7EE7C7] text-black">Take Net Worth Snapshot</button>
          <WealthReports assets={assets as any} liabilities={liabilities as any} />
        </div>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Liabilities</h2>
          <ul className="mt-3">
            {liabilities.map((l) => (
              <li key={l.id} className="mb-2 p-2 bg-[#080A0F] rounded">{l.name} — ₹{Math.round(l.outstandingAmount).toLocaleString()}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Net Worth Integration</h2>
          <p className="mt-2">Snapshots are recorded after asset updates and written to allocation history and net worth snapshots for planner modules.</p>
        </section>
      </div>
    </div>
  );
}
