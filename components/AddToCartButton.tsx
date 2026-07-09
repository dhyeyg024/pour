"use client";

import { useCart, type CartItem } from "@/lib/cart";
import { ShoppingCart, Check } from "lucide-react";
import { useState, useCallback } from "react";

type Props = {
  item: Omit<CartItem, "quantity">;
};

export function AddToCartButton({ item }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = useCallback(() => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }, [addItem, item]);

  return (
    <button
      className={`addToCartBtn ${added ? "addToCartBtnAdded" : ""}`}
      onClick={handleClick}
      style={{ "--accent": item.accent } as React.CSSProperties}
      aria-label={`Add ${item.name} to cart`}
      id={`add-to-cart-${item.id}`}
    >
      {added ? (
        <>
          <Check size={15} aria-hidden="true" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart size={15} aria-hidden="true" />
          Add to cart
        </>
      )}
    </button>
  );
}
