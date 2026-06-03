import { collection, doc, orderBy, query, limit, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, getDocsSafe, setDocSafe } from './safeFirestore';
import type { AssetRecord, LiabilityRecord } from '@/src/lib/asset-register';

function getCollection(name: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, name);
}

export class AssetService {
  async getAssets(userId: string) {
    try {
      const ref = getCollection(COLLECTIONS.ASSETS);
      const snap = await getDocsSafe(query(ref, where('userId', '==', userId), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(200)) as any);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('AssetService.getAssets', e);
      return [];
    }
  }

  async saveAsset(userId: string, assetId: string | null, asset: AssetRecord) {
    const now = new Date();
    const payload = { userId, ...asset, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), deletedAt: null } as any;
    const ref = getCollection(COLLECTIONS.ASSETS);
    if (assetId) {
      const d = doc(ref, assetId);
      await setDocSafe(d as any, payload as any, { merge: true });
      return { id: assetId, ...payload };
    }
    const docRef = await addDocSafe(ref as any, payload as any);
    return { id: docRef?.id || '', ...payload };
  }

  async getLiabilities(userId: string) {
    try {
      const ref = getCollection(COLLECTIONS.LIABILITIES);
      const snap = await getDocsSafe(query(ref, where('userId', '==', userId), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(200)) as any);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('AssetService.getLiabilities', e);
      return [];
    }
  }

  async saveLiability(userId: string, liabilityId: string | null, liability: LiabilityRecord) {
    const now = new Date();
    const payload = { userId, ...liability, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now), deletedAt: null } as any;
    const ref = getCollection(COLLECTIONS.LIABILITIES);
    if (liabilityId) {
      const d = doc(ref, liabilityId);
      await setDocSafe(d as any, payload as any, { merge: true });
      return { id: liabilityId, ...payload };
    }
    const docRef = await addDocSafe(ref as any, payload as any);
    return { id: docRef?.id || '', ...payload };
  }

  async recordValuation(assetId: string, valuation: { value: number; date?: Date; source?: string }) {
    const ref = getCollection(COLLECTIONS.VALUATION_HISTORY);
    const now = new Date();
    return addDocSafe(ref as any, { assetId, value: valuation.value, date: valuation.date ? Timestamp.fromDate(valuation.date) : Timestamp.fromDate(now), source: valuation.source || null, createdAt: Timestamp.fromDate(now) } as any);
  }

  async snapshotAllocation(userId: string, snapshot: any) {
    const ref = getCollection(COLLECTIONS.ALLOCATION_SNAPSHOTS);
    const now = new Date();
    return addDocSafe(ref as any, { userId, snapshot, createdAt: Timestamp.fromDate(now) } as any);
  }
}

export const assetService = new AssetService();
