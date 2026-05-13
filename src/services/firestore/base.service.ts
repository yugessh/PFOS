import {
  collection as firestoreCollection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
  Timestamp,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
  Query,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';
import { QueryOptions, PaginationOptions, ServiceResponse, ListResponse, BaseDocument } from '../../types/firestore';

/**
 * Base Firestore service providing generic CRUD operations
 * All other services should extend this base class
 */
export abstract class BaseFirestoreService<T extends BaseDocument> {
  protected collectionRef: CollectionReference<DocumentData> | null;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    const _db = getFirestoreClient();
    if (!_db) {
      // Firestore not initialized; services should handle null collection
      // eslint-disable-next-line no-console
      console.warn(`Firestore client not available. ${collectionName} operations will be no-ops.`);
      this.collectionRef = null;
    } else {
      this.collectionRef = firestoreCollection(_db, collectionName);
    }
  }

  /**
   * Convert Firestore document to TypeScript object with proper date handling
   */
  protected convertDocument(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): T {
    const data = doc.data();
    if (!data) {
      throw new Error('Document data is undefined');
    }
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      deletedAt: data.deletedAt?.toDate?.(),
    } as T;
  }

  /**
   * Convert TypeScript object to Firestore document with proper timestamp handling
   */
  protected prepareData(data: Partial<T>): DocumentData {
    const prepared: DocumentData = { ...data };
    
    // Remove id field as it's stored in document path
    delete prepared.id;
    
    // Add server timestamps
    const now = serverTimestamp();
    
    if (!prepared.createdAt) {
      prepared.createdAt = now;
    }
    
    prepared.updatedAt = now;
    
    return prepared;
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      if (!this.collectionRef) {
        return { success: false, error: 'Firestore not initialized' };
      }
      const preparedData = this.prepareData(data);
      const docRef = await addDoc(this.collectionRef, preparedData);
      
      // Get created document
      const createdDoc = await getDoc(docRef);
      const createdData = this.convertDocument(createdDoc);
      
      return {
        success: true,
        data: createdData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Create a document with a specific ID
   */
  async createWithId(
    id: string,
    data: Partial<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const _db = getFirestoreClient();
      if (!_db) return { success: false, error: 'Firestore not initialized' };
      const docRef = doc(_db, this.collectionName, id);
      const preparedData = this.prepareData(data);
      await updateDoc(docRef, preparedData);
      
      // Get created document
      const createdDoc = await getDoc(docRef);
      const createdData = this.convertDocument(createdDoc);
      
      return {
        success: true,
        data: createdData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Update an existing document
   */
  async update(
    id: string,
    data: Partial<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const _db = getFirestoreClient();
      if (!_db) return { success: false, error: 'Firestore not initialized' };
      const docRef = doc(_db, this.collectionName, id);
      const preparedData = this.prepareData(data);
      
      await updateDoc(docRef, preparedData);
      
      // Get updated document
      const updatedDoc = await getDoc(docRef);
      const updatedData = this.convertDocument(updatedDoc);
      
      return {
        success: true,
        data: updatedData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Soft delete a document (sets deletedAt timestamp)
   */
  async softDelete(id: string): Promise<ServiceResponse<void>> {
    try {
      const _db = getFirestoreClient();
      if (!_db) return { success: false, error: 'Firestore not initialized' };
      const docRef = doc(_db, this.collectionName, id);
      await updateDoc(docRef, {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as DocumentData);
      
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Hard delete a document
   */
  async hardDelete(id: string): Promise<ServiceResponse<void>> {
    try {
      const _db = getFirestoreClient();
      if (!_db) return { success: false, error: 'Firestore not initialized' };
      const docRef = doc(_db, this.collectionName, id);
      await deleteDoc(docRef);
      
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Get a document by ID
   */
  async getById(id: string): Promise<ServiceResponse<T>> {
    try {
      const _db = getFirestoreClient();
      if (!_db) return { success: false, error: 'Firestore not initialized' };
      const docRef = doc(_db, this.collectionName, id);
      const document = await getDoc(docRef);
      
      if (!document.exists()) {
        return {
          success: false,
          error: 'Document not found',
          code: 'not-found',
        };
      }
      
      const data = this.convertDocument(document);
      
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * List documents with optional filtering and pagination
   */
  async list(options?: QueryOptions): Promise<ServiceResponse<ListResponse<T>>> {
    try {
      if (!this.collectionRef) return { success: false, error: 'Firestore not initialized' };
      let q: Query = this.collectionRef as unknown as Query;
      
      // Apply where clauses
      if (options?.where) {
        options.where.forEach((whereClause) => {
          q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
        });
      }
      
      // Apply ordering
      if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
      }
      
      // Apply limit
      if (options?.limit) {
        q = query(q, limit(options.limit));
      }
      
      // Apply pagination
      if (options?.startAfter) {
        q = query(q, startAfter(options.startAfter));
      } else if (options?.startAt) {
        q = query(q, startAt(options.startAt));
      }
      
      // Filter out soft-deleted documents by default
      q = query(q, where('deletedAt', '==', null));
      
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => this.convertDocument(doc));
      
      const response: ListResponse<T> = {
        data: documents,
        hasMore: querySnapshot.docs.length === (options?.limit || 0),
        lastDocument: querySnapshot.docs[querySnapshot.docs.length - 1],
      };
      
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * List documents with pagination
   */
  async listPaginated(
    pagination: PaginationOptions,
    options?: Omit<QueryOptions, 'limit' | 'startAfter'>
  ): Promise<ServiceResponse<ListResponse<T>>> {
    return this.list({
      ...options,
      limit: pagination.pageSize,
      startAfter: pagination.startAfter,
    });
  }

  /**
   * Query documents by user ID (common pattern for user-specific data)
   */
  async getByUserId(
    userId: string,
    options?: Omit<QueryOptions, 'where'>
  ): Promise<ServiceResponse<ListResponse<T>>> {
    const whereClause = {
      field: 'userId',
      operator: '==' as const,
      value: userId,
    };
    
    return this.list({
      ...options,
      where: [whereClause],
    });
  }

  /**
   * Get document reference
   */
  getDocumentReference(id: string): DocumentReference<DocumentData> {
    return doc(db, this.collectionName, id);
  }

  /**
   * Get collection reference
   */
  getCollectionReference(): CollectionReference<DocumentData> {
    return this.collection;
  }

  /**
   * Build a query with multiple options
   */
  protected buildQuery(options?: QueryOptions): Query {
    if (!this.collectionRef) throw new Error('Firestore not initialized');
    let q: Query = this.collectionRef as unknown as Query;
    
    // Apply where clauses
    if (options?.where) {
      options.where.forEach((whereClause) => {
        q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
      });
    }
    
    // Apply ordering
    if (options?.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
    }
    
    // Apply limit
    if (options?.limit) {
      q = query(q, limit(options.limit));
    }
    
    // Apply pagination
    if (options?.startAfter) {
      q = query(q, startAfter(options.startAfter));
    } else if (options?.startAt) {
      q = query(q, startAt(options.startAt));
    }
    
    // Filter out soft-deleted documents by default
    q = query(q, where('deletedAt', '==', null));
    
    return q;
  }
}
