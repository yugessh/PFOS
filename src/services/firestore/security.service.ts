import { collection, doc, query, where, orderBy, limit, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getDocsSafe, updateDocSafe } from './safeFirestore';
import { getFirestoreClient } from './firebaseClient';
import { COLLECTIONS, SUBCOLLECTIONS } from '@/src/constants/collections';
import type { SecuritySession, SecurityAuditLog } from '@/src/types/firestore';
import { mapSecurityAuditLog, mapSecuritySession } from '@/src/lib/security';

export class SecurityService {
  async registerSession(userId: string, sessionId: string, sessionData: Omit<SecuritySession, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecuritySession> {
    const db = getFirestoreClient();
    if (!db) throw new Error('Firestore client not available');

    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SECURITY_SESSIONS, sessionId);
    const now = Timestamp.now();
    const payload = {
      ...sessionData,
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
    if (!db) throw new Error('Firestore client not available');

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_SESSIONS(userId));
    const q = query(colRef, orderBy('updatedAt', 'desc'), limit(limitCount));
    const snapshot = await getDocsSafe(q as any);

    return snapshot.docs.map((docSnap) => mapSecuritySession({ id: docSnap.id, ...docSnap.data() }));
  }

  async logoutOtherSessions(userId: string, currentSessionId: string): Promise<void> {
    const db = getFirestoreClient();
    if (!db) throw new Error('Firestore client not available');

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_SESSIONS(userId));
    const q = query(colRef, where('sessionStatus', '==', 'active'));
    const snapshot = await getDocsSafe(q as any);
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
    if (!db) throw new Error('Firestore client not available');

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_AUDIT_LOGS(userId));
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocsSafe(q as any);

    return snapshot.docs.map((docSnap) => mapSecurityAuditLog({ id: docSnap.id, ...docSnap.data() }));
  }

  async logSecurityEvent(userId: string, event: Omit<SecurityAuditLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityAuditLog> {
    const db = getFirestoreClient();
    if (!db) throw new Error('Firestore client not available');

    const colRef = collection(db, SUBCOLLECTIONS.USER_SECURITY_AUDIT_LOGS(userId));
    const now = Timestamp.now();
    const docRef = doc(colRef);
    await setDoc(docRef, {
      ...event,
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