"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, authHeaders } from "@/lib/auth";
import { formatDate, SESSION_TYPE_LABELS, type SessionType } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, User, Mail, Phone, FileText, Music, Loader2, Ban, Trash2 } from "lucide-react";

interface BookingDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  sessionType: string;
  status: string;
  notes?: string;
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    params.then(p => setBookingId(p.id));
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;
    if (!isAuthenticated() || getUser()?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          setBooking(data.data?.booking || data.booking);
        }
      } catch (err) {
        console.error("Failed to fetch booking:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId, router]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) router.push("/admin/bookings");
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-muted">Booking not found</p>
        <Link href="/admin/bookings" className="text-accent hover:underline mt-4 inline-block">Back to Bookings</Link>
      </div>
    );
  }

  const details = [
    { icon: User, label: "Client Name", value: booking.name },
    { icon: Mail, label: "Email", value: booking.email },
    { icon: Phone, label: "Phone", value: booking.phone },
    { icon: Music, label: "Session Type", value: SESSION_TYPE_LABELS[booking.sessionType as SessionType] || booking.sessionType || "—" },
    { icon: CalendarDays, label: "Date", value: formatDate(booking.date) },
    { icon: Clock, label: "Time Slot", value: booking.timeSlot },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary font-[family-name:var(--font-heading)]">Booking Details</h1>
          <p className="text-muted text-sm mt-1">ID: {booking._id.slice(0, 8)}...</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${booking.status === "confirmed" ? "bg-available/10 text-available" : "bg-booked/10 text-booked"}`}>
          {booking.status}
        </span>
      </div>
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
        {details.map((item) => { const Icon = item.icon; return (
          <div key={item.label} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-accent" /></div>
            <div><p className="text-xs text-muted uppercase tracking-wider">{item.label}</p><p className="text-sm font-medium text-primary mt-0.5">{item.value}</p></div>
          </div>
        ); })}
        {booking.notes && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-accent" /></div>
            <div><p className="text-xs text-muted uppercase tracking-wider">Notes</p><p className="text-sm text-text-secondary mt-0.5">{booking.notes}</p></div>
          </div>
        )}
      </div>
      <button onClick={handleDelete} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-booked bg-booked/10 rounded-xl hover:bg-booked/20 transition-colors">
        <Trash2 className="w-4 h-4" /> Delete Booking
      </button>
    </div>
  );
}
