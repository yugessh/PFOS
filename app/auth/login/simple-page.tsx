'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../../src/context/AuthContext';
import Link from 'next/link';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { signIn, loading, user } = useAuthContext();
  const router = useRouter();

  if (user && !loading) {
    router.push('/dashboard/protected-example');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard/protected-example');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center px-4">
        <div className="rounded-[28px] border border-border bg-card p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)] text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-accent-mint border-t-transparent" />
          <p className="text-sm text-secondary">Loading your finance workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-border bg-card p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-secondary">PFOS</p>
          <h2 className="mt-4 text-3xl font-semibold text-foreground">Sign in to PFOS</h2>
          <p className="mt-2 text-sm text-secondary">Access your premium finance dashboard.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-[28px] border border-border bg-card-elevated p-4">
            <label className="block text-sm font-medium text-secondary">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-surface w-full"
            />
            <label className="block text-sm font-medium text-secondary">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-surface w-full"
            />
          </div>

          {error && (
            <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[24px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_16px_36px_rgba(126,231,199,0.24)] transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => alert('Google sign-in would be implemented here')}
            className="w-full rounded-[24px] border border-border bg-card px-4 py-3 text-sm font-semibold text-secondary transition hover:bg-card-elevated"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-semibold text-accent-mint hover:text-accent-secondary">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
