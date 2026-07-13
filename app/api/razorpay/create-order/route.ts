import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/razorpay/create-order
// Body: { amount: number }  (amount in INR rupees)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { amount?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amountInRupees = body.amount;
  if (!amountInRupees || amountInRupees <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  try {
    // Razorpay requires amount in paise (1 INR = 100 paise)
    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency: "INR",
      receipt: `pour_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[Razorpay create-order]", err);
    return NextResponse.json(
      { error: "Failed to create payment order. Please try again." },
      { status: 500 }
    );
  }
}
