import { collection, doc, orderBy, query, limit, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, getDocsSafe, setDocSafe } from './safeFirestore';

function getCollection(name: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not available');
  return collection(db, name);
}

export class TaxPlannerService {
  async getTaxProfiles(userId: string) {
    try {
      const ref = getCollection(COLLECTIONS.TAX_PROFILES);
      const snap = await getDocsSafe(query(ref, where('userId', '==', userId), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(20)));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('getTaxProfiles', e);
      return [];
    }
  }

  async saveTaxReport(userId: string, reportId: string | null, payload: any) {
    const now = new Date();
    const docPayload = { userId, ...payload, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), deletedAt: null };
    const ref = getCollection(COLLECTIONS.TAX_REPORTS);
    if (reportId) {
      const d = doc(ref, reportId);
      await setDocSafe(d as any, docPayload as any, { merge: true });
      return { id: reportId, ...docPayload };
    }
    const r = await addDocSafe(ref as any, docPayload as any);
    return { id: r?.id || '', ...docPayload };
  }

  async saveDeduction(userId: string, deduction: any) {
    const ref = getCollection(COLLECTIONS.DEDUCTIONS);
    return addDocSafe(ref as any, { userId, ...deduction, createdAt: Timestamp.fromDate(new Date()) });
  }

  async saveCapitalGain(userId: string, gain: any) {
    const ref = getCollection(COLLECTIONS.CAPITAL_GAINS);
    return addDocSafe(ref as any, { userId, ...gain, createdAt: Timestamp.fromDate(new Date()) });
  }
}

export const taxPlannerService = new TaxPlannerService();
