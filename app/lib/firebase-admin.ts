'use server';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }),
};

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp(firebaseAdminConfig);
  }
  return getFirestore();
}

export const adminDb = initializeFirebaseAdmin();
