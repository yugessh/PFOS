import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { isNativePlatform } from '@/src/native';
import { User, AuthCredentials, AuthError } from '../types';

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified
});

const mapAuthError = (error: any): AuthError => ({
  code: error.code,
  message: getErrorMessage(error.code)
});

const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    case 'auth/operation-not-supported-in-this-environment':
      return 'Google sign-in is not supported inside the Capacitor Android app yet. Please use email/password login.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export const authService = {
  async signIn(credentials: AuthCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async signUp(credentials: AuthCredentials): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async signInWithGoogle(): Promise<User> {
    try {
      if (await isNativePlatform()) {
        throw { code: 'auth/operation-not-supported-in-this-environment' };
      }

      const result = await signInWithPopup(auth, googleProvider);
      return mapFirebaseUser(result.user);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw mapAuthError(error);
    }
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged((firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  },

  getCurrentUser(): User | null {
    const currentUser = auth.currentUser;
    return currentUser ? mapFirebaseUser(currentUser) : null;
  }
};
