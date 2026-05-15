'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useSettlements } from '@/src/hooks/useSettlements';
import type { SettlementModel } from '@/src/lib/settlements';
import { formatCurrency } from '@/src/lib/currency';

export default function SettlementsPage() {
  const { settlements, loading, saving, addSettlement, updateSettlement, deleteSettlement, markAsPaid, getSummary } = useSettlements();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    personName: '',
    amount: 0,
    isPaid: false,
    note: '',
  });

  const summary = getSummary();

  const handleOpen = (settlement?: SettlementModel) => {
    if (settlement) {
      setEditingId(settlement.id);
      setFormData({
        personName: settlement.personName,
        amount: settlement.amount,
        isPaid: settlement.isPaid,
        note: settlement.note || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        personName: '',
        amount: 0,
        isPaid: false,
        note: '',
      });
    }
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateSettlement(editingId, formData);
      } else {
        await addSettlement(formData);
      }
      setSheetOpen(false);
    } catch (err) {
      console.error('Error saving settlement:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this settlement?')) {
      try {
        await deleteSettlement(id);
      } catch (err) {
        console.error('Error deleting settlement:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading settlements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">
      {/* Header with Stats */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settlements</h1>
          <Button
            size="sm"
            onClick={() => handleOpen()}
            className="h-8 gap-1"
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Pending</p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatCurrency(summary.totalPending)}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Settled</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Settlements List */}
      {settlements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Users className="size-12 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No settlements yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Track money you owe or are owed</p>
          <Button onClick={() => handleOpen()} className="mt-4">
            <Plus className="size-4 mr-2" />
            Add Settlement
          </Button>
        </div>
      ) : (
        <div className="space-y-2 px-4 py-4">
          {/* Pending Settlements */}
          {settlements.filter(s => !s.isPaid).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 uppercase tracking-wide">
                Pending
              </p>
              {settlements
                .filter(s => !s.isPaid)
                .map(settlement => (
                  <div
                    key={settlement.id}
                    className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/30"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {settlement.personName}
                        </p>
                        {settlement.note && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                            {settlement.note}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">
                        {formatCurrency(settlement.amount)}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs gap-1"
                        onClick={() => markAsPaid(settlement.id)}
                        disabled={saving}
                      >
                        <CheckCircle2 className="size-3" />
                        Mark Paid
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleOpen(settlement)}
                      >
                        <Edit2 className="size-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(settlement.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Settled Settlements */}
          {settlements.filter(s => s.isPaid).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2 uppercase tracking-wide mt-4">
                Settled
              </p>
              {settlements
                .filter(s => s.isPaid)
                .map(settlement => (
                  <div
                    key={settlement.id}
                    className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30 opacity-75"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate line-through">
                            {settlement.personName}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                        {formatCurrency(settlement.amount)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editingId ? 'Edit Settlement' : 'Add Settlement'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Person Name</label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Amount</label>
              <input
                type="number"
                placeholder="0"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Note (optional)</label>
              <textarea
                placeholder="e.g., Coffee, Dinner..."
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.personName || formData.amount <= 0}
              className="w-full"
            >
              {saving ? 'Saving...' : editingId ? 'Update Settlement' : 'Add Settlement'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
