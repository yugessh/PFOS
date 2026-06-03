import { collection, limit, orderBy, query, Timestamp } from 'firebase/firestore';
import { SUBCOLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, getDocsSafe } from './safeFirestore';

export interface SavedSearchRecord {
  id?: string;
  userId: string;
  query: string;
  label?: string;
  pinned?: boolean;
  favorite?: boolean;
  lastUsedAt?: Date;
  createdAt?: Date;
}

export interface CommandUsageRecord {
  id?: string;
  userId: string;
  commandId: string;
  commandLabel: string;
  createdAt?: Date;
}

function getCollection(path: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, path);
}

function toDate(value: any) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  return new Date(value);
}

export class SearchService {
  async saveSearch(userId: string, queryText: string, meta?: Partial<SavedSearchRecord>) {
    const ref = getCollection(SUBCOLLECTIONS.USER_SEARCH_HISTORY(userId));
    const now = Timestamp.fromDate(new Date());
    return addDocSafe(ref as any, {
      userId,
      query: queryText,
      label: meta?.label || queryText,
      pinned: Boolean(meta?.pinned),
      favorite: Boolean(meta?.favorite),
      lastUsedAt: now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as any);
  }

  async pinSearch(userId: string, queryText: string, meta?: Partial<SavedSearchRecord>) {
    const ref = getCollection(SUBCOLLECTIONS.USER_SAVED_SEARCHES(userId));
    const now = Timestamp.fromDate(new Date());
    return addDocSafe(ref as any, {
      userId,
      query: queryText,
      label: meta?.label || queryText,
      pinned: true,
      favorite: Boolean(meta?.favorite ?? true),
      lastUsedAt: now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as any);
  }

  async recordCommandUsage(userId: string, commandId: string, commandLabel: string) {
    const ref = getCollection(SUBCOLLECTIONS.USER_COMMAND_USAGE(userId));
    const now = Timestamp.fromDate(new Date());
    return addDocSafe(ref as any, {
      userId,
      commandId,
      commandLabel,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as any);
  }

  async getSavedSearches(userId: string): Promise<SavedSearchRecord[]> {
    try {
      const ref = getCollection(SUBCOLLECTIONS.USER_SAVED_SEARCHES(userId));
      const snapshot = await getDocsSafe(query(ref, orderBy('lastUsedAt', 'desc'), limit(12)) as any);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() || {};
        return {
          id: docSnap.id,
          userId: String(data.userId || userId),
          query: String(data.query || ''),
          label: String(data.label || data.query || ''),
          pinned: Boolean(data.pinned),
          favorite: Boolean(data.favorite),
          lastUsedAt: toDate(data.lastUsedAt),
          createdAt: toDate(data.createdAt),
        };
      });
    } catch (error) {
      console.error('SearchService.getSavedSearches', error);
      return [];
    }
  }

  async getRecentSearches(userId: string): Promise<SavedSearchRecord[]> {
    try {
      const ref = getCollection(SUBCOLLECTIONS.USER_SEARCH_HISTORY(userId));
      const snapshot = await getDocsSafe(query(ref, orderBy('lastUsedAt', 'desc'), limit(12)) as any);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() || {};
        return {
          id: docSnap.id,
          userId: String(data.userId || userId),
          query: String(data.query || ''),
          label: String(data.label || data.query || ''),
          pinned: Boolean(data.pinned),
          favorite: Boolean(data.favorite),
          lastUsedAt: toDate(data.lastUsedAt),
          createdAt: toDate(data.createdAt),
        };
      });
    } catch (error) {
      console.error('SearchService.getRecentSearches', error);
      return [];
    }
  }

  async getCommandUsage(userId: string): Promise<CommandUsageRecord[]> {
    try {
      const ref = getCollection(SUBCOLLECTIONS.USER_COMMAND_USAGE(userId));
      const snapshot = await getDocsSafe(query(ref, orderBy('createdAt', 'desc'), limit(20)) as any);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() || {};
        return {
          id: docSnap.id,
          userId: String(data.userId || userId),
          commandId: String(data.commandId || ''),
          commandLabel: String(data.commandLabel || ''),
          createdAt: toDate(data.createdAt),
        };
      });
    } catch (error) {
      console.error('SearchService.getCommandUsage', error);
      return [];
    }
  }
}

export const searchService = new SearchService();
