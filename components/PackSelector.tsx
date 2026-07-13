"use client";

import { useState } from "react";
import { PACKS, type Pack } from "@/lib/products";
import { useCart, type CartItem } from "@/lib/cart";
import { ShoppingCart, Check } from "lucide-react";

type Props = {
  item: Omit<CartItem, "quantity" | "price" | "productId">;
};

export function PackSelector({ item }: Props) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Pack>(PACKS[0]);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      ...item,
      // Compound id: productSlug-cans ensures different packs = different cart lines
      id: `${item.id}-${selected.cans}`,
      productId: item.id,   // raw slug for API — e.g. "guava-chilli"
      price: selected.total,
      packLabel: selected.label,
      cans: selected.cans,
    } as Omit<CartItem, "quantity">);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="packSelector">
      {/* Pack size grid */}
      <div className="packGrid" role="radiogroup" aria-label="Choose a pack size">
        {PACKS.map((pack) => {
          const active = pack.cans === selected.cans;
          return (
            <button
              key={pack.cans}
              role="radio"
              aria-checked={active}
              className={`packOption ${active ? "packOptionActive" : ""}`}
              onClick={() => setSelected(pack)}
              id={`pack-${item.id}-${pack.cans}`}
              style={{ "--accent": item.accent } as React.CSSProperties}
            >
              <span className="packCans">{pack.label}</span>
              <span className="packPrice">₹{pack.total.toLocaleString("en-IN")}</span>
              {pack.badge && (
                <span className="packBadge">{pack.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary row + CTA */}
      <div className="packSummary">
        <div className="packSummaryInfo">
          <span className="packSummaryTotal">₹{selected.total.toLocaleString("en-IN")}</span>
          {selected.cans > 1 && (
            <span className="packSummaryPerCan">₹{selected.perCan}/can</span>
          )}
        </div>
        <button
          className={`addToCartBtn packAddBtn ${added ? "addToCartBtnAdded" : ""}`}
          onClick={handleAdd}
          style={{ "--accent": item.accent } as React.CSSProperties}
          aria-label={`Add ${selected.label} of ${item.name} to cart`}
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
      </div>
    </div>
  );
}
