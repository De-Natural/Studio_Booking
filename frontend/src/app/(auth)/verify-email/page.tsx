"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, CheckCircle2, AlertCircle, ArrowRight, Timer } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute timer
  const [canResend, setCanResend] = useState(false);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !code) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!canResend || !email) return;

    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setTimeLeft(60);
        setCanResend(false);
        // Maybe show a toast or a small success message here
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch {
      setError("Failed to resend code. Please check your network.");
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-available/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-available" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Email Verified!</h1>
          <p className="text-muted">Your account is now active. Redirecting you to login...</p>
        </div>
        <Link href="/login" className="inline-flex items-center gap-2 text-accent font-medium hover:underline">
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
          Verify Your Email
        </h1>
        <p className="text-muted">
          We&apos;ve sent a 6-digit verification code to <span className="text-primary font-medium">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-text-secondary mb-1.5">
            Verification Code
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              id="code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-lg font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full py-3.5 rounded-xl text-white font-semibold gradient-accent shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
        </button>

        <div className="text-center text-sm text-muted">
          <p>Didn&apos;t receive the code? Check your spam folder or</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            {!canResend ? (
              <span className="flex items-center gap-1.5 text-xs text-muted/60">
                <Timer className="w-3.5 h-3.5" />
                Resend in {timeLeft}s
              </span>
            ) : (
              <button 
                type="button" 
                onClick={handleResend}
                disabled={resending}
                className="text-accent font-medium hover:underline flex items-center gap-1.5"
              >
                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                resend code
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-card rounded-3xl border border-border shadow-2xl p-8 sm:p-10">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-accent" /></div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
