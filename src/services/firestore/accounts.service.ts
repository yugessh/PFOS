import { BaseFirestoreService } from './base.service';
import { COLLECTIONS, SUBCOLLECTIONS } from '../../constants/collections';
import { usersService } from './users.service';
import { getFirestoreClient } from './firebaseClient';
import {
  collection as firestoreCollection,
  addDoc,
  serverTimestamp,
  DocumentData,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuthSafe } from '@/src/firebase/firebase';
import { roundToDecimal } from '@/src/lib/currency';
import { getAccountTypeMeta, toCanonicalAccountType, type CanonicalAccountType } from '@/src/lib/account-types';

export interface Account {
  id: string;
  userId: string;
  name: string;
  accountType: CanonicalAccountType;
  currentBalance: number;
  currency: string;
  color: string;
  icon: string;
  monthlyInflow: number;
  monthlyOutflow: number;
  lastTransaction: string | null;
  createdAt: any;
  updatedAt: any;
  deletedAt?: any;
  type?: CanonicalAccountType;
  balance?: number;
  accountName?: string;
  isActive?: boolean;
  isDefault?: boolean;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  description?: string;
  lastUpdated?: Date;
}

type AccountMovementDirection = 'inflow' | 'outflow';

interface AccountMovementInput {
  amount: number;
  direction: AccountMovementDirection;
  description?: string;
  date?: Date;
  sourceLabel?: string;
  targetLabel?: string;
}

function normalizeCurrency(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim().toUpperCase() : 'INR';
}

function resolveAccountType(accountData: Partial<Account> & Record<string, any>): CanonicalAccountType {
  return toCanonicalAccountType(accountData.accountType || accountData.type);
}

function resolveAccountName(accountData: Partial<Account> & Record<string, any>): string {
  return accountData.name || accountData.accountName || 'New Account';
}

function resolveBalance(accountData: Partial<Account> & Record<string, any>): number {
  const current = Number(accountData.currentBalance ?? accountData.balance ?? 0);
  return roundToDecimal(Number.isFinite(current) ? current : 0, 2);
}

