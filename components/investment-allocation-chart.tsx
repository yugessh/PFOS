'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Investment } from '@/types';
import { ChartCard } from './chart-card';

interface InvestmentAllocationChartProps {
  investments: Investment[];
}

const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b'];

export function InvestmentAllocationChart({ investments }: InvestmentAllocationChartProps) {
  const allocationData = investments.map((inv) => ({
    name: inv.name,
    value: inv.currentValue,
  }));

  return (
    <ChartCard title="Investment Allocation" description="Portfolio distribution">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={allocationData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} ₹${(value / 1000).toFixed(0)}K`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {allocationData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `₹${value.toLocaleString()}`}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
