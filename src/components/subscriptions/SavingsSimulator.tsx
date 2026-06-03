"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Play, RefreshCw, Sparkles, TrendingDown } from 'lucide-react';
import { type SubscriptionModel } from '@/src/services/firestore/subscriptions.service';
import { formatCurrency } from '@/src/lib/currency';

interface SavingsSimulatorProps {
  subscriptions: SubscriptionModel[];
}

export function SavingsSimulator({ subscriptions }: SavingsSimulatorProps) {
  const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions]);

  // Selected subscription IDs to simulate cancelling
  const [cancelledIds, setCancelledIds] = useState<Record<string, boolean>>({});
  // Custom downgrades: subId -> new price
  const [downgradedPrices, setDowngradedPrices] = useState<Record<string, number>>({});

  // Simulator parameters
  const [fireTarget, setFireTarget] = useState(15000000); // 1.5 Crores default
  const [currentMonthlySavings, setCurrentMonthlySavings] = useState(25000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(10); // 10% annual return

  const toggleCancel = (id: string) => {
    setCancelledIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setDowngrade = (id: string, currentPrice: number, downgradePct: number) => {
    const newPrice = Math.round(currentPrice * (1 - downgradePct / 100));
    setDowngradedPrices(prev => ({ ...prev, [id]: newPrice }));
  };

  // Computes the simulated monthly savings
  const simulatedSavings = useMemo(() => {
    let monthlySavings = 0;
    activeSubs.forEach(sub => {
      let subMonthly = sub.amount;
      if (sub.frequency === 'yearly') subMonthly = sub.amount / 12;
      else if (sub.frequency === 'weekly') subMonthly = sub.amount * 4.33;

      if (cancelledIds[sub.id]) {
        monthlySavings += subMonthly;
      } else if (downgradedPrices[sub.id] !== undefined) {
        let downgradedMonthly = downgradedPrices[sub.id];
        if (sub.frequency === 'yearly') downgradedMonthly = downgradedPrices[sub.id] / 12;
        else if (sub.frequency === 'weekly') downgradedMonthly = downgradedPrices[sub.id] * 4.33;

        monthlySavings += Math.max(0, subMonthly - downgradedMonthly);
      }
    });
    return Math.round(monthlySavings);
  }, [activeSubs, cancelledIds, downgradedPrices]);

  const simulatedYearlySavings = useMemo(() => simulatedSavings * 12, [simulatedSavings]);

  // Calculations for FIRE timeline
  const fireCalculations = useMemo(() => {
    const monthlyRate = expectedReturnRate / 100 / 12;
    if (monthlyRate === 0 || currentMonthlySavings === 0) return { normalYears: 0, optimizedYears: 0, shiftYears: 0, shiftMonths: 0 };

    // Formula to find months to reach target: N = log(1 + Target * r / Savings) / log(1 + r)
    const computeMonths = (savings: number) => {
      const val = 1 + (fireTarget * monthlyRate) / savings;
      return Math.log(val) / Math.log(1 + monthlyRate);
    };

    const normalMonths = computeMonths(currentMonthlySavings);
    const optimizedMonths = computeMonths(currentMonthlySavings + simulatedSavings);

    const normalYears = Number.isFinite(normalMonths) ? normalMonths / 12 : 0;
    const optimizedYears = Number.isFinite(optimizedMonths) ? optimizedMonths / 12 : 0;
    const shiftMonthsTotal = Math.max(0, normalMonths - optimizedMonths);
    const shiftYears = Math.floor(shiftMonthsTotal / 12);
    const shiftMonths = Math.round(shiftMonthsTotal % 12);

    return {
      normalYears: Math.round(normalYears * 10) / 10,
      optimizedYears: Math.round(optimizedYears * 10) / 10,
      shiftYears,
      shiftMonths
    };
  }, [fireTarget, currentMonthlySavings, expectedReturnRate, simulatedSavings]);

  const resetSimulation = () => {
    setCancelledIds({});
    setDowngradedPrices({});
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Subscriptions selector */}
        <section className="card-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Simulate Cancellations</h3>
              <p className="text-xs text-secondary">Check items to simulate cancellation or select a downgrade option.</p>
            </div>
            <button onClick={resetSimulation} className="text-secondary hover:text-white transition flex items-center gap-1.5 text-xs">
              <RefreshCw className="size-3" /> Reset
            </button>
          </div>

          {activeSubs.length === 0 ? (
            <div className="py-8 text-center text-sm text-secondary">
              No active subscriptions to simulate.
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {activeSubs.map(sub => {
                const isCancelled = !!cancelledIds[sub.id];
                const currentPrice = sub.amount;
                const isDowngraded = downgradedPrices[sub.id] !== undefined && downgradedPrices[sub.id] < currentPrice;

                return (
                  <div key={sub.id} className={`rounded-[20px] border p-3.5 transition ${isCancelled ? 'border-red-500/20 bg-red-500/5' : isDowngraded ? 'border-accent-mint/20 bg-accent-mint/5' : 'border-white/5 bg-white/5'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`cancel-${sub.id}`}
                          checked={isCancelled}
                          onChange={() => toggleCancel(sub.id)}
                          className="rounded border-white/10 text-accent-mint focus:ring-accent-mint size-4"
                        />
                        <div>
                          <label htmlFor={`cancel-${sub.id}`} className="text-sm font-semibold text-white cursor-pointer select-none">
                            {sub.name}
                          </label>
                          <p className="text-xs text-secondary capitalize">{sub.category} • {sub.frequency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isCancelled ? 'line-through text-secondary' : 'text-white'}`}>
                          {formatCurrency(sub.amount)}
                        </p>
                        {isDowngraded && !isCancelled && (
                          <p className="text-[11px] text-accent-mint font-medium">
                            Simulated: {formatCurrency(downgradedPrices[sub.id]!)}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isCancelled && (
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                        <span className="text-[11px] text-secondary">Downgrade plan:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDowngrade(sub.id, currentPrice, 20)}
                            className={`rounded-full px-2.5 py-1 text-[10px] border transition ${downgradedPrices[sub.id] === Math.round(currentPrice * 0.8) ? 'bg-accent-mint text-[#071a0d] border-accent-mint' : 'border-white/10 hover:bg-white/5 text-secondary'}`}
                          >
                            -20%
                          </button>
                          <button
                            onClick={() => setDowngrade(sub.id, currentPrice, 40)}
                            className={`rounded-full px-2.5 py-1 text-[10px] border transition ${downgradedPrices[sub.id] === Math.round(currentPrice * 0.6) ? 'bg-accent-mint text-[#071a0d] border-accent-mint' : 'border-white/10 hover:bg-white/5 text-secondary'}`}
                          >
                            -40%
                          </button>
                          {isDowngraded && (
                            <button
                              onClick={() => {
                                const next = { ...downgradedPrices };
                                delete next[sub.id];
                                setDowngradedPrices(next);
                              }}
                              className="text-[10px] text-red-300 hover:underline"
                            >
                              Undo
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right column: Impact and Outputs */}
        <section className="space-y-5">
          <div className="card-surface p-5 space-y-4">
            <h3 className="text-lg font-semibold text-white">FIRE Timeline Impact</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[24px] bg-[#0C1319] p-4 border border-white/5 text-center">
                <p className="text-xs text-secondary">Monthly Savings</p>
                <p className="text-2xl font-bold text-accent-mint mt-1">{formatCurrency(simulatedSavings)}</p>
              </div>
              <div className="rounded-[24px] bg-[#0C1319] p-4 border border-white/5 text-center">
                <p className="text-xs text-secondary">Annual Savings</p>
                <p className="text-2xl font-bold text-accent-mint mt-1">{formatCurrency(simulatedYearlySavings)}</p>
              </div>
            </div>

            {simulatedSavings > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[24px] bg-accent-mint/10 border border-accent-mint/20 p-4 flex items-start gap-3"
              >
                <Sparkles className="size-5 text-accent-mint shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Retire Earlier!</h4>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">
                    By investing these savings, you can reach your retirement goal 
                    <strong className="text-accent-mint">
                      {fireCalculations.shiftYears > 0 ? ` ${fireCalculations.shiftYears} year(s)` : ''}
                      {fireCalculations.shiftMonths > 0 ? ` ${fireCalculations.shiftMonths} month(s)` : ''}
                    </strong> earlier!
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="rounded-[24px] bg-white/5 border border-white/5 p-4 text-xs text-secondary leading-relaxed">
                Select subscriptions to cancel or plans to downgrade on the left to simulate cost optimization savings.
              </div>
            )}
          </div>

          <div className="card-surface p-5 space-y-4">
            <h3 className="text-sm uppercase tracking-[0.25em] text-secondary">Simulator Settings</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-secondary mb-1.5">
                  <span>FIRE Target Goal</span>
                  <span className="text-white font-semibold">{formatCurrency(fireTarget)}</span>
                </div>
                <input
                  type="range"
                  min="5000000"
                  max="100000000"
                  step="5000000"
                  value={fireTarget}
                  onChange={e => setFireTarget(Number(e.target.value))}
                  className="w-full accent-accent-mint h-1 rounded-lg cursor-pointer bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-secondary mb-1.5">
                  <span>Current Monthly Savings Rate</span>
                  <span className="text-white font-semibold">{formatCurrency(currentMonthlySavings)}/mo</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={currentMonthlySavings}
                  onChange={e => setCurrentMonthlySavings(Number(e.target.value))}
                  className="w-full accent-accent-mint h-1 rounded-lg cursor-pointer bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-secondary mb-1.5">
                  <span>Expected Annual Investment Return</span>
                  <span className="text-white font-semibold">{expectedReturnRate}% APR</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="18"
                  step="0.5"
                  value={expectedReturnRate}
                  onChange={e => setExpectedReturnRate(Number(e.target.value))}
                  className="w-full accent-accent-mint h-1 rounded-lg cursor-pointer bg-white/10"
                />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 text-xs text-secondary space-y-2">
              <div className="flex justify-between">
                <span>Timeline with current savings:</span>
                <span className="text-white font-medium">{fireCalculations.normalYears} Years</span>
              </div>
              <div className="flex justify-between">
                <span>Timeline with subscription savings:</span>
                <span className="text-accent-mint font-semibold">{fireCalculations.optimizedYears} Years</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
