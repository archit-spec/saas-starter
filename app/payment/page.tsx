'use client';

import PaymentButton from "../components/PaymentButton";
import { toast } from "sonner";

export default function PaymentPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-2xl font-bold mb-8">Payment Demo</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl mb-4">Analytics Dashboard Premium</h2>
          <p className="text-gray-600 mb-6">
            Get access to advanced analytics features and real-time insights
          </p>
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-bold">₹999</span>
            <PaymentButton 
              amount={999}
              onSuccess={() => toast.success("Payment successful!")}
              onError={() => toast.error("Payment failed. Please try again.")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
