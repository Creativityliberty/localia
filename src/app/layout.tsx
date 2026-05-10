import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Localia — Le mini-système client des commerces locaux",
    template: "%s · Localia",
  },
  description:
    "Mini-site + funnel + QR code + WhatsApp + Google Business + relance + fidélité, livré prêt à l'emploi pour les commerces locaux.",
  keywords: [
    "mini-site local",
    "site commerce local",
    "QR code commerce",
    "fidélité digitale",
    "WhatsApp business",
    "Google Business",
  ],
  authors: [{ name: "Localia" }],
  openGraph: {
    type: "website",
    title: "Localia",
    description: "Le mini-système client des commerces locaux.",
    siteName: "Localia",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Localia",
    description: "Le mini-système client des commerces locaux.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F7F2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning={true}
    >
      <body suppressHydrationWarning={true}>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-geist-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
