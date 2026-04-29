import Link from "next/link";
import { CheckCircle2, CalendarDays, Clock, User, Mail, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SearchParams {
  id?: string;
}

async function getBooking(id: string) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/bookings/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    // Adapt MongoDB shape to match what the frontend expects
    const booking = data.booking || data.data?.booking;
    if (!booking) return null;

    return {
      ...booking,
      bookingDate: new Date(booking.date),
      clientName: booking.name,
      clientEmail: booking.email,
      clientPhone: booking.phone,
      timeSlot: { label: booking.timeSlot }
    };
  } catch (error) {
    console.error("Fetch booking error:", error);
    return null;
  }
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const booking = params.id ? await getBooking(params.id) : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="max-w-lg mx-auto px-4 text-center animate-scale-in">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-available/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-available" />
        </div>

        <h1 className="text-3xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
          Booking Confirmed!
        </h1>
        <p className="text-muted text-lg mb-8">
          Your session has been successfully booked. A confirmation email has
          been sent to your inbox.
        </p>

        {/* Booking Details Card */}
        {booking && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-8 text-left space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Date</p>
                <p className="text-sm font-medium text-primary">
                  {formatDate(booking.bookingDate)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Time Slot</p>
                <p className="text-sm font-medium text-primary">
                  {booking.timeSlot.label}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Name</p>
                <p className="text-sm font-medium text-primary">
                  {booking.clientName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-primary">
                  {booking.clientEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full gradient-accent shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            Book Another Session
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-muted rounded-full border border-border hover:bg-surface-alt transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
