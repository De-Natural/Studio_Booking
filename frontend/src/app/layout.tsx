import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "LuxeLoft Studio | Book Your Session",
    template: "%s | LuxeLoft Studio",
  },
  description:
    "Book your next recording, podcast, photography, or video session at LuxeLoft Studio. Professional-grade equipment, acoustically treated rooms, and flexible scheduling.",
  keywords: [
    "studio booking",
    "recording studio",
    "podcast studio",
    "photography studio",
    "video production",
    "session booking",
  ],
  openGraph: {
    title: "LuxeLoft Studio",
    description: "Professional studio booking made simple",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
