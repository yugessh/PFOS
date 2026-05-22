import { getAuthSafe } from '@/src/firebase/firebase';
import { CollectionReference, DocumentReference, Query, DocumentData, QuerySnapshot, DocumentSnapshot } from 'firebase/firestore';
import { addDoc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

function getCurrentUid() {
  try {
    const auth = getAuthSafe();
    return auth?.currentUser?.uid ?? null;
  } catch {
    return null;
  }
}

async function logAndRethrow(operation: string, path: string | undefined, error: any) {
  const uid = getCurrentUid();
  // eslint-disable-next-line no-console
  console.error('[Firestore][Permission] ', { operation, path, uid, code: error?.code, message: error?.message || String(error) });
  throw error;
}

export async function addDocSafe(colRef: CollectionReference<DocumentData>, data: DocumentData) {
  try {
    return await addDoc(colRef, data);
  } catch (error) {
    await logAndRethrow('addDoc', (colRef as any)?.path, error);
  }
}

export async function getDocsSafe(queryRef: Query) {
  try {
    return await getDocs(queryRef);
  } catch (error) {
    await logAndRethrow('getDocs', (queryRef as any)?.path || undefined, error);
  }
}

export async function getDocSafe(docRef: DocumentReference<DocumentData>) {
  try {
    return await getDoc(docRef);
  } catch (error) {
    await logAndRethrow('getDoc', (docRef as any)?.path, error);
  }
}

export async function updateDocSafe(docRef: DocumentReference<DocumentData>, data: Partial<DocumentData>) {
  try {
    return await updateDoc(docRef, data as DocumentData);
  } catch (error) {
    await logAndRethrow('updateDoc', (docRef as any)?.path, error);
  }
}

export async function deleteDocSafe(docRef: DocumentReference<DocumentData>) {
  try {
    return await deleteDoc(docRef);
  } catch (error) {
    await logAndRethrow('deleteDoc', (docRef as any)?.path, error);
  }
}
