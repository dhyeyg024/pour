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
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity = 1, unitPrice } = await req.json();

    if (!productId || !PRODUCT_MAP.has(productId)) {
      return NextResponse.json({ error: "Invalid product." }, { status: 400 });
    }

    // Use the pack price sent by the client; fall back to the base per-can price
    const product = PRODUCT_MAP.get(productId)!;
    const resolvedUnitPrice: number =
      typeof unitPrice === "number" && unitPrice > 0 ? unitPrice : product.price;

    // Ensure cart exists
    let cart = await db.cart.findUnique({ where: { userId: session.user.id } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId: session.user.id } });
    }

    // Upsert cart item — always overwrite unitPrice with the latest selection
    const item = await db.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity }, unitPrice: resolvedUnitPrice },
      create: { cartId: cart.id, productId, quantity, unitPrice: resolvedUnitPrice },
      include: { product: true }
    });

    return NextResponse.json(item, { status: 200 });
  } catch (err) {
    console.error("[POST /api/cart]", err);
    return NextResponse.json(
      { error: "Internal server error.", detail: String(err) },
      { status: 500 }
    );
  }
}
