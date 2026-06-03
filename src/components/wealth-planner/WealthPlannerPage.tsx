"use client";

import React, { useMemo, useState } from 'react';
import { calculateRetirement, calculateFIRE, projectWealth, computeHealthScores, generateAIRecommendations } from '@/src/lib/wealth-planner';

export default function WealthPlannerPage() {
  const [age, setAge] = useState(30);
  const [retAge, setRetAge] = useState(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [savings, setSavings] = useState(200000);
  const [investments, setInvestments] = useState(500000);

  const retirement = useMemo(() => calculateRetirement({
    currentAge: age,
    retirementAge: retAge,
    monthlyExpenses,
    currentSavings: savings,
    currentInvestments: investments,
    expectedAnnualReturn: 0.07,
    expectedInflation: 0.05,
  }), [age, retAge, monthlyExpenses, savings, investments]);

  const fire = useMemo(() => calculateFIRE({
    currentSavings: savings,
    currentInvestments: investments,
    monthlySavings: Math.max(0, 20000),
    monthlyExpenses,
    annualReturn: 0.07,
    annualIncome: 1200000,
  }), [savings, investments, monthlyExpenses]);

  const projection = useMemo(() => projectWealth(savings + investments, 20000, 0.07, 30), [savings, investments]);

  const scores = useMemo(() => computeHealthScores({ netWorth: savings + investments, monthlySavings: 20000, monthlyExpenses, debt: 0, retirementReadinessPercent: retirement.retirementReadinessPercent }), [savings, investments, monthlyExpenses, retirement]);

  const recs = useMemo(() => generateAIRecommendations(scores, fire), [scores, fire]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Wealth Planner</h1>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">
            <label>Current Age</label>
            <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full mt-2 p-2 rounded" />
          </div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">
            <label>Retirement Age</label>
            <input type="number" value={retAge} onChange={(e) => setRetAge(Number(e.target.value))} className="w-full mt-2 p-2 rounded" />
          </div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">
            <label>Monthly Expenses</label>
            <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className="w-full mt-2 p-2 rounded" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Current Savings<br />₹{savings.toLocaleString()}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Investments<br />₹{investments.toLocaleString()}</div>
          <div className="p-4 rounded-[28px] bg-[#151A20] text-white">Projected Wealth (30y)<br />₹{Math.round(projection.projectedValue).toLocaleString()}</div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">Retirement Summary</h2>
          <div className="mt-2">Corpus Needed: ₹{Math.round(retirement.corpusNeeded).toLocaleString()}</div>
          <div>Projected Wealth: ₹{Math.round(retirement.projectedWealthAtRetirement).toLocaleString()}</div>
          <div>Readiness: {Math.round(retirement.retirementReadinessPercent)}%</div>
          <div>Shortfall: ₹{Math.round(retirement.shortfall).toLocaleString()}</div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">FIRE Summary</h2>
          <div>FI Number: ₹{Math.round(fire.fiNumber).toLocaleString()}</div>
          <div>Years to FIRE: {fire.yearsToFIRE ?? '—'}</div>
          <div>Probability Score: {fire.probabilityScore}%</div>
        </section>

        <section className="mb-6 p-4 rounded-[28px] bg-[#151A20] text-white">
          <h2 className="text-lg font-medium">AI Recommendations</h2>
          <ul className="list-disc pl-5 mt-2">
            {recs.map((r, i) => <li key={i}>{r.message}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
