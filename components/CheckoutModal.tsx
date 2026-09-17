"use client";

import { useCart } from "@/lib/cart";
import { useSession } from "next-auth/react";
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  CreditCard,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useState, useEffect, useCallback } from "react";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";

// ── Razorpay window type augmentation ────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email?: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ─────────────────────────────────────────────────────────────────────────────

type AddressDetails = {
  flatHouseNo: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
};

type ShippingDetails = {
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
} & AddressDetails;

// ── Field must live OUTSIDE CheckoutModal so React sees a stable component
//    reference and never unmounts/remounts it on every keystroke. ────────────
type FieldProps = {
  id: keyof ShippingDetails;
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
};

function Field({
  id,
  label,
  icon,
  required = false,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
}: FieldProps) {
  return (
    <div className="coField">
      <label htmlFor={id} className="coLabel">
        {icon}
        {label}
        {required && <span className="coRequired">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className={`coInput${error ? " coInputError" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="coFieldError">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
};

type PayStep = "idle" | "creating" | "paying" | "verifying" | "confirming";
type PaymentMethod = "RAZORPAY" | "COD";

export function CheckoutModal({ onClose }: Props) {
  const { items, totalPrice, checkout, closeCart } = useCart();
  const { data: session } = useSession();

  const [form, setForm] = useState<ShippingDetails>({
    shippingName: session?.user?.name || "",
    flatHouseNo: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    shippingPhone: "",
    shippingEmail: session?.user?.email || "",
  });
  const [errors, setErrors] = useState<Partial<ShippingDetails>>({});
  const [payStep, setPayStep] = useState<PayStep>("idle");
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string; address: string; isCOD: boolean; total: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Fire begin_checkout once when the modal opens
  useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(totalPrice, items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch City and State from Pincode
  useEffect(() => {
    async function fetchPinCodeDetails() {
      const pin = form.pincode.trim();
      if (pin.length === 6 && /^\d{6}$/.test(pin)) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          const data = await res.json();
          if (data && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const po = data[0].PostOffice[0];
            setForm((f) => ({
              ...f,
              city: po.District || f.city,
              state: po.State || f.state,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch pincode details:", error);
        }
      }
    }
    fetchPinCodeDetails();
  }, [form.pincode]);

  function validate(): boolean {
    const next: Partial<ShippingDetails> = {};
    if (!form.shippingName.trim()) next.shippingName = "Full name is required.";
    if (!form.flatHouseNo.trim()) next.flatHouseNo = "Flat / House No. is required.";
    if (!form.area.trim()) next.area = "Area is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.pincode.trim()) {
      next.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      next.pincode = "Enter a valid 6-digit pincode.";
    }
    if (!form.shippingPhone.trim()) {
      next.shippingPhone = "Mobile number is required.";
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(form.shippingPhone.trim())) {
      next.shippingPhone = "Enter a valid mobile number.";
    }
    if (form.shippingEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.shippingEmail.trim())) {
      next.shippingEmail = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // ── COD checkout ─────────────────────────────────────────────────────────────
  const handleCOD = useCallback(async () => {
    if (!validate()) return;
    setApiError(null);
    setPayStep("confirming");

    const fullAddress = `${form.flatHouseNo.trim()}, ${form.area.trim()}, ${form.city.trim()}, ${form.state.trim()} – ${form.pincode.trim()}`;

    const result = await checkout({
      shippingName: form.shippingName.trim(),
      shippingAddress: fullAddress,
      shippingPhone: form.shippingPhone.trim(),
      shippingEmail: form.shippingEmail.trim() || undefined,
      paymentMethod: "COD",
    });

    setPayStep("idle");
    if (result.ok && result.orderId) {
      trackPurchase({
        orderId: result.orderId,
        total: totalPrice,
        paymentMethod: "COD",
        items,
      });
      setSuccess({ orderId: result.orderId, address: fullAddress, isCOD: true, total: totalPrice });
    } else {
      setApiError(result.error ?? "Order placement failed. Please try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, checkout]);

  // ── Razorpay checkout ─────────────────────────────────────────────────────
  const handlePayNow = useCallback(async () => {
    if (!validate()) return;
    setApiError(null);

    // Assemble a single address string for the API / DB
    const fullAddress = `${form.flatHouseNo.trim()}, ${form.area.trim()}, ${form.city.trim()}, ${form.state.trim()} – ${form.pincode.trim()}`;

    // ── Step 1: Create a Razorpay Order server-side ──────────────────────────
    setPayStep("creating");
    let rzpOrderId: string;
    let rzpAmount: number;
    let rzpKeyId: string;

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });
      if (!res.ok) {
        const data = await res.json();
        setApiError(data.error ?? "Failed to initiate payment. Please try again.");
        setPayStep("idle");
        return;
      }
      const data = await res.json();
      rzpOrderId = data.orderId;
      rzpAmount = data.amount;
      rzpKeyId = data.keyId;
    } catch {
      setApiError("Network error. Please check your connection and try again.");
      setPayStep("idle");
      return;
    }

    // ── Step 2: Open Razorpay modal ──────────────────────────────────────────
    setPayStep("paying");

    const razorpayOptions: RazorpayOptions = {
      key: rzpKeyId,
      amount: rzpAmount,
      currency: "INR",
      name: "POUR Protein Water",
      description: `Order of ${items.length} item(s)`,
      order_id: rzpOrderId,
      prefill: {
        name: form.shippingName.trim(),
        email: form.shippingEmail.trim() || undefined,
        contact: form.shippingPhone.trim(),
      },
      theme: { color: "#0f172a" },
      modal: {
        ondismiss: () => {
          setPayStep("idle");
          setApiError("Payment was cancelled. You can try again.");
        },
      },
      handler: async (response: RazorpayResponse) => {
        // ── Step 3: Verify signature server-side ────────────────────────────
        setPayStep("verifying");
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) {
            setApiError("Payment verification failed. Please contact support.");
            setPayStep("idle");
            return;
          }

          // ── Step 4: Create DB order ────────────────────────────────────────
          setPayStep("confirming");
          const result = await checkout({
            shippingName: form.shippingName.trim(),
            shippingAddress: fullAddress,
            shippingPhone: form.shippingPhone.trim(),
            shippingEmail: form.shippingEmail.trim() || undefined,
            paymentMethod: "RAZORPAY",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
          });

          setPayStep("idle");
          if (result.ok && result.orderId) {
            trackPurchase({
              orderId: result.orderId,
              total: totalPrice,
              paymentMethod: "RAZORPAY",
              items,
            });
            setSuccess({ orderId: result.orderId, address: fullAddress, isCOD: false, total: totalPrice });
          } else {
            setApiError(result.error ?? "Payment succeeded but order creation failed. Please contact support.");
          }
        } catch {
          setApiError("Network error during verification. Please contact support.");
          setPayStep("idle");
        }
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);
    rzp.open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, totalPrice, items, checkout]);

  function handleClose() {
    if (success) closeCart();
    onClose();
  }

  const isLoading = payStep !== "idle";

  function payButtonLabel() {
    switch (payStep) {
      case "creating": return "Opening payment…";
      case "paying": return "Awaiting payment…";
      case "verifying": return "Verifying payment…";
      case "confirming": return "Confirming order…";
      default: return null;
    }
  }

  return (
    <>
      {/* Load Razorpay Checkout JS only once */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Backdrop */}
      <div className="coBackdrop" onClick={handleClose} aria-hidden="true" />

      {/* Modal */}
      <div className="coModal" role="dialog" aria-modal="true" aria-label="Checkout">
        {/* ── Header ── */}
        <header className="coHeader">
          <div className="coHeaderLeft">
            <button className="coBackBtn" onClick={handleClose} id="checkout-back-btn">
              <ChevronLeft size={18} />
              <span>Back to cart</span>
            </button>
          </div>
          <button className="coCloseBtn" onClick={handleClose} aria-label="Close checkout" id="checkout-close-btn">
            <X size={18} />
          </button>
        </header>

        {success ? (
          /* ── Success state ── */
          <div className="coSuccess">
            <div className={`coSuccessIcon${success.isCOD ? " coSuccessIconCOD" : ""}`}>
              {success.isCOD
                ? <Truck size={56} strokeWidth={1.5} />
                : <CheckCircle2 size={56} strokeWidth={1.5} />}
            </div>
            <h2 className="coSuccessTitle">
              {success.isCOD ? "Order Placed! Pay on Delivery." : "Payment Successful!"}
            </h2>
            <p className="coSuccessSub">
              Your order <strong>#{success.orderId.slice(0, 8).toUpperCase()}</strong> is confirmed.
              {success.isCOD
                ? " Please keep the exact amount ready at the time of delivery."
                : " We'll ship it soon!"}
            </p>
            {success.isCOD && (
              <div className="coCODBadge">
                <Truck size={14} /> Cash on Delivery &middot; ₹{success.total.toLocaleString("en-IN")} due at door
              </div>
            )}
            <div className="coSuccessDetail">
              <p className="coSuccessDetailLine">
                📦 Shipping to <strong>{form.shippingName}</strong>
              </p>
              <p className="coSuccessDetailLine coMuted">{success.address}</p>
              <p className="coSuccessDetailLine coMuted">{form.shippingPhone}</p>
            </div>
            <button className="primaryButton coPayBtn" onClick={handleClose} id="checkout-done-btn">
              Done
            </button>
          </div>
        ) : (
          <div className="coBody">
            {/* ── LEFT: Shipping form ── */}
            <section className="coFormSection">
              {/* <p className="coSectionKicker">Step 1 of 1</p> */}
              <h2 className="coFormTitle">Where should we send it?</h2>

              <div className="coForm">
                <Field
                  id="shippingName"
                  label="Full Name"
                  icon={<User size={14} />}
                  required
                  placeholder="e.g. Aarav Mehta"
                  value={form.shippingName}
                  error={errors.shippingName}
                  onChange={(v) => setForm((f) => ({ ...f, shippingName: v }))}
                />

                {/* ── Address sub-fields ── */}
                <Field
                  id="flatHouseNo"
                  label="Flat / House No."
                  icon={<MapPin size={14} />}
                  required
                  placeholder="e.g. 4B, Tower 2"
                  value={form.flatHouseNo}
                  error={errors.flatHouseNo}
                  onChange={(v) => setForm((f) => ({ ...f, flatHouseNo: v }))}
                />
                <Field
                  id="area"
                  label="Area / Street / Locality"
                  icon={<MapPin size={14} />}
                  required
                  placeholder="e.g. Andheri West"
                  value={form.area}
                  error={errors.area}
                  onChange={(v) => setForm((f) => ({ ...f, area: v }))}
                />
                <div className="coFieldRow">
                  <Field
                    id="city"
                    label="City"
                    icon={<MapPin size={14} />}
                    required
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    error={errors.city}
                    onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                  />
                  <Field
                    id="state"
                    label="State"
                    icon={<MapPin size={14} />}
                    required
                    placeholder="e.g. Maharashtra"
                    value={form.state}
                    error={errors.state}
                    onChange={(v) => setForm((f) => ({ ...f, state: v }))}
                  />
                </div>
                <Field
                  id="pincode"
                  label="Pincode"
                  icon={<MapPin size={14} />}
                  required
                  placeholder="e.g. 400053"
                  value={form.pincode}
                  error={errors.pincode}
                  onChange={(v) => setForm((f) => ({ ...f, pincode: v }))}
                />

                <Field
                  id="shippingPhone"
                  label="Mobile Number"
                  icon={<Phone size={14} />}
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.shippingPhone}
                  error={errors.shippingPhone}
                  onChange={(v) => setForm((f) => ({ ...f, shippingPhone: v }))}
                />
                <Field
                  id="shippingEmail"
                  label="Email Address"
                  icon={<Mail size={14} />}
                  type="email"
                  placeholder="you@example.com (optional)"
                  value={form.shippingEmail}
                  error={errors.shippingEmail}
                  onChange={(v) => setForm((f) => ({ ...f, shippingEmail: v }))}
                />
              </div>

              <p className="coNote">
                <span className="coRequired">*</span> Required fields
              </p>
            </section>

            {/* ── RIGHT: Order summary + Pay Now ── */}
            <aside className="coSummarySection">
              <p className="coSectionKicker">Order Summary</p>
              <h2 className="coFormTitle">Your Items</h2>

              <ul className="coItemList">
                {items.map((item) => (
                  <li key={item.id} className="coItem">
                    <div className="coItemImg" style={{ borderColor: item.accent }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="52px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className="coItemInfo">
                      <p className="coItemName">{item.name}</p>
                      <p className="coItemMeta">
                        {item.packLabel ?? "1 Can"} &times; {item.quantity}
                      </p>
                    </div>
                    <p className="coItemTotal">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </li>
                ))}
              </ul>

              <div className="coSummaryDivider" />

              <div className="coTotalRow">
                <span>Subtotal</span>
                <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
              </div>
              <div className="coTotalRow coShipping">
                <span>Shipping</span>
                <strong className="coFree">FREE</strong>
              </div>
              <div className="coTotalRow coGrandTotal">
                <span>Total</span>
                <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
              </div>

              {/* ── Payment Method Toggle ── */}
              <div className="coPayMethodSection">
                <p className="coPayMethodLabel">Payment Method</p>
                <div className="coPayMethodToggle">
                  <button
                    id="pay-method-razorpay"
                    className={`coPayMethodBtn${paymentMethod === "RAZORPAY" ? " coPayMethodBtnActive" : ""}`}
                    onClick={() => setPaymentMethod("RAZORPAY")}
                    disabled={isLoading}
                    type="button"
                  >
                    <CreditCard size={15} />
                    Pay Online
                  </button>
                  <button
                    id="pay-method-cod"
                    className={`coPayMethodBtn${paymentMethod === "COD" ? " coPayMethodBtnActive coPayMethodBtnCOD" : ""}`}
                    onClick={() => setPaymentMethod("COD")}
                    disabled={isLoading}
                    type="button"
                  >
                    <Truck size={15} />
                    Cash on Delivery
                  </button>
                </div>
                {paymentMethod === "COD" && (
                  <p className="coCODNote">
                    Pay ₹{totalPrice.toLocaleString("en-IN")} in cash when your order arrives.
                    Please keep exact change ready.
                  </p>
                )}
              </div>

              {apiError && (
                <p className="coApiError">{apiError}</p>
              )}

              {paymentMethod === "COD" ? (
                <>
                  <button
                    className="primaryButton coPayBtn coPayBtnCOD"
                    id="checkout-cod-btn"
                    disabled={isLoading}
                    onClick={handleCOD}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="coSpinner" />
                        {payButtonLabel() ?? "Placing order…"}
                      </>
                    ) : (
                      <>
                        <Truck size={17} />
                        Place Order &middot; Pay on Delivery
                      </>
                    )}
                  </button>
                  <p className="coPayNote">
                    <ShoppingBag size={13} />
                    Cash on Delivery &middot; Pay when your order arrives
                  </p>
                </>
              ) : (
                <>
                  <button
                    className="primaryButton coPayBtn"
                    id="checkout-pay-btn"
                    disabled={isLoading}
                    onClick={handlePayNow}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="coSpinner" />
                        {payButtonLabel()}
                      </>
                    ) : (
                      <>
                        <CreditCard size={17} />
                        Pay ₹{totalPrice.toLocaleString("en-IN")}
                      </>
                    )}
                  </button>
                  <p className="coPayNote">
                    <ShoppingBag size={13} />
                    Secured by Razorpay &middot; UPI, Cards, Netbanking &amp; more
                  </p>
                </>
              )}
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
