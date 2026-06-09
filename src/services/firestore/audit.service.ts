import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import { getAuthSafe } from '@/src/firebase/firebase';
import { addDocSafe, getDocsSafe, setDocSafe, deleteDocSafe } from './safeFirestore';
import { SUBCOLLECTIONS } from '@/src/constants/collections';

export interface AuditLog {
  id?: string;
  userId: string;
  timestamp: any;
  user: string;
  module: string;
  action: string;
  status: 'success' | 'failure' | 'warning' | 'info';
  severity: 'info' | 'warning' | 'critical' | 'security';
  metadata?: Record<string, any>;
  createdAt?: any;
}

export interface ErrorRecord {
  id?: string;
  userId: string;
  timestamp: any;
  errorType: 'runtime' | 'firebase' | 'import' | 'automation' | 'network';
  message: string;
  stack?: string;
  module: string;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface RepairRecord {
  id?: string;
  userId: string;
  timestamp: any;
  issueType: string;
  description: string;
  itemsAffected: number;
  status: 'repaired' | 'failed';
  details?: Record<string, any>;
}

export interface HealthSnapshot {
  id?: string;
  userId: string;
  timestamp: any;
  database: number;
  performance: number;
  sync: number;
  security: number;
  dataQuality: number;
  overall: number;
}

function assertAuthenticatedUser(userId: string | undefined | null): asserts userId is string {
  if (!userId) {
    throw new Error('[AuditService] Cannot perform operation: userId is missing or undefined');
  }
  const auth = getAuthSafe();
  const currentUid = auth?.currentUser?.uid;
  if (!currentUid) {
    throw new Error('[AuditService] Cannot perform operation: user is not authenticated');
  }
  if (currentUid !== userId) {
    throw new Error('[AuditService] Cannot perform operation: userId does not match authenticated user');
  }
}

function getAuditLogsCollection(userId: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, SUBCOLLECTIONS.USER_AUDIT_LOGS(userId));
}

function getErrorHistoryCollection(userId: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, SUBCOLLECTIONS.USER_ERROR_HISTORY(userId));
}

function getRepairHistoryCollection(userId: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, SUBCOLLECTIONS.USER_REPAIR_HISTORY(userId));
}

function getDiagnosticsCollection(userId: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, SUBCOLLECTIONS.USER_DIAGNOSTICS(userId));
}

export class AuditService {
  /**
   * Log an audit event to the user's auditLogs subcollection
   */
  async logEvent(
    userId: string,
    event: Omit<AuditLog, 'id' | 'userId' | 'timestamp' | 'createdAt'>
  ): Promise<AuditLog | null> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getAuditLogsCollection(userId);
      const now = Timestamp.now();
      const payload = {
        ...event,
        userId,
        timestamp: now,
        createdAt: now,
      };

      const docRef = await addDocSafe(colRef, payload);
      if (!docRef) return null;

