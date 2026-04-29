"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, authHeaders, isAuthenticated } from "@/lib/auth";
import { formatDateShort, SESSION_TYPE_LABELS, type SessionType } from "@/lib/utils";
import {
  CalendarDays,
  BookOpen,
  Ban,
  TrendingUp,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  upcomingBookings: number;
  blockedDatesCount: number;
}

interface RecentBooking {
  _id: string;
  name: string;
  email: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    const user = getUser();
    if (user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    async function fetchData() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch("/api/admin/stats", { headers: authHeaders() }),
          fetch("/api/admin/bookings/recent", { headers: authHeaders() }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || statsData);
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setRecentBookings(bookingsData.data?.bookings || bookingsData.bookings || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: BookOpen,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Upcoming Sessions",
      value: stats?.upcomingBookings ?? 0,
      icon: TrendingUp,
      color: "text-available",
      bg: "bg-available/10",
    },
    {
      label: "Cancelled",
      value: stats?.cancelledBookings ?? 0,
      icon: Ban,
      color: "text-booked",
      bg: "bg-booked/10",
    },
    {
      label: "Blocked Dates",
      value: stats?.blockedDatesCount ?? 0,
      icon: CalendarDays,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary font-[family-name:var(--font-heading)]">
          Dashboard
        </h1>
        <p className="text-muted mt-1">
          Welcome back. Here&apos;s your studio overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary font-[family-name:var(--font-heading)]">
                {stat.value}
              </p>
              <p className="text-sm text-muted mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="bg-card rounded-2xl border border-border shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary font-[family-name:var(--font-heading)]">
            Recent Bookings
          </h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-accent font-medium hover:underline"
          >
            View All →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBookings.map((booking) => (
              <div
                key={booking._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-alt transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {booking.name}
                  </p>
                  <p className="text-xs text-muted">
                    {SESSION_TYPE_LABELS[booking.sessionType as SessionType] || booking.sessionType || "Session"} •{" "}
                    {booking.timeSlot}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-primary">
                    {formatDateShort(booking.date)}
                  </p>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      booking.status === "confirmed"
                        ? "bg-available/10 text-available"
                        : "bg-booked/10 text-booked"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
