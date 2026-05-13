/**
 * Firebase Configuration Validation Utility
 * 
 * This utility provides safe Firebase initialization with proper validation
 * and developer-friendly error messages when environment variables are missing.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Add a web app to your Firebase project
 * 3. Copy the Firebase configuration from the Firebase console
 * 4. Create a .env.local file in the project root
 * 5. Add the following environment variables:
 * 
 *    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
 *    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
 *    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
 *    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
 *    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 *    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
 * 
 * 6. Restart the development server after adding environment variables
 */

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Validate Firebase configuration
 * Returns validated config or throws detailed error
 */
export function validateFirebaseConfig(): FirebaseConfig {
  const config: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
  };

  const missingFields: string[] = [];
  
  if (!config.apiKey) missingFields.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!config.authDomain) missingFields.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missingFields.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!config.storageBucket) missingFields.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!config.messagingSenderId) missingFields.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!config.appId) missingFields.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missingFields.length > 0) {
    throw new FirebaseConfigError(missingFields);
  }

  return config;
}

/**
 * Custom error class for Firebase configuration issues
 */
export class FirebaseConfigError extends Error {
  public missingFields: string[];
  
  constructor(missingFields: string[]) {
    super(
      `Firebase configuration is incomplete. Missing environment variables:\n` +
      `${missingFields.map(field => `  - ${field}`).join('\n')}\n\n` +
      `To fix this:\n` +
      `1. Create a .env.local file in your project root\n` +
      `2. Add the missing environment variables from your Firebase console\n` +
      `3. Restart the development server\n\n` +
      `Example .env.local:\n` +
      `NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key\n` +
      `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com\n` +
      `NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id\n` +
      `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com\n` +
      `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\n` +
      `NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`
    );
    this.name = 'FirebaseConfigError';
    this.missingFields = missingFields;
  }
}

/**
 * Check if Firebase configuration is valid without throwing
 * Useful for conditional rendering or feature flags
 */
export function isFirebaseConfigValid(): boolean {
  try {
    validateFirebaseConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Firebase configuration with safe defaults for development
 * This allows the app to run without crashing, but with limited functionality
 */
export function getSafeFirebaseConfig(): FirebaseConfig | null {
  try {
    return validateFirebaseConfig();
  } catch (error) {
    console.warn('Firebase configuration is incomplete. Authentication features will be disabled.');
    return null;
  }
}
