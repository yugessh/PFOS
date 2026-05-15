import { syncManager } from './syncManager';

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Helper wrappers to queue operations when offline-first behaviour is desired.
 * Use these from places where writes occur (transactions, goals, budgets, etc).
 */

export function queueAdd(collectionPath: string, data: any, clientId?: string) {
  const id = clientId || makeId();
  const item = {
    id: `${Date.now()}-${id}`,
    op: 'add' as const,
    path: collectionPath,
    docId: id,
    data,
    clientId: id,
    updatedAt: new Date().toISOString(),
  };
  syncManager.enqueue(item);
}

export function queueUpdate(collectionPath: string, docId: string, data: any) {
  const item = {
    id: `${Date.now()}-${docId}`,
    op: 'update' as const,
    path: collectionPath,
    docId,
    data,
    updatedAt: new Date().toISOString(),
  };
  syncManager.enqueue(item);
}

export function queueDelete(collectionPath: string, docId: string) {
  const item = {
    id: `${Date.now()}-${docId}`,
    op: 'delete' as const,
    path: collectionPath,
    docId,
    updatedAt: new Date().toISOString(),
  };
  syncManager.enqueue(item);
}
