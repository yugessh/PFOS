/**
 * Firestore initialization helpers for setting up user data structure
 * Called after user authentication to ensure proper collection structure
 */

import { usersService, UserProfile } from '../services/firestore/users.service';
import { doc, collection, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getFirestoreClient } from '../services/firestore/firebaseClient';
import { COLLECTIONS, SUBCOLLECTIONS } from '../constants/collections';

/**
 * Initialize user profile and empty subcollections after signup/login
 * This ensures the user document and collection structure exists
 * Users start with NO accounts - they create their own accounts
 */
export async function initializeUserData(userId: string, userData: {
  email: string;
  displayName?: string;
}): Promise<UserProfile | null> {
  try {
    // Create user profile
    const userProfile = await usersService.initializeUserProfile(userId, userData);
    
    // Initialize default categories for the user
    await initializeDefaultCategories(userId);
    
    // NOTE: No default account created - users must create their own
    // This provides a clean onboarding experience with EmptyAccountsState

    return userProfile;
  } catch (error) {
    console.error('Failed to initialize user data:', error);
    throw error;
  }
}

/**
 * Initialize default budget categories for new user
 */
async function initializeDefaultCategories(userId: string): Promise<void> {
  const db = getFirestoreClient();
  if (!db) return;

  const defaultCategories = [
    { name: 'Groceries', type: 'expense', color: '#FF6B6B', icon: 'ShoppingCart' },
    { name: 'Dining', type: 'expense', color: '#FF8A65', icon: 'UtensilsCrossed' },
    { name: 'Transport', type: 'expense', color: '#FFA726', icon: 'Car' },
    { name: 'Utilities', type: 'expense', color: '#FDD835', icon: 'Zap' },
    { name: 'Entertainment', type: 'expense', color: '#81C784', icon: 'Film' },
    { name: 'Healthcare', type: 'expense', color: '#64B5F6', icon: 'Heart' },
    { name: 'Shopping', type: 'expense', color: '#BA68C8', icon: 'ShoppingBag' },
    { name: 'Salary', type: 'income', color: '#4CAF50', icon: 'DollarSign' },
    { name: 'Bonus', type: 'income', color: '#66BB6A', icon: 'TrendingUp' },
    { name: 'Investment Returns', type: 'income', color: '#81C784', icon: 'PieChart' },
  ];

  const batch = writeBatch(db);

  defaultCategories.forEach((category, index) => {
    // Create valid document reference: users/{userId}/categories/{categoryId}
    const categoryRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES, `category_${index + 1}`);
    batch.set(categoryRef, {
      ...category,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error('Failed to initialize default categories:', error);
  }
}


/**
 * Verify user document exists (safety check)
 */
export async function verifyUserExists(userId: string): Promise<boolean> {
  try {
    const profile = await usersService.getUserProfile(userId);
    return !!profile;
  } catch (error) {
    console.error('Failed to verify user exists:', error);
    return false;
  }
}

/**
 * Get or create user profile (idempotent)
 */
export async function ensureUserProfile(userId: string, userData: {
  email: string;
  displayName?: string;
}): Promise<UserProfile | null> {
  try {
    // Check if user profile already exists
    const existingProfile = await usersService.getUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // If not, initialize
    return await initializeUserData(userId, userData);
  } catch (error) {
    console.error('Failed to ensure user profile:', error);
    return null;
  }
}
