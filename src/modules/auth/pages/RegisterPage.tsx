'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { AuthCard, AuthInput, AuthButton, AuthDivider, GoogleSignInButton } from '../components';
import { ShieldCheck, WalletCards, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isCapacitorAndroid, setIsCapacitorAndroid] = useState(false);
  
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      clearError();
      await signUp({ email, password });
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
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative hidden overflow-hidden rounded-[40px] border border-white/6 bg-[radial-gradient(circle_at_top_left,rgba(126,231,199,0.16),transparent_32%),linear-gradient(180deg,rgba(21,26,32,0.95),rgba(8,10,15,0.94))] p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.1),transparent_30%)]" />
          <div className="relative space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-secondary">Join the OS</p>
            <h2 className="max-w-xl text-5xl font-semibold leading-tight">A calm, secure place to manage money from mobile first.</h2>
            <p className="max-w-lg text-sm leading-6 text-secondary">Create your account and unlock recurring automation, smart alerts, and a premium dark dashboard built for finance.</p>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-6">
              {[
                { label: 'Secure', value: 'Protected by Firebase', icon: ShieldCheck },
                { label: 'Fast', value: 'Instant setup', icon: WalletCards },
                { label: 'Smart', value: 'Mint insights', icon: Sparkles },
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
          </div>
        </div>

        <AuthCard title="Create Account" description="Start managing your finances with PFOS today">
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={loading}
            />

            <AuthInput
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              disabled={loading}
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border border-border bg-card text-accent-mint focus:ring-[rgba(126,231,199,0.2)]"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-secondary">
                I agree to the{' '}
                <Link href="/terms" className="text-accent-mint hover:opacity-80">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-accent-mint hover:opacity-80">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <AuthButton type="submit" loading={loading} disabled={loading}>
              Create Account
            </AuthButton>
          </form>

          <AuthDivider />

          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} />

          <p className="mt-6 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-accent-mint hover:opacity-80">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
