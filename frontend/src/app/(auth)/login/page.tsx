"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const verified = searchParams.get("verified") === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (result.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="glass-dark rounded-2xl p-8 shadow-xl">
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {verified && (
        <div className="mb-5 p-3 rounded-lg bg-accent/10 border border-accent/20 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Email verified! You can now sign in.
        </div>
      )} 

      <form onSubmit={handleSubmit} className="space-y-5">
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
        <div className="pt-2 text-center">
          <p className="text-white/40 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent hover:text-accent-light transition-colors font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
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
            Welcome to LuxeLoft
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Sign in to book sessions and manage your projects
          </p>
        </div>

        <Suspense fallback={<div className="glass-dark rounded-2xl p-8 h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} LuxeLoft Studio
        </p>
      </div>
    </div>
  );
}
