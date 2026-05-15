'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePolicies } from '@/src/hooks/usePolicies';
import { getDaysUntilRenewal, getPolicyStatus, type PolicyModel } from '@/src/lib/policies';
import { formatCurrency } from '@/src/lib/currency';

export default function PoliciesPage() {
  const { policies, loading, saving, addPolicy, updatePolicy, deletePolicy } = usePolicies();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    premium: 0,
    renewalDate: new Date().toISOString().split('T')[0],
    policyNumber: '',
    coverage: 0,
    notes: '',
  });

  const handleOpen = (policy?: PolicyModel) => {
    if (policy) {
      setEditingId(policy.id);
      setFormData({
        name: policy.name,
        provider: policy.provider,
        premium: policy.premium,
        renewalDate: new Date(policy.renewalDate).toISOString().split('T')[0],
        policyNumber: policy.policyNumber || '',
        coverage: policy.coverage || 0,
        notes: policy.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        provider: '',
        premium: 0,
        renewalDate: new Date().toISOString().split('T')[0],
        policyNumber: '',
        coverage: 0,
        notes: '',
      });
    }
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        renewalDate: new Date(formData.renewalDate),
      };

      if (editingId) {
        await updatePolicy(editingId, payload);
      } else {
        await addPolicy(payload);
      }
      setSheetOpen(false);
    } catch (err) {
      console.error('Error saving policy:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this policy?')) {
      try {
        await deletePolicy(id);
      } catch (err) {
        console.error('Error deleting policy:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading policies...</p>
        </div>
      </div>
    );
  }

  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">
      {/* Header with Stats */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Insurance Policies</h1>
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
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Policies</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{policies.length}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Annual Premium</p>
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totalPremium)}</p>
          </div>
        </div>
      </div>

      {/* Policies List */}
      {policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Shield className="size-12 text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No policies added yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Track your insurance coverage</p>
          <Button onClick={() => handleOpen()} className="mt-4">
            <Plus className="size-4 mr-2" />
            Add Policy
          </Button>
        </div>
      ) : (
        <div className="space-y-2 px-4 py-4">
          {policies.map(policy => {
            const daysUntil = getDaysUntilRenewal(policy);
            const status = getPolicyStatus(policy);

            return (
              <div
                key={policy.id}
                className={`p-3 rounded-lg border ${
                  status === 'expired'
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                    : status === 'renewing_soon'
                      ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {policy.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {policy.provider}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleOpen(policy)}
                    >
                      <Edit2 className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(policy.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>

                {/* Status Badge & Details */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    status === 'expired'
                      ? 'bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : status === 'renewing_soon'
                        ? 'bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {status === 'expired' ? 'Expired' : `Renews in ${daysUntil} days`}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(policy.premium)}/yr
                  </span>
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
              {editingId ? 'Edit Policy' : 'Add Policy'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Insurance Name</label>
              <input
                type="text"
                placeholder="e.g., Term Life Insurance"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Provider</label>
              <input
                type="text"
                placeholder="e.g., HDFC Life"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Annual Premium</label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.premium}
                  onChange={(e) => setFormData({ ...formData, premium: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Renewal Date</label>
                <input
                  type="date"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formData.renewalDate}
                  onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Policy Number</label>
              <input
                type="text"
                placeholder="Optional"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Coverage Amount (optional)</label>
              <input
                type="number"
                placeholder="0"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={formData.coverage}
                onChange={(e) => setFormData({ ...formData, coverage: parseFloat(e.target.value) || 0 })}
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
              disabled={saving || !formData.name || !formData.provider}
              className="w-full"
            >
              {saving ? 'Saving...' : editingId ? 'Update Policy' : 'Add Policy'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
