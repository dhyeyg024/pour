import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";

// Products are static — cache for 1 hour
export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(PRODUCTS);
}
