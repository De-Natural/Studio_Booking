import Link from "next/link";
import Image from "next/image";
import { Music, Menu, X } from "lucide-react";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-primary/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image src="/techverve logo.jpg" alt="Logo" width={100} height={100} className="rounded-lg"/>
            <span className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
              LuxeLoft
            </span>
          </Link>
          {/* <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/20 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-heading)]">
              LuxeLoft
            </span>
          </Link> */}
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="px-6 py-2 text-base font-semibold text-white/70 rounded-full transition-all hover:text-white hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              href="/book"
              className="px-6 py-2 text-base font-semibold text-white/70 rounded-full transition-all hover:text-white hover:bg-white/5"
            >
              Book a Session
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-full gradient-accent shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-[family-name:var(--font-heading)]">
                LuxeLoft
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Professional-grade studio space for recording, podcasts,
              photography, and video production.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-white/60 hover:text-accent transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/60 hover:text-accent transition-colors"
                >
                  Book a Session
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>bookings@luxeloftstudio.com</li>
              <li>+234 801 234 5678</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} LuxeLoft Studio. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
