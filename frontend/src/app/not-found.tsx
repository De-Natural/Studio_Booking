import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="max-w-md mx-auto px-4 text-center animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-accent" />
        </div>

        <h1 className="text-3xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
          Page Not Found
        </h1>
        <p className="text-muted text-lg mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white rounded-full gradient-accent shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
