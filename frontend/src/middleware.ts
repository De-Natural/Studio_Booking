import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting for API routes
// Note: This resets on server restart and doesn't share state between serverless instances.
// For production, use Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 10; // 10 requests per minute
const WINDOW = 60 * 1000; // 1 minute

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit booking and auth routes
  if (pathname.startsWith("/api/bookings") || pathname.startsWith("/api/auth")) {
    const ip = request.ip || "unknown";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > WINDOW) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count++;
    }

    rateLimitMap.set(ip, rateData);

    if (rateData.count > LIMIT) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
