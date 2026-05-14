import Link from "next/link";
import { CheckCircle2, CalendarDays, Clock, User, Mail, ArrowRight, CreditCard, Banknote } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SearchParams {
  id?: string;
  reference?: string;
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

async function verifyPayment(reference: string) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/payments/verify/${reference}`, {
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function formatPrice(amountInKobo: number) {
  const naira = amountInKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(naira);
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // If there's a payment reference, verify it first
  if (params.reference) {
    await verifyPayment(params.reference);
  }

  const booking = params.id ? await getBooking(params.id) : null;

  const isPaid = booking?.paymentStatus === 'paid';
  const isPending = booking?.status === 'pending';

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16">
      <div className="max-w-lg mx-auto px-4 text-center animate-scale-in">
        {/* Success Icon */}
        <div className={`w-20 h-20 rounded-full ${isPaid ? 'bg-available/10' : 'bg-yellow-500/10'} flex items-center justify-center mx-auto mb-6`}>
          {isPaid ? (
            <CheckCircle2 className="w-10 h-10 text-available" />
          ) : (
            <CreditCard className="w-10 h-10 text-yellow-500" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
          {isPaid ? "Booking Confirmed!" : isPending ? "Booking Pending Payment" : "Booking Confirmed!"}
        </h1>
        <p className="text-muted text-lg mb-8">
          {isPaid
            ? "Your payment was successful and your session has been booked. A confirmation email has been sent to your inbox."
            : isPending
            ? "Your booking is saved but payment is still pending. Please complete payment to confirm your session."
            : "Your session has been successfully booked. A confirmation email has been sent to your inbox."
          }
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
            {booking.amountPaid > 0 && (
              <div className="flex items-start gap-3">
                <Banknote className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Amount Paid</p>
                  <p className="text-sm font-bold text-accent">
                    {formatPrice(booking.amountPaid)}
                  </p>
                </div>
              </div>
            )}
            {/* Payment Status Badge */}
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-xs text-muted">Payment Status</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                isPaid ? 'bg-available/10 text-available' : 'bg-yellow-500/10 text-yellow-600'
              }`}>
                {booking.paymentStatus === 'paid' ? '✓ Paid' : booking.paymentStatus === 'pending' ? '⏳ Pending' : booking.paymentStatus || 'N/A'}
              </span>
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
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-muted rounded-full border border-border hover:bg-surface-alt transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
