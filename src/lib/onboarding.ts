import { getFirestoreSafe } from '@/src/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type OnboardingRecord = {
  id?: string;
  userId: string;
  currency: string;
  country?: string;
  financialGoal?: string;
  monthlyIncome?: number;
  defaultAccount?: string;
  notificationSettings?: Record<string, boolean>;
  onboardingCompleted?: boolean;
  dashboardPreference?: string;
  createdAt?: any;
};

export async function saveOnboarding(record: OnboardingRecord) {
  const db = getFirestoreSafe();
  if (!db) {
    // Firestore not initialized; fallback to localStorage
    try {
      localStorage.setItem('pfos_onboarding', JSON.stringify(record));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to persist onboarding locally', e);
    }
    return null;
  }

  const ref = await addDoc(collection(db, 'onboardings'), {
    ...record,
    onboardingCompleted: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
