'use server';

import * as admin from 'firebase-admin';
import { getApps, getApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  throw new Error('Missing required Firebase Admin configuration');
}

function getAdminApp() {
  try {
    return getApps().length === 0
      ? initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
        })
      : getApp();
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export async function getAdminDb() {
  try {
    const app = getAdminApp();
    return getFirestore(app);
  } catch (error) {
    console.error('Error getting Firestore instance:', error);
    throw error;
  }
}

export async function getAdminAuth() {
  try {
    const app = getAdminApp();
    return getAuth(app);
  } catch (error) {
    console.error('Error getting Auth instance:', error);
    throw error;
  }
}
