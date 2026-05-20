'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Download, TrendingDown } from 'lucide-react';
import {
  BudgetSummaryCard,
  BudgetProgressCard,
  BudgetAlertCard,
} from '@/components/budget-card';
import { useBudget } from '@/src/hooks/useBudget';

export default function DashboardBudgetsPage() {
  const { budgets, alerts, summary, loading, error, createBudget, dismissAlert, refresh } = useBudget();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#080A0F]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-[#080A0F]/80 backdrop-blur border-b border-[#1F2937] px-6 py-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Budget</h1>
            <p className="text-[#9CA3AF] text-sm mt-1">Manage spending limits by category</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-lg bg-[#151A20] hover:bg-[#1F2937] transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-[#7EE7C7] ${loading ? 'animate-spin' : ''}`}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-[#151A20] hover:bg-[#1F2937] transition-colors"
            >
              <Download className="w-5 h-5 text-[#7EE7C7]" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7EE7C7] text-[#080A0F] rounded-lg font-medium hover:bg-[#5DD9B9] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Budget
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Budget Summary Card */}
        <div className="mb-8">
          <BudgetSummaryCard
            totalBudget={summary.totalBudget}
            totalSpent={summary.totalSpent}
            healthScore={summary.healthScore}
          />
        </div>

        {/* Alerts Section */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <h2 className="text-white font-semibold mb-3">Active Alerts</h2>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <BudgetAlertCard
                    key={alert.id}
                    category={alert.category}
                    threshold={alert.threshold}
                    percentUsed={alert.percentUsed}
                    status={alert.status}
                    onDismiss={() => dismissAlert(alert.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Budgets Grid */}
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-4">Category Budgets</h2>
          {budgets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#151A20] rounded-[28px] p-12 border border-[#1F2937] text-center"
            >
              <TrendingDown className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4 opacity-50" />
              <p className="text-[#9CA3AF] mb-4">No budgets created yet</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#7EE7C7] text-[#080A0F] rounded-lg font-medium hover:bg-[#5DD9B9] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Budget
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget) => (
                <BudgetProgressCard
                  key={budget.id}
                  category={budget.category}
                  spent={budget.spent}
                  limit={budget.limit}
                  status={budget.status}
                />
              ))}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        {budgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937]">
              <h3 className="text-white font-semibold mb-4">Budget Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] text-sm">On Track</span>
                  <span className="text-green-400 font-medium">
                    {budgets.filter((b) => b.status === 'healthy').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] text-sm">Caution</span>
                  <span className="text-yellow-400 font-medium">
                    {budgets.filter((b) => b.status === 'warning').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] text-sm">Over Budget</span>
                  <span className="text-red-400 font-medium">
                    {budgets.filter((b) => b.status === 'exceeded').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937]">
              <h3 className="text-white font-semibold mb-4">Top Categories</h3>
              <div className="space-y-3">
                {budgets
                  .sort((a, b) => b.spent - a.spent)
                  .slice(0, 3)
                  .map((budget) => (
                    <div key={budget.id} className="flex items-center justify-between">
                      <span className="text-[#9CA3AF] text-sm">{budget.category}</span>
                      <span className="text-white font-medium">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        }).format(budget.spent)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937]">
              <h3 className="text-white font-semibold mb-4">Savings Potential</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] text-sm">Current Pace</span>
                  <span className="text-white font-medium">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(
                      budgets.reduce((sum, b) => sum + Math.max(0, b.remaining), 0)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#1F2937]">
                  <span className="text-[#9CA3AF] text-sm">Monthly Savings</span>
                  <span className="text-[#7EE7C7] font-medium">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(summary.totalRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create Budget Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[#151A20] rounded-t-[32px] p-6 border-t border-[#1F2937] max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold">Create New Budget</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-[#9CA3AF] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[#9CA3AF] text-sm font-medium block mb-2">
                    Category
                  </label>
                  <select className="w-full bg-[#0D1015] border border-[#1F2937] rounded-lg px-4 py-2 text-white">
                    <option>Food & Dining</option>
                    <option>Transportation</option>
                    <option>Entertainment</option>
                    <option>Shopping</option>
                    <option>Utilities</option>
                    <option>Healthcare</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#9CA3AF] text-sm font-medium block mb-2">
                    Monthly Limit
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full bg-[#0D1015] border border-[#1F2937] rounded-lg px-4 py-2 text-white placeholder-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] text-sm font-medium block mb-2">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    placeholder="80"
                    className="w-full bg-[#0D1015] border border-[#1F2937] rounded-lg px-4 py-2 text-white placeholder-[#9CA3AF]"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(false)}
                  className="w-full mt-6 px-6 py-3 bg-[#7EE7C7] text-[#080A0F] rounded-lg font-medium hover:bg-[#5DD9B9] transition-colors"
                >
                  Create Budget
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
