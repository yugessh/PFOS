'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useEMI } from '@/src/hooks/useEMI';
import { formatCurrency } from '@/src/lib/currency';
import type { EMIModel } from '@/src/lib/emi';

export default function EMIPage() {
  const { emis, loading, saving, saveEMI, removeEMI, markEMIPaid } = useEMI();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    loanAmount: 0,
    monthlyInstallment: 0,
    totalInstallments: 0,
    paidInstallments: 0,
    dueDate: 1,
    accountId: '',
    category: '',
    notes: '',
  });

  const handleOpen = (emi?: EMIModel) => {
    if (emi) {
      setEditingId(emi.id);
      setFormData({
        title: emi.title,
        loanAmount: emi.loanAmount,
        monthlyInstallment: emi.monthlyInstallment,
        totalInstallments: emi.totalInstallments,
        paidInstallments: emi.paidInstallments,
        dueDate: emi.dueDate,
        accountId: emi.accountId,
        category: emi.category,
        notes: emi.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        loanAmount: 0,
        monthlyInstallment: 0,
        totalInstallments: 0,
        paidInstallments: 0,
        dueDate: 1,
        accountId: '',
        category: '',
        notes: '',
      });
    }
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        startDate: new Date(),
      };

      await saveEMI(payload as any, editingId || undefined);
      setSheetOpen(false);
    } catch (err) {
      console.error('Error saving EMI:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this EMI?')) {
      try {
        await removeEMI(id);
      } catch (err) {
        console.error('Error deleting EMI:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading EMIs...</p>
        </div>
      </div>
    );
  }

  const totalEMI = emis.reduce((sum, e) => sum + e.monthlyInstallment, 0);
  const totalRemaining = emis.reduce((sum, e) => sum + ((e.totalInstallments - e.paidInstallments) * e.monthlyInstallment), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">
      {/* Header with Stats */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">EMI Management</h1>
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
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Monthly EMI</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalEMI)}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Remaining</p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>
      </div>

      {/* EMIs List */}
      {emis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <DollarSign className="size-12 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No EMIs added yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Track your loan repayments</p>
          <Button onClick={() => handleOpen()} className="mt-4">
            <Plus className="size-4 mr-2" />
            Add EMI
          </Button>
        </div>
      ) : (
        <div className="space-y-2 px-4 py-4">
          {emis.map(emi => {
            const progress = Math.min((emi.paidInstallments / emi.totalInstallments) * 100, 100);
            const remainingInstallments = emi.totalInstallments - emi.paidInstallments;
            const isCompleted = emi.paidInstallments >= emi.totalInstallments;

            return (
              <div
                key={emi.id}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {emi.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {remainingInstallments} months remaining • due day {emi.dueDate}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleOpen(emi)}
                    >
                      <Edit2 className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(emi.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-2 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{formatCurrency(emi.monthlyInstallment)}/month</span>
                    <span>{emi.paidInstallments}/{emi.totalInstallments} paid</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={isCompleted ? 'secondary' : 'outline'}
                      className="flex-1 h-8 text-xs"
                      onClick={() => markEMIPaid(emi.id, emi.paidInstallments + 1)}
                      disabled={saving || isCompleted}
                    >
                      {isCompleted ? 'Completed' : 'Mark Paid'}
                    </Button>
                  </div>
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
              {editingId ? 'Edit EMI' : 'Add EMI'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Loan Name</label>
              <input
                type="text"
                placeholder="e.g., Home Loan"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Total Loan Amount</label>
              <input
                type="number"
                placeholder="0"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Monthly EMI</label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.monthlyInstallment}
                  onChange={(e) => setFormData({ ...formData, monthlyInstallment: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Total Months</label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.totalInstallments}
                  onChange={(e) => setFormData({ ...formData, totalInstallments: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">EMI Due Date (of month)</label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="e.g., 5"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: parseInt(e.target.value) || 1 })}
              />
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
              disabled={saving || !formData.title}
              className="w-full"
            >
              {saving ? 'Saving...' : editingId ? 'Update EMI' : 'Add EMI'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
