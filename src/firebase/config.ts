export type FirebaseEnv = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

export function getFirebaseEnv(): FirebaseEnv {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

export function isFirebaseConfigComplete(env: FirebaseEnv) {
  return Boolean(env.apiKey && env.projectId && env.appId);
}

/**
 * Notes:
 * - Firebase config values are provided by environment variables following Next.js conventions.
 * - Add values to `.env.local` in the project root. Do not commit that file.
 * - Example values come from your Firebase console -> Project settings -> Web SDK config.
 */
