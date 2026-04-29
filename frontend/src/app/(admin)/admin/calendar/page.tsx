"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, authHeaders } from "@/lib/auth";
import { formatDateShort } from "@/lib/utils";
import { Plus, Loader2, AlertCircle } from "lucide-react";

interface BlockedDate {
  _id: string;
  date: string;
  reason?: string;
}

export default function CalendarManagementPage() {
  const router = useRouter();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateInput, setDateInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [error, setError] = useState("");

  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blocked-dates", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setBlockedDates(data.data?.blockedDates || data.blockedDates || []);
      }
    } catch (err) {
      console.error("Failed to fetch blocked dates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated() || getUser()?.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    fetchBlockedDates();
  }, [router, fetchBlockedDates]);

  async function handleBlockDate(e: React.FormEvent) {
    e.preventDefault();
    if (!dateInput) return;
    setBlocking(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ date: dateInput, reason: reasonInput }),
      });
      if (res.ok) {
        setDateInput("");
        setReasonInput("");
        fetchBlockedDates();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to block date");
      }
    } catch {
      setError("Network error.");
    } finally {
      setBlocking(false);
    }
  }

  async function handleUnblock(id: string) {
    await fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchBlockedDates();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary font-[family-name:var(--font-heading)]">Calendar Management</h1>
        <p className="text-muted mt-1">Block dates to prevent new bookings.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Block a Date</h2>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        <form onSubmit={handleBlockDate} className="flex flex-col sm:flex-row gap-3">
          <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} required min={new Date().toISOString().split("T")[0]} className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" />
          <input type="text" value={reasonInput} onChange={(e) => setReasonInput(e.target.value)} placeholder="Reason (optional)" className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all" />
          <button type="submit" disabled={blocking} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white gradient-accent rounded-xl shadow-lg shadow-accent/20 disabled:opacity-50">
            {blocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Block
          </button>
        </form>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Blocked Dates ({blockedDates.length})</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
        ) : blockedDates.length === 0 ? (
          <div className="p-12 text-center text-muted text-sm">No blocked dates</div>
        ) : (
          <div className="divide-y divide-border">
            {blockedDates.map((bd) => (
              <div key={bd._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-primary">{formatDateShort(bd.date)}</p>
                  {bd.reason && <p className="text-xs text-muted mt-0.5">{bd.reason}</p>}
                </div>
                <button onClick={() => handleUnblock(bd._id)} className="text-xs text-booked hover:underline font-medium">Unblock</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
