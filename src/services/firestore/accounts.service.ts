import { BaseFirestoreService } from './base.service';
import { COLLECTIONS, SUBCOLLECTIONS } from '../../constants/collections';
import { usersService } from './users.service';
import { getFirestoreClient } from './firebaseClient';
import { collection as firestoreCollection, addDoc, serverTimestamp, DocumentData, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuthSafe } from '@/src/firebase/firebase';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  deletedAt?: any;
}

/**
 * Accounts service for managing user bank accounts
 */
export class AccountsService extends BaseFirestoreService<Account> {
  constructor() {
    super(COLLECTIONS.ACCOUNTS);
  }

  /**
   * Create a new account for a user
   */
  async createAccount(userId: string, accountData: Partial<Account>) {
    try {
      // Debug: log current auth uid from client
      try {
        const auth = getAuthSafe();
        // eslint-disable-next-line no-console
        console.debug('accountsService.createAccount called with userId=', userId, 'auth.currentUser?.uid=', auth?.currentUser?.uid);
      } catch (_) {}

      // Ensure user profile exists so Firestore rules that check /users/{uid} pass
      const existing = await usersService.getUserProfile(userId);
      if (!existing) {
        try {
          await usersService.initializeUserProfile(userId, { email: (accountData as any)?.email || '' });
        } catch (initErr) {
          // eslint-disable-next-line no-console
          console.warn('Failed to initialize missing user profile before account create:', initErr);
        }
      }

      // Write account into users/{uid}/accounts subcollection (preferred)
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = SUBCOLLECTIONS.USER_ACCOUNTS(userId);
      const colRef = firestoreCollection(db, colPath) as any;

      const prepared: DocumentData = {
        ...accountData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
      };

      const docRef = await addDoc(colRef, prepared);
      // Return synthesized success — document will have server timestamps once read
      return { success: true, data: { id: docRef.id, ...accountData, userId, createdAt: new Date(), updatedAt: new Date() } as any };
    } catch (error: any) {
      const msg = error?.message || String(error);
      if (msg.includes('permission') || error?.code === 'permission-denied') {
        return { success: false, error: 'Permission denied: ensure you are signed in and your account is initialized.', code: error?.code };
      }
      return { success: false, error: msg, code: error?.code };
    }
  }

  /**
   * Get accounts for a specific user
   */
  async getUserAccounts(userId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = SUBCOLLECTIONS.USER_ACCOUNTS(userId);
      const colRef = firestoreCollection(db, colPath) as any;
      // filter out soft-deleted documents where deletedAt == null
      const q = query(colRef, where('deletedAt', '==', null));
      const snap = await getDocs(q);
      const documents = snap.docs.map((d: any) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date(), updatedAt: d.data().updatedAt?.toDate?.() || new Date(), deletedAt: d.data().deletedAt?.toDate?.() || null } as Account));

      return { success: true, data: { data: documents } } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  /**
   * Get active accounts for a user
   */
  async getActiveAccounts(userId: string) {
    const response = await this.getUserAccounts(userId);
    if (!response.success) return response as any;
    const all = (response as any).data?.data || [];
    const active = all.filter((account: Account) => account.isActive !== false);
    return { success: true, data: { data: active } } as any;
  }

  /**
   * Update account balance
   */
  async updateBalance(userId: string, accountId: string, newBalance: number) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, `${SUBCOLLECTIONS.USER_ACCOUNTS(userId)}/${accountId}`);
      await updateDoc(docRef, {
        balance: newBalance,
        updatedAt: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return { success: false, error: 'Document not found', code: 'not-found' };
      const data = snapshot.data();
      return {
        success: true,
        data: {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          deletedAt: data.deletedAt?.toDate?.() || null,
        } as Account,
      } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async updateAccount(userId: string, accountId: string, patch: Partial<Account>) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, `${SUBCOLLECTIONS.USER_ACCOUNTS(userId)}/${accountId}`);
      await updateDoc(docRef, {
        ...patch,
        updatedAt: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return { success: false, error: 'Document not found', code: 'not-found' };
      const data = snapshot.data();
      return {
        success: true,
        data: {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          deletedAt: data.deletedAt?.toDate?.() || null,
        } as Account,
      } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async softDeleteAccount(userId: string, accountId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, `${SUBCOLLECTIONS.USER_ACCOUNTS(userId)}/${accountId}`);
      await updateDoc(docRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  /**
   * Get account by ID (with userId check)
   */
  async getAccountById(userId: string, accountId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, SUBCOLLECTIONS.USER_ACCOUNTS(userId) + `/${accountId}`);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return { success: false, error: 'Document not found', code: 'not-found' };
      const data = snapshot.data();
      const account = { id: snapshot.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date(), updatedAt: data.updatedAt?.toDate?.() || new Date(), deletedAt: data.deletedAt?.toDate?.() || null } as Account;
      return { success: true, data: account };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }
}

export const accountsService = new AccountsService();
