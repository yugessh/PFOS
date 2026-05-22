"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { saveOnboarding } from '../src/lib/onboarding';

type OnboardingData = {
  currency: string;
  country?: string;
  financialGoal?: string;
  monthlyIncome?: number;
  defaultAccount?: string;
  notificationSettings?: Record<string, boolean>;
  dashboardPreference?: string;
  name?: string;
};

const steps = [
  'Choose Currency',
  'Create First Account',
  'Set Monthly Income',
  'Create First Goal',
  'Notification Preferences',
  'Dashboard Preferences',
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>({ currency: 'INR' });

  function update(partial: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...partial }));
  }

  async function next() {
    if (index < steps.length - 1) return setIndex(i => i + 1);
    // complete
    try {
      // userId will be taken from auth in a real flow; for now use placeholder
      await saveOnboarding({ userId: 'anon', ...data });
      localStorage.setItem('pfos_onboarding_completed', 'true');
      router.push('/dashboard');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Onboarding save failed', e);
    }
  }

  function prev() {
    if (index > 0) setIndex(i => i - 1);
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#080A0F' }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className="rounded-[28px] p-6"
          style={{ background: '#151A20' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{steps[index]}</h2>
            <div className="text-slate-300">Step {index + 1} / {steps.length}</div>
          </div>

          <div className="mt-6">
            {index === 0 && (
              <div className="space-y-3">
                <label className="block text-slate-200">Currency</label>
                <div className="flex gap-2">
                  {['INR','USD','EUR','GBP','Custom'].map(c => (
                    <button key={c} onClick={() => update({ currency: c })} className={`px-3 py-2 rounded ${data.currency===c? 'bg-[#7EE7C7] text-black':'bg-slate-700 text-slate-200'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {index === 1 && (
              <div className="space-y-3">
                <label className="block text-slate-200">Default Account</label>
                <div className="flex gap-2">
                  {['Bank','Cash','UPI','Wallet'].map(a => (
                    <button key={a} onClick={() => update({ defaultAccount: a })} className={`px-3 py-2 rounded ${data.defaultAccount===a? 'bg-[#7EE7C7] text-black':'bg-slate-700 text-slate-200'}`}>{a}</button>
                  ))}
                </div>
              </div>
            )}

            {index === 2 && (
              <div>
                <label className="block text-slate-200">Monthly Income</label>
                <input className="mt-2 p-3 rounded w-full bg-slate-800 text-white" type="number" value={data.monthlyIncome ?? ''} onChange={e => update({ monthlyIncome: Number(e.target.value) })} />
              </div>
            )}

            {index === 3 && (
              <div>
                <label className="block text-slate-200">First Goal</label>
                <div className="flex gap-2 mt-2">
                  {['Emergency Fund','Buy iPhone','Travel','Investments'].map(g => (
                    <button key={g} onClick={() => update({ financialGoal: g })} className={`px-3 py-2 rounded ${data.financialGoal===g? 'bg-[#7EE7C7] text-black':'bg-slate-700 text-slate-200'}`}>{g}</button>
                  ))}
                </div>
              </div>
            )}

            {index === 4 && (
              <div>
                <label className="block text-slate-200">Notifications</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['EMI alerts','Goal reminders','Budget alerts','AI insights'].map(n => (
                    <label key={n} className="flex items-center gap-2 text-slate-200">
                      <input type="checkbox" onChange={e=> update({ notificationSettings: { ...(data.notificationSettings||{}), [n]: e.target.checked } })} /> {n}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {index === 5 && (
              <div>
                <label className="block text-slate-200">Dashboard Preference</label>
                <div className="flex gap-2 mt-2">
                  {['Compact view','Analytics-heavy','Minimal mode'].map(d => (
                    <button key={d} onClick={() => update({ dashboardPreference: d })} className={`px-3 py-2 rounded ${data.dashboardPreference===d? 'bg-[#7EE7C7] text-black':'bg-slate-700 text-slate-200'}`}>{d}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={prev} disabled={index===0} className="px-4 py-2 rounded bg-slate-700 text-slate-300">Back</button>
            <div className="flex items-center gap-3">
              <div className="text-slate-300">{index === steps.length - 1 ? 'Finish' : 'Next'}</div>
              <button onClick={next} className="px-4 py-2 rounded bg-[#7EE7C7] text-black">{index === steps.length - 1 ? 'Complete' : 'Next'}</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
