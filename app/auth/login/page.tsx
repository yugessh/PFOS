'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { signIn, signInWithGoogle, loading, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard/transactions');
    }
  }, [user, loading, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard/transactions');
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard/transactions');
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-secondary">PFOS</p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-secondary">Access your finance dashboard.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-secondary">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-secondary">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary">
          New user?{' '}
          <Link href="/auth/register" className="font-semibold text-primary hover:text-primary-hover">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
