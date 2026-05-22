import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreSafe } from '@/src/firebase/firebase';
import {
  addDocSafe,
  getDocsSafe,
  getDocSafe,
  updateDocSafe,
  deleteDocSafe,
} from '@/src/services/firestore/safeFirestore';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface DashboardWidgetRecord {
  id?: string;
  userId?: string;
  widgetType: string;
  position: number;
  size: WidgetSize;
  visible: boolean;
  pinned?: boolean;
  collapsed?: boolean;
  settings?: Record<string, any>;
  createdAt?: any;
}

const collectionPathFor = (uid: string) => `users/${uid}/dashboardWidgets`;

export async function getWidgets(uid: string) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const colRef = collection(db, collectionPathFor(uid));
  const snap = await getDocsSafe(colRef);
  if (!snap) return [] as DashboardWidgetRecord[];
  return snap.docs.map((d: any) => ({ id: d.id, ...(d.data?.() ?? d.data) })) as DashboardWidgetRecord[];
}

export async function addWidget(uid: string, widget: Partial<DashboardWidgetRecord>) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const colRef = collection(db, collectionPathFor(uid));
  const payload = {
    userId: uid,
    widgetType: widget.widgetType || 'custom',
    position: widget.position ?? Date.now(),
    size: widget.size || 'medium',
    visible: widget.visible ?? true,
    pinned: widget.pinned ?? false,
    collapsed: widget.collapsed ?? false,
    settings: widget.settings || {},
    createdAt: serverTimestamp(),
  } as any;

  const res = await addDocSafe(colRef, payload);
  return res;
}

export async function updateWidget(uid: string, docId: string, updates: Partial<DashboardWidgetRecord>) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, `${collectionPathFor(uid)}/${docId}`);
  const payload: any = { ...updates };
  // Avoid sending undefined
  if (payload.createdAt === undefined) delete payload.createdAt;
  if (Object.keys(payload).length === 0) return null;
  if (!payload.updatedAt) payload.updatedAt = serverTimestamp();
  return updateDocSafe(docRef, payload as any);
}

export async function deleteWidget(uid: string, docId: string) {
  const db = getFirestoreSafe();
  if (!db) throw new Error('Firestore not initialized');
  const docRef = doc(db, `${collectionPathFor(uid)}/${docId}`);
  return deleteDocSafe(docRef);
}

export const dashboardService = {
  getWidgets,
  addWidget,
  updateWidget,
  deleteWidget,
};

export default dashboardService;
