import { Resend } from "resend";
import BookingConfirmationEmail from "@/emails/BookingConfirmation";
import AdminNotificationEmail from "@/emails/AdminNotification";
import { formatDate } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmails(booking: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping emails");
    return;
  }

  const dateStr = formatDate(booking.bookingDate);

  try {
    // Send to client
    await resend.emails.send({
      from: "LuxeLoft Studio <bookings@luxeloftstudio.com>",
      to: booking.clientEmail,
      subject: "Booking Confirmed - LuxeLoft Studio",
      react: BookingConfirmationEmail({
        clientName: booking.clientName,
        bookingDate: dateStr,
        timeSlot: booking.timeSlot.label,
        sessionType: booking.sessionType,
      }),
    });

    // Send to admin
    const adminEmail = process.env.NOTIFICATION_EMAIL || "admin@studio.com";
    await resend.emails.send({
      from: "Studio Bot <system@luxeloftstudio.com>",
      to: adminEmail,
      subject: `New Booking: ${booking.clientName} - ${dateStr}`,
      react: AdminNotificationEmail({
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        bookingDate: dateStr,
        timeSlot: booking.timeSlot.label,
        sessionType: booking.sessionType,
        notes: booking.notes,
      }),
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}
