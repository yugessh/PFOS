import { getAuthSafe } from '@/src/firebase/firebase';
import { CollectionReference, DocumentReference, Query, DocumentData, QuerySnapshot, DocumentSnapshot } from 'firebase/firestore';
import { addDoc, getDocs, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

/**
 * Set of Firestore error codes that indicate auth/permission issues
 * rather than data corruption or bugs. These are handled gracefully
 * to prevent app crashes when auth state is in transition.
 */
const PERMISSION_ERROR_CODES = new Set([
  'permission-denied',
  'unauthenticated',
  'not-found',
]);

/**
 * Tracks which operation+path combos have already been logged to avoid
 * spamming the console with the same error repeatedly (e.g. during
 * rapid re-renders or polling).
 */
const _loggedErrors = new Set<string>();
const _errorBackoffUntil = new Map<string, number>();

function getCurrentUid() {
  try {
    const auth = getAuthSafe();
    return auth?.currentUser?.uid ?? null;
  } catch {
    return null;
  }
}

export function sanitizeFirestoreData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeFirestoreData(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    const sanitizedEntries = Object.entries(value as Record<string, unknown>)
      .map(([key, entryValue]) => [key, sanitizeFirestoreData(entryValue)] as const)
      .filter(([, entryValue]) => entryValue !== undefined);
    return Object.fromEntries(sanitizedEntries) as T;
  }

  return (value === undefined ? undefined : value) as T;
}

/**
 * Returns true if the error represents a recoverable Firestore
 * permission / auth issue that should return an empty result set
 * instead of crashing the caller.
 */
function isPermissionError(error: any): boolean {
  const code = error?.code as string | undefined;
  if (code && PERMISSION_ERROR_CODES.has(code)) return true;
  // Firebase sometimes wraps the code inside the message
  const msg = (error?.message || String(error)).toLowerCase();
  return msg.includes('permission') || msg.includes('unauthenticated') || msg.includes('missing or insufficient');
}

function isMissingIndexError(error: any): boolean {
  const code = error?.code as string | undefined;
  const msg = (error?.message || String(error)).toLowerCase();
  return code === 'failed-precondition' && msg.includes('index');
}

function isInvalidArgumentError(error: any): boolean {
  const code = error?.code as string | undefined;
  const msg = (error?.message || String(error)).toLowerCase();
  return code === 'invalid-argument' || msg.includes('invalid argument') || msg.includes('unsupported field value');
}

function isOfflineError(error: any): boolean {
  const code = error?.code as string | undefined;
  const msg = (error?.message || String(error)).toLowerCase();
  return code === 'unavailable' || code === 'deadline-exceeded' || msg.includes('offline') || msg.includes('network');
}

/**
 * Log a Firestore error once per operation+path combo per session.
 * Returns `true` if the error is a permission error that was handled
 * (caller should return empty/fallback). Returns `false` if the error
 * is unexpected and should be re-thrown.
 */
function handleFirestoreError(operation: string, path: string | undefined, error: any): boolean {
  const key = `${operation}:${path ?? 'unknown'}:${error?.code ?? 'unknown'}`;
  const isPermErr = isPermissionError(error);
  const isExpected =
    isPermErr ||
    isMissingIndexError(error) ||
    isInvalidArgumentError(error) ||
    isOfflineError(error);
  const now = Date.now();
  const nextAllowedLog = _errorBackoffUntil.get(key) ?? 0;

  if (!isExpected && !_loggedErrors.has(key)) {
    _loggedErrors.add(key);
    const uid = getCurrentUid();
    console.warn(
      '[Firestore][Error]',
      { operation, path, uid, code: error?.code, message: error?.message || String(error) }
    );
  } else if (!isExpected && now >= nextAllowedLog) {
    _errorBackoffUntil.set(key, now + 30000);
  }

  return isExpected;
}

// ────────────────────────────────────────────────────────────────
// Empty snapshot stub returned when a read query hits a permission
// error. This lets callers safely do `snapshot.docs.map(…)` without
// null-checks everywhere.
// ────────────────────────────────────────────────────────────────
const EMPTY_QUERY_SNAPSHOT = {
  docs: [] as any[],
  empty: true,
  size: 0,
  forEach: () => {},
  metadata: { fromCache: true, hasPendingWrites: false, isEqual: () => false },
} as unknown as QuerySnapshot<DocumentData>;

export async function addDocSafe(colRef: CollectionReference<DocumentData>, data: DocumentData) {
  try {
    return await addDoc(colRef, sanitizeFirestoreData(data));
  } catch (error) {
    if (handleFirestoreError('addDoc', (colRef as any)?.path, error)) {
      return undefined;
    }
    throw error;
  }
}

export async function getDocsSafe(queryRef: Query): Promise<QuerySnapshot<DocumentData>> {
  try {
    return await getDocs(queryRef);
  } catch (error) {
    if (handleFirestoreError('getDocs', (queryRef as any)?.path || undefined, error)) {
      return EMPTY_QUERY_SNAPSHOT;
    }
    throw error;
  }
}

export async function getDocSafe(docRef: DocumentReference<DocumentData>): Promise<DocumentSnapshot<DocumentData>> {
  try {
    return await getDoc(docRef);
  } catch (error) {
    if (handleFirestoreError('getDoc', (docRef as any)?.path, error)) {
      // Return a minimal non-existing document stub
      return {
        exists: () => false,
        data: () => undefined,
        id: docRef.id,
        ref: docRef,
        metadata: { fromCache: true, hasPendingWrites: false, isEqual: () => false },
        get: () => undefined,
      } as unknown as DocumentSnapshot<DocumentData>;
    }
    throw error;
  }
}

export async function updateDocSafe(docRef: DocumentReference<DocumentData>, data: Partial<DocumentData>) {
  try {
    return await updateDoc(docRef, sanitizeFirestoreData(data as DocumentData));
  } catch (error) {
    if (handleFirestoreError('updateDoc', (docRef as any)?.path, error)) {
      return undefined;
    }
    throw error;
  }
}

export async function deleteDocSafe(docRef: DocumentReference<DocumentData>) {
  try {
    return await deleteDoc(docRef);
  } catch (error) {
    if (handleFirestoreError('deleteDoc', (docRef as any)?.path, error)) {
      return undefined;
    }
    throw error;
  }
}

export async function setDocSafe(docRef: DocumentReference<DocumentData>, data: DocumentData, options?: { merge?: boolean }) {
  try {
    const sanitized = sanitizeFirestoreData(data);
    return options ? await setDoc(docRef, sanitized, options) : await setDoc(docRef, sanitized);
  } catch (error) {
    if (handleFirestoreError('setDoc', (docRef as any)?.path, error)) {
      return undefined;
    }
    throw error;
  }
}
