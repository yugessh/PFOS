import { getAuthSafe } from '@/src/firebase/firebase';
import { CollectionReference, DocumentReference, Query, DocumentData, QuerySnapshot, DocumentSnapshot } from 'firebase/firestore';
import { addDoc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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

function getCurrentUid() {
  try {
    const auth = getAuthSafe();
    return auth?.currentUser?.uid ?? null;
  } catch {
    return null;
  }
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

/**
 * Log a Firestore error once per operation+path combo per session.
 * Returns `true` if the error is a permission error that was handled
 * (caller should return empty/fallback). Returns `false` if the error
 * is unexpected and should be re-thrown.
 */
function handleFirestoreError(operation: string, path: string | undefined, error: any): boolean {
  const key = `${operation}:${path ?? 'unknown'}:${error?.code ?? 'unknown'}`;
  const isPermErr = isPermissionError(error);

  if (!_loggedErrors.has(key)) {
    _loggedErrors.add(key);
    const uid = getCurrentUid();
    // eslint-disable-next-line no-console
    console.warn(
      `[Firestore][${isPermErr ? 'Permission' : 'Error'}]`,
      { operation, path, uid, code: error?.code, message: error?.message || String(error) }
    );
  }

  return isPermErr;
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
    return await addDoc(colRef, data);
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
    return await updateDoc(docRef, data as DocumentData);
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
