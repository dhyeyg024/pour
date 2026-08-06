"use client";

import { useState, type FormEvent, useEffect, useRef, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Droplets, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

// REVERT: This file was modified to add the "Reviewer Login" tab.
// To revert: restore the original file from RAZORPAY_REVIEW_REVERT.md
// The original had only the OTP flow (type Step = "email" | "otp") and no tabs.

type Step = "email" | "otp";
// REVERT: Remove this type alias — only used by the reviewer password tab.
type LoginMode = "otp" | "reviewer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // REVERT: Remove `mode` state and its setter; delete the whole reviewer tab branch.
  const [mode, setMode] = useState<LoginMode>("otp");

  // ── OTP flow state (unchanged) ────────────────────────────────────────────
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // REVERT: Remove these reviewer-specific state variables.
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewerPassword, setReviewerPassword] = useState("");
  const [reviewerError, setReviewerError] = useState<string | null>(null);
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // ── OTP handlers (unchanged) ──────────────────────────────────────────────
  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send OTP.");
      } else {
        setStep("otp");
        setCooldown(60);
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid or expired OTP.");
      } else {
        const callbackUrl = searchParams?.get("callbackUrl") || "/";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // REVERT: Remove this entire handleReviewerSignIn function.
  const handleReviewerSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewerEmail || !reviewerPassword) return;

    setReviewerError(null);
    setReviewerLoading(true);

    try {
      const result = await signIn("credentials", {
        email: reviewerEmail,
        password: reviewerPassword,
        redirect: false,
      });

      if (result?.error) {
        setReviewerError("Invalid credentials. Please check your email and password.");
      } else {
        const callbackUrl = searchParams?.get("callbackUrl") || "/";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setReviewerError("Something went wrong. Please try again.");
    } finally {
      setReviewerLoading(false);
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

        {/* REVERT: Remove this entire tab bar (authTabs div and its contents). */}
        <div className="authTabs" role="tablist" aria-label="Sign in method">
          <button
            role="tab"
            aria-selected={mode === "otp"}
            className={`authTab${mode === "otp" ? " authTabActive" : ""}`}
            id="auth-tab-otp"
            onClick={() => {
              setMode("otp");
              setError(null);
              setReviewerError(null);
            }}
          >
            Sign in with OTP
          </button>
          <button
            role="tab"
            aria-selected={mode === "reviewer"}
            className={`authTab${mode === "reviewer" ? " authTabActive" : ""}`}
            id="auth-tab-reviewer"
            onClick={() => {
              setMode("reviewer");
              setError(null);
              setReviewerError(null);
            }}
          >
            Reviewer Login
          </button>
        </div>
        {/* END REVERT */}

        {/* ── OTP tab (original content, unchanged) ─────────────────────────── */}
        {/* REVERT: Remove the mode === "otp" wrapper condition; keep the inner content as-is. */}
        {mode === "otp" && (
          <>
            <h1 className="authTitle">
              {step === "email" ? "Welcome" : "Enter Code"}
            </h1>
            <p className="authSub">
              {step === "email"
                ? "Enter your email to sign in or create an account."
                : `We sent a 6-digit code to ${email}`}
            </p>

            {step === "email" ? (
              <form onSubmit={handleSendOtp} noValidate className="authForm">
                <div className="authField">
                  <label htmlFor="auth-email">Email address</label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="authInput"
                  />
                </div>

                {error && <p className="authError" role="alert">{error}</p>}

                <button
                  type="submit"
                  className="primaryButton authSubmit"
                  disabled={loading || !email}
                  id="auth-submit-email-btn"
                >
                  {loading ? "Sending Code…" : "Continue with Email"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} noValidate className="authForm">
                <div className="authField">
                  <label htmlFor="auth-otp">6-Digit Code</label>
                  <input
                    id="auth-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="authInput authInputOtp"
                    ref={otpInputRef}
                    style={{ letterSpacing: "8px", textAlign: "center", fontSize: "1.25rem", fontWeight: "bold" }}
                  />
                </div>

                {error && <p className="authError" role="alert">{error}</p>}

                <button
                  type="submit"
                  className="primaryButton authSubmit"
                  disabled={loading || otp.length < 6}
                  id="auth-submit-otp-btn"
                >
                  {loading ? "Verifying…" : "Verify Code"}
                </button>

                <div className="authFormActions" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center", fontSize: "0.875rem" }}>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={cooldown > 0 || loading}
                    style={{ color: cooldown > 0 ? "#888" : "var(--accent)", background: "none", border: "none", cursor: cooldown > 0 ? "not-allowed" : "pointer", fontWeight: 500 }}
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                    style={{ color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Change email address
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* REVERT: Remove this entire reviewer tab block (mode === "reviewer" section). */}
        {mode === "reviewer" && (
          <>
            <h1 className="authTitle">Reviewer Access</h1>
            <p className="authSub">
              Sign in with your designated reviewer credentials.
            </p>

            <form onSubmit={handleReviewerSignIn} noValidate className="authForm">
              <div className="authField">
                <label htmlFor="reviewer-email">Email address</label>
                <input
                  id="reviewer-email"
                  type="email"
                  autoComplete="email"
                  placeholder="reviewer@example.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  required
                  className="authInput"
                />
              </div>

              <div className="authField">
                <label htmlFor="reviewer-password">Password</label>
                <div className="authPasswordWrap">
                  <input
                    id="reviewer-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={reviewerPassword}
                    onChange={(e) => setReviewerPassword(e.target.value)}
                    required
                    className="authInput authInputPassword"
                  />
                  <button
                    type="button"
                    className="authTogglePass"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    id="auth-toggle-password-btn"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {reviewerError && (
                <p className="authError" role="alert">{reviewerError}</p>
              )}

              <button
                type="submit"
                className="primaryButton authSubmit"
                disabled={reviewerLoading || !reviewerEmail || !reviewerPassword}
                id="auth-submit-reviewer-btn"
              >
                {reviewerLoading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="authReviewerNote">
              <p className="authHintTitle">Note</p>
              <p>This login is for authorized reviewers only. Regular users should use the OTP sign-in tab.</p>
            </div>
          </>
        )}
        {/* END REVERT */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
