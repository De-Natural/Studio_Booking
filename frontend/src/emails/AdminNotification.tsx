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

interface AdminNotificationEmailProps {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bookingDate: string;
  timeSlot: string;
  sessionType: string;
  notes?: string;
}

export const AdminNotificationEmail = ({
  clientName,
  clientEmail,
  clientPhone,
  bookingDate,
  timeSlot,
  sessionType,
  notes,
}: AdminNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>New Booking: {clientName} - {bookingDate}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Session Booked</Heading>
        <Section style={detailsSection}>
          <Text style={detailsTitle}>Client Information:</Text>
          <Text style={detailsText}><strong>Name:</strong> {clientName}</Text>
          <Text style={detailsText}><strong>Email:</strong> {clientEmail}</Text>
          <Text style={detailsText}><strong>Phone:</strong> {clientPhone}</Text>
        </Section>
        <Section style={detailsSection}>
          <Text style={detailsTitle}>Session Details:</Text>
          <Text style={detailsText}><strong>Date:</strong> {bookingDate}</Text>
          <Text style={detailsText}><strong>Time Slot:</strong> {timeSlot}</Text>
          <Text style={detailsText}><strong>Type:</strong> {sessionType}</Text>
        </Section>
        {notes && (
          <Section style={detailsSection}>
            <Text style={detailsTitle}>Notes:</Text>
            <Text style={detailsText}>{notes}</Text>
          </Section>
        )}
        <Hr style={hr} />
        <Text style={footer}>
          LuxeLoft Studio Admin Notification
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AdminNotificationEmail;

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

const detailsSection = {
  backgroundColor: "#f1f5f9",
  padding: "20px",
  borderRadius: "12px",
  margin: "16px 0",
};

const detailsTitle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#1a1a2e",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: "8px",
};

const detailsText = {
  fontSize: "14px",
  color: "#4b5563",
  margin: "4px 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "40px 0",
};

const footer = {
  color: "#9ca3af",
  fontSize: "10px",
  textAlign: "center" as const,
};
