'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NetWorthTrendData {
  month: string;
  netWorth: number;
  assets: number;
  liabilities: number;
  gainLoss?: number;
}

interface NetWorthChartProps {
  data: NetWorthTrendData[];
  loading?: boolean;
  className?: string;
}

export function NetWorthTrendChart({ data, loading, className = '' }: NetWorthChartProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937] ${className}`}
      >
        <p className="text-[#9CA3AF] text-center py-8">Loading chart data...</p>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937] ${className}`}
      >
        <p className="text-[#9CA3AF] text-center py-8">No historical data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#151A20] rounded-[28px] p-6 border border-[#1F2937] ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-white text-lg font-semibold">Net Worth Trend</h3>
        <p className="text-[#9CA3AF] text-sm mt-1">12-month growth trajectory</p>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0D1015',
                border: '1px solid #1F2937',
                borderRadius: '8px',
                color: '#E5E7EB',
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(value)
              }
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#7EE7C7"
              strokeWidth={2}
              dot={{ fill: '#7EE7C7', r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
              name="Net Worth"
            />
            <Line
              type="monotone"
              dataKey="assets"
              stroke="#10B981"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={1000}
              name="Assets"
            />
            <Line
              type="monotone"
              dataKey="liabilities"
              stroke="#EF4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={1000}
              name="Liabilities"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#1F2937]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#7EE7C7]"></div>
          <span className="text-[#9CA3AF] text-xs">Net Worth</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
          <span className="text-[#9CA3AF] text-xs">Assets</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
          <span className="text-[#9CA3AF] text-xs">Liabilities</span>
        </div>
      </div>
    </motion.div>
  );
}
