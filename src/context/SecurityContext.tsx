'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '@/src/context/AuthContext';
import { securityService } from '@/src/services/firestore/security.service';
import { notificationsService } from '@/src/services/firestore/notifications.service';
import { auditService } from '@/src/services/firestore/audit.service';
import { SecurityLockScreen } from '@/src/components/security/LockScreen';
import { hashPin, getDeviceFingerprint, getDeviceInfo, getSecurityStorageKey } from '@/src/lib/security';
import type { SecuritySession, SecurityAuditLog } from '@/src/types/firestore';
import type { ReactNode } from 'react';

export type MaskingOptionKey = 'balances' | 'netWorth' | 'investments' | 'trading' | 'goals';
export type SessionTimeoutOption = '1' | '5' | '15' | '30' | 'never';

interface SecurityContextValue {
  locked: boolean;
  lockReason?: string;
  hasPin: boolean;
  appLockEnabled: boolean;
  pinLength: 4 | 6;
  privacyModeEnabled: boolean;
  sessionTimeout: SessionTimeoutOption;
  maskingOptions: Record<MaskingOptionKey, boolean>;
  failedAttempts: number;
  lockoutUntil: Date | null;
  currentSession: SecuritySession | null;
  recentSessions: SecuritySession[];
  auditLogs: SecurityAuditLog[];
  loading: boolean;
  setAppLockEnabled: (enabled: boolean) => void;
  setPinLength: (length: 4 | 6) => void;
  setSessionTimeout: (timeout: SessionTimeoutOption) => void;
  togglePrivacyMode: () => void;
  setMaskingOption: (option: MaskingOptionKey, value: boolean) => void;
  lockApp: (reason?: string) => void;
  unlockWithPin: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<boolean>;
  logoutOtherDevices: () => Promise<void>;
  refreshSecurityData: () => Promise<void>;
  createAuditEvent: (type: string, summary: string, details?: Record<string, any>) => Promise<void>;
  maskValue: (value: string | number | null | undefined) => string;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

const defaultMaskingOptions: Record<MaskingOptionKey, boolean> = {
  balances: true,
  netWorth: true,
  investments: true,
  trading: true,
  goals: true,
};

function readBooleanStorage(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(key);
  if (stored === null) return fallback;
  return stored === 'true';
}

function readStringStorage(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(key);
  return stored ?? fallback;
}

function readObjectStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persistStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
}

function persistBooleanStorage(key: string, value: boolean) {
  persistStorage(key, value ? 'true' : 'false');
}

