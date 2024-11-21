// app/lib/razorpay.ts
'use client';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    document.body.appendChild(script);
  });
};

interface InitiatePaymentProps {
  amount: number;
  userId: string;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export const initiatePayment = async ({
  amount,
  userId,
  currency = 'INR',
  name,
  description = '',
  image = '',
  prefill = {}
}: InitiatePaymentProps) => {
  try {
    // Load the Razorpay script if not already loaded
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }

    // Create order on the server
    const response = await fetch('/api/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, userId }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create order');

    // Initialize Razorpay payment
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency,
      name,
      description,
      image,
      order_id: data.orderId,
      prefill,
      handler: async function (response: any) {
        try {
          const verificationResponse = await fetch('/api/razorpay', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId,
            }),
          });

          const verificationData = await verificationResponse.json();
          if (!verificationResponse.ok) {
            throw new Error(verificationData.error || 'Payment verification failed');
          }

          return verificationData;
        } catch (error) {
          console.error('Payment verification error:', error);
          throw error;
        }
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

    return new Promise((resolve, reject) => {
      rzp.on('payment.success', resolve);
      rzp.on('payment.error', reject);
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
};