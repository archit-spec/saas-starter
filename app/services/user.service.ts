'use server';

import { getAdminDb, getAdminAuth } from '../lib/firebase-admin';
import { User } from 'firebase/auth';
import { createOrder, verifyPayment } from '../actions/razorpay';

interface UserSubscription {
  isPremium: boolean;
  startDate: string;
  endDate: string;
  plan: string;
}

interface UserProfile {
  email: string;
  displayName?: string;
  photoURL?: string;
  subscription?: UserSubscription;
  lastLogin: string;
}

export async function createOrUpdateUser(user: User) {
  try {
    console.log('Starting createOrUpdateUser for user:', user.uid);
    const db = await getAdminDb();
    console.log('Got Firestore instance');
    const auth = await getAdminAuth();
    console.log('Got Auth instance');
    
    if (!db) {
      throw new Error('Firestore instance is undefined');
    }
    
    console.log('Creating user reference');
    const userRef = db.collection('users').doc(user.uid);
    console.log('Getting user document');
    const userDoc = await userRef.get();
    
    const userData: UserProfile = {
      email: user.email!,
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
      lastLogin: new Date().toISOString(),
    };

    console.log('Updating/creating user document');
    if (!userDoc.exists) {
      // Create new user
      await userRef.set({
        ...userData,
        createdAt: new Date().toISOString(),
      });
      console.log('Created new user document');
    } else {
      // Update existing user
      await userRef.update(userData);
      console.log('Updated existing user document');
    }

    console.log('Creating custom token');
    const token = await auth.createCustomToken(user.uid);
    console.log('Successfully created custom token');
    
    return { token, userData };
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw new Error('Failed to process user data: ' + error.message);
  }
}

export async function initiateSubscription(userId: string, amount: number, plan: string) {
  try {
    const db = await getAdminDb();
    if (!db) {
      throw new Error('Firestore instance is undefined');
    }
    
    // Create Razorpay order
    const order = await createOrder(amount, userId);
    
    // Update user document with pending subscription
    await db.collection('users').doc(userId).update({
      'subscription.pending': {
        plan,
        amount,
        orderId: order.orderId,
        createdAt: new Date().toISOString(),
      }
    });

    return order;
  } catch (error) {
    console.error('Error in initiateSubscription:', error);
    throw new Error('Failed to initiate subscription');
  }
}

export async function finalizeSubscription(
  userId: string, 
  orderId: string, 
  paymentId: string, 
  signature: string
) {
  try {
    const db = await getAdminDb();
    if (!db) {
      throw new Error('Firestore instance is undefined');
    }
    
    // Verify payment
    const verification = await verifyPayment(orderId, paymentId, signature, userId);
    
    if (verification.success) {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (!userData?.subscription?.pending) {
        throw new Error('No pending subscription found');
      }

      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      // Update subscription status
      await userRef.update({
        subscription: {
          isPremium: true,
          plan: userData.subscription.pending.plan,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          lastPaymentId: paymentId,
          lastPaymentDate: now.toISOString(),
        },
        'subscription.pending': db.FieldValue.delete(),
      });

      return { success: true };
    }
    throw new Error('Payment verification failed');
  } catch (error) {
    console.error('Error in finalizeSubscription:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const db = await getAdminDb();
    if (!db) {
      throw new Error('Firestore instance is undefined');
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

export async function checkSubscription(userId: string): Promise<boolean> {
  try {
    const db = await getAdminDb();
    if (!db) {
      throw new Error('Firestore instance is undefined');
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData?.subscription?.isPremium) {
      return false;
    }

    const endDate = new Date(userData.subscription.endDate);
    return endDate > new Date();
  } catch (error) {
    console.error('Error in checkSubscription:', error);
    return false;
  }
}
