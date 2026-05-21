import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import type { Document, DocumentStatus } from '../../types/document';

export class DocumentsService extends BaseFirestoreService<Document> {
  constructor() {
    super(COLLECTIONS.DOCUMENTS);
  }

  async getUserDocuments(userId: string) {
    return this.getByUserId(userId);
  }

  async createDocument(
    userId: string,
    document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>
  ) {
    const payload = {
      ...document,
      userId,
    };
    return this.create(payload as any);
  }

  async updateDocument(documentId: string, document: Partial<Document>) {
    return this.update(documentId, document as any);
  }

  async deleteDocument(documentId: string) {
    return this.softDelete(documentId);
  }

  async getDocumentsByCategory(userId: string, category: string) {
    const documents = await this.getUserDocuments(userId);
    if (!documents.success) return [];
    
    const docs = Array.isArray(documents.data)
      ? documents.data
      : Array.isArray(documents.data?.data)
      ? documents.data.data
      : [];
    
    return docs.filter(d => d.category === category);
  }

  async getUpcomingRenewals(userId: string, daysAhead: number = 30) {
    const documents = await this.getUserDocuments(userId);
    if (!documents.success) return [];
    
    const docs = Array.isArray(documents.data)
      ? documents.data
      : Array.isArray(documents.data?.data)
      ? documents.data.data
      : [];
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    
    return docs.filter(d => 
      d.renewalDate && 
      d.renewalDate >= now && 
      d.renewalDate <= futureDate &&
      d.status !== 'expired'
    ).sort((a, b) => {
      const aDate = a.renewalDate?.getTime() || 0;
      const bDate = b.renewalDate?.getTime() || 0;
      return aDate - bDate;
    });
  }

  async getDueThisWeek(userId: string) {
    const documents = await this.getUserDocuments(userId);
    if (!documents.success) return [];
    
    const docs = Array.isArray(documents.data)
      ? documents.data
      : Array.isArray(documents.data?.data)
      ? documents.data.data
      : [];
    
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return docs.filter(d => 
      (d.dueDate || d.renewalDate) && 
      (d.dueDate || d.renewalDate)! >= now && 
      (d.dueDate || d.renewalDate)! <= weekFromNow
    );
  }

  async getExpired(userId: string) {
    const documents = await this.getUserDocuments(userId);
    if (!documents.success) return [];
    
    const docs = Array.isArray(documents.data)
      ? documents.data
      : Array.isArray(documents.data?.data)
      ? documents.data.data
      : [];
    
    const now = new Date();
    return docs.filter(d => 
      (d.dueDate || d.renewalDate) &&
      (d.dueDate || d.renewalDate)! < now &&
      d.status === 'expired'
    );
  }

  async getBillsByMonth(userId: string, month: Date) {
    const documents = await this.getUserDocuments(userId);
    if (!documents.success) return [];
    
    const docs = Array.isArray(documents.data)
      ? documents.data
      : Array.isArray(documents.data?.data)
      ? documents.data.data
      : [];
    
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    return docs.filter(d => 
      (d.category === 'bills' || d.category === 'subscription') &&
      d.dueDate &&
      d.dueDate >= monthStart &&
      d.dueDate <= monthEnd
    );
  }

  async searchDocuments(userId: string, query: string) {
    const documents = await this.getUserDocuments(userId);
    if (!documents.success) return [];
    
    const docs = Array.isArray(documents.data)
      ? documents.data
      : Array.isArray(documents.data?.data)
      ? documents.data.data
      : [];
    
    const lowerQuery = query.toLowerCase();
    return docs.filter(d => 
      d.title.toLowerCase().includes(lowerQuery) ||
      d.provider?.toLowerCase().includes(lowerQuery) ||
      d.notes?.toLowerCase().includes(lowerQuery)
    );
  }
}

export const documentsService = new DocumentsService();
