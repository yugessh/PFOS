import { collection, doc, orderBy, query, limit, where, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/constants/collections';
import { getAuthSafe } from '@/src/firebase/firebase';
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

  async getValuationHistory(assetId: string) {
    try {
      const ref = getCollection(COLLECTIONS.VALUATION_HISTORY);
      const snap = await getDocsSafe(query(ref, where('assetId', '==', assetId), orderBy('date', 'desc'), limit(100)) as any);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('AssetService.getValuationHistory', e);
      return [];
    }
  }

  async addAttachmentToAsset(assetId: string, attachmentUrl: string) {
    try {
      const ref = getCollection(COLLECTIONS.ASSETS);
      const docRef = doc(ref, assetId);
      // merge append
      await setDocSafe(docRef as any, { attachments: (await this.getAssetAttachments(assetId)).concat([attachmentUrl]) } as any, { merge: true });
      return true;
    } catch (e) {
      console.error('AssetService.addAttachmentToAsset', e);
      return false;
    }
  }

  async getAssetAttachments(assetId: string) {
    try {
      const ref = getCollection(COLLECTIONS.ASSETS);
      const d = await getDocsSafe(query(ref, where('id', '==', assetId), limit(1)) as any);
      // fallback to direct doc read
      const snap = d.docs[0];
      if (!snap) return [];
      const data = snap.data();
      return (data.attachments || []) as string[];
    } catch (e) {
      try {
        const ref = getCollection(COLLECTIONS.ASSETS);
        const docRef = doc(ref, assetId);
        const docSnap = await getDocsSafe(query(ref, where('id', '==', assetId), limit(1)) as any);
        return [];
      } catch (_) {
        return [];
      }
    }
  }

  async snapshotAllocation(userId: string, snapshot: any) {
    const ref = getCollection(COLLECTIONS.ALLOCATION_SNAPSHOTS);
    const now = new Date();
    const r = await addDocSafe(ref as any, { userId, snapshot, createdAt: Timestamp.fromDate(now) } as any);
    // also create a net worth snapshot in NET_WORTH_SNAPSHOTS
    try {
      const assets = await this.getAssets(userId);
      const liabilities = await this.getLiabilities(userId);
      const totals = { assets: assets.map((a: any) => ({ id: a.id, currentValue: a.currentValue })), liabilities: liabilities.map((l: any) => ({ id: l.id, outstandingAmount: l.outstandingAmount })) };
      const nwRef = getCollection(COLLECTIONS.NET_WORTH_SNAPSHOTS);
      await addDocSafe(nwRef as any, { userId, totals, snapshot, createdAt: Timestamp.fromDate(now) } as any);
    } catch (e) {
      // non-fatal
      // eslint-disable-next-line no-console
      console.warn('Failed to write net worth snapshot:', e);
    }
    return r;
  }

  async getSharedAccounts(groupId: string) {
    try {
      const ref = getCollection(COLLECTIONS.FAMILY_ACCOUNTS);
      const snap = await getDocsSafe(query(ref, where('groupId', '==', groupId), where('deletedAt', '==', null), orderBy('createdAt', 'desc'), limit(100)) as any);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('AssetService.getSharedAccounts', e);
      return [];
    }
  }
}

export const assetService = new AssetService();
