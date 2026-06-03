"use client";

import { useMemo } from 'react';
import { AlertCircle, ArrowUpRight, Check, ShieldAlert, Sparkles, TrendingDown, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/src/lib/currency';

interface Recommendation {
  id: string;
  type: 'duplicate' | 'unused' | 'price_increase' | 'high_cost';
  subscriptionName: string;
  category: string;
  description: string;
  potentialSavings: number;
}

interface SubscriptionRecommendationsProps {
  recommendations: Recommendation[];
  totalMonthlyCost: number;
  totalAnnualCost: number;
  healthScore: number;
  onApplyOptimization?: (recId: string) => void;
}

export function SubscriptionRecommendations({
  recommendations,
  totalMonthlyCost,
  totalAnnualCost,
  healthScore,
  onApplyOptimization
}: SubscriptionRecommendationsProps) {
  
  // AI coach summaries (dynamic based on current stats)
  const aiCoachSummary = useMemo(() => {
    let summaryText = "";
    let opportunitiesCount = recommendations.length;
    let savings = recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);

    if (opportunitiesCount === 0) {
      summaryText = "Your subscriptions are optimized beautifully! You are in full control of recurring costs, keeping efficiency high and waste low.";
    } else {
      summaryText = `I detected ${opportunitiesCount} cost-saving opportunities totaling ${formatCurrency(savings)}/month in recurring expenses. You have overlapping services and unused items leaking capital.`;
    }

    // Budget impact analysis
    let budgetImpactText = "Low budget impact. Your subscription expenses form less than 5% of estimated monthly overhead, which is excellent.";
    if (totalMonthlyCost > 8000) {
      budgetImpactText = "High budget impact! Subscriptions exceed ₹8,000/month. We recommend trimming duplicate services and consolidating memberships immediately.";
    } else if (totalMonthlyCost > 3000) {
      budgetImpactText = "Moderate budget impact. Subscriptions are within the typical threshold but contain optimization potential to boost your FIRE timeline.";
    }

    return {
      overview: summaryText,
      burden: `Projected annual cost burden is ${formatCurrency(totalAnnualCost)}. This recurring cost compounds over time; cutting ₹1,000/month could save ₹1.2 Lakhs in 10 years at a 10% rate!`,
      budgetImpact: budgetImpactText,
      opportunities: `Consolidating overlapping streaming and unused cloud tiers can instantly yield up to ${formatCurrency(savings * 12)}/year in direct savings.`
    };
  }, [recommendations, totalMonthlyCost, totalAnnualCost]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 cols: Recommendations list */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="size-5 text-accent-mint" />
            <h3 className="text-lg font-semibold text-white">Smart Optimization Tips</h3>
          </div>

          {recommendations.length === 0 ? (
            <div className="card-surface p-8 text-center text-secondary text-sm">
              <Check className="size-8 text-accent-mint mx-auto mb-3" />
              No current optimization recommendations. Great job keeping your recurring expenses optimized!
            </div>
          ) : (
            <div className="space-y-3.5">
              {recommendations.map((rec) => {
                const isPriceIncrease = rec.type === 'price_increase';
                const isDuplicate = rec.type === 'duplicate';
                const isUnused = rec.type === 'unused';

                return (
                  <div key={rec.id} className="card-surface p-4 flex gap-4 items-start hover:border-accent-mint/20 transition duration-200">
                    <div className={`rounded-2xl p-2.5 shrink-0 ${isPriceIncrease ? 'bg-red-500/10 text-red-300' : isDuplicate ? 'bg-yellow-500/10 text-yellow-300' : 'bg-accent-mint/10 text-accent-mint'}`}>
                      {isPriceIncrease ? (
                        <ShieldAlert className="size-5" />
                      ) : (
                        <AlertCircle className="size-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">{rec.subscriptionName}</h4>
                        <span className="text-xs font-bold text-accent-mint shrink-0">
                          Save {formatCurrency(rec.potentialSavings)}/mo
                        </span>
                      </div>
                      <p className="text-xs text-secondary mt-1 leading-relaxed">
                        {rec.description}
                      </p>
                      
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/5 pt-2">
                        <span className="text-[10px] uppercase tracking-wider text-secondary bg-white/5 px-2 py-0.5 rounded">
                          {rec.type.replace('_', ' ')}
                        </span>
                        
                        {onApplyOptimization && (
                          <button
                            onClick={() => onApplyOptimization(rec.id)}
                            className="text-[11px] font-semibold text-accent-mint hover:underline flex items-center gap-1"
                          >
                            Apply recommendation <ArrowUpRight className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right col: AI Cost Analysis Coach */}
        <section className="space-y-5">
          <div className="card-surface p-5 bg-[linear-gradient(135deg,rgba(21,26,32,1),rgba(126,231,199,0.02))] border border-white/5 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <Sparkles className="size-16 text-accent-mint" />
            </div>
            
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent-mint" />
              <h3 className="text-md font-semibold text-white">AI Coach Cost Analysis</h3>
            </div>

            <div className="space-y-3.5 text-xs text-secondary leading-relaxed">
              <div className="rounded-[20px] bg-white/5 p-3.5 border border-white/5">
                <h4 className="text-xs font-bold text-white mb-1">Monthly Cost Summary</h4>
                <p>{aiCoachSummary.overview}</p>
              </div>

              <div className="rounded-[20px] bg-white/5 p-3.5 border border-white/5">
                <h4 className="text-xs font-bold text-white mb-1">Annual Burden</h4>
                <p>{aiCoachSummary.burden}</p>
              </div>

              <div className="rounded-[20px] bg-white/5 p-3.5 border border-white/5">
                <h4 className="text-xs font-bold text-white mb-1">Budget Impact</h4>
                <p>{aiCoachSummary.budgetImpact}</p>
              </div>

              <div className="rounded-[20px] bg-white/5 p-3.5 border border-white/5">
                <h4 className="text-xs font-bold text-white mb-1">Opportunities</h4>
                <p>{aiCoachSummary.opportunities}</p>
              </div>
            </div>
          </div>

          {/* Efficiency Score Panel */}
          <div className="card-surface p-5 text-center space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary">Efficiency Index</h4>
            <div className="relative inline-flex items-center justify-center">
              <svg className="size-28">
                <circle
                  className="text-white/5"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="46"
                  cx="56"
                  cy="56"
                />
                <circle
                  className="text-accent-mint"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - healthScore / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="46"
                  cx="56"
                  cy="56"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-white">{healthScore}%</span>
              </div>
            </div>
            <p className="text-xs text-secondary leading-relaxed px-2">
              Based on overlapping, unused services, and price fluctuations in your accounts.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
