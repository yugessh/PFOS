'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/src/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { signUp, signInWithGoogle, loading, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard/transactions');
    }
  }, [user, loading, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      await signUp(email, password, name);
      router.replace('/dashboard/transactions');
    } catch (err: any) {
      setError(err?.message || 'Unable to register.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
      router.replace('/dashboard/transactions');
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-secondary">PFOS</p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Create account</h1>
          <p className="mt-2 text-sm text-secondary">Set up your finance profile and get started.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-secondary">
              Full name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary">
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account…' : 'Create account'}
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
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-hover">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
