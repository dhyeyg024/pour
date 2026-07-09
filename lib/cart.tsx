"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import { useSession } from "next-auth/react";
import { PRODUCT_MAP } from "@/lib/products";

export type CartItem = {
  id: string;       // product slug / productId
  name: string;
  accent: string;
  image: string;
  price: number;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  syncing: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  checkout: () => Promise<{ ok: boolean; orderId?: string; error?: string }>;
};

const CartContext = createContext<CartCtx | null>(null);
const GUEST_CART_KEY = "pour_cart_guest";

// ─── helpers ──────────────────────────────────────────────────────────────────

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

// Convert server CartItem (includes product relation) to our CartItem shape
function fromServer(serverItem: {
  productId: string;
  quantity: number;
  product: { name: string; accent: string; image: string; price: number };
}): CartItem {
  return {
    id: serverItem.productId,
    name: serverItem.product.name,
    accent: serverItem.product.accent,
    image: serverItem.product.image,
    price: serverItem.product.price,
    quantity: serverItem.quantity
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const prevUserIdRef = useRef<string | null>(null);

  // ── On auth state change ────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return;

    if (userId) {
      // Logged in
      const prevId = prevUserIdRef.current;
      prevUserIdRef.current = userId;

      if (!prevId) {
        // Just logged in — merge guest cart then fetch server cart
        const guest = readGuestCart();
        setSyncing(true);
        const merge = guest.length > 0
          ? fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: guest.map(i => ({ id: i.id, quantity: i.quantity })) })
            })
          : Promise.resolve();

        merge
          .then(() => fetch("/api/cart"))
          .then((r) => r.json())
          .then((serverItems: unknown[]) => {
            clearGuestCart();
            setItems((serverItems as Parameters<typeof fromServer>[0][]).map(fromServer));
          })
          .catch(console.error)
          .finally(() => setSyncing(false));
      } else {
        // Already logged in — fetch server cart on mount
        setSyncing(true);
        fetch("/api/cart")
          .then((r) => r.json())
          .then((serverItems: unknown[]) => {
            setItems((serverItems as Parameters<typeof fromServer>[0][]).map(fromServer));
          })
          .catch(console.error)
          .finally(() => setSyncing(false));
      }
    } else {
      // Guest — restore from localStorage
      if (prevUserIdRef.current) {
        // Just logged out — clear items
        setItems([]);
        prevUserIdRef.current = null;
      } else {
        setItems(readGuestCart());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, status]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity">) => {
      // Optimistic update
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        const next = existing
          ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...prev, { ...item, quantity: 1 }];
        if (!userId) writeGuestCart(next);
        return next;
      });
      setIsOpen(true);

      if (userId) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.id, quantity: 1 })
        }).catch(console.error);
      }
    },
    [userId]
  );

  const removeItem = useCallback(
    async (id: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        if (!userId) writeGuestCart(next);
        return next;
      });

      if (userId) {
        await fetch(`/api/cart/${id}`, { method: "DELETE" }).catch(console.error);
      }
    },
    [userId]
  );

  const updateQty = useCallback(
    async (id: string, qty: number) => {
      if (qty < 1) return;
      setItems((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
        if (!userId) writeGuestCart(next);
        return next;
      });

      if (userId) {
        await fetch(`/api/cart/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qty })
        }).catch(console.error);
      }
    },
    [userId]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    clearGuestCart();
  }, []);

  const checkout = useCallback(async () => {
    if (!userId) return { ok: false, error: "Not logged in." };
    try {
      const res = await fetch("/api/orders", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        return { ok: false, error: data.error ?? "Checkout failed." };
      }
      const order = await res.json();
      setItems([]);
      clearGuestCart();
      return { ok: true, orderId: order.id };
    } catch {
      return { ok: false, error: "Network error." };
    }
  }, [userId]);

  const openCart  = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items, isOpen, totalItems, totalPrice, syncing,
        addItem, removeItem, updateQty, clearCart,
        openCart, closeCart, checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
