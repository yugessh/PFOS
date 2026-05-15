'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const { signUp, loading, user, signInWithGoogle } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard/transactions');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signUp(email, password);
      router.push('/dashboard/transactions');
    } catch (err: any) {
      setError(err?.message || 'Unable to register.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary">Loading your account...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-4xl font-semibold leading-tight text-foreground">Create the OS account for your finances</h1>
              <p className="max-w-xl text-base text-secondary">Track every expense, investment, and goal with one premium Android-inspired interface.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border bg-card-elevated/80 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-secondary">Instant insights</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">Ready on login</p>
              </div>
              <div className="rounded-[24px] border border-border bg-card-elevated/80 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-secondary">Smart protection</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">Secure by default</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-border bg-card-elevated/80 p-5">
              <div className="flex items-center justify-between text-secondary text-sm">
                <span>Daily focus</span>
                <Sparkles size={18} />
              </div>
              <p className="mt-3 text-foreground">A calm, focused finance workspace with minimal distraction and premium polish.</p>
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
            <p className="text-xs uppercase tracking-[0.4em] text-secondary">Register</p>
            <h2 className="text-3xl font-semibold text-foreground">Start your Neo Finance OS journey</h2>
            <p className="text-sm text-muted-foreground">Set up your finance operating system with a secure, premium login experience.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
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
              <div>
                <label htmlFor="password" className="text-sm text-secondary">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-sm text-secondary">Confirm password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-[20px] border border-[#FF5252]/30 bg-[#FF5252]/10 p-3 text-sm text-[#FF5252]">
                {error}
              </div>
            ) : null}

            <div className="flex items-center justify-between text-sm text-secondary">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border border-border bg-card text-primary focus:ring-primary/50"
                />
                I agree to terms
              </label>
              <a href="/terms" className="text-primary hover:text-primary-hover">Terms</a>
            </div>

            <Button className="w-full" size="lg" type="submit">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              type="button"
              onClick={async () => {
                try {
                  setError('');
                  if (!signInWithGoogle) throw new Error('Google sign-in is not available');
                  await signInWithGoogle();
                  router.replace('/dashboard');
                } catch (err: any) {
                  setError(err?.message || String(err));
                }
              }}
            >
              Continue with Google
            </Button>
          </form>

          <div className="mt-8 rounded-[24px] border border-border bg-card-elevated/80 p-4 text-center text-sm text-secondary">
            Already registered?{' '}
            <a href="/auth/login" className="text-primary hover:text-primary-hover">Sign in instead</a>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
