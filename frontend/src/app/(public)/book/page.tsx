"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import BookingCalendar, { DateStatus } from "@/components/booking/Calendar";
import TimeSlotPicker, { TimeSlotData } from "@/components/booking/TimeSlotPicker";
import PaystackButton from "@/components/booking/PaystackButton";
import { formatDate, formatDateLocal, formatDateForAPI, SESSION_TYPE_LABELS, type SessionType, cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  User,
  Mail,
  Phone,
  FileText,
  Music,
  Loader2,
  AlertCircle,
  CreditCard,
  Banknote,
} from "lucide-react";

const STEPS = [
  { icon: CalendarDays, label: "Date" },
  { icon: Clock, label: "Time" },
  { icon: ClipboardList, label: "Details" },
  { icon: CheckCircle2, label: "Pay" },
];

interface SessionTypeData {
  id: string;
  label: string;
  icon: string;
  price?: number;
}

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  
  // Booking Data
  const [sessionType, setSessionType] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const [availability, setAvailability] = useState<Record<string, DateStatus>>({});
  const [slots, setSlots] = useState<TimeSlotData[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);

  // Payment state
  const [paymentData, setPaymentData] = useState<{
    reference: string;
    publicKey: string;
    amount: number;
    bookingId: string;
    authorizationUrl: string;
  } | null>(null);
  const [paymentInitializing, setPaymentInitializing] = useState(false);

  // Get session price
  const getSessionPrice = (): number => {
    if (!settings?.sessionTypes || !sessionType) return 0;
    const matched = settings.sessionTypes.find((s: SessionTypeData) => s.label === sessionType);
    return matched?.price || 0;
  };

  const sessionPrice = getSessionPrice();

  // Format price in Naira
  const formatPrice = (priceInNaira: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(priceInNaira);
  };

  // Fetch monthly availability
  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch("/api/availability");
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.data?.availability || {});
      }
    } catch {
      console.error("Failed to fetch availability");
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
    
    // Fetch settings for session types
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }
    fetchSettings();
  }, [fetchAvailability]);

  // Fetch time slots for selected date
  useEffect(() => {
    if (!selectedDate) return;

    async function fetchSlots() {
      setSlotsLoading(true);
      try {
        const dateStr = formatDateForAPI(selectedDate!);
        const res = await fetch(`/api/timeslots?date=${dateStr}`);
        if (res.ok) {
          const data = await res.json();
          setSlots(data.data?.slots || []);
        }
      } catch {
        console.error("Failed to fetch slots");
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchSlots();
    setSelectedSlotId(null);
    setStep(1);
  }, [selectedDate]);

  function handleSelectSlot(slotId: string) {
    setSelectedSlotId(slotId);
    setStep(2);
  }

  // Initialize payment via backend
  async function handleInitializePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlotId || !clientName || !clientEmail || !clientPhone || !agreedToTerms) {
      setError("Please fill in all required fields and agree to terms.");
      return;
    }

    if (sessionPrice <= 0) {
      setError("No price configured for this session type. Please contact the studio.");
      return;
    }

    setPaymentInitializing(true);
    setError(null);

    try {
      const dateStr = formatDateForAPI(selectedDate!);
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          sessionType,
          notes,
          bookingDate: dateStr,
          timeSlotId: selectedSlotId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Failed to initialize payment");
        return;
      }

      // Store payment data for Paystack popup
      setPaymentData({
        reference: data.data.reference,
        publicKey: data.data.publicKey,
        amount: data.data.amount,
        bookingId: data.data.bookingId,
        authorizationUrl: data.data.authorizationUrl,
      });

      setStep(3);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPaymentInitializing(false);
    }
  }

  // After Paystack success — verify and redirect
  async function handlePaymentSuccess(reference: string) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/payments/verify/${reference}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Payment verification failed. Please contact support.");
        return;
      }

      // Show success toast
      setShowToast(true);

      // Redirect to confirmation page
      setTimeout(() => {
        router.push(`/book/confirmation?id=${paymentData?.bookingId}`);
      }, 2000);
    } catch {
      setError("Payment verification failed. Please contact support with your reference: " + reference);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePaymentClose() {
    setError("Payment was not completed. Your booking is saved as pending — you can try paying again.");
  }

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  return (
    <div className="min-h-[80vh] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Real-time availability
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3 font-[family-name:var(--font-heading)]">
            Book Your Session
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.label} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={cn("w-8 sm:w-12 h-[2px] rounded", isComplete ? "bg-accent" : "bg-border")} />
                )}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    isActive ? "bg-accent text-white" : isComplete ? "bg-accent/10 text-accent" : "bg-surface-alt text-muted"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* STEP 0: Calendar */}
            {step === 0 && (
              <BookingCalendar
                availability={availability}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}

            {/* STEP 1: Time Slots */}
            {step === 1 && selectedDate && (
              <div className="animate-fade-in bg-card rounded-2xl border border-border shadow-card p-6">
                <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm text-muted mb-4 hover:text-accent transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Change Date
                </button>
                <TimeSlotPicker
                  slots={slots}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={handleSelectSlot}
                  loading={slotsLoading}
                />
              </div>
            )}

            {/* STEP 2: Details + Personal Info */}
            {step === 2 && (
              <form onSubmit={handleInitializePayment} className="animate-fade-in bg-card rounded-2xl border border-border shadow-card p-6 space-y-6">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Time Slots
                </button>
                <h3 className="text-lg font-semibold text-primary font-[family-name:var(--font-heading)]">Session Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5 text-black">What do you wish to do?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(settings?.sessionTypes || []).map((type: SessionTypeData) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSessionType(type.label)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                            sessionType === type.label ? "bg-accent/10 border-accent text-accent" : "bg-card border-border text-muted hover:border-accent/50"
                          )}
                        >
                          <span className="text-xl">{type.icon}</span>
                          <div className="flex-1">
                            <span className="text-sm font-medium block">{type.label}</span>
                            {type.price != null && type.price > 0 && (
                              <span className="text-xs text-accent font-semibold">{formatPrice(type.price)}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5 text-black">Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special requirements..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <h3 className="text-lg font-semibold text-primary font-[family-name:var(--font-heading)] pt-2">Personal Information</h3>

                {error && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5 text-black">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5 text-black">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5 text-black">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4" />
                    <label className="text-sm text-muted leading-relaxed">I agree to the studio&apos;s terms and conditions.</label>
                  </div>
                </div>

                {/* Price summary */}
                {sessionPrice > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <Banknote className="w-4 h-4 text-accent" />
                      Session Fee
                    </div>
                    <span className="text-lg font-bold text-accent">{formatPrice(sessionPrice)}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!sessionType || !agreedToTerms || paymentInitializing}
                  className="w-full py-3.5 rounded-xl text-white font-semibold gradient-accent shadow-md disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  {paymentInitializing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initializing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {sessionPrice > 0 ? `Pay ${formatPrice(sessionPrice)} & Confirm` : "Proceed to Payment"}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && paymentData && (
              <div className="animate-fade-in bg-card rounded-2xl border border-border shadow-card p-6 space-y-6">
                <button type="button" onClick={() => { setStep(2); setPaymentData(null); }} className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Details
                </button>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                    <CreditCard className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary font-[family-name:var(--font-heading)]">Complete Payment</h3>
                  <p className="text-sm text-muted">Click the button below to securely pay via Paystack.</p>

                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold text-accent">{formatPrice(paymentData.amount / 100)}</p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}
                </div>

                <PaystackButton
                  email={clientEmail}
                  amount={paymentData.amount}
                  reference={paymentData.reference}
                  publicKey={paymentData.publicKey}
                  label={isSubmitting ? "Verifying Payment..." : `Pay ${formatPrice(paymentData.amount / 100)}`}
                  disabled={isSubmitting}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                />

                <p className="text-xs text-center text-muted">
                  🔒 Secured by Paystack. Your payment details are encrypted.
                </p>
              </div>
            )}
          </div>

          {/* Right: Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 font-[family-name:var(--font-heading)]">Booking Summary</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Date</p>
                    <p className="text-sm font-medium text-primary mt-0.5">{selectedDate ? formatDateLocal(selectedDate) : "Not selected"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Time Slot</p>
                    <p className="text-sm font-medium text-primary mt-0.5">{selectedSlot ? selectedSlot.label : "Not selected"}</p>
                  </div>
                </div>
                {sessionType && (
                  <div className="flex items-start gap-3">
                    <Music className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wider">Session Type</p>
                      <p className="text-sm font-medium text-primary mt-0.5">{sessionType}</p>
                    </div>
                  </div>
                )}
                {sessionPrice > 0 && (
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted font-medium uppercase tracking-wider">Price</p>
                      <p className="text-sm font-bold text-accent mt-0.5">{formatPrice(sessionPrice)}</p>
                    </div>
                  </div>
                )}
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted italic">Secure payment via Paystack • Email confirmation after payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-available text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold">Payment Successful!</p>
              <p className="text-xs text-white/80">Redirecting to confirmation details...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
