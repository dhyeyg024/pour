import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PRODUCT_MAP } from "@/lib/products";

// GET /api/cart — fetch authenticated user's cart
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } }
  });

  if (!cart) {
    // Create cart if it doesn't exist (e.g. OAuth user)
    const newCart = await db.cart.create({
      data: { userId: session.user.id },
      include: { items: { include: { product: true } } }
    });
    return NextResponse.json(newCart.items);
  }

  return NextResponse.json(cart.items);
}

// POST /api/cart — add item to cart (or increment if already exists)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity = 1 } = await req.json();

  if (!productId || !PRODUCT_MAP.has(productId)) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  // Ensure cart exists
  let cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: session.user.id } });
  }

  // Upsert cart item
  const item = await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
    include: { product: true }
  });

  return NextResponse.json(item, { status: 200 });
}
