import { collection, limit, orderBy, query, Timestamp } from 'firebase/firestore';
import { SUBCOLLECTIONS } from '@/src/constants/collections';
import { getFirestoreClient } from './firebaseClient';
import { addDocSafe, getDocsSafe } from './safeFirestore';
import type { CoachRecommendation, CoachRisk, CoachTimelineItem, FinancialCoachSnapshot } from '@/src/lib/financial-coach';

function getCollection(path: string) {
  const db = getFirestoreClient();
  if (!db) throw new Error('Firestore client not available');
  return collection(db, path);
}

export class FinancialCoachService {
  async saveHealthScore(userId: string, snapshot: FinancialCoachSnapshot) {
    const ref = getCollection(SUBCOLLECTIONS.USER_FINANCIAL_HEALTH_SCORES(userId));
    const now = Timestamp.fromDate(new Date());
    return addDocSafe(ref as any, {
      userId,
      overallScore: snapshot.overallScore,
      financialHealthScore: snapshot.financialHealthScore,
      metrics: snapshot.metrics,
      breakdown: snapshot.healthBreakdown,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    } as any);
  }

  async saveRecommendations(userId: string, recommendations: CoachRecommendation[]) {
    const ref = getCollection(SUBCOLLECTIONS.USER_AI_RECOMMENDATIONS(userId));
    const now = Timestamp.fromDate(new Date());
    await Promise.all(recommendations.map((recommendation) => addDocSafe(ref as any, { userId, ...recommendation, createdAt: now, updatedAt: now, deletedAt: null } as any)));
  }

  async saveRiskAssessments(userId: string, risks: CoachRisk[]) {
    const ref = getCollection(SUBCOLLECTIONS.USER_AI_RISK_ASSESSMENTS(userId));
    const now = Timestamp.fromDate(new Date());
    await Promise.all(risks.map((risk) => addDocSafe(ref as any, { userId, ...risk, createdAt: now, updatedAt: now, deletedAt: null } as any)));
  }

  async appendHistory(userId: string, items: CoachTimelineItem[]) {
    const ref = getCollection(SUBCOLLECTIONS.USER_AI_COACH_HISTORY(userId));
    await Promise.all(items.map((item) => addDocSafe(ref as any, { userId, ...item, createdAt: Timestamp.fromDate(item.createdAt || new Date()), updatedAt: Timestamp.fromDate(new Date()), deletedAt: null } as any)));
  }

  async getHistory(userId: string) {
    try {
      const ref = getCollection(SUBCOLLECTIONS.USER_AI_COACH_HISTORY(userId));
      const snapshot = await getDocsSafe(query(ref, orderBy('createdAt', 'desc'), limit(25)) as any);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() || {};
        return {
          id: docSnap.id,
          title: String(data.title || ''),
          detail: String(data.detail || ''),
          status: (data.status || 'new') as CoachTimelineItem['status'],
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });
    } catch (error) {
      console.error('FinancialCoachService.getHistory', error);
      return [];
    }
  }
}

export const financialCoachService = new FinancialCoachService();
