"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Droplets } from "lucide-react";
import Link from "next/link";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        // 1. Create account via API
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Sign up failed.");
          setLoading(false);
          return;
        }
        // 2. Sign in immediately after signup
      }

      // Sign in (for both login and post-signup)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      {/* Background decoration */}
      <div className="authBg" aria-hidden="true">
        <div className="authBgBlob authBgBlob1" />
        <div className="authBgBlob authBgBlob2" />
        <div className="authBgBlob authBgBlob3" />
      </div>

      <div className="authCard">
        <Link href="/" className="authBack" id="auth-back-link">
          <ArrowLeft size={16} />
          Back to POUR
        </Link>

        <div className="authLogo">
          <Droplets size={28} aria-hidden="true" />
          <span>POUR</span>
        </div>

        <h1 className="authTitle">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="authSub">
          {mode === "login"
            ? "Sign in to manage your cart and orders."
            : "Join POUR and start exploring protein water."}
        </p>

        {/* Tabs */}
        <div className="authTabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === "login"}
            className={`authTab ${mode === "login" ? "authTabActive" : ""}`}
            onClick={() => switchMode("login")}
            id="auth-tab-login"
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={mode === "signup"}
            className={`authTab ${mode === "signup" ? "authTabActive" : ""}`}
            onClick={() => switchMode("signup")}
            id="auth-tab-signup"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="authForm">
          {mode === "signup" && (
            <div className="authField">
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                placeholder="Arjun Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="authInput"
              />
            </div>
          )}

          <div className="authField">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              autoComplete={mode === "login" ? "username" : "email"}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="authInput"
            />
          </div>

          <div className="authField">
            <label htmlFor="auth-password">Password</label>
            <div className="authPasswordWrap">
              <input
                id="auth-password"
                type={showPass ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "login" ? "••••••••" : "Min. 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="authInput authInputPassword"
              />
              <button
                type="button"
                className="authTogglePass"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
                id="auth-toggle-pass"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="authError" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primaryButton authSubmit"
            disabled={loading}
            id="auth-submit-btn"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
