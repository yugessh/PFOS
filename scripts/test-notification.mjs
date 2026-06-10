import fs from 'fs';
import path from 'path';

// Load env from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2] || '';
      // strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function validateConfig(cfg) {
  return cfg.apiKey && cfg.projectId && cfg.appId;
}

if (!validateConfig(config)) {
  console.error('Missing Firebase config in .env.local; aborting test.');
  process.exit(1);
}

const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const userId = process.argv[2] || 'audit-test-user';
  console.log('Using userId:', userId);

  const colPath = `users/${userId}/notifications`;
  const colRef = collection(db, colPath);

  console.log('Creating a test notification...');
  const now = new Date();
  const payload = {
    userId,
    type: 'integration_test',
    title: 'Integration test notification',
    message: `Test created at ${now.toISOString()}`,
    priority: 'high',
    isRead: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(colRef, payload);
  console.log('Created notification id:', docRef.id);

  // Read latest notifications
  console.log('Reading latest notifications (limit 5)...');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(5));
  const snap = await getDocs(q);
  console.log(`Retrieved ${snap.size} notifications:`);
  snap.forEach((d) => {
    const data = d.data();
    console.log('-', d.id, data.type, data.title, data.priority, data.isRead ? 'read' : 'unread');
  });

  // Unread count
  console.log('Counting unread notifications...');
  const qUnread = query(colRef, where('isRead', '==', false), where('isArchived', '==', false));
  const snapUnread = await getDocs(qUnread);
  console.log('Unread count:', snapUnread.size);

  console.log('Test completed.');
}

run().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