function resolveLastTransaction(accountData: Partial<Account> & Record<string, any>): string | null {
  const value = accountData.lastTransaction;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function mapDocumentToAccount(id: string, data: any): Account {
  const accountType = toCanonicalAccountType(data.accountType || data.type);
  const normalizedBalance = roundToDecimal(Number(data.currentBalance ?? data.balance ?? 0), 2);
  const monthlyInflow = roundToDecimal(Number(data.monthlyInflow ?? 0), 2);
  const monthlyOutflow = roundToDecimal(Number(data.monthlyOutflow ?? 0), 2);
  const meta = getAccountTypeMeta(accountType);

  return {
    id,
    userId: data.userId,
    name: data.name || data.accountName || meta.label,
    accountType,
    type: accountType,
    currentBalance: normalizedBalance,
    balance: normalizedBalance,
    currency: normalizeCurrency(data.currency),
    color: data.color || '#7EE7C7',
    icon: data.icon || meta.icon,
    monthlyInflow,
    monthlyOutflow,
    lastTransaction: resolveLastTransaction(data),
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    deletedAt: data.deletedAt?.toDate?.() || null,
    isActive: data.isActive !== false,
    isDefault: data.isDefault ?? false,
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    ifscCode: data.ifscCode,
    description: data.description,
    lastUpdated: data.lastUpdated?.toDate?.() || data.updatedAt?.toDate?.() || new Date(),
  };
}

function prepareAccountDocument(userId: string, accountData: Partial<Account> & Record<string, any>): DocumentData {
  const accountType = resolveAccountType(accountData);
  const meta = getAccountTypeMeta(accountType);
  const currentBalance = resolveBalance(accountData);

  return {
    ...accountData,
    userId,
    name: resolveAccountName(accountData),
    accountName: resolveAccountName(accountData),
    accountType,
    type: accountType,
    currentBalance,
    balance: currentBalance,
    currency: normalizeCurrency(accountData.currency),
    color: accountData.color || '#7EE7C7',
    icon: accountData.icon || meta.icon,
    monthlyInflow: roundToDecimal(Number(accountData.monthlyInflow ?? 0), 2),
    monthlyOutflow: roundToDecimal(Number(accountData.monthlyOutflow ?? 0), 2),
    lastTransaction: resolveLastTransaction(accountData),
    isActive: accountData.isActive ?? true,
    isDefault: accountData.isDefault ?? false,
    createdAt: accountData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
    deletedAt: null,
  };
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
      try {
        const auth = getAuthSafe();
        console.debug('accountsService.createAccount called with userId=', userId, 'auth.currentUser?.uid=', auth?.currentUser?.uid);
      } catch (_) {}

      const existing = await usersService.getUserProfile(userId);
      if (!existing) {
        try {
          await usersService.initializeUserProfile(userId, { email: (accountData as any)?.email || '' });
        } catch (initErr) {
          console.warn('Failed to initialize missing user profile before account create:', initErr);
        }
      }

      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const colPath = SUBCOLLECTIONS.USER_ACCOUNTS(userId);
      const colRef = firestoreCollection(db, colPath) as any;
      const prepared = prepareAccountDocument(userId, accountData as any);

      const docRef = await addDoc(colRef, prepared);
      return {
        success: true,
        data: mapDocumentToAccount(docRef.id, {
          ...prepared,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date(),
        }) as any,
      };
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
      const q = query(colRef, where('deletedAt', '==', null));
      const snap = await getDocs(q);
      const documents = snap.docs.map((d: any) => mapDocumentToAccount(d.id, d.data()));

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

      const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
      const current = roundToDecimal(Number(newBalance || 0), 2);
      await updateDoc(docRef, {
        currentBalance: current,
        balance: current,
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return { success: false, error: 'Document not found', code: 'not-found' };
      const data = snapshot.data();
      return {
        success: true,
        data: mapDocumentToAccount(snapshot.id, data),
      } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async recordAccountMovement(userId: string, accountId: string, movement: AccountMovementInput) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return { success: false, error: 'Document not found', code: 'not-found' };

      const account = mapDocumentToAccount(snapshot.id, snapshot.data());
      const amount = roundToDecimal(Number(movement.amount || 0), 2);
      const nextBalance = movement.direction === 'inflow'
        ? roundToDecimal(account.currentBalance + amount, 2)
        : roundToDecimal(account.currentBalance - amount, 2);
      const nextInflow = movement.direction === 'inflow'
        ? roundToDecimal(account.monthlyInflow + amount, 2)
        : account.monthlyInflow;
      const nextOutflow = movement.direction === 'outflow'
        ? roundToDecimal(account.monthlyOutflow + amount, 2)
        : account.monthlyOutflow;

      await updateDoc(docRef, {
        currentBalance: nextBalance,
        balance: nextBalance,
        monthlyInflow: nextInflow,
        monthlyOutflow: nextOutflow,
        lastTransaction: movement.description || (movement.direction === 'inflow' ? 'Money in' : 'Money out'),
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      const updated = await getDoc(docRef);
      return {
        success: true,
        data: mapDocumentToAccount(updated.id, updated.data()),
      } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async transferBetweenAccounts(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string,
    date?: Date
  ) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const fromRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, fromAccountId);
      const toRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, toAccountId);

      const [fromSnap, toSnap] = await Promise.all([getDoc(fromRef), getDoc(toRef)]);
      if (!fromSnap.exists() || !toSnap.exists()) {
        return { success: false, error: 'Transfer account not found', code: 'not-found' };
      }

      const fromAccount = mapDocumentToAccount(fromSnap.id, fromSnap.data());
      const toAccount = mapDocumentToAccount(toSnap.id, toSnap.data());
      const transferAmount = roundToDecimal(Number(amount || 0), 2);

      if (fromAccount.currentBalance < transferAmount) {
        return { success: false, error: 'Insufficient balance for transfer', code: 'insufficient-funds' };
      }

      const transferLabel = notes?.trim()
        ? `${notes.trim()} • Transfer`
        : `Transfer to ${toAccount.name}`;

      await updateDoc(fromRef, {
        currentBalance: roundToDecimal(fromAccount.currentBalance - transferAmount, 2),
        balance: roundToDecimal(fromAccount.currentBalance - transferAmount, 2),
        monthlyOutflow: roundToDecimal(fromAccount.monthlyOutflow + transferAmount, 2),
        lastTransaction: `${transferLabel}`,
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      await updateDoc(toRef, {
        currentBalance: roundToDecimal(toAccount.currentBalance + transferAmount, 2),
        balance: roundToDecimal(toAccount.currentBalance + transferAmount, 2),
        monthlyInflow: roundToDecimal(toAccount.monthlyInflow + transferAmount, 2),
        lastTransaction: `Transfer from ${fromAccount.name}`,
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      const [updatedFrom, updatedTo] = await Promise.all([getDoc(fromRef), getDoc(toRef)]);
      return {
        success: true,
        data: {
          from: mapDocumentToAccount(updatedFrom.id, updatedFrom.data()),
          to: mapDocumentToAccount(updatedTo.id, updatedTo.data()),
          amount: transferAmount,
          notes: notes || null,
          date: date || new Date(),
        },
      } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async updateAccount(userId: string, accountId: string, patch: Partial<Account>) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
      const normalizedType = patch.accountType || patch.type ? toCanonicalAccountType((patch.accountType || patch.type) as string) : undefined;
      const currentBalance = patch.currentBalance ?? patch.balance;
      const prepared: DocumentData = {
        ...patch,
        ...(patch.name || patch.accountName ? { name: patch.name || patch.accountName } : {}),
        ...(patch.accountName || patch.name ? { accountName: patch.accountName || patch.name } : {}),
        ...(normalizedType ? { accountType: normalizedType, type: normalizedType } : {}),
        ...(currentBalance !== undefined ? { currentBalance: roundToDecimal(Number(currentBalance || 0), 2), balance: roundToDecimal(Number(currentBalance || 0), 2) } : {}),
        ...(patch.currency ? { currency: normalizeCurrency(patch.currency) } : {}),
        ...(patch.monthlyInflow !== undefined ? { monthlyInflow: roundToDecimal(Number(patch.monthlyInflow || 0), 2) } : {}),
        ...(patch.monthlyOutflow !== undefined ? { monthlyOutflow: roundToDecimal(Number(patch.monthlyOutflow || 0), 2) } : {}),
        ...(patch.lastTransaction !== undefined ? { lastTransaction: patch.lastTransaction } : {}),
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      };

      await updateDoc(docRef, prepared);

      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return { success: false, error: 'Document not found', code: 'not-found' };
      const data = snapshot.data();
      return {
        success: true,
        data: mapDocumentToAccount(snapshot.id, data),
      } as any;
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }

  async softDeleteAccount(userId: string, accountId: string) {
    try {
      const db = getFirestoreClient();
      if (!db) return { success: false, error: 'Firestore not initialized' };

      const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
      await updateDoc(docRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
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

      const docRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return { success: false, error: 'Document not found', code: 'not-found' };
      const data = snapshot.data();
      const account = mapDocumentToAccount(snapshot.id, data);
      return { success: true, data: account };
    } catch (error: any) {
      return { success: false, error: error?.message || String(error), code: error?.code };
    }
  }
}

export const accountsService = new AccountsService();