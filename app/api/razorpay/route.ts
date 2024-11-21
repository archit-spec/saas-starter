'use server';

import { NextRequest, NextResponse } from "next/server";
import { createOrder, verifyPayment } from "@/app/actions/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { amount, userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const order = await createOrder(amount, userId);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}
