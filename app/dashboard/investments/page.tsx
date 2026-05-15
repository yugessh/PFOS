'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useInvestments } from '@/src/hooks/useInvestments';
import { calculateInvestmentReturn, getInvestmentTypeLabel, getInvestmentTypeColor, type InvestmentModel } from '@/src/lib/investments';
import { formatCurrency } from '@/src/lib/currency';

export default function InvestmentsPage() {
  const { investments, loading, saving, addInvestment, updateInvestment, deleteInvestment, getTotalStats } = useInvestments();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'mutual_funds' as InvestmentModel['type'],
    amountInvested: 0,
    currentValue: 0,
    notes: '',
  });

  const { totalInvested, totalValue, totalReturn } = getTotalStats();

  const handleOpen = (investment?: InvestmentModel) => {
    if (investment) {
      setEditingId(investment.id);
      setFormData({
        name: investment.name,
        type: investment.type,
        amountInvested: investment.amountInvested,
        currentValue: investment.currentValue,
        notes: investment.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        type: 'mutual_funds',
        amountInvested: 0,
        currentValue: 0,
        notes: '',
      });
    }
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateInvestment(editingId, formData);
      } else {
        await addInvestment(formData);
      }
      setSheetOpen(false);
    } catch (err) {
      console.error('Error saving investment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this investment?')) {
      try {
        await deleteInvestment(id);
      } catch (err) {
        console.error('Error deleting investment:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">
      {/* Header with Stats */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Investments</h1>
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
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Invested</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalInvested)}</p>
          </div>
          <div className={`rounded-lg p-3 ${
            totalReturn >= 0 
              ? 'bg-green-50 dark:bg-green-900/20' 
              : 'bg-red-50 dark:bg-red-900/20'
          }`}>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Return</p>
            <p className={`text-sm font-bold ${
              totalReturn >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
            </p>
          </div>
        </div>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <TrendingUp className="size-12 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No investments yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Start tracking your portfolio</p>
          <Button onClick={() => handleOpen()} className="mt-4">
            <Plus className="size-4 mr-2" />
            Add Investment
          </Button>
        </div>
      ) : (
        <div className="space-y-2 px-4 py-4">
          {investments.map(investment => {
            const { gain, gainPercent } = calculateInvestmentReturn(investment);

            return (
              <div
                key={investment.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className={`flex-1 min-w-0 ${getInvestmentTypeColor(investment.type)}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {investment.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getInvestmentTypeLabel(investment.type)}
                      </p>
                    </div>
                    <p className={`text-xs font-bold flex-shrink-0 ${
                      gain >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {gain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{formatCurrency(investment.amountInvested)}</span>
                    <span>→</span>
                    <span className="font-semibold">{formatCurrency(investment.currentValue)}</span>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleOpen(investment)}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDelete(investment.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editingId ? 'Edit Investment' : 'Add Investment'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Name</label>
              <input
                type="text"
                placeholder="e.g., SIP - HDFC Growth"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Type</label>
              <select
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as InvestmentModel['type'] })}
              >
                <option value="sip">SIP</option>
                <option value="stocks">Stocks</option>
                <option value="mutual_funds">Mutual Funds</option>
                <option value="crypto">Crypto</option>
                <option value="gold">Gold</option>
                <option value="fd">Fixed Deposit</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Amount Invested</label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.amountInvested}
                  onChange={(e) => setFormData({ ...formData, amountInvested: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Current Value</label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Notes (optional)</label>
              <textarea
                placeholder="Add notes..."
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.name}
              className="w-full"
            >
              {saving ? 'Saving...' : editingId ? 'Update Investment' : 'Add Investment'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
