import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreClient } from './firebaseClient';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  createdAt: any;
  updatedAt: any;
  onboardingCompleted?: boolean;
  preferences?: {
    currency?: string;
    language?: string;
    theme?: 'light' | 'dark';
    notifications?: boolean;
  };
}

/**
 * Users service for managing user profiles and accounts
 */
export class UsersService extends BaseFirestoreService<UserProfile> {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  /**
   * Create or update a user profile
   * Called after user registration/login
   */
  async initializeUserProfile(userId: string, userData: {
    email: string;
    displayName?: string;
  }): Promise<UserProfile> {
    const db = getFirestoreClient();
    if (!db) {
      throw new Error('Firestore client not initialized');
    }

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    
    const profile: Partial<UserProfile> = {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingCompleted: false,
      preferences: {
        currency: 'INR',
        language: 'en',
        theme: 'light',
        notifications: true,
      },
    };

    await setDoc(userRef, profile, { merge: true });

    return {
      id: userId,
      ...profile,
    } as UserProfile;
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const response = await this.getById(userId);
    if (response.success && response.data) {
      return response.data as UserProfile;
    }
    return null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const response = await this.update(userId, updates);
    if (response.success && response.data) {
      return response.data as UserProfile;
    }
    return null;
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(userId: string): Promise<void> {
    await this.update(userId, { onboardingCompleted: true });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    await this.update(userId, { preferences });
  }
}

// Export singleton instance
export const usersService = new UsersService();