export function SecurityProvider({ children }: { children: ReactNode }) {
  const auth = useAuthContext();
  const [locked, setLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | undefined>('Session locked');
  const [appLockEnabled, setAppLockEnabledState] = useState(true);
  const [pinLength, setPinLengthState] = useState<4 | 6>(4);
  const [privacyModeEnabled, setPrivacyModeState] = useState(false);
  const [sessionTimeout, setSessionTimeoutState] = useState<SessionTimeoutOption>('5');
  const [maskingOptions, setMaskingOptionsState] = useState<Record<MaskingOptionKey, boolean>>(defaultMaskingOptions);
  const [hasPin, setHasPin] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [currentSession, setCurrentSession] = useState<SecuritySession | null>(null);
  const [recentSessions, setRecentSessions] = useState<SecuritySession[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const deviceId = useMemo(() => getDeviceFingerprint(), []);
  const userId = auth.user?.uid;

  const refreshSecurityData = useCallback(async () => {
    if (!auth.initialized || !userId) return;
    try {
      const [sessions, audits] = await Promise.all([
        securityService.getSecuritySessions(userId, 12),
        securityService.getAuditLogs(userId, 20),
      ]);
      setRecentSessions(sessions ?? []);
      setAuditLogs(audits ?? []);
    } catch (error: any) {
      // Swallow permission/auth errors — safeFirestore already logged them
      if (error?.code !== 'permission-denied' && error?.code !== 'unauthenticated') {
        console.error('Error refreshing security data', error);
      }
    }
  }, [auth.initialized, userId]);

  const createAuditEvent = useCallback(
    async (eventType: string, summary: string, details: Record<string, any> = {}) => {
      if (!auth.initialized || !userId) return;
      try {
        const event = await securityService.logSecurityEvent(userId, {
          userId,
          eventType,
          summary,
          details,
        });
        setAuditLogs((prev) => [event, ...prev].slice(0, 20));

        // Propagate to centralized Audit Logs
        const isFailure = eventType.toLowerCase().includes('failed') || eventType.toLowerCase().includes('lockout');
        void auditService.logEvent(userId, {
          user: auth.user?.email || 'user@email.com',
          module: 'Security',
          action: summary,
          status: isFailure ? 'failure' : 'success',
          severity: 'security',
          metadata: { eventType, ...details },
        });
      } catch (error) {
        // Non-critical — don't crash the app for audit log failures
        console.warn('Failed to write audit event', error);
      }
    },
    [auth.initialized, userId, auth.user?.email]
  );

  const sendSecurityNotification = useCallback(
    async (title: string, message: string) => {
      if (!userId) return;
      try {
        await notificationsService.createNotification(userId, 'security', title, message, 'high', {
          category: 'security',
        });
      } catch (error) {
        console.error('Failed to send security notification', error);
      }
    },
    [userId]
  );

  const lockApp = useCallback(
    (reason?: string) => {
      if (!hasPin || !appLockEnabled) return;
      setLockReason(reason || 'Security lock required');
      setLocked(true);
      void createAuditEvent('app_lock', 'App locked', { reason });
    },
    [appLockEnabled, createAuditEvent, hasPin]
  );

  const unlockWithPin = useCallback(
    async (pin: string) => {
      if (lockoutUntil && lockoutUntil > new Date()) {
        return false;
      }
      const storedHash = typeof window !== 'undefined' ? window.localStorage.getItem(getSecurityStorageKey('PIN_HASH')) : null;
      if (!storedHash) return false;
      const enteredHash = await hashPin(pin);

      if (enteredHash === storedHash) {
        setLocked(false);
        setFailedAttempts(0);
        setLockoutUntil(null);
        lastActivityRef.current = Date.now();
        void createAuditEvent('unlock', 'App unlocked successfully', { deviceId });
        void sendSecurityNotification('App unlocked', 'Your PFOS session has been unlocked.');
        return true;
      }

      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          const timeout = new Date(Date.now() + 30_000);
          setLockoutUntil(timeout);
          setLockReason('Too many wrong PIN attempts');
          void createAuditEvent('lockout', 'Temporary lockout activated', { attempts: next });
        }
        return next;
      });

      return false;
    },
    [createAuditEvent, deviceId, lockoutUntil, sendSecurityNotification]
  );

  const setPin = useCallback(
    async (pin: string) => {
      if (!/^[0-9]+$/.test(pin) || (pin.length !== 4 && pin.length !== 6)) {
        return false;
      }
      const hash = await hashPin(pin);
      persistStorage(getSecurityStorageKey('PIN_HASH'), hash);
      persistStorage(getSecurityStorageKey('PIN_LENGTH'), pin.length.toString());
      persistBooleanStorage(getSecurityStorageKey('APP_LOCK_ENABLED'), true);
      setHasPin(true);
      setAppLockEnabledState(true);
      setPinLengthState(pin.length === 6 ? 6 : 4);
      setLocked(false);
      void createAuditEvent('pin_change', 'PIN lock configured', { length: pin.length });
      void sendSecurityNotification('PIN updated', 'Your PFOS PIN lock has been updated.');
      return true;
    },
    [createAuditEvent, sendSecurityNotification]
  );

  const setAppLockEnabled = useCallback(
    (enabled: boolean) => {
      persistBooleanStorage(getSecurityStorageKey('APP_LOCK_ENABLED'), enabled);
      setAppLockEnabledState(enabled);
      if (enabled && hasPin) {
        setLocked(true);
      }
      if (!enabled) {
        setLocked(false);
      }
    },
    [hasPin]
  );

  const setSessionTimeout = useCallback((timeout: SessionTimeoutOption) => {
    persistStorage(getSecurityStorageKey('SESSION_TIMEOUT'), timeout);
    setSessionTimeoutState(timeout);
  }, []);

  const togglePrivacyMode = useCallback(() => {
    const next = !privacyModeEnabled;
    persistBooleanStorage(getSecurityStorageKey('PRIVACY_MODE'), next);
    setPrivacyModeState(next);
    void createAuditEvent('privacy_mode', next ? 'Privacy mode enabled' : 'Privacy mode disabled');
    void sendSecurityNotification(next ? 'Privacy mode enabled' : 'Privacy mode disabled', 'Sensitive values will now be blurred.');
  }, [createAuditEvent, privacyModeEnabled, sendSecurityNotification]);

  const setMaskingOption = useCallback((option: MaskingOptionKey, value: boolean) => {
    const next = { ...maskingOptions, [option]: value };
    persistStorage(getSecurityStorageKey('MASKING_OPTIONS'), JSON.stringify(next));
    setMaskingOptionsState(next);
  }, [maskingOptions]);

  const logoutOtherDevices = useCallback(async () => {
    if (!userId) return;
    try {
      await securityService.logoutOtherSessions(userId, deviceId);
      await refreshSecurityData();
      await createAuditEvent('device_logout', 'Logged out from other devices', { currentDeviceId: deviceId });
      await sendSecurityNotification('Other sessions ended', 'Other active PFOS sessions were signed out.');
    } catch (error) {
      console.error('Failed to logout other devices', error);
    }
  }, [createAuditEvent, deviceId, refreshSecurityData, sendSecurityNotification, userId]);

  const maskValue = useCallback((value: string | number | null | undefined) => {
    if (!privacyModeEnabled) return String(value ?? '0');
    if (value === null || value === undefined) return '•••••';
    return '•••••';
  }, [privacyModeEnabled]);

  const registerCurrentSession = useCallback(async () => {
    if (!auth.initialized || !userId) return;
    try {
      const session: Omit<SecuritySession, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        securityType: 'session',
        enabled: true,
        lastUpdated: new Date(),
        deviceInfo: getDeviceInfo(),
        sessionStatus: 'active',
      };
      await securityService.registerSession(userId, deviceId, session);
      await refreshSecurityData();
    } catch (error) {
      // Non-critical — session registration failure should not crash the app
      console.warn('Failed to register session', error);
    }
  }, [auth.initialized, deviceId, refreshSecurityData, userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedPinHash = window.localStorage.getItem(getSecurityStorageKey('PIN_HASH'));
    const savedPinLength = Number(window.localStorage.getItem(getSecurityStorageKey('PIN_LENGTH'))) as 4 | 6;
    const savedAppLock = readBooleanStorage(getSecurityStorageKey('APP_LOCK_ENABLED'), true);
    const savedPrivacy = readBooleanStorage(getSecurityStorageKey('PRIVACY_MODE'), false);
    const savedTimeout = readStringStorage(getSecurityStorageKey('SESSION_TIMEOUT'), '5') as SessionTimeoutOption;
    const savedMasking = readObjectStorage<Record<MaskingOptionKey, boolean>>(getSecurityStorageKey('MASKING_OPTIONS'), defaultMaskingOptions);
    const savedFailed = Number(window.localStorage.getItem(getSecurityStorageKey('FAILED_ATTEMPTS'))) || 0;
    const savedLockoutString = window.localStorage.getItem(getSecurityStorageKey('LOCKOUT_UNTIL'));

    setHasPin(Boolean(savedPinHash));
    setPinLengthState(savedPinLength === 6 ? 6 : 4);
    setAppLockEnabledState(savedAppLock);
    setPrivacyModeState(savedPrivacy);
    setSessionTimeoutState(['1', '5', '15', '30', 'never'].includes(savedTimeout) ? savedTimeout : '5');
    setMaskingOptionsState(savedMasking);
    setFailedAttempts(savedFailed);
    setLockoutUntil(savedLockoutString ? new Date(savedLockoutString) : null);

    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth.initialized && auth.user && appLockEnabled && hasPin) {
      setLocked(true);
    }
  }, [appLockEnabled, auth.initialized, auth.user, hasPin]);

  useEffect(() => {
    if (!auth.initialized || !userId) return;
    registerCurrentSession();
  }, [auth.initialized, registerCurrentSession, userId]);

  useEffect(() => {
    if (!auth.initialized || !userId) return;
    void refreshSecurityData();
  }, [auth.initialized, refreshSecurityData, userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (locked) return;
    };

    const handleVisibilityChange = () => {
      if (document.hidden && appLockEnabled && hasPin) {
        lockApp('App minimized');
      }
    };

    const handleTimer = () => {
      if (locked || sessionTimeout === 'never') return;
      const timeoutMs = Number(sessionTimeout) * 60 * 1000;
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= timeoutMs && appLockEnabled && hasPin) {
        lockApp('Inactivity timeout');
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    inactivityTimer.current = window.setInterval(handleTimer, 5_000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimer.current) {
        window.clearInterval(inactivityTimer.current);
      }
    };
  }, [appLockEnabled, hasPin, lockApp, locked, sessionTimeout]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    persistStorage(getSecurityStorageKey('PIN_LENGTH'), pinLength.toString());
  }, [pinLength]);

  useEffect(() => {
    persistBooleanStorage(getSecurityStorageKey('APP_LOCK_ENABLED'), appLockEnabled);
  }, [appLockEnabled]);

  useEffect(() => {
    persistStorage(getSecurityStorageKey('SESSION_TIMEOUT'), sessionTimeout);
  }, [sessionTimeout]);

  useEffect(() => {
    persistBooleanStorage(getSecurityStorageKey('PRIVACY_MODE'), privacyModeEnabled);
  }, [privacyModeEnabled]);

  useEffect(() => {
    persistStorage(getSecurityStorageKey('MASKING_OPTIONS'), JSON.stringify(maskingOptions));
  }, [maskingOptions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(getSecurityStorageKey('FAILED_ATTEMPTS'), failedAttempts.toString());
    if (lockoutUntil) {
      window.localStorage.setItem(getSecurityStorageKey('LOCKOUT_UNTIL'), lockoutUntil.toISOString());
    }
  }, [failedAttempts, lockoutUntil]);

  const value = useMemo(
    () => ({
      locked,
      lockReason,
      hasPin,
      appLockEnabled,
      pinLength,
      privacyModeEnabled,
      sessionTimeout,
      maskingOptions,
      failedAttempts,
      lockoutUntil,
      currentSession,
      recentSessions,
      auditLogs,
      loading,
      setAppLockEnabled,
      setPinLength: setPinLengthState,
      setSessionTimeout,
      togglePrivacyMode,
      setMaskingOption,
      lockApp,
      unlockWithPin,
      setPin,
      logoutOtherDevices,
      refreshSecurityData,
      createAuditEvent,
      maskValue,
    }),
    [
      locked,
      lockReason,
      hasPin,
      appLockEnabled,
      pinLength,
      privacyModeEnabled,
      sessionTimeout,
      maskingOptions,
      failedAttempts,
      lockoutUntil,
      currentSession,
      recentSessions,
      auditLogs,
      loading,
      setAppLockEnabled,
      setPinLengthState,
      setSessionTimeout,
      togglePrivacyMode,
      setMaskingOption,
      lockApp,
      unlockWithPin,
      setPin,
      logoutOtherDevices,
      refreshSecurityData,
      createAuditEvent,
      maskValue,
    ]
  );

  return (
    <SecurityContext.Provider value={value}>
      {children}
      <SecurityLockScreen
        open={locked}
        pinLength={pinLength}
        failedAttempts={failedAttempts}
        lockoutUntil={lockoutUntil}
        onSubmit={unlockWithPin}
        onReset={() => setLocked(false)}
        message={lockReason}
      />
    </SecurityContext.Provider>
  );
}

export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
}
