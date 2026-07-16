import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Derive the transaction-client type from db.$transaction without importing
// Prisma namespace (removed in Prisma v7).
type TransactionClient = Parameters<
  Extract<Parameters<typeof db.$transaction>[0], (...args: never[]) => unknown>
>[0];

// GET /api/orders — fetch user's order history
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(orders);
}

// POST /api/orders — create order from current cart after payment is verified
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse shipping + payment details from request body
  let body: {
    shippingName?: string;
    shippingAddress?: string;
    shippingPhone?: string;
    shippingEmail?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  const {
    shippingName,
    shippingAddress,
    shippingPhone,
    shippingEmail,
    razorpayOrderId,
    razorpayPaymentId,
  } = body;

  if (!shippingName?.trim() || !shippingAddress?.trim() || !shippingPhone?.trim()) {
    return NextResponse.json(
      { error: "Full name, address and mobile number are required." },
      { status: 400 }
    );
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } }
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const total = cart.items.reduce<number>(
    (sum: number, item: { unitPrice: number; quantity: number }) =>
      sum + item.unitPrice * item.quantity,
    0
  );

  const order = await db.$transaction(async (tx: TransactionClient) => {
    const newOrder = await tx.order.create({
      data: {
        userId: session.user.id,
        total,
        // CONFIRMED because Razorpay payment was verified before this call
        status: razorpayPaymentId ? "CONFIRMED" : "PENDING",
        shippingName: shippingName.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingEmail: shippingEmail?.trim() || null,
        razorpayOrderId: razorpayOrderId ?? null,
        razorpayPaymentId: razorpayPaymentId ?? null,
        items: {
          create: cart.items.map((item: { productId: string; quantity: number; unitPrice: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.unitPrice
          }))
        }
      },
      include: { items: { include: { product: true } } }
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return NextResponse.json(order, { status: 201 });
}
