import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PRODUCT_MAP } from "@/lib/products";

// POST /api/cart/merge — merge guest (localStorage) cart into server cart on login
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json() as {
    items: Array<{ id: string; quantity: number }>;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: true, merged: 0 });
  }

  // Ensure cart exists
  let cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: session.user.id } });
  }

  let merged = 0;
  for (const guestItem of items) {
    if (!PRODUCT_MAP.has(guestItem.id) || guestItem.quantity < 1) continue;
    await db.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: guestItem.id } },
      update: { quantity: { increment: guestItem.quantity } },
      create: { cartId: cart.id, productId: guestItem.id, quantity: guestItem.quantity }
    });
    merged++;
  }

  return NextResponse.json({ ok: true, merged });
}
