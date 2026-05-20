"use client";

import { useState } from 'react';
import { Plus, Edit2, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useGoals } from '@/src/hooks/useGoals';
import { calculateGoalProgress, getGoalStatus, type GoalModel } from '@/src/lib/goals';
import { formatCurrency } from '@/src/lib/currency';

export default function GoalsPage() {
  const { goals, loading, saving, addGoal, updateGoal, deleteGoal, updateSavedAmount, getGoalStats } = useGoals();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    savedAmount: 0,
    deadline: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [contributionAmounts, setContributionAmounts] = useState<Record<string, number>>({});

  const { completed, totalTarget, totalSaved, overallProgress } = getGoalStats();

  const handleOpen = (goal?: GoalModel) => {
    if (goal) {
      setEditingId(goal.id);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        deadline: new Date(goal.deadline).toISOString().split('T')[0],
        notes: goal.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        targetAmount: 0,
        savedAmount: 0,
        deadline: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        deadline: new Date(formData.deadline),
      };

      if (editingId) {
        await updateGoal(editingId, payload);
      } else {
        await addGoal(payload);
      }
      setSheetOpen(false);
    } catch (err) {
      console.error('Error saving goal:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await deleteGoal(id);
      } catch (err) {
        console.error('Error deleting goal:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <Button size="sm" onClick={() => handleOpen()} className="h-8 gap-1">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
        {goals.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="font-bold text-gray-900 dark:text-white">{overallProgress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all" style={{ width: `${Math.min(overallProgress, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Target className="size-12 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No goals yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Start planning your financial goals</p>
            <Button onClick={() => handleOpen()} className="mt-4">
              <Plus className="size-4 mr-2" />
              Add Goal
            </Button>
          </div>
        ) : (
          goals.map(goal => {
            const { progress, remaining, daysRemaining } = calculateGoalProgress(goal);
            const status = getGoalStatus(goal);
            const isCompleted = status === 'completed';

            return (
              <div key={goal.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{goal.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{daysRemaining} days remaining</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpen(goal)}>
                      <Edit2 className="size-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="h-2 bg-gray-300 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${isCompleted ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  <span className={`font-bold ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>{progress.toFixed(0)}%</span>
                </div>

                {!isCompleted && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2">
                      <input type="number" placeholder="Add amount" className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={contributionAmounts[goal.id] ?? ''} onChange={(e) => setContributionAmounts(prev => ({ ...prev, [goal.id]: parseFloat(e.target.value) || 0 }))} />
                      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={saving || !contributionAmounts[goal.id] || contributionAmounts[goal.id] <= 0 || contributionAmounts[goal.id] > remaining} onClick={async () => { const amount = contributionAmounts[goal.id] || 0; if (amount <= 0 || amount > remaining) return; await updateSavedAmount(goal.id, goal.savedAmount + amount); setContributionAmounts(prev => ({ ...prev, [goal.id]: 0 })); }}>Add</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>{editingId ? 'Edit Goal' : 'Add Goal'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Goal Title</label>
              <input type="text" placeholder="e.g., Emergency Fund" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Target Amount</label>
              <input type="number" placeholder="0" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Currently Saved</label>
              <input type="number" placeholder="0" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={formData.savedAmount} onChange={(e) => setFormData({ ...formData, savedAmount: parseFloat(e.target.value) || 0 })} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Deadline</label>
              <input type="date" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">Notes (optional)</label>
              <textarea placeholder="Add notes..." className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </div>

            <Button onClick={handleSubmit} disabled={saving || !formData.title || formData.targetAmount <= 0} className="w-full">{saving ? 'Saving...' : editingId ? 'Update Goal' : 'Add Goal'}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
