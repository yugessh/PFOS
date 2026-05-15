'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  return <LoginContent />;
}

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const { signIn, loading, user, signInWithGoogle } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard/transactions');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard/transactions');
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col items-center justify-center gap-10 px-4 py-10 lg:flex-row">
        <motion.section
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl rounded-[32px] border border-border bg-card/85 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-secondary">
              <ShieldCheck size={24} />
              <span className="text-xs uppercase tracking-[0.4em]">Neo Finance OS</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-foreground">Your Personal Financial Operating System</h1>
              <p className="max-w-xl text-base text-secondary">A premium Android-inspired finance experience built for daily balance, investing, and intelligent money control.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border bg-card-elevated/80 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-secondary">Net Worth</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">₹1.24M</p>
              </div>
              <div className="rounded-[24px] border border-border bg-card-elevated/80 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-secondary">Monthly Growth</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">+18.2%</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-card-elevated/80 p-5">
              <div className="flex items-center justify-between text-secondary text-sm">
                <span>Secure</span>
                <Sparkles size={18} />
              </div>
              <p className="mt-3 text-foreground">Encrypted login, multi-factor-ready, and designed for premium everyday use.</p>
            </div>
          </div>
        </motion.section>

        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md rounded-[32px] border border-border bg-card/85 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
        >
          <div className="mb-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-secondary">Welcome back</p>
            <h2 className="text-3xl font-semibold text-foreground">Sign in to your OS</h2>
            <p className="text-sm text-muted-foreground">Log in to continue managing your complete financial ecosystem.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-secondary">Email address</label>
              <Input
                id="email"
                type="email"
                placeholder="you@financeos.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-secondary">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-secondary">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border border-border bg-card text-primary focus:ring-primary/50"
                />
                Remember me
              </label>
              <a href="#" className="text-primary hover:text-primary-hover">Forgot password?</a>
            </div>

            {error ? (
              <div className="rounded-[20px] border border-[#FF5252]/30 bg-[#FF5252]/10 p-3 text-sm text-[#FF5252]">
                {error}
              </div>
            ) : null}

            <Button className="w-full" size="lg" type="submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Button variant="outline" className="w-full" size="lg" type="button" onClick={async () => {
              try {
                setError('');
                if (!signInWithGoogle) throw new Error('Google sign-in not available');
                await signInWithGoogle();
                router.push('/dashboard/transactions');
              } catch (err: any) {
                setError(err?.message || String(err));
              }
            }}>
              Continue with Google
            </Button>
          </form>

          <div className="mt-8 rounded-[24px] border border-border bg-card-elevated/80 p-4 text-center text-sm text-secondary">
            Don’t have an account?{' '}
            <a href="/auth/register" className="text-primary hover:text-primary-hover">Create your Neo Finance OS access</a>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
