import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Scheherazade_New } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const scheherazade = Scheherazade_New({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adzora — Digital Signage Masjid",
  description: "Sistem informasi digital untuk masjid Indonesia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Adzora",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1f13",
};

/**
 * Root layout. Applies font CSS variables and base dark background.
 * Theme colors are applied dynamically via useThemeStore.applyCSSVariables().
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${scheherazade.variable}`}>
      <body>{children}</body>
    </html>
  );
}
