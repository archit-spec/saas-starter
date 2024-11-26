'use server';

import { getAdminDb } from '../lib/firebase-admin';

export async function createUserDocument(userId: string, email: string) {
  if (!userId || !email) {
    throw new Error('User ID and email are required to create user document');
  }

  try {
    const adminDb = await getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      const userData = {
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
      };

      await userRef.set(userData);
      return { success: true, message: 'User document created successfully' };
    }

    // Update existing user
    await userRef.update({
      email,
      updatedAt: new Date().toISOString()
    });

    return { success: true, message: 'User document updated successfully' };
  } catch (error) {
    console.error('Error creating/updating user document:', error);
    throw new Error('Failed to process user data: ' + error.message);
  }
}

export async function createPaymentRecord(userId: string, orderId: string, amount: number) {
  try {
    const adminDb = await getAdminDb();
    const paymentRef = adminDb.collection('payments').doc(orderId);
    
    await paymentRef.set({
      userId,
      amount,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw new Error('Failed to create payment record');
  }
}

export async function updatePaymentStatus(orderId: string, status: 'completed' | 'failed') {
  try {
    const adminDb = await getAdminDb();
    const paymentRef = adminDb.collection('payments').doc(orderId);
    
    await paymentRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
}

export async function updateUserSubscription(userId: string) {
  try {
    const adminDb = await getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User document not found');
    }

    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    await userRef.update({
      isPremium: true,
      'subscriptionDetails.plan': 'premium',
      'subscriptionDetails.startDate': currentDate.toISOString(),
      'subscriptionDetails.endDate': endDate.toISOString(),
      'subscriptionDetails.status': 'active',
      updatedAt: currentDate.toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw new Error('Failed to update user subscription');
  }
}
