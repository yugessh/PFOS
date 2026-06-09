import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreSafe } from '@/src/firebase/firebase';
import { SUBCOLLECTIONS } from '@/src/constants/collections';
import { addDocSafe, getDocsSafe, updateDocSafe, deleteDocSafe } from '@/src/services/firestore/safeFirestore';

export interface ScheduledReport {
  id?: string;
  userId?: string;
  name: string;
  type: string;
  filters?: Record<string, any>;
  cadence: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastRun?: any;
  nextRun?: any;
  createdAt?: any;
}

const collectionPath = (uid: string) => SUBCOLLECTIONS.USER_SCHEDULED_REPORTS(uid);

export async function addScheduledReport(uid: string, payload: Partial<ScheduledReport>) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const colRef = collection(db, collectionPath(uid));
  const data = {
    userId: uid,
    name: payload.name || 'Scheduled Report',
    type: payload.type || 'monthly',
    filters: payload.filters || {},
    cadence: payload.cadence || 'monthly',
    createdAt: serverTimestamp(),
  } as any;
  return addDocSafe(colRef, data as any);
}

export async function getScheduledReports(uid: string) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const colRef = collection(db, collectionPath(uid));
  const snap = await getDocsSafe(colRef);
  if (!snap) return [];
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data?.() ?? d.data) }));
}

export async function updateScheduledReport(uid: string, id: string, updates: Partial<ScheduledReport>) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, `${collectionPath(uid)}/${id}`);
  return updateDocSafe(docRef, updates as any);
}

export async function deleteScheduledReport(uid: string, id: string) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, `${collectionPath(uid)}/${id}`);
  return deleteDocSafe(docRef);
}

export const reportsService = {
  addScheduledReport,
  getScheduledReports,
  updateScheduledReport,
  deleteScheduledReport,
};

export default reportsService;
