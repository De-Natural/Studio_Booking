"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">(
    email && token ? "loading" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState(email);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Auto-verify when the page loads with email + token in the URL
  useEffect(() => {
    if (!email || !token) return;

    async function verify() {
      setStatus("loading");
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.push("/login?verified=true"), 3000);
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Invalid or expired verification link.");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    }

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendSuccess(false);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendSuccess(true);
      } else {
        setErrorMsg(data.error || "Failed to resend. Please try again.");
      }
    } catch {
      setErrorMsg("Failed to resend. Please check your network.");
    } finally {
      setResending(false);
    }
  }

  // ── Success state ──
  if (status === "success") {
    return (
      <div className="text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-available/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-available" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Email Verified!</h1>
          <p className="text-muted">Your account is now active. Redirecting you to login...</p>
        </div>
        <Link href="/login?verified=true" className="inline-flex items-center gap-2 text-accent font-medium hover:underline">
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // ── Loading state ──
  if (status === "loading") {
    return (
      <div className="text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">Verifying your email...</h1>
          <p className="text-muted">Please wait while we confirm your account.</p>
        </div>
      </div>
    );
  }

  // ── Error / No-token state ──
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-error" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">
          {status === "error" ? "Verification Failed" : "Check Your Email"}
        </h1>
        <p className="text-muted text-sm">
          {status === "error"
            ? errorMsg
            : `Click the verification link we sent to ${email || "your email"} to activate your account.`}
        </p>
      </div>

      {!token && email && (
        <div className="flex justify-center">
          <a
            href={(() => {
              const domain = email.split("@")[1]?.toLowerCase();
              if (domain?.includes("gmail")) return "https://mail.google.com";
              if (domain?.includes("outlook") || domain?.includes("hotmail") || domain?.includes("live")) return "https://outlook.live.com";
              if (domain?.includes("yahoo")) return "https://mail.yahoo.com";
              if (domain?.includes("icloud")) return "https://www.icloud.com/mail";
              return `https://${domain}`;
            })()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-all flex items-center gap-2"
          >
            Go to Inbox
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Resend form */}
      <div className="border-t border-border pt-6 space-y-4">
        <p className="text-sm text-center text-muted">
          Didn&apos;t get the email or link expired? Request a new one:
        </p>

        {resendSuccess ? (
          <div className="p-3 rounded-xl bg-available/10 border border-available/20 text-available text-sm flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-4 h-4" />
            A new verification link has been sent!
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <button
              type="submit"
              disabled={resending}
              className="w-full py-3 rounded-xl text-white font-semibold gradient-accent shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Resend Verification Link
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-sm text-muted">
        Already verified?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-card rounded-3xl border border-border shadow-2xl p-8 sm:p-10">
        <Suspense
          fallback={
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-accent" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
