'use server';

import { db } from '../lib/firebase';
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
    const batch = writeBatch(db);

    // Create users collection with a sample document structure
    const usersCollectionRef = collection(db, 'users');
    const sampleUserRef = doc(usersCollectionRef, 'sample_user');
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
    const subscriptionsCollectionRef = collection(db, 'subscriptions');
    const plansRef = doc(subscriptionsCollectionRef, 'plans');
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
    const paymentsCollectionRef = collection(db, 'payments');
    const samplePaymentRef = doc(paymentsCollectionRef, 'sample_payment');
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
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
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

export async function createPaymentRecord(
  userId: string,
  orderId: string,
  amount: number
) {
  if (!userId || !orderId || !amount) {
    throw new Error('Missing required fields for payment record');
  }

  try {
    const paymentRef = doc(collection(db, 'payments'));
    await setDoc(paymentRef, {
      userId: userId,
      amount: Number(amount),
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { success: true, paymentId: paymentRef.id };
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
}

export async function updateUserSubscription(userId: string) {
  if (!userId) {
    throw new Error('User ID is required to update subscription');
  }

  try {
    // First get the current user data
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User document not found');
    }

    const currentData = userSnap.data();
    const now = new Date().toISOString();
    const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // Update user document while preserving existing fields
    await setDoc(userRef, {
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
