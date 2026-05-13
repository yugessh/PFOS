import { BaseFirestoreService } from './base.service';
import { COLLECTIONS, SUBCOLLECTIONS } from '../../constants/collections';
import { usersService } from './users.service';
import { getFirestoreClient } from './firebaseClient';
import { collection as firestoreCollection, addDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
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
        // Create a minimal user profile if missing (avoid blocking account creation)
        try {
          await usersService.initializeUserProfile(userId, { email: (accountData as any)?.email || '' });
        } catch (initErr) {
          // If profile creation fails, continue — we will still attempt account create and map permission errors
          // eslint-disable-next-line no-console
          console.warn('Failed to initialize missing user profile before account create:', initErr);
        }
      }

      // Try top-level accounts collection first (legacy)
      const data = { ...accountData, userId };
      const response = await this.create(data as Partial<Account>);
      if (response.success) return response;

      // If permission denied, attempt fallback write to users/{uid}/accounts subcollection
      if (response.code === 'permission-denied' || /permission/.test(String(response.error || ''))) {
        try {
          const db = getFirestoreClient();
          if (db) {
            const colPath = SUBCOLLECTIONS.USER_ACCOUNTS(userId);
            const colRef = firestoreCollection(db, colPath) as any;
            const prepared: DocumentData = {
              ...data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              deletedAt: null,
            };
            const docRef = await addDoc(colRef, prepared);
            // Return a synthesized success object (serverTimestamp resolves later)
            return { success: true, data: { id: docRef.id, ...data, createdAt: new Date(), updatedAt: new Date() } as any };
          }
        } catch (fallbackErr: any) {
          // eslint-disable-next-line no-console
          console.warn('Fallback write to users subcollection failed:', fallbackErr);
        }
        return { success: false, error: 'Permission denied: ensure you are signed in and your account is initialized.' };
      }

      return response;
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
    return this.getByUserId(userId);
  }

  /**
   * Get active accounts for a user
   */
  async getActiveAccounts(userId: string) {
    return this.list({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'isActive', operator: '==', value: true },
      ],
    });
  }

  /**
   * Update account balance
   */
  async updateBalance(accountId: string, newBalance: number) {
    return this.update(accountId, { balance: newBalance } as any);
  }

  /**
   * Get account by ID (with userId check)
   */
  async getAccountById(userId: string, accountId: string) {
    const response = await this.getById(accountId);
    if (response.success && response.data?.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized: Account does not belong to this user',
      };
    }
    return response;
  }
}

export const accountsService = new AccountsService();
