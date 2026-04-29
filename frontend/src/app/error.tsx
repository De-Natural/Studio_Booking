"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="max-w-md mx-auto px-4 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-error" />
        </div>

        <h1 className="text-3xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
          Something went wrong!
        </h1>
        <p className="text-muted text-lg mb-8">
          We encountered an unexpected error. Please try refreshing the page or
          returning home.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full gradient-accent shadow-md hover:shadow-lg transition-all duration-300"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-muted rounded-full border border-border hover:bg-surface-alt transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
