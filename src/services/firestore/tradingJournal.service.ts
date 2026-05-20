import { getFirestoreClient } from './firebaseClient';
import { SUBCOLLECTIONS, COLLECTIONS } from '@/src/constants/collections';
import {
  collection as firestoreCollection,
  addDoc,
  serverTimestamp,
  DocumentData,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';

export interface TradeRecord {
  id?: string;
  userId: string;
  // existing shorthand
  pair: string;
  buyPrice: number;
  sellPrice?: number | null;
  quantity: number;
  pnl?: number | null;
  strategy?: string | null;
  notes?: string | null;
  screenshots?: string[] | null;
  date: any;
  createdAt?: any;
  updatedAt?: any;
  deletedAt?: any;

  // extended schema
  assetName?: string | null;
  marketType?: string | null; // e.g., crypto, stocks, forex, options
  direction?: 'LONG' | 'SHORT' | null;
  entryPrice?: number | null;
  exitPrice?: number | null;
  fees?: number | null;
  emotion?: string | null; // emotion tag
  riskReward?: number | null;
  holdingDurationMinutes?: number | null;
}

export class TradingJournalService {
  async createTrade(userId: string, data: Partial<TradeRecord>) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };

    const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_TRADING_JOURNAL(userId)) as any;
    const prepared: DocumentData = {
      ...data,
      userId,
      // keep backward-compatible fields
      pnl: data.pnl ?? null,
      screenshots: data.screenshots ?? null,
      // extended fields
      assetName: data.assetName ?? data.pair ?? null,
      marketType: data.marketType ?? null,
      direction: data.direction ?? null,
      entryPrice: data.entryPrice ?? data.buyPrice ?? null,
      exitPrice: data.exitPrice ?? data.sellPrice ?? null,
      fees: data.fees ?? null,
      emotion: data.emotion ?? null,
      riskReward: data.riskReward ?? null,
      holdingDurationMinutes: data.holdingDurationMinutes ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deletedAt: null,
    };

    const docRef = await addDoc(colRef, prepared);
    return { success: true, data: { id: docRef.id, ...data } };
  }

  async getUserTrades(userId: string) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };

    const colRef = firestoreCollection(db, SUBCOLLECTIONS.USER_TRADING_JOURNAL(userId)) as any;
    const q = query(colRef, where('deletedAt', '==', null), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date(), updatedAt: d.data().updatedAt?.toDate?.() || new Date(), date: d.data().date?.toDate?.() || new Date() }));
    return { success: true, data: docs };
  }

  async updateTrade(userId: string, tradeId: string, patch: Partial<TradeRecord>) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };
    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRADING_JOURNAL, tradeId) as any;
    const prepared: DocumentData = { ...patch, updatedAt: serverTimestamp() };
    await updateDoc(docRef, prepared);
    return { success: true };
  }

  async deleteTrade(userId: string, tradeId: string) {
    const db = getFirestoreClient();
    if (!db) return { success: false, error: 'Firestore not initialized' };
    const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRADING_JOURNAL, tradeId) as any;
    await updateDoc(docRef, { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() } as DocumentData);
    return { success: true };
  }
}

export const tradingJournalService = new TradingJournalService();
