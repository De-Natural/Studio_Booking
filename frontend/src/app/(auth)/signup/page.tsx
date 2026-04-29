"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/auth";
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signup(name, email, password);

      if (!result.success) {
        setError(result.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="glass-dark rounded-2xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          We've sent a 6-digit verification code to your email. Please verify your email to activate your account.
        </p>
        <Link 
          href={`/verify-email?email=${encodeURIComponent(email)}`} 
          className="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors font-semibold"
        >
          Verify Email
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-2xl p-8 shadow-xl">
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-semibold gradient-accent shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <div className="pt-2 text-center">
          <p className="text-white/40 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:text-accent-light transition-colors font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-accent/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px]" />

      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <Image 
            src="/techverve logo.jpg" 
            alt="LuxeLoft Logo" 
            width={100} 
            height={100} 
            className="mx-auto mb-4 rounded-xl shadow-lg shadow-accent/20"
          />
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
            Join LuxeLoft Studio
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Create an account to start booking sessions
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} LuxeLoft Studio
        </p>
      </div>
    </div>
  );
}
