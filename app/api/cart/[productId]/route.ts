import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// PUT /api/cart/[productId] — update quantity
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;
  const { quantity } = await req.json();

  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity." }, { status: 400 });
  }

  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return NextResponse.json({ error: "Cart not found." }, { status: 404 });

  const item = await db.cartItem.update({
    where: { cartId_productId: { cartId: cart.id, productId } },
    data: { quantity }
  });

  return NextResponse.json(item);
}

// DELETE /api/cart/[productId] — remove item from cart
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;

  const cart = await db.cart.findUnique({ where: { userId: session.user.id } });
  if (!cart) return NextResponse.json({ error: "Cart not found." }, { status: 404 });

  await db.cartItem.delete({
    where: { cartId_productId: { cartId: cart.id, productId } }
  });

  return NextResponse.json({ ok: true });
}
