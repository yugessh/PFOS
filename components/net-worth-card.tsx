'use client';

import React from 'react';
import { ArrowUp, ArrowDown, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetWorthCardProps {
  title: string;
  value: number;
  currency?: string;
  change?: number;
  changePercent?: number;
  isPositive?: boolean;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

/**
 * Net Worth Info Card - shows value with optional change indicator
 */
export function NetWorthCard({
  title,
  value,
  currency = '₹',
  change,
  changePercent,
  isPositive = true,
  icon,
  trend = 'neutral',
  className = '',
}: NetWorthCardProps) {
  const formattedValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

  const hasChange = change !== undefined && change !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937] hover:border-[#7EE7C7]/50 transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-[#9CA3AF] text-sm font-medium mb-2">{title}</p>
          <p className="text-white text-2xl font-bold">{formattedValue}</p>
        </div>
        <div className="text-[#7EE7C7]">{icon || <DollarSign className="w-5 h-5" />}</div>
      </div>

      {hasChange && (
        <div className="flex items-center gap-2 pt-4 border-t border-[#1F2937]">
          {trend === 'up' && (
            <div className="flex items-center gap-1 text-green-400">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{formattedValue}{' '}
                <span className="text-xs text-[#9CA3AF]">
                  ({changePercent ? `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%` : ''})
                </span>
              </span>
            </div>
          )}
          {trend === 'down' && (
            <div className="flex items-center gap-1 text-red-400">
              <ArrowDown className="w-4 h-4" />
              <span className="text-sm font-medium">
                {change}{' '}
                <span className="text-xs text-[#9CA3AF]">
                  ({changePercent ? `${changePercent.toFixed(1)}%` : ''})
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Current Net Worth - Main display card with count-up animation
 */
export function CurrentNetWorthCard({
  netWorth,
  monthlyChange,
  monthlyChangePercent,
  currency = '₹',
  className = '',
}: {
  netWorth: number;
  monthlyChange?: number;
  monthlyChangePercent?: number;
  currency?: string;
  className?: string;
}) {
  const trend = monthlyChange !== undefined
    ? monthlyChange > 0
      ? 'up'
      : monthlyChange < 0
        ? 'down'
        : 'neutral'
    : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br from-[#151A20] to-[#0D1015] rounded-[28px] p-8 border-2 border-[#7EE7C7]/30 hover:border-[#7EE7C7]/60 transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[#9CA3AF] text-sm font-medium mb-2">Net Worth</p>
          <div className="flex items-baseline gap-2">
            <p className="text-white text-4xl font-bold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(netWorth || 0)}
            </p>
          </div>
        </div>
        <div className="bg-[#7EE7C7]/10 rounded-lg p-3">
          <TrendingUp className="w-6 h-6 text-[#7EE7C7]" />
        </div>
      </div>

      {monthlyChange !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-6 border-t border-[#1F2937]"
        >
          <div
            className={`flex items-center gap-2 ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-[#9CA3AF]'
            }`}
          >
            {trend === 'up' && <ArrowUp className="w-5 h-5" />}
            {trend === 'down' && <ArrowDown className="w-5 h-5" />}
            <span className="text-sm font-medium">
              {trend === 'up' ? '+' : ''}{new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(monthlyChange || 0)}{' '}
              ({monthlyChangePercent ? `${monthlyChangePercent > 0 ? '+' : ''}${monthlyChangePercent.toFixed(1)}%` : ''}){' '}
              <span className="text-xs text-[#9CA3AF]">this month</span>
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
