import { db } from '@/src/services/firestore/config';
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

type Op = 'add' | 'set' | 'update' | 'delete';

type QueueItem = {
  id: string; // unique id for queue item
  op: Op;
  path: string; // collection path or document path
  docId?: string;
  data?: any;
  clientId?: string; // optional client-generated id to avoid duplicates
  updatedAt?: string; // ISO string
};

const STORAGE_KEY = 'pfos_sync_queue_v1';

class SyncManager {
  private queue: QueueItem[] = [];
  private subscribers: Set<() => void> = new Set();
  public syncing = false;

  constructor() {
    this.load();
    // flush when navigator goes online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.flush());
    }
    // periodic flush in background
    setInterval(() => this.flush(), 30_000);
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      this.emit();
    } catch (e) {
      // ignore
    }
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.queue = JSON.parse(raw);
    } catch (e) {
      this.queue = [];
    }
    this.emit();
  }

  subscribe(fn: () => void) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  private emit() {
    for (const s of this.subscribers) s();
  }

  enqueue(item: QueueItem) {
    this.queue.push(item);
    this.save();
  }

  getPendingCount() {
    return this.queue.length;
  }

  async flush() {
    if (!db) return;
    if (this.syncing || this.queue.length === 0) return;
    this.syncing = true;
    this.emit();

    while (this.queue.length > 0) {
      const item = this.queue[0];
      try {
        // support collection path like 'transactions'
        const collectionPath = item.path;
        const id = item.docId || item.clientId || item.id;
        const docRef = doc(db, collectionPath, id);

        if (item.op === 'delete') {
          await deleteDoc(docRef);
        } else if (item.op === 'update') {
          // conflict resolution based on updatedAt
          const serverSnap = await getDoc(docRef);
          const serverUpdatedAt = serverSnap.exists() ? (serverSnap.data()?.updatedAt as any) : null;
          const serverTs = serverUpdatedAt ? this.parseTime(serverUpdatedAt) : 0;
          const localTs = item.updatedAt ? Date.parse(item.updatedAt) : Date.now();
          if (serverTs > localTs) {
            // server has newer changes — skip this update
            this.queue.shift();
            this.save();
            continue;
          }
          const payload = { ...item.data, updatedAt: serverTimestamp() };
          await updateDoc(docRef, payload);
        } else if (item.op === 'set' || item.op === 'add') {
          const payload = { ...item.data, updatedAt: serverTimestamp() };
          await setDoc(docRef, payload, { merge: true });
        }

        // processed ok — remove from queue
        this.queue.shift();
        this.save();
      } catch (err) {
        // On error, stop flushing to avoid infinite loops. Will retry on next online/event.
        // eslint-disable-next-line no-console
        console.warn('SyncManager flush error, will retry later', err);
        break;
      }
    }

    this.syncing = false;
    this.emit();
  }

  private parseTime(val: any) {
    if (!val) return 0;
    if (val instanceof Timestamp) return val.toMillis();
    if (typeof val === 'string') return Date.parse(val) || 0;
    if (typeof val === 'number') return val;
    return 0;
  }
}

export const syncManager = new SyncManager();

export type { QueueItem };
