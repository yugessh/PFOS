import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import type { AccountModel } from '@/src/data/mock-accounts';

const ACCOUNTS_COLLECTION = 'accounts';

function ensureDb() {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore not initialized');
  return db;
}

export async function listAccounts(): Promise<AccountModel[]> {
  const db = ensureDb();
  const q = query(collection(db, ACCOUNTS_COLLECTION));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AccountModel[];
}

export async function createAccountFirestore(a: Omit<AccountModel, 'id'>): Promise<AccountModel> {
  const db = ensureDb();
  const ref = await addDoc(collection(db, ACCOUNTS_COLLECTION), a as any);
  return { id: ref.id, ...a } as AccountModel;
}

export async function updateAccountFirestore(id: string, patch: Partial<AccountModel>): Promise<AccountModel> {
  const db = ensureDb();
  const d = doc(db, ACCOUNTS_COLLECTION, id);
  await updateDoc(d, patch as any);
  return { id, ...(patch as any) } as AccountModel;
}

export async function deleteAccountFirestore(id: string): Promise<void> {
  const db = ensureDb();
  const d = doc(db, ACCOUNTS_COLLECTION, id);
  await deleteDoc(d);
}
