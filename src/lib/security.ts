import { SecuritySession, SecurityAuditLog } from '@/src/types/firestore';

const STORAGE_KEYS = {
  PIN_HASH: 'pfos_security_pin_hash',
  PIN_LENGTH: 'pfos_security_pin_length',
  APP_LOCK_ENABLED: 'pfos_security_app_lock_enabled',
  PRIVACY_MODE: 'pfos_security_privacy_mode',
  MASKING_OPTIONS: 'pfos_security_masking_options',
  SESSION_TIMEOUT: 'pfos_security_session_timeout',
  DEVICE_ID: 'pfos_security_device_id',
  FAILED_ATTEMPTS: 'pfos_security_failed_attempts',
  LOCKOUT_UNTIL: 'pfos_security_lockout_until',
};

export function getSecurityStorageKey(key: keyof typeof STORAGE_KEYS) {
  return STORAGE_KEYS[key];
}

export function maskSensitiveValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return '••••••';
  return '••••••';
}

export function formatDeviceLabel(deviceInfo: string) {
  if (!deviceInfo) return 'Unknown device';
  return deviceInfo.split(';')[0] || deviceInfo;
}

export async function hashPin(pin: string) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return `fallback-${btoa(pin)}`;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`pfos-${pin}-secure`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getDeviceFingerprint() {
  if (typeof window === 'undefined') return 'unknown-device';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (stored) return stored;
    const id = crypto?.randomUUID?.() || `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    return id;
  } catch {
    return `device_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function getDeviceInfo() {
  if (typeof window === 'undefined') return 'Unknown device';
  const agent = navigator.userAgent || 'Unknown agent';
  const platform = navigator.platform || 'Unknown platform';
  return `${platform}; ${agent}`;
}

export function mapSecuritySession(session: any): SecuritySession {
  return {
    id: session.id,
    userId: session.userId,
    securityType: session.securityType,
    enabled: session.enabled,
    lastUpdated: session.lastUpdated?.toDate?.() || new Date(session.lastUpdated || Date.now()),
    deviceInfo: session.deviceInfo,
    sessionStatus: session.sessionStatus,
    createdAt: session.createdAt?.toDate?.() || new Date(session.createdAt || Date.now()),
    updatedAt: session.updatedAt?.toDate?.() || new Date(session.updatedAt || Date.now()),
    deletedAt: session.deletedAt?.toDate?.() || null,
  };
}

export function mapSecurityAuditLog(entry: any): SecurityAuditLog {
  return {
    id: entry.id,
    userId: entry.userId,
    eventType: entry.eventType,
    summary: entry.summary,
    details: entry.details,
    createdAt: entry.createdAt?.toDate?.() || new Date(entry.createdAt || Date.now()),
    updatedAt: entry.updatedAt?.toDate?.() || new Date(entry.updatedAt || Date.now()),
    deletedAt: entry.deletedAt?.toDate?.() || null,
  };
}
