'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface SecurityLockScreenProps {
  open: boolean;
  pinLength: 4 | 6;
  failedAttempts: number;
  lockoutUntil: Date | null;
  onSubmit: (pin: string) => Promise<boolean>;
  onReset?: () => void;
  message?: string;
}

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export function SecurityLockScreen({ open, pinLength, failedAttempts, lockoutUntil, onSubmit, onReset, message }: SecurityLockScreenProps) {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const lockedOut = useMemo(() => {
    if (!lockoutUntil) return false;
    return lockoutUntil > new Date();
  }, [lockoutUntil]);

  const countdown = useMemo(() => {
    if (!lockoutUntil) return '00:00';
    const remaining = Math.max(0, lockoutUntil.getTime() - Date.now());
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [lockoutUntil]);

  useEffect(() => {
    if (!open) {
      setPin('');
      setStatus(null);
    }
  }, [open]);

  const handleDigit = async (digit: string) => {
    if (lockedOut || submitting) return;
    if (pin.length >= pinLength) return;
    setPin((value) => value + digit);
  };

  const handleBackspace = () => {
    if (submitting) return;
    setPin((value) => value.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (lockedOut || submitting) return;
    if (pin.length !== pinLength) {
      setStatus(`Enter ${pinLength} digits`);
      return;
    }

    setSubmitting(true);
    const success = await onSubmit(pin);
    setSubmitting(false);

    if (success) {
      setPin('');
      setStatus(null);
      return;
    }

    setStatus('Incorrect PIN. Try again.');
    setPin('');
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-2xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">Unlock PFOS</h2>
                <p className="mt-2 text-sm text-secondary">Enter your PIN to resume secure access.</p>
              </div>
              {onReset ? (
                <button type="button" className="rounded-2xl border border-border p-3 text-secondary hover:bg-white/5" onClick={onReset}>
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-6 rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center justify-between text-sm text-secondary">
                <span>{message ?? 'Locked for security'}</span>
                <span>{failedAttempts} failed</span>
              </div>
              <div className="mt-4 flex justify-center gap-3">
                {Array.from({ length: pinLength }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-4 w-4 rounded-full border ${index < pin.length ? 'bg-accent border-accent' : 'border-border'} transition-colors`}
                  />
                ))}
              </div>
              {lockedOut ? (
                <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
                  Locked out until {countdown}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {keypad.map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={lockedOut || submitting}
                  onClick={() => handleDigit(digit)}
                  className="rounded-3xl border border-border bg-background px-4 py-4 text-xl font-semibold text-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                disabled={lockedOut || submitting}
                onClick={handleBackspace}
                className="rounded-3xl border border-border bg-background px-4 py-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                disabled={lockedOut || submitting}
                onClick={handleSubmit}
                className="rounded-3xl border border-accent bg-accent px-4 py-4 text-sm font-semibold text-background transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Unlock
              </button>
            </div>

            {status ? <p className="mt-4 text-center text-sm text-red-300">{status}</p> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
