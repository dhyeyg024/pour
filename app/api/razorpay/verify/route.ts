import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

// POST /api/razorpay/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing payment verification fields." },
      { status: 400 }
    );
  }

  // HMAC-SHA256: key = key_secret, data = order_id + "|" + payment_id
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { valid: false, error: "Payment verification failed. Signature mismatch." },
      { status: 400 }
    );
  }

  return NextResponse.json({ valid: true });
}
