"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, isAuthenticated, authHeaders } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/SignOutButton";
import Link from "next/link";
import { Music, Calendar, Clock, User, ArrowRight, Loader2 } from "lucide-react";

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const res = await fetch("/api/bookings/my-bookings", {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.data?.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const currentUser = getUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser.role === "ADMIN") {
      router.push("/admin/dashboard");
      return;
    }

    setUser(currentUser);
    fetchMyBookings();
  }, [router]);

  const handleCancelBooking = async (id: string) => {
    if (!cancelReason || cancelReason.length < 5) {
      alert("Please provide a valid reason (min 5 characters)");
      return;
    }

    setIsSubmittingCancel(true);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (res.ok) {
        setCancellingId(null);
        setCancelReason("");
        await fetchMyBookings();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel booking");
      }
    } catch (err) {
      console.error("Cancellation error:", err);
      alert("Something went wrong");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar/Nav */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-primary text-white p-6 hidden lg:block">
        <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">LuxeLoft</span>
        </Link>

        <div className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white transition-all">
            <User className="w-5 h-5 text-white" />
            <span className="font-medium text-white">My Profile</span>
          </Link>
          <Link href="/book" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all">
            <Calendar className="w-5 h-5 text-white/60" />
            <span className="font-medium text-white/60">Book Session</span>
          </Link>
        </div>

        <div className="absolute bottom-8 left-6 right-6">
          <SignOutButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-primary">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-primary">{user.name || user.email}</p>
              <p className="text-xs text-muted">Creative Member</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              {(user.name || user.email)?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-primary mb-4">Welcome back!</h2>
              <p className="text-muted mb-8 leading-relaxed">
                Ready for your next creative session? Book a slot now and get started on your project.
              </p>
              <Link href="/book" className="inline-flex items-center gap-3 px-8 py-4 rounded-full gradient-accent text-white font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all">
                Book a Session
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted">No recent bookings found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking._id} className="p-4 rounded-xl bg-surface-alt border border-border transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-primary">
                                {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              <p className="text-xs text-muted">{booking.timeSlot}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                              booking.status === 'confirmed' ? 'bg-available/10 text-available' : 'bg-booked/10 text-booked'
                            }`}>
                              {booking.status}
                            </span>
                            {booking.status === 'confirmed' && cancellingId !== booking._id && (
                              <button 
                                onClick={() => setCancellingId(booking._id)}
                                className="text-[10px] font-bold text-booked hover:underline"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                        {cancellingId === booking._id && (
                          <div className="mt-3 pt-3 border-t border-border animate-fade-in">
                            <label className="block text-xs font-medium text-primary mb-2">Reason for cancellation</label>
                            <textarea
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Why are you cancelling?"
                              className="w-full p-3 rounded-xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-booked/30 min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={() => {
                                  setCancellingId(null);
                                  setCancelReason("");
                                }}
                                className="px-4 py-2 text-xs font-medium text-muted hover:text-primary transition-colors"
                              >
                                Back
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                disabled={isSubmittingCancel || cancelReason.length < 5}
                                className="px-4 py-2 text-xs font-bold text-white bg-booked rounded-lg shadow-sm hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-2"
                              >
                                {isSubmittingCancel ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : "Confirm Cancellation"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
