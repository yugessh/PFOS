import { collection, doc, orderBy, query, limit, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, getDocsSafe, setDocSafe } from './safeFirestore';
import type {
  RetirementInput,
  RetirementResult,
  FIREInput,
  FIREResult,
  ProjectionResult,
  AIRecommendation,
} from '@/src/lib/wealth-planner';

function toFirestoreDate(value: Date | null | undefined): Timestamp | null {
  if (!value) return null;
  return value instanceof Timestamp ? value : Timestamp.fromDate(value);
}

function normalizePlan(docSnap: any) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    userId: String(data.userId || ''),
    name: String(data.name || ''),
    type: String(data.type || 'retirement'),
    input: data.input || {},
    result: data.result || {},
    createdAt: data.createdAt ? new Date(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt) : new Date(),
  };
}

function getPlanCollection() {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, COLLECTIONS.RETIREMENT_PLANS);
}

export class WealthPlannerService {
  async getPlans(userId: string) {
    try {
      const ref = getPlanCollection();
      const snap = await getDocsSafe(query(ref, where('userId', '==', userId), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(50)));
      return snap.docs.map((d) => normalizePlan(d));
    } catch (e) {
      console.error('WealthPlannerService.getPlans error', e);
      return [];
    }
  }

  async savePlan(userId: string, planId: string | null, name: string, type: string, input: RetirementInput | FIREInput, result: RetirementResult | FIREResult | ProjectionResult | any, ai?: AIRecommendation[]) {
    const now = new Date();
    const payload = {
      userId,
      name,
      type,
      input,
      result,
      ai: ai || [],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      deletedAt: null,
    } as any;

    const ref = getPlanCollection();
    if (planId) {
      const d = doc(ref, planId);
      await setDocSafe(d as any, payload as any, { merge: true });
      return { id: planId, ...payload };
    }

    const docRef = await addDocSafe(ref as any, payload as any);
    return { id: docRef?.id || '', ...payload };
  }
}

export const wealthPlannerService = new WealthPlannerService();
