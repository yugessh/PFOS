'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { AuthCard, AuthInput, AuthButton, AuthDivider, GoogleSignInButton } from '../components';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <AuthCard
        title="Create Account"
        description="Start managing your finances with PFOS today"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
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
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <AuthButton
            type="submit"
            loading={loading}
            disabled={loading}
          >
            Create Account
          </AuthButton>
        </form>
        
        <AuthDivider />
        
        <GoogleSignInButton
          onClick={handleGoogleSignIn}
          disabled={loading}
        />
        
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
