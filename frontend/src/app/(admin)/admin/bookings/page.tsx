"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated, getUser, authHeaders } from "@/lib/auth";
import { formatDateShort, SESSION_TYPE_LABELS, type SessionType } from "@/lib/utils";
import Link from "next/link";
import { Search, Download, Eye, Loader2, Trash2 } from "lucide-react";

interface Booking {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  status: string;
  createdAt: string;
}

import { Suspense } from "react";

function BookingsList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get("status") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "10");

      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
        headers: authHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const result = data.data || data;
        setBookings(result.bookings || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [status, page, search]);

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
    fetchBookings();
  }, [router, fetchBookings]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Failed to delete booking:", err);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-[family-name:var(--font-heading)]">
            Bookings
          </h1>
          <p className="text-muted mt-1">{total} total bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="relative flex-1" action="/admin/bookings" method="GET">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          {status !== "all" && <input type="hidden" name="status" value={status} />}
        </form>
        <div className="flex gap-2">
          {["all", "confirmed", "cancelled"].map((s) => (
            <Link
              key={s}
              href={`/admin/bookings?status=${s}${search ? `&search=${search}` : ""}`}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors capitalize ${
                status === s
                  ? "bg-accent text-white"
                  : "bg-card border border-border text-muted hover:text-primary hover:border-accent/30"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left px-5 py-3 font-medium text-muted">Client</th>
                  <th className="text-left px-5 py-3 font-medium text-muted">Session</th>
                  <th className="text-left px-5 py-3 font-medium text-muted">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-muted">Time</th>
                  <th className="text-left px-5 py-3 font-medium text-muted">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-muted">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-primary">{booking.name}</p>
                        <p className="text-xs text-muted">{booking.email}</p>
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {SESSION_TYPE_LABELS[booking.sessionType as SessionType] || booking.sessionType || "—"}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {formatDateShort(booking.date)}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {booking.timeSlot}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                            booking.status === "confirmed"
                              ? "bg-available/10 text-available"
                              : "bg-booked/10 text-booked"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="inline-flex items-center gap-1 text-sm text-booked hover:underline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-sm text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/bookings?page=${page - 1}&status=${status}${search ? `&search=${search}` : ""}`}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface-alt transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/bookings?page=${page + 1}&status=${status}${search ? `&search=${search}` : ""}`}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-surface-alt transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <BookingsList />
    </Suspense>
  );
}
