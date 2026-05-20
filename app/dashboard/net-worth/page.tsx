'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Filter } from 'lucide-react';
import {
  CurrentNetWorthCard,
  NetWorthCard,
} from '@/components/net-worth-card';
import { NetWorthTrendChart } from '@/components/net-worth-trend-chart';
import { useNetWorth } from '@/src/hooks/useNetWorth';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export default function NetWorthDashboard() {
  const { netWorthData, history, loading, error, refresh } = useNetWorth();
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  // Filter history based on selected time range
  const getFilteredHistory = () => {
    const rangeMap: Record<TimeRange, number> = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12,
      ALL: 999,
    };

    const monthCount = rangeMap[timeRange];
    return history.slice(0, monthCount);
  };

  const filteredHistory = getFilteredHistory();
  const monthlyChange = history.length > 1 ? history[0].gainLoss : 0;
  const monthlyChangePercent = history.length > 1 ? history[0].gainLossPercent : 0;

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
            <h1 className="text-white text-2xl font-bold">Net Worth</h1>
            <p className="text-[#9CA3AF] text-sm mt-1">Track your financial growth</p>
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

        {/* Main Net Worth Card */}
        <div className="mb-8">
          <CurrentNetWorthCard
            netWorth={netWorthData.netWorth}
            monthlyChange={monthlyChange}
            monthlyChangePercent={monthlyChangePercent}
          />
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <NetWorthCard
            title="Total Assets"
            value={netWorthData.totalAssets}
            trend="up"
            change={netWorthData.totalAssets * 0.05}
            changePercent={5.2}
          />
          <NetWorthCard
            title="Total Liabilities"
            value={netWorthData.totalLiabilities}
            trend={netWorthData.totalLiabilities > 0 ? 'down' : 'neutral'}
            change={-netWorthData.totalLiabilities * 0.02}
            changePercent={-2.1}
          />
          <NetWorthCard
            title="Monthly Change"
            value={Math.abs(monthlyChange)}
            trend={monthlyChange > 0 ? 'up' : monthlyChange < 0 ? 'down' : 'neutral'}
            change={monthlyChange}
            changePercent={monthlyChangePercent}
          />
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">Net Worth Trend</h2>

            {/* Time Range Filter */}
            <div className="flex gap-2">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as TimeRange[]).map((range) => (
                <motion.button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    timeRange === range
                      ? 'bg-[#7EE7C7] text-[#080A0F]'
                      : 'bg-[#151A20] text-[#9CA3AF] hover:bg-[#1F2937]'
                  }`}
                >
                  {range}
                </motion.button>
              ))}
            </div>
          </div>

          <NetWorthTrendChart
            data={filteredHistory}
            loading={loading}
          />
        </div>

        {/* Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937]">
            <h3 className="text-white font-semibold mb-4">Asset Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF] text-sm">Bank Accounts</span>
                <span className="text-white font-medium">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(netWorthData.totalAssets * 0.4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF] text-sm">Investments</span>
                <span className="text-white font-medium">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(netWorthData.totalAssets * 0.35)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF] text-sm">Savings</span>
                <span className="text-white font-medium">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(netWorthData.totalAssets * 0.25)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937]">
            <h3 className="text-white font-semibold mb-4">Liability Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF] text-sm">EMI</span>
                <span className="text-white font-medium">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(netWorthData.totalLiabilities * 0.5)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF] text-sm">Loans</span>
                <span className="text-white font-medium">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(netWorthData.totalLiabilities * 0.3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF] text-sm">Credit Card Balance</span>
                <span className="text-white font-medium">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(netWorthData.totalLiabilities * 0.2)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
