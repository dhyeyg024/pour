"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Droplets } from "lucide-react";
import Link from "next/link";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send OTP.");
      } else {
        setStep("otp");
        setCooldown(60); // 60s cooldown for resend
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
        redirect: false
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
            
            <div className="authFormActions" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
              <button 
                type="button" 
                onClick={() => handleSendOtp()} 
                disabled={cooldown > 0 || loading}
                style={{ color: cooldown > 0 ? '#888' : 'var(--accent)', background: 'none', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: 500 }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <button 
                type="button" 
                onClick={() => { setStep("email"); setOtp(""); setError(null); }}
                style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change email address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
