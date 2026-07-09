import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart";
import { CartDrawer } from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const siteUrl = "https://www.pourproteinwater.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "POUR Protein Water | 10g Protein, Zero Sugar",
    template: "%s | POUR Protein Water"
  },
  description:
    "POUR is a refreshing protein water with 10g protein per 250 ml can, zero sugar, low calories, and real fruit flavour in Guava Chilli, Raw Mango, and Watermelon.",
  keywords: [
    "protein water",
    "POUR protein water",
    "zero sugar protein drink",
    "healthy protein drink",
    "low calorie protein drink",
    "guava chilli drink",
    "raw mango protein water",
    "watermelon protein water"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "POUR Protein Water",
    description: "10g protein. Zero sugar. Low calorie. Real fruit flavour.",
    url: siteUrl,
    siteName: "POUR Protein Water",
    images: [
      {
        url: "/images/guava-chilli-splash.png",
        width: 1024,
        height: 1536,
        alt: "POUR Guava Chilli protein water can with splash"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "POUR Protein Water",
    description: "10g protein per can, zero sugar, low calorie protein water.",
    images: ["/images/guava-chilli-splash.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SessionProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </SessionProvider>
        {/* ✅ Google AdSense – replace with your actual publisher ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
