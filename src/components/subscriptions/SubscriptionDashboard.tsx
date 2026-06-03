"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, Search, Calendar, Users, FileText, Sparkles,
  TrendingDown, Check, X, AlertTriangle, ChevronRight, Edit2, Trash2,
  Settings, RefreshCw, Bell, ArrowUpRight
} from 'lucide-react';
import { useSubscriptions } from '@/src/hooks/useSubscriptions';
import { formatCurrency } from '@/src/lib/currency';
import { type SubscriptionModel } from '@/src/services/firestore/subscriptions.service';

// Subcomponents
import { SavingsSimulator } from './SavingsSimulator';
import { FamilySubscriptions } from './FamilySubscriptions';
import { SubscriptionReports } from './SubscriptionReports';
import { SubscriptionRecommendations } from './SubscriptionRecommendations';
import { SubscriptionCalendarView } from './SubscriptionCalendarView';

export function SubscriptionDashboard() {
  const {
    subscriptions,
    loading,
    saving,
    error,
    refresh,
    saveSubscription,
    deleteSubscription,
    detectedSubscriptions,
    totalMonthlyCost,
    totalAnnualCost,
    unusedCount,
    healthScores,
    optimizationRecommendations,
    potentialOptimizationSavings,
  } = useSubscriptions();

  const [activeTab, setActiveTab] = useState<'list' | 'rec' | 'sim' | 'family' | 'calendar' | 'reports'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionModel | null>(null);

  // Auto-detection review state
  const [showDetectionBanner, setShowDetectionBanner] = useState(true);
  const [showDetectionModal, setShowDetectionModal] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Entertainment');
  const [formAmount, setFormAmount] = useState('');
  const [formFrequency, setFormFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [formBillingStart, setFormBillingStart] = useState('');
  const [formNextRenewal, setFormNextRenewal] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Credit Card');
  const [formAutoRenew, setFormAutoRenew] = useState(true);
  const [formUsage, setFormUsage] = useState<'high' | 'medium' | 'low' | 'unused'>('high');
  
  // Shared state
  const [formSharedWith, setFormSharedWith] = useState<string[]>([]);
  const [newSharedName, setNewSharedName] = useState('');

  // Price history log state
  const [formPriceHistory, setFormPriceHistory] = useState<Array<{ date: string; amount: number }>>([]);
  const [newPriceDate, setNewPriceDate] = useState('');
  const [newPriceAmount, setNewPriceAmount] = useState('');

  const openAddModal = () => {
    setEditingSub(null);
    setFormName('');
    setFormCategory('Entertainment');
    setFormAmount('');
    setFormFrequency('monthly');
    const todayStr = new Date().toISOString().split('T')[0];
    setFormBillingStart(todayStr);
    setFormNextRenewal(todayStr);
    setFormPaymentMethod('Credit Card');
    setFormAutoRenew(true);
    setFormUsage('high');
    setFormSharedWith([]);
    setFormPriceHistory([]);
    setShowAddModal(true);
  };

  const openEditModal = (sub: SubscriptionModel) => {
    setEditingSub(sub);
    setFormName(sub.name);
    setFormCategory(sub.category);
    setFormAmount(String(sub.amount));
    setFormFrequency(sub.frequency);
    setFormBillingStart(sub.billingCycleStart);
    setFormNextRenewal(sub.nextRenewalDate);
    setFormPaymentMethod(sub.paymentMethod);
    setFormAutoRenew(sub.autoRenew);
    setFormUsage(sub.usageFrequency);
    setFormSharedWith(sub.sharedWith || []);
    setFormPriceHistory(sub.priceHistory || []);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAmount) return;

    const payload: any = {
      name: formName.trim(),
      category: formCategory,
      amount: Number(formAmount),
      frequency: formFrequency,
      billingCycleStart: formBillingStart,
      nextRenewalDate: formNextRenewal,
      paymentMethod: formPaymentMethod,
      autoRenew: formAutoRenew,
      usageFrequency: formUsage,
      sharedWith: formSharedWith,
      priceHistory: formPriceHistory.length > 0 ? formPriceHistory : [{ date: formBillingStart, amount: Number(formAmount) }],
      isDetected: editingSub ? editingSub.isDetected : false
    };

    const res = await saveSubscription(payload, editingSub?.id);
    if (res.success) {
      setShowAddModal(false);
    }
  };

  const handleImportDetected = async (candidate: typeof detectedSubscriptions[0]) => {
    const res = await saveSubscription(candidate);
    if (res.success) {
      refresh();
    }
  };

  const handleImportAllDetected = async () => {
    for (const sub of detectedSubscriptions) {
      await saveSubscription(sub);
    }
    setShowDetectionModal(false);
    setShowDetectionBanner(false);
  };

  const addSharedMember = () => {
    if (newSharedName.trim() && !formSharedWith.includes(newSharedName.trim())) {
      setFormSharedWith([...formSharedWith, newSharedName.trim()]);
      setNewSharedName('');
    }
  };

  const addPriceHistoryLog = () => {
    if (newPriceDate && newPriceAmount) {
      const logs = [...formPriceHistory, { date: newPriceDate, amount: Number(newPriceAmount) }];
      // Sort price logs by date
      logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setFormPriceHistory(logs);
      setNewPriceDate('');
      setNewPriceAmount('');
    }
  };

  const filteredSubs = useMemo(() => {
    return subscriptions.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [subscriptions, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top dashboard summary cards (Part A) */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card-surface p-4 bg-white/5 border border-white/5 rounded-[24px]">
          <p className="text-[11px] text-secondary font-medium uppercase tracking-wider">Active Subscriptions</p>
          <p className="text-2xl font-bold text-white mt-1.5">{subscriptions.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="card-surface p-4 bg-white/5 border border-white/5 rounded-[24px]">
          <p className="text-[11px] text-secondary font-medium uppercase tracking-wider">Monthly Cost</p>
          <p className="text-2xl font-bold text-white mt-1.5">{formatCurrency(totalMonthlyCost)}</p>
        </div>
        <div className="card-surface p-4 bg-white/5 border border-white/5 rounded-[24px]">
          <p className="text-[11px] text-secondary font-medium uppercase tracking-wider">Annual Cost</p>
          <p className="text-2xl font-bold text-white mt-1.5">{formatCurrency(totalAnnualCost)}</p>
        </div>
        <div className="card-surface p-4 bg-white/5 border border-white/5 rounded-[24px]">
          <p className="text-[11px] text-secondary font-medium uppercase tracking-wider">Optimization Savings</p>
          <p className="text-2xl font-bold text-accent-mint mt-1.5">{formatCurrency(potentialOptimizationSavings)}/mo</p>
        </div>
        <div className="card-surface p-4 bg-white/5 border border-white/5 rounded-[24px]">
          <p className="text-[11px] text-secondary font-medium uppercase tracking-wider">Unused Services</p>
          <p className="text-2xl font-bold text-red-400 mt-1.5">{unusedCount}</p>
        </div>
      </section>

      {/* Auto-detected Subscription Banners (Part B) */}
      {showDetectionBanner && detectedSubscriptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] bg-accent-mint/10 border border-accent-mint/20 p-5 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 text-accent-mint animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">Auto-detected recurring payments!</h3>
              <p className="text-xs text-secondary mt-0.5">
                We analyzed your transactions and found <strong className="text-accent-mint">{detectedSubscriptions.length} recurring subscriptions</strong> (Netflix, Spotify, Google, etc.).
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetectionModal(true)}
              className="rounded-[20px] bg-accent-mint px-4 py-2.5 text-xs font-semibold text-[#071a0d] transition hover:brightness-95"
            >
              Review & Import
            </button>
            <button
              onClick={() => setShowDetectionBanner(false)}
              className="rounded-[20px] border border-white/10 hover:bg-white/5 px-3 py-2 text-xs text-secondary transition"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Navigation tabs */}
      <nav className="flex flex-wrap gap-2.5 border-b border-white/5 pb-3">
        {[
          { id: 'list', label: 'My Subscriptions', icon: CreditCard },
          { id: 'rec', label: 'Recommendations', icon: TrendingDown },
          { id: 'sim', label: 'Savings Simulator', icon: Sparkles },
          { id: 'family', label: 'Family Split', icon: Users },
          { id: 'calendar', label: 'Renewal Schedule', icon: Calendar },
          { id: 'reports', label: 'Reports & Export', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 rounded-[22px] px-4.5 py-3 text-xs font-semibold transition ${active ? 'bg-accent-mint text-[#071a0d]' : 'border border-border bg-card text-secondary hover:bg-card-elevated'}`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main tab body (Part O: Animations) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 input-surface text-xs"
                  />
                </div>
                <button onClick={openAddModal} className="button-primary text-xs font-semibold flex items-center gap-1.5">
                  <Plus className="size-4" /> Add Subscription
                </button>
              </div>

              {loading ? (
                <div className="card-surface p-12 text-center text-secondary text-sm">
                  Loading subscriptions...
                </div>
              ) : filteredSubs.length === 0 ? (
                <div className="card-surface p-12 text-center text-secondary">
                  <p className="text-sm font-semibold text-white">No subscriptions tracked yet</p>
                  <p className="text-xs text-secondary mt-1">Start tracking active memberships to optimize recurring costs.</p>
                  <button onClick={openAddModal} className="mt-4 button-primary text-xs font-semibold">Track a subscription</button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSubs.map(sub => {
                    const isCancelled = sub.status === 'cancelled';
                    const isPaused = sub.status === 'paused';
                    const isUnused = sub.usageFrequency === 'unused';

                    return (
                      <div key={sub.id} className={`card-surface p-4.5 rounded-[28px] border transition ${isCancelled ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white truncate">{sub.name}</h4>
                            <p className="text-[11px] text-secondary mt-0.5 capitalize">{sub.category} • {sub.frequency}</p>
                          </div>
                          
                          <div className="flex gap-1.5">
                            <button onClick={() => openEditModal(sub)} className="p-1.5 hover:bg-white/5 rounded-full text-secondary hover:text-white transition">
                              <Edit2 className="size-3.5" />
                            </button>
                            <button onClick={() => deleteSubscription(sub.id)} className="p-1.5 hover:bg-white/5 rounded-full text-secondary hover:text-red-300 transition">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] text-secondary border-t border-white/5 pt-3">
                          <div>
                            <span>Monthly Cost:</span>
                            <p className="text-sm font-semibold text-white mt-0.5">
                              {formatCurrency(sub.frequency === 'yearly' ? sub.amount / 12 : sub.frequency === 'weekly' ? sub.amount * 4.33 : sub.amount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span>Renewal Date:</span>
                            <p className="text-sm font-semibold text-white mt-0.5">
                              {new Date(sub.nextRenewalDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-2.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${isCancelled ? 'bg-white/5 text-secondary' : isPaused ? 'bg-yellow-500/10 text-yellow-300' : 'bg-accent-mint/10 text-accent-mint'}`}>
                            {sub.status.toUpperCase()}
                          </span>
                          
                          {isUnused && !isCancelled && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300 font-semibold">
                              <AlertTriangle className="size-3" /> Unused
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rec' && (
            <SubscriptionRecommendations
              recommendations={optimizationRecommendations}
              totalMonthlyCost={totalMonthlyCost}
              totalAnnualCost={totalAnnualCost}
              healthScore={healthScores.overall}
            />
          )}

          {activeTab === 'sim' && <SavingsSimulator subscriptions={subscriptions} />}
          {activeTab === 'family' && <FamilySubscriptions subscriptions={subscriptions} />}
          {activeTab === 'calendar' && <SubscriptionCalendarView subscriptions={subscriptions} />}
          {activeTab === 'reports' && (
            <SubscriptionReports
              subscriptions={subscriptions}
              optimizationRecommendations={optimizationRecommendations}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* REVIEW AUTO-DETECTED MODAL */}
      {showDetectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-[32px] border border-white/5 bg-[#151A20] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold text-white">Review Auto-Detected Subscriptions</h2>
              <button onClick={() => setShowDetectionModal(false)} className="text-secondary hover:text-white transition">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {detectedSubscriptions.map((candidate, index) => (
                <div key={index} className="rounded-[24px] border border-white/5 bg-[#0C1319] p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{candidate.name}</h3>
                    <p className="text-xs text-secondary mt-0.5">{candidate.category} • {candidate.frequency}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-white">{formatCurrency(candidate.amount)}</p>
                    <button
                      onClick={() => handleImportDetected(candidate)}
                      className="rounded-full bg-accent-mint/10 border border-accent-mint/20 hover:bg-accent-mint/20 p-2 text-accent-mint transition"
                    >
                      <Check className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-white/5 pt-4">
              <button
                onClick={() => setShowDetectionModal(false)}
                className="rounded-[20px] border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs text-white transition"
              >
                Close
              </button>
              <button
                onClick={handleImportAllDetected}
                className="rounded-[20px] bg-accent-mint px-4 py-3 text-xs font-semibold text-[#071a0d] transition hover:brightness-95"
              >
                Approve & Import All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT SUBSCRIPTION MODAL (Part M: Bottom sheet detail fallback) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xl rounded-[32px] border border-white/5 bg-[#151A20] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold text-white">
                {editingSub ? `Edit tracked service: ${editingSub.name}` : 'Track New Subscription'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-secondary hover:text-white transition">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Subscription Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full input-surface text-xs"
                    placeholder="e.g. Netflix, Gym, Office 365"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full input-surface text-xs"
                  >
                    {['Entertainment', 'Cloud Services', 'Health & Fitness', 'Utilities', 'Insurance', 'EMI', 'Custom Recurring'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Billing Amount</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    className="w-full input-surface text-xs"
                    placeholder="e.g. 199, 649"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Frequency</label>
                  <select
                    value={formFrequency}
                    onChange={e => setFormFrequency(e.target.value as any)}
                    className="w-full input-surface text-xs"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Billing Cycle Start</label>
                  <input
                    type="date"
                    required
                    value={formBillingStart}
                    onChange={e => setFormBillingStart(e.target.value)}
                    className="w-full input-surface text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Next Renewal Date</label>
                  <input
                    type="date"
                    required
                    value={formNextRenewal}
                    onChange={e => setFormNextRenewal(e.target.value)}
                    className="w-full input-surface text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Payment Method</label>
                  <input
                    type="text"
                    value={formPaymentMethod}
                    onChange={e => setFormPaymentMethod(e.target.value)}
                    className="w-full input-surface text-xs"
                    placeholder="e.g. Credit Card, UPI Autopay"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">Usage frequency</label>
                  <select
                    value={formUsage}
                    onChange={e => setFormUsage(e.target.value as any)}
                    className="w-full input-surface text-xs"
                  >
                    <option value="high">High Usage</option>
                    <option value="medium">Medium Usage</option>
                    <option value="low">Rarely Used (Low)</option>
                    <option value="unused">Unused (Leak)</option>
                  </select>
                </div>
              </div>

              {/* Shared splits section (Part J) */}
              <div className="border-t border-white/5 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="size-4 text-accent-mint" /> Cost Split Setup (Optional)
                </h4>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Family member name..."
                    value={newSharedName}
                    onChange={e => setNewSharedName(e.target.value)}
                    className="flex-1 input-surface text-xs"
                  />
                  <button type="button" onClick={addSharedMember} className="button-primary text-xs font-semibold py-2 px-4 rounded-xl shrink-0">
                    Share
                  </button>
                </div>

                {formSharedWith.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formSharedWith.map(name => (
                      <span key={name} className="inline-flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 text-[11px] text-white">
                        <span>{name}</span>
                        <button type="button" onClick={() => setFormSharedWith(formSharedWith.filter(n => n !== name))} className="text-secondary hover:text-red-300">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price increase log setup (Part F) */}
              <div className="border-t border-white/5 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <TrendingDown className="size-4 text-accent-mint" /> Cost Log & Price History
                </h4>

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newPriceDate}
                    onChange={e => setNewPriceDate(e.target.value)}
                    className="flex-1 input-surface text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Amount..."
                    value={newPriceAmount}
                    onChange={e => setNewPriceAmount(e.target.value)}
                    className="w-24 input-surface text-xs"
                  />
                  <button type="button" onClick={addPriceHistoryLog} className="button-primary text-xs font-semibold py-2 px-4 rounded-xl shrink-0">
                    Log
                  </button>
                </div>

                {formPriceHistory.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto bg-white/5 p-2 rounded-[20px] border border-white/5">
                    {formPriceHistory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-[10px] text-secondary p-1 border-b border-white/5">
                        <span>{item.date}</span>
                        <span className="text-white font-semibold">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/5">
                <input
                  type="checkbox"
                  id="formAutoRenew"
                  checked={formAutoRenew}
                  onChange={e => setFormAutoRenew(e.target.checked)}
                  className="rounded border-white/10 text-accent-mint focus:ring-accent-mint size-4"
                />
                <label htmlFor="formAutoRenew" className="text-xs text-secondary cursor-pointer select-none">
                  Auto-renew subscription at end of billing cycle
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-[20px] border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-[20px] bg-accent-mint px-4 py-3 text-xs font-semibold text-[#071a0d] transition hover:brightness-95 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save tracked service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
