"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: '#080A0F' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full p-8"
      >
        <div className="rounded-[28px]" style={{ background: '#151A20' }}>
          <div className="p-10 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: '#7EE7C7' }}>
                <span className="font-bold text-black text-xl">PFOS</span>
              </div>
            </div>

            <h1 className="text-3xl font-semibold text-white">Your Personal Financial Operating System</h1>
            <p className="mt-3 text-lg text-slate-300">Track. Analyze. Grow.</p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/onboarding">
                <a>
                  <button className="px-6 py-3 rounded-[28px] bg-[#7EE7C7] text-black font-medium">Get Started</button>
                </a>
              </Link>

              <Link href="/onboarding?import=true">
                <a>
                  <button className="px-6 py-3 rounded-[28px] border border-slate-600 text-slate-200">Import Existing Data</button>
                </a>
              </Link>
            </div>
          </div>
        </div>

        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 1 }}
          style={{
            background: 'radial-gradient(circle at 10% 20%, rgba(126,231,199,0.12), transparent 10%), radial-gradient(circle at 90% 80%, rgba(126,231,199,0.08), transparent 20%)',
          }}
        />
      </motion.div>
    </main>
  );
}
