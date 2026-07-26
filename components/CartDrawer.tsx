"use client";

import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

export function CartDrawer() {
  const { items, isOpen, closeCart, openCart, removeItem, updateQty, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (user && params.get("checkout") === "true") {
        if (!isOpen) openCart();
        setShowCheckout(true);
        router.replace(window.location.pathname);
      }
    }
  }, [user, isOpen, openCart, router]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="cartBackdrop"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="cartDrawer" aria-label="Shopping cart">
        <header className="cartHeader">
          <div className="cartHeaderLeft">
            <ShoppingBag size={20} aria-hidden="true" />
            <h2>Your Cart</h2>
            {totalItems > 0 && (
              <span className="cartBadgeInline">{totalItems}</span>
            )}
          </div>
          <button
            className="cartClose"
            onClick={closeCart}
            aria-label="Close cart"
            id="cart-close-btn"
          >
            <X size={20} />
          </button>
        </header>

        <div className="cartBody">
          {items.length === 0 ? (
            <div className="cartEmpty">
              <ShoppingBag size={48} strokeWidth={1.2} />
              <p>Your cart is empty.</p>
              <button className="secondaryButton cartShopBtn" onClick={closeCart}>
                Browse flavours
              </button>
            </div>
          ) : (
            <ul className="cartList">
              {items.map((item) => (
                <li key={item.id} className="cartItem">
                  <div
                    className="cartItemImage"
                    style={{ borderColor: item.accent }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="72px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className="cartItemInfo">
                    <p className="cartItemName">{item.name}</p>
                    <p className="cartItemPrice">
                      {item.packLabel ?? "1 Can"} · ₹{item.price.toLocaleString("en-IN")}
                    </p>
                    <div className="cartQty">
                      <button
                        className="qtyBtn"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        id={`cart-qty-dec-${item.id}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="qtyBtn"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        id={`cart-qty-inc-${item.id}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cartItemRight">
                    <p className="cartItemTotal">₹{item.price * item.quantity}</p>
                    <button
                      className="cartRemove"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                      id={`cart-remove-${item.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="cartFooter">
            <div className="cartTotal">
              <span>Total</span>
              <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
            </div>
            {user ? (
              <button
                className="primaryButton cartCheckout"
                id="cart-checkout-btn"
                onClick={() => setShowCheckout(true)}
              >
                Checkout
              </button>
            ) : (
              <>
                <p className="cartLoginNote">Sign in to complete your order</p>
                <button
                  className="primaryButton cartCheckout"
                  id="cart-login-btn"
                  onClick={() => { 
                    closeCart(); 
                    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
                    router.push(`/login?callbackUrl=${encodeURIComponent(currentPath + "?checkout=true")}`); 
                  }}
                >
                  Sign in to checkout
                </button>
              </>
            )}
          </footer>
        )}
      </aside>

      {/* Checkout modal — rendered on top of the drawer */}
      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}
    </>
  );
}
