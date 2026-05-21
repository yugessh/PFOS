'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Users } from 'lucide-react';
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

const typeOptions: Array<{ value: SettlementModel['type']; label: string }> = [
  { value: 'lent', label: 'Lent to someone' },
  { value: 'borrowed', label: 'Borrowed from someone' },
  { value: 'custom', label: 'Custom' },
];

export default function SettlementsPage() {
  const {
    settlements,
    loading,
    saving,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    markAsPaid,
    getSummary,
  } = useSettlements();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SettlementModel>>({
    personName: '',
    amount: 0,
    type: 'lent',
    description: '',
    notes: '',
  });

  const safeSettlements = Array.isArray(settlements) ? settlements : [];
  const summary = getSummary();

  const handleOpen = (settlement?: SettlementModel) => {
    if (settlement) {
      setEditingId(settlement.id);
      setFormData({
        personName: settlement.personName,
        amount: settlement.amount,
        type: settlement.type,
        dueDate: settlement.dueDate,
        linkedAccount: settlement.linkedAccount,
        phone: settlement.phone,
        description: settlement.description,
        notes: settlement.notes,
      });
    } else {
      setEditingId(null);
      setFormData({
        personName: '',
        amount: 0,
        type: 'lent',
        description: '',
        notes: '',
      });
    }
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateSettlement(editingId, formData as Partial<SettlementModel>);
      } else {
        await addSettlement(formData as Omit<SettlementModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>);
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
          <div className="inline-block w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-slate-400">Loading settlements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080A0F] pb-24 text-white">
      <div className="sticky top-0 z-10 bg-[#080A0F] border-b border-[#151A20] px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Debt Manager</p>
            <h1 className="text-2xl font-semibold">Settlements</h1>
          </div>
          <Button size="sm" onClick={() => handleOpen()} className="h-10 gap-2 bg-[#151A20] text-white border-none hover:bg-slate-800">
            <Plus className="size-4" />
            New
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[28px] border border-[#151A20] bg-[#151A20] p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Total Lent</p>
            <p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{formatCurrency(summary.totalLent)}</p>
          </div>
          <div className="rounded-[28px] border border-[#151A20] bg-[#151A20] p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Total Borrowed</p>
            <p className="mt-2 text-2xl font-semibold text-rose-400">{formatCurrency(summary.totalBorrowed)}</p>
          </div>
          <div className="rounded-[28px] border border-[#151A20] bg-[#151A20] p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{formatCurrency(summary.totalPending)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-6">
        {safeSettlements.length === 0 ? (
          <div className="rounded-[28px] border border-[#151A20] bg-[#151A20]/70 p-8 text-center">
            <Users className="mx-auto mb-4 size-14 text-slate-500" />
            <p className="text-lg font-semibold text-white">No settlement entries yet</p>
            <p className="mt-2 text-sm text-slate-400">Add loans, borrowings, due dates and reminders quickly.</p>
            <Button onClick={() => handleOpen()} className="mt-4 bg-[#7EE7C7] text-slate-950">Add Settlement</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {safeSettlements.map((settlement) => {
              const status = settlement.status || 'pending';
              const isOverdue = status === 'overdue';
              return (
                <div key={settlement.id} className="rounded-[28px] border border-[#151A20] bg-[#151A20] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{settlement.type === 'lent' ? 'Lent' : settlement.type === 'borrowed' ? 'Borrowed' : 'Debt'}</p>
                      <h2 className="mt-1 text-xl font-semibold text-white">{settlement.personName}</h2>
                      {settlement.description && <p className="mt-2 text-sm text-slate-400">{settlement.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                        {settlement.dueDate && <span className="rounded-full border border-slate-700 px-3 py-1">Due {new Date(settlement.dueDate).toLocaleDateString()}</span>}
                        {settlement.linkedAccount && <span className="rounded-full border border-slate-700 px-3 py-1">Account {settlement.linkedAccount}</span>}
                        {settlement.phone && <span className="rounded-full border border-slate-700 px-3 py-1">{settlement.phone}</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm text-slate-400">Status</p>
                      <p className={`mt-1 text-lg font-semibold ${isOverdue ? 'text-rose-400' : 'text-[#7EE7C7]'}`}>{status.toUpperCase()}</p>
                      <p className="mt-3 text-2xl font-bold text-white">{formatCurrency(settlement.remainingAmount ?? settlement.amount)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="h-9 px-3 border-[#7EE7C7] text-[#7EE7C7]" onClick={() => markAsPaid(settlement.id)} disabled={saving}>
                      Mark Paid
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 px-3 border-slate-600 text-slate-200" onClick={() => handleOpen(settlement)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-9 px-3 text-rose-300" onClick={() => handleDelete(settlement.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[28px] bg-[#080A0F] border-t border-[#151A20]">
          <SheetHeader className="mb-4">
            <SheetTitle>{editingId ? 'Edit Settlement' : 'Add Settlement'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pb-6">
            <div>
              <label className="text-sm font-medium text-slate-200">Person Name</label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white placeholder:text-slate-500"
                value={formData.personName ?? ''}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-200">Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white"
                  value={formData.amount ?? 0}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">Type</label>
                <select
                  className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white"
                  value={formData.type ?? 'lent'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SettlementModel['type'] })}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#080A0F] text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-200">Due Date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white"
                  value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">Linked Account</label>
                <input
                  type="text"
                  placeholder="Account name or ID"
                  className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white"
                  value={formData.linkedAccount ?? ''}
                  onChange={(e) => setFormData({ ...formData, linkedAccount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-200">Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white"
                  value={formData.phone ?? ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">Description</label>
                <input
                  type="text"
                  placeholder="Short description"
                  className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white"
                  value={formData.description ?? ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">Note</label>
              <textarea
                placeholder="Add context, reminder notes, or settlement details"
                rows={3}
                className="mt-1 w-full rounded-[28px] border border-[#151A20] bg-[#151A20] px-4 py-3 text-white"
                value={formData.notes ?? ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.personName || (formData.amount ?? 0) <= 0}
              className="w-full bg-[#7EE7C7] text-slate-950"
            >
              {saving ? 'Saving...' : editingId ? 'Update Settlement' : 'Add Settlement'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
