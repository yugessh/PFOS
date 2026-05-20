'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { tradingJournalService, type TradeRecord } from '@/src/services/firestore/tradingJournal.service';
import { useTradingJournal } from '@/src/hooks/useTradingJournal';
import JournalAnalytics from '@/src/components/trading-journal/analytics';

function currency(v: number) {
  return `₹${v.toLocaleString()}`;
}

export default function TradingJournalPage() {
  const { user } = useAuthContext();
  const uid = user?.uid;
  const { trades, loading, reload, stats } = useTradingJournal();
  const [editing, setEditing] = useState<TradeRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // stats now from hook

  async function handleSaveTrade(payload: Partial<TradeRecord>) {
    if (!uid) return;
    if (editing && editing.id) {
      await tradingJournalService.updateTrade(uid, editing.id, payload as any);
    } else {
      await tradingJournalService.createTrade(uid, payload as any);
    }
    // refresh
    await reload();
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete(id?: string) {
    if (!uid || !id) return;
    await tradingJournalService.deleteTrade(uid, id);
    await reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trading Journal</h1>
          <p className="text-sm text-muted-foreground">Track your trades and performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md bg-primary px-3 py-2 text-white"
            onClick={() => { setFormOpen(true); setEditing(null); }}
          >Add Trade</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Trades</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Win Rate</p>
          <p className="text-xl font-bold text-emerald-600">{Math.round(stats.winRate * 10) / 10}%</p>
        </div>
        <div className="bg-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Total P&L</p>
          <p className={`text-xl font-bold ${stats.totalPnl >= 0 ? 'text-primary' : 'text-red-600'}`}>{currency(stats.totalPnl)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <JournalAnalytics trades={trades} />
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading trades…</p>}
        {!loading && trades.length === 0 && (
          <div className="bg-muted rounded-lg p-6 text-center text-sm">No trades yet — tap Add Trade to start.</div>
        )}

        {trades.map((t) => (
          <div key={t.id} className="bg-card rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t.pair}</p>
                  <p className="font-semibold">{currency((t.sellPrice ?? 0) * (t.quantity ?? 1))} / {currency((t.buyPrice ?? 0) * (t.quantity ?? 1))}</p>
                </div>
                <div className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t.strategy || ''} {t.notes ? `• ${t.notes}` : ''}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`text-sm font-semibold ${((t.pnl ?? ((t.sellPrice ?? 0) - (t.buyPrice ?? 0)) * (t.quantity ?? 1)) >= 0) ? 'text-primary' : 'text-red-600'}`}>
                {currency(t.pnl ?? ((t.sellPrice ?? 0) - (t.buyPrice ?? 0)) * (t.quantity ?? 1))}
              </div>
              <div className="flex gap-2">
                <button className="text-sm text-muted-foreground" onClick={() => { setEditing(t); setFormOpen(true); }}>Edit</button>
                <button className="text-sm text-red-600" onClick={() => void handleDelete(t.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <TradeForm
          initial={editing ?? undefined}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={handleSaveTrade}
        />
      )}
    </div>
  );
}

function TradeForm({ initial, onClose, onSave }: { initial?: TradeRecord; onClose: () => void; onSave: (p: Partial<TradeRecord>) => Promise<void> }) {
  const [pair, setPair] = useState(initial?.pair ?? '');
  const [buyPrice, setBuyPrice] = useState(initial?.buyPrice ?? 0);
  const [sellPrice, setSellPrice] = useState(initial?.sellPrice ?? 0);
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [strategy, setStrategy] = useState(initial?.strategy ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [date, setDate] = useState(() => (initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-t-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{initial ? 'Edit Trade' : 'Add Trade'}</h3>
          <button onClick={onClose} className="text-sm text-muted-foreground">Close</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Pair / Symbol</label>
            <input value={pair} onChange={e => setPair(e.target.value)} className="w-full mt-1 rounded-md p-2 border" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Buy Price</label>
              <input type="number" value={buyPrice} onChange={e => setBuyPrice(Number(e.target.value))} className="w-full mt-1 rounded-md p-2 border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sell Price</label>
              <input type="number" value={sellPrice} onChange={e => setSellPrice(Number(e.target.value))} className="w-full mt-1 rounded-md p-2 border" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Quantity</label>
            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full mt-1 rounded-md p-2 border" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Strategy</label>
            <input value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full mt-1 rounded-md p-2 border" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 rounded-md p-2 border" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full mt-1 rounded-md p-2 border" />
          </div>

          <div className="flex items-center justify-end gap-2 mt-2">
            <button className="px-3 py-2 rounded-md" onClick={onClose}>Cancel</button>
            <button className="px-3 py-2 rounded-md bg-primary text-white" onClick={async () => {
              await onSave({ pair, buyPrice, sellPrice, quantity, strategy, notes, date: new Date(date) });
            }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
