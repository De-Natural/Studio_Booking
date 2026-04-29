"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2 } from "lucide-react";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        router.refresh();
        setShowConfirm(false);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  if (!showConfirm) {
    return (
      <button onClick={() => setShowConfirm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-booked bg-booked/10 rounded-xl hover:bg-booked/20 transition-colors">
        <Ban className="w-4 h-4" /> Cancel Booking
      </button>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-booked/20 p-5 space-y-4 animate-scale-in">
      <p className="text-sm font-medium text-primary">Are you sure you want to cancel this booking?</p>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for cancellation (optional)..." rows={2} className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-booked/30 resize-none" />
      <div className="flex gap-3">
        <button onClick={handleCancel} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-booked rounded-xl hover:bg-booked/90 transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />} Confirm Cancel
        </button>
        <button onClick={() => setShowConfirm(false)} className="px-5 py-2.5 text-sm font-medium text-muted border border-border rounded-xl hover:bg-surface-alt transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );
}
