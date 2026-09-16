import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-var",
  display: "swap",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-var",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-var",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KARTESIA — Media Pembelajaran SPLDV",
  description:
    "Platform belajar matematika diferensiasi (TaRL) model TAI & Tutor Sebaya — SPLDV Metode Eliminasi & Substitusi, Fase E Kelas X.",
  applicationName: "KARTESIA",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/kartesia-icon.svg",
    apple: "/kartesia-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KARTESIA",
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${grotesk.variable} ${plexMono.variable} bg-zinc-50 font-sans text-zinc-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
