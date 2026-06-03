import { collection, doc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { COLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, getDocsSafe, setDocSafe } from './safeFirestore';
import type { FamilyGroup, FamilyMember, SharedAccount } from '@/src/lib/family-finance';

function getCollection(name: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, name);
}

export class FamilyService {
  async createGroup(userId: string, group: FamilyGroup) {
    const now = new Date();
    const memberIds = (group.members || []).map((m) => m.id);
    const payload = { ...group, ownerId: userId, membersIds: memberIds, createdAt: Timestamp.fromDate(now), deletedAt: null } as any;
    const ref = getCollection(COLLECTIONS.FAMILY_GROUPS);
    const docRef = await addDocSafe(ref as any, payload as any);
    return { id: docRef?.id || '', ...payload };
  }

  async getUserGroups(userId: string) {
    try {
      const ref = getCollection(COLLECTIONS.FAMILY_GROUPS);
      const ownerSnap = await getDocsSafe(query(ref, where('ownerId', '==', userId), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(50)) as any);
      const memberSnap = await getDocsSafe(query(ref, where('membersIds', 'array-contains', userId), where('deletedAt', '==', null), orderBy('updatedAt', 'desc'), limit(50)) as any);
      const docs = [...ownerSnap.docs, ...memberSnap.docs];
      // de-dup by id
      const unique = new Map<string, any>();
      for (const d of docs) unique.set(d.id, { id: d.id, ...d.data() });
      return Array.from(unique.values());
    } catch (e) {
      console.error('FamilyService.getUserGroups', e);
      return [];
    }
  }

  async inviteMember(groupId: string, member: FamilyMember) {
    const ref = getCollection(COLLECTIONS.FAMILY_INVITES);
    return addDocSafe(ref as any, { groupId, member, createdAt: Timestamp.fromDate(new Date()) } as any);
  }

  async addSharedAccount(groupId: string, account: SharedAccount) {
    const ref = getCollection(COLLECTIONS.FAMILY_ACCOUNTS);
    return addDocSafe(ref as any, { groupId, ...account, createdAt: Timestamp.fromDate(new Date()) } as any);
  }

  async recordActivity(groupId: string, activity: any) {
    const ref = getCollection(COLLECTIONS.FAMILY_ACTIVITY_LOGS);
    return addDocSafe(ref as any, { groupId, ...activity, createdAt: Timestamp.fromDate(new Date()) } as any);
  }
}

export const familyService = new FamilyService();
