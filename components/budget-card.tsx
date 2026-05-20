'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface BudgetProgressCardProps {
  category: string;
  spent: number;
  limit: number;
  currency?: string;
  status: 'healthy' | 'warning' | 'exceeded';
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Budget Progress Card - shows spending progress for a category
 */
export function BudgetProgressCard({
  category,
  spent,
  limit,
  currency = '₹',
  status = 'healthy',
  icon,
  className = '',
}: BudgetProgressCardProps) {
  const percentUsed = Math.round((spent / limit) * 100);
  const remaining = Math.max(0, limit - spent);

  const statusConfig = {
    healthy: {
      color: '#10B981',
      bg: '#D1FAE5',
      label: 'On Track',
    },
    warning: {
      color: '#F59E0B',
      bg: '#FEF3C7',
      label: 'Caution',
    },
    exceeded: {
      color: '#EF4444',
      bg: '#FEE2E2',
      label: 'Over Budget',
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937] hover:border-[#7EE7C7]/30 transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[#9CA3AF] text-sm font-medium mb-1">{category}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-white text-xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(spent)}
            </p>
            <p className="text-[#9CA3AF] text-xs">
              / {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(limit)}
            </p>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          {percentUsed}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#0D1015] rounded-full h-2 mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentUsed)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#9CA3AF]">
          {remaining > 0 ? (
            <>
              <span className="text-white font-medium">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(remaining)}
              </span>
              {' '}remaining
            </>
          ) : (
            <span className="text-red-400">
              Over by {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(Math.abs(remaining))}
            </span>
          )}
        </span>
        {status === 'exceeded' && <AlertCircle className="w-4 h-4 text-red-400" />}
        {status === 'healthy' && <CheckCircle className="w-4 h-4 text-green-400" />}
      </div>
    </motion.div>
  );
}

/**
 * Budget Summary Card - shows total budget overview
 */
export function BudgetSummaryCard({
  totalBudget,
  totalSpent,
  healthScore,
  currency = '₹',
  className = '',
}: {
  totalBudget: number;
  totalSpent: number;
  healthScore: number;
  currency?: string;
  className?: string;
}) {
  const remaining = Math.max(0, totalBudget - totalSpent);
  const percentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br from-[#151A20] to-[#0D1015] rounded-[28px] p-8 border-2 border-[#7EE7C7]/30 ${className}`}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#9CA3AF] text-sm font-medium mb-2">Total Budget</p>
          <p className="text-white text-3xl font-bold">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(totalBudget)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#9CA3AF] mb-1">Health Score</p>
          <p className="text-2xl font-bold text-[#7EE7C7]">{Math.round(healthScore)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-[#1F2937]">
        <div>
          <p className="text-[#9CA3AF] text-xs mb-2">Total Spent</p>
          <p className="text-white text-lg font-bold">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(totalSpent)}
          </p>
          <p className="text-[#9CA3AF] text-xs mt-1">{percentUsed}% used</p>
        </div>
        <div>
          <p className="text-[#9CA3AF] text-xs mb-2">Remaining</p>
          <p className={`text-lg font-bold ${remaining > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(remaining)}
          </p>
          <p className="text-[#9CA3AF] text-xs mt-1">
            {remaining > 0 ? 'available' : 'over'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Budget Alert Card - shows budget alerts
 */
export function BudgetAlertCard({
  category,
  threshold,
  percentUsed,
  status = 'pending',
  onDismiss,
  className = '',
}: {
  category: string;
  threshold: number;
  percentUsed: number;
  status?: 'pending' | 'sent' | 'read';
  onDismiss?: () => void;
  className?: string;
}) {
  const severity =
    threshold >= 100 ? 'critical' : threshold >= 90 ? 'warning' : 'info';

  const severityConfig = {
    critical: {
      bg: '#7F1D1D',
      border: '#DC2626',
      icon: '⚠️',
    },
    warning: {
      bg: '#78350F',
      border: '#F59E0B',
      icon: '⚡',
    },
    info: {
      bg: '#1E3A8A',
      border: '#3B82F6',
      icon: 'ℹ️',
    },
  };

  const config = severityConfig[severity];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`bg-[#151A20] rounded-[16px] p-4 border border-[${config.border}]/30 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{config.icon}</span>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{category} budget</p>
          <p className="text-[#9CA3AF] text-xs mt-1">
            Reached {threshold}% threshold ({percentUsed}% used)
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[#9CA3AF] hover:text-white transition-colors text-xs font-medium"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}
