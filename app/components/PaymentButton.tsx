'use client';

import { Button } from "@/components/ui/button";
import { initiatePayment } from "../lib/razorpay";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface PaymentButtonProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export default function PaymentButton({ 
  amount, 
  onSuccess, 
  onError 
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to make a payment");
      return;
    }

    try {
      setLoading(true);
      await initiatePayment({
        amount,
        userId: user.uid,
        name: "Analytics Dashboard",
        description: "Payment for Analytics Dashboard",
        prefill: {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          contact: ''
        }
      });
      onSuccess?.();
    } catch (error) {
      console.error("Payment failed:", error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || !user}
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </Button>
  );
}
