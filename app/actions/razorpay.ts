'use server';

import Razorpay from 'razorpay';
import { createPaymentRecord, updateUserSubscription } from './firestore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function createOrder(amount: number, userId: string) {
  try {
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    // Create payment record in Firestore
    await createPaymentRecord(userId, order.id, amount);

    return {
      orderId: order.id,
      amount: amount * 100,
      currency: "INR",
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  userId: string
) {
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Update payment status and user subscription
    const paymentDoc = await updatePaymentStatus(razorpay_order_id, 'completed');
    if (paymentDoc.success) {
      await updateUserSubscription(userId);
    }
    return { success: true };
  } else {
    throw new Error("Payment verification failed");
  }
}

async function updatePaymentStatus(orderId: string, status: 'completed' | 'failed') {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('razorpayOrderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Payment record not found');
    }

    const paymentDoc = querySnapshot.docs[0];
    await updateDoc(paymentDoc.ref, {
      status,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

async function updateUserSubscription(userId: string) {
  // TO DO: implement user subscription update logic
  const subscriptionsRef = collection(db, 'subscriptions');
  const q = query(subscriptionsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('User document not found');
  }

  const subscriptionDoc = querySnapshot.docs[0];
  await updateDoc(subscriptionDoc.ref, {
    isPremium: true,
    updatedAt: new Date().toISOString()
  });

  return { success: true };
  
  
}
