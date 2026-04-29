import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationEmailProps {
  clientName: string;
  bookingDate: string;
  timeSlot: string;
  sessionType: string;
}

export const BookingConfirmationEmail = ({
  clientName,
  bookingDate,
  timeSlot,
  sessionType,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your session at LuxeLoft Studio is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Confirmed</Heading>
        <Text style={text}>Hi {clientName},</Text>
        <Text style={text}>
          Your session at <strong>LuxeLoft Studio</strong> has been successfully booked. We look forward to seeing you!
        </Text>
        <Section style={detailsSection}>
          <Text style={detailsTitle}>Session Details:</Text>
          <Text style={detailsText}>
            <strong>Date:</strong> {bookingDate}
          </Text>
          <Text style={detailsText}>
            <strong>Time Slot:</strong> {timeSlot}
          </Text>
          <Text style={detailsText}>
            <strong>Type:</strong> {sessionType}
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If you need to cancel or reschedule, please contact us at least 24 hours in advance.
          <br />
          Lagos, Nigeria • +234 801 234 5678
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  maxWidth: "580px",
};

const h1 = {
  color: "#1a1a2e",
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
};

const detailsSection = {
  backgroundColor: "#f1f5f9",
  padding: "24px",
  borderRadius: "12px",
  margin: "24px 0",
};

const detailsTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a1a2e",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "12px",
};

const detailsText = {
  fontSize: "15px",
  color: "#4b5563",
  margin: "4px 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "40px 0",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  lineHeight: "20px",
};
