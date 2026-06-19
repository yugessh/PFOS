import { collection, doc, query, where, orderBy, limit, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getDocsSafe, updateDocSafe } from './safeFirestore';
import { getFirestoreClient } from './firebaseClient';
import { getAuthSafe } from '@/src/firebase/firebase';
import { COLLECTIONS, SUBCOLLECTIONS } from '@/src/constants/collections';
import type { SecuritySession, SecurityAuditLog } from '@/src/types/firestore';
import { mapSecurityAuditLog, mapSecuritySession, getDeviceInfo } from '@/src/lib/security';

/**
 * Verify that the given userId matches the currently authenticated user.
 * Prevents queries with stale/undefined UIDs and ensures Firestore rules
 * will be satisfied.
 */
function assertAuthenticatedUser(userId: string | undefined | null): asserts userId is string {
  if (!userId) {
    throw new Error('[SecurityService] Cannot perform operation: userId is missing or undefined');
  }
  const auth = getAuthSafe();
  const currentUid = auth?.currentUser?.uid;
  if (!currentUid) {
    throw new Error('[SecurityService] Cannot perform operation: user is not authenticated');
  }
  if (currentUid !== userId) {
    throw new Error('[SecurityService] Cannot perform operation: userId does not match authenticated user');
  }
}

export class SecurityService {
  async registerSession(userId: string, sessionId: string, sessionData: Omit<SecuritySession, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecuritySession> {
    const db = getFirestoreClient();
    if (!db) throw new Error('Firestore client not available');
    assertAuthenticatedUser(userId);

    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SECURITY_SESSIONS, sessionId);
    const now = Timestamp.now();
    const payload = {
      ...sessionData,
      userId, // Ensure userId is always stored in the document
      deviceInfo: sessionData.deviceInfo || getDeviceInfo(),
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, payload, { merge: true });

    return {
      id: sessionId,
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }

  async getSecuritySessions(userId: string, limitCount = 20): Promise<SecuritySession[]> {
    const db = getFirestoreClient();
    if (!db) return [];

    assertAuthenticatedUser(userId);

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_SESSIONS(userId));
    const q = query(colRef, orderBy('updatedAt', 'desc'), limit(limitCount));
    const snapshot = await getDocsSafe(q as any);

    if (!snapshot || !snapshot.docs) return [];
    return snapshot.docs.map((docSnap) => mapSecuritySession({ id: docSnap.id, ...docSnap.data() }));
  }

  async logoutOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    const db = getFirestoreClient();
    if (!db) return;

    assertAuthenticatedUser(userId);

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_SESSIONS(userId));
    const q = query(colRef, where('sessionStatus', '==', 'active'));
    const snapshot = await getDocsSafe(q as any);

    if (!snapshot || !snapshot.docs) return;

    const updates = snapshot.docs
      .filter((docSnap) => docSnap.id !== currentSessionId)
      .map((docSnap) => updateDocSafe(docSnap.ref, {
        sessionStatus: 'revoked',
        updatedAt: Timestamp.now(),
      }));

    await Promise.all(updates);
  }

  async getAuditLogs(userId: string, limitCount = 50): Promise<SecurityAuditLog[]> {
    const db = getFirestoreClient();
    if (!db) return [];

    assertAuthenticatedUser(userId);

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_AUDIT_LOGS(userId));
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocsSafe(q as any);

    if (!snapshot || !snapshot.docs) return [];
    return snapshot.docs.map((docSnap) => mapSecurityAuditLog({ id: docSnap.id, ...docSnap.data() }));
  }

  async logSecurityEvent(userId: string, event: Omit<SecurityAuditLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityAuditLog> {
    const db = getFirestoreClient();
    if (!db) throw new Error('Firestore client not available');

    assertAuthenticatedUser(userId);

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_AUDIT_LOGS(userId));
    const now = Timestamp.now();
    const docRef = doc(colRef);
    await setDoc(docRef, {
      ...event,
      userId, // Ensure userId is always in the document
      createdAt: now,
      updatedAt: now,
    });

    return {
      id: docRef.id,
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }
}

export const securityService = new SecurityService();