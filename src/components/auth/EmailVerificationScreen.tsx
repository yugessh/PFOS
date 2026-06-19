import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function EmailVerificationScreen() {
  const { user, resendVerificationEmail, signOut } = useAuthContext();
  const router = useRouter();
  const [status, setStatus] = useState<string>('');

  const handleResend = async () => {
    try {
      await resendVerificationEmail();
      setStatus('Verification email sent. Please check your inbox.');
    } catch (e: any) {
      setStatus(e.message || 'Failed to send verification email');
    }
  };

  const handleRefresh = async () => {
    // Force Firebase to refresh user token state
  const { getAuthSafe } = await import('@/src/firebase/firebase');
  const auth = getAuthSafe();
  const currentUser = auth?.currentUser;
    if (currentUser) {
      await currentUser.reload();
      // After reload, the AuthContext will update via onAuthStateChanged
      router.refresh();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Verify Your Email</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          A verification link has been sent to <strong>{user?.email}</strong>. Please check your inbox and click the link to verify your account.
        </p>
        {status && <p className="mb-2 text-sm text-green-600 dark:text-green-400">{status}</p>}
        <div className="flex gap-4">
          <button
            onClick={handleResend}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Resend Email
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            I Verified My Email
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
