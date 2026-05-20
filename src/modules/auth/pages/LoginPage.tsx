'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { AuthCard, AuthInput, AuthButton, AuthDivider, GoogleSignInButton } from '../components';
import { ShieldCheck, WalletCards, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isCapacitorAndroid, setIsCapacitorAndroid] = useState(false);
  
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      clearError();
      await signIn({ email, password });
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  useEffect(() => {
    let mounted = true;

    const detectCapacitorAndroid = async () => {
      try {
        const native = await import('@/src/native');
        if (mounted && (await native.isCapacitorAndroid())) {
          setIsCapacitorAndroid(true);
        }
      } catch {
        // Not running in Capacitor or unable to detect platform
      }
    };

    detectCapacitorAndroid();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      clearError();
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <div className="min-h-screen bg-main px-4 py-6 text-white flex items-center">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="relative hidden overflow-hidden rounded-[40px] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(126,231,199,0.18),transparent_32%),linear-gradient(180deg,rgba(27,33,43,0.95),rgba(8,10,15,0.92))] p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.14),transparent_30%)]" />
          <div className="relative space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-secondary">Premium mobile fintech</p>
            <h2 className="max-w-xl text-5xl font-semibold leading-tight">Control money with a calm, dark command center.</h2>
            <p className="max-w-lg text-sm leading-6 text-secondary">Track balances, automate recurring payments, and keep every financial alert in one minimal surface.</p>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-6">
              {[
                { label: 'Protected', value: 'Bank-grade', icon: ShieldCheck },
                { label: 'Balance', value: 'Live sync', icon: WalletCards },
                { label: 'Insights', value: 'Mint signals', icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[28px] border border-white/6 bg-white/5 p-4 backdrop-blur-xl">
                    <Icon className="mb-4 size-5 text-accent-mint" />
                    <p className="text-xs text-secondary">{item.label}</p>
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 h-64 rounded-[36px] border border-white/6 bg-[linear-gradient(180deg,rgba(21,26,32,0.95),rgba(14,17,23,0.88))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="flex h-full items-end gap-3">
                {[38, 58, 44, 74, 56, 86, 64, 92].map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-[18px] bg-[linear-gradient(180deg,rgba(126,231,199,0.95),rgba(185,245,216,0.18))]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <AuthCard title="Welcome Back" description="Sign in to your PFOS account to manage your finances">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-300">{error.message}</p>
              </div>
            )}

            <AuthInput
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={loading}
            />

            <AuthInput
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={loading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border border-border bg-card text-accent-mint focus:ring-[rgba(126,231,199,0.2)]"
                />
                <span className="ml-2 text-sm text-secondary">Remember me</span>
              </label>

              <Link href="/auth/forgot-password" className="text-sm text-accent-mint hover:opacity-80">
                Forgot password?
              </Link>
            </div>

            <AuthButton type="submit" loading={loading} disabled={loading}>
              Sign In
            </AuthButton>
          </form>

          <AuthDivider />

          {isCapacitorAndroid ? (
            <div className="rounded-[24px] border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-warning">
              Google sign-in is unavailable inside the Android app webview. Please sign in with email and password.
            </div>
          ) : (
            <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />
          )}

          <p className="mt-6 text-center text-sm text-secondary">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-accent-mint hover:opacity-80">
              Sign up
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