      return {
        id: docRef.id,
        ...event,
        userId,
        timestamp: new Date(),
        createdAt: new Date(),
      };
    } catch (error) {
      console.warn('Failed to log audit event', error);
      return null;
    }
  }

  /**
   * Retrieve audit logs for a user, optionally filtered
   */
  async getAuditLogs(
    userId: string,
    options: {
      severity?: string;
      module?: string;
      status?: string;
      limitCount?: number;
    } = {}
  ): Promise<AuditLog[]> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getAuditLogsCollection(userId);
      let q = query(colRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));

      if (options.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      const snapshot = await getDocsSafe(q);
      if (!snapshot || !snapshot.docs) return [];

      let logs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp || Date.now()),
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as AuditLog;
      });

      // Simple memory filtering since compound indexes might not be fully built
      if (options.severity && options.severity !== 'all') {
        logs = logs.filter((log) => log.severity === options.severity);
      }
      if (options.module && options.module !== 'all') {
        logs = logs.filter((log) => log.module === options.module);
      }
      if (options.status && options.status !== 'all') {
        logs = logs.filter((log) => log.status === options.status);
      }

      return logs;
    } catch (error) {
      console.error('Failed to retrieve audit logs', error);
      return [];
    }
  }

  /**
   * Log an error incident in the user's errorHistory subcollection
   */
  async logError(
    userId: string,
    errorRecord: Omit<ErrorRecord, 'id' | 'userId' | 'timestamp' | 'resolved'>
  ): Promise<ErrorRecord | null> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getErrorHistoryCollection(userId);
      const now = Timestamp.now();
      const payload = {
        ...errorRecord,
        userId,
        timestamp: now,
        resolved: false,
      };

      const docRef = await addDocSafe(colRef, payload);
      if (!docRef) return null;

      // Log an audit event too for warning / critical
      await this.logEvent(userId, {
        user: errorRecord.metadata?.user || 'System',
        module: errorRecord.module,
        action: `Error encountered: ${errorRecord.message.slice(0, 50)}`,
        status: 'failure',
        severity: errorRecord.errorType === 'network' ? 'warning' : 'critical',
        metadata: { errorId: docRef.id, errorType: errorRecord.errorType },
      });

      return {
        id: docRef.id,
        ...payload,
        timestamp: new Date(),
      };
    } catch (error) {
      console.warn('Failed to log error', error);
      return null;
    }
  }

  /**
   * Fetch error logs
   */
  async getErrors(userId: string): Promise<ErrorRecord[]> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getErrorHistoryCollection(userId);
      const q = query(colRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
      const snapshot = await getDocsSafe(q);

      if (!snapshot || !snapshot.docs) return [];
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp || Date.now()),
        } as ErrorRecord;
      });
    } catch (error) {
      console.error('Failed to get error records', error);
      return [];
    }
  }

  /**
   * Dismiss/Delete error record
   */
  async dismissError(userId: string, errorId: string): Promise<boolean> {
    try {
      assertAuthenticatedUser(userId);
      const db = getFirestoreClient();
      if (!db) return false;
      const docRef = doc(db, `${SUBCOLLECTIONS.USER_ERROR_HISTORY(userId)}/${errorId}`);
      await deleteDocSafe(docRef);

      // Log audit event
      await this.logEvent(userId, {
        user: 'System',
        module: 'System',
        action: 'Incident report dismissed',
        status: 'success',
        severity: 'info',
        metadata: { errorId },
      });

      return true;
    } catch (error) {
      console.error('Failed to dismiss error', error);
      return false;
    }
  }

  /**
   * Log automated repair history
   */
  async logRepair(
    userId: string,
    repairRecord: Omit<RepairRecord, 'id' | 'userId' | 'timestamp'>
  ): Promise<RepairRecord | null> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getRepairHistoryCollection(userId);
      const now = Timestamp.now();
      const payload = {
        ...repairRecord,
        userId,
        timestamp: now,
      };

      const docRef = await addDocSafe(colRef, payload);
      if (!docRef) return null;

      // Add to audit trail
      await this.logEvent(userId, {
        user: 'System',
        module: 'Diagnostics',
        action: `Integrity Repair: ${repairRecord.description}`,
        status: repairRecord.status === 'repaired' ? 'success' : 'failure',
        severity: repairRecord.status === 'repaired' ? 'info' : 'warning',
        metadata: { repairId: docRef.id, affected: repairRecord.itemsAffected },
      });

      return {
        id: docRef.id,
        ...payload,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Failed to log repair action', error);
      return null;
    }
  }

  /**
   * Get repair history
   */
  async getRepairHistory(userId: string): Promise<RepairRecord[]> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getRepairHistoryCollection(userId);
      const q = query(colRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
      const snapshot = await getDocsSafe(q);

      if (!snapshot || !snapshot.docs) return [];
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp || Date.now()),
        } as RepairRecord;
      });
    } catch (error) {
      console.error('Failed to retrieve repair history', error);
      return [];
    }
  }

  /**
   * Save health snapshots
   */
  async saveHealthSnapshot(userId: string, snapshot: Omit<HealthSnapshot, 'id' | 'userId' | 'timestamp'>) {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getDiagnosticsCollection(userId);
      const now = Timestamp.now();
      const payload = {
        ...snapshot,
        userId,
        timestamp: now,
      };

      const docRef = await addDocSafe(colRef, payload);
      return docRef ? docRef.id : null;
    } catch (error) {
      console.error('Failed to save health snapshot', error);
      return null;
    }
  }

  /**
   * Get recent health snapshot
   */
  async getRecentHealthSnapshot(userId: string): Promise<HealthSnapshot | null> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getDiagnosticsCollection(userId);
      const q = query(colRef, where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(1));
      const snapshot = await getDocsSafe(q);

      if (!snapshot || snapshot.empty) return null;
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp || Date.now()),
      } as HealthSnapshot;
    } catch (error) {
      console.error('Failed to get recent health snapshot', error);
      return null;
    }
  }

  /**
   * Clear all audit logs for a user (for development/simulation reset)
   */
  async clearAllLogs(userId: string): Promise<void> {
    try {
      assertAuthenticatedUser(userId);
      const colRef = getAuditLogsCollection(userId);
      const q = query(colRef, where('userId', '==', userId));
      const snapshot = await getDocsSafe(q);

      if (snapshot && snapshot.docs) {
        const deletes = snapshot.docs.map((docSnap) => deleteDocSafe(docSnap.ref));
        await Promise.all(deletes);
      }
    } catch (err) {
      console.warn('Failed to clear logs', err);
    }
  }

  /**
   * Seeds 50+ rich and realistic historical activity logs for Neo Finance OS.
   */
  async seedAuditLogs(userId: string, userEmail: string): Promise<boolean> {
    // Only allow seeding in non-production environments
    if (process.env.NODE_ENV === 'production') {
      console.warn('seedAuditLogs called in production; operation disabled');
      return false;
    }

    try {
      assertAuthenticatedUser(userId);
      // 1. Clear old logs first
      await this.clearAllLogs(userId);

      const colRef = getAuditLogsCollection(userId);
      const nowMs = Date.now();

      // List of modules to generate realistic logs for
      const modules = [
        { name: 'Accounts', action: 'Savings account linked', status: 'success', severity: 'info', offset: 30 * 24 },
        { name: 'Transactions', action: 'Recurring payroll transaction created', status: 'success', severity: 'info', offset: 29 * 24 },
        { name: 'Budgets', action: 'Monthly grocery budget set to $500', status: 'success', severity: 'info', offset: 28 * 24 },
        { name: 'Security', action: 'Session token refreshed', status: 'success', severity: 'info', offset: 27 * 24 },
        { name: 'Goals', action: 'Savings goal "Emergency Fund" updated', status: 'success', severity: 'info', offset: 26 * 24 },
        { name: 'Investments', action: 'Bought 12 units of VTI ETF', status: 'success', severity: 'info', offset: 25 * 24 },
        { name: 'Trading Journal', action: 'Trading journal entry logged: Long BTC/USD', status: 'success', severity: 'info', offset: 24 * 24 },
        { name: 'Calendar', action: 'Financial reminder added for rent payment', status: 'success', severity: 'info', offset: 23 * 24 },
        { name: 'Notifications', action: 'High-inflow smart alert notification sent', status: 'success', severity: 'info', offset: 22 * 24 },
        { name: 'Automation', action: 'Automation rule "Auto-save 10% of income" triggered', status: 'success', severity: 'info', offset: 21 * 24 },
        { name: 'AI Coach', action: 'Financial recommendations generated', status: 'success', severity: 'info', offset: 20 * 24 },
        { name: 'Documents', action: 'Tax PDF document uploaded to Vault', status: 'success', severity: 'info', offset: 19 * 24 },
        { name: 'Tax Planner', action: 'Deductions calculated for FY2026', status: 'success', severity: 'info', offset: 18 * 24 },
        { name: 'Family Finance', action: 'Family member "Sarah" added with write access', status: 'success', severity: 'info', offset: 17 * 24 },
        { name: 'Asset Register', action: 'Home valuation asset added ($450,000)', status: 'success', severity: 'info', offset: 16 * 24 },
        { name: 'Subscription Intelligence', action: 'Identified redundant Netflix subscription', status: 'warning', severity: 'warning', offset: 15 * 24 },
        { name: 'Security', action: 'App lock PIN changed by user', status: 'success', severity: 'security', offset: 14 * 24 },
        { name: 'Import Hub', action: 'Imported 45 transactions from Chase CSV', status: 'success', severity: 'info', offset: 13 * 24 },
        { name: 'Reports', action: 'System Diagnostics & Net Worth report generated', status: 'success', severity: 'info', offset: 12 * 24 },
        { name: 'Transactions', action: 'Transaction edit: Re-categorized utility bill', status: 'success', severity: 'info', offset: 11 * 24 },
        { name: 'Security', action: 'Failed authentication attempt (invalid PIN)', status: 'failure', severity: 'security', offset: 10 * 24 },
        { name: 'Import Hub', action: 'Bank statement import failed: Invalid header schema', status: 'failure', severity: 'warning', offset: 9 * 24 },
        { name: 'Automation', action: 'Auto-budget check skipped: insufficient data', status: 'warning', severity: 'warning', offset: 8 * 24 },
        { name: 'AI Coach', action: 'Goal prediction alert: "Emergency Fund" behind target', status: 'warning', severity: 'warning', offset: 7 * 24 },
        { name: 'System', action: 'Firestore local database cache flushed', status: 'success', severity: 'info', offset: 6 * 24 },
        { name: 'Family Finance', action: 'Family workspace access audited', status: 'success', severity: 'security', offset: 5 * 24 },
        { name: 'Investments', action: 'Sold 5 shares of AAPL stock', status: 'success', severity: 'info', offset: 4 * 24 },
        { name: 'Security', action: 'Logged out other active sessions', status: 'success', severity: 'security', offset: 3 * 24 },
        { name: 'Automation', action: 'Backup database sync failed: connection reset', status: 'failure', severity: 'critical', offset: 2 * 24 },
        { name: 'Import Hub', action: 'CSV import: 2 duplicate transactions skipped', status: 'warning', severity: 'warning', offset: 1 * 24 },
        { name: 'Diagnostics', action: 'Data integrity scanner: detected 2 orphaned references', status: 'warning', severity: 'critical', offset: 0.5 * 24 },
      ];

      // We'll generate 50 logs total, duplicating and shifting offsets to make a beautiful feed
      const seedPromises = [];

      for (let i = 0; i < 55; i++) {
        const item = modules[i % modules.length];
        // randomize offset a bit to scatter them over the last 30 days
        const randomMinutes = Math.floor(Math.random() * 60);
        const logOffsetMs = (item.offset + (i / 2) * 8) * 60 * 60 * 1000 + randomMinutes * 60 * 1000;
        const logDate = new Date(nowMs - logOffsetMs);
        const logTimestamp = Timestamp.fromDate(logDate);

        // Add some variation in action descriptions
        let actionStr = item.action;
        if (i > modules.length) {
          actionStr = `${item.action} (Batch ${Math.floor(i / modules.length) + 1})`;
        }

        const payload = {
          userId,
          timestamp: logTimestamp,
          createdAt: logTimestamp,
          user: userEmail || 'user@email.com',
          module: item.name,
          action: actionStr,
          status: item.status,
          severity: item.severity,
          metadata: {
            source: 'simulation_seeder',
            ip: `192.168.1.${10 + (i % 25)}`,
            browser: i % 2 === 0 ? 'Chrome / Windows' : 'Safari / iOS',
            batchId: `sim_batch_${i}`,
          },
        };

        const docRef = doc(colRef);
        seedPromises.push(setDocSafe(docRef, payload));
      }

      await Promise.all(seedPromises);

      // Save a default health snapshot as well to get starting health data
      await this.saveHealthSnapshot(userId, {
        database: 98,
        performance: 95,
        sync: 100,
        security: 90,
        dataQuality: 92,
        overall: 95,
      });

      return true;
    } catch (err) {
      console.error('Failed to seed audit logs', err);
      return false;
    }
  }
}

export const auditService = new AuditService();
