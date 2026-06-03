"use client";

import React, { useMemo, useState } from 'react';
import { estimateTax, summarizeDeductions, analyzeTaxSavings, currentIndiaFY } from '@/src/lib/tax-planner';

export default function TaxDashboard() {
  const [salary, setSalary] = useState(1200000);
  const [investmentIncome, setInvestmentIncome] = useState(20000);
  const [tradingIncome, setTradingIncome] = useState(0);
  const [deductions, setDeductions] = useState<Record<string, number>>({ '80C': 50000, '80D': 5000 });

  const fy = useMemo(() => currentIndiaFY(), []);

  const breakdown = useMemo(() => estimateTax({ salaryIncome: salary, investmentIncome, tradingIncome, deductions }), [salary, investmentIncome, tradingIncome, deductions]);
  const dedSummary = useMemo(() => summarizeDeductions(deductions), [deductions]);
  const savings = useMemo(() => analyzeTaxSavings(deductions), [deductions]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Tax Center</h1>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Estimated Tax<br />₹{breakdown.estimatedTax.toLocaleString()}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Tax Saved<br />₹{breakdown.totalDeductions.toLocaleString()}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Deductions<br />{dedSummary.length}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Financial Year<br />{fy.label}</div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Estimator</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div>
              <label>Salary (annual)</label>
              <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="w-full mt-1 p-2 rounded" />
            </div>
            <div>
              <label>Investment Income (annual)</label>
              <input type="number" value={investmentIncome} onChange={(e) => setInvestmentIncome(Number(e.target.value))} className="w-full mt-1 p-2 rounded" />
            </div>
            <div>
              <label>Trading Income (annual)</label>
              <input type="number" value={tradingIncome} onChange={(e) => setTradingIncome(Number(e.target.value))} className="w-full mt-1 p-2 rounded" />
            </div>
          </div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Deductions</h2>
          <ul className="list-disc pl-5 mt-2">
            {dedSummary.map((d) => (
              <li key={d.id}>{d.label}: Used ₹{d.used.toLocaleString()} / Limit ₹{d.limit.toLocaleString()}</li>
            ))}
          </ul>
          <div className="mt-3">
            <h3 className="font-medium">Suggestions</h3>
            <ul className="list-disc pl-5 mt-2">
              {savings.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
