'use server';

import { adminDb } from '../lib/firebase-admin';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  writeBatch,
  query,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore';

export async function initializeFirestoreCollections() {
  try {
    const batch = adminDb.batch();

    // Create users collection with a sample document structure
    const usersCollectionRef = adminDb.collection('users');
    const sampleUserRef = usersCollectionRef.doc('sample_user');
    batch.set(sampleUserRef, {
      email: '',
      isPremium: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscriptionDetails: {
        plan: 'free',
        startDate: null,
        endDate: null,
        status: 'inactive'
      }
    });

    // Create subscriptions collection with plan details
    const subscriptionsCollectionRef = adminDb.collection('subscriptions');
    const plansRef = subscriptionsCollectionRef.doc('plans');
    batch.set(plansRef, {
      basic: {
        name: 'Basic',
        price: 0,
        features: [
          'Basic analytics',
          '5 analyses per month',
          'Standard support'
        ]
      },
      premium: {
        name: 'Premium',
        price: 999,
        features: [
          'Advanced analytics',
          'Unlimited analyses',
          'Priority support',
          'Custom report generation',
          'Real-time data processing',
          'Export functionality'
        ]
      }
    });

    // Create payments collection structure
    const paymentsCollectionRef = adminDb.collection('payments');
    const samplePaymentRef = paymentsCollectionRef.doc('sample_payment');
    batch.set(samplePaymentRef, {
      userId: '',
      amount: 0,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: '',
      razorpayPaymentId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Commit all the batch operations
    await batch.commit();

    return { success: true, message: 'Firestore collections initialized successfully' };
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
    throw error;
  }
}

export async function createUserDocument(userId: string, email: string) {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists()) {
      await userRef.set({
        email,
        isPremium: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscriptionDetails: {
          plan: 'free',
          startDate: null,
          endDate: null,
          status: 'inactive'
        }
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}

export async function createPaymentRecord(userId: string, orderId: string, amount: number) {
  try {
    const paymentRef = adminDb.collection('payments').doc();
    await paymentRef.set({
      userId,
      orderId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return paymentRef.id;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
}

export async function updatePaymentStatus(orderId: string, status: 'completed' | 'failed') {
  try {
    const paymentsRef = adminDb.collection('payments');
    const querySnapshot = await paymentsRef.where('orderId', '==', orderId).get();
    
    if (querySnapshot.empty) {
      throw new Error('Payment record not found');
    }

    const paymentDoc = querySnapshot.docs[0];
    await paymentDoc.ref.update({
      status,
      updatedAt: new Date().toISOString()
    });

    return paymentDoc.id;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

export async function updateUserSubscription(userId: string) {
  if (!userId) {
    throw new Error('User ID is required to update subscription');
  }

  try {
    // First get the current user data
    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists()) {
      throw new Error('User document not found');
    }

    const currentData = userSnap.data();
    const now = new Date().toISOString();
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Update user document while preserving existing fields
    await userRef.set({
      ...currentData,
      email: currentData.email,
      createdAt: currentData.createdAt, // Preserve original creation date
      isPremium: true,
      updatedAt: now,
      subscriptionDetails: {
        plan: 'premium',
        startDate: now,
        endDate: oneYearFromNow,
        status: 'active'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}
