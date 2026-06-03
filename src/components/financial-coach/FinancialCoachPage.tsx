'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bot, CheckCircle2, ChevronRight, Flame, Mic, ShieldAlert, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useFinancialCoach } from '@/src/hooks/useFinancialCoach';
import { formatCurrency } from '@/src/lib/currency';

function ScoreRing({ value }: { value: number }) {
  const angle = Math.round((value / 100) * 360);
  return (
    <div className="relative grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(#7EE7C7 0deg ${angle}deg, rgba(255,255,255,0.08) ${angle}deg 360deg)` }}>
      <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-[#080A0F]">
        <div className="text-center">
          <div className="text-3xl font-semibold text-white">{value}</div>
          <div className="text-xs uppercase tracking-[0.28em] text-[#94A3B8]">PFOS Health</div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[28px] border border-border bg-card/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] ${className}`}>{children}</div>;
}

export default function FinancialCoachPage() {
  const { snapshot, loading, syncing, queryAnswer, historyItems, ask, syncCoachState } = useFinancialCoach();
  const [query, setQuery] = useState('How much did I spend on food last month?');
  const [mobileSheet, setMobileSheet] = useState(false);
  const scoreTone = useMemo(() => (snapshot.overallScore >= 80 ? 'Strong' : snapshot.overallScore >= 60 ? 'Stable' : 'Needs Attention'), [snapshot.overallScore]);

  return (
    <div className="min-h-screen bg-[#080A0F] pb-24 text-white">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-[linear-gradient(135deg,rgba(21,26,32,0.98),rgba(12,16,22,0.96))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(126,231,199,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(126,231,199,0.08),transparent_32%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7EE7C7]/20 bg-[#7EE7C7]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-[#7EE7C7]">
                <Bot className="h-4 w-4" />
                AI Financial Coach
              </div>
              <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">PFOS now coaches, explains, and plans.</h1>
              <p className="mt-3 max-w-2xl text-sm text-[#9AA4B2] sm:text-base">Personalized guidance across accounts, transactions, budgets, goals, investments, tax, retirement, family finance, documents, reports, and automation.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void syncCoachState()} className="rounded-[24px] bg-[#7EE7C7] px-4 py-3 text-sm font-semibold text-[#071a0d] transition hover:brightness-95">
                {syncing ? 'Syncing coach…' : 'Sync Coach'}
              </button>
              <button type="button" onClick={() => setMobileSheet(true)} className="inline-flex items-center gap-2 rounded-[24px] border border-border bg-card px-4 py-3 text-sm text-secondary transition hover:bg-card-elevated lg:hidden">
                <Sparkles className="h-4 w-4 text-[#7EE7C7]" />
                Quick Actions
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <ScoreRing value={snapshot.overallScore} />
                <div>
                  <p className="text-sm text-secondary">Financial Health Score</p>
                  <h2 className="mt-1 text-2xl font-semibold">{scoreTone}</h2>
                  <p className="mt-2 text-sm text-[#9AA4B2]">Savings score {snapshot.healthBreakdown[0]?.score}, budget score {snapshot.healthBreakdown[2]?.score}, debt score {snapshot.healthBreakdown[3]?.score}.</p>
                </div>
              </div>
              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Savings Rate</p><p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{snapshot.metrics.savingsRate.toFixed(1)}%</p></div>
                <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Emergency Fund</p><p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{snapshot.metrics.emergencyFundMonths.toFixed(1)} mo</p></div>
                <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Portfolio Return</p><p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{snapshot.metrics.portfolioReturnPct.toFixed(1)}%</p></div>
                <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Tax Estimate</p><p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{formatCurrency(snapshot.metrics.taxEstimate)}</p></div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between"><div><p className="text-sm text-secondary">Goal Acceleration Engine</p><h2 className="mt-1 text-xl font-semibold">{snapshot.goalAcceleration.targetGoal?.title || 'No active target goal selected'}</h2></div><Target className="h-5 w-5 text-[#7EE7C7]" /></div>
            <p className="mt-4 text-sm text-[#9AA4B2]">{snapshot.goalAcceleration.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Monthly Contribution</p><p className="mt-2 text-xl font-semibold text-[#7EE7C7]">{formatCurrency(snapshot.goalAcceleration.recommendedMonthlyContribution)}</p></div>
              <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Success Probability</p><p className="mt-2 text-xl font-semibold text-[#7EE7C7]">{Math.round(snapshot.goalAcceleration.probabilityOfSuccess)}%</p></div>
              <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Improved Date</p><p className="mt-2 text-base font-semibold text-[#7EE7C7]">{snapshot.goalAcceleration.improvedTargetDate ? snapshot.goalAcceleration.improvedTargetDate.toLocaleDateString() : 'Add goal data'}</p></div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between"><div><p className="text-sm text-secondary">Top Recommendations</p><h3 className="mt-1 text-xl font-semibold">Highest-impact next moves</h3></div><TrendingUp className="h-5 w-5 text-[#7EE7C7]" /></div>
            <div className="mt-4 space-y-3">
              {snapshot.topRecommendations.map((item) => (
                <motion.div key={item.id} layout className="rounded-[24px] border border-border bg-[#0D141B] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="font-medium text-white">{item.title}</p><p className="mt-1 text-sm text-[#9AA4B2]">{item.detail}</p><p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#7EE7C7]">{item.impact}</p></div>
                    {item.actionHref ? <Link href={item.actionHref} className="inline-flex shrink-0 items-center gap-1 rounded-[18px] border border-[#7EE7C7]/20 bg-[#7EE7C7]/10 px-3 py-2 text-xs font-medium text-[#7EE7C7]">{item.actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link> : null}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between"><div><p className="text-sm text-secondary">Current Risks</p><h3 className="mt-1 text-xl font-semibold">What needs attention</h3></div><ShieldAlert className="h-5 w-5 text-[#7EE7C7]" /></div>
            <div className="mt-4 space-y-3">
              {snapshot.risks.map((risk) => <div key={risk.id} className="rounded-[24px] border border-border bg-[#0D141B] p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium">{risk.title}</p><span className="rounded-full bg-[#7EE7C7]/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#7EE7C7]">{risk.level}</span></div><p className="mt-2 text-sm text-[#9AA4B2]">{risk.impact}</p><p className="mt-2 text-sm text-white">{risk.recommendation}</p></div>)}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between"><div><p className="text-sm text-secondary">Growth Opportunities</p><h3 className="mt-1 text-xl font-semibold">Where PFOS sees upside</h3></div><Flame className="h-5 w-5 text-[#7EE7C7]" /></div>
            <div className="mt-4 space-y-3">
              {snapshot.opportunities.map((item) => <div key={item.id} className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="font-medium">{item.title}</p><p className="mt-2 text-sm text-[#9AA4B2]">{item.detail}</p></div>)}
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <div className="flex items-center justify-between"><div><p className="text-sm text-secondary">Natural Language Copilot</p><h3 className="mt-1 text-xl font-semibold">Ask PFOS in plain language</h3></div><Bot className="h-5 w-5 text-[#7EE7C7]" /></div>
            <div className="mt-4 rounded-[24px] border border-border bg-[#0D141B] p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 flex-1 rounded-[20px] border border-border bg-[#080A0F] px-4 text-sm text-white outline-none transition focus:border-[#7EE7C7]/50" placeholder='Try "Can I afford a ₹1L laptop?"' />
                <button type="button" onClick={() => ask(query)} className="rounded-[20px] bg-[#7EE7C7] px-5 py-3 text-sm font-semibold text-[#071a0d]">Ask Coach</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-secondary">
                {['How much did I spend on food last month?', 'When will I reach my emergency fund goal?', 'How is my portfolio performing?', 'How much tax might I owe?'].map((preset) => (
                  <button key={preset} type="button" onClick={() => { setQuery(preset); ask(preset); }} className="rounded-full border border-border bg-[#080A0F] px-3 py-2 transition hover:border-[#7EE7C7]/30 hover:text-white">{preset}</button>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={queryAnswer?.title || 'empty'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 rounded-[24px] border border-border bg-[#0D141B] p-4">
                <div className="flex items-center justify-between"><p className="font-medium">{queryAnswer?.title || 'Coach response'}</p><div className="flex items-center gap-2 text-[#7EE7C7]"><Mic className="h-4 w-4" /><span className="text-xs uppercase tracking-[0.22em]">Voice Ready</span></div></div>
                <p className="mt-3 text-sm text-white">{queryAnswer?.answer || 'Ask a finance question to get a response grounded in your PFOS data.'}</p>
                <div className="mt-3 space-y-2">{(queryAnswer?.supporting || ['Supports reports, chart explanations, and action planning.']).map((line) => <div key={line} className="flex items-start gap-2 text-sm text-[#9AA4B2]"><ChevronRight className="mt-0.5 h-4 w-4 text-[#7EE7C7]" /><span>{line}</span></div>)}</div>
              </motion.div>
            </AnimatePresence>
          </Card>

          <Card>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-sm text-secondary">Upcoming Actions</p><div className="mt-3 space-y-3">{snapshot.upcomingActions.map((action) => <div key={action.id} className="rounded-[20px] border border-border bg-[#080A0F] p-3"><p className="font-medium">{action.title}</p><p className="mt-1 text-sm text-[#9AA4B2]">{action.detail}</p><p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#7EE7C7]">{action.metric}</p></div>)}</div></div>
              <div className="rounded-[24px] border border-border bg-[#0D141B] p-4"><p className="text-sm text-secondary">Proactive Alerts</p><div className="mt-3 space-y-3">{snapshot.alerts.map((alert) => <div key={alert.id} className="rounded-[20px] border border-border bg-[#080A0F] p-3"><p className="font-medium">{alert.title}</p><p className="mt-1 text-sm text-[#9AA4B2]">{alert.message}</p></div>)}</div></div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          <Card><p className="text-sm text-secondary">Smart Action Plans</p><h3 className="mt-1 text-xl font-semibold">30 / 90 / 365 day roadmap</h3><div className="mt-4 space-y-4">{(['30-day', '90-day', '1-year'] as const).map((horizon) => <div key={horizon}><p className="text-xs uppercase tracking-[0.24em] text-[#7EE7C7]">{horizon}</p><div className="mt-2 space-y-2">{snapshot.actionPlans[horizon].map((item) => <div key={item.id} className="rounded-[20px] border border-border bg-[#0D141B] p-3"><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-[#9AA4B2]">{item.detail}</p><p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#7EE7C7]">{item.metric}</p></div>)}</div></div>)}</div></Card>
          <Card><p className="text-sm text-secondary">AI Explanations</p><h3 className="mt-1 text-xl font-semibold">Plain-language context</h3><div className="mt-4 space-y-3">{snapshot.explanationCards.map((item) => <div key={item.id} className="rounded-[20px] border border-border bg-[#0D141B] p-4"><p className="font-medium">{item.title}</p><p className="mt-2 text-sm text-[#9AA4B2]">{item.explanation}</p></div>)}</div></Card>
          <Card><p className="text-sm text-secondary">Coach Timeline</p><h3 className="mt-1 text-xl font-semibold">Advice history & completion</h3><div className="mt-4 space-y-3">{historyItems.map((item: any) => <motion.div key={item.id} layout className="rounded-[20px] border border-border bg-[#0D141B] p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium">{item.title}</p><span className="rounded-full bg-[#7EE7C7]/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#7EE7C7]">{item.status}</span></div><p className="mt-2 text-sm text-[#9AA4B2]">{item.detail}</p><div className="mt-2 flex items-center gap-2 text-xs text-secondary"><CheckCircle2 className="h-3.5 w-3.5 text-[#7EE7C7]" /><span>{new Date(item.createdAt).toLocaleString()}</span></div></motion.div>)}</div></Card>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <Card><p className="text-sm text-secondary">Family Coaching</p><div className="mt-3 space-y-2">{snapshot.familyInsights.map((line) => <div key={line} className="rounded-[20px] border border-border bg-[#0D141B] p-3 text-sm text-[#9AA4B2]">{line}</div>)}</div></Card>
          <Card className="xl:col-span-3"><p className="text-sm text-secondary">Report Integration</p><h3 className="mt-1 text-xl font-semibold">Generated coaching reports</h3><div className="mt-4 grid gap-4 lg:grid-cols-2">{snapshot.reports.map((report) => <div key={report.id} className="rounded-[24px] border border-border bg-[#0D141B] p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium">{report.title}</p><Sparkles className="h-4 w-4 text-[#7EE7C7]" /></div><p className="mt-2 text-sm text-[#9AA4B2]">{report.summary}</p><div className="mt-3 space-y-2">{report.bullets.map((bullet) => <div key={bullet} className="flex items-start gap-2 text-sm text-white"><ChevronRight className="mt-0.5 h-4 w-4 text-[#7EE7C7]" /><span>{bullet}</span></div>)}</div></div>)}</div></Card>
        </div>
      </motion.div>

      <AnimatePresence>{mobileSheet ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-black/55 lg:hidden" onClick={() => setMobileSheet(false)}><motion.div initial={{ y: 220 }} animate={{ y: 0 }} exit={{ y: 220 }} transition={{ type: 'spring', stiffness: 240, damping: 26 }} className="w-full rounded-t-[28px] border-t border-border bg-[#151A20] p-5" onClick={(event) => event.stopPropagation()}><div className="mx-auto h-1.5 w-14 rounded-full bg-white/15" /><p className="mt-4 text-sm text-secondary">Mobile Coach Actions</p><div className="mt-4 space-y-3">{snapshot.topRecommendations.slice(0, 3).map((item) => <button key={item.id} type="button" className="block w-full rounded-[24px] border border-border bg-[#080A0F] p-4 text-left"><p className="font-medium text-white">{item.title}</p><p className="mt-1 text-sm text-[#9AA4B2]">{item.detail}</p></button>)}</div></motion.div></motion.div> : null}</AnimatePresence>
      {loading ? <div className="fixed right-4 bottom-4 rounded-[20px] border border-border bg-card px-4 py-3 text-sm text-secondary">Loading financial coach…</div> : null}
    </div>
  );
}
