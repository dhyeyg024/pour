/**
 * GA4 Analytics helpers for POUR Protein Water.
 *
 * Uses the global `gtag` function injected by the GA4 script in layout.tsx.
 * All calls are fire-and-forget and silently skipped if gtag is not loaded
 * (e.g. during SSR or if blocked by an ad-blocker).
 */

// Extend Window so TypeScript does not complain
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeGtag(...args: any[]) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag(...args);
    }
  } catch {
    // Silently ignore - analytics should never break the app
  }
}

// GA4 Ecommerce Item shape
interface GA4Item {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_variant?: string;
}

/**
 * Fire GA4 `add_to_cart` event.
 * Call this whenever a user adds an item to their cart.
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  packLabel?: string;
}) {
  const ga4Item: GA4Item = {
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: 1,
    ...(item.packLabel ? { item_variant: item.packLabel } : {}),
  };

  safeGtag("event", "add_to_cart", {
    currency: "INR",
    value: item.price,
    items: [ga4Item],
  });
}

/**
 * Fire GA4 `purchase` event.
 * Call this after a successful order is confirmed (both COD and Razorpay).
 */
export function trackPurchase(order: {
  orderId: string;
  total: number;
  paymentMethod: "COD" | "RAZORPAY";
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    packLabel?: string;
  }>;
}) {
  const ga4Items: GA4Item[] = order.items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    ...(item.packLabel ? { item_variant: item.packLabel } : {}),
  }));

  safeGtag("event", "purchase", {
    transaction_id: order.orderId,
    value: order.total,
    currency: "INR",
    payment_type: order.paymentMethod,
    items: ga4Items,
  });
}

/**
 * Fire GA4 `begin_checkout` event.
 * Call this when the checkout modal opens.
 */
export function trackBeginCheckout(
  total: number,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    packLabel?: string;
  }>
) {
  const ga4Items: GA4Item[] = items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    ...(item.packLabel ? { item_variant: item.packLabel } : {}),
  }));

  safeGtag("event", "begin_checkout", {
    currency: "INR",
    value: total,
    items: ga4Items,
  });
}

/**
 * Generic GA4 event tracker for arbitrary custom events.
 * Used by TrackButton and any other ad-hoc tracking needs.
 */
export function trackEvent(
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>
) {
  safeGtag("event", eventName, params ?? {});
}

