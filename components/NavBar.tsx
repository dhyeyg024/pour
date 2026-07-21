"use client";

import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { ShoppingBag, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export function NavBar() {
  const { user, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  return (
    <nav className="nav" aria-label="Main navigation">
      <a className="brand" href="#top" aria-label="POUR home">
        POUR
      </a>

      <div className="navLinks">
        <a href="#flavours">Flavours</a>
        <a href="#nutrition">Nutrition</a>
        <a href="#contact">Contact</a>
      </div>

      <div className="navActions">
        {/* Cart button */}
        <button
          className="navCartBtn"
          onClick={openCart}
          aria-label={`Open cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          id="nav-cart-btn"
        >
          <ShoppingBag size={20} aria-hidden="true" />
          {totalItems > 0 && (
            <span className="cartBadge" aria-hidden="true">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>

        {/* Auth area */}
        {user ? (
          <div className="navUser">
            <div className="navAvatar" aria-label={`Signed in as ${user.name}`}>
              {user.avatar}
            </div>
            <span className="navUserName">{user.name.split(" ")[0]}</span>
            {/* <button
              className="navLogout"
              onClick={logout}
              aria-label="Sign out"
              id="nav-logout-btn"
              title="Sign out"
            >
              <LogOut size={16} />
            </button> */}
          </div>
        ) : (
          <Link
            href="/login"
            className="navSignInBtn"
            id="nav-signin-btn"
          >
            <UserIcon size={16} aria-hidden="true" />
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
