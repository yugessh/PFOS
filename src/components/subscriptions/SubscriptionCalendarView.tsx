"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarDays, Clock, ArrowRight } from 'lucide-react';
import { type SubscriptionModel } from '@/src/services/firestore/subscriptions.service';
import { formatCurrency } from '@/src/lib/currency';

interface SubscriptionCalendarViewProps {
  subscriptions: SubscriptionModel[];
}

export function SubscriptionCalendarView({ subscriptions }: SubscriptionCalendarViewProps) {
  const activeSubs = useMemo(() => subscriptions.filter(s => s.status === 'active'), [subscriptions]);

  const upcomingRenewals = useMemo(() => {
    return activeSubs
      .map(sub => {
        const nextRenewal = new Date(sub.nextRenewalDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Days until renewal
        const diffTime = nextRenewal.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...sub,
          daysLeft: diffDays,
          renewalDateObj: nextRenewal
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [activeSubs]);

  // Group by timeframe
  const groupedRenewals = useMemo(() => {
    const today: typeof upcomingRenewals = [];
    const thisWeek: typeof upcomingRenewals = [];
    const later: typeof upcomingRenewals = [];

    upcomingRenewals.forEach(sub => {
      if (sub.daysLeft === 0) today.push(sub);
      else if (sub.daysLeft > 0 && sub.daysLeft <= 7) thisWeek.push(sub);
      else if (sub.daysLeft > 7) later.push(sub);
    });

    return { today, thisWeek, later };
  }, [upcomingRenewals]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 columns: Timeline list */}
        <section className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="size-5 text-accent-mint" />
            <h3 className="text-lg font-semibold text-white">Upcoming Renewals</h3>
          </div>

          {upcomingRenewals.length === 0 ? (
            <div className="card-surface p-8 text-center text-secondary text-sm">
              No active renewals found. Add a subscription to track its payment schedule.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Today Renewals */}
              {groupedRenewals.today.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs uppercase tracking-wider text-accent-mint font-bold flex items-center gap-2">
                    <Clock className="size-3.5 animate-pulse" /> Renewing Today
                  </h4>
                  {groupedRenewals.today.map(sub => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="card-surface p-4 border-accent-mint/30 bg-accent-mint/5 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{sub.name}</p>
                        <p className="text-xs text-secondary mt-0.5">{sub.category} • {sub.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-accent-mint">{formatCurrency(sub.amount)}</p>
                        <p className="text-[10px] text-accent-mint font-semibold uppercase mt-0.5">Due Now</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* This Week Renewals */}
              {groupedRenewals.thisWeek.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs uppercase tracking-wider text-white font-bold">Renewing in next 7 days</h4>
                  <div className="space-y-2.5">
                    {groupedRenewals.thisWeek.map(sub => (
                      <div key={sub.id} className="card-surface p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{sub.name}</p>
                          <p className="text-xs text-secondary mt-0.5">{sub.category} • {sub.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{formatCurrency(sub.amount)}</p>
                          <p className="text-[10px] text-secondary mt-0.5">
                            Due in {sub.daysLeft} day{sub.daysLeft > 1 ? 's' : ''} ({sub.renewalDateObj.toLocaleDateString()})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Later Renewals */}
              {groupedRenewals.later.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs uppercase tracking-wider text-secondary font-bold">Later this month</h4>
                  <div className="space-y-2.5">
                    {groupedRenewals.later.map(sub => (
                      <div key={sub.id} className="card-surface p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{sub.name}</p>
                          <p className="text-xs text-secondary mt-0.5">{sub.category} • {sub.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{formatCurrency(sub.amount)}</p>
                          <p className="text-[10px] text-secondary mt-0.5">
                            Due in {sub.daysLeft} days ({sub.renewalDateObj.toLocaleDateString()})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right column: Quick Schedule Stats */}
        <section className="card-surface p-5 h-fit space-y-4">
          <h3 className="text-sm uppercase tracking-[0.25em] text-secondary">Renewal Metrics</h3>
          
          <div className="space-y-4 text-xs text-secondary">
            <div className="rounded-[20px] bg-[#0C1319] p-4 border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span>Total Active Subscriptions</span>
                <span className="text-white font-bold">{activeSubs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Renewing Next 7 Days</span>
                <span className="text-white font-bold">{groupedRenewals.today.length + groupedRenewals.thisWeek.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Auto-Renewal Enabled</span>
                <span className="text-white font-bold">{activeSubs.filter(s => s.autoRenew).length}</span>
              </div>
            </div>

            <div className="rounded-[20px] bg-[#0C1319] p-4 border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="size-3.5 text-accent-mint" /> Calendar Sync
              </h4>
              <p className="leading-relaxed">
                Renewal dates are automatically integrated with your main financial calendar. You will receive renewal alerts 3 days before any subscription charge.
              </p>
              <div className="flex items-center gap-1 text-accent-mint font-semibold hover:underline cursor-pointer">
                <span>View main calendar</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
