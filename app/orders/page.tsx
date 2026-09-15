"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/lib/auth";
import {
  Search,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  priceAtOrder: number;
  product: {
    id: string;
    name: string;
    tone: string;
    accent: string;
    image: string;
  };
};

type OrderStatus =
  | "PENDING"
  | "COD_PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  shippingEmail: string | null;
  paymentMethod: "RAZORPAY" | "COD";
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  items: OrderItem[];
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [activeEmail, setActiveEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    setActiveEmail(targetEmail.trim().toLowerCase());

    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(targetEmail.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch orders.");
      }
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fill and fetch if user is logged in
  useEffect(() => {
    if (user?.email && !activeEmail && !searched) {
      setEmailInput(user.email);
      fetchOrders(user.email);
    }
  }, [user, activeEmail, searched, fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(emailInput);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="orderBadge badgeConfirmed">
            <CheckCircle2 size={14} /> Confirmed
          </span>
        );
      case "SHIPPED":
        return (
          <span className="orderBadge badgeShipped">
            <Truck size={14} /> Shipped
          </span>
        );
      case "DELIVERED":
        return (
          <span className="orderBadge badgeDelivered">
            <PackageCheck size={14} /> Delivered
          </span>
        );
      case "COD_PENDING":
        return (
          <span className="orderBadge badgePending">
            <Clock size={14} /> COD Pending
          </span>
        );
      case "PENDING":
        return (
          <span className="orderBadge badgePending">
            <Clock size={14} /> Payment Pending
          </span>
        );
      case "CANCELLED":
        return (
          <span className="orderBadge badgeCancelled">
            <XCircle size={14} /> Cancelled
          </span>
        );
      default:
        return <span className="orderBadge">{status}</span>;
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="ordersPage">
      <NavBar />

      <main className="ordersContainer">
        <header className="ordersHeader">
          <h1 className="ordersTitle">My Orders</h1>
          <p className="ordersSubtitle">
            Track your order status and view complete purchase history using your email address.
          </p>

          <form onSubmit={handleSearch} className="ordersSearchForm">
            <div className="ordersSearchInputWrapper">
              <Mail className="ordersSearchIcon" size={20} />
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="ordersSearchInput"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !emailInput.trim()}
              className="ordersSearchBtn"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Find Orders
                </>
              )}
            </button>
          </form>

          {error && <div className="ordersErrorBanner">{error}</div>}
        </header>

        {searched && !loading && orders.length > 0 && (
          <section className="ordersSummaryBar">
            <div className="summaryStat">
              <span className="summaryStatLabel">Total Orders</span>
              <span className="summaryStatValue">{orders.length}</span>
            </div>
            <div className="summaryStatDivider" />
            <div className="summaryStat">
              <span className="summaryStatLabel">Total Amount Spent</span>
              <span className="summaryStatValue">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="summaryStatDivider" />
            <div className="summaryStat">
              <span className="summaryStatLabel">Active Identifier</span>
              <span className="summaryStatEmail">{activeEmail}</span>
            </div>
          </section>
        )}

        {loading ? (
          <div className="ordersLoadingState">
            <Loader2 className="animate-spin loadingSpinner" size={36} />
            <p>Fetching order details...</p>
          </div>
        ) : searched && orders.length === 0 ? (
          <div className="ordersEmptyState">
            <Package size={56} className="emptyStateIcon" />
            <h3>No Orders Found</h3>
            <p>
              We couldn&apos;t find any orders matching <strong>{activeEmail}</strong>.
            </p>
            <p className="emptyStateSubText">
              Make sure you entered the same email address used during checkout or account registration.
            </p>
            <Link href="/" className="backToShopBtn">
              <ShoppingBag size={18} />
              Explore Flavours
            </Link>
          </div>
        ) : (
          <div className="ordersList">
            {orders.map((order) => (
              <article key={order.id} className="orderCard">
                <div className="orderCardHeader">
                  <div className="orderCardHeaderLeft">
                    <div className="orderIdRow">
                      <span className="orderIdLabel">Order ID</span>
                      <span className="orderIdCode">#{order.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="orderDateRow">
                      <Calendar size={14} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="orderCardHeaderRight">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                <div className="orderCardBody">
                  <div className="orderItemsList">
                    {order.items.map((item) => (
                      <div key={item.id} className="orderItemRow">
                        <div className="orderItemImageWrapper">
                          <Image
                            src={item.product?.image || `/images/${item.product?.name ? item.product.name : 'Guava Chilli 1'}.png`}
                            alt={item.product?.name || 'Product'}
                            width={54}
                            height={54}
                            className="orderItemImage"
                          />
                        </div>
                        <div className="orderItemMeta">
                          <h4 className="orderItemName">{item.product?.name || "POUR Protein Water"}</h4>
                          <p className="orderItemDesc">{item.product?.tone || ""}</p>
                          <span className="orderItemQtyPrice">
                            {item.quantity} x {formatCurrency(item.priceAtOrder)}
                          </span>
                        </div>
                        <div className="orderItemTotal">
                          {formatCurrency(item.quantity * item.priceAtOrder)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="orderMetaGrid">
                    <div className="orderMetaBlock">
                      <div className="orderMetaTitle">
                        <MapPin size={14} />
                        Shipping Information
                      </div>
                      <p className="orderMetaText font-medium">{order.shippingName}</p>
                      <p className="orderMetaText">{order.shippingAddress}</p>
                      <p className="orderMetaText">
                        <Phone size={12} className="inline-icon" /> {order.shippingPhone}
                      </p>
                      {order.shippingEmail && (
                        <p className="orderMetaText">
                          <Mail size={12} className="inline-icon" /> {order.shippingEmail}
                        </p>
                      )}
                    </div>

                    <div className="orderMetaBlock">
                      <div className="orderMetaTitle">
                        <CreditCard size={14} />
                        Payment Details
                      </div>
                      <p className="orderMetaText">
                        Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "Razorpay Online"}</strong>
                      </p>
                      {order.razorpayPaymentId && (
                        <p className="orderMetaText codeText">
                          Payment ID: {order.razorpayPaymentId}
                        </p>
                      )}
                      {order.razorpayOrderId && (
                        <p className="orderMetaText codeText">
                          Razorpay Ref: {order.razorpayOrderId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="orderCardFooter">
                  <span className="totalLabel">Total Cost</span>
                  <span className="totalAmount">{formatCurrency(order.total)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
